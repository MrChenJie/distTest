import request from 'utils/request';
import cusRequest from '_cus_utils/request';
import { SRM_PLATFORM, SRM_SPUC } from '_utils/config';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  getCurrentUser,
} from 'utils/utils';
import { SRM_SPCM } from 'srm-front-boot/lib/utils/config';

const currentUser = getCurrentUser();
const organizationId = getCurrentOrganizationId();

// 通过类型requestType和主键Id targetHeaderId 以及租户 tenantId获取内容
export async function fetchGeneralRequestResult(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/approval-requests/detail/targetHeader`, {
    method: 'POST',
    body: params,
  });
}

export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`${SRM_SPUC}/v1/${organizationId}/cost-payment-requests`, {
    method: 'GET',
    query,
  });
}

export async function deleteList(params) {
  return cusRequest(`${SRM_SPUC}/v1/${organizationId}/cost-payment-requests`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 获取当前员工
 * @returns {Promise<void>}
 */
export async function getEmployeeName() {
  return cusRequest(`/hpfm/v1/${organizationId}/employees/employee-num`, {
    method: 'GET',
    query: {
      organizationId: organizationId,
      employeeNum: currentUser.loginName,
    },
  });
}

/**
 * 获取当前用户的公司主体
 * @returns {Promise<void>}
 */
export async function getCompanyName() {
  return cusRequest(
    `${SRM_SPUC}/v1/${organizationId}/cost-payment-requests/getDefaultCompanyCode`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    }
  );
}

/**
 * 批量产出发票
 * @param costRequestId
 * @returns {Promise<void>}
 */
export async function batchRemoveInvoices(costRequestId) {
  return cusRequest(
    `${SRM_SPUC}/v1/${organizationId}/cost-detail-invoices/batch-remove/${costRequestId}`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * 查询基础信息
 * @param params
 * @returns {Promise<void>}
 */
export async function getDetailInfo(params) {
  return cusRequest(
    `${SRM_SPUC}/v1/${organizationId}/cost-payment-requests/no-cascade/${params.costRequestId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询账单列表
 * @param params
 * @returns {Promise<void>}
 */
export async function getBillList(params) {
  return cusRequest(`${SRM_SPUC}/v1/${organizationId}/cost-detail-invoices`, {
    method: 'GET',
    query: params,
  });
}
/**
 * 删除账单列表
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteBillList(params) {
  return cusRequest(`${SRM_SPUC}/v1/${organizationId}/cost-detail-invoices`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 支付及核销信息
 * @param params
 * @returns {Promise<void>}
 */
export async function getWriteOff(params) {
  return cusRequest(`${SRM_SPUC}/v1/${organizationId}/prepayment-write-offs/payAndWriteOffInfo`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取步骤条数据
 * @param params
 * @returns {Promise<void>}
 */
export async function getCostProgress(params) {
  return cusRequest(
    `${SRM_SPCM}/v1/${organizationId}/payment-progresss/queryPaymentProgressStatus`,
    {
      method: 'GET',
      query: params,
    }
  );
}
export async function getCostProgressDetail(params) {
  return request(
    `${SRM_SPCM}/v1/${getCurrentOrganizationId()}/payment-progresss/queryPayProgressNodeDetail`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 补充附件按钮权限
 * @returns {Promise<void>}
 */
export async function getPaymentAdvicePer() {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/cost-attach-files/payment-advice/button-permission`,
    {
      method: 'GET',
    }
  );
}

/**
 * 账单行明细 查询
 * @returns {Promise<void>}
 */
export async function getBillDetail(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/cost-detail-lines`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存
 * @param params
 * @returns {Promise<void>}
 */
export async function saveAll(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/cost-payment-requests-pure/save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询已保存的发票总金额
 * @param params
 * @returns {Promise<void>}
 */
export async function queryBillAmount(params) {
  const { invoiceNum, vendorNum, ouOrgCode, costInvoiceId } = params;
  return request(
    `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/cost-payment-requests/queryBillAmount/${invoiceNum}/${vendorNum}/${ouOrgCode}`,
    {
      method: 'GET',
      query: { costInvoiceId },
    }
  );
}

/**
 * 获取发票行金额汇总
 * @param params
 * @returns {Promise<void>}
 */
export async function getLinesAmountSum(costInvoiceId) {
  return request(`${SRM_SPUC}/v1/${organizationId}/cost-detail-lines/sum/${costInvoiceId}`, {
    method: 'GET',
  });
}

/**
 * 查询银行信息
 * @param costRequestId
 * @returns {Promise<void>}
 */
export async function queryBankInfo(costRequestId) {
  return request(
    `${SRM_SPUC}/v1/${getCurrentOrganizationId()}/payment-bank-infos/queryBankInfo/${costRequestId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 删除银行信息
 * @param bankInfoId
 * @returns {Promise<void>}
 */
export async function deleteBankInfo(bankInfoId) {
  return request(`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/payment-bank-infos/${bankInfoId}`, {
    method: 'DELETE',
  });
}

/**
 * 查询附件信息
 * @param payload
 * @returns {Promise<void>}
 */
export async function getAttachFiles(payload) {
  return request(`${SRM_SPUC}/v1/${organizationId}/cost-attach-files`, {
    method: 'GET',
    query: payload,
  });
}

/**
 * 附件删除
 * @param payload
 * @returns {Promise<void>}
 */
export async function deleteOtherAtt(payload) {
  return request(`${SRM_SPUC}/v1/${organizationId}/cost-attach-files`, {
    method: 'DELETE',
    body: payload,
  });
}

/**
 * 核销保存
 * @param payload
 * @returns {Promise<void>}
 */
export async function saveWriteOff(payload) {
  return request(`${SRM_SPUC}/v1/${organizationId}/prepayment-write-offs/insertOrUpdateList`, {
    method: 'POST',
    body: payload,
  });
}

/**
 * 删除账单行信息
 * @param payload
 * @returns {Promise<void>}
 */
export async function deleteBillLine(payload) {
  return request(`${SRM_SPUC}/v1/${organizationId}/cost-detail-lines`, {
    method: 'DELETE',
    body: payload,
  });
}

/**
 * 提交前校验
 * @param payload
 * @returns {Promise<void>}
 */
export async function pureCheck(payload) {
  const { costRequestId, approveHeader } = payload;
  return request(
    `${SRM_SPUC}/v1/${organizationId}/cost-payment-requests-pure/check/${costRequestId}`,
    {
      method: 'POST',
      body: { approveHeader },
    }
  );
}

/**
 * 补充材料按钮-校验
 * @param payload
 * @returns {Promise<void>}
 */
export async function checkRepeatInvoice(payload) {
  const { costRequestId } = payload;
  return request(
    `${SRM_SPUC}/v1/${organizationId}/payment-request-common-apis/checkRepeatInvoice/${costRequestId}`,
    {
      method: 'POST',
    }
  );
}

/**
 *
 * @param payload
 * @returns {Promise<void>}
 */
export async function checkAllowReturnBank(payload) {
  const { costRequestId } = payload;
  return request(
    `${SRM_SPUC}/v1/${organizationId}/payment-request-common-apis/checkAllowReturnBank/${costRequestId}`,
    {
      method: 'POST',
    }
  );
}

/**
 * 获取审批数据
 * @param payload
 * @returns {Promise<void>}
 */
export async function approvalDetail(payload) {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/approval-requests/detail/targetHeaderCost`,
    {
      method: 'POST',
      body: payload,
    }
  );
}

/**
 * 财务第二复核 - 提交
 * @param payload
 * @returns {Promise<void>}
 */
export async function mipSubmit(payload) {
  const { costRequestId } = payload;
  return request(`${SRM_SPUC}/v1/${organizationId}/mip-submit/${costRequestId}`, {
    method: 'POST',
    body: payload,
  });
}

//---------------------------------- 补充附件 start  ----------------------------------

/**
 * 查询
 * @param payload
 * @returns {Promise<void>}
 */
export async function getSupplyAttachFiles(payload) {
  const query = filterNullValueObject(parseParameters(payload));
  return request(`${SRM_SPCM}/v1/${organizationId}/cost-attach-files/payment-advice`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存
 * @param payload
 * @returns {Promise<void>}
 */
export async function saveSupplyAttachFiles(payload) {
  const { costRequestId, saveList } = payload;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/cost-attach-files/payment-advice/${costRequestId}`,
    {
      method: 'POST',
      body: saveList,
    }
  );
}

/**
 * 删除
 * @param payload
 * @returns {Promise<void>}
 */
export async function deleteSupplyAttachFiles(payload) {
  return request(`${SRM_SPCM}/v1/${organizationId}/cost-attach-files/payment-advice`, {
    method: 'DELETE',
    body: payload,
  });
}

//---------------------------------- end  ----------------------------------

/**
 * 导出pdf
 * @param payload
 * @returns {Promise<void>}
 */
export async function exportPdf(payload) {
  return request(`${SRM_SPUC}/v1/${organizationId}/cost-payment-requests/exportPdf/${payload}`, {
    method: 'GET',
    responseType: 'blob',
  });
}

/**
 * 单据所有附件批量下载
 * @param payload
 * @returns {Promise<void>}
 */
export async function fileBatchDownload(payload) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/cost-payment/queryPaymentAttach/${payload}/cost`,
    {
      method: 'GET',
    }
  );
}
