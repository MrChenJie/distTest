/**
 * @Description: IBOSS客商资料创建 - service
 * @date 2022-09-23
 * @author <yuzhang,dong@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
 import request from 'utils/request';
 import { filterNullValueObject } from 'hzero-front/lib/utils/utils';
 import { parseParameters, getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
 import { SRM_PLATFORM } from '_utils/config';
 
 const organizationId = getCurrentOrganizationId();
 
 // 查询：/spfm/v1/{organizationId}/pub-ctl-records/list
 export async function fetchEBSRecord(params) {
   const query = filterNullValueObject(parseParameters(params));
   return request(`${SRM_PLATFORM}/v1${isTenantRoleLevel() ? `/${organizationId}` : ``}/pub-ctl-records/list`, {
     method: 'GET',
     query,
   });
 }
 
 // 重推：/spfm/v1/{organizationId}/pub-ctl-records/repush
 export async function rePush(payload) {
   return request(`${SRM_PLATFORM}/v1${isTenantRoleLevel() ? `/${organizationId}` : ``}/pub-ctl-records/repush`, {
     method: 'POST',
     body: payload,
   });
 }
 
 // 取消：/spfm/v1/{organizationId}/pub-ctl-records/cancel
 export async function cancel(payload) {
   return request(`${SRM_PLATFORM}/v1${isTenantRoleLevel() ? `/${organizationId}` : ``}/pub-ctl-records/cancel`, {
     method: 'POST',
     body: payload,
   });
 }
 
  // 保存：/spfm/v1/{organizationId}/pub-ctl-records
  export async function save(payload) {
    return request(`${SRM_PLATFORM}/v1${isTenantRoleLevel() ? `/${organizationId}` : ``}/pub-ctl-records`, {
      method: 'PUT',
      body: payload,
    });
  }
  