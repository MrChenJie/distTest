/*
 * @Author: 陈杰 jie.chen06@hand-china.com
* @Date: 2025-04-14 15:25:44
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
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-eval-gather/listSearch`, {
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
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-eval-gather/info/base/${params.evalGatherId}`, {
    method: 'GET',
  });
}

/**
 * 查询合作模式
 * @param params
 * @returns {Promise<void>}
 */
export async function queryCooperationModel(params) {
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-eval-gather/info/mode/${params.evalGatherId}`, {
    method: 'GET',
  });
}

/**
 * 查询评委评分
 * @param params
 * @returns {Promise<void>}
 */
export async function getJudgesSummarySource(params) {
  const query = filterNullValueObject(params);
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-eval-gather/info/tabSearch`, {
    method: 'GET',
    query,
  });
}

/**
 * 详情导出
 * @param params
 * @returns {Promise<void>}
 */
export async function handleOtherExport(params) {
  const query = filterNullValueObject(params);
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-eval-gather/info/infoExport/${params.evalGatherId}`, {
    method: 'GET',
    query,
    responseType: 'blob',
  });
}

/**
 * 半年度汇总导出
 * @param params
 * @returns {Promise<void>}
 */
export async function handleSummaryExport(params) {
  const query = filterNullValueObject(params);
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-eval-gather/info/gatherExport/${params.evalGatherId}`, {
    method: 'GET',
    query,
    responseType: 'blob',
  });
}

/**
 * 退出申请查询
 * @param params
 * @returns {Promise<void>}
 */
export async function handleWithdrawalRequest(params) {
  const query = filterNullValueObject(params);
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-eval-gather/info/exit-application/${params.evalGatherId}`, {
    method: 'GET',
  });
}

/**
 * 查询caseID
 * @param params
 * @returns {Promise<void>}
 */
export async function generateCaseId(params) {
  const query = filterNullValueObject(params);
  return request(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-eval-gather/info/exit-application-process`, {
    method: 'GET',
    query,
  });
}

