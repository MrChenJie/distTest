import { getUdcAppInfo } from "./application";
import { getUdcPageInParams, getUdcPageInfo, getUdcPageRuntimeVariable, getUdcPageSignature, getUdcPageVariables, setUdcPageRuntimeVariable, setUdcPageVariables } from "./page";
import { getUdcComponentInfo, getUdcComponentSignature, getUdcComponentValue, getUdcComponentViewState, getUdcDataContainerComponentInfo, getUdcParentComponentInfo, setUdcComponentValue, setUdcComponentViewState, getComponentValueFromUiModelNode, setComponentValueFromUiModelNode, getUdcSubComponentViewState, setUdcSubComponentViewState } from "./component";
import { getUdcDatasouceMetaInfo, queryUdcDatasourceDetail, queryUdcDatasourceList, queryUdcDatasourceListSummary, saveUdcDatasourceData, saveUdcDatasourceListData, deleteAndSaveUdcDatasourceData, createUdcDatasourceData, createUdcDatasourceDataFromSelectRows, deleteUdcDatasourceData, getUdcDatasourceData } from "./datasource";
import { execParseUdcExpression, callUdcPresetFunc, callUdcPresetEventAction, i18n, getUdcComponent, getUdcProfile, getApiUrlByUdcAppInfo, transformCtpEnumCode } from "./utils";
import { getUdcSdkForIframe } from "./iframe";
export * from "./application";
export * from "./page";
export * from "./component";
export * from "./datasource";
export * from "./utils";
export * from "./iframe";
var tenant = null;
var baseInfo = {
  tenant: tenant
};
/**
 * http://doc.seeyona9.com/pages/viewpage.action?pageId=47260742
 */
export var UDC_OPEN_SDK = {
  // app
  getUdcAppInfo: getUdcAppInfo,
  // page
  getUdcPageInParams: getUdcPageInParams,
  getUdcPageInfo: getUdcPageInfo,
  getUdcPageRuntimeVariable: getUdcPageRuntimeVariable,
  getUdcPageSignature: getUdcPageSignature,
  getUdcPageVariables: getUdcPageVariables,
  setUdcPageRuntimeVariable: setUdcPageRuntimeVariable,
  setUdcPageVariables: setUdcPageVariables,
  // component
  getUdcComponentInfo: getUdcComponentInfo,
  getUdcComponentSignature: getUdcComponentSignature,
  getUdcComponentValue: getUdcComponentValue,
  getUdcComponentViewState: getUdcComponentViewState,
  setUdcComponentValue: setUdcComponentValue,
  setUdcComponentViewState: setUdcComponentViewState,
  getUdcParentComponentInfo: getUdcParentComponentInfo,
  getUdcDataContainerComponentInfo: getUdcDataContainerComponentInfo,
  getComponentValueFromUiModelNode: getComponentValueFromUiModelNode,
  setComponentValueFromUiModelNode: setComponentValueFromUiModelNode,
  getUdcSubComponentViewState: getUdcSubComponentViewState,
  setUdcSubComponentViewState: setUdcSubComponentViewState,
  // datasource
  getUdcDatasouceMetaInfo: getUdcDatasouceMetaInfo,
  queryUdcDatasourceDetail: queryUdcDatasourceDetail,
  queryUdcDatasourceList: queryUdcDatasourceList,
  queryUdcDatasourceListSummary: queryUdcDatasourceListSummary,
  saveUdcDatasourceData: saveUdcDatasourceData,
  saveUdcDatasourceListData: saveUdcDatasourceListData,
  deleteAndSaveUdcDatasourceData: deleteAndSaveUdcDatasourceData,
  createUdcDatasourceData: createUdcDatasourceData,
  createUdcDatasourceDataFromSelectRows: createUdcDatasourceDataFromSelectRows,
  deleteUdcDatasourceData: deleteUdcDatasourceData,
  getUdcDatasourceData: getUdcDatasourceData,
  // other
  execParseUdcExpression: execParseUdcExpression,
  callUdcPresetFunc: callUdcPresetFunc,
  callUdcPresetEventAction: callUdcPresetEventAction,
  i18n: i18n,
  getUdcComponent: getUdcComponent,
  getUdcProfile: getUdcProfile,
  getApiUrlByUdcAppInfo: getApiUrlByUdcAppInfo,
  transformCtpEnumCode: transformCtpEnumCode,
  // iframe
  getUdcSdkForIframe: getUdcSdkForIframe,
  baseInfo: baseInfo
};
export var currentSDK = UDC_OPEN_SDK;