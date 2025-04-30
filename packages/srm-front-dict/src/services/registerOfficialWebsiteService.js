import request from '_cus_utils/request';
import { SRM_DICT } from '@/utils/config';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询官网注册列表数据
 * @param params
 * @returns {Promise<void>}
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_DICT}/v1/${organizationId}/partner-register-records/registrationList`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询官网注册详情-基本信息
 */
export async function getBasicInfo(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-register-records/registrationDetail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询官网注册详情-附件信息
 */
export async function getAttachmentInfo(params) {
  return request(
    `${SRM_DICT}/v1/${organizationId}/partner-register-records/registrationDetail/file`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 获取DICT合作伙伴报名注册的邮件模板
 */
export async function getRegisteTemplate(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-register-records/getRegisterRecordEmail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存报名注册邮件信息
*/
export async function saveRegisteInfo(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/refuse-records`, {
    method: 'POST',
    body: [params],
  });
}

/**
 * 发送合作伙伴报名注册的邮件
*/
export async function sendRegisteEmail(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-register-records/sendRegisterRmail/${params.refuseRecordId}`, {
    method: 'GET',
  });
}

/**
 * 查询报名注册历史邮件信息
*/
export async function getRegisteHistoryEmail(params) {
  const query = parseParameters(params);
  return request(`${SRM_DICT}/v1/${organizationId}/partner-register-records/registerRecordMail/${params.registerRecordId}`, {
    method: 'GET',
    query: {
      page: query.page,
      size: query.size,
    },
  });
}