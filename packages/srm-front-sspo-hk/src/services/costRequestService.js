import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

// 通过类型requestType和主键Id targetHeaderId 以及租户 tenantId获取内容
export async function fetchGeneralRequestResult(params) {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/approval-requests/detail/targetHeader`,
    {
      method: 'POST',
      body: params,
    }
  );
}
