import request from 'utils/request';
import { SRM_SPUB } from '@/utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询汇总数据
 * @param params
 * @returns {Promise<void>}
 */
export async function queryList(params) {
  const query = parseParameters(params);
  return request(`${SRM_SPUB}/v1/${organizationId}/interface-errors/query`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询详情数据
 * @param params
 * @returns {Promise<void>}
 */
export async function queryDetail(params) {
  const { interfaceLogId } = params;
  return request(`/hitf/v1/${organizationId}/interface-logs/${interfaceLogId}`, {
    method: 'GET',
  });
}

