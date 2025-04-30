import cusRequest from '_cus_utils/request';
import request from '../utils/request';
import { SRM_SSRC, SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 请求api前缀
// const prefix = `${SRM_SSRC}/v1/${organizationId}`;
const prefix = `/cmhk-pr-center/v1/${organizationId}`;
// /cmhk-supplier

// 查询采购申请列表数据
export async function queryPurchaseApplicationList(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/queryList`, {
    method: 'GET',
    query: parseParameters(filterNullValueObject(params)),
  });
}

// 新增-保存流程接口
export async function addPurchaseApplicationList(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/save`, {
    method: 'POST',
    body: params,
  });
}

// 采购申请-删除
export async function delPurchaseApplicationList(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/batchDelete`, {
    method: 'GET',
    query: params,
  });
}

// 点击采购申请编号查看详情
export async function getPurchaseApplicationDetail(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/${params.id}`, {
    method: 'GET',
  });
}

export async function getPurchaseApplicationDetailIndex(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/${params}`, {
    method: 'GET',
    query: params,
  });
}

export async function getPurchaseApplicationRate(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/getRate`, {
    method: 'GET',
    query: params,
  });
}

// 采购申请-导出
export async function exportPurchaseApplicationDetail(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/export`, {
    method: 'GET',
    query: params,
  });
}

// 采购申请-申请人部门赋值默认值
export async function getUserUnit(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/getUserUnit`, {
    method: 'GET',
    query: params,
  });
}

// 提交按钮
export async function approvePurchaseApplicationList(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/approve`, {
    method: 'POST',
    body: params,
  });
}

// 查询需求人部门
export async function getApplier(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/getEmp`, {
    method: 'GET',
    query: params,
  });
}

// 查询需求人部门
export async function getApplyDept(params) {
  return cusRequest(`${prefix}/pr-apply-detail-heads/getEmpDept`, {
    method: 'GET',
    query: params,
  });
}

// 框架子订单保存
export async function handleSaveOrder(params) {
  return cusRequest(`${prefix}/pr-apply-detail-sons/save`, {
    method: 'POST',
    body: params,
  });
}

// 框架子订单查询
export async function handleDetailInfomation(params) {
  return cusRequest(`${prefix}/pr-apply-detail-sons/select/${params.id}`, {
    method: 'GET',
  });
}

// 框架子订单查询供应商信息
export async function handleSupplierInfo(params) {
  return cusRequest(`/cmhk-supplier/v1/${organizationId}/cmhk-supplier/supplier/search`, {
    method: 'GET',
    query: params,
  });
}

// 查询项目id接口
export async function getProjectId(params) {
  return cusRequest(`/cmhk-pr-center/v1/${organizationId}/pr-apply-detail-heads/getProjectIdByCode`, {
    method: 'GET',
    query: params,
  });
}

// 旧PO查询的采购类别
export async function getPurchasingCategory(params) {
  return cusRequest(`/cmhk-pr-center/v1/${organizationId}/pr-apply-detail-sons/selectPrTypeByItemNumber`, {
    method: 'GET',
    query: params,
  });
}

// 查询总的项目名称
export async function getProjectName(params) {
  const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`/cmhk-synch-job/procurement/api/getProjectInfoFromPccw`, {
    method: 'GET',
    query
  });
}

// 校验子订单金额
export async function getSinglePriceValidate(params) {
  const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`/cmhk-synch-job/procurement/api/checkFrameBudAmount`, {
    method: 'GET',
    query
  });
}

// 查询需求人部门
export async function getUserDepat(params) {
  return cusRequest(`/cmhk-pr-center/v1/${organizationId}/pr-apply-detail-heads/getUnit`, {
    method: 'GET',
    query: params,
  });
}
