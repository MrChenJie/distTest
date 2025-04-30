import { getConvertRouter } from 'hzero-boot/lib/utils/getConvertRouter';
import routers from '../config/routers';
import '../../../../src/customize/customizeLayout';
import { initCleanCacheListener } from '../../../../src/utils/cleanCache';

require('../../../../src/global.less');

const convertRouter = (app) =>
  getConvertRouter({
    hzeroRoutes: routers,
    options: { app },
  });
export function getRouterData(app) {
  return convertRouter(app)();
}

initCleanCacheListener('/spcm');
