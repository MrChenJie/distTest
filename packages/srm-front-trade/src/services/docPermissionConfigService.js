/**
 * 单据权限配置 service
 *
 * @date    2023-03-23
 * @author  陈深星 <chen.shenxing@hand-china.com>
 */

import request from '_cus_utils/request';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const prefix = `/spub/v1/${getCurrentOrganizationId()}`;

/**
 * 批量查询值集列表（HPFM接口）
 * 独立值集
 * @async
 * @function queryLovList
 * @returns {Object} fetch Promise
 */
export async function queryLovList(params) {
  return request(`/hpfm/v1/lovs/value/batch`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询值集数据（HPFM接口）
 * SQL值集 / URL值集
 * @async
 * @function queryLovList
 * @returns {Object} fetch Promise
 */
export async function queryLovData(params) {
  return request(`/hpfm/v1/lovs/data`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询部门数据
 * @returns {Object} fetch Promise
 */
export async function queryUnitList(params) {
  return request(`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/spuc-permission-configs/units`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询列表
 *
 * @param {Object} params
 * @returns {Object} fetch Promise
 */
export async function queryList(params) {
  return request(`${prefix}/doc-permission-configs`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 批量更新
 *
 * @param {Object} param.query
 * @param {Object} param.body
 * @returns
 */
export async function batchUpdate({ query, body }) {
  return request(`${prefix}/doc-permission-configs`, {
    method: 'POST',
    query,
    body,
  });
}

/**
 * 批量删除
 *
 * @param {Object} payload
 * @returns
 */
export async function batchDelete(payload) {
  return request(`${prefix}/doc-permission-configs`, {
    method: 'DELETE',
    body: payload,
  });
}
