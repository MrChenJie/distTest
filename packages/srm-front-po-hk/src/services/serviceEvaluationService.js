import request from '_cus_utils/request';
import { parseParameters, filterNullValueObject } from 'utils/utils';

/**
 * 采购线条-过程服务评价
 * @param params
 * @returns {Promise<void>}
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`/hscm-erp/v1/ems-service-evaluation/queryEmsEvaluationList`, {
    method: 'GET',
    query,
  });
}
