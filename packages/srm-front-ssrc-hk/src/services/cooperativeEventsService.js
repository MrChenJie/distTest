import request from '_cus_utils/request';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 采购线条合作事件反馈信息-列表
 * @param params
 * @returns {Promise<void>}
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`/hscm-erp/v1/${organizationId}/ems-cooperate-eventss/pageEvents`, {
    method: 'GET',
    query,
  });
}

export async function saveEvents(params) {
  return request(`/hscm-erp/v1/${organizationId}/ems-cooperate-eventss/saveEvents`, {
    method: 'POST',
    body: params,
  });
}

// 根据事件ID查询附件信息
// GET /v1/{organizationId}/ems-cooperate-filess/getEmsCooperateFiles/{cooperateEventsId}
export async function getEmsCooperateFiles(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { cooperateEventsId } = query;
  return request(`/hscm-erp/v1/${organizationId}/ems-cooperate-filess/getEmsCooperateFiles/${cooperateEventsId}`, {
    method: 'GET',
    query,
  });
}

export async function batchRemove(params) {
  return request(`/hscm-erp/v1/${organizationId}/ems-cooperate-eventss/batch-remove`, {
    method: 'DELETE',
    body: params,
  });
}

// 采购线条合作事件反馈附件-批量保存
// POST /v1/{organizationId}/ems-cooperate-filess/batch-save/{cooperateEventsId}
export async function batchSave(params) {
  const { cooperateEventsId, emsCooperateFiles } = params;
  return request(`/hscm-erp/v1/${organizationId}/ems-cooperate-filess/batch-save/${cooperateEventsId}`, {
    method: 'POST',
    body: emsCooperateFiles,
  });
}

// 重新查询文件详情
// hfle/v1/463/files/0b8b4aba-d82a-4f89-908c-ab1eabb81abf/file
export async function queryFileList(params) {
  const query = filterNullValueObject(params);
  const { attachmentUUID } = query;
  return request(`/hfle/v1/${organizationId}/files/${attachmentUUID}/file`, {
    method: 'GET',
    query,
  });
}

// 采购线条合作事件反馈附件-批量删除
// delete /v1/{organizationId}/ems-cooperate-filess/batch-remove
export async function batchRemoveFiles(params) {
  return request(`/hscm-erp/v1/${organizationId}/ems-cooperate-filess/batch-remove`, {
    method: 'DELETE',
    body: params,
  });
}
