/**
 * @Description: 参与方稽核平台 - service
 * @date 2022-12-01
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';
import request from 'utils/request';
import { SRM_SQAM } from '_utils/config';

const organizationId = getCurrentOrganizationId();
const prompt = `${SRM_SQAM}/v1/${organizationId}`;

/**
 * 稽核数据查询
 * @param payload
 */
export async function fetchList(payload) {
  const query = filterNullValueObject(parseParameters(payload));
  return request(`${prompt}/business-data-audits/queryAuditData`, {
    method: 'GET',
    query,
  });
}

/**
 * 取消稽核数据
 * @param payload
 */
export async function cancelList(payload) {
  return request(`${prompt}/business-data-audits/cancelAuditData`, {
    method: 'POST',
    body: payload,
  });
}

/**
 * 创建参与方或者关联EBS Code
 * @param payload
 */
export async function createOrRelateCompanyData(payload) {
  const { operateType, data }  = payload;
  return request(`${prompt}/business-data-audits/createOrRelateCompanyData/${operateType}`, {
    method: 'POST',
    body: data,
  });
}
