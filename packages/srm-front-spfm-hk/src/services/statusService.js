/**
 * statusService.js - 状态更新记录 service
 * @Author: qi.xue01@hand-china.com
 * @Date: 2024/1/18
 * @Copyright: Copyright (c), 2024, hand
 */
import cusRequest from '_cus_utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';
const CMHK_SUPPLIER = '/cmhk-supplier';
const organizationId = getCurrentOrganizationId();

/**
 * 查询状态更新记录列表
 */
export async function queryStatusList(params) {
  const query = parseParameters(params);
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier-auto-update/list/search`, {
    method: 'GET',
    query
  });
}

/**
 * 根据id查询状态自动更新记录详情
 */
export async function queryStatusUpdateInfoById(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier-auto-update/info/${params.id}`, {
    method: 'GET',
  })
}

/**
 * 自动单据保存
 */
export async function statusInfoSave(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier-auto-update/info/save`, {
    method: 'POST',
    body: params
  })
}
