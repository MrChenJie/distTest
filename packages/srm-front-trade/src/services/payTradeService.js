/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-12 15:25:44
 * Copyright (c) 2024, All Rights Reserved. 
 */
import request from '_cus_utils/request';
import { SRM_TRADE } from '@/utils/config';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询贸易商付款凭证数据
 * @param params
 * @returns {Promise<void>}
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-trade-pays`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询贸易商付款凭证-基本信息
 * @param params
 * @returns {Promise<void>}
 */
export async function queryDetail(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-trade-pays/${params.id}`, {
    method: 'GET',
  });
}

/**
 * 查询贸易商付款凭证-中标信息
 * @param params
 * @returns {Promise<void>}
 */
export async function queryListDetail(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-trade-wins`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存贸易商付款信息
 * @param params
 * @returns {Promise<void>}
 */
export async function savePayInfo(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-trade-pays`, {
    method: 'POST',
    body: filterNullValueObject(params),
  });
}

/**
 * 查询中标总数量和金额
 * @param params
 * @returns {Promise<void>}
 */
export async function getTradeWinTotal(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-trade-wins/getTradeWinTotal`, {
    method: 'GET',
    query: filterNullValueObject(params),
  });
}
