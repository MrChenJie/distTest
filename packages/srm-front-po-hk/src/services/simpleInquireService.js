/*
 * simpleInquireService - 简易询价Service
 * @date: 2023-11-5
 * @author: huasheng.fang <huasheng.fang@hand-china.com>
*/

import request from '_cus_utils/request';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const HSCM_ERP = '/hscm-erp';
const prefix = `${HSCM_ERP}/vi/${organizationId}`;


/**
 * 简易询价列表查询；
 * @param params
 * @returns {Promise<void>}
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${prefix}/annual-supplier-rates/querySupplierRate`, {
    method: 'POST',
    query,
  });
}
