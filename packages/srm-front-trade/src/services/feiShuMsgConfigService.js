/**
 * @Description: 飞书消息配置列表页面 service
 * @date 2023-02-09
 * @author <xinyi.he02@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import request from 'utils/request';
import { SRM_SPUB } from '@/utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';

const organizationId = getCurrentOrganizationId();
const commonPrompt = `${SRM_SPUB}/v1/${organizationId}`;

/**
 * 飞书消息配置列表查询API
 * @param {Object} params - 查询参数
 */
export async function queryData(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${commonPrompt}/fei-shu-msg-configs/list-config`, {
    method: 'GET',
    query: param,
  });
}

export async function queryDetail(params) {
  return request(`${commonPrompt}/fei-shu-msg-config-dtls/query-detail`, {
    method: 'GET',
    query: params,
  });
}

export async function save(params) {
  return request(`${commonPrompt}/fei-shu-msg-config-dtls/save`, {
    method: 'POST',
    body: params,
  });
}
