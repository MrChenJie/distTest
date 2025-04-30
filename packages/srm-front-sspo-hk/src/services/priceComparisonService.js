/*
 * pricingService - 比价service
 * @date: 2022-04-15
 * @author: CJ <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import request from 'utils/request';
import {
  getCurrentOrganizationId,
} from 'utils/utils';

import { SRM_BID } from '@/common/config';
const organizationId = getCurrentOrganizationId();

// 比价头信息
export async function priceHeaderInfo(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-price-configs/lowest-highest`, {
    method: 'POST',
    body: params,
  });
}

// 最新报价(本轮)
export async function getNewPrice(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-price-configs/current-round-price`, {
    method: 'POST',
    body: params,
  });
}

// 查询本次报价-折线图表
export async function fetchHistoryQuotationProcessChart(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-price-configs/query-quotation-process`, {
    method: 'POST',
    body: params,
  });
}


