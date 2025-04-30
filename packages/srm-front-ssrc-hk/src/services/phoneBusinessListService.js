/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-12 15:25:44
 * Copyright (c) 2024, All Rights Reserved. 
 */
import request from '_cus_utils/request';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const SRM_PR_CENTER='/cmhk-pr-center'
/**
 * 查询活动数据
 * @param params
 * @returns {Promise<void>}
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/cmhk-act-heads`, {
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
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/cmhk-act-heads`, {
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
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/pr-inventory/getInventoryInfo/${params.id}`, {
    method: 'GET',
  });
}

/**
 * 查询采购详情-销售计划详情
 * @param params
 * @returns {Promise<void>}
 */
export async function querySaleList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/cmhk-act-mats`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询采购详情-采购申请头信息详情
 * @param params
 * @returns {Promise<void>}
 */
export async function queryPurchaseInformationList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/cmhk-act-mats`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存采购详情
 * @param params
 * @returns {Promise<void>}
 */
export async function savePurchaseInfo(params) {
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/pr-inventory/save`, {
    method: 'POST',
    body: filterNullValueObject(params),
  });
}

/**
 * 保存销售计划详情
 * @param params
 * @returns {Promise<void>}
 */
export async function saveSalePlanInfo(params) {
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/cmhk-pr-apply-sales-plans`, {
    method: 'POST',
    body: params.list,
  });
}

/**
 * 删除销售计划详情
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteSalePlanLine(params) {
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/cmhk-pr-apply-sales-plans`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 保存采购申请行信息详情
 * @param params
 * @returns {Promise<void>}
 */
export async function savePurchaseInformationInfo(params) {
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/cmhk-act-mats`, {
    method: 'POST',
    body: params.list,
  });
}

/**
 * 删除采购申请行信息详情
 * @param params
 * @returns {Promise<void>}
 */
export async function deletePurchaseInformationLine(params) {
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/cmhk-act-mats`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询申请人信息
 * @param {*} params 
 * @returns 
 */
export async function getUserUnit(params) {
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/pr-apply-detail-heads/getUserUnit`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询需求人信息
 * @param {*} params 
 * @returns 
 */
export async function getApplier(params) {
  return request(`${SRM_PR_CENTER}/pr-apply-detail-heads/getEmp`, {
    method: 'GET',
    query: params,
  });
}

// 查询需求人部门
export async function getApplyDept(params) {
  return request(`${SRM_PR_CENTER}/pr-apply-detail-heads/getEmpDept`, {
    method: 'GET',
    query: params,
  });
}

//查询物料列表数据
export async function getMaterialsDetail(params) {
  return request(`${SRM_PR_CENTER}/pr-apply-materials/matQueryList`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(params)),
  });
}

//查询销售计划表
export async function querySalePlanList(params) {
  const query = filterNullValueObject(parseParameters(params)); 
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/cmhk-pr-apply-sales-plans`, {
    method: 'GET',
    query,
  });
}

// 旧PO查询的采购类别
export async function getPurchasingCategory(params) {
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/pr-inventory/selectPrType`, {
    method: 'GET',
    query: params,
  });
}

// 查询供应商信息
export async function handleSupplierInfo(params) {
  return request(`/cmhk-supplier/v1/${organizationId}/cmhk-supplier/supplier/search`, {
    method: 'GET',
    query: params,
  });
}

// 查询供应商信息
export async function getPurchaseApplicationRate(params) {
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/pr-apply-detail-heads/getRate`, {
    method: 'GET',
    query: params,
  });
}

// 获取PO编号
export async function getPoNumber(params) {
  const query = filterNullValueObject(parseParameters(params)); 
  return request(`/cmhk-synch-job/procurement/api/getPoInfoFromPccw`, {
    method: 'GET',
    query,
  });
}

// 获取采购计划单
export async function getPlanNameList(params) {
  const query = filterNullValueObject(params);
  return request(`/cmhk-synch-job/procurement/api/getPlanInfo`, {
    method: 'GET',
    query,
  });
}

// 校验品牌各预算金额
export async function checkAmount(params) {
  return request(`/cmhk-synch-job/procurement/api/checkInventoryAmount`, {
    method: 'POST',
    body: params,
  });
}

// 获取物料库存
export async function getItemQty(params) {
  return request(`/cmhk-synch-job/v1/${organizationId}/pccw-pr-order-mats/itemQty/getItemQty`, {
    method: 'GET',
    query: params,
  });
}