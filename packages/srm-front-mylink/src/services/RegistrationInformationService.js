/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-12 15:25:44
 * Copyright (c) 2024, All Rights Reserved. 
 */
import request from '_cus_utils/request';
import { SRM_TRADE, SRM_MYLINK } from '@/utils/config';
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
  return request(`${SRM_MYLINK}/v1/${organizationId}/link-part-signs`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询活动数据更新
 * @param params
 * @returns {Promise<void>}
 */
export async function queryListHistory(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_MYLINK}/v1/${organizationId}/link-part-signs`, {
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
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partnerCase/batchDelete`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 删除草稿数据更新
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteLineHistory(params) {
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partnerCaseHistory/batchDelete`, {
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
  return request(`${SRM_MYLINK}/v1/${organizationId}/link-part-signs/${params.id}`, {
    method: 'GET',
  });
}

/**
 * 查询活动详情-基本信息更新
 * @param params
 * @returns {Promise<void>}
 */
export async function queryDetailHistory(params) {
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partnerCaseHistory/info/${params.id}`, {
    method: 'GET',
  });
}

/**
 * 保存
 * @param params
 * @returns {Promise<void>}
 */
export async function saveInfo(params) {
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partnerCase/info/save`, {
    method: 'POST',
    body: params,
  });
}


/**
 * 保存更新
 * @param params
 * @returns {Promise<void>}
 */
export async function saveInfoHistory(params) {
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partnerCaseHistory/info/save`, {
    method: 'POST',
    body: params,
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
 * 跟新 新增
 * @param params
 * @returns {Promise<void>}
 */
export async function addHistory(params) {
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partnerCaseHistory/add/${params.id}`, {
    method: 'POST',
  });
}

/**
 * 邮件拒绝
 * @param params
 * @returns {Promise<void>}
 */
export async function signsRefuse(params) {
  return request(`${SRM_MYLINK}/v1/${organizationId}/link-part-signs/refuse/${params.id}`, {
    method: 'GET',
  });
}

/**
 * 引入邀请
 * @param params
 * @returns {Promise<void>}
 */
export async function saveInvite(params) {
  return request(`${SRM_MYLINK}/v1/${organizationId}/link-part-signs/sign-invite`, {
    method: 'POST',
    body: params
  });
}

/**
 * 发送邀请
 * @param params
 * @returns {Promise<void>}
 */
export async function inviteSign(params) {
  return request(`${SRM_MYLINK}/v1/${organizationId}/link-part-signs/inviteSign`, {
    method: 'POST',
    body: params
  });
}