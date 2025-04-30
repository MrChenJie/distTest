import cusRequest from '_cus_utils/request';
import { filterNullValueObject, getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `/cmhk-purchase-requisition/v1/${organizationId}`;

// 转售采购列表查询接口
export async function queryPurchaseInquiryList(params) {
  return cusRequest(`${prefix}/ict-pr-detail-heads`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(params)),
  });
}

// 导出接口
export async function exportPurchaseInquiryList(params) {
  return cusRequest(`${prefix}/ict-pr-detail-heads`, {
    method: 'POST',
    body: params.form,
    responseType: 'blob',
  });
}

// ICT采购结果编辑
export async function editPurchaseResultApplication(params) {
  return cusRequest(`${prefix}/ict-pr-detail-heads/detail`, {
    method: 'GET',
    query: filterNullValueObject(params)
  })
}

// ICT采购结果删除
export async function deletePurchaseResultApplication(params) {
  return cusRequest(`${prefix}/ict-pr-detail-heads/del`, {
    method: 'GET',
    query: params
  })
}

// 币种
export async function currencyPurchaseResultApplication(params) {
  return cusRequest(`${prefix}/exChangeRate/api/getExChangeRate`, {
    method: 'GET',
    query: params
  })
}
