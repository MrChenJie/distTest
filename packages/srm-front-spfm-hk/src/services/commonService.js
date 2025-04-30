import request from 'utils/request';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function permissions(params) {
  return request(`/spfm/v1/${organizationId}/pub-ctl-permissions/edit`, {
    method: 'POST',
    body: params,
  });
}

// 查询配置维护权限
// GET /v1/{organizationId}/po-liness/queryProfilePermission
export async function queryProfilePermission() {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-liness/queryProfilePermission`, {
    method: 'GET',
    query: {
      profileName: 'SPFM.SUPPLIER_PO_BUTTON',
    },
  });
}
