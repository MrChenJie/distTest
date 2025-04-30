/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-05-11 15:32:15
 * Copyright (c) 2024, All Rights Reserved. 
 */
module.exports =  {
  "packages": [
    {
      "name": "hzero-front-hcnf"
    },
    {
      "name": "hzero-front-hmsg"
    },
    {
      "name": "hzero-front-himp"
    },
    {
      "name": "hzero-front-hagd"
    },
    {
      "name": "hzero-front-hfile"
    },
    {
      "name": "hzero-front-hadm"
    },
    {
      "name": "hzero-front-hrpt"
    },
    {
      "name": "hzero-front-hsdr"
    },
    {
      "name": "hzero-front-hwfp"
    },
    {
      "name": "hzero-front-hdtt"
    },


    { "name": "hzero-front-hitf" },
    { "name": "hzero-front-hlod" },
    { "name": "hzero-front-hmde" },
    { "name": "hzero-front-hpfm" },
    { "name": "hzero-front-hiam" },

    { "name": "srm-front-ssrp-hk" },
    { "name": "srm-front-ssrc-hk" },
    { "name": "srm-front-spfm-hk" },
    { "name": "srm-front-sspo-hk" },
    { "name": "srm-front-po-hk" },
    { "name": "srm-front-trade" },
    { "name": "srm-front-dict" },
    { "name": "srm-front-mylink" },
    { "name": "srm-front-common" },
    // hzero-front-hcnf,hzero-front-hmsg,hzero-front-himp,hzero-front-hagd,hzero-front-hfile,hzero-front-hadm,hzero-front-hrpt,hzero-front-hsdr,hzero-front-hwfp,hzero-front-hdtt,hzero-front-hitf,hzero-front-hlod,hzero-front-hmde,hzero-front-hpfm,hzero-front-hiam,srm-front-hiam,srm-front-hips,srm-front-scec,srm-front-seci,srm-front-sfin,srm-front-sinv,srm-front-sitf,srm-front-smdm,srm-front-ssrc,srm-front-spcm,srm-front-sodr,srm-front-sslm,srm-front-spfm,srm-front-sprm,srm-front-sqam,srm-front-swfl
  ],
  "hzeroBoot": "hzero-boot/lib/pathInfo",
  // webpackConfig: (config, webpackConfigType) => { // webpack 配置修改
  //   console.log(webpackConfigType); // string webpack配置类型: 'dll' | 'base' | 'ms' ;
  //   config.externals = {
  //     ..config.externals,
  //     jQuery: 'window["jQuery"]',
  //     $: 'window["jQuery"]',
  //   }
  //   return config;
  // },
  // alias: {}, // webpack alias 配置, alias 的值可以是 string 表示指向配置文件
  // theme: {}, // less 变量配置, theme 的值可以是 string 表示指向配置文件
  // hzeroBoot: 'hzero-boot/lib/pathInfo', // hzero入口文件信息配置
  // dllConfig: { // dllConfig 配置
  //   common: {
  //     priority: 100,
  //     packages: ['react','react-dom','dva','dva/router','dva/saga','dva/fetch','hzero-ui','choerodon-ui','choerodon-ui/pro','core-js'],
  //   },
  //   vendorsGraph: {
  //     packages: ['echarts'],
  //   },
  //   vendors: {
  //     packages: ['lodash','lodash-decorators','react-intl-universal','axios','uuid','numeral','react-cropper','cropperjs',]
  //   }
  // },
  // splitChunks:{ /* ... */} // chunks 优化配置 参考: https://webpack.js.org/plugins/split-chunks-plugin/#optimizationsplitchunks
  'common': ['srm-front-common'],
};

