/**
 * @Description:
 * @date 2021-01-27 单据访问权限配置界面 - service
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';
import { parseParameters, getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 查询：/spfm/v1/{organizationId}/pub-ctl-permissions
export async function fetchPermissionList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_PLATFORM}/v1${isTenantRoleLevel() ? `/${organizationId}` : ``}/pub-ctl-permissions`,
    {
      method: 'GET',
      query,
    }
  );
}

// 保存：/spfm/v1/{organizationId}/pub-ctl-permissions/save，POST，LIST<DTO>
export async function savePermissions(payload) {
  return request(
    `${SRM_PLATFORM}/v1${isTenantRoleLevel() ? `/${organizationId}` : ``}/pub-ctl-permissions/save`,
    {
      method: 'POST',
      body: [payload],
    }
  );
}

// 启用/禁用：/spfm/v1/{organizationId}/pub-ctl-permissions/enable，POST，DTO
export async function enable(payload) {
  return request(
    `${SRM_PLATFORM}/v1${
      isTenantRoleLevel() ? `/${organizationId}` : ``
    }/pub-ctl-permissions/enable`,
    {
      method: 'POST',
      body: payload,
    }
  );
}
