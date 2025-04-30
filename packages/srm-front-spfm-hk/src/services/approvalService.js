/**
 * approvalService - 企业认证审批service
 * @date: 2018-7-24
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { stringify } from 'qs';
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function queryList(params = {}) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/company-actions/submited`, {
    method: 'GET',
    query: param,
  });
}

export async function queryDetail(params = {}) {
  return request(`${SRM_PLATFORM}/v1/companies/process?${stringify(params)}`);
}

export async function approve(params = {}) {
  return request(`${SRM_PLATFORM}/v1/company-actions/batch-approve`, {
    method: 'POST',
    body: params,
  });
}

export async function reject(params = {}) {
  return request(`${SRM_PLATFORM}/v1/company-actions/reject`, {
    method: 'POST',
    body: params,
  });
}

export async function queryRecord(companyId) {
  return request(`${SRM_PLATFORM}/v1/company-actions/${companyId}/history`);
}

export async function certificationBusiness(params) {
  return request(`${SRM_PLATFORM}/v1/company-actions/batch-approve-auto`, {
    method: 'POST',
    body: params,
  });
}

// MIP审批流推送对象查询
export async function mipApprovalQuery(params = {}) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/approval-object-maps/approval-object`, {
    method: 'GET',
    query: param,
  });
}

// MIP审批流头行查询
export async function mipApprovalDetail(params = {}) {
  const { objectMapId } = params;
  return request(`${SRM_PLATFORM}/v1/approval-object-maps/${objectMapId}`, {
    method: 'GET',
  });
}

// MIP审批流保存
export async function mipApprovalSave(params) {
  return request(`${SRM_PLATFORM}/v1/approval-object-maps/save-approval`, {
    method: 'POST',
    body: params,
  });
}

// MIP审批流对象删除
export async function mipApprovalObjectDelete(params = {}) {
  const { objectMapId } = params;
  return request(`${SRM_PLATFORM}/v1/approval-object-maps/object/${objectMapId}`, {
    method: 'DELETE',
  });
}

// MIP审批流字段删除
export async function mipApprovalFieldDelete(params = {}) {
  const { fieldMapIdList } = params;
  return request(`${SRM_PLATFORM}/v1/approval-object-maps/field/batchDelete`, {
    method: 'DELETE',
    body: fieldMapIdList,
  });
}

export async function getFieldList(params = {}) {
  const { page, ...other } = params;
  const pageParams = parseParameters({page});
  return request(`${SRM_PLATFORM}/v1/approval-field-maps`, {
    method: 'GET',
    query: {
      ...other,
      ...pageParams
    },
  });
}
