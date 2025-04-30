import qs from 'query-string';
import cusRequest from '_cus_utils/request';
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
export function getAttachmentUrl({
  url,
  bucketName,
  tenantId,
  bucketDirectory,
  storageCode,
  isEncrypt,
}) {
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
    : `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/${
        isEncrypt ? 'decrypt-download-ext' : 'download'
      }?${params}&url=${encodeURIComponent(url)}`;
  return newUrl;
}

/**
 * 获取fileList
 * {HZERO_FILE}/v1/files/{attachmentUUID}/file
 * @export
 * @param {object} params 传递参数
 * @param {string} params.attachmentUUID - 文件uuid
 */
export async function queryFileList(params) {
  const tenantId = getCurrentOrganizationId();
  return cusRequest(
    `${HZERO_FILE}/v1${isTenantRoleLevel() ? `/${tenantId}/` : '/'}files/${
      params.attachmentUUID
    }/file`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 获取fileList
 * {HZERO_FILE}/v1/files/uuid
 * {HZERO_FILE}/v1/{organizationId}/files/uuid
 * @export
 * @param {object} params 传递参数
 */
export async function queryUUID(params) {
  const tenantId = getCurrentOrganizationId();
  return cusRequest(`${HZERO_FILE}/v1${isTenantRoleLevel() ? `/${tenantId}/` : '/'}files/uuid`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 删除attachmentUUID对应的某一个文件
 * {HZERO_FILE}/v1/files/delete-by-uuidurl
 * @export
 * @param {object} params 传递参数
 * @param {string} params.bucketName - 桶
 * @param {string} params.attachmentUUID - 文件uuid
 * @param {string[]} params.urls - 要删除的文件
 */
export async function removeFile(params) {
  const { urls, ...otherParams } = params;
  const tenantId = getCurrentOrganizationId();
  const reqUrl = isTenantRoleLevel()
    ? `${HZERO_FILE}/v1/${tenantId}/files/delete-by-uuidurl`
    : `${HZERO_FILE}/v1/files/delete-by-uuidurl`;
  return cusRequest(reqUrl, {
    method: 'POST',
    body: urls,
    query: filterNullValueObject(otherParams),
  });
}

/**
 * 删除上传的文件
 * {HZERO_FILE}/v1/files/delete-by-url
 * {HZERO_FILE}/v1/{organizationId}/files/delete-by-url
 * @param {object} params
 * @param {string} params.bucketName
 * @param {string} params.storageCode - 存储配置编码
 */
export async function removeUploadFile(params) {
  const { urls, ...otherParams } = params;
  const tenantId = getCurrentOrganizationId();
  const reqUrl = isTenantRoleLevel()
    ? `${HZERO_FILE}/v1/${tenantId}/files/delete-by-url`
    : `${HZERO_FILE}/v1/files/delete-by-url`;
  return cusRequest(reqUrl, {
    method: 'POST',
    body: urls,
    query: filterNullValueObject(otherParams),
  });
}
