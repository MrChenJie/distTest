import cusRequest from '_cus_utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

// /v1/{organizationId}/erp-contract-evaluates/self-template/query-detail/{contractId}
// GET ERP合同信息自定义模板信息查询
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { contractId } = query;
  return cusRequest(`/hscm-erp/v1/${getCurrentOrganizationId()}/erp-contract-evaluates/self-template/query-detail/${contractId}`, {
    method: 'GET',
    query,
  });
}

// 批量删除
// /v1/{organizationId}/ems-cooperate-filess/batch-remove
export async function batchRemoveFiles(params) {
  return cusRequest(`/hscm-erp/v1/${getCurrentOrganizationId()}/ems-cooperate-filess/batch-remove`, {
    method: 'DELETE',
    body: params,
  });
}

// ERP合同信息自定义模板提交
// post /v1/{organizationId}/erp-contract-evaluates/self-template/submitEvaluate
export async function submitEvaluate(params) {
  return cusRequest(`/hscm-erp/v1/${getCurrentOrganizationId()}/erp-contract-evaluates/self-template/submitEvaluate`, {
    method: 'POST',
    body: params,
  });
}
