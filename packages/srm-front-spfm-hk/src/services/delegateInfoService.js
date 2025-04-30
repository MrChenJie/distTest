import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function fetchData(params) {
  const query = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/scm-delegate-infos/query-delegate-info`, {
    method: 'GET',
    query,
  });
}

// 推送失败，重新推送EBS
// POST /v1/{organizationId}/estimate-batchs/reImportEbs
// export async function newPushEBS(params) {
//   return request(`${SRM_PLATFORM}/v1/${organizationId}/estimate-batchs/reImportEbs`, {
//     method: 'POST',
//     body: params,
//   });
// }

// 同步待办代理信息
// POST /v1/{organizationId}/scm-delegate-infos/syncEipDelegateAllInfo
export async function syncDelegateInfo(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/scm-delegate-infos/syncEipDelegateAllInfo`, {
    method: 'POST',
    body: params,
    responseType: 'text',
  });
}
