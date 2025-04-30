import { isUndefined, isNull } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export async function save(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/participant-access/save`, {
    method: 'POST',
    body: params,
  });
}

export async function next(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/participant-access/next`, {
    method: 'POST',
    body: params,
  });
}

export async function query(params) {
  const { companyId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/participant-access/query/${companyId}`, {
    method: 'GET',
  });
}

export async function deleteAddressList(params) {
  const { companyId, deleteList } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/participant-access/del-address/${companyId}`,
    {
      method: 'DELETE',
      body: deleteList,
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

export async function deleteAttachmentList(params) {
  const { companyId, deleteList } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/participant-access/del-attachment/${companyId}`,
    {
      method: 'DELETE',
      body: deleteList,
    }
  );
}
