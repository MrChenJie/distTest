/**
 * supplierHKService.js - 供应商管理 service
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/20
 * @Copyright: Copyright (c), 2023, hand
 */
import cusRequest from '_cus_utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';
const CMHK_SUPPLIER = '/cmhk-supplier';
const organizationId = getCurrentOrganizationId();

/**
 * 查询供应商列表
 */
export async function queryPlatformSupplier(params) {
  const query = parseParameters(params);
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/search`, {
    method: 'GET',
    query,
  });
}

/**
 * 主数据导出
 */
export async function masterDataExport(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/search/masterDataExport`, {
    method: 'GET',
    query: payload,
    responseType: 'blob',
  });
}

/**
 * 预览供应商汇总信息
 */
export async function previewSupplierDetail(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/basic/collect/${payload.supplierId}`, {
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
 * 供应商模糊查重
 */
export async function supplierCheck(params) {
  const query = parseParameters(params);
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/selectSupplierCheckResult`, {
    method: 'GET',
    query
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
 * 查询供应商银行附件信息
 */
export async function previewSupplierAttachmentDetail(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/attachments/${payload.supplierId}`, {
    method: 'GET',
    query: {
      refType: payload.refType
    }
  })
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
 * 查询值集
 */
export async function queryNoticeType(params) {
  return cusRequest(`${HZERO_PLATFORM}/v1/lovs/value/tree`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询当前登录人的部门
 */
export async function queryUnit(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier-user/getUserUnit`, {
    method: 'GET',
    query: params
  })
}

/**
 * 财务转采购供应商准入保存
 */
export async function financeToPurchaseSave(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/financeToProcure/save`, {
    method: 'POST',
    body: payload.dto
  })
}

/**
 * 查询基本信息更新列表
 */
export async function queryUpdateInfo(params) {
  const query = parseParameters(params);
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/baseInfoUpdate/search`, {
    method: 'GET',
    query
  })
}

/**
 * 删除基本信息更新数据
 */
export async function delUpdateInfo(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/baseInfoUpdate/batchDelete`, {
    method: 'DELETE',
    body: payload
  })
}

/**
 * 新增供应商信息
 */
export async function newSupplierInfo(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/baseInfoUpdate/add/${payload.supplierId}`, {
    method: 'POST'
  })
}

/**
 * 查询供应商信息更新详情
 */
export async function updateInfoDetail(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/baseInfoUpdate/info/${payload.applyNumber}`, {
    method: 'POST'
  })
}

/**
 * 供应商信息保存
 */
export async function updateInfoSave(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/baseInfoUpdate/save`, {
    method: 'POST',
    body: payload
  })
}

/**
 * 供应商信息更新比对
 */
export async function compareData(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/baseInfoUpdate/compare/${payload.applyNumber}`, {
    method: 'GET',
  })
}

/**
 * 供应商财务信息更新列表
 */
export async function queryFinanceUpdateInfo(params) {
  const query = parseParameters(params);
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/financeInfoUpdate/search`, {
    method: 'GET',
    query
  })
}

/**
 * 删除财务基本信息更新数据
 */
export async function delFinanceUpdateInfo(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/financeInfoUpdate/batchDelete`, {
    method: 'DELETE',
    body: payload
  })
}

/**
 * 新增财务供应商信息
 */
export async function newFinanceSupplierInfo(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/financeInfoUpdate/add/${payload.supplierId}`, {
    method: 'POST'
  })
}

/**
 * 查询供应商信息更新详情
 */
export async function financeUpdateInfoDetail(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/financeInfoUpdate/info/${payload.applyNumber}`, {
    method: 'GET'
  })
}


/**
 * 查询黑名单列表
 */
export async function queryBlackList(params) {
  const query = parseParameters(params);
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/blackList/search`, {
    method: 'GET',
    query
  })
}

/**
 * 删除黑名单列表数据
 */
export async function delBlackListInfo(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/blackList/batchDelete`, {
    method: 'DELETE',
    body: payload
  })
}

/**
 * 查询黑名单详情
 */
export async function blackInfoDetail(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/blackList/info/${payload.applyNumber}`, {
    method: 'GET'
  })
}

/**
 * 新增黑名单
 */
export async function newBlack(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/blackList/add/${payload.supplierId}`, {
    method: 'POST'
  })
}

/**
 * 财务信息变更保存
 */
export async function financeUpdateInfoSave(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/financeInfoUpdate/save`, {
    method: 'POST',
    body: payload
  })
}

/**
 * 黑名单信息保存
 */
export async function blackListInfoSave(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/blackList/save`, {
    method: 'POST',
    body: payload
  })
}

/**
 * 商业登记证号码查重
 */
export async function checkRegistrationNumber(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/suppliers/basic/registrationNumber`, {
    method: 'GET',
    query: payload
  })
}

/**
 * 供应商名称查重
 */
export async function checkSupplierName(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/suppliers/basic/supplierName`, {
    method: 'GET',
    query: payload
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
 * 查询当前的caseId
 */
export async function getCaseId(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/beginDraft/${params.supplierId}`, {
    method: 'POST',
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
 * 删除银行地址信息
*/
export async function deleteAddressBankInfoLine(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/bank-head-delete`, {
    method: 'DELETE',
    body: params
  })
}

/**
 * 删除银行明细信息
*/
export async function deleteBankInfoLine(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/bank-line-delete`, {
    method: 'DELETE',
    body: params
  })
}

/**
 * 保存银行关联关系
*/
export async function saveBankInfoList(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/finance-bank-info/save`, {
    method: 'POST',
    body: params
  })
}

/**
 * 查询编辑供应商信息的银行地址信息
*/
export async function getEditAddressBankInfoList(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/edit-bank-head/${params.supplierId}`, {
    method: 'GET',
  })
}

/**
 * 查询编辑供应商信息的银行明细信息
*/
export async function getEditBankInfoList(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/edit-bank-line/${params.bankHeadId}`, {
    method: 'GET',
  })
}

/**
 * 删除编辑供应商信息的银行地址信息
*/
export async function deleteEditAddressBankInfoLine(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/edit-bank-head/delete`, {
    method: 'DELETE',
    body: params
  })
}

/**
 * 删除编辑供应商信息的银行明细信息
*/
export async function deleteEditBankInfoLine(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/edit-bank-line/delete`, {
    method: 'DELETE',
    body: params
  })
}

/**
 * 保存编辑供应商信息的银行关联关系
*/
export async function saveEditBankInfoList(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/finance-supplier-update/bank-info/save`, {
    method: 'POST',
    body: params
  })
}

/**
 * 供应商Id导出银行信息
*/
export async function bankInfoExport(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/bank-data-export/${params.supplierId}`, {
    method: 'GET',
    responseType: 'blob',
  })
}

/**
 * 变更Id导出银行信息
*/
export async function bankInfoEditExport(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/finance-bank-export/${params.supplierId}`, {
    method: 'GET',
    responseType: 'blob',
  })
}

/**
 * 信息比对导出
*/
export async function baseInfoExport(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/baseInfo-compare-export/${params.applyNumber}`, {
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