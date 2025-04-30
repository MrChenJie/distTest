import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';

/**
 * 查询邀约汇总列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.companyId - 公司编码
 */
const organizationId = getCurrentOrganizationId();
export async function fetchInviteList(params) {
  const { page, size, ...otherParams } = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/invites`, {
    method: 'POST',
    body: otherParams,
    query: {
      page,
      size,
    },
  });
}

/**
 * 查询是否启用隐私政策
 * @param {Object} params - 查询参数
 */
export async function fetchPrivacyPolicy(params) {
  const settingCode = '010011'; // 隐私政策code
  const partnerTenantId = params.tenantId;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/settings/${settingCode}/${partnerTenantId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询隐私政策详细
 * @param {Object} params - 查询参数
 */
export async function fetchPrivacyPolicyText(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/static-texts/text/by-code`, {
    method: 'GET',
    query: params,
  });
}
