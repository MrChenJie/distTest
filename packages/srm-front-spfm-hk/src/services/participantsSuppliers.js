/*
 * participantsSuppliers - 参与方供应商
 * @date: 2020-08-12
 * @author: CQX <qingxin.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import cusRequest from '_cus_utils/request';
import { SRM_PLATFORM, SRM_SSLM, SRM_SPUC } from '_utils/config';
import { HZERO_RPT } from 'utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';

const organizationId = getCurrentOrganizationId();

export async function fetchParticipantsList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PLATFORM}/v1/companies/basic/listCompanySupplier`, {
    method: 'GET',
    query,
  });
}

export async function fetchCompanySupplierList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`${SRM_PLATFORM}/v1/portal-company/listCompanySupplier`, {
    method: 'GET',
    query,
  });
}

// 渠道商参与方供应商整合查询
// GET /v1/portal-company/listChannelCompanySupplier
export async function fetchListChannelCompanySupplier(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PLATFORM}/v1/portal-company/listChannelCompanySupplier`, {
    method: 'GET',
    query,
  });
}

// 查询采购线条的详情数据
// GET /v1/purchase-headers/detailPurchaseInfo/{companyId}
export async function queryPurchaseLinesDetail(params) {
  const { companyId } = params;
  return request(`${SRM_PLATFORM}/v1/purchase-headers/detailPurchaseInfo/${companyId}`, {
    method: 'GET',
  });
}

// 查询企业线条的详情数据
// GET /v1/enterprise-headers/detailPurchaseInfo/{companyId}
export async function queryEnterpriseLinesDetail(params) {
  const { companyId } = params;
  return request(`${SRM_PLATFORM}/v1/enterprise-headers/detailEnterpriseInfo/${companyId}`, {
    method: 'GET',
  });
}

// 查询采购产品的详情数据
// GET /v1/product-headers/detailProductInfo/{companyId}
export async function queryProductLinesDetail(params) {
  const { companyId } = params;
  return request(`${SRM_PLATFORM}/v1/product-headers/detailProductInfo/${companyId}`, {
    method: 'GET',
  });
}
// 查询简易支出的详情数据
// GET /v1/product-headers/detailSmallExpendInfo/{companyId}
export async function querySimpleLineDetail(params) {
  const { companyId } = params;
  return request(`${SRM_PLATFORM}/v1/small-expend-headers/detailSmallExpendInfo/${companyId}`, {
    method: 'GET',
  });
}
// 查询移动部的详情数据
// GET /v1/product-headers/detailMobileInfo/{companyId}
export async function queryMobileLineDetail(params) {
  const { companyId } = params;
  return request(`${SRM_PLATFORM}/v1/mobile-headers/detailMobileInfo/${companyId}`, {
    method: 'GET',
  });
}
// 查询运营商的详情数据
// GET /v1/product-headers/detailProductInfo/{companyId}
export async function queryOperatorLineDetail(params) {
  const { companyId } = params;
  return request(`${SRM_PLATFORM}/v1/operator-headers/detailOperatorInfo/${companyId}`, {
    method: 'GET',
  });
}

// 查询供应商准入渠道商线条头行信息
// GET /v1/{organizationId}/channel-headers/detailChannelInfo/{companyId}
export async function queryChannelLineDetail(params) {
  const { companyId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/channel-headers/detailChannelInfo/${companyId}`, {
    method: 'GET',
  });
}

// 创建或者保存采购线条的详情数据
// POST /v1/purchase-headers/save/{companyId}
export async function savePurchaseLinesDetail(params) {
  const { companyId, purchaseSaveDTO } = params;
  return request(`${SRM_PLATFORM}/v1/purchase-headers/save/${companyId}`, {
    method: 'POST',
    body: purchaseSaveDTO,
  });
}

// 删除采购线条
export async function deletePurchaseLine(params) {
  const { purchaseHeaderId } = params;
  return request(`${SRM_PLATFORM}/v1/purchase-headers/delete/${purchaseHeaderId}`, {
    method: 'DELETE',
  });
}

// 删除企业线条
export async function deleteEnterpriseLine(params) {
  const { enterpriseHeaderId } = params;
  return request(`${SRM_PLATFORM}/v1/enterprise-headers/delete/${enterpriseHeaderId}`, {
    method: 'DELETE',
  });
}

// 删除产品线条
export async function deleteProductLine(params) {
  const { productHeaderId } = params;
  return request(`${SRM_PLATFORM}/v1/product-headers/delete/${productHeaderId}`, {
    method: 'DELETE',
  });
}

// 删除渠道商线条
// DELETE /v1/{organizationId}/channel-headers/delete/{channelHeaderId}
export async function deleteChannelLine(params) {
  const { channelHeaderId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/channel-headers/delete/${channelHeaderId}`, {
    method: 'DELETE',
  });
}

// 创建或者保存企业线条的详情数据
// POST /v1/enterprise-headers/save/{companyId}
export async function saveEnterpriseLinesDetail(params) {
  const { companyId, enterpriseSaveDTO } = params;
  return request(`${SRM_PLATFORM}/v1/enterprise-headers/save/${companyId}`, {
    method: 'POST',
    body: enterpriseSaveDTO,
  });
}

// 创建或者保存简易支出线条的详情数据
export async function saveProductLinesDetail(params) {
  const { companyId, purchaseSaveDTO } = params;
  return request(`${SRM_PLATFORM}/v1/product-headers/save/${companyId}`, {
    method: 'POST',
    body: purchaseSaveDTO,
  });
}

// 创建或者保存简易支出线条的详情数据
// POST /v1/product-headers/save/{companyId}
export async function saveSimpleLinesDetail(params) {
  const { companyId, purchaseSaveDTO } = params;
  return request(`${SRM_PLATFORM}/v1/small-expend-headers/save/${companyId}`, {
    method: 'POST',
    body: purchaseSaveDTO,
  });
}

// 创建或者保存移动部线条的详情数据
// POST /v1/product-headers/save/{companyId}
export async function saveMobileLinesDetail(params) {
  const { companyId, purchaseSaveDTO } = params;
  return request(`${SRM_PLATFORM}/v1/mobile-headers/save/${companyId}`, {
    method: 'POST',
    body: purchaseSaveDTO,
  });
}

// 创建或者保存运营部线条的详情数据
// POST /v1/product-headers/save/{companyId}
export async function saveOperatorLinesDetail(params) {
  const { companyId, purchaseSaveDTO } = params;
  return request(`${SRM_PLATFORM}/v1/operator-headers/save/${companyId}`, {
    method: 'POST',
    body: purchaseSaveDTO,
  });
}

// 创建修改供应商准入渠道商线条头行信息
// POST /v1/{organizationId}/channel-headers/save/{companyId}
export async function saveChannelLinesDetail(params) {
  const { companyId, channelSaveDTO } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/channel-headers/save/${companyId}`, {
    method: 'POST',
    body: channelSaveDTO,
  });
}

// 无校验保存创建渠道商线条信息
// POST /spfm/v1/{organizationId}/channel-headers/presave/{companyId}
export async function presaveChannelLinesDetail(params) {
  const { companyId, channelSaveDTO } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/channel-headers/presave/${companyId}`, {
    method: 'POST',
    body: channelSaveDTO,
  });
}

// 保存各种收入数据
// PUT /v1/purchase-revenue-lines
export async function saveRevenueData(params) {
  return request(`${SRM_PLATFORM}/v1/purchase-revenue-lines`, {
    method: 'PUT',
    body: params,
  });
}
// 获取各种收入数据
// GET /v1/purchase-revenue-lines
export async function queryRevenueData(params) {
  return request(`${SRM_PLATFORM}/v1/purchase-revenue-lines/none-page`, {
    method: 'GET',
    query: params,
  });
}
// 删除各种收入数据
// GET /v1/purchase-revenue-lines
export async function deleteRevenueData(params) {
  return request(`${SRM_PLATFORM}/v1/purchase-revenue-lines`, {
    method: 'DELETE',
    body: params,
  });
}

// 保存授权数据
// GET /v1/purchase-auth-lines
export async function saveAuthData(params) {
  return request(`${SRM_PLATFORM}/v1/purchase-auth-lines`, {
    method: 'PUT',
    body: params,
  });
}

// 获取授权数据
// GET /v1/purchase-auth-lines
export async function queryAuthData(params) {
  return request(`${SRM_PLATFORM}/v1/purchase-auth-lines/none-page`, {
    method: 'GET',
    query: params,
  });
}

// 删除授权数据
// GET /v1/purchase-auth-lines
export async function deleteAuthData(params) {
  return request(`${SRM_PLATFORM}/v1/purchase-auth-lines`, {
    method: 'DELETE',
    body: params,
  });
}

// 保存证书数据
// GET /v1/purchase-cert-lines
export async function saveCertData(params) {
  return request(`${SRM_PLATFORM}/v1/purchase-cert-lines`, {
    method: 'PUT',
    body: params,
  });
}

// 获取证书数据
// GET /v1/purchase-cert-lines
export async function queryCertData(params) {
  return request(`${SRM_PLATFORM}/v1/purchase-cert-lines/none-page`, {
    method: 'GET',
    query: params,
  });
}

// 删除证书数据
// GET /v1/purchase-cert-lines
export async function deleteCertData(params) {
  return request(`${SRM_PLATFORM}/v1/purchase-cert-lines`, {
    method: 'DELETE',
    body: params,
  });
}

// 提交企业认证数据
// GET /v1/purchase-cert-lines
export async function submitApproval(params) {
  const { companyId, businessType } = params;
  return request(`${SRM_PLATFORM}/v1/companies/${companyId}/part`, {
    method: 'PATCH',
    query: {
      businessType,
    },
  });
}

// 保存企业线条职工行
export async function saveCompanyState(params) {
  return request(`${SRM_PLATFORM}/v1/enterprise-staff-lines`, {
    method: 'PUT',
    body: params,
  });
}
// 获取企业线条职工行数据
export async function queryCompanyState(params) {
  return request(`${SRM_PLATFORM}/v1/enterprise-staff-lines/none-page`, {
    method: 'GET',
    query: params,
  });
}

// 删除企业线条职工行数据
export async function deleteStaffData(params) {
  return request(`${SRM_PLATFORM}/v1/enterprise-staff-lines`, {
    method: 'DELETE',
    body: params,
  });
}

// 保存企业线条工程数据
export async function saveEngineeringData(params) {
  return request(`${SRM_PLATFORM}/v1/enterprise-pro-lines`, {
    method: 'PUT',
    body: params,
  });
}

// 获取企业线条工程数据
export async function queryEngineeringData(params) {
  return request(`${SRM_PLATFORM}/v1/enterprise-pro-lines/none-page`, {
    method: 'GET',
    query: params,
  });
}

// 删除企业线条工程数据
export async function deleteEngineeringData(params) {
  return request(`${SRM_PLATFORM}/v1/enterprise-pro-lines`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询审批历史
 *  /spfm/v1/463/approval-req-recs/list/targetHeader
 */
export async function getApprovalList(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/approval-req-recs/list/targetHeader`, {
    method: 'POST',
    body: params,
  });
}

export async function getDeleteFlag(payload) {
  return cusRequest(`${SRM_PLATFORM}/v1/companies/basic/getDeleteFlag`, {
    method: 'GET',
    query: payload,
  });
}

export async function deleteCompanySupplier(payload) {
  return cusRequest(`${SRM_PLATFORM}/v1/companies/basic/deleteCompanySupplier`, {
    method: 'GET',
    query: payload,
  });
}

export async function getInviteViewFlag(params) {
  return request(`${SRM_PLATFORM}/v1/portal-company/getInviteViewFlag`, {
    method: 'GET',
    query: params,
  });
}

export async function inviteRegister(params) {
  return cusRequest(`/srm-portal/v1/${organizationId}/invite-register-infos/inviteRegister`, {
    method: 'POST',
    body: params,
  });
}

export async function inviteCooperation(params) {
  return cusRequest(`/srm-portal/v1/${organizationId}/invite-cooperate-infos/inviteCooperate`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 单次合作转合格
 */
export async function onceToComplete(payload) {
  return request(`${SRM_PLATFORM}/v1/enterprise-headers/onceToComplete/${payload.companyId}`, {
    method: 'POST',
  });
}

// 查询退回撤回按钮权限
export async function getButtonPermission(params) {
  return request(
    `${SRM_PLATFORM}/v1/isp/${organizationId}/companies/basic/return-button-permission/${params.companyId}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

// 退回供应商
export async function returnToSupplier(params) {
  return request(`${SRM_PLATFORM}/v1/isp/${organizationId}/companies/basic/return-or-withdraw`, {
    method: 'POST',
    body: params,
  });
}

// 获取线条邀约数据
export async function fetchInviteData(params) {
  return request(`/srm-portal/v1/${organizationId}/invite-cooperate-infos/selectByOptions`, {
    method: 'POST',
    body: params,
  });
}
// 查询标签内容全部数据
export async function queryLabelContent() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/labels/queryAll`, {
    method: 'GET',
  });
}

export async function fetchInviteStatus(params) {
  return request(
    `/srm-portal/v1/${organizationId}/invite-cooperate-infos/getInviteCooperateStatus`,
    {
      method: 'POST',
      body: params,
      responseType: 'text',
    }
  );
}

/**
 * 保存采购线条
 * @param params
 * @returns {Promise<void>}
 */
export async function savePurchaseFirmChange(params) {
  const { companyId, purchaseSaveDTO } = params;
  return request(`${SRM_PLATFORM}/v1/purchase-headers/save/firmChange/${companyId}`, {
    method: 'POST',
    body: purchaseSaveDTO,
  });
}

/**
 * 保存企业线条
 * @param params
 * @returns {Promise<void>}
 */
export async function saveEnterpriseFirmChange(params) {
  const { companyId, enterpriseSaveDTO } = params;
  return request(`${SRM_PLATFORM}/v1/enterprise-headers/save/firmChange/${companyId}`, {
    method: 'POST',
    body: enterpriseSaveDTO,
  });
}

/**
 * 保存产品线条
 * @param params
 * @returns {Promise<void>}
 */
export async function saveProductFirmChange(params) {
  const { companyId, purchaseSaveDTO } = params;
  return request(`${SRM_PLATFORM}/v1/product-headers/save/firmChange/${companyId}`, {
    method: 'POST',
    body: purchaseSaveDTO,
  });
}

/**
 * 保存简易支出线条
 * @param params
 * @returns {Promise<void>}
 */
 export async function saveSimpleLinesChange(params) {
  const { companyId, purchaseSaveDTO } = params;
  return request(`${SRM_PLATFORM}/v1/small-expend-headers/save/firmChange/${companyId}`, {
    method: 'POST',
    body: purchaseSaveDTO,
  });
}

/**
 * 保存移动部线条
 * @param params
 * @returns {Promise<void>}
 */
 export async function saveMobileFirmChange(params) {
  const { companyId, purchaseSaveDTO } = params;
  return request(`${SRM_PLATFORM}/v1/mobile-headers/save/firmChange/${companyId}`, {
    method: 'POST',
    body: purchaseSaveDTO,
  });
}

/**
 * 保存运营部线条
 * @param params
 * @returns {Promise<void>}
 */
 export async function saveOperatorFirmChange(params) {
  const { companyId, purchaseSaveDTO } = params;
  return request(`${SRM_PLATFORM}/v1/operator-headers/save/firmChange/${companyId}`, {
    method: 'POST',
    body: purchaseSaveDTO,
  });
}

/**
 * 保存渠道商线条
 * @description POST /v1/{organizationId}/channel-headers/save/firmChange/{companyId}
 * @param params
 * @returns {Promise<void>}
 */
export async function saveChannelFirmChange(params) {
  const { companyId, channelSaveDTO } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/channel-headers/save/firmChange/${companyId}`, {
    method: 'POST',
    body: channelSaveDTO,
  });
}

/**
 * 生成变更审批流
 * @param params
 * @returns {Promise<void>}
 */
export async function createApproval(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/enterprise-change/part/createApproval`, {
    method: 'POST',
    body: params,
  });
}

export async function addCorporateBusiness(params) {
  return request(`${SRM_PLATFORM}/v1/enterprise-headers/insert/corporateBusiness`, {
    method: 'POST',
    body: params,
  });
}

// 删除供应商准入渠道商线条佣金行信息
// DELETE /v1/{organizationId}/ch-commission-lines/delete
export async function deleteChCommissionLines(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ch-commission-lines/delete`, {
    method: 'DELETE',
    body: params,
  });
}

// 参与方失效功能-禁用
// POST /v1/companies/basic/disable
export async function basicDisable(params) {
  return request(`${SRM_PLATFORM}/v1/companies/basic/disable`, {
    method: 'POST',
    body: params,
  });
}

// 参与方失效功能-启用
// POST /v1/companies/basic/disable
export async function basicEnable(params) {
  return request(`${SRM_PLATFORM}/v1/companies/basic/enable`, {
    method: 'POST',
    body: params,
  });
}

// 参与方失效功能-启用/禁用按钮展示
// GET /v1/companies/basic/status-btn/show-flag
export async function showFlag() {
  return request(`${SRM_PLATFORM}/v1/companies/basic/status-btn/show-flag`, {
    method: 'GET',
  });
}

// 参与方供应商整合查询-发送飞书
// GET /v1/portal-company-export/listCompanySupplier/sendFeishu
export async function sendFeishu() {
  return request(`${HZERO_RPT}/v1/portal-company-export/listCompanySupplier/sendFeishu`, {
    method: 'GET',
  });
}

// 查询审核中线条
// GET /v1/{organizationId}/approval-requests/query-under-approval
export async function queryUnderApproval(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/approval-requests/query-under-approval`, {
    method: 'GET',
    query: params,
  });
}

// 根据参与方查询采购订单行表列表
// GET v1/{organizationId}/po-liness/queryPoLinesByCompanyNum
export async function queryPoLinesByCompanyNum(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-liness/queryPoLinesByCompanyNum`, {
    method: 'GET',
    query,
  });
}
