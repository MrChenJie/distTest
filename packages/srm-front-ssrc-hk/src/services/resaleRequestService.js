import cusRequest from '_cus_utils/request';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/resale-payment-requests/selectRequest`, {
    method: 'GET',
    query,
  });
}

export async function deleteList(params) {
  return cusRequest(`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/resale-payment-requests`, {
    method: 'DELETE',
    body: params,
  });
}
