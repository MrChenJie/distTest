/*
 * purchaseOrderService - 协议拟制service
 * @date: 2022-06-13
 * @author: 36765
 */
import request from 'utils/request';
import { SRM_SPUC } from '@/common/config';

import { getCurrentOrganizationId } from 'utils/utils';
const organizationId = getCurrentOrganizationId();

// MIP保存 /v1/{organizationId}/po-headerss/savePOInfo
export function savePoInfo(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-headerss/savePOInfo`, {
    method: 'POST',
    body: params,
  });
}

// 查询是否需要创建审批流
export function checkNeedCreateMipProcess(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/approval-req-maps/checkNeedCreateMipProcess?poHeaderId=${params.poHeadersId}`,{
    method: 'GET',
  });
}

// MIP提交 /v1/{organizationId}/po-headerss/submitPo
export async function submitPo(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-headerss/submitPo`, {
    method: 'GET',
    body: params,
  });
}

export function saveOrderGroup(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/spuc-po-order-teams`, {
    method: 'POST',
    body: params.data,
  });
}

export function fetchOrderGroup(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/spuc-po-order-teams`, {
    method: 'GET',
    query: params,
  });
}

// MIP会签
export function submitPreCheck(params) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/resale-payment-requests/submit-pre-check/${params.costRequestId}`,
    {
      method: 'GET',
    }
  );
}
