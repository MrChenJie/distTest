/**
 * importErpService.js - 导入Erp service
 * @date: 2019-01-10
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 采购财务新增接口查询
 */
export async function fetchCreateRow(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/import-erp-configs/queryImportErpConfig`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 供应商地址查询接口
 */
export async function querySupplierAddress(params) {
  const { supplierSyncId, ...other } = params;
  const query = filterNullValueObject(parseParameters(other));
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync-addresss/${supplierSyncId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 供应商联系人查询接口
 */
export async function querySupplierContact(params) {
  const { supplierSyncId, ...other } = params;
  const query = filterNullValueObject(parseParameters(other));
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync-contacts/${supplierSyncId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 供应商账户查询接口
 */
export async function querySupplierAccount(params) {
  const { supplierSyncId, ...other } = params;
  const query = filterNullValueObject(parseParameters(other));
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync-accounts/${supplierSyncId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 供应商账户保存
 * @param {Object} params - 保存参数
 */
export async function saveSupplierAccount(params) {
  const { supplierSyncAccount } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync-accounts`, {
    method: 'PUT',
    body: [...supplierSyncAccount],
  });
}

/**
 * 查询采购/财务
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function queryFinance(params) {
  const { supplierSyncId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync-pfs/${supplierSyncId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 保存采购/财务
 *
 * @export
 * @param {Array} params
 * @returns
 */
export async function saveFinance(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync-pfs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除采购/财务
 *
 * @export
 * @param {Array} params
 * @returns
 */
export async function deleteFinance(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync-pfs`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 导入Erp查询
 *
 * @export
 * @param {Array} params
 * @returns
 */
export async function queryErp(params) {
  const { supplierSyncId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 修改导入Erp数据
 *
 * @export
 * @param {Array} params
 * @returns
 */
export async function saveErp(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 导入SAP
 * @export
 * @param {Array} params
 * @returns
 */
export async function importData(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync/import`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 导入EBS
 * @export
 * @param {Array} params
 * @returns
 */
export async function importEbsData(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync-ebs/import-ebs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询供应商信息数据
 * @export
 * @param {Array} params
 * @returns
 */
export async function querySuLocation(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync-ebs-adds`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 保存供应商地址信息数据
 * @export
 * @param {Array} params
 * @returns
 */
export async function saveSuLocation(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync-ebs-adds`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除供应商地址信息数据
 * @export
 * @param {Array} params
 * @returns
 */
export async function deleteSuLocation(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync-ebs-adds`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询OU信息数据
 * @export
 * @param {Array} params
 * @returns
 */
export async function queryOUMessage(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync-ebs-ous`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 保存供应商OU信息数据
 * @export
 * @param {Array} params
 * @returns
 */
export async function saveOUMessage(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync-ebs-ous`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除供应商OU信息数据
 * @export
 * @param {Array} params
 * @returns
 */
export async function deleteOUMessage(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync-ebs-ous`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 导入Ebs查询
 *
 * @export
 * @param {Array} params
 * @returns
 */
export async function queryEbs(params) {
  const { supplierSyncId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync-ebs`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 暂不处理方法
 * @export
 * @param {Array} params
 * @returns
 */
export async function hang(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync/hang`, {
    method: 'POST',
    body: params,
  });
}

/**
 * ebs暂不处理方法
 * @export
 * @param {Array} params
 * @returns
 */
export async function hangEbs(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync-ebs/hang`, {
    method: 'POST',
    body: params,
  });
}
