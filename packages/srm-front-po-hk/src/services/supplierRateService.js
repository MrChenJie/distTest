import request from '_cus_utils/request';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 采购线条-过程服务评价
 * @param params
 * @returns {Promise<void>}
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`/hscm-erp/v1/${organizationId}/annual-supplier-rates/querySupplierRate`, {
    method: 'GET',
    query,
  });
}

export async function save(params) {
  return request(`/hscm-erp/v1/${organizationId}/annual-supplier-rates/batch-save-of-rate`, {
    method: 'POST',
    body: params,
  });
}

export async function controlPermission() {
  return request(`/hscm-erp/v1/${organizationId}/annual-supplier-rates/summary/control-permission`, {
    method: 'GET',
  });
}
