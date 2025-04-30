import cusRequest from '_cus_utils/request';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export async function queryList(payload) {
  return cusRequest(`${SRM_PLATFORM}/v1/${organizationId}/company-labels`, {
    method: 'GET',
    query: filterNullValueObject(parseParameters(payload)),
  });
}
export async function saveList(payload) {
  const { companyId, labelIdList } = payload;
  return cusRequest(`${SRM_PLATFORM}/v1/${organizationId}/company-labels/save/${companyId}`, {
    method: 'POST',
    body: labelIdList,
  });
}
export async function deleteList(payload) {
  return cusRequest(`${SRM_PLATFORM}/v1/${organizationId}/company-labels`, {
    method: 'DELETE',
    body: payload,
  });
}

// 标签类别查询
export async function queryLabelType(payload) {
  return cusRequest(`${SRM_PLATFORM}/v1/${organizationId}/label-types`, {
    method: 'GET',
    query: filterNullValueObject(parseParameters(payload)),
  });
}
// 标签类别保存
export async function saveLabelType(payload) {
  return cusRequest(`${SRM_PLATFORM}/v1/${organizationId}/label-types`, {
    method: 'POST',
    body: [payload],
  });
}
// 标签类别删除
export async function deleteLabelType(payload) {
  return cusRequest(`${SRM_PLATFORM}/v1/${organizationId}/label-types`, {
    method: 'DELETE',
    body: payload,
  });
}

// 标签内容查询
export async function queryLabelContent(payload) {
  return cusRequest(`${SRM_PLATFORM}/v1/${organizationId}/labels/selectByLabelType`, {
    method: 'GET',
    query: filterNullValueObject(parseParameters(payload)),
  });
}

// 标签内容保存
export async function saveLabelContent(payload) {
  return cusRequest(`${SRM_PLATFORM}/v1/${organizationId}/labels`, {
    method: 'POST',
    body: payload,
  });
}
// 标签内容删除
export async function deleteLabelContent(payload) {
  return cusRequest(`${SRM_PLATFORM}/v1/${organizationId}/labels`, {
    method: 'DELETE',
    body: payload,
  });
}
// 标签内容权限
export async function editPermissions(payload) {
  const { departmentLabel } = payload;
  return cusRequest(
    `${SRM_PLATFORM}/v1/${organizationId}/labels/content/editPermissions?deptCode=${departmentLabel}`,
    {
      method: 'POST',
      responseType: 'text',
    }
  );
}
// 列表权限
export async function deptEditPermissions() {
  return cusRequest(`${SRM_PLATFORM}/v1/${organizationId}/labels/editPermissions`, {
    method: 'POST',
  });
}
