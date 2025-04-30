import { getModuleRouters } from 'utils/utils';
// import * as hzeroFrontHagdRouters from 'hzero-front-hagd/lib/utils/router';
// import * as hzeroFrontHadmRouters from 'hzero-front-hadm/lib/utils/router';
// import * as hzeroFrontHcnfRouters from 'hzero-front-hcnf/lib/utils/router';
// import * as hzeroFrontHdttRouters from 'hzero-front-hdtt/lib/utils/router';
// import * as hzeroFrontHfileRouters from 'hzero-front-hfile/lib/utils/router';
// import * as hzeroFrontHiamRouters from 'hzero-front-hiam/lib/utils/router';
// import * as hzeroFrontHimpRouters from 'hzero-front-himp/lib/utils/router';
// import * as hzeroFrontHitfRouters from 'hzero-front-hitf/lib/utils/router';
// import * as hzeroFrontHmsgRouters from 'hzero-front-hmsg/lib/utils/router';
// import * as hzeroFrontHpfmRouters from 'hzero-front-hpfm/lib/utils/router';
// import * as hzeroFrontHptlRouters from 'hzero-front-hptl/lib/utils/router';
// import * as hzeroFrontHrptRouters from 'hzero-front-hrpt/lib/utils/router';
// import * as hzeroFrontHsdrRouters from 'hzero-front-hsdr/lib/utils/router';
// import * as hzeroFrontHsgpRouters from 'hzero-front-hsgp/lib/utils/router';
// import * as hzeroFrontHwfpRouters from 'hzero-front-hwfp/lib/utils/router';
// import * as hzeroFrontHmntRouters from 'hzero-front-hmnt/lib/utils/router';
// import * as srmFrontSeciRouters from 'srm-front-seci/lib/utils/router';
// import * as srmFrontSfinRouters from 'srm-front-sfin/lib/utils/router';
// import * as srmFrontSinvRouters from 'srm-front-sinv/lib/utils/router';
// import * as srmFrontSmdmRouters from 'srm-front-smdm/lib/utils/router';
// import * as srmFrontSodrRouters from 'srm-front-sodr/lib/utils/router';
// import * as srmFrontSpfmRouters from 'srm-front-spfm/lib/utils/router';
// import * as srmFrontSprmRouters from 'srm-front-sprm/lib/utils/router';
// import * as srmFrontSqamRouters from 'srm-front-sqam/lib/utils/router';
// import * as srmFrontSslmRouters from 'srm-front-sslm/lib/utils/router';
// import * as srmFrontSsrcRouters from 'srm-front-ssrc/lib/utils/router';
// import * as srmFrontSpcmRouters from 'srm-front-spcm/lib/utils/router';
// import * as srmFrontScecRouters from 'srm-front-scec/lib/utils/router';
// import * as srmFrontSitfRouters from 'srm-front-sitf/lib/utils/router';
// import * as srmFrontHiamRouters from 'srm-front-hiam/lib/utils/router'; // 覆盖子账户管理路由
// import * as srmFrontSwflRouters from 'srm-front-swfl/lib/utils/router';
// import * as srmFrontHipsRouters from 'srm-front-hips/lib/utils/router';
// import * as srmFrontSMallRouters from 'srm-front-small/lib/utils/router';
// import * as srmFrontCuxReignwoodRouters from 'srm-front-cux-reignwood/lib/utils/router';
// import * as srmFrontCuxQcygRouters from 'srm-front-cux-qcyg/lib/utils/router';
// import * as srmFrontCuxCIERouters from 'srm-front-cux-cie/lib/utils/router';
// import * as srmFrontCuxFcyfRouters from 'srm-front-cux-fcyf/lib/utils/router';
// import * as srmFrontCuxPorscheRouters from 'srm-front-cux-porsche/lib/utils/router';
// import * as srmFrontCuxXtepRouters from 'srm-front-cux-xtep/lib/utils/router';
// import * as srmFrontCuxGrwlRouters from 'srm-front-cux-grwl/lib/utils/router';
// import * as srmFrontCuxHyteraRouters from 'srm-front-cux-hytera/lib/utils/router';
// import * as srmFrontCuxHexingRouters from 'srm-front-cux-hexing/lib/utils/router';
// import * as srmFrontCuxAiyingshiRouters from 'srm-front-cux-aiyingshi/lib/utils/router';
// import * as srmFrontCuxMylikeRouters from 'srm-front-cux-mylike/lib/utils/router';
// import * as srmFrontCuxDfxwRouters from 'srm-front-cux-dfxw/lib/utils/router';
// import * as srmFrontCuxKinglalRouters from 'srm-front-cux-kinglal/lib/utils/router';
// import * as srmFrontCuxLsrtRouters from 'srm-front-cux-lsrt/lib/utils/router';
// import * as srmFrontCuxWuliangyeRouters from 'srm-front-cux-wuliangye/lib/utils/router';
// import * as srmFrontCuxOgawaRouters from 'srm-front-cux-ogawa/lib/utils/router';
// import * as srmFrontCuxBitaRouters from 'srm-front-cux-bita/lib/utils/router';
// import * as srmFrontCuxShinewayRouters from 'srm-front-cux-shineway/lib/utils/router';
// import * as srmFrontCuxBestterRouters from 'srm-front-cux-bestter/lib/utils/router';
// import * as srmFrontCuxJsgRouters from 'srm-front-cux-jsg/lib/utils/router';


export default app =>
  getModuleRouters(app, [
    // hzeroFrontHagdRouters,
    // hzeroFrontHadmRouters,
    // hzeroFrontHcnfRouters,
    // hzeroFrontHdttRouters,
    // hzeroFrontHfileRouters,
    // hzeroFrontHiamRouters,
    // hzeroFrontHimpRouters,
    // hzeroFrontHitfRouters,
    // hzeroFrontHmsgRouters,
    // hzeroFrontHpfmRouters,
    // hzeroFrontHptlRouters,
    // hzeroFrontHrptRouters,
    // hzeroFrontHsdrRouters,
    // hzeroFrontHsgpRouters,
    // hzeroFrontHwfpRouters,
    // hzeroFrontHmntRouters,
    // srmFrontSeciRouters,
    // srmFrontSfinRouters,
    // srmFrontSinvRouters,
    // srmFrontSmdmRouters,
    // srmFrontSodrRouters,
    // srmFrontSpfmRouters,
    // srmFrontSprmRouters,
    // srmFrontSqamRouters,
    // srmFrontSslmRouters,
    // srmFrontSsrcRouters,
    // srmFrontSpcmRouters,
    // srmFrontSitfRouters,
    // srmFrontScecRouters,
    // srmFrontHiamRouters,
    // srmFrontSwflRouters,
    // srmFrontHipsRouters,
    // srmFrontSMallRouters,
    // srmFrontCuxReignwoodRouters,
    // srmFrontCuxQcygRouters,
    // srmFrontCuxCIERouters,
    // srmFrontCuxFcyfRouters,
    // srmFrontCuxPorscheRouters,
    // srmFrontCuxXtepRouters,
    // srmFrontCuxGrwlRouters,
    // srmFrontCuxHyteraRouters,
    // srmFrontCuxHexingRouters,
    // srmFrontCuxAiyingshiRouters,
    // srmFrontCuxMylikeRouters,
    // srmFrontCuxDfxwRouters,
    // srmFrontCuxKinglalRouters,
    // srmFrontCuxLsrtRouters,
    // srmFrontCuxWuliangyeRouters,
    // srmFrontCuxOgawaRouters,
    // srmFrontCuxBitaRouters,
    // srmFrontCuxShinewayRouters,
    // srmFrontCuxBestterRouters,
    // srmFrontCuxJsgRouters,
  ]);
