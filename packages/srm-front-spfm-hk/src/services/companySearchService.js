import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

/**
 * companySearchQueryPagePurchaser - 查询公司信息-采购商,带分页
 * @async
 * @param {Object} params - 查询参数
 */
export async function companySearchQueryPagePurchaser(organizationId, params, pagination) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/search/purchaser`, {
    method: 'POST',
    body: params,
    query: pagination,
  });
}
/**
 * companySearchQueryPageSupplier - 查询公司信息-供应商,带分页
 * @async
 * @param {Object} params - 查询参数
 */
export async function companySearchQueryPageSupplier(organizationId, params, pagination) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/search/supplier`, {
    method: 'POST',
    body: params,
    query: pagination,
  });
}
/**
 * 供应商发出邀约
 * @export
 * @param {!Number} params.organizationId 租户Id
 * @param {!Number} params.inviteCompanyId 被邀请公司的Id
 * @param {*} params.other 表单数据
 * @returns
 */
export async function companySearchInviteSupplier(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/supplier-invite`, {
    method: 'POST',
    body: { ...otherParams, tenantId: organizationId },
  });
}
/**
 * 采购方发出邀约
 * @export
 * @param {!Number} params.organizationId 租户Id
 * @param {!Number} params.inviteCompanyId 被邀请公司的Id
 * @param {*} params.other 表单数据
 * @returns
 */
export async function companySearchInvitePurchaser(params) {
  const { organizationId, ...otherParams } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/purchase-invite`, {
    method: 'POST',
    body: { ...otherParams, tenantId: organizationId },
  });
}

/**
 * 查询行业的树( 1级行业 和 2级行业 )
 */
export async function companySearchIndustry() {
  return request(`${HZERO_PLATFORM}/v1/industries/tree`, {
    method: 'GET',
  });
}

/**
 * 创建邀请供应商注册
 * @async
 * @function companySearchInviteRegisterSupplier -函数名称
 * @param {Object} params - 更新参数
 * @returns {Object} fetch Promise
 */
export async function companySearchInviteRegisterSupplier(params) {
  return request(`${SRM_PLATFORM}/v1/${params.organizationId}/supplier-invite-register`, {
    method: 'POST',
    body: params.body,
  });
}

/**
 * 查询调查模板表(租户级)
 * @async
 * @function queryInvestigateTemplates -函数名称
 * @param {Object} params -更新参数
 * @return {Object} fetch Promise
 */
export async function queryInvestigateTemplates(params) {
  return request(`${SRM_SSLM}/v1/${params.organizationId}/investigate-templates`, {
    method: 'GET',
    query: params,
  });
}

/**
 *查询公司信息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryCompanyInformation(params) {
  return request(`${SRM_PLATFORM}/v1/companies/latest`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询配置中心配置
 */
export async function fetchSettings(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings`, {
    method: 'GET',
    body: params,
  });
}

// 查询风险扫描
export async function fetchRiskScan(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-scan`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 斯瑞德风险扫描内嵌页
 * @param {Object} params 修改参数
 */
export async function riskEmbedPage() {
  const organizationId = getCurrentOrganizationId();
  // return request(`${SRM_SSLM}/v1/${organizationId}/monitor/query-monitor-enterprise`, {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/isExistsAccount`, {
    method: 'GET',
  });
}

/**
 * 查询已邀约公司
 * @param {Object} params
 */
export async function companySearchInvited(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/send-invites`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 查询是否只显示二级供应商
 * @param {Object} params - 查询参数
 */
export async function fetchOnlyShowMySupplierFlag() {
  const settingCode = '010012'; // 是否只显示二级供应商
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings/${settingCode}`, {
    method: 'GET',
  });
}

// 查询标签列表
export async function querySupplierCategory(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-companies/query-label`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 保存标签
 * @async
 */
export async function saveSupplierCategory(params) {
  const organizationId = getCurrentOrganizationId();
  console.log(params.body);
  return request(
    `${SRM_SSLM}/v1/${organizationId}/supplier-companies/update-label?companyId=${params.companyId}`,
    {
      method: 'POST',
      body: params.body,
    }
  );
}

/**
 * 查询当前分配公司
 * @param {Object} params
 */
export async function companySearchOwn() {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/corporation`, {
    method: 'GET',
  });
}
