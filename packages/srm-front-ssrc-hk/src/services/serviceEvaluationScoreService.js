import request from '_cus_utils/request';
import { parseParameters, filterNullValueObject } from 'utils/utils';

/**
 * 采购线条-供应商评分总成绩-查询
 * @param params
 * @returns {Promise<void>}
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`/hscm-erp/v1/ems-service-evaluation/ems-score/query`, {
    method: 'GET',
    query,
  });
}

// 采购线条-供应商评分总成绩-PDF导出
// POST /v1/ems-service-evaluation/ems-score/exportPdf
export async function exportPdf(params) {
  return request(`/hscm-erp/v1/ems-service-evaluation/ems-score/exportPdf`, {
    method: 'POST',
    body: params,
    responseType: 'blob',
  });
}
