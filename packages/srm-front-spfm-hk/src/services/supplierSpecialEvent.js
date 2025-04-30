import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

export async function deleteExistSupplierFileByKey(params) {
  const { fileKey } = params;
  return request(
    `${SRM_SSLM}/v1/${getCurrentOrganizationId()}/supplier-filess/deleteByKey?fileKey=${fileKey}`,
    {
      method: 'DELETE',
    }
  );
}
