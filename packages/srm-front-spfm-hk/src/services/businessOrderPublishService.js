import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询业务通知发布列表
 */
export async function fetchDataList(params) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/notify`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 详细页头数据
 */
export async function fetchForm(params) {
  const { notificationId, ...other } = params;
  const param = parseParameters(other);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/notify-detail/${notificationId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 详细页供应商行数据
 */
export async function fetchTable(params) {
  const { page } = params;
  const param = page === -1 ? params : parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/bsnes-notify-receivess`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 操作记录
 */
export async function fetchOperate(params) {
  const { notificationId, ...other } = params;
  const param = parseParameters(other);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/notify-actions/${notificationId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 签收状态
 */
export async function fetchSignStatusList(params) {
  const { notificationId, ...other } = params;
  const param = parseParameters(other);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/notify/sign/detail/${notificationId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 保存业务通知单
 */
export async function saveBusinessOrder(params) {
  const { businessNotificationDTO } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/save-notify`, {
    method: 'PUT',
    body: businessNotificationDTO,
  });
}

/**
 * 删除业务通知单
 */
export async function deleteBusinessOrder(params) {
  const { businessNotifications } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/notify`, {
    method: 'DELETE',
    body: businessNotifications,
  });
}

/**
 * 发布业务通知单
 */
export async function publishBusinessOrder(params) {
  const { businessNotificationDTOList, saveFlag } = params;
  const release = saveFlag === 1 ? 'release?saveFlag=1' : 'release';
  return request(`${SRM_PLATFORM}/v1/${organizationId}/notify/${release}`, {
    method: 'PUT',
    body: businessNotificationDTOList,
  });
}

/**
 * 供应商多选lov
 */
export async function fetchSupplier(params) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/bsnes-notify-receivess/supplier`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询全部供应商
 */
export async function fetchAllSupplier(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/bsnes-notify-receivess/supplier`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 删除业务通知单
 */
export async function deleteSupplier(params) {
  const { BsnesNotifyReceives } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/bsnes-notify-receivess`, {
    method: 'DELETE',
    body: BsnesNotifyReceives,
  });
}
