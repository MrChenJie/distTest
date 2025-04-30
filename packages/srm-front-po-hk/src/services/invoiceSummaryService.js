import cusRequest from '_cus_utils/request';
import { SRM_SPCM, SRM_SPUC } from '_utils/config';
import { HZERO_FILE } from 'utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询汇总数据
 * @param params
 * @returns {Promise<void>}
 */
export async function queryBillList(params) {
  const query = parseParameters(params);
  return cusRequest(`${SRM_SPCM}/v1/${organizationId}/bill-invoices/listBillInvoice`, {
    method: 'GET',
    query,
  });
}

/**
 * 删除勾选数据
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteBillList(params) {
  return cusRequest(`${SRM_SPCM}/v1/${organizationId}/bill-invoices/deleteList`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 汇总页面附件行查询
 * @param params
 * @returns {Promise<void>}
 */
export async function queryBillFileList(params) {
  const { billInvoiceId } = params;
  const query = parseParameters(params);
  return cusRequest(`${SRM_SPCM}/v1/${organizationId}/bill-invoice-files/file/${billInvoiceId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询详情数据
 * @param params
 * @returns {Promise<void>}
 */
export async function queryInvoiceDetailData(params) {
  const query = parseParameters(params);
  const { billInvoiceId } = query;
  return cusRequest(`${SRM_SPCM}/v1/${organizationId}/bill-invoices/detail/${billInvoiceId}`, {
    method: 'GET',
  });
}

/**
 * 保存详情数据
 * @param params
 * @returns {Promise<void>}
 */
export async function saveInvoiceDetailData(params) {
  return cusRequest(`${SRM_SPCM}/v1/${organizationId}/bill-invoices/save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 提交
 * @param params
 * @returns {Promise<void>}
 */
export async function submitInvoiceDetailData(params) {
  const { billInvoiceId } = params;
  return cusRequest(
    `${SRM_SPCM}/v1/${organizationId}/bill-invoices/submitAndClaimBill/${billInvoiceId}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 账单发票对接信息删除对接人信息
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteDocks(params) {
  const { billInvoiceId, billInvoiceDockingList } = params;
  return cusRequest(
    `${SRM_SPCM}/v1/${organizationId}/bill-invoice-dockings/deleteDocks/?billInvoiceId=${billInvoiceId}`,
    {
      method: 'POST',
      body: billInvoiceDockingList,
    }
  );
}

/**
 * CMI内部批量删除账单发票认领信息
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteClaims(params) {
  const { billInvoiceId, billInvoiceClaimList } = params;
  return cusRequest(
    `${SRM_SPCM}/v1/${organizationId}/bill-invoice-claims/removeList/?billInvoiceId=${billInvoiceId}`,
    {
      method: 'POST',
      body: billInvoiceClaimList,
    }
  );
}

/**
 * 附件行删除
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteFileList(params) {
  const { billInvoiceFileList } = params;
  return cusRequest(`${SRM_SPCM}/v1/${organizationId}/bill-invoice-files/deleteList/`, {
    method: 'POST',
    body: billInvoiceFileList,
  });
}

/**
 * 查询新建认领人信息
 * @param params
 * @returns {Promise<void>}
 */
export async function queryClaimInsert(params) {
  const query = parseParameters(params);
  const { billInvoiceId } = query;
  return cusRequest(
    `${SRM_SPCM}/v1/${organizationId}/bill-invoice-claims/queryClaimInsert/${billInvoiceId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 退回供应商
 * @param params
 * @returns {Promise<void>}
 */
export async function returnSupplier(params) {
  const { billInvoiceId, returnReason } = params;
  return cusRequest(`${SRM_SPCM}/v1/${organizationId}/bill-invoices/return/${billInvoiceId}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 撤销退回供应商
 * @param params
 * @returns {Promise<void>}
 */
export async function cancelReturnSupplier(params) {
  const { billInvoiceId } = params;
  return cusRequest(
    `${SRM_SPCM}/v1/${organizationId}/bill-invoices/revoke-return/${billInvoiceId}`,
    {
      method: 'POST',
    }
  );
}

/**
 * 历史版本记录
 * @param params
 * @returns {Promise<void>}
 */
export async function historyVersion(params) {
  const { billInvoiceId } = params;
  return cusRequest(`${SRM_SPCM}/v1/${organizationId}/bill-invoice-audits/audit/${billInvoiceId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 转办
 * @param params
 * @returns {Promise<void>}
 */
export async function transfer(params) {
  const { billInvoiceId, chooseList } = params;
  return cusRequest(`${SRM_SPCM}/v1/${organizationId}/bill-invoices/transfer/${billInvoiceId}`, {
    method: 'POST',
    body: chooseList,
  });
}

/**
 * 退回认领人
 * @param params
 * @returns {Promise<void>}
 */
export async function returnClaim(params) {
  const { billInvoiceId } = params;
  return cusRequest(
    `${SRM_SPCM}/v1/${organizationId}/bill-invoices/return-claim/${billInvoiceId}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 查询当前uuid上附件个数
 * @async
 * @function fetchFileNumber
 * @param {object} params - 提交参数
 * @returns {object} fetch Promise
 */
export async function fetchFileNumber(params) {
  return cusRequest(`${HZERO_FILE}/v1/files/${params.attachmentUUID}/count`, {
    method: 'GET',
    query: {
      bucketName: params.bucketName,
    },
  });
}

/**
 * 查询默认对接人明细
 * @async
 * @function fetchFileNumber
 * @param {object} params - 提交参数
 * @returns {object} fetch Promise
 */
export async function queryDeafultPeer(params) {
  const { billInvoiceId } = params;
  const query = parseParameters(params);
  return cusRequest(
    `${SRM_SPCM}/v1/${organizationId}/bill-invoice-dockings/queryDefaultDocking/${billInvoiceId}`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 退回起草
 * @async
 * @function fetchFileNumber
 * @param {object} params - 提交参数
 * @returns {object} fetch Promise
 */
export async function returnDraft(params) {
  const { billInvoiceId } = params;
  return cusRequest(
    `${SRM_SPCM}/v1/${organizationId}/bill-invoices/return-draft/${billInvoiceId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 获取退回供应商原因
 * @async
 * @function fetchFileNumber
 * @param {object} params - 提交参数
 * @returns {object} fetch Promise
 */
export async function getReturnReason(params) {
  return cusRequest(
    `${SRM_SPCM}/v1/${organizationId}/bill-invoice-dockings/getReturnReason/${params}`,
    {
      method: 'GET',
      responseType: 'text',
    }
  );
}

/**
 * 账单上传-新建成本付款申请
 * @async
 * @function fetchFileNumber
 * @param {object} params - 提交参数
 * @returns {object} fetch Promise
 */
export async function billAddRequest(params) {
  const { costRequestType, billInvoice, billInvoiceFileList } = params;
  return cusRequest(
    `${SRM_SPUC}/v1/${organizationId}/cost-payment-requests-pure/billAddRequest/${costRequestType}`,
    {
      method: 'POST',
      body: {
        billInvoiceDTO: billInvoice,
        fileDTOList: billInvoiceFileList,
      },
    }
  );
}

/**
 * 账单上传-保存前检验
 * @async
 * @function checkBeforeSave
 * @param {object} params - 提交参数
 * @returns {object} fetch Promise
 */
export async function checkBeforeSave(params) {
  const { billInvoiceDockingList } = params;
  return cusRequest(`${SRM_SPCM}/v1/${organizationId}/bill-invoices/checkBeforeSave`, {
    method: 'POST',
    body: billInvoiceDockingList,
  });
}

export async function customFileSummary(params) {
  const { supplierTenantId, uuidList, sourceCode } = params;
  return cusRequest(
    `/hfle/v1/${sourceCode === 'CMI' ? organizationId : supplierTenantId}/custom-file/summary`,
    {
      method: 'GET',
      query: {
        uuidList,
      },
    }
  );
}
