/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2025-04-10 15:25:44
 * Copyright (c) 2025, All Rights Reserved. 
 */
import request from '_cus_utils/request';
import { SRM_MYLINK } from '@/utils/config';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询评估列表
 * @param params
 * @returns {Promise<void>}
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-eval/listSearch`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询评估详情基本信息
 * @param params
 * @returns {Promise<void>}
 */
export async function queryHeadInfo(params) {
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-eval/info/base/${params.id}`, {
    method: 'GET',
  });
}

/**
 * 模版导出
 * @param params
 * @returns {Promise<void>}
 */
export async function handleExport(params) {
  const query = filterNullValueObject(params);
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-eval/template-export/${params.evalId}`, {
    method: 'GET',
    query,
    responseType: 'blob',
  });
}

/**
 * 导入
 * @param params
 * @returns {Promise<void>}
 */
export async function handleImport(body, evalId, params) {
  const query = filterNullValueObject(params); 
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-eval/importEvalScore/${evalId}`, {
    method: 'POST',
    body,
    query,
  });
}

/**
 * 保存评委评分
 * @param params
 * @returns {Promise<void>}
 */
export async function saveJudges(params) {
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-eval/save`, {
    method: 'POST',
    body: params.list,
  });
}

/**
 * 查询评委评分
 * @param params
 * @returns {Promise<void>}
 */
export async function getJudgesSource(params) {
  const query = filterNullValueObject(params);
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-eval/info/score/${params.evalId}`, {
    method: 'GET',
    query,
  });
}