import request from '_cus_utils/request';

import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';

const organizationId = getCurrentOrganizationId();
const SRM_MyLink='mylink'
/**
 *  合作伙伴列表查询
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`/${SRM_MyLink}/v1/${organizationId}/qas`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询合作伙伴基本信息
 */
export async function getPartnerInfo(params) {
  return request(`/${SRM_MyLink}/v1/${organizationId}/qas/partnerInfo`, {
    method: 'GET',
    query: params,
  });
}


/**
 *  合作伙伴问题及答复查询
 */
export async function queryQAList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`/${SRM_MyLink}/v1/${organizationId}/qas/qaAnswer`, {
    method: 'GET',
    query,
  });
}


/**
 *  答复保存
 */
export async function saveQAList(params) {
  return request(`/${SRM_MyLink}/v1/${organizationId}/qa-answers/save`, {
    method: 'POST',
    body:params,
  });
}



/**
 *  答复提交
 */
export async function subQAList(params) {
  return request(`/${SRM_MyLink}/v1/${organizationId}/qa-answers/submit`, {
    method: 'POST',
    body:params,
  });
}
