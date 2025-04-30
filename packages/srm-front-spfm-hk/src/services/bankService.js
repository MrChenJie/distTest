/*
 * bankService - 企业注册/银行信息
 * @date: 2018/10/13 10:42:57
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_PLATFORM, SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const prefix = `${SRM_PLATFORM}/v1`;
const organizationId = getCurrentOrganizationId();

/**
 * 查询银行信息列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.companyId - 公司编码
 */
export async function fetchBankData(params) {
  return request(`${prefix}/companies/bank-accounts/${params.companyId}`, {
    method: 'GET',
  });
}
export async function saveBankData(params) {
  return request(`${prefix}/companies/bank-accounts/${params.companyId}`, {
    method: 'POST',
    body: params.companyBankAccountList,
  });
}

export async function queryCurrentCMIData(params) {
  const { name } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/sub_account_lov?realName=${name}`);
}

/**
 * 删除银行数据
 * @description DELETE /v1/{organizationId}/participant-access/del-bank-account/{companyId}
 */
export async function deleteBank(params) {
  const { companyId, deleteData } = params;
  return request(`${prefix}/${organizationId}/participant-access/del-bank-account/${companyId}`, {
    method: 'DELETE',
    body: deleteData,
  });
}
