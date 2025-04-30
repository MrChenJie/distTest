
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from "hzero-front/lib/utils/utils";

/**
 *获取文件列表
 *
 * @export
 * @function getSrmPlatformFiles
 * @returns
 */
export async function getSrmPlatformFiles(params) {
  return request(`${SRM_PLATFORM}/v1/company-filess`, {
    method: 'GET',
    query: params,
  });
}


// 删除文件

export async function deleteExistSrmPlatformFileByKey(params) {
  const { fileKey } = params;
  return request(`${SRM_PLATFORM}/v1/company-filess/deleteByKey?fileKey=${fileKey}`, {
      method: 'DELETE',
    }
  );
}
