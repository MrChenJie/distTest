/**
 * service - 处理邀约
 * @date: 2018-8-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';

const prefix = `${SRM_SSLM}/v1`;

/**
 *查询调查表模板信息
 *
 * @export
 * @param {*} investigateTemplateId 模板Id
 * @param {*} organizationId 租户Id
 * @returns
 */
export async function investigationTemplateHeaderQueryAll(params) {
  const { investigateTemplateId, organizationId } = params;
  return request(
    `${prefix}/${organizationId}/investigate-confighs-preview/${investigateTemplateId}`,
    {
      method: 'GET',
    }
  );
}
/**
 *
 *查询调查表数据
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchDataSource(params) {
  const { configName, organizationId, investgHeaderId } = params;
  let interfaceName = '';
  switch (configName) {
    // 基础信息
    case 'sslmInvestgBasic':
      interfaceName = 'investigate-basics';
      break;
    // 业务信息
    case 'sslmInvestgBusiness':
      interfaceName = 'investigate-businesses';
      break;
    // 产品及服务
    case 'sslmInvestgProservice':
      interfaceName = 'investigate-proservices';
      break;
    // 供应商分类
    case 'sslmInvestgSupplierCate':
      interfaceName = 'investg-supplier-cates';
      break;
    // 近三年财务状况
    case 'sslmInvestgFin':
      interfaceName = 'investigate-finances';
      break;
    // 分支机构
    case 'sslmInvestgFinBranch':
      interfaceName = 'investigate-finances-branchs';
      break;
    // 资质信息
    case 'sslmInvestgAuth':
      interfaceName = 'investigate-authes';
      break;
    // 联系人信息
    case 'sslmInvestgContact':
      interfaceName = 'investigate-contacts';
      break;
    // 地址信息
    case 'sslmInvestgAddress':
      interfaceName = 'investigate-addresses';
      break;
    // 开户行信息
    case 'sslmInvestgBankAccount':
      interfaceName = 'investigate-bank-accounts';
      break;
    // 主要客户情况
    case 'sslmInvestgCustomer':
      interfaceName = 'investigate-customers';
      break;
    // 分供方情况
    case 'sslmInvestgSubSupplier':
      interfaceName = 'investigate-sub-suppliers';
      break;
    // 设备信息
    case 'sslmInvestgEquipment':
      interfaceName = 'investigate-equipments';
      break;
    // 研发能力
    case 'sslmInvestgRd':
      interfaceName = 'investigate-rds';
      break;
    // 生产能力
    case 'sslmInvestgProduce':
      interfaceName = 'investigate-produces';
      break;
    // 质保能力
    case 'sslmInvestgQa':
      interfaceName = 'investigate-qas';
      break;
    // 售后服务
    case 'sslmInvestgCustservice':
      interfaceName = 'investigate-custservices';
      break;
    // 附件信息
    case 'sslmInvestgAttachment':
      interfaceName = 'investigate-attachments';
      break;
    default:
      break;
  }
  return request(`${prefix}/${organizationId}/${interfaceName}`, {
    method: 'GET',
    query: {
      investgHeaderId,
      tenantId: organizationId,
    },
  });
}
/**
 *批量保存数据
 *
 * @export
 * @param {*} params
 * @param {*} investgHeaderId
 * @param {*} organizationId
 * @returns
 */
export async function saveData(params, investgHeaderId, organizationId) {
  return request(`${prefix}/${organizationId}/investigate/save/${investgHeaderId}`, {
    method: 'POST',
    body: params,
  });
}
/**
 *调查表提交并保存
 *
 * @export
 * @param {number} investigateHeaderId
 * @param {number} organizationId
 * @param {object} params
 * @returns
 */
export async function submit(investigateHeaderId, organizationId, params) {
  return request(`${prefix}/${organizationId}/investigate/save-submits/${investigateHeaderId}`, {
    method: 'POST',
    body: params,
  });
}
/**
 *删除调查表数据
 *
 * @export
 * @param {string} configName
 * @param {string} rowKeys
 * @param {number} organizationId
 * @returns
 */
export async function deleteData(configName, rowKeys, organizationId) {
  let interfaceName = '';
  switch (configName) {
    // 基础信息
    case 'sslmInvestgBasic':
      interfaceName = 'investigate-basics';
      break;
    // 业务信息
    case 'sslmInvestgBusiness':
      interfaceName = 'investigate-businesses';
      break;
    // 产品及服务
    case 'sslmInvestgProservice':
      interfaceName = 'investigate-proservices';
      break;
    // 供应商分类
    case 'sslmInvestgSupplierCate':
      interfaceName = 'investg-supplier-cates';
      break;
    // 近三年财务状况
    case 'sslmInvestgFin':
      interfaceName = 'investigate-finances';
      break;
    // 分支机构
    case 'sslmInvestgFinBranch':
      interfaceName = 'investigate-finances-branchs';
      break;
    // 资质信息
    case 'sslmInvestgAuth':
      interfaceName = 'investigate-authes';
      break;
    // 联系人信息
    case 'sslmInvestgContact':
      interfaceName = 'investigate-contacts';
      break;
    // 地址信息
    case 'sslmInvestgAddress':
      interfaceName = 'investigate-addresses';
      break;
    // 开户行信息
    case 'sslmInvestgBankAccount':
      interfaceName = 'investigate-bank-accounts';
      break;
    // 主要客户情况
    case 'sslmInvestgCustomer':
      interfaceName = 'investigate-customers';
      break;
    // 分供方情况
    case 'sslmInvestgSubSupplier':
      interfaceName = 'investigate-sub-suppliers';
      break;
    // 设备信息
    case 'sslmInvestgEquipment':
      interfaceName = 'investigate-equipments';
      break;
    // 研发能力
    case 'sslmInvestgRd':
      interfaceName = 'investigate-rds';
      break;
    // 生产能力
    case 'sslmInvestgProduce':
      interfaceName = 'investigate-produces';
      break;
    // 质保能力
    case 'sslmInvestgQa':
      interfaceName = 'investigate-qas';
      break;
    // 售后服务
    case 'sslmInvestgCustservice':
      interfaceName = 'investigate-custservices';
      break;
    // 附件信息
    case 'sslmInvestgAttachment':
      interfaceName = 'investigate-attachments';
      break;
    default:
      break;
  }
  return request(`${prefix}/${organizationId}/${interfaceName}`, {
    method: 'DELETE',
    body: rowKeys,
  });
}
