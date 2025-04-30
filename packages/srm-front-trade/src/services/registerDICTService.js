import request from '_cus_utils/request';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';

const SRM_TRADE = '/dict';
// 查询tokens
export async function getToken() {
  return request(
    `/oauth/oauth/token?client_id=cmhk-partner&client_secret=secret&grant_type=client_credentials`,
    {
      method: 'POST',
    }
  );
}
// 查询固定值集
export async function queryLovData(params) {
  return request(`/mylink-portal/mylink/queryLovValueLang`, {
    method: 'GET',
    query: params,
  });
}

// 查询值集视图
export async function queryLovViewInfo(params) {
  return request(`/mylink-portal/mylink/queryLovViewInfo`, {
    method: 'GET',
    query: params,
  });
}

//文件上传
export async function uploadFile(params) {
  return request(`/mylink-portal/mylink/uploadFile`, {
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
  return request(`${SRM_TRADE}/v1/0/partner-infos/publicRegister`, {
    headers: {
      Authorization: `bearer ${params.access_token}`,
    },
    method: 'POST',
    body: params,
  });
}
