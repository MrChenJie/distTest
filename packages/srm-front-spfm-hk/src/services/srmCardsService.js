/**
 * expertService.js - 工作台卡片 service
 * @date: 2019-02-23
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, getUserOrganizationId, parseParameters } from 'utils/utils';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';
import { HZERO_MSG, HZERO_HWFP } from 'utils/config';

const organizationId = getCurrentOrganizationId();
const tenantId = getUserOrganizationId();

/**
 *
 * 查询固定的常用功能
 * @export
 * @returns
 */
export async function queryFunctions() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/dbd-user-menu-sets/queryFunction`, {
    method: 'GET',
  });
}

/**
 *
 * 查询所有常用功能
 * @export
 * @returns
 */
export async function queryAllFunctions() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/dbd-user-menu-sets/queryAllFunction`, {
    method: 'GET',
  });
}

/**
 *
 * 模块化数字统计数据查询
 * @param {Object} params 查询参数
 * @export
 * @returns
 */
export async function queryStatistical(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/dashboard_clause`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存 - 要显示的采购订单
 * @export
 * @param {Object} params
 * @returns
 */
export async function addPurchases(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/dbd-user-clause-sets`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存 - 要显示的寻源条目
 * @export
 * @param {Object} params
 * @returns
 */
export async function addSourceEvent(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/dbd-user-clause-sets`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存 - 常用功能
 * @export
 * @param {Object} params
 * @returns
 */
export async function addFunctions(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/dbd-user-menu-sets/createMenu`, {
    method: 'POST',
    body: params,
  });
}
/**
 *
 * 系统消息查询
 * @param {Object} params 查询参数
 * @export
 * @returns
 */
export async function querySystemMessage(params) {
  return request(`${HZERO_MSG}/v1/${organizationId}/messages/user`, {
    method: 'GET',
    query: params,
  });
}

/**
 *
 * 待办事项查询
 * @param {Object} params 查询参数
 * @export
 * @returns
 */
export async function queryTodo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/dashboard-doc-stats`, {
    method: 'GET',
    query: params,
  });
}

/**
 *
 * 工作流查询
 * @param {Object} params 查询参数
 * @export
 * @returns
 */
export async function queryWorkflow(params) {
  return request(
    `${HZERO_HWFP}/v1/${organizationId}/activiti/task/query?ignoreEmployeeNotFound=true`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 查询企业公告列表数据
 * @param {Object} params - 查询参数
 */
export async function queryAnnouncement(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/platform-notices-work`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询平台公告列表数据
 * @param {Object} params - 查询参数
 */
export async function queryCompanyNotice(params) {
  return request(`${SRM_PLATFORM}/v1/platform-notices`, {
    method: 'GET',
    query: params,
  });
}

/**
 *
 * 采购方报表查询
 * @param {Object} params 查询参数
 * @export
 * @returns
 */
export async function queryPurchasingReport(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/dashboard-amt-stats/purchaser`, {
    method: 'GET',
    query: params,
  });
}

/**
 *
 * 供应商以及采购方领导报表查询
 * @param {Object} params 查询参数
 * @export
 * @returns
 */
export async function queryReports(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/dashboard-amt-stats/supplier/${tenantId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 *改变消息为已读
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function changeRead(params) {
  return request(`${HZERO_MSG}/v1/${organizationId}/messages/user/read-flag`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 查询风险日报
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryRiskDaily(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-event`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询风险详情分类列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryRiskCategory() {
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-category/getEnable`, {
    method: 'GET',
  });
}

/**
 * 查询风险详情分类列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryRiskDetail(params) {
  const { eventDate } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-event/${eventDate}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询风险监控日报详情
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryRiskDailyModal(params) {
  const query = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-event/detail`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询风险监控url
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryEnterpriseRisk(query) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/query-monitor-enterprise`, {
    method: 'GET',
    responseType: 'text',
    query,
  });
}

/**
 * 风险监控标记已读
 *
 * @export
 * @param {*} params
 * @returns
 */
// export async function queryEnterpriseRiskRead(query) {
//   return request(`${SRM_SSLM}/v1/${organizationId}/risk-event`, {
//     method: 'put',
//     query,
//   });
// }
