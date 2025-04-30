/**
 * @Description: FTP服务器信息 - service
 * @date 2023-02-02
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import request from 'utils/request';
import { HZERO_FILE } from 'utils/config';
import { parseParameters, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

/**
 * 查询
 * @param params
 * @returns {Promise<void>}
 */
export async function query(params) {
  const param = parseParameters(params);
  return request(`${HZERO_FILE}/v1/${tenantId}/ftp-servers`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 删除服务器信息
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteServers(params) {
  return request(`${HZERO_FILE}/v1/${tenantId}/ftp-servers`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 删除FTP服务器行
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteServersLine(params) {
  return request(`${HZERO_FILE}/v1/${tenantId}/ftp-server-lines`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询明细
 * @param params
 * @returns {Promise<void>}
 */
export async function queryDetail(params) {
  const { serverId } = params;
  return request(`${HZERO_FILE}/v1/${tenantId}/ftp-servers/query-detail`, {
    method: 'GET',
    query: { serverId },
  });
}

/**
 * 保存
 * @param params
 * @returns {Promise<void>}
 */
export async function save(params) {
  return request(`${HZERO_FILE}/v1/${tenantId}/ftp-servers/save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 读取配置行表列表
 * @param params
 * @returns {Promise<void>}
 */
export async function fetchConfigList(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${HZERO_FILE}/v1/${tenantId}/ftp-server-line-cfgs`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 删除配置行列表
 * @param params
 * @returns {Promise<void>}
 */
export async function deleteConfigList(params) {
  return request(`${HZERO_FILE}/v1/${tenantId}/ftp-server-line-cfgs`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 保存配置行列表
 * @param params
 * @returns {Promise<void>}
 */
export async function saveConfigList(params) {
  return request(`${HZERO_FILE}/v1/${tenantId}/ftp-server-line-cfgs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询FTP上次读取时间
 * @param params
 * @returns {Promise<void>}
 */
export async function fetchSyncRecordList(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${HZERO_FILE}/v1/ftp-last-sync-records`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 保存FTP上次读取时间
 * @param params
 * @returns {Promise<void>}
 */
export async function saveSyncRecordList(params) {
  const { list, serverId } = params;
  return request(`${HZERO_FILE}/v1/ftp-last-sync-records`, {
    method: 'POST',
    body: list,
    query: { serverId },
  });
}
