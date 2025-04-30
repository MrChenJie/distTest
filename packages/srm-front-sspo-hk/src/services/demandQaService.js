/*
 * projectQaService - 需求人答疑service
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

// 需求人答疑列表数据
export async function fetchDemandList(params) {
  const query = parseParameters(params); 
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/queryPuestQuestionAnsList`, {
    method: 'GET',
    query,
  });
}

// 需求人答疑 保存
export async function saveDemand(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-qa-answers`, {
    method: 'POST',
    body: params.data,
  });
}

// 头信息查询
export async function queryDemandInfo(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/getProInfoDetail`, {
    method: 'GET',
    query: params,
  });
}

// 查询单子是否已经提交
export async function checkIsAllQaPublished(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/checkIsAllQaPublished/${params.milestoneId}`)
}

// 提交
export async function demandSubmit(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/queryQuestionAnsSubmit`, {
    method: 'POST',
    body: params,
  });
}
