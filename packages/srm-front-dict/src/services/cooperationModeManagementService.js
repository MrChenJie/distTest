import request from '_cus_utils/request';
import { SRM_DICT } from '@/utils/config';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询合作模式列表数据
 * @param params
 * @returns {Promise<void>}
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_DICT}/v1/${organizationId}/partner-mode-notices/getModeList`, {
    method: 'GET',
    query,
  });
}

/**
 * 删除草稿数据
 * @param params
 * @returns {Promise<void>}
 */
// export async function deleteLine(params) {
//   return request(`${SRM_DICT}/v1/${organizationId}/cmhk-act-heads`, {
//     method: 'DELETE',
//     body: params,
//   });
// }

/**
 * 查询合作模式-基本信息
 * @param params
 * @returns {Promise<void>}
 */
export async function queryDetail(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-mode-notices/${params.id}`, {
    method: 'GET',
  });
}

/**
 * 查询合作模式-附件详情
 * @param params
 * @returns {Promise<void>}
 */
export async function queryAttachmentInfo(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_DICT}/v1/${organizationId}/mode-notice-files`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存合作模式基本信息
 * @param params
 * @returns {Promise<void>}
 */
export async function saveCooperationModeInfo(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-mode-notices`, {
    method: 'POST',
    body: params.data,
  });
}

/**
 * 保存合作模式附件信息
 * @param params
 * @returns {Promise<void>}
 */
export async function saveAttachmentInfo(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/mode-notice-files`, {
    method: 'POST',
    body: params.attachment,
  });
}

/**
 * 删除合作模式附件信息
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteAttachmentLine(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/mode-notice-files`, {
    method: 'DELETE',
    body: params.attachment,
  });
}

/**
 * 失效合作模式
 * @param params
 * @returns {Promise<void>}
 */
export async function expirePartnerMode(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-mode-notices/expirePartnerMode`, {
    method: 'POST',
    body: params.expireData,
  });
}
