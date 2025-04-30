/*
 * projectQaService - 项目答疑service
 * @date: 2022-04-15
 * @author: CJ <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import request from 'utils/request';
import {
  getCurrentOrganizationId,
  filterNullValueObject,
  parseParameters
} from 'utils/utils';

import { SRM_BID } from '@/common/config';
import cusRequest from '_cus_utils/request';
const organizationId = getCurrentOrganizationId();

// CMI回复问题
export async function fetchPurchaseReplyList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/queryQuestionAnsList`, {
    method: 'GET',
    query,
  });
}

// 价格澄清
export async function priceQaList(params) {
  const query = parseParameters(params); 
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/queryQuestionAnsListOnPriceClassfy`, {
    method: 'GET',
    query,
  });
}

// CMI主动澄清
export async function fetchCmiContentList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/queryQuestionAnsList`, {
    method: 'GET',
    query,
  });
}

// CMI回复问题保存
export async function savePurchaseReply(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas`, {
    method: 'POST',
    body: params.data,
  });
}

// CMI回复澄清保存(保存问题)
export async function saveClarification(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas`, {
    method: 'POST',
    body: params.data,
  });
}

// CMI回复澄清保存(保存答案)
export async function saveClarificationAnswers(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-qa-answers`, {
    method: 'POST',
    body: params.resData,
  });
}
// CMI回复澄清删除
export async function deleteClarification(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/deleteQuestAnswer`, {
    method: 'DELETE',
    body: params.data,
  });
}

// 头信息查询
export async function queryProjectQaInfo(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/getProInfoDetail`, {
    method: 'GET',
    query: params,
  });
}

// 轮次查询
export async function queryProjectQaMilestonesInfo(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-milestones/${params.milestoneId}`)
}

// 提交
export async function submit(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/queryPurseQuestionAnsSubmit`, {
    method: 'POST',
    body: params,
  });
}

// 提交价格澄清
export async function submitPrice(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/priceClassfySubmit`, {
    method: 'POST',
    body: params,
  });
}

// 分配
export async function assign(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/updateQuestionTrans`, {
    method: 'POST',
    body: params,
  });
}

// 查看上传纪要
export async function getQaSummaryFile(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-ten-busi-filess/getQaSummaryFiles`, {
    method: 'POST',
    body: params,
  });
}

// 保存纪要
export async function saveQaSummaryFile(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-ten-busi-filess`, {
    method: 'POST',
    body: params,
  });
}
// 删除价格澄清列表
export async function deletePriceQa(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/deleteQuestAnswer`, {
    method: 'DELETE',
    body: params.data,
  });
}

// 项目答疑单条提交
export async function submitRows(params) {
  return cusRequest(`${SRM_BID}/v1/${organizationId}/bid-qas/newQueryPurseQuestionAnsSubmit`, {
    method: 'POST',
    body: params,
  });
}

// 新答疑纪要文件查询
export async function getQaSummaryFileNew(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-ten-busi-filess/getQaSummaryFilesNew?page=${query.page}&size=${query.size}`, {
    method: 'POST',
    body: query,
  });
}

// 新答疑纪要文件保存
export async function saveQaSummaryFileNew(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-ten-busi-filess/saveSummaryFile`, {
    method: 'POST',
    body: params,
  });
}

// 新答疑纪要文件删除
export async function deleteQaSummaryFileNew(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-ten-busi-filess/deleteSummaryFile`, {
    method: 'DELETE',
    body: params,
  });
}
//------------------归档相关功能分割线--start-----------------------------------------
// 以下保存/下载pdf接口视页面情况，有可能是使用同一个接口的
// 查询项目述标会议
export async function getMeetingList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/`, {
    method: 'GET',
  });
}

// 保存项目述标会议
export async function saveMeeting(params) {
  return request(`${SRM_BID}/v1/${organizationId}/`, {
    method: 'POST',
    body: params,
  });
}

// 下载项目述标会议为PDF
export async function downLoadMeeting(params) {
  return request(`${SRM_BID}/v1/${organizationId}/`, {
    method: 'POST',
    body: params,
  });
}

// 保存价格澄清
export async function savePriceQa(params) {
  return request(`${SRM_BID}/v1/${organizationId}/`, {
    method: 'POST',
    body: params,
  });
}

// 下载价格澄清为PDF
export async function downLoadPriceQa(params) {
  return request(`${SRM_BID}/v1/${organizationId}/`, {
    method: 'POST',
    body: params,
  });
}

// 保存项目澄清
export async function saveProjectQa(params) {
  return request(`${SRM_BID}/v1/${organizationId}/`, {
    method: 'POST',
    body: params,
  });
}

// 下载项目澄清为PDF
export async function downLoadProjectQa(params) {
  return request(`${SRM_BID}/v1/${organizationId}/`, {
    method: 'POST',
    body: params,
  });
}
//------------------归档相关功能分割线--end-----------------------------------------
