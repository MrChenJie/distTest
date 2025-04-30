import request from '_cus_utils/request';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const SRM_TRADE='/mylink-portal'
// 查询tokens
export async function getToken() {
  return request(`/oauth/oauth/token?client_id=cmhk-partner&client_secret=secret&grant_type=client_credentials`, {
    method: 'POST',
  });
}
// 查询固定值集
export async function queryLovData(params) {
  return request(`${SRM_TRADE}/mylink/queryLovValueLang`, {
    method: 'GET',
    query: params,
  });
}

// 查询值集视图
export async function queryLovViewInfo(params) {
  return request(`${SRM_TRADE}/mylink/queryLovViewInfo`, {
    method: 'GET',
    query: params,
  });
}


export async function uploadFile(params) {
  return request(`${SRM_TRADE}/mylink/uploadFile`, {
    headers: {
      Authorization: `bearer ${params.accessToken}`
    },
    method: 'POST',
    responseType: 'text',
    body:params.formData,
  });
}

//注册
export async function register(params) {
  return request(`${SRM_TRADE}/mylink/signUp`, {
    headers: {
      Authorization: `bearer ${params.access_token}`
    },
    method: 'POST',
    body: params,
  });
}

