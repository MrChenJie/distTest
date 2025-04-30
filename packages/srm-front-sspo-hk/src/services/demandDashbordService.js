/*
 * projectQaService - 需求人工作台service
 * @date: 2022-04-15
 * @author: CJ <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters
} from 'utils/utils';

import { SRM_BID } from '@/common/config';
const organizationId = getCurrentOrganizationId();

// 需求人工作台列表数据
export async function getFetchList(params) {
  const query = parseParameters(params); 
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/demand/platform`, {
    method: 'GET',
    query,
  });
}
