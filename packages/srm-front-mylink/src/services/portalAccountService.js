/*
 * portalAccountService - 供应商门户配置Service
 * @date: 2023-09-07
 * @author: FHS <huasheng.fang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import {
  getCurrentOrganizationId,
  filterNullValueObject,
  parseParameters,
  isTenantRoleLevel,
} from 'utils/utils';
import request from '_cus_utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { HZERO_IAM } from 'utils/config';

const organizationId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel();
const prompt = `${SRM_PLATFORM}/v1/${organizationId}`;

// 供应商门户账户记录创建或更新
// /v1/{organizationId}/company-account-recs
export async function save(params) {
  return request(`${prompt}/company-account-recs`, {
    method: 'POST',
    body: params,
  });
}

//供应商账号生成
export async function generateAccount(params) {
  return request(`${prompt}/company-account-recs/batch-generator-account`, {
    method: 'POST',
    body: params,
  });
}

// 门户账号报表导出
export async function supplierExport() {
  return request(`/hrpt/v1/${organizationId}/supplier-portal-export/supplier-portal-acc-export`, {
    method: 'POST',
    responseType: 'blob',
  });
}

// 供应商门户账户记录列表
// get /v1/{organizationId}/company-account-recs
export async function fetchList(payload) {
  const queryParam = filterNullValueObject(payload.queryParam);
  const pageParam = filterNullValueObject(parseParameters(payload.pageParam));
  return request(`${prompt}/company-account-recs`, {
    method: 'GET',
    query: { ...pageParam, ...queryParam },
  });
}

// 批量删除
// DELETE /v1/{organizationId}/company-account-recs
export async function deleteLines(params) {
  return request(`${prompt}/company-account-recs`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询角色可分配权限的菜单子树
 * @async
 * @function fetchPermissionTree
 * @param roleId
 * @param tenantId
 * @returns {object} fetch Promise
 */
export async function fetchPermissionTree(roleId, tenantId) {
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${tenantId}/roles/${roleId}/permission-set-tree`
      : `${HZERO_IAM}/hzero/v1/roles/${roleId}/permission-set-tree`
  );
}

/**
 * 批量分配权限集至角色
 * @async
 * @function batchAssignPermissionSets
 * @returns {object} fetch Promise
 * @param payload
 */
export async function batchAssignPermissionSets(payload) {
  const { roleId, tenantId, data } = payload;

  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${tenantId}/roles/${roleId}/permission-sets/assign`
      : `${HZERO_IAM}/hzero/v1/roles/${roleId}/permission-sets/assign`,
    {
      method: 'PUT',
      body: data,
    }
  );
}

/**
 * 批量取消分配权限集至角色
 * @async
 * @function batchAssignPermissionSets
 * @returns {object} fetch Promise
 * @param payload
 */
export async function batchUnAssignPermissionSets(payload) {
  const { roleId, tenantId, data } = payload;
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${tenantId}/roles/${roleId}/permission-sets/recycle`
      : `${HZERO_IAM}/hzero/v1/roles/${roleId}/permission-sets/recycle`,
    {
      method: 'PUT',
      body: data,
    }
  );
}

/**
 * 查询用户信息
 * @param payload
 * @returns {Promise<void>}
 */
export async function fetchUserData(payload) {
  const { userId, tenantId } = payload;
  return request(
    `${HZERO_IAM}/hzero/v1/portal/${tenantId}/users/${userId}/selectPortalUserDetail`,
    {
      method: 'GET',
    }
  );
}

/**
 * 更新用户信息
 * @param params
 */
export async function updateUserData(params) {
  return request(`${HZERO_IAM}/hzero/v1/portal/${organizationId}/updatePortalUser`, {
    method: 'PUT',
    body: params,
  });
}
