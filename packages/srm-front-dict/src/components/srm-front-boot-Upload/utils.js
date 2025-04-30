import qs from 'query-string';

import { HZERO_FILE } from 'utils/config';
import {
  getAccessToken,
  getCurrentOrganizationId,
  isTenantRoleLevel,
  filterNullValueObject,
} from 'utils/utils';

/**
 * 通过文件服务器的接口获取可访问的文件URL
 *
 * @export
 * @param {String} url 上传接口返回的 Url
 * @param {String} bucketName 桶名
 * @param {Number} tenantId 租户Id
 * @param {String} bucketDirectory 文件目录
 * @param {String} storageCode 存储配置编码
 */
export function getAttachmentUrl(url, bucketName, tenantId, bucketDirectory, storageCode) {
  const accessToken = getAccessToken();
  const params = qs.stringify(
    filterNullValueObject({
      bucketName,
      storageCode,
      access_token: accessToken,
      directory: bucketDirectory,
    })
  );
  const newUrl = !isTenantRoleLevel()
    ? `${HZERO_FILE}/v1/files/download?${params}&url=${encodeURIComponent(url)}`
    : `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/decrypt-download-ext?${params}&url=${encodeURIComponent(
        url
      )}`;
  return newUrl;
}
