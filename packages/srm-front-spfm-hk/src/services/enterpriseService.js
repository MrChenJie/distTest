import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';

const organizationId = getCurrentOrganizationId();
const TenantRoleLevel = isTenantRoleLevel();

/**
 * 查询公司信息.
 * @export
 */
export async function fetchEnterpriseInfo(companyId) {
    return request(`${SRM_PLATFORM}/v1/companies/basic/collect/${companyId}`, {
      method: 'GET',
    });
}

/**
 * 查询当前最新的业务信息.
 * @export
 */
export async function queryCompanyBusiness(companyId) {
  if (TenantRoleLevel) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/companies/business/${companyId}`, {
      method: 'GET',
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/companies/business/${companyId}`, {
      method: 'GET',
    });
  }
}


export async function getApprovalDetail(params) {
  const { requestId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/approval-requests/${requestId}`, {
    method: 'GET',
  });
}

// 通过requestId来获取审批信息
export async function getByRequestId(params) {
  const { requestId } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/approval-requests/getByRequestId/${requestId}`,
    {
      method: 'GET',
    }
  );
}

// 校验线条准入是否需要添加售后联系人
export async function jumpIsAdd({ companyId, businessType }) {
  return request(
    `${SRM_PLATFORM}/v1/companies/contacts/${companyId}/verification/${businessType}`,
    {
      method: 'GET',
    }
  );
}

export async function canEditBank(payload) {
  return request(
    `${SRM_PLATFORM}/v1/companies/basic/preview/can-edit-bank`,
    {
      method: 'GET',
      query: payload,
      responseType: 'text'
    }
  );
}

export async function deleteBankList(params) {
  const { companyId, deleteList } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/participant-access/del-bank-account/${companyId}`,
    {
      method: 'DELETE',
      body: deleteList,
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
  return request(`${HZERO_FILE}/v1/files/${params.attachmentUUID}/count`, {
    method: 'GET',
    query: {
      bucketName: params.bucketName,
    },
  });
}

