import { getConvertRouter } from 'hzero-boot/lib/utils/getConvertRouter';
import { setSession } from 'utils/utils';
import getModuleRouters from './getModuleRouters';
import routers from '../config/routers';
import '../customize/customizeLayout';

require('../global.less');

setSession('infoCheckFlag', true);
const convertRouter = (app) =>
  getConvertRouter({
    hzeroRoutes: routers,
    options: { app },
  });

export function getRouterData(app) {
  return {
    ...getModuleRouters(app),
    ...convertRouter(app)(),
  };
}
