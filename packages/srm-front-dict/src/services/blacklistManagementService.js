import request from '_cus_utils/request';
import { SRM_DICT } from '@/utils/config';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询列表数据
 * @param params
 * @returns {Promise<void>}
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_DICT}/v1/${organizationId}/black-lists`, {
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
 * 查询基本信息
 * @param params
 * @returns {Promise<void>}
 */
export async function queryDetail(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/black-lists/${params.id}`, {
    method: 'GET',
  });
}

/**
 * 查询基本信息
 * @param params
 * @returns {Promise<void>}
 */
export async function queryBasic(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/partner-infos/${params.id}`, {
    method: 'GET',
  });
}


/**
 * 保存合作模式基本信息
 * @param params
 * @returns {Promise<void>}
 */
export async function saveInfo(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/black-lists`, {
    method: 'POST',
    body: params,
  });
}


/**
 * 删除
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteLines(params) {
  return request(`${SRM_DICT}/v1/${organizationId}/black-lists`, {
    method: 'DELETE',
    body: params.blacklist,
  });
}

