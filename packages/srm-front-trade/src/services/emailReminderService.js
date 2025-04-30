/**
 * @Description: 接口监控 -邮件提醒
 * @date 2023-02-17
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import request from 'utils/request';
import { SRM_SPUB } from '@/utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';

const organizationId = getCurrentOrganizationId();
const commonPrompt = `${SRM_SPUB}/v1/${organizationId}`;

export async function queryData(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${commonPrompt}/interfacemonitors`, {
    method: 'GET',
    query: param,
  });
}

export async function save(params) {
  return request(`${commonPrompt}/interfacemonitors`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteList(params) {
  return request(`${commonPrompt}/interfacemonitors`, {
    method: 'DELETE',
    body: params,
  });
}
