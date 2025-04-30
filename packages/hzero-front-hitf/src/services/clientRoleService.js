import request from 'utils/request';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  isTenantRoleLevel,
  parseParameters,
} from 'utils/utils';
import { HZERO_HITF } from 'utils/config';

const organizationId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel();

/**
 * 分页汇总查询客户端授权列表
 * @async
 * @function queryList
 * @param {!number} organizationId - 组织ID
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function queryClientRolesAuthList(roleId, params = {}) {
  const query = filterNullValueObject(parseParameters(params));
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/client-roles/${roleId}`
      : `${HZERO_HITF}/v1/client-roles/${roleId}`,
    {
      query,
    }
  );
}

/**
 * 角色批量授权接口
 * @async
 * @function save
 * @param {object} data - 请求参数
 */
export async function save(roleId, data) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/client-roles/${roleId}`
      : `${HZERO_HITF}/v1/client-roles/${roleId}`,
    {
      method: 'POST',
      body: data,
    }
  );
}

/**
 * 权限回收
 * @async
 * @function recycle
 * @param {object} data - 请求参数
 */
export async function recycle(roleId, data) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/client-roles/${roleId}/recycle`
      : `${HZERO_HITF}/v1/client-roles/${roleId}/recycle`,
    {
      method: 'POST',
      body: data,
    }
  );
}

/**
 * 查询弹窗数据
 * @async
 * @function recycle
 * @param {obejct} params - 请求参数
 */
export async function queryInterfaceData(params = {}) {
  const { roleId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/client-roles/${roleId}/authorizable`
      : `${HZERO_HITF}/v1/client-roles/${roleId}/authorizable`,
    {
      query: parseParameters(params),
    }
  );
}
