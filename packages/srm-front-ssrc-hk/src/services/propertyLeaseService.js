
import request from '_cus_utils/request';
// import { SRM_TRADE } from '@/utils/config';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import { param } from 'jquery';

const organizationId = getCurrentOrganizationId();
const SRM_PR_CENTER='/cmhk-pr-center'

// 查询物业租赁列表
export async function queryLeaseList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/cmhk-lease-apply-heads`, {
    method: 'GET',
    query,
  });
}

// 门店列表查询接口
export async function queryStoreList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/cmhk-lease-store-heads`, {
    method: 'GET',
    query,
  });
}

// 查询门店历史数据
export async function queryHistoryStore(params) {
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/cmhk-lease-apply-heads/getLeaseInfo`, {
    method: 'GET',
    query: params,
  });
}

// 查询物业租赁申请单详情
export async function queryLeaseDetail(params) {
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/cmhk-lease-apply-heads/${params.laNumber}`, {
    method: 'GET',
  });
}


// 查询门店信息详情
export async function queryStoreDetail(params) {
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/cmhk-lease-store-heads/${params.storeNumber}`, {
    method: 'GET',
  });
}


// 新增保存物业租赁申请单信息
export async function submitPropertyLeaseInfo(params) {
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/cmhk-lease-apply-heads`, {
    method: 'POST',
    body: params.data,
  });
}

// 门店新增
export async function submitStoreInfo(params) {
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/cmhk-lease-store-heads`, {
    method: 'POST',
    body: params.data,
  });
}



// 删除物业租赁申请单 草稿 信息
export async function deleteLeaseLine(params) {
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/cmhk-lease-apply-heads`, {
    method: 'DELETE',
    body: params,
  });
}

// 门店信息删除接口 草稿 
export async function deleteStoreLine(params) {
  return request(`${SRM_PR_CENTER}/v1/${organizationId}/cmhk-lease-store-heads`, {
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
  return request(`${SRM_PR_CENTER}/v1/30000001/pr-apply-detail-heads/getUserUnit`, {
    method: 'GET',
    query: params,
  });
}
