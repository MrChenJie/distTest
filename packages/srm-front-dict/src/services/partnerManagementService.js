import request from '_cus_utils/request';
import { SRM_DICT } from '@/utils/config';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 查询合作伙伴入库列表
export async function queryPartnerManagementList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_DICT}/v1/${organizationId}/partner-infos/storage`, {
    method: 'GET',
    query,
  });
}

// 主数据导出
export async function masterDataExport(payload) {
  const query = filterNullValueObject(parseParameters(payload));
  return request(`${SRM_DICT}/v1/${organizationId}/partner-infos/exportMasterData`, {
    method: 'GET',
    query: query,
    responseType: 'blob',
  });
}

// 邀请注册
export async function invitationRegister(payload) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-infos/inviteRegister`, {
    method: 'POST',
    body: payload,
  });
}

// 合作伙伴评分查询
export async function queryScore(payload) {
  return request(`${SRM_DICT}/v1/${organizationId}/rating-items/score/${payload.partnerId}`);
}
