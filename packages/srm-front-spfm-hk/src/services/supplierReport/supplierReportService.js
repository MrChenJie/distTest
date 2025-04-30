/**
 * accessToSupplierHKService.js - 供应商报表service
 * @Author: jinkai.lu@hand-china.com
 * @Date: 2024/01/29
 * @Copyright: Copyright (c), 2023, hand
 */
import cusRequest from '_cus_utils/request';
import { parseParameters, getCurrentOrganizationId,filterNullValueObject } from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';
const CMHK_SUPPLIER = '/cmhk-supplier';
const organizationId = getCurrentOrganizationId();


/**
 * 查询期间新增
 */
export async function getPeriodAddInfo(payload) {
  const query = filterNullValueObject(parseParameters(payload));
  console.log(query);
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier-report/period-add/search`, {
    method: 'GET',
    query
  })
}

/**
 * 查询期间修改
 */
export async function getPeriodModifyInfo(payload) {
  const query = filterNullValueObject(parseParameters(payload));
  console.log(payload);
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier-report/period-update/search`, {
    method: 'GET',
    query
  })
}
  