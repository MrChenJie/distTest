import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 查询退回撤回按钮权限
export async function getButtonPermission(params) {
  return request(
    `${SRM_PLATFORM}/v1/isp/${organizationId}/companies/basic/return-button-permission/${params.companyId}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

// 退回供应商
export async function returnToSupplier(params) {
  return request(`${SRM_PLATFORM}/v1/isp/${organizationId}/companies/basic/return-or-withdraw`, {
    method: 'POST',
    body: params,
  });
}
