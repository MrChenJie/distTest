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
 * 删除草稿数据
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteLine(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-heads`, {
    method: 'DELETE',
    body: params,
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
 * 保存活动详情
 * @param params
 * @returns {Promise<void>}
 */
export async function saveActiveInfo(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-heads`, {
    method: 'POST',
    body: filterNullValueObject(params),
  });
}

/**
 * 保存商品详情
 * @param params
 * @returns {Promise<void>}
 */
export async function saveProductInfo(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-mats`, {
    method: 'POST',
    body: params.list,
  });
}

/**
 * 删除商品详情
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteProductLine(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-mats`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 商品详情 - 导入
 */
 export async function actionImport(param) {
  return request(`${SRM_TRADE}/v1/${organizationId}/payment-header-ints/batch-import`, {
    method: 'POST',
    body: param,
  }).then((res) => getResponse(res));
}

/**
 * 商品详情 - 导出
 */
 export async function goProduInforExport(params) {
  return request(`${SRM_TRADE}/v1/${organizationId}/cmhk-act-mats/export`, {
    method: 'GET',
    responseType: 'blob',
    query: params,
  });
}
