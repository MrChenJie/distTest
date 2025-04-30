import cusRequest from '_cus_utils/request';
import { filterNullValueObject, getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `/cmhk-purchase-requisition/v1/${organizationId}`;

// 转售采购列表查询接口
// export async function queryPurchaseInquiryList(params) {
//   return cusRequest(`${prefix}/ict-pr-detail-heads`, {
//     method: 'GET',
//     query: parseParameters(filterNullValueObject(params)),
//   });
// }

// 导出接口
// export async function exportPurchaseInquiryList(params) {
//   return cusRequest(`${prefix}/ict-pr-detail-heads`, {
//     method: 'POST',
//     body: params.form,
//     responseType: 'blob',
//   });
// }

// ICT采购详情
export async function editPurchaseResultApplication(params) {
  return cusRequest(`${prefix}/ict-pr-detail-heads/detail`, {
    method: 'GET',
    query: params
  })
}

// ICT采购结果申请单新增或者变更接口/v1/{organizationId}/ict-pr-detail-heads
export async function addPurchaseResultApplication(params) {
  return cusRequest(`${prefix}/ict-pr-detail-heads`, {
    method: 'POST',
    body: params
  })
}
// ICT采购结果物料表新增或变更接口/v1/{organizationId}/ict-pr-detail-mats
export async function addPurchaseResultMaterial(params) {
  return cusRequest(`${prefix}/ict-pr-detail-mats`, {
    method: "POST",
    body: params
  })
}

// ICT采购附件信息接口
export async function addPurchaseResultAttach(params) {
  return cusRequest(`${prefix}/ict-pr-attachs`, {
    method: "POST",
    body: params
  })
}
// ICT采购结果单号信息
export async function queryPurchaseResult(params) {
  return cusRequest(`${prefix}/ict-pr-detail-heads/getUserInfo`, {
    method: "GET",
    query: filterNullValueObject(params)
  })
}

// ICT物料删除接口
export async function delMaterials(params) {
  return cusRequest(`${prefix}//ict-pr-detail-mats/del`, {
    method: "GET",
    query: params
  })
}

// ICT附件删除接口
export async function delAttachs(params) {
  return cusRequest(`${prefix}//ict-pr-attachs/del`, {
    method: "GET",
    query: params
  })
}




