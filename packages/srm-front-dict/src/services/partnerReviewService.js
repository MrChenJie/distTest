import request from '_cus_utils/request';
import { SRM_DICT } from '@/utils/config';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import { query } from 'hzero-front/lib/services/user';

const organizationId = getCurrentOrganizationId();

/**
 * 查询合作伙伴基本信息
 */
export async function getPartnerInfo(params) {
  const { partnerId } = params;
  return request(`${SRM_DICT}/v1/${organizationId}/partner-infos/${partnerId}`, {
    method: 'GET',
  });
}

/**
 * 查询联系人信息
 */
export async function getContactInfo(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-contacts`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询客户资料
 */
export async function getCustomersInfo(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-customers`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询财务信息
 */
export async function getFinancialInfo(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-fin-conds`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询公司附件
 */
export async function getAttachmentInfo(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-files`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询信息化项目经验
 */
export async function getProjectInfo(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-wes`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询评委评分
 */
export async function getScoreInfo(params) {
  const { partnerId } = params;
  return request(`${SRM_DICT}/v1/${organizationId}/rating-scores/rating-item/${partnerId}`, {
    method: 'GET',
  });
}

/**
 * 保存评委评分
 */
export async function saveScoreInfo(params) {
  const { partnerId, data } = params;
  return request(`${SRM_DICT}/v1/${organizationId}/rating-scores/${partnerId}`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 提交评委评分
 */
export async function submitScoreInfo(params) {
  const { partnerId, data } = params;
  return request(`${SRM_DICT}/v1/${organizationId}/rating-scores/submit/${partnerId}`, {
    method: 'POST',
    body: data,
  });
}



/**
 * 获取合作伙伴拒绝邮件模板
 */
export async function getRefuseEmail(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/refuse-records/getPartnerRefuseEmail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 发送合作伙伴拒绝邮件
 */

export async function sendRefuseRmail(params) {
  const { refuseRecordId } = params;
  return request(
    `${SRM_DICT}/v1/${organizationId}/refuse-records/sendRefuseRmail/${refuseRecordId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 保存拒绝邮件信息
 */

export async function saveRefuseRmail(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/refuse-records`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 合作伙伴详情查询接口--评委评审时用
 */
export async function getJudgePartnerInfo(params) {
  const { partnerId } = params;
  return request(
    `${SRM_DICT}/v1/${organizationId}/partner-infos/getJudgePartnerInfo/${partnerId}`,
    {
      method: 'GET',
    }
  );
}
