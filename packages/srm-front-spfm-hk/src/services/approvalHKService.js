/**
 * approvalService.js - 审批状态待办
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/10/19
 * @Copyright: Copyright (c), 2023, hand
 */
import cusRequest from '_cus_utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
const CMHK_SUPPLIER = '/cmhk-supplier';
const organizationId = getCurrentOrganizationId();
import { HZERO_PLATFORM } from 'utils/config';

/**
 * 查询单据详情
 * @param payload
 * @returns {Promise<*>}
 */
export async function queryApprovalInfo(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/basic/collect/${payload.supplierId}`, {
    method: 'GET',
  })
}

/**
 * 查询公司附件
 */
export async function queryCompanyFile(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/attachments/${payload.supplierId}?refType=${payload.refType}`, {
    method: 'GET',
  })
}

/**
 * 查询值集
 */
export async function queryNoticeType(params) {
  return cusRequest(`${HZERO_PLATFORM}/v1/lovs/value/tree`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询供应商a2p信息
 */
export async function previewSupplierA2pDetail(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/finance/A2P/${payload.supplierId}`, {
    method: 'GET',
  })
}

/**
 * 查询供应商银行信息
 */
export async function previewSupplierBankDetail(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/bank-accounts/${payload.supplierId}`, {
    method: 'GET',
  })
}

/**
 * 供应商准入-基本信息、联系人、客户信息保存
 */
export async function supplierInfoDataSave(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/save`, {
    method: 'POST',
    body: payload.dto
  })
}

/**
 * 查询银行地址信息
*/
export async function getAddressBankInfoList(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/bank-head/${params.supplierId}`, {
    method: 'GET',
  })
}

/**
 * 查询银行明细信息
*/
export async function getBankInfoList(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/bank-line/${params.bankHeadId}`, {
    method: 'GET',
  })
}

/**
 * 导出银行信息
*/
export async function bankInfoExport(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/bank-data-export/${params.supplierId}`, {
    method: 'GET',
    responseType: 'blob',
  })
}

/**
 * 查询编码规则
*/
export async function getLeaveCode(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/code-rule/generate`, {
    method: 'GET',
    query: params
  })
}
