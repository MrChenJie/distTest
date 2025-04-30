/**
 * @Description: 供应商Site分配 service
 * @date 2021-04-12
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2021, Hand
 */

import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import {
  getCurrentOrganizationId,
  filterNullValueObject,
  parseParameters,
  isTenantRoleLevel,
} from 'utils/utils';

const organizationId = getCurrentOrganizationId();

//
export async function queryData(payload) {
  const param = filterNullValueObject(parseParameters(payload));
  return request(
    `${SRM_PLATFORM}/v1${isTenantRoleLevel() ? `/${organizationId}` : ``}/sup-ext-supplier-ifs`,
    {
      method: 'GET',
      query: param,
    }
  );
}

// 	/v1/{organizationId}/sup-ext-supplier-ifs/push
export async function pushEBS(payload) {
  return request(
    `${SRM_PLATFORM}/v1${
      isTenantRoleLevel() ? `/${organizationId}` : ``
    }/sup-ext-supplier-ifs/push`,
    {
      method: 'GET',
      query: payload,
    }
  );
}
