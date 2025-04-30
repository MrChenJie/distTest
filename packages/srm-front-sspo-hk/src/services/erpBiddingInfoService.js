/*
 * erpBiddingService - ERP-service
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

// 获取用户信息
export async function getErpInfo(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/getProInfoDetail`, {
    method: 'GET',
    query: params,
  });
}

// 获取erp采购方案编号换取的proID
export async function getErpProCode(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/queryProIdByprocurementPlanNumber/${params.proCode}`);
}

// 分标包
export async function subcontracting(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/getProInfoDetail`, {
    method: 'GET',
    query: params,
  });
}

// 保存分标包的基本信息
export async function subcontractingSave(params) {
  // return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos`, {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/saveERPData`, {
    method: 'POST',
    body: [params],
  });
}

// 查询所有分标包信息
export async function getPanesAll(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/query-bidding-data-scm`, {
    method: 'GET',
    query: params,
  });
}

// 删除分标包
export async function subcontractingRemove(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos`, {
    method: 'DELETE',
    body: [params],
  });
}
