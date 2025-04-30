import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_SPCM, SRM_SPUC } from '_utils/config';

// const SRM_SPCM = '/spcm-22192';
const organizationId = getCurrentOrganizationId();
const spucV1 = `${SRM_SPUC}/v1/${organizationId}`;

/**
 * -查询列表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/purchase-Report/page`, {
    query,
  });
}

/**
 * 转售详情页 - 申请人变更查询编辑权限
 */
export async function queryEmployeeFlag(param, costRequestId) {
  return request(`${spucV1}/resale-payment-requests/getEditPayOwner/${costRequestId}`, {
    method: 'GET',
    query: param,
  }).then((res) => res);
}
