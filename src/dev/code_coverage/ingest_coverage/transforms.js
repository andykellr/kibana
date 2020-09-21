/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import * as Either from './either';
import * as Maybe from './maybe';
import { always, id, noop, pink } from './utils';
import execa from 'execa';
import { resolve } from 'path';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/pipeable';
import * as R from 'ramda';
import * as E from 'fp-ts/lib/Either';

const ROOT_DIR = resolve(__dirname, '../../../..');

const maybeTotal = (x) => (x === 'total' ? Either.left(x) : Either.right(x));

const trimLeftFrom = (text, x) => x.substr(x.indexOf(text));

export const statsAndstaticSiteUrl = (...xs) => {
  const [staticSiteUrl] = xs[0][1];
  const [stats] = xs[0];
  return {
    staticSiteUrl,
    ...stats,
  };
};

export const addJsonSummaryPath = (jsonSummaryPath) => (obj) => ({ jsonSummaryPath, ...obj });

export const truncate = (text) => (obj) => {
  const { staticSiteUrl } = obj;
  if (staticSiteUrl.includes(text)) obj.staticSiteUrl = trimLeftFrom(text, staticSiteUrl);
  return obj;
};

export const addTimeStamp = (ts) => (obj) => ({
  ...obj,
  '@timestamp': ts,
});

const setTotal = (x) => (obj) => (obj.isTotal = x);
const mutateTrue = setTotal(true);
const mutateFalse = setTotal(false);

const root = (urlBase) => (ts) => (testRunnerType) =>
  `${urlBase}/${ts}/${testRunnerType.toLowerCase()}-combined`;

const prokForTotalsIndex = (mutateTrue) => (urlRoot) => (obj) =>
  Either.right(obj)
    .map(mutateTrue)
    .map(always(`${urlRoot}/index.html`))
    .fold(noop, id);

const prokForCoverageIndex = (root) => (mutateFalse) => (urlRoot) => (obj) => (siteUrl) =>
  Either.right(siteUrl)
    .map((x) => {
      mutateFalse(obj);
      return x;
    })
    .map((x) => x.replace(root, ''))
    .map((x) => `${urlRoot}${x}.html`)
    .fold(noop, id);

export const staticSite = (urlBase) => (obj) => {
  const { staticSiteUrl, testRunnerType, COVERAGE_INGESTION_KIBANA_ROOT } = obj;
  const ts = obj['@timestamp'];
  const urlRoot = root(urlBase)(ts)(testRunnerType);
  const prokTotal = prokForTotalsIndex(mutateTrue)(urlRoot);
  const prokCoverage = prokForCoverageIndex(COVERAGE_INGESTION_KIBANA_ROOT)(mutateFalse)(urlRoot)(
    obj
  );
  const prokForBoth = always(maybeTotal(staticSiteUrl).fold(always(prokTotal(obj)), prokCoverage));

  return { ...obj, staticSiteUrl: prokForBoth() };
};

const leadingSlashRe = /^\//;
export const maybeDropLeadingSlash = (x) =>
  leadingSlashRe.test(x) ? Either.right(x) : Either.left(x);
export const dropLeadingSlash = (x) => x.replace(leadingSlashRe, '');
export const stripLeading = (x) => maybeDropLeadingSlash(x).fold(id, dropLeadingSlash);

export const coveredFilePath = (obj) => {
  const { staticSiteUrl, COVERAGE_INGESTION_KIBANA_ROOT } = obj;

  const withoutCoveredFilePath = always(obj);
  const dropRoot = (root) => (x) => stripLeading(x.replace(root, ''));
  return maybeTotal(staticSiteUrl)
    .map(dropRoot(COVERAGE_INGESTION_KIBANA_ROOT))
    .fold(withoutCoveredFilePath, (coveredFilePath) => ({ ...obj, coveredFilePath }));
};

const findTeam = (x) => x.match(/.+\s{1,3}(.+)$/, 'gm');
export const pluckIndex = (idx) => (xs) => xs[idx];
const pluckTeam = pluckIndex(1);

export const teamAssignment = (teamAssignmentsPath) => (log) => async (obj) => {
  const { coveredFilePath } = obj;
  const isTotal = Either.fromNullable(obj.isTotal);

  return isTotal.isRight() ? obj : await assignTeam(teamAssignmentsPath, coveredFilePath, log, obj);
};
export const last = (x) => {
  const xs = x.split('\n');
  const len = xs.length;

  return len === 1 ? xs[0] : xs[len - 1];
};
const logErr = (aPath) => (log) => (e) => {
  log.error(`\n!!! Unknown Team for path: \n${pink(aPath)}\n!!! Orig Err: \n${pink(e)}`);
  return e;
};
export async function assignTeam(teamAssignmentsPath, coveredFilePath, log, obj) {
  const params = [coveredFilePath, teamAssignmentsPath];
  const logGrepFail = logErr(coveredFilePath)(log);

  const xform = await pipe(
    TE.tryCatch(() => execa('grep', params, { cwd: ROOT_DIR }), pipe(logGrepFail, id)),
    TE.map(R.prop('stdout')),
    TE.map(last),
    TE.map(findTeam),
    TE.map(pluckTeam)
  )();

  return pipe(
    xform,
    E.fold(
      () => ({ team: 'unknown', ...obj }),
      (team) => ({ team, ...obj })
    )
  );
}

export const ciRunUrl = (obj) =>
  Either.fromNullable(process.env.CI_RUN_URL).fold(always(obj), (ciRunUrl) => ({
    ...obj,
    ciRunUrl,
  }));

const size = 50;
const truncateMsg = (msg) => {
  const res = msg.length > size ? `${msg.slice(0, 50)}...` : msg;
  return res;
};
const comparePrefix = () => 'https://github.com/elastic/kibana/compare';
export const prokPrevious = (comparePrefixF) => (currentSha) => {
  return Either.fromNullable(process.env.FETCHED_PREVIOUS).fold(
    noop,
    (previousSha) => `${comparePrefixF()}/${previousSha}...${currentSha}`
  );
};
export const itemizeVcs = (vcsInfo) => (obj) => {
  const [branch, sha, author, commitMsg] = vcsInfo;

  const vcs = {
    branch,
    sha,
    author,
    vcsUrl: `https://github.com/elastic/kibana/commit/${sha}`,
  };

  const mutateVcs = (x) => (vcs.commitMsg = truncateMsg(x));
  Maybe.fromNullable(commitMsg).map(mutateVcs);

  const vcsCompareUrl = process.env.FETCHED_PREVIOUS
    ? `${comparePrefix()}/${process.env.FETCHED_PREVIOUS}...${sha}`
    : 'PREVIOUS SHA NOT PROVIDED';

  const withPreviousR = () => ({
    ...obj,
    vcs: {
      ...vcs,
      vcsCompareUrl,
    },
  });
  return withPreviousR();
};
export const testRunner = (obj) => {
  const { jsonSummaryPath } = obj;

  let testRunnerType = 'other';

  const upperTestRunnerType = (x) => {
    if (jsonSummaryPath.includes(x)) {
      testRunnerType = x.toUpperCase();
      return;
    }
  };

  ['mocha', 'jest', 'functional'].forEach(upperTestRunnerType);

  return {
    testRunnerType,
    ...obj,
  };
};

export const buildId = (obj) => {
  const { env } = process;
  if (env.BUILD_ID) obj.BUILD_ID = env.BUILD_ID;

  return {
    ...obj,
  };
};
