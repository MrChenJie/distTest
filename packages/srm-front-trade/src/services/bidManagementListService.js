/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-12 15:25:44
 * Copyright (c) 2024, All Rights Reserved. 
 */
import request from '_cus_utils/request';
import { SRM_TRADE } from '@/utils/config';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询活动数据
 * @param params
 * @returns {Promise<void>}
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-heads`, {
    method: 'GET',
    query,
  });
}

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
 * 查询活动详情-商品详情
 * @param params
 * @returns {Promise<void>}
 */
export async function queryListDetail(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-mats`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询邀请供应商详情
 * @param params
 * @returns {Promise<void>}
 */
export async function queryTradersListDetail(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-trades`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存邀请贸易商
 * @param params
 * @returns {Promise<void>}
 */
export async function saveTraders(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-trades`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除邀请贸易商
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteTradeLine(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-trades`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 里程碑阶段查询
 * @param params
 * @returns {Promise<void>}
 */
export async function queryStageListDetail(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-milestones`, {
    method: 'GET',
    query,
  });
}

/**
 * 编辑时间保存
 * @param params
 * @returns {Promise<void>}
 */
export async function saveEditTime(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-milestones/editMilEndTime`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 全部发送
 * @param params
 * @returns {Promise<void>}
 */
export async function handleSendAllEmail(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-trades/sendEmailToTradeAll`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 单个发送
 * @param params
 * @returns {Promise<void>}
 */
export async function handleSendEmail(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-trades/sendEmailToTrade`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 预览邮件模板
 * @param params
 * @returns {Promise<void>}
 */
export async function handleEmailTemplate(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-trades/getTradeEmailContent`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 付款详情
 * @param params
 * @returns {Promise<void>}
 */
export async function getPayTrade(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-trade-pays`, {
    method: 'GET',
    query,
  });
}
