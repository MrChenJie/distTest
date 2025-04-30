import request from '_cus_utils/request';
import { SRM_DICT } from '@/utils/config';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 合作伙伴信息更新列表
export async function queryPartnerInfoUpdateList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_DICT}/v1/${organizationId}/partner-edit-records/getPartnerEditRecord`, {
    method: 'GET',
    query,
  });
}

// 删除选中合作伙伴
export async function deletePartnerInfo(payload) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-edit-records`, {
    method: 'DELETE',
    body: payload,
  });
}

// 基本信息查询
export async function queryPartnerBaseData(payload) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-edit-records/${payload.editRecordId}`, {
    method: 'GET',
  });
}

// 基本信息保存
export async function savePartnerBaseData(payload) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-edit-records`, {
    method: 'POST',
    body: payload,
  });
}

// 联系人信息查询
export async function queryContactInfo(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_DICT}/v1/${organizationId}/partner-contact-drafts`, {
    method: 'GET',
    query,
  });
}

// 联系人信息保存
export async function saveContactInfo(payload) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-contact-drafts`, {
    method: 'POST',
    body: payload,
  });
}

// 联系人信息删除
export async function delContactInfo(payload) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-contact-drafts`, {
    method: 'DELETE',
    body: payload,
  });
}

// 客户信息查询
export async function queryCustomerInfo(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_DICT}/v1/${organizationId}/partner-customer-drafts`, {
    method: 'GET',
    query,
  });
}

// 客户信息保存
export async function saveCustomerInfo(payload) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-customer-drafts`, {
    method: 'POST',
    body: payload,
  });
}

// 客户信息删除
export async function delCustomerInfo(payload) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-customer-drafts`, {
    method: 'DELETE',
    body: payload,
  });
}

// 信息化项目查询
export async function queryProjectInfo(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_DICT}/v1/${organizationId}/partner-we-drafts`, {
    method: 'GET',
    query,
  });
}

// 信息化项目保存
export async function saveProjectInfo(payload) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-we-drafts`, {
    method: 'POST',
    body: payload,
  });
}

// 信息化信息删除
export async function delProjectInfo(payload) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-we-drafts`, {
    method: 'DELETE',
    body: payload,
  });
}

// 附件信息查询
export async function queryFiles(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_DICT}/v1/${organizationId}/partner-file-drafts`, {
    method: 'GET',
    query,
  });
}

// 附件信息保存
export async function saveFiles(payload) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-file-drafts`, {
    method: 'POST',
    body: payload,
  });
}

// 附件信息删除
export async function delFiles(payload) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-file-drafts`, {
    method: 'DELETE',
    body: payload,
  });
}

// 财务信息查询
export async function queryFinance(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_DICT}/v1/${organizationId}/partner-fin-cond-drafts`, {
    method: 'GET',
    query,
  });
}

// 财务信息保存
export async function saveFinance(payload) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-fin-cond-drafts`, {
    method: 'POST',
    body: payload,
  });
}

// 财务信息删除
export async function delFinance(payload) {
  return request(`${SRM_DICT}/v1/{organizationId}/partner-fin-cond-drafts`, {
    method: 'DELETE',
    body: payload,
  });
}

// 获取合作模式列表
export async function getCooperationMode(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-infos/queryLovViewInfo`, {
    method: 'GET',
    query: params,
  });
}
