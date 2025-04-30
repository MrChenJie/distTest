import request from '_cus_utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询AP发票
 * @param params
 * @returns {Promise<void>}
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`/hrpt/v1/${organizationId}/ap-invoice/query-ap-invoice`, {
    method: 'POST',
    query,
    body: query,
  });
}

/**
 * 查询调度任务执行时间
 * @param params
 * @returns {Promise<void>}
 */
export async function queryJobTime() {
  return request(`/hrpt/v1/${organizationId}/ap-invoice/query-job-time?jobList=HMDM.SYNC_EBS_PAYMENT&jobList=ebsApInvoicesSynJob`, {
    method: 'GET',
  });
}

/**
 * 导出前校验
 * @param params
 * @returns {Promise<void>}
 */
export async function exportCheck(params) {
  return request(`/hrpt/v1/${organizationId}/ap-invoice/export-check`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 单据权限配置列表
 * @param params
 * @returns {Promise<void>}
 */
 export async function queryPermissionList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`/spub/v1/${organizationId}/doc-permission-configs`, {
    method: 'GET',
    query,
  });
}
