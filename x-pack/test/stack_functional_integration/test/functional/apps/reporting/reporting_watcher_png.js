import expect from '@kbn/expect';
import { Client } from '@elastic/elasticsearch';
import moment from 'moment';

export default ({ getService, getPageObjects }) => {

  describe('watcher app', () => {
    const config = getService('config');
    const servers = config.get('servers');
    const retry = getService('retry');
    const log = getService('log');
    const { KIBANAIP, VERSION_NUMBER, VM, VERSION_BUILD_HASH, STARTEDBY } = getService('provisionedEnv');
    const PageObjects = getPageObjects(['common']);

    describe('PNG Reporting watch', () => {
      let id = 'watcher_report-';
      id = id + dash(moment().calendar());  // For debugging.
      const watch = { id };
      const reportingUrl = servers.kibana.protocol + '://'
        + KIBANAIP + ':' + servers.kibana.port
        + '/api/reporting/generate/png?jobParams=(browserTimezone:America%2FChicago,layout:(dimensions:(height:2024,width:3006.400146484375),id:png),objectType:dashboard,relativeUrl:%27%2Fapp%2Fkibana%23%2Fdashboard%2F722b74f0-b882-11e8-a6d9-e546fe2bba5f%3F_g%3D(refreshInterval:(pause:!!f,value:900000),time:(from:now-7d,to:now))%26_a%3D(description:!%27Analyze%2Bmock%2BeCommerce%2Borders%2Band%2Brevenue!%27,filters:!!(),fullScreenMode:!!f,options:(hidePanelTitles:!!f,useMargins:!!t),panels:!!((embeddableConfig:(vis:(colors:(!%27Men!!!%27s%2BAccessories!%27:%252382B5D8,!%27Men!!!%27s%2BClothing!%27:%2523F9BA8F,!%27Men!!!%27s%2BShoes!%27:%2523F29191,!%27Women!!!%27s%2BAccessories!%27:%2523F4D598,!%27Women!!!%27s%2BClothing!%27:%252370DBED,!%27Women!!!%27s%2BShoes!%27:%2523B7DBAB))),gridData:(h:10,i:!%271!%27,w:36,x:12,y:18),id:!%2737cc8650-b882-11e8-a6d9-e546fe2bba5f!%27,panelIndex:!%271!%27,type:visualization,version:!%277.0.0-alpha1!%27),(embeddableConfig:(vis:(colors:(FEMALE:%25236ED0E0,MALE:%2523447EBC),legendOpen:!!f)),gridData:(h:11,i:!%272!%27,w:12,x:12,y:7),id:ed8436b0-b88b-11e8-a6d9-e546fe2bba5f,panelIndex:!%272!%27,type:visualization,version:!%277.0.0-alpha1!%27),(embeddableConfig:(),gridData:(h:7,i:!%273!%27,w:18,x:0,y:0),id:!%2709ffee60-b88c-11e8-a6d9-e546fe2bba5f!%27,panelIndex:!%273!%27,type:visualization,version:!%277.0.0-alpha1!%27),(embeddableConfig:(),gridData:(h:7,i:!%274!%27,w:30,x:18,y:0),id:!%271c389590-b88d-11e8-a6d9-e546fe2bba5f!%27,panelIndex:!%274!%27,type:visualization,version:!%277.0.0-alpha1!%27),(embeddableConfig:(),gridData:(h:11,i:!%275!%27,w:48,x:0,y:28),id:!%2745e07720-b890-11e8-a6d9-e546fe2bba5f!%27,panelIndex:!%275!%27,type:visualization,version:!%277.0.0-alpha1!%27),(embeddableConfig:(),gridData:(h:10,i:!%276!%27,w:12,x:0,y:18),id:!%2710f1a240-b891-11e8-a6d9-e546fe2bba5f!%27,panelIndex:!%276!%27,type:visualization,version:!%277.0.0-alpha1!%27),(embeddableConfig:(),gridData:(h:11,i:!%277!%27,w:12,x:0,y:7),id:b80e6540-b891-11e8-a6d9-e546fe2bba5f,panelIndex:!%277!%27,type:visualization,version:!%277.0.0-alpha1!%27),(embeddableConfig:(vis:(colors:(!%270%2B-%2B50!%27:%2523E24D42,!%2750%2B-%2B75!%27:%2523EAB839,!%2775%2B-%2B100!%27:%25237EB26D),defaultColors:(!%270%2B-%2B50!%27:!%27rgb(165,0,38)!%27,!%2750%2B-%2B75!%27:!%27rgb(255,255,190)!%27,!%2775%2B-%2B100!%27:!%27rgb(0,104,55)!%27),legendOpen:!!f)),gridData:(h:11,i:!%278!%27,w:12,x:24,y:7),id:!%274b3ec120-b892-11e8-a6d9-e546fe2bba5f!%27,panelIndex:!%278!%27,type:visualization,version:!%277.0.0-alpha1!%27),(embeddableConfig:(vis:(colors:(!%270%2B-%2B2!%27:%2523E24D42,!%272%2B-%2B3!%27:%2523F2C96D,!%273%2B-%2B4!%27:%25239AC48A),defaultColors:(!%270%2B-%2B2!%27:!%27rgb(165,0,38)!%27,!%272%2B-%2B3!%27:!%27rgb(255,255,190)!%27,!%273%2B-%2B4!%27:!%27rgb(0,104,55)!%27),legendOpen:!!f)),gridData:(h:11,i:!%279!%27,w:12,x:36,y:7),id:!%279ca7aa90-b892-11e8-a6d9-e546fe2bba5f!%27,panelIndex:!%279!%27,type:visualization,version:!%277.0.0-alpha1!%27),(embeddableConfig:(),gridData:(h:18,i:!%2710!%27,w:48,x:0,y:54),id:!%273ba638e0-b894-11e8-a6d9-e546fe2bba5f!%27,panelIndex:!%2710!%27,type:search,version:!%277.0.0-alpha1!%27),(embeddableConfig:(isLayerTOCOpen:!!f,mapCenter:(lat:45.88578,lon:-15.07605,zoom:2.11),openTOCDetails:!!()),gridData:(h:15,i:!%2711!%27,w:24,x:0,y:39),id:!%272c9c1f60-1909-11e9-919b-ffe5949a18d2!%27,panelIndex:!%2711!%27,type:map,version:!%277.0.0-alpha1!%27),(embeddableConfig:(),gridData:(h:15,i:!%2712!%27,w:24,x:24,y:39),id:b72dd430-bb4d-11e8-9c84-77068524bcab,panelIndex:!%2712!%27,type:visualization,version:!%277.0.0-alpha1!%27)),query:(language:kuery,query:!%27!%27),timeRestore:!!t,title:!%27%255BeCommerce%255D%2BRevenue%2BDashboard!%27,viewMode:view)%27,title:%27%5BeCommerce%5D%20Revenue%20Dashboard%27)';
      const emails = [
        'wayne.seymour@elastic.co',
        // 'lee.drengenberg@elastic.co',
        // 'rashmi.kulkarni@elastic.co',
        // 'bhavya@elastic.co',
        'watchertest123@gmail.com'];
      const interval = 10;
      const body = {
        'trigger': {
          'schedule': {
            'interval': `${interval}s`,
          },
        },
        'actions': {
          'email_admin': {
            'email': {
              'to': emails,
              'subject': 'PNG ' + VERSION_NUMBER + ' ' + id + ', VM=' + VM
                + ' ' + VERSION_BUILD_HASH + ' by:' + STARTEDBY,
              'attachments': {
                'test_report.png': {
                  'reporting': {
                    'url': reportingUrl,
                    'auth': {
                      'basic': {
                        'username': servers.elasticsearch.username,
                        'password': servers.elasticsearch.password,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };
      let esClient;
      let putWatchResponse;

      before(async () => {
        esClient = new Client({
          node: buildUrl(servers.elasticsearch).toString(),
        });
      });

      it('should successfully add a new watch for png Reporting', async () => {
        putWatchResponse = await esClient.watcher.putWatch({ ...watch, body });
        log.debug(`# putWatchResponse \n${pretty(putWatchResponse)}`);
        expect(putWatchResponse.body._id).to.eql(id);
        expect(putWatchResponse.statusCode).to.eql('201');
        expect(putWatchResponse.body._version).to.eql('1');
      });

      it('should be successful and increment version', async () => {
        await PageObjects.common.sleep(20000);
        await retry.tryForTime(90000, async () => {
          await PageObjects.common.sleep(15000);

          // *** Prolly gonna drop the following commented out code soon!
          // History search
          // const watcherHistoryResponse = await esClient.watcher.getWatch(watchId);
          // Print history search result
          // log.debug(`\nwatcherHistoryResponse=\n${pretty(watcherHistoryResponse)}\n`);

          const getWatchResponse = await esClient.watcher.getWatch(watch);
          expect(getWatchResponse.body._id).to.eql(id);
          expect(getWatchResponse.body._version).to.be.above(1);
          log.debug(`\n getWatchResponse.body._version: ${getWatchResponse.body._version}`);
          expect(getWatchResponse.body.status.execution_state).to.eql('executed');
          expect(getWatchResponse.body.status.actions.email_admin.last_execution.successful).to.eql(true);

        return  getWatchResponse;
        }, async function onFailure(obj) {
          log.debug(`\n### tryForTime-Failure--VERSION: \n\t${pretty(obj.body._version)}`);
        });
      });

      it('should delete watch and update revision', async () => {
        const deleteResponse = await esClient.watcher.deleteWatch(watch);
        log.debug('\nDelete Response=' + pretty(deleteResponse) + '\n');
        expect(deleteResponse.body._id).to.eql(id);
        expect(deleteResponse.body.found).to.eql(true);
        expect(deleteResponse.statusCode).to.eql('200');
      });
    });
  });
}

const buildUrl = ({ protocol, auth, hostname, port }) =>
  new URL(`${protocol}://${auth}@${hostname}:${port}`);

const pretty = x =>
  JSON.stringify(x, null, 2);

const dash = x => x.replace(/\s/gm, '-');
