import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export async function getApprovalDetail(params) {
  const { requestId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/approval-requests/${requestId}`, {
    method: 'GET',
  });
}

// 通过requestId来获取审批信息
export async function getByRequestId(params) {
  const { requestId } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/approval-requests/getByRequestId/${requestId}`,
    {
      method: 'GET',
    }
  );
}

// 通过requestId来获取考评数据的详细信息
// /v1/{organizationId}/eval-headers/toEvalHeaderUrl/{requestId}
export async function getEvaluationByRequestId(params) {
  const { requestId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-headers/toEvalHeaderUrl/${requestId}`, {
    method: 'GET',
  });
}
