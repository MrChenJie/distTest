import request from '_cus_utils/request';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function queryList(payload) {
  const query = filterNullValueObject(parseParameters(payload));
  return request(`/spub/v1/${organizationId}/bpm-approve-headers/list-headers`, {
    method: 'GET',
    query,
  });
}

export async function queryLine(payload) {
  const query = filterNullValueObject(parseParameters(payload));
  return request(`/spub/v1/${organizationId}/bpm-approve-lines/list-detail`, {
    method: 'GET',
    query,
  });
}
export async function queryErrorList(payload) {
  const query = filterNullValueObject(parseParameters(payload));
  return request(`/spub/v1/${organizationId}/bpm-approve-errors/list-bpm-approve-errors`, {
    method: 'GET',
    query,
  });
}
