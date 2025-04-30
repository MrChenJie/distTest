/*
 * contractNoticesService - 协议拟制service
 * @date: 2019-05-15
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  getResponse,
} from 'utils/utils';
import { SRM_BID, SRM_QJC } from '@/common/config'
const organizationId = getCurrentOrganizationId();

/**
 * -查询公告信息
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryList(params) {
  // const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_QJC}/v1/bid-notices/select`, {
    method: 'POST',
    body: params,
  });
}