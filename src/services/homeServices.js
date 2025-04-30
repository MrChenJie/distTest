import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';

const organizationId = getCurrentOrganizationId();

/**
 * 全量查询
 *
 * @export
 * @returns
 */
export async function queryConfigAll() {
  return request(`/srm-portal/v1/${organizationId}/config-infos/selectAll`, {
    method: 'GET',
  });
}

/**
 * 根据条件查询配置信息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryConfigByOptions(params) {
  return request(`/srm-portal/v1/${organizationId}/config-infos/selectByOptions`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 删除配置信息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function deleteConfig(params) {
  return request(`/srm-portal/v1/${organizationId}/config-infos/deleteByConfigID`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存配置信息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function saveConfig(params) {
  return request(`/srm-portal/v1/${organizationId}/config-infos/insertOrUpdate`, {
    method: 'POST',
    body: params,
  });
}
