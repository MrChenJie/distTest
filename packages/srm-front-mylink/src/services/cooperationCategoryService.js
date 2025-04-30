import cusRequest from '_cus_utils/request';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';
import { SRM_MYLINK } from '@/utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 合作伙伴列表查询
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-type-update/search`, {
    method: 'GET',
    query,
  });
}

/**
 * 合作伙伴列表新增
 */
export async function add(params) {
  return cusRequest(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-type-update/add/${params.id}`, {
    method: 'GET',
  });
}

/**
 * 合作伙伴列表保存
 */
export async function saveInfo(params) {
  return cusRequest(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-type-update/info/save`, {
    method: 'POST',
    body: params
  });
}


/**
 * 合作伙伴详情查询
 */
export async function getQueryBasicName(params) {
  return cusRequest(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-type-update/info/${params}`, {
    method: 'GET',
  });
}

/**
 * 合作伙伴列表删除
 */
export async function deleteLine(params) {
  return cusRequest(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-type-update/batchDelete`, {
    method: 'DELETE',
    body: params
  });
}

/**
 * 合作伙伴列表删除
 */
export async function deleteTradeLine(params) {
  return cusRequest(`${SRM_MYLINK}/v1/${organizationId}/cmhk-mylink/partner-type-update/info/attachment/${params.partnerId}`, {
    method: 'DELETE',
    body: params.deleteData
  });
}