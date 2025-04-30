/**
 * evaluationListService.js - 供应商评审 service
 * @Author: qi.xue01@hand-china.com
 * @Date: 2024/1/3
 * @Copyright: Copyright (c), 2024, hand
 */
import cusRequest from '_cus_utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
const CMHK_SUPPLIER = '/cmhk-supplier';
const organizationId = getCurrentOrganizationId();

/**
 * 查询供应商评审列表
 */
export async function queryEvaluationList(params) {
  const query = parseParameters(params);
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier-review/list/search`, {
    method: 'GET',
    query
  })
}

/**
 * 删除供应商评审数据
 */
export async function delEvaluationListInfo(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier-review/list/batchDelete`, {
    method: 'DELETE',
    body: payload
  })
}


/**
 * 查询供应商评审汇总列表
 */
export async function queryEvaluationCollectList(params) {
  const query = parseParameters(params);
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier-review/gatherList/search`, {
    method: 'GET',
    query
  })
}

/**
 * 根据供应商id查询评审详情
 */
export async function queryEvaluationDetailBySupplierId(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier-review/info/${params.id}`, {
    method: 'GET',
  })
}

/**
 * 预览供应商汇总信息
 */
export async function getSupplierDetail(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/basic/collect/${params.supplierId}`, {
    method: 'GET',
  })
}

/**
 * 采购订单信息查询
 */
export async function getPurchaseOrderData(params) {
  const query = parseParameters(params);
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier-review/info/manual/search`, {
    method: 'GET',
    query
  })
}

/**
 * 根据供应商评审汇总id查询详情
 */
export async function getCollectDetailById(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier-review/gatherInfo/${params.id}`, {
    method: 'GET'
  })
}

/**
 * 供应商评审详情保存
 */
export async function evaluationSave(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier-review/info/save`, {
    method: 'POST',
    body: params
  })
}

/**
 * 查询流程信息
 */
export async function getNodeInfo(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/getActivityInfo`, {
    method: 'GET',
    query: payload
  })
}

/**
 * 评审结果数据导出
 */
export async function resultDataExport(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier-review/gatherResultExport`, {
    method: 'GET',
    query: payload,
    responseType: 'blob',
  });
}
