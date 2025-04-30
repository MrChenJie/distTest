import request from '_cus_utils/request';
import { SRM_DICT } from '@/utils/config';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询报名信息列表数据
 * @param params
 * @returns {Promise<void>}
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_DICT}/v1/${organizationId}/judges/selectJudges`, {
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
 * 保存评委组
 * @param params
 * @returns {Promise<void>}
 */
export async function savejudgeGroups(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/judge-groups`, {
    method: 'POST',
    body: params.judgeGroup,
  });
}

/**
 * 保存报名信息基本信息
 * @param params
 * @returns {Promise<void>}
 */
export async function saveJudges(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/judges`, {
    method: 'POST',
    body: params.judges,
  });
}


/**
 * 删除评委信息
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteJudgesLine(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/judges`, {
    method: 'DELETE',
    body: params.judges,
  });
}

