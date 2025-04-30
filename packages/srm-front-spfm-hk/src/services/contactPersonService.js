import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// /**
//  * 批量获取值集
//  */
// export async function initValueList() {
//   return queryMapIdpValue({
//     idTypeList: 'SPFM.ID_TYPE',
//   });
// }

/**
 * 批量获取值集
 */
export async function fetchBatchEnums(params) {
  return queryMapIdpValue(params);
}

/**
 * 查询当前公司的所有联系人
 * @param {!Number} companyId 公司id
 */
export async function contactPersonQueryAll(companyId) {
  return request(`${SRM_PLATFORM}/v1/companies/contacts/${companyId}`, {
    method: 'GET',
  });
}

// /**
//  * 创建或修改 公司联系人信息
//  * @param {!Number} companyId 公司ID
//  * @param {Object[]}} companyContactList 联系人信息
//  */
// export async function contactPersonUpdateOrCreate(companyId, companyContactList) {
//   return request(`${SRM_PLATFORM}/v1/companies/contacts/${companyId}`, {
//     method: 'POST',
//     body: companyContactList,
//   });
// }
/**
 * 创建 公司联系人信息
 * @param {!Number} companyId 公司ID
 * @param {Object[]}} companyContact 联系人信息
 */
export async function contactPersonCreate(companyId, companyContact) {
  return request(`${SRM_PLATFORM}/v1/companies/contacts/${companyId}`, {
    method: 'POST',
    body: companyContact,
  });
}
/**
 * 创建 公司售后联系人信息
 * @param {!Number} companyId 公司ID
 * @param {!String} businessType 线条状态
 * @param {Object[]}} companyContact 联系人信息
 */
export async function contactPersonCreate1(companyId, businessType, companyContact) {
  return request(`${SRM_PLATFORM}/v1/companies/contacts/${companyId}/${businessType}`, {
    method: 'POST',
    body: companyContact,
  });
}
/**
 * 修改 公司联系人信息
 * @param {!Number} companyId 公司ID
 * @param {Object[]}} companyContactId 联系人id
 * @param {Object[]}} companyContact 联系人信息
 */
export async function contactPersonUpdate(companyId, companyContactId, companyContact) {
  return request(`${SRM_PLATFORM}/v1/companies/contacts/${companyId}/${companyContactId}`, {
    method: 'PUT',
    body: companyContact,
  });
}

/**
 * 验证当前公司的联系人是否合法
 * @param {!Number} companyId 公司Id
 */
export async function contactPersonVerification(companyId) {
  return request(`${SRM_PLATFORM}/v1/companies/contacts/${companyId}/verification`, {
    method: 'GET',
  });
}

/**
 * 删除地址数据
 * @description DELETE /v1/{organizationId}/participant-access/del-contact/{companyId}
 */
export async function deleteContactPersons(params) {
  const { companyId, deleteData } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/participant-access/del-contact/${companyId}`, {
    method: 'DELETE',
    body: deleteData,
  });
}
