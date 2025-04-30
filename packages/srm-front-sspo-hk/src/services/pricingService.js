/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2023-11-10 16:21:13
 * Copyright (c) 2023, All Rights Reserved. 
 */
/*
 * pricingService - 核价service
 * @date: 2022-04-15
 * @author: CJ <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters
} from 'utils/utils';

import { SRM_BID } from '@/common/config';
const organizationId = getCurrentOrganizationId();

// 报价模式
export async function fetchPricingList(params) {
  const query = parseParameters(params);
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-price-configs/view`, {
    method: 'GET',
    query,
  });
}
// 总价模式保存
export async function saveAllQuotation(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-price-config-answers`, {
    method: 'POST',
    body: params.data,
  });
}
// 确认核价
export async function handleConfirm(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-milestones/finishMilestone/${params.milestoneId}`, {
    method: 'POST',
  });
}

// 计算汇率
export function computeRate(params) {
  return request(`/cmhk-pr-center/v1/${organizationId}/pr-apply-detail-heads/getRate`, {
    method: 'GET',
    query: params,
  });
}

// 里程碑信息
export function milestone(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-milestones/listBidMilestone/${params.proId}`, {
    method: 'GET',
    query: params,
  });
}

// 查询报价条款
export function getQuotationTermsList(params) {
  const query = parseParameters(params);
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-price-config-answers/thirdSupClause/${params.proId}/${params.milestoneId}`, {
    method: 'GET',
    query,
  });
}
