/**
 * 调用预置规则函数
 * @abstract
 *
 * 维护者: 余梦圆
 */
export var callUdcPresetFunc = function callUdcPresetFunc(runtimeContext, id, params) {
  throw Error("execPresetFunctor ONLY work under UDC app");
};
/**
 * 调用预置事件动作
 * @deprecated
 *
 * 维护者: 余梦圆
 */
export var callUdcPresetEventAction = function callUdcPresetEventAction(runtimeContext, action) {
  throw Error("callUdcPresetEventAction ONLY work under UDC app");
};
/**
 * 解析表达式
 * 推荐使用 GetUdcProfile 获取设置相关数据，已经内置表达式解析能力
 *
 * 维护者: 余梦圆
 */
export var execParseUdcExpression = function execParseUdcExpression(runtimeContext, expression) {
  throw Error("parseUdcExpression ONLY work under UDC app");
};
/**
 * 获取应用、页面等相关 profile
 *
 * 维护者: 钟明亮
 */
export var getUdcProfile = function getUdcProfile(runtimeContext, type, raw) {
  throw Error("getUdcProfile ONLY work under UDC app");
};
/**
 * 获取已经注册到 window 里面的组件
 * 基础组件请使用 GetUdcComponent 获取
 *
 * 维护者: 钟明亮
 */
export var getUdcComponent = function getUdcComponent(runtimeContext, name) {
  throw Error("getUdcComponent ONLY work under UDC app");
};
/**
 * 国际化，兼容旧 schema 数据
 *
 * 维护者: 钟明亮
 */
export var i18n = function i18n(query, defaultValue) {
  throw Error("i18n ONLY work under UDC app");
};
/**
 * 获取组件数据容器行信息，根据传入的 runtimeContext 匹配行
 *
 * 维护者: 王宇
 */
export var getUdcRowInfo = function getUdcRowInfo(runtimeContext, row) {
  throw Error("getUdcRowInfo ONLY work under UDC app");
};
/**
 * 获取应用接口对应 url 地址
 *
 * 维护者: 王宇
 */
export var getApiUrlByUdcAppInfo = function getApiUrlByUdcAppInfo(appInfo, hostAppRequest) {
  throw Error("getApiUrlByAppInfo ONLY work under UDC app");
};
/**
 * 枚举值转换
 *
 * 维护者: 余梦圆
 */
export var transformCtpEnumCode = function transformCtpEnumCode(runtimeContext, code) {
  throw Error("getApiUrlByAppInfo ONLY work under UDC app");
};