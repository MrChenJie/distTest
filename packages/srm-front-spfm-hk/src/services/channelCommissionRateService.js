/*
 * channelCommissionRate - 渠道商酬金比例维护
 * @date: 2022-11-21
 * @author: Xinyi <xinyi.he02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import request from '_cus_utils/request';
import { SRM_SPUC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';

const organizationId = getCurrentOrganizationId();

// 渠道商酬金比例列表
// GET /v1/{organizationId}/commission-rate/list
export async function queryList(params) {
  const queryParams = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/commission-rate/list`, {
    method: 'GET',
    query: queryParams,
  });
}

// 更新渠道商酬金比例
// PUT /v1/{organizationId}/commission-rate
export async function save(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/commission-rate`, {
    method: 'PUT',
    body: params,
  });
}

// 同步渠道商酬金比例
// GET /v1/{organizationId}/commission-rate/syncCommissionRate
export async function updateCommissionRate() {
  return request(`${SRM_SPUC}/v1/${organizationId}/commission-rate/syncCommissionRate`, {
    method: 'GET',
  });
}

// 读取并更新渠道商比例信息
// GET /v1/{organizationId}/ftp-record-headers/read-channel-file
export async function readChannelFile() {
  return request(`/hfle/v1/${organizationId}/ftp-record-headers/read-channel-file`, {
    method: 'GET',
  });
}

// 渠道商酬金比例审计记录列表
// GET /v1/{organizationId}/commission-rate-audit/{rateId}
export async function queryCommissionRateAudit(params) {
  const queryParams = filterNullValueObject(parseParameters(params));
  const { rateId } = queryParams;
  return request(`${SRM_SPUC}/v1/${organizationId}/commission-rate-audit/${rateId}`, {
    method: 'GET',
    query: queryParams,
  });
}
