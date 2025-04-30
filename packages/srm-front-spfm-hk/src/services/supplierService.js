/**
 * supplierService.js - 我的合作伙伴查询供应商 service
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询平台供应商列表
 * @param {Object} params - 查询参数
 */
export async function queryPlatformSupplier(params) {
  const query = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${params.tenantId}/partners/suppliers`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询 ERP 供应商列表
 * @param {Object} params - 查询参数
 */
export async function queryErpSupplier(params) {
  const query = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${params.tenantId}/external-suppliers`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询 ERP 供应商详情
 * @param {Object} params - 查询参数
 * @param {!number} params.tenantId - 租户ID
 * @param {!number} params.supplierId - 供应商ID
 * @param {!String} [type='address|bank|contacts|sites'] - 查询信息类型 'address': 地址 ; 'bank': 银行账户 'contacts': 联系人 ; 'sites': 目录
 */
export async function queryErpSupplierDetail(params, type) {
  const urlMap = {
    address: `${SRM_SSLM}/v1/${params.tenantId}/ext-supplier-address/${params.supplierId}`,
    bank: `${SRM_SSLM}/v1/${params.tenantId}/ext-sup-bank-accts/${params.supplierId}`,
    contacts: `${SRM_SSLM}/v1/${params.tenantId}/ext-supplier-contacts/${params.supplierId}`,
    sites: `${SRM_SSLM}/v1/${params.tenantId}/ext-supplier-sites/${params.supplierId}`,
  };
  const requestUrl = urlMap[type];

  return request(requestUrl, {
    method: 'GET',
    // query: params,
  });
}

/**
 * 启用供应商
 * @param {Object} params 修改参数
 */
export async function enablePartner(params) {
  const { tenantId, partnerId } = params;
  return request(`${SRM_PLATFORM}/v1/${tenantId}/partners/${partnerId}/enable`, {
    method: 'POST',
  });
}

/**
 * 禁用供应商
 * @param {Object} params 修改参数
 */
export async function disablePartner(params) {
  const { tenantId, partnerId } = params;
  return request(`${SRM_PLATFORM}/v1/${tenantId}/partners/${partnerId}/disable`, {
    method: 'POST',
  });
}

/**
 * 关联 ERP 供应商
 * @param {Object} params 修改参数
 */
export async function linkErpSupplier(params) {
  return request(`${SRM_SSLM}/v1/${params.tenantId}/external-suppliers/erps/link`, {
    method: 'POST',
    body: params.list,
  });
}

/**
 * 取消关联 ERP 供应商
 * @param {Object} params 修改参数
 */
export async function unlinkErpSupplier(params) {
  return request(`${SRM_SSLM}/v1/${params.tenantId}/external-suppliers/erps/unlink`, {
    method: 'POST',
    body: params.list,
  });
}

/**
 * 查询分组
 * @param {Object} params 修改参数
 */
export async function queryGroup(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor-group`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存分组
 * @param {Object} params 修改参数
 */
export async function saveGroup(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 斯瑞德风险扫描内嵌页
 * @param {Object} params 修改参数
 */
export async function riskEmbedPage(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/query-monitor-enterprise`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 是否加入监控
 * @param {Object} params 修改参数
 */
export async function enableAddMonitor(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor-function/getSetting`, {
    method: 'GET',
    query: params,
  });
}

// /**
//  * 是否风险扫描
//  * @param {Object} params 修改参数
//  */
// export async function enableRiskScan(params) {
//   return request(`${SRM_SSLM}/v1/${organizationId}/risk-scan/getSetting`, {
//     method: 'GET',
//     query: params,
//   });
// }
