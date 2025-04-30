/*
 * SignUpNowService - 协议拟制service
 * @date: 2022-04-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_BID } from '@/common/config';
import { getCurrentOrganizationId } from 'utils/utils';
const organizationId = getCurrentOrganizationId();

/**
 * -查询公告信息
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function getNoticeDetail(params) {
  // const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-notices/select`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 立即报名
 */
export async function goToSignUp(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-supplier-processs/apply`, {
    method: 'POST',
    body: params,
  });
}
