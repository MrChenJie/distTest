const paths = require('hzero-webpack-scripts/config/paths');
const path = require('path');

module.exports = {
  // '@common': path.resolve(paths.appRootPath, 'packages', 'demo-front-common/lib'),
  // 'hzero-boot-customize-init-config': path.resolve(
  //   __dirname,
  //   '../../packages/demo-front-common/lib/config/customize'
  // ),
  '@/assets': path.resolve(paths.appRootPath, 'src/assets'),
  '@': path.resolve(paths.appPath, 'src'),

  components: 'hzero-front/lib/components/',
  layouts: 'hzero-front/lib/layouts/',
  utils: 'hzero-front/lib/utils/',
  services: 'hzero-front/lib/services/',
  _components: 'srm-front-boot/lib/components/',
  _utils: 'srm-front-boot/lib/utils/',
  _services: 'srm-front-boot/lib/services/',
};
