import request from 'utils/request';

export async function fetchList(params = {}) {
  return request(`/spfm/v1/order-types`, {
    method: 'GET',
    query: params,
  });
}

export async function addOrderType(params) {
  return request(`/spfm/v1/order-types`, {
    method: 'POST',
    body: params,
  });
}
