import request from '_cus_utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { parseParameters, filterNullValueObject } from 'utils/utils';

/**
 * 查询汇总数据
 * @param params
 * @returns {Promise<void>}
 */
export async function queryList(params) {
  const query = parseParameters(params);
  const { sorter } = query;
  const { field, order } = sorter || {};
  return request(`${SRM_PLATFORM}/v1/sanction-entity-results`, {
    method: 'GET',
    query: filterNullValueObject({
      ...query,
      sort: [
        'status,asc',
        field && order ? `${field},${order === 'ascend' ? 'asc' : 'desc'}` : undefined,
        'resultId,asc',
      ],
      sorter: undefined,
    }),
  });
}

export async function updateStatus(params) {
  return request(`${SRM_PLATFORM}/v1/sanction-entity-results/updateStatus`, {
    method: 'POST',
    body: params,
  });
}

export async function exportSanctions(params) {
  return request(`${SRM_PLATFORM}/v1/sanction-entity-results/export`, {
    method: 'GET',
    query: params,
    responseType: 'blob',
  });
}
