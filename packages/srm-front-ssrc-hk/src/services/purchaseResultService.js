/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-03-06 20:10:19
 * Copyright (c) 2024, All Rights Reserved. 
 */
import cusRequest from '_cus_utils/request';
import { filterNullValueObject, getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 请求api前缀
// const prefix = `${SRM_SSRC}/v1/${organizationId}`;
const prefix = `/cmhk-pr-center/v1/${organizationId}`;
const SRM_BID = '/bidding'

// 采购结果详情页面查询接口
export async function queryPurchaseResultDetail(params) {
  return cusRequest(`${prefix}/cmhk-pr-fourth-heads/briefInquiry/${params.proCode}`, {
    method: 'GET',
  });
}

// 简易采购结果详情页面变更
export async function updatePurchaseResultDetail(params) {
  return cusRequest(`${prefix}/cmhk-pr-fourth-heads`, {
    method: 'POST',
    body: params,
  });
}

// 简易采购结果查询列表
export async function queryPurchaseResultList(params) {
  return cusRequest(`${prefix}/cmhk-pr-fourth-heads`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(params)),
  });
}

// 简易采购结果详情页保存
export async function savePurchaseResultDetail(params) {
  return cusRequest(`${prefix}/cmhk-pr-fourth-heads/briefInquiry`, {
    method: 'POST',
    body: params,
  });
}

// 查询节点信息/v1/{organizationId}/cmhk-supplier/supplier/getActivityInfo
export async function getNodeInfo(params) {
  return cusRequest(`/cmhk-supplier/v1/${organizationId}/cmhk-supplier/supplier/getActivityInfo`, {
    method: 'GET',
    query: params,
  });
}

// 查询项目id
export async function queryProjectId(params) {
  return cusRequest(`${prefix}/cmhk-pr-fourth-heads/ppNumber`, {
    method: 'POST',
    body: params,
  });
}

// 查询申请id
export async function queryPrId(params) {
  return cusRequest(`${prefix}/cmhk-pr-fourth-heads/getPrDataByPpId`, {
    method: 'GET',
    query: params,
  });
}

// 一般结果详情页面查询接口
export async function normalQueryPurchaseResultDetail(params) {
  return cusRequest(`${prefix}/cmhk-pr-fourth-heads/resultSave/${params.proCode}`, {
    method: 'GET',
    query: {
      resultType: params.resultType,
    },
  });
}
// 一般采购结果决策附件下载
export async function normalDowloadFile(params) {
  return cusRequest(`${prefix}/cmhk-pr-fourth-heads/downloadFile`, {
    method: 'POST',
    body: params.fileDTOList,
    responseType: 'blob',
  });
}
// 一般采购结果查询列表
// 一般采购结果详情页保存
export async function saveNormalPurchaseResultDetail(params) {
  return cusRequest(`${prefix}/cmhk-pr-fourth-heads/resultSave`, {
    method: 'POST',
    body: params,
  });
}

// 一般结果小页面查询接口
export async function getResultModal(params) {
  return cusRequest(`${prefix}/cmhk-pr-fourth-heads/resultSave/browser/${params.proCode}`, {
    method: 'GET',
  });
}

// 简易采购结果小页面查询接口
export async function getResultModalEasy(params) {
  return cusRequest(`${prefix}/cmhk-pr-fourth-heads/briefInquiry/browser/${params.proCode}`, {
    method: 'GET',
  });
}
// 结果起草查询列表
export async function queryDraftList(params) {
  return cusRequest(`${prefix}/pr-third-result-drafts/thirdWithPackeglist`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(params)),
  });
}
// 查询综合评分汇总
export async function getViCoScSu(params) {
  return cusRequest(`/bidding/v1/${organizationId}/bid-suppliers/getComprehensiveScoreList/${params.proId}`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(params)),
  });
}

/**
 * 基本信息查询
 * */

export async function getBasicInfo(params) {
  return cusRequest(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/purchaseResult`, {
    method: 'GET',
    query: params,
  });
}

// 报价模式
export async function fetchPricingList(params) {
  const query = parseParameters(params);
  return cusRequest(`${SRM_BID}/v1/${organizationId}/bid-pro-price-configs/view`, {
    method: 'GET',
    query,
  });
}

// 查询纪要信息
export async function getDecisionInformation(params) {
  return cusRequest(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/getProInfoDetail`, {
    method: 'GET',
    query: params
  });
}

// 全部报价轮次导出
export async function getExportPriceAll(params) {
  return cusRequest(`${prefix}/pr-third-heads/getPrThirdAllQuotationList2/quotationAllExport`, {
    method: 'GET',
    query: params,
    responseType: 'blob',
  });
}

// 全部100万报价轮次导出
export async function getExportPriceAllBid(params) {
  return cusRequest(`/bidding/v1/${organizationId}/bid-pro-price-configs/view/getBidAllQuotationList/bidProPriceAllExport`, {
    method: 'GET',
    query: params,
    responseType: 'blob',
  });
}

// 保存决策信息
export async function saveDecisionInfo(params) {
  return cusRequest(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/saveProDecisionInfo`, {
    method: 'POST',
    body: params.basicsInfo,
  });
}
