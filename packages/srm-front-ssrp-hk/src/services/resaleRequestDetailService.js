/*
 * @Description: 转售采购成品付款申请 - service
 * @LastEditors: 何智鹏 <he.zhipeng@hand-china.com>
 * @Date: 2023-07-11 11:26:09
 * @Copyright: Copyright (c) 2022, Hand
 */
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { SRM_SPUC, SRM_SPCM, SRM_PLATFORM } from '_utils/config';
import { SRM_SPCM_RISK } from '@/common/config';
import { getResponse } from '_cus_utils/utils';

const organizationId = getCurrentOrganizationId();
const SPUC = `${SRM_SPUC}/v1/${organizationId}`;
const SPCM = `${SRM_SPCM}/v1/${organizationId}`;
const SPFM = `/spfm/v1/${organizationId}`;
const HPFM = `/hpfm/v1/${organizationId}`;
const PLATFORM = `${SRM_PLATFORM}/v1/${organizationId}`;
const SPCM_RISK = `${SRM_SPCM_RISK}/v1/${organizationId}`;

/**
 * 查询 - 获取服务名
 */
export function getService(str) {
  if (str === 'SPUC') {
    return SPUC;
  }
}

/**
 * 查询 - 当前用户信息
 */
export async function getEmployeeName(param) {
  return request(`${HPFM}/employees/employee-num`, {
    method: 'GET',
    query: param,
  }).then((res) => getResponse(res));
}

/**
 * 查询 - 默认公司
 */
export async function getCompanyName(param) {
  return request(`${SPUC}/cost-payment-requests/getDefaultCompanyCode`, {
    method: 'GET',
    query: param,
  }).then((res) => getResponse(res));
}

/**
 * 查询 - 默认汇率
 */
export async function getExchangeRate(param) {
  return request(`${SPUC}/po-headerss/exchangeRateQuery`, {
    method: 'GET',
    query: param,
  }).then((res) => getResponse(res));
}

/**
 * 查询 - 单据进度条
 */
export async function getPaymentProgress(param) {
  return request(`${SPCM}/payment-progresss/queryPaymentProgressStatus`, {
    method: 'GET',
    query: param,
  }).then((res) => getResponse(res));
}

/**
 * 查询 - 单据进度条明细
 */
export async function getPaymentProgressDetail(param) {
  return request(`${SPCM}/payment-progresss/queryPayProgressNodeDetail`, {
    method: 'GET',
    query: param,
  }).then((res) => getResponse(res));
}

/**
 * 查询 - 单据头数据
 */
export async function getheaderInfo(id) {
  return request(`${SPUC}/resale-payment-requests/${id}`, {
    method: 'GET',
  }).then((res) => getResponse(res));
}

/**
 * 查询 - 发票行数据
 */
export async function getBillLine(param) {
  return request(`${SPUC}/resale-detail-lines`, {
    method: 'GET',
    query: param,
  }).then((res) => getResponse(res));
}

/**
 * 查询 - 查询审批记录
 */
export async function getGeneralRequestResult(param) {
  return request(`${PLATFORM}/approval-requests/detail/targetHeaderAll`, {
    method: 'POST',
    body: param,
  }).then((res) => getResponse(res));
}

/**
 * 查询 - 银行数据
 */
export async function getBankData(id) {
  return request(`${SPUC}/payment-bank-infos/queryBankInfo/${id}`, {
    method: 'GET',
  }).then((res) => getResponse(res));
}

/**
 * 查询 - 银行数据
 */
export async function getPayWriteOffData(param) {
  return request(`${SPUC}/resale-prepayment-write-offs/payAndWriteOffInfo`, {
    method: 'GET',
    query: param,
  }).then((res) => getResponse(res));
}

/**
 * 查询 - 风险提示数据
 */
export async function getOtherRiskTips(param) {
  return request(`${SPCM_RISK}/srsp-risk-sanpshot/riskstatus`, {
    method: 'POST',
    body: param,
  }).then((res) => getResponse(res));
}

/**
 * 查询 - 更新风险校验
 */
export async function updateRiskTips(param) {
  return request(`${SPCM_RISK}//srsp-risk-sanpshot/updateSnapshot`, {
    method: 'POST',
    body: param,
  }).then((res) => getResponse(res));
}

/**
 * 查询 - 编辑权限
 */
export async function getPermission(param) {
  return request(`${SPFM}/pub-ctl-permissions/edit`, {
    method: 'POST',
    body: param,
  }).then((res) => getResponse(res));
}

/**
 * 查询 - 按钮权限
 */
export async function getButtonPermission() {
  return request(`${SPCM}/cost-attach-files/payment-advice/button-permission`, {
    method: 'GET',
  }).then((res) => getResponse(res));
}

/**
 * 查询 - 获取用户信息
 */
export async function getUserInfo(userId) {
  return request(`${HPFM}/employee-users/employee`, {
    method: 'GET',
    query: {
      enabledFlag: 1,
      userId,
    },
  }).then((res) => getResponse(res));
}

/**
 * 操作 - 批量下载附件
 */
export async function batchDownLoadFiles(id) {
  return request(`${SPCM}/cost-payment/queryPaymentAttach/${id}/resale`, {
    method: 'GET',
  }).then((res) => getResponse(res));
}

/**
 * 操作 - 下载PDF
 */
export async function downLoadPdf(id) {
  return request(`${SPUC}/resale-payment-requests/export-pdf/${id}`, {
    method: 'GET',
    responseType: 'blob',
  }).then((res) => getResponse(res));
}

/**
 * 操作 - 撤回
 */
export async function detailWithdraw(id) {
  return request(`${SPUC}/receive-payment/revoke-reject/${id}`, {
    method: 'GET',
  }).then((res) => getResponse(res));
}

/**
 * 查询 - 退回供应商
 */
export async function returnToSupplier(param) {
  const { costRequestId, rejectReason } = param;
  return request(`${SPUC}/receive-payment/reject/${costRequestId}`, {
    method: 'GET',
    query: { rejectReason },
  }).then((res) => getResponse(res));
}

/**
 * 操作 - 补充材料
 */
export async function submitMaterial(id) {
  return request(`${SPUC}/payment-request-common-apis/checkRepeatInvoice/${id}`, {
    method: 'POST',
  }).then((res) => getResponse(res));
}

/**
 * 操作 - 银行退回
 */
export async function checkAllowReturnBank(id) {
  return request(`${SPUC}/payment-request-common-apis/checkAllowReturnBank/${id}`, {
    method: 'POST',
  }).then((res) => getResponse(res));
}

/**
 * 查询 - 申请人变更查询编辑权限
 */
export async function queryEmployeeFlag(param, costRequestId) {
  return request(`${SPUC}/resale-payment-requests/getEditPayOwner/${costRequestId}`, {
    method: 'GET',
    query: param,
  }).then((res) => res);
}

/**
 * 操作 - 删除银行信息
 */
export async function deleteBank(bankInfoId) {
  return request(`${SPUC}/payment-bank-infos/${bankInfoId}`, {
    method: 'DELETE',
  }).then((res) => getResponse(res));
}

/**
 * 操作 - 消息提醒校验
 */
export async function paymentApprovalRemindValidate(param) {
  return request(`${SPCM}/payment-approval-remind/validate`, {
    method: 'GET',
    query: param,
  }).then((res) => getResponse(res));
}

/**
 * 操作 - 保存
 */
export async function actionSave(param) {
  return request(`${SPUC}/resale-payment-requests/addRequest`, {
    method: 'POST',
    body: param,
  }).then((res) => getResponse(res));
}

/**
 * 操作 - 导入
 */
export async function actionImport(param, id) {
  return request(`${SPUC}/resale-payment-requests/import/${id}`, {
    method: 'POST',
    body: param,
  }).then((res) => getResponse(res));
}

/**
 * 查询 - 补充附件
 */
export async function querySupplyAttachment(param) {
  return request(`${SPCM}/cost-attach-files/payment-advice`, {
    method: 'GET',
    query: param,
  }).then((res) => getResponse(res));
}

/**
 * 保存 - 补充附件
 */
export async function saveSupplyAttachment(param, id) {
  return request(`${SPCM}/cost-attach-files/payment-advice/${id}`, {
    method: 'POST',
    body: param,
  }).then((res) => getResponse(res));
}

/**
 * 删除 - 补充附件
 */
export async function deleteSupplyAttachment(param) {
  return request(`${SPCM}/cost-attach-files/payment-advice`, {
    method: 'DELETE',
    body: param,
  }).then((res) => getResponse(res));
}
