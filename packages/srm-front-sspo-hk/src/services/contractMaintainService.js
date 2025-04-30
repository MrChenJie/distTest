/*
 * contractMaintainService - 采购项目信息service
 * @date: 2019-05-15
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  getResponse,
} from 'utils/utils';
import { SRM_SPCM, SRM_SCEI, SRM_SCEC, SRM_MDM, SRM_SSRC } from '_utils/config';
import { HZERO_PLATFORM } from 'utils/config';

import { SRM_BID } from '@/common/config'
import CusRequest from '_cus_utils/request';
const organizationId = getCurrentOrganizationId();

/**
 * -查询列表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos`, {
    query,
  });
}


export async function saveProject(params) {
  // const { body } = params;
  // console.log(params, '123')
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos`,{
    method: 'POST',
    body: [params],
  });
}
// export async function projectList(params) {
//   const query = filterNullValueObject(projectList(params));
//   return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos`+ params );
// }
// 邀请函
export async function getBidInviteNot(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-milestones/selectBidInviteNot/${params.proId}/${params.supplierId}`, {
    method: 'GET',
    // query: params,
  });
}

// 头信息查询
export async function queryProjectQaInfo(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/getProInfoDetail`, {
    method: 'GET',
    query: params,
  });
}

// 工作台报名响应表格数据
export async function getSignUpTableList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-judgess/select`, {
    method: 'POST',
    body: params,
  });
}

// 报名审批表格数据
export async function getSupplierApprovalTableList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-supplier-processs/${params.proId}`, {
    method: 'GET',
    query,
  })
}

// 报名审批表格数据串标
export async function checkColludeBidQuery(params) {
  // const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-supplier-processs/checkColludeBidQuery/${params.proId}`, {
    method: 'GET',
    // query,
  })
}

// 报名审批表格数据串标-保存
export async function checkColludeBidSave(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-supplier-processs/checkColludeBidSave`, {
    method: 'POST',
    body: params,
  }); 
}

// 报名审批表格数据串标-提交
export async function checkColludeBidSubmit(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-supplier-processs/checkColludeBidSubmit/${params.proId}`, {
    method: 'get',
  }); 
}
/**
 * 结束
 * */ 
 export async function finishList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-milestones/updateMilestoneStateInConform/${params.milestoneId}`, {
    method: 'GET',
  });
}

// 发放标书
export async function issueTenders(params) {
  return CusRequest(`${SRM_BID}/v1/${organizationId}/bid-supplier-processs/issueTenders`, {
    method: 'GET',
    query: params,
  });
}

//获取表格数据
export async function getListDetail(params) {
  const {proId, purchaseFlag} = params
  // const query = filterNullValueObject(getListDetail(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-ten-busi-configs?proId=${proId}&configType=${purchaseFlag}`, {
    method: 'GET',
    
  });
}

//获取汇总表
export async function checkEdit(params) {
  const {proId} = params
  // const query = filterNullValueObject(getListDetail(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-notices/checkIsHaveEndTime/${proId}`, {
    method: 'GET',
    
  });
}
//获取汇总表
export async function getListAll(params) {
  const {proId} = params
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-suppliers/getComprehensiveScoreList/${proId}`, {
    method: 'GET',
    query
  });
}
/**----技术评分表-------------------------------------------------------------------------------*/
/**
 * 获取表格数据
 */
export async function getTableList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-score-configs`, {
    method: 'GET',
    query
  });
}
/**
 * 获取报价表表格数据
 */
export async function quotationList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-price-configs/selectSecondConfigsList`, {
    query,
  });
}

/**
 * 删除报价表数据
 */
 export async function deleteQuotation(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-price-configs/deleteSecondConfigs`, {
    method: 'DELETE',
    body: params.data,
  });
}

/**
 * 添加表格数据
 */
export async function addTableList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-score-configs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新表格数据
 */
export async function updateTableList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-score-configs`, {
    method: 'POST',
    body: params.data,
  });
}

/**
 * 技术评分表导入
*/
export async function goImport(params) {
  // const query = filterNullValueObject(parseParameters(params.exportInfo));
  return request(`${SRM_BID}/v1/0/import/data/data-upload?templateCode=${params.templateCode}`, {
    method: 'POST',
    // query,
    body: params.file,
    responseType: 'text',
  });
  // const { templateCode, prefixPatch, formData } = params;
  // // const url = `${API_HOST}${prefixPatch}/v1/${organizationId}/import/data/data-upload?templateCode=${templateCode}`;
  // const url = `${SRM_BID}/v1/${organizationId}/import/data/data-upload?templateCode=${templateCode}`;
  // return request(url, {
  //   method: 'POST',
  //   body: formData,
  //   responseType: 'text',
  // });
}

/**
 * 添加报价表格数据
 */
 export async function addQuotationTableList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-price-configs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新报价表格数据
 */
 export async function saveQuotation(params) {
  return CusRequest(`${SRM_BID}/v1/${organizationId}/bid-pro-price-configs/saveSecondConfig`, {
    method: 'POST',
    body: params.data,
  });
}

/**
 * 获取邀请供应商设置表格数据
 */
 export async function supplierList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-suppliers/listAllSupplier`, {
    query,
  });
}
/**
 * 获取述标会议表格数据
 */
 export async function supplierListMeeting(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-suppliers/supplierMeeting`, {
    query,
  });
}

/**
 * 更新邀请商表格数据
 */
 export async function updateSupplierTableList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-suppliers`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除供应商表格数据
 */
 export async function deleteSupplierTableList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-suppliers`, {
    method: 'DELETE',
    body: params.data,
  });
}

/**
 * 保存表格数据
 */
export async function saveTableList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-score-configs`, {
    method: 'POST',
    query
  });
}

/**
 * 删除表格数据
 */
export async function deleteTableList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-score-configs`, {
    method: 'DELETE',
    body: params,
  });
}

/**----设置评委表-------------------------------------------------------------------------------*/
/**
 * 获取表格数据
 */
export async function getJudgesTableList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-judgess/select/${params.proId}`, {
    method: 'GET',
    query
  });
}

/**
 * 添加表格数据
 */
export async function addJudgesTableList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-judgess`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新表格数据
 */
export async function updateJudgesTableList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-judgess`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存表格数据
 */
export async function saveJudgesTableList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-judgess`, {
    method: 'POST',
    body: params.data
  });
}

/**
 * 删除表格数据
 */
export async function deleteJudgesTableList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-judgess`, {
    method: 'DELETE',
    body: params.data,
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

/**---公告相关接口--------------------------------------------------------------------------*/
/**
 * 保存公告
 */
export async function editNotices(params) {
  return CusRequest(`${SRM_BID}/v1/${organizationId}/bid-notices/saveNoticeInfo`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 保存公告后发起MIP审批
*/
export async function approvalProcess(params) {
  return request(`${SRM_BID}/v1/${organizationId}/approval_process/${params.requestId}`, {
    method: 'GET',
  });
}

/**
 * 查询公告列表
 */
export async function getNoticesLook(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-notices`, {
    method: 'GET',
    query
  });
}
export async function getNoticesLook1(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-notices`, {
    method: 'GET',
    query
  });
}

/**-------------------------------分割线----------------------------------------------------*/

// 采购结果查看弹框的表
export async function getResultList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/purchaseResultSupplier`, {
    method: 'GET',
    query,
  });
}
// 采购结果的模板预览
export async function getResultEmailList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/purchaseResultMail`, {
    method: 'GET',
    query: params
  });
}
//查看评委评分弹框表数据查询
export async function getSorceList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-milestones/selectJudgesScoreState/${params.proId}`, {
    method: 'GET',
  });
}
// 答疑完结-采购方式除公开询价，邀请询价外调用
export async function completionQA(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-milestones/answerQuestionsEnd/${params.milestoneId}`, {
    method: 'GET',
  });
}

// 答疑完结-采购方式为公开询价，邀请询价调用
export async function completionQAInquiry(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-milestones/answerQuestionsEndPass/${params.milestoneId}`, {
    method: 'GET',
  });
}
/**-------------------------------分割线----------------------------------------------------*/

// 获取项目状态统计/项目最终报价金额
export async function getStatisticInfo(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/stateStatistics`, {
    method: 'GET',
    query: params
  });
}

// 获取项目最终报价金额
export async function getMilestoneStatistics(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/milestoneStatistics`, {
    method: 'GET',
    query: params
  });
}

/**
 * 可新增订单发运行查询
 * @async
 * @function fetchSubjectCreateList
 * @param {!number} organizationId - 组织ID
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function fetchSubjectCreateList(pcHeaderId, params) {
  const page = parseParameters(params);
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/line/add`, {
    query: {
      pcHeaderId,
      ...params,
      ...page,
    },
  });
}

/**
 * 可新增订单-引用寻源单据查询
 * @async
 * @function fetchSubjectCreateList
 * @param {!number} organizationId - 组织ID
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function fetchSubjectQuoteList(pcHeaderId, params) {
  const page = parseParameters(params);
  return request(`${SRM_SPCM}/v1/${organizationId}/source-results/add`, {
    query: {
      pcHeaderId,
      ...params,
      ...page,
    },
  });
}

/**
 * 校验新增标的数据正确性
 * @export
 * @param {Object} params
 */
export async function appendValidate(params) {
  const { poHeaderId, poLineDetailDTOList } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/po-line/${poHeaderId}/append-validate`, {
    method: 'POST',
    body: poLineDetailDTOList,
  });
}

/**
 * -提交采购协议
 * @async
 * @function submit
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */

/**
 * -协议拟制详情头查询
 * @param {String} pcHeaderId - 头id
 */
export async function fetchDetailHeader(pcHeaderId) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/pc-header/${pcHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 合作伙伴行查询
 * @param {String} params - 参数
 */
export async function fetchPartner(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/pc-partner/${pcHeaderId}`, {
    method: 'GET',
    query: otherParams,
  });
}
/**
 * 合作伙伴行查询
 * @param {String} params - 参数
 */
export async function fetchSubject(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/pc-subject/${pcHeaderId}`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 业务条款行查询
 * @param {String} params - 参数
 */
export async function fetchTerm(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/pc-term/${pcHeaderId}`, {
    method: 'GET',
    query: otherParams,
  });
}
/* 获取操作记录列表
 * @async
 * @function fetchOperationRecordList
 * @param {!number} organizationId - 组织ID
 * @param {!number} prHeaderId - 头ID
 * @param {String} page - 页码
 * @param {String} size - 页数
 * @returns {object} fetch Promise
 */
export async function fetchOperationRecordList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-requests/${query.prHeaderId}/actions`, {
    method: 'GET',
    query,
  });
}
/**
 * 新增采购申请头
 * @async
 * @function add
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function add({ customizeUnitCode, ...body }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract`, {
    method: 'POST',
    query: { customizeUnitCode },
    body,
  });
}
/**
 * 更新采购申请头
 * @async
 * @function update
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function update({ customizeUnitCode, ...body }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract`, {
    method: 'PUT',
    query: { customizeUnitCode },
    body: filterNullValueObject(body),
  });
}

export async function submit({ customizeUnitCode, pcHeaderList }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/batch-submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: pcHeaderList,
  });
}
/**
 * 删除协议拟制
 * @async
 * @function deleteHeader
 * @param {object} params - 头数据
 * @returns {object} fetch Promise
 */
export async function deleteHeader(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract`, {
    method: 'DELETE',
    body: params,
  });
}
/**
 * 删除项目信息
 * @async
 * @function deletePro
 * @param {object} params - 头数据
 * @returns {object} fetch Promise
 */
 export async function deletePro(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos`, {
    method: 'DELETE',
    body: params,
  });
}
/**
 * 取消采购申请
 * @async
 * @function cancel
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function cancel(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-requests/cancel`, {
    method: 'POST',
    body,
  });
}
/**
 * 绑定头附件id
 * @async
 * @function bindHeaderAttachmentUuid
 * @param {object} query - 头数据
 * @returns {object} fetch Promise
 */
export async function bindHeaderAttachmentUuid(query) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-requests/attachment-uuid`, {
    method: 'POST',
    query,
  });
}
/**
 * 绑定行附件id
 * @async
 * @function bindHeaderAttachmentUuid
 * @param {object} query - 头数据
 * @returns {object} fetch Promise
 */
export async function bindLineAttachmentUuid(query) {
  const { prHeaderId, ...otherQuery } = query;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-requests/${prHeaderId}/lines/attachment-uuid`,
    {
      method: 'POST',
      query: otherQuery,
    }
  );
}
/**
 * 删除标的信息行
 * @async
 * @function pcSubjectLinesDelete
 * @returns {object} fetch Promise
 */
export async function pcSubjectLinesDelete(params) {
  const { body, pcHeaderId } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-subject/batch`,
    {
      method: 'DELETE',
      body,
    }
  );
}
/**
 * 删除阶段信息行
 * @async
 * @function pcSubjectLinesDelete
 * @returns {object} fetch Promise
 */
export async function pcStageLinesDelete(params) {
  const { body, pcHeaderId } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/stage/batch`, {
    method: 'DELETE',
    body,
  });
}

/**
 * 删除合作伙伴信息行
 * @async
 * @function partnerLinesDelete
 * @returns {object} fetch Promise
 */
export async function partnerLinesDelete(params) {
  const { body, pcHeaderId } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-partner/batch`,
    {
      method: 'DELETE',
      body,
    }
  );
}

/**
 * 删除返利信息行
 * @async
 * @function pcRebateLinesDelete
 * @returns {object} fetch Promise
 */
export async function pcRebateLinesDelete(params) {
  const { body, pcHeaderId } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/pc-rebate-informations/${pcHeaderId}/pc-rebate/batch`,
    {
      method: 'DELETE',
      body,
    }
  );
}

/**
 * 删除业务条款信息行
 * @async
 * @function termLinesDelete
 * @returns {object} fetch Promise
 */
// export async function termLinesDelete(lines) {
//   return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/pc-subject`, {
//     method: 'DELETE',
//     body: lines,
//   });
// }

/**
 * 查询支付方式值集
 * @export
 * @param {Object} params
 */
export async function queryPaymentMethod(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SCEI}/v1/${organizationId}/ec-payments/by-company`, {
    method: 'GET',
    query,
  });
}
/**
 * 查询收单地址
 * @export
 * @param {Object} params
 */
export async function queryInvoiceAddress(params) {
  const query = filterNullValueObject(parseParameters(params));
  const res = request(`${SRM_SCEC}/v1/${organizationId}/addresss/list`, {
    method: 'GET',
    query,
  });
  return getResponse(res);
}

/**
 * 查询品类定义
 * @param {Object} params
 */
export async function fetchCategory(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { itemId, ...otherQuery } = query;
  return request(`${SRM_MDM}/v1/${organizationId}/item-categories/categories/${itemId}`, {
    method: 'GET',
    query: otherQuery,
  });
}

/**
 * 操作记录
 * @param {Object} params
 */
export async function fetchOperationRecord(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { itemId, pcHeaderId, ...otherQuery } = query;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-action/${pcHeaderId}/page`, {
    method: 'GET',
    query: otherQuery,
  });
}

/**
 * 查询合作伙伴类型值集
 * @param {Object} params
 */
export async function fetchPcPartnerTypes(params) {
  const query = filterNullValueObject(params);
  const { pcTypeId, ...otherQuery } = query;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/${pcTypeId}/pc-partner/list`,
    {
      method: 'GET',
      query: otherQuery,
    }
  );
}

/**
 * 查询协议阶段值集
 * @param {Object} params
 */
export async function fetchStageOptions(params) {
  const query = filterNullValueObject(params);
  const { pcTypeId, ...otherQuery } = query; 
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/${pcTypeId}/pc-stage/enable/page`,
    {
      method: 'GET',
      query: otherQuery,
    }
  );
}

/**
 * 更新采购申请头
 * @async
 * @function update
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function updateContractTextUrl(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/contract-attachment-url`, {
    method: 'PUT',
    body,
  });
}

/**
 * 查询公司拓展信息
 * @export
 * @param {*} params
 */
export async function fetchExtended(params) {
  const { companyId, pcHeaderId } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-partner/extended`,
    {
      method: 'GET',
      query: { companyId },
    }
  );
}

/**
 * 引用寻源结果列表
 */
export async function fetchSourceList(params) {
  const query = parseParameters(params);
  return request(`${SRM_SPCM}/v1/${organizationId}/source-results`, {
    method: 'GET',
    query,
  });
}

/**
 * 引用寻源结果创建
 */
export async function sourceCreate(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/source-results/check-merge`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 阶梯报价
 */
export async function fetchLadderOffer(quotationLineId) {
  return request(
    `${SRM_SSRC}/v1/${organizationId}/rfx/supplier/${quotationLineId}/ladder-quotation`,
    {
      method: 'GET',
    }
  );
}

// -获取复制协议列表数据
export async function queryCopyList(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/purchase-view/page`, {
    query: parseParameters(params),
  });
}

// 复制协议单据
export async function copyContract(body) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${body.pcHeaderId}/contract-copy`,
    {
      method: 'POST',
      // 后端要求 body 不要传值，在 url 有 id 即可
    }
  );
}

/**
 * 查询采购订单
 * @param {*} params
 */
export async function fetchPurchaseOrder(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/purchaser/poLine`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询采购订单
 * @param {*} params
 */
export async function checkCreatePo(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/checkPo`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询新增标的行采购订单
 * @param {*} params
 */
export async function fetchAddPurchaseOrder(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/purchaser/poLine/add`, {
    method: 'GET',
    query,
  });
}

// FIXME: 没有使用公共的 service
export async function queryNoticeType(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value/tree`, {
    method: 'GET',
    query: params,
  });
}

// 项目转交
export async function saveHandover(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/transfer`, {
    method: 'POST',
    body: params,
  }); 
}

// 邀请供应商-保存
export async function saveInviteSuppliers(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-suppliers/register-with-email?proId=${params.proId}`, {
    method: 'POST',
    body: params.data,
  }); 
}

// 邀请供应商-查看理由
export async function getEmailInfo(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-supplier-processs/lookMail/${params.supplierId}`)
}

// 查看评委评审表
export async function getStartSorceList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-conformance-examines/unqualifiedSupplier/${params.proId}`,{
    method: 'GET',
    query:params
  })
}

// 提交评委评分
export async function saveStartSorceList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-conformance-examines/startScore/${params.proId}`,{
    method: 'GET',
    query:params
  })
}

// 决策信息提交
export async function submitDecisionInfo(params) {
  const proId = params.proId;
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/submitProDecisionInfo/${proId}`,{
    method: 'GET',
  })
}

// 线下公告查询
export async function getOffLineNotices(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-notices/getInitOfflineNoticeInfo/${params.type}`,{
    method: 'GET',
    query: params,
  })
}

// 线下公告保存
export async function saveOffLineNotices(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-notices/offlineNotice`,{
    method: 'POST',
    body: params.fieldsValue,
  })
}

// 线下公告保存后查询
export async function handleOffLineNotices(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-notices/${params.noticeId}`,{
    method: 'GET',
  })
}

// 邀请供应商时，是否在黑名单中
export async function checkSupplierBlackFlag(params) {
  return CusRequest(`${SRM_BID}/v1/${organizationId}/bid-suppliers/checkSupplierBlackFlag/${params.proId}`,{
    method: 'POST',
    body:params.data
  })
}

// 里程碑-给供应商发送邀请函
export async function sendSupplierEmailInvited(params) {
  return CusRequest(`${SRM_BID}/v1/${organizationId}/bid-milestones/sendSupplierEmailInvitBid`,{
    method: 'POST',
    body: params,
  })
}

// 查询灰度测试开关已开启，并且当前登陆人在灰度测试采购名单中
export async function getCheckSwitch(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-judgess/checkGrayBoxTesting`,{
    method: 'GET',
    query: params,
  })
}

// 技术评分表风险提示
export async function getCheckScoreMessage(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-score-configs/checkScoreConfig`,{
    method: 'POST',
    body: params,
  })
}

// 评委组设置发送待办通知
export async function setJudgesSendDeal(params) {
  return CusRequest(`${SRM_BID}/v1/${organizationId}/bid-pro-judgess`, {
    method: 'POST',
    body: params.data
  });
}

// 评委组设置-新增发送待办通知功能后的保存接口
export async function setJudgesSave(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-judgess/judgesBackupsDetail`, {
    method: 'POST',
    body: params.data
  });
}

// 技术、商务澄清第一阶段的编辑时间校验
export async function checkClarificationTime(params) {
  return CusRequest(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/queryFileReferenceState/${params.proId}`, {
    method: 'GET',
  });
}

// 删除报价表数据
export async function priceListDeleteAll(params) {
  const {proId} = params
  // const query = filterNullValueObject(getListDetail(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-price-configs/clearContents?proId=${proId}`, {
    method: 'DELETE',
    
  });
}

// 判断评委组按钮是否显示
export async function getCheckSend(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-milestones/checkSubmission/${params.proId}`, {
    method: 'GET',
  });
}

// 确认综合评分汇总的check
export async function getCheckSummary(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/checkScoreIsConfirm/${params.proId}`, {
    method: 'GET',
  });
}

// 保存条款
export async function saveClause(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-clauses`, {
    method: 'POST',
    body: params,
  });
}

// 查询条款明细
export async function getClauseInfo(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-clauses/getClauseInfoByProId/${params.proId}`, {
    method: 'GET',
  });
}

// 查询条款模板明细
export async function handleClauseTemInfo(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-clauses/getClauseContent`, {
    method: 'GET',
    query: params
  });
}

// 校验是否能设置条款明细
export async function checkClauseInfo(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-clauses/getProInfoForClause/${params.proId}`, {
    method: 'GET',
  });
}

// 获取供应商条款情况
export async function getSupplierList(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-clauses/getSupplierConfirmList`, {
    method: 'GET',
    query: params,
  });
}

// 保存建议中选供应商
 export async function saveOnlyResultUrl(params) {
  return CusRequest(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/saveSupplierInfoSuggest`, {
    method: 'POST',
    body: params,
  });
}

// 查询是否已提交中选供应商
 export async function getIsSelectSup(params) {
  return CusRequest(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/getSupplierInfoSuggest`, {
    method: 'GET',
    query: params,
  });
}

// 查询已报价的供应商
 export async function getSupplierBidOpenList(params) {
  return CusRequest(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/getQuoteSup`, {
    method: 'GET',
    query: params,
  });
}

// 确认开标
 export async function saveOpenBid(params) {
  return CusRequest(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/setBidOpenStatus`, {
    method: 'GET',
    query: params,
  });
}

// 确认流标
 export async function saveFailedBid(params) {
  return CusRequest(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/initMilestone`, {
    method: 'GET',
    query: params,
  });
}

// 获取9类文件
 export async function getBidCheckFile(params) {
  return CusRequest(`${SRM_BID}/v2/${organizationId}/bid-pro-judgess/tendeDocumentsNew/${params.proId}/${params.milestoneId}`, {
    method: 'GET',
    query: params,
  });
}

// 查询对应的uuid
 export async function queryUuidByFileType(params) {
  return CusRequest(`${SRM_BID}/v1/${organizationId}/bid-attachments/getUuidByFileType`, {
    method: 'GET',
    query: params,
  });
}

// 移动非8类（商务标书和报价文件）附件
 export async function saveAttachmentType(params) {
  return CusRequest(`${SRM_BID}/v1/${organizationId}/bid-attachments/updateBidAttachmentToTenBusiFiles`, {
    method: 'POST',
    body: params,
  });
}

// 移动8类附件
 export async function saveAttachmentTypeOther(params) {
  return CusRequest(`/hfle/v1/${organizationId}/files/attachment/biddingNewUuid`, {
    method: 'POST',
    body: params,
  });
}

// 分类上传技术标书查询
 export async function getTechfileList(params) {
  return CusRequest(`/bidding/v1/${organizationId}/bid-milestone-attachments`, {
    method: 'GET',
    query: params,
  });
}

// 保存分类上传技术标书
 export async function saveTechfileList(params) {
  return CusRequest(`/bidding/v1/${organizationId}/bid-milestone-attachments`, {
    method: 'POST',
    body: params,
  });
}

// 校验分类上传技术标书
 export async function checkUploadTechfile(params) {
  return CusRequest(`/bidding/v1/${organizationId}/bid-milestone-attachments/checkMilestoneFile`, {
    method: 'GET',
    query: params,
  });
}