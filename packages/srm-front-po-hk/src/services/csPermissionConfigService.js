import request from 'utils/request';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function fetchData(params) {
  const query = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${organizationId}/spuc-permission-configs/list`, {
    method: 'GET',
    query,
  });
}

export async function save(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/spuc-permission-configs/save`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteLines(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/spuc-permission-configs/delete`, {
    method: 'DELETE',
    body: params,
  });
}

export async function units() {
  return request(`${SRM_SPUC}/v1/${organizationId}/spuc-permission-configs/units`, {
    method: 'GET',
  });
}
