import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

/**
 * 查询公司信息
 * @param {Object} params - 查询参数
 * @param {String} params.tenantId - 组织ID
 */
export async function fetchCompany(params) {
  return request(`${SRM_PLATFORM}/v1/${params.tenantId}/companies`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 设置公司启用
 * @param {Object} params - 查询参数
 * @param {String} params.tenantId - 组织ID
 */
export async function enableCompany(params) {
  return request(`${HZERO_PLATFORM}/v1/${params.tenantId}/companies/enable`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 设置公司缺省币种
 * @param {Object} params - 查询参数
 * @param {String} params.tenantId - 组织ID
 */
export async function saveCurrency(params) {
  return request(`${SRM_PLATFORM}/v1/${tenantId}/companies/currency`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 设置公司禁用
 * @param {Object} params - 查询参数
 * @param {String} params.tenantId - 组织ID
 */
export async function disableCompany(params) {
  return request(`${HZERO_PLATFORM}/v1/${params.tenantId}/companies/disable`, {
    method: 'POST',
    body: params,
  });
}
