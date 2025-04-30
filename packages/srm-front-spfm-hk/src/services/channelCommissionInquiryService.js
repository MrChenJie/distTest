/*
 * channelCommissionInquiry - 渠道商酬金数据查询页面
 * @date: 2022-11-21
 * @author: Xinyi <xinyi.he02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import request from '_cus_utils/request';
import { SRM_SPUC, SRM_PLATFORM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';

const organizationId = getCurrentOrganizationId();

// 渠道商酬金数据列表查询
export async function queryList(params) {
  const queryParams = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/commission-data/list`, {
    method: 'GET',
    query: queryParams,
  });
}

// 新建渠道商成本付款申请
// POST /v1/{organizationId}/cost-payment-requests-pure/saveCommission
export async function saveCommission(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/cost-payment-requests-pure/saveCommission`, {
    method: 'POST',
    body: params,
  });
}

// GET /spfm/v1/lovs/sql/data
export async function queryData(params) {
  return request(`${SRM_PLATFORM}/v1/lovs/sql/data`, {
    method: 'GET',
    query: params,
  });
}

// 从ebs同步渠道商数据
// POST /v1/{organizationId}/commission-data/syncCommissionData
export async function syncCommissionData(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/commission-data/syncCommissionData`, {
    method: 'POST',
    query: params,
  });
}

// 查询渠道商管理的付款申请
// GET /v1/{organizationId}/commission-data/queryCost/{dataId}
export async function queryCost(params) {
  const queryParams = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPUC}/v1/${organizationId}/commission-data/queryCost/${queryParams.dataId}`,
    {
      method: 'GET',
      query: queryParams,
    }
  );
}

// 校验渠道商酬金金额
// POST /v1/{organizationId}/commission-data/checkCommissionAmount
export async function checkCommissionAmount(params) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/commission-data/checkCommissionAmount`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 酬金比例校验
 *
 * @param {Object} params 
 * @returns
 */
export async function checkCommissionRate(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/commission-data/check-rate`, {
    method: 'POST',
    body: params,
  });
}
