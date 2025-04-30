import request from '_cus_utils/request';
import cusRequest from '_cus_utils/request';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId, isTenantRoleLevel, } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';

const organizationId = getCurrentOrganizationId();
const prefix = `/cmhk-pr-center/v1/${organizationId}`;

/**
 * 录入报价基本信息查询
 * @param params
 * @returns {Promise<void>}
 */
export async function queryInfo(params) {
  const query = filterNullValueObject(params);
  return request(`${prefix}/pr-third-sups/selectQuotations`, {
    method: 'GET',
    query,
  });
}

// 获取汇率
export async function getPurchaseApplicationRate(params) {
  return request(`${prefix}/pr-apply-detail-heads/getRate`, {
    method: 'GET',
    query: params,
  });
}

// 查询附件信息
export async function queryFileList(params) {
  const tenantId = getCurrentOrganizationId();
  return cusRequest(
    `${HZERO_FILE}/v1${isTenantRoleLevel() ? `/${tenantId}/` : '/'}files/${
      params.attachmentUUID
    }/file`,
    {
      method: 'GET',
      query: params,
    }
  );
}

// 录入报价页面（保存）
export async function saveQuotationInfo(params) {
  return request(`${prefix}/pr-third-sups/savePortal`, {
    method: 'POST',
    body: params,
  });
}

// 录入报价页面（提交）
export async function submitQuotationInfo(params) {
  return request(`${prefix}/pr-third-sups/submit`, {
    method: 'POST',
    body: params,
  });
}
