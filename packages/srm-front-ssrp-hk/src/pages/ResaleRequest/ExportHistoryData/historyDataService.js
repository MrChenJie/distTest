/**
 * historyDataService
 * @author WY <yang.wang06@hand-china.com>
 * @date 2019/9/29
 * @copyright 2019/9/29 © HAND
 */
import cusRequest from '_cus_utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';

/**
 * @typedef PageQuery<T = any> = {page: {current?: number; pageSize?: number}} & T
 * @property {?number} page.current
 * @property {?number} page.pageSize
 */

/**
 * @typedef HDQuery
 * @property {?string} taskCode - 任务编号
 * @property {?string} serviceName - 所属服务
 * @property {?string} state - 任务状态
 */

/**
 * 分页查询 异步导出历史记录
 * @param {PageQuery<HDQuery>} params - 查询参数
 * @return {Promise<void>}
 */
export async function historyDataQuery(params) {
  return cusRequest(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/export-task`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 *
 * @return {Promise<void>}
 */
export async function historyDataCancel(params) {
  return cusRequest(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/export-task/cancel`, {
    method: 'PUT',
    query: params,
  });
}

/**
 * 更新异步导出任务
 * @param {Object} body 
 * @returns
 */
export async function historyDataUpdate(body) {
  return cusRequest(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/cux/export-task-apis/update`, {
    method: 'POST',
    body,
  });
}

