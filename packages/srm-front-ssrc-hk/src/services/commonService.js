/**
 * service - 寻源平台/询价大厅
 * @date: 2019-06-14
 * @version: 1.0.0
 * @author: LC <chao.li03@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

/**
 * 操作记录数据查询
 * @async
 * @function fetchItemLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchOperation(params) {
  const { organizationId, bidHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/bid/actions/${bidHeaderId}`, {
    method: 'GET',
    query: { ...param },
  });
}

export async function permissions(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`/spfm/v1/${organizationId}/pub-ctl-permissions/edit`, {
    method: 'POST',
    body: params,
  });
}
