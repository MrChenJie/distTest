/*
 * JudgesSorceService - 协议拟制service
 * @date: 2022-04-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
} from 'utils/utils';
import { SRM_BID } from '@/common/config'
const organizationId = getCurrentOrganizationId();

/**
 * -查询项目基本信息
 * @param {Object} params - 查询参数
 * @param {String} params.page - s页码
 * @param {String} params.size - 页数
 */
 export async function getProjectInfo(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/getProInfoDetail?proId=${params.proId}`, {
    method: 'GET',
  });
}

/**
 * -查询招标文件表
 * @param {Object} params - 查询参数
 * @param {String} params.page - s页码
 * @param {String} params.size - 页数
 */
 export async function getTenderList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-judgess/lookFile`, {
    method: 'GET',
    query,
  });
}


export async function getDocumentList(params) {
  // const query = filterNullValueObject(parseParameters(params));
  console.log(params)
  return request(`${SRM_BID}/v1/${organizationId}/bid-ten-busi-filess`, {
    method: 'GET',
    query:params,
  });
}
/**
 * -查询投标文件表
 * @param {Object} params - 查询参数
 * @param {String} params.page - s页码
 * @param {String} params.size - 页数
 */
 export async function getDiddingList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-judgess/lookFile`, {
    method: 'GET',
    query,
  });
}

/**
 * -查询投标文件附件表
 * @param {Object} params - 查询参数
 * @param {String} params.page - s页码
 * @param {String} params.size - 页数
 */
 export async function getEnclosureList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-ten-busi-filess/look`, {
    method: 'GET',
    query,
  });
}

/**
 * -查询报价文件
 */
 export async function getPriceFileList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-judgess/priceFile/${params.proId}`, {
    method: 'GET',
    query,
  });
}

// 头信息查询
export async function queryProjectQaInfo(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/getProInfoDetail`, {
    method: 'GET',
    query: params,
  });
}


/**
 * -查询自己的技术澄清提问表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
 export async function getcaqaList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/queryQuestionListByMe`, {
    method: 'GET',
    query,
  });
}

/**
 * -查询别人的技术澄清提问表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
 export async function getOtherCaqaList(params) {
  const query = parseParameters(params);
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/queryQuestionListByOther`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存提问
*/
export async function saveClarification(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas`, {
    method: 'POST',
    body: params.data,
  });
}

/**
 * 提交提问
*/
export async function submit(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/tenBusiQuestionAnsSubmit`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除提问
*/
export async function deleteClarification(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/deleteQuestAnswer`, {
    method: 'DELETE',
    body: params.data,
  });
}

/**
 * -查询商务应答表
 */
export async function getAnswerList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-ten-busi-configs/selectMessage`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询是否允许供应商继续评分
*/
export async function getPassFrame(params) {
  // const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-conformance-examines/unqualifiedSupplier/${params.proId}?all=${params.all}`, {
    method: 'GET',
    // query,
  });
}

/**
 * 确认供应商是否通过
*/
export async function supplierPass(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-conformance-examines/saveUnqualified?proId=${params.proId}`, {
    method: 'POST',
    body: params.passList,
  });
}

/**
 * -查询技术应答表
 */
export async function getAnswerListJs(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-ten-busi-configs/selectMessage`, {
    method: 'GET',
    query,
  });
}

/**
 * -查询技术评分表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
 export async function getTechnical(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-score-config-answers/query`, {
    method: 'GET',
    query,
  });
}

/**
 * 技术评分表保存
*/
export async function saveScore(params) {
  // const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-score-config-answers/add`, {
    method: 'POST',
    body: params.scoreInfo,
  });
}

/**
 * 技术评分表提交
*/
export async function submitScore(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-score-config-answers/submit/${params.proId}`, {
    method: 'GET',
  });
}

/**
 * 技术评分表导出
*/
export async function goExport(params) {
  const query = filterNullValueObject(parseParameters(params.exportInfo));
  return request(`${SRM_BID}/v1/${organizationId}/bid-score-config-answers/export`, {
    method: 'POST',
    query,
    responseType: "blob"
  });
}

/**
 * 技术评分表导入
*/
export async function goImport(params) {
  const query = filterNullValueObject(parseParameters(params.exportInfo));
  return request(`${SRM_BID}/v1/${organizationId}/bid-score-config-answers`, {
    method: 'POST',
    query,
    body: params.file,
    responseType: 'text',
  });
}

/**
 * -查询符合性审查表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
 export async function getCompliance(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-conformance-examines/query`, {
    method: 'GET',
    query,
  });
}

/**
 * 符合性审查表的保存
*/
export async function saveCompliance(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-conformance-examines/add`, {
    method: 'POST',
    body: params.saveDate,
  });
}

/**
 * 符合性审查表的提交
*/
export async function submitCompliance(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-conformance-examines/submit/${params.proId}`, {
    method: 'GET',
  });
}

/**
 * -评分表确认技术澄清-基本信息查询
 */
export async function getbasicList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/${params.proId}`, {
    method: 'GET',
  });
}

/**
 * -查询里程碑信息
 */
export async function getMilestoneId(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-milestones/${params.milestoneId}`, {
    method: 'GET',
  });
}

/**
 * -评分表确认技术澄清-技术商务答疑汇总
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function getQuestionList(params) {
  const query = parseParameters(params);
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/queryQuestionListByAllRequest`, {
    method: 'GET',
    query,
  });
}
// -评分表确认技术澄清-转交提问给供应商
export async function goCommitSupplier(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/transToBlowQaAnswer`, {
    method: 'POST',
    body: params.ansearList,
  });
}

// -评分表确认技术澄清-反馈答复给评委
export async function goCommitJudges(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/transToBlowQaAnswerJudges`, {
    method: 'POST',
    body: params.ansearList,
  });
}

// 里程碑截止时间
export async function getMilDeadline(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-milestones/getMilDeadline/${params}`, {
    method: 'GET',
  });
}

// 供应商信息查询
export async function getSupplierList(params) {
  const query = parseParameters(params);
  return request(`${SRM_BID}/v1/${organizationId}/bid-ten-busi-configs/selectSupplier`, {
    method: 'GET',
    query,
  });
}
// -查询投标文件和轮次-5.20版本
export async function getDiddingRound(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v2/${organizationId}/bid-pro-judgess/tendeDocumentsNew/${params.proId}/${params.milestoneId}`, {
    method: 'GET',
    query,
  });
}
/**
 * 投标文件-指定行的全部下载
*/
export async function downLoadBidFilesZip(params) {
  return request(`/hfle/v1/${organizationId}/compressed/files/getSupplierCompressBidFileNew/${params.supplierId}`, {
    method: 'GET',
    query: params,
    responseType: "blob"
  });
}

// 技术商务答疑汇总下载11.25
export async function downloadTecbusqatotal(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-milestones/downExcelClarify/${params.proId}/${params.milestoneId}?ids=0,1,2,3,4,5,6,7,8,9,10,11&exportType=DATA`, {
    method: 'GET',
    responseType: "blob",
  });
}

// 技术应答表
export async function downloadTech(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-ten-busi-configs/exportMessage`, {
    method: 'GET',
    query: params,
    responseType: "blob",
  });
}