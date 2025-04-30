import { UDC_OPEN_SDK } from "./impl";
if (!window.__UDC_OPEN_SDK__) {
  window.__UDC_OPEN_SDK__ = {
    default: UDC_OPEN_SDK
  };
}
/** 注册 UDC 运行时 SDK
 * @example
 * ```
 * import { setUdcSdk } from '@seeyon/udc-sdk';
 *
 * setUdcSdk('2.7', {
 *   getUdcAppInfo: () => {},
 *   // ...
 * });
 * ```
 */
export var registerUdcSdk = function registerUdcSdk(version, sdk) {
  window.__UDC_OPEN_SDK__[version] = sdk;
};
export var getUdcSdk = function getUdcSdk(version) {
  // TODO: semver match?
  var sdk = window.__UDC_OPEN_SDK__["default"];
  ;
  if (version in window.__UDC_OPEN_SDK__) {
    sdk = window.__UDC_OPEN_SDK__[version];
  }
  return sdk;
};
/**设置SDK信息 */
export var setSdkBaseInfo = function setSdkBaseInfo(version, baseInfo) {
  var sdk = getUdcSdk(version);
  sdk.baseInfo = baseInfo;
};
export var ready = function ready(config, callback) {
  var mode = config.mode,
    version = config.version;
  if (mode !== 'iframe') {
    console.error('SDK当前仅支持iframe模式');
    return;
  }
  setSdkBaseInfo(version, {
    tenant: config.tenant
  });
  var UdcSdkForIframe = UDC_OPEN_SDK.getUdcSdkForIframe();
  UdcSdkForIframe.ready(callback);
};