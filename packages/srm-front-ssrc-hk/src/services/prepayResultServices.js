import request from '_cus_utils/request';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// GET /v1/{organizationId}/ebs-write-off-imports/queryEbsWriteOffImport
export async function fetchData(params) {
  const query = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${organizationId}/ebs-write-off-imports/queryEbsWriteOffImport`, {
    method: 'GET',
    query,
  });
}

// 预付款结果查询重新推送
// POST /v1/{organizationId}/ebs-write-off-imports/reimport
export async function newPushEBS(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/ebs-write-off-imports/reimport`, {
    method: 'POST',
    body: params,
  });
}
