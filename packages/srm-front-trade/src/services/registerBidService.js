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
  return request(`/mylink-portal/mylink/queryLovData`, {
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

// 获取所有币种
export async function getAllCurrencyCode(params) {
  const query = parseParameters(params.infos);
  return request(`/srm-portal/v1/0/bid-suppliers/selectCurrency`, {
    method: 'GET',
    headers: params.headers,
    query,
  });
}

// 公告报名页面根据币种获取汇率
export async function getScaleByCurrency(params) {
  return request(`/srm-portal/v1/0/bid-suppliers/selectExchange`, {
    method: 'GET',
    query: params.infos,
    headers: params.headers,
  });
}
// 获取内容
export async function getBidNotice(params) {
  return request(`/srm-portal/v1/bid-notices/select?noticeId=${params.noticeId}`, {
    method: 'GET',
    headers: {
      Authorization: `bearer ${params.accessToken}`
    },
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
  return request(`/srm-portal/v1/bid-notices/apply`, {
    headers: {
      Authorization: `bearer ${params.access_token}`,
    },
    method: 'POST',
    body: params,
  });
}
