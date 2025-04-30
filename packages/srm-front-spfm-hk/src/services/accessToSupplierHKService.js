/**
 * accessToSupplierHKService.js - 供应商准入管理 service
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/20
 * @Copyright: Copyright (c), 2023, hand
 */
import cusRequest from '_cus_utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';
const CMHK_SUPPLIER = '/cmhk-supplier';
const CMHK_DICT = '/dict';
const organizationId = getCurrentOrganizationId();

/**
 * 删除供应商
 */
export async function deleteSupplierByIds(data) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/batchDelete`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 查询供应商列表
 */
export async function queryPlatformSupplier(params) {
  const query = parseParameters(params);
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/search`, {
    method: 'GET',
    query,
  });
}

/**
 * 基本信息保存
 * @async
 * @function saveHeader
 * @param {object} params - 请求参数
 * @param {!object} params.dto - 待保存对象
 */
export async function basicInfoSave(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/basic/save`, {
    method: 'POST',
    body: { ...params.dto },
  });
}

/**
 * 联系人信息保存
 */
export async function contactsInfoSave(params) {
  return cusRequest(
    `${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/basic/contacts/save`,
    {
      method: 'POST',
      body: { ...params.dto },
    }
  );
}

/**
 * 预览供应商汇总信息
 */
export async function previewSupplierDetail(payload) {
  return cusRequest(
    `${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/basic/collect/${payload.supplierId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询供应商银行信息
 */
export async function previewSupplierBankDetail(payload) {
  return cusRequest(
    `${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/bank-accounts/${payload.supplierId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询供应商a2p信息
 */
export async function previewSupplierA2pDetail(payload) {
  return cusRequest(
    `${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/finance/A2P/${payload.supplierId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询供应商附件
 */
export async function previewSupplierFileDetail(payload) {
  return cusRequest(
    `${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/attachments/${payload.supplierId}?refType=${payload.refType}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 采购供应商信息保存
 */
export async function purchaseInfoSave(params) {
  return cusRequest(
    `${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/procure/saveAll`,
    {
      method: 'POST',
      body: { ...params.dto },
    }
  );
}

/**
 * 查询采购供应商信息详情
 */
export async function queryPurchaseDetail(payload) {
  return cusRequest(
    `${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/procure/${payload.supplierId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询采购供应商客户信息详情
 */
export async function queryContactDetail(payload) {
  return cusRequest(
    `${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/customers/${payload.supplierId}`
  );
}

/**
 * 查询采购供应商附件信息详情
 */
export async function queryAttachmentDetail(payload) {
  return cusRequest(
    `${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/attachments/${payload.supplierId}?refType=${payload.refType}`
  );
}

/**
 * 邀请注册
 */
export async function invitationRegister(payload) {
  return cusRequest(
    `${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/search/inviteRegister`,
    {
      method: 'POST',
      body: payload.dto,
    }
  );
}

/**
 * 邀请登记
 */
export async function invitationEnrollment(payload) {
  return cusRequest(`/mylink/v1/${organizationId}/role/registerWithHasAccount`, {
    method: 'POST',
    body: payload.dto,
  });
}

/**
 * 供应商模糊查重
 */
export async function supplierCheck(params) {
  const query = parseParameters(params);
  return cusRequest(
    `${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/selectSupplierCheckResult`,
    {
      method: 'GET',
      query: query,
    }
  );
}

/**
 * 主数据导出
 */
export async function masterDataExport(payload) {
  return cusRequest(
    `${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/search/masterDataExport`,
    {
      method: 'GET',
      query: payload,
      responseType: 'blob',
    }
  );
}

/**
 * 供应商准入-基本信息、联系人、客户信息保存
 */
export async function supplierInfoDataSave(payload) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/save`, {
    method: 'POST',
    body: payload.dto,
  });
}

/**
 * 财务供应商信息保存
 */
export async function financeInfoDataSave(payload) {
  return cusRequest(
    `${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/finance/saveAll`,
    {
      method: 'POST',
      body: payload.dto,
    }
  );
}

/**
 * 查询值集
 */
export async function queryNoticeType(params) {
  return cusRequest(`${HZERO_PLATFORM}/v1/lovs/value/tree`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询当前登录人的部门
 */
export async function queryUnit(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier-user/getUserUnit`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 商业登记证号码查重
 */
export async function checkRegistrationNumber(payload) {
  return cusRequest(
    `${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/suppliers/basic/registrationNumber`,
    {
      method: 'GET',
      query: payload,
    }
  );
}

/**
 * 供应商名称查重
 */
export async function checkSupplierName(payload) {
  return cusRequest(
    `${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/suppliers/basic/supplierName`,
    {
      method: 'GET',
      query: payload,
    }
  );
}

/**
 * 查询流程信息
 */
export async function getNodeInfo(payload) {
  return cusRequest(
    `${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/getActivityInfo`,
    {
      method: 'GET',
      query: payload,
    }
  );
}

/**
 * 查询流程信息
 */
export async function getEmail(payload) {
  return cusRequest(`${process.env.CMHK_LOGIN}/iam/hzero/v1/users/validation/email`, {
    method: 'GET',
    query: payload,
  });
}

/**
 * 查询邀请
 */
export async function inviteStateList(params) {
  const query = parseParameters(params);
  return cusRequest(
    `${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/search/inviteStateList`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 邀请供应商准入时，添加供应商查重功能
*/
export async function getInvitedOptions(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/vague-name-search`, {
    method: 'GET',
    query: params
  })
}
/*
 * 查询基本信息
 */
export async function queryBasicInfo(params) {
  return cusRequest(`${CMHK_DICT}/v1/${organizationId}/partner-infos/${params.partnerId}`, {
    method: 'GET',
  });
}

/**
 * 查询联系人信息
 */
export async function queryContactsInfo(params) {
  const query = parseParameters(params);
  return cusRequest(`${CMHK_DICT}/v1/${organizationId}/partner-contacts`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询财务信息
 */
export async function queryConvertSupplierInfo(params) {
  return cusRequest(`${CMHK_DICT}/v1/${organizationId}/partner-fin-conds/convertSupplier`, {
    method: 'GET',
    query: params,
  });
}

/**
 * dict获取数据入口
 */
export async function initDictDate(params) {
  return cusRequest(`${CMHK_DICT}/v1/${organizationId}/partner-infos/manualRegisterSupplier`, {
    method: 'GET',
    query: params,
  });
}
/**
 * dict获取客户信息数据
 */
export async function queryDictClientInfo(params) {
  return cusRequest(`${CMHK_DICT}/v1/${organizationId}/partner-customers`, {
    method: 'GET',
    query: params,
  });
}
/**
 * dict获取公司附件数据
 */
export async function queryDictCompanyAttachment(params) {
  return cusRequest(`${CMHK_DICT}/v1/${organizationId}/partner-files`, {
    method: 'GET',
    query: params,
  });
}

/**
 * dict邀请登记
 */
export async function invitationToRegister(params) {
  return cusRequest(`${CMHK_DICT}/v1/${organizationId}/partner-infos/inviteRegisterSupplier`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询银行地址信息
*/
export async function getAddressBankInfoList(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/bank-head/${params.supplierId}`, {
    method: 'GET',
  })
}

/**
 * 查询银行明细信息
*/
export async function getBankInfoList(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/bank-line/${params.bankHeadId}`, {
    method: 'GET',
  })
}

/**
 * 删除银行地址信息
*/
export async function deleteAddressBankInfoLine(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/bank-head-delete`, {
    method: 'DELETE',
    body: params
  })
}

/**
 * 删除银行明细信息
*/
export async function deleteBankInfoLine(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/bank-line-delete`, {
    method: 'DELETE',
    body: params
  })
}

/**
 * 保存银行关联关系
*/
export async function saveBankInfoList(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/supplier/finance-bank-info/save`, {
    method: 'POST',
    body: params
  })
}

/**
 * 导出银行信息
*/
export async function bankInfoExport(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/bank-data-export/${params.supplierId}`, {
    method: 'GET',
    responseType: 'blob',
  })
}

/**
 * 查询编码规则
*/
export async function getLeaveCode(params) {
  return cusRequest(`${CMHK_SUPPLIER}/v1/${organizationId}/cmhk-supplier/code-rule/generate`, {
    method: 'GET',
    query: params
  })
}
