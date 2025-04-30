const paths = require('hzero-webpack-scripts/config/paths');
const path = require('path');

module.exports = {
  // '@common': path.resolve(paths.appRootPath, 'packages', 'demo-front-common/lib'),
  // 'hzero-boot-customize-init-config': path.resolve(
  //   __dirname,
  //   '../../packages/demo-front-common/lib/config/customize'
  // ),
  'utils/menuTab': path.resolve(paths.appRootPath, 'src/utils/menuTab'),
  './menuTab': path.resolve(paths.appRootPath, 'src/utils/menuTab'),
  '../utils/menuTab': path.resolve(paths.appRootPath, 'src/utils/menuTab'),
  '../../utils/menuTab': path.resolve(paths.appRootPath, 'src/utils/menuTab'),
  '../../../utils/menuTab': path.resolve(paths.appRootPath, 'src/utils/menuTab'),
  '../../../../utils/menuTab': path.resolve(paths.appRootPath, 'src/utils/menuTab'),
  '../../../../../../utils/menuTab': path.resolve(paths.appRootPath, 'src/utils/menuTab'),
  'hzero-front/lib/utils/menuTab': path.resolve(paths.appRootPath, 'src/utils/menuTab'),
  '@/assets': path.resolve(paths.appRootPath, 'src/assets'),
  '@': path.resolve(paths.appPath, 'src'),

  components: 'hzero-front/lib/components/',
  layouts: 'hzero-front/lib/layouts/',
  utils: 'hzero-front/lib/utils/',
  services: 'hzero-front/lib/services/',
  _components: 'srm-front-boot/lib/components/',
  _utils: 'srm-front-boot/lib/utils/',
  _services: 'srm-front-boot/lib/services/',
  _cus_components: 'srm-front-common/lib/components/',
  _cus_utils: 'srm-front-common/lib/utils/',
};
