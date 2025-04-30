/*
 * BidWinningResultService - 协议拟制service
 * @date: 2022-04-20
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_BID } from '@/common/config';

import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';
import cusRequest from '_cus_utils/request';
const organizationId = getCurrentOrganizationId();

/**
 * 基本信息查询
 * */

export async function getBasicInfo(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/purchaseResult`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 表信息查询
 */
export async function getTableInfo(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/purchaseResultSupplier`, {
    method: 'GET',
    query,
  });
}

/**
 * 邮件模板的预览
 */
export async function getTableEmailInfo(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/purchaseResultMail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存
 */
export async function saveInfo(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/purchaseResultSave`, {
    method: 'POST',
    body: params.basicsInfo,
  });
}

/**
 * 保存后显示决策内容
 */
export async function getDecision(params) {
  return request(
    `${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/decisionContent/${params.proId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 保存后发起mip审批
 */
export async function approvalProcess(params) {
  return request(`${SRM_BID}/v1/${organizationId}/approval_process/${params.requestId}`, {
    method: 'GET',
  });
}

/**
 * 获取物料名称
 */
export async function getMaterialName(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/examineMaterialName`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存物料名称
 */
export async function saveMaterial(params) {
  return cusRequest(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/saveMaterialName`, {
    method: 'POST',
    body: params.paramsData,
  });
}

/**
 * 获取预算信息
 */
export async function getImproveMaterial(params) {
  return request(
    `${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/lookComMaterialBudInfor/${params.proId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 单独保存采购结果
 */
export async function saveOnlyResult(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/saveSupplierInfo`, {
    method: 'POST',
    body: params.dataList,
  });
}

/**
 * 清除物料可用数量
 */
export async function delMaterial(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/clearMaterialName`, {
    method: 'DELETE',
    query: params,
  });
}

/**
 * 保存预算信息
 */
export async function saveImproveMaterial(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/addComMaterialBudInfor`, {
    method: 'POST',
    body: params.improveMaterialList,
  });
}

/**
 * 查询预算信息
 */
export async function getBudgetInfor(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/bidComMaterialBudInfoClassify/${params.proId}`,
    {
      method: 'GET',
      query,
    }
  );
}

// 检验金额
export async function getPriceValidate(params) {
  return request(`/cmhk-synch-job/procurement/api/checkBudAmount`, {
    method: 'POST',
    body: params,
  });
}

// 查询总的项目名称
export async function getProjectName(params) {
  const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`/cmhk-synch-job/procurement/api/getProjectInfoFromPccw`, {
    method: 'GET',
    query,
  });
}

// 项目变更管理
export async function projectEditName(params) {
  const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`/cmhk-pr-center/v1/${organizationId}/pr-project-changes/changeProject`, {
    method: 'POST',
    body: query,
  });
}

// 报价模式
export async function fetchPricingList(params) {
  const query = parseParameters(params);
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-price-configs/view/getBidAllQuotationList`, {
    method: 'GET',
    query,
  });
}

// 最终轮报价详细数据查询
export async function getDudgetDetailList(params) {
  const query = parseParameters(params);
  return request(
    `${SRM_BID}/v1/${organizationId}/bid-collect-art-grade/getSupplierQuoteByProId?proId=${query.proId}`,
    {
      method: 'GET',
      query,
    }
  );
}

// 保存新增的物料
export async function saveEditMat(params) {
  return cusRequest(`${SRM_BID}/v1/${organizationId}/bid-pro-price-configs`, {
    method: 'POST',
    body: params
  });
}

// 查询纪要信息
export async function getDecisionInformation(params) {
  return cusRequest(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/getProInfoDetail`, {
    method: 'GET',
    query: params
  });
}

// 查询项目Id
export async function getProjectId(params) {
  return cusRequest(`/cmhk-pr-center/v1/${organizationId}/cmhk-pr-fourth-heads/ppNumber`, {
    method: 'POST',
    body: params
  });
}