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
 * 查询活动详情-基本信息
 * @param params
 * @returns {Promise<void>}
 */
export async function queryDetail(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-heads/${params.id}`, {
    method: 'GET',
  });
}

/**
 * 查询贸易商报价明细
 * @param params
 * @returns {Promise<void>}
 */
export async function getQuotationDetailsList(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-trade-quotes/getTradeQuoteList`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询分配中标数量
 * @param params
 * @returns {Promise<void>}
 */
export async function getTradeWinList(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-trade-wins/getTradeWinList`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询修改记录
 * @param params
 * @returns {Promise<void>}
 */
export async function getEditCommitList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-records`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存贸易商报价明细
 * @param params
 * @returns {Promise<void>}
 */
export async function saveMat(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-mats/saveCost`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存分配数量
 * @param params
 * @returns {Promise<void>}
 */
export async function saveAllocateWin(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-trade-wins?isFailWin=${params?.isFailWinValue}`, {
    method: 'POST',
    body: params.list,
  });
}

/**
 * 提交分配数量
 * @param params
 * @returns {Promise<void>}
 */
export async function submitAllocateWin(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-trade-wins/submit?isFailWin=${params?.isFailWinValue}`, {
    method: 'POST',
    body: params.list,
  });
}

/**
 * 导出报价明细
 * @param params
 * @returns {Promise<void>}
 */
export async function goExport(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-trade-quotes/tradeQuoteForTryExport`, {
    method: 'GET',
    responseType: 'blob',
    query: params,
  });
}

/**
 * 导出中标数量明细
 * @param params
 * @returns {Promise<void>}
 */
export async function goAllocateWinBidExport(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-trade-wins/getTradeWinListExport`, {
    method: 'GET',
    responseType: 'blob',
    query: params,
  });
}

/**
 * 保存基本信息
 * @param params
 * @returns {Promise<void>}
 */
export async function saveInfo(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-heads`, {
    method: 'POST',
    body: params,
  });
}
