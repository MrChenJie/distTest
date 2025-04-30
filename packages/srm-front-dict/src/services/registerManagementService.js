import request from '_cus_utils/request';
import { SRM_DICT } from '@/utils/config';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询报名信息列表数据
 * @param params
 * @returns {Promise<void>}
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_DICT}/v1/${organizationId}/partner-infos/registrationInfo`, {
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
 * 查询报名信息-基本信息
 * @param params
 * @returns {Promise<void>}
 */
export async function queryDetail(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-mode-notices/${params.id}`, {
    method: 'GET',
  });
}

/**
 * 查询报名信息-附件详情
 * @param params
 * @returns {Promise<void>}
 */
export async function queryListDetail(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_DICT}/v1/${organizationId}/cmhk-act-mats`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存报名信息基本信息
 * @param params
 * @returns {Promise<void>}
 */
export async function saveCooperationModeInfo(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-mode-notices`, {
    method: 'POST',
    body: filterNullValueObject(params),
  });
}

/**
 * 保存报名信息附件信息
 * @param params
 * @returns {Promise<void>}
 */
export async function saveAttachmentInfo(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/cmhk-act-mats`, {
    method: 'POST',
    body: params.list,
  });
}

/**
 * 删除报名信息附件信息
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteAttachmentLine(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/cmhk-act-mats`, {
    method: 'DELETE',
    body: params,
  });
}

// 合作伙伴列表
export async function queryPartnerListData(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-infos/selectRegistrationInfo`, {
    method: 'GET',
    query: params,
  });
}

// 合作伙伴文件列表
export async function queryPartnerFileData(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-files/selectPartnerFiles/${params.partnerId}`, {
    method: 'GET',
    query: params,
  });
}

// 评委抽取
export async function getPartnerJudges(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-judges/getPartnerJudges`, {
    method: 'POST',
    body: params,
  });
}

// 发起抽取评委流程审批
export async function submitApplyJudges(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-judges/submitApplyJudges`, {
    method: 'POST',
    body: params,
  });
}

// 重新抽取评委
export async function resetPartnerJudge(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-judges/resetPartnerJudge`, {
    method: 'POST',
    body: params,
  });
}

// 导出
export async function dataExport(payload) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-judges/exportPartnerJudgeList`, {
    method: 'POST',
    body: payload,
    responseType: 'blob',
  });
}
