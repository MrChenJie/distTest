/**
 * @Description: 应付发票导入记录 service
 * @date 2023-02-22
 * @author <xinyi.he02@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import request from 'utils/request';
import { SRM_SPUB } from '@/utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';

const organizationId = getCurrentOrganizationId();
const commonPrompt = `${SRM_SPUB}/v1/${organizationId}`;

/**
* 应付发票导入记录查询API
* @param {Object} params - 查询参数
*/
export async function queryData(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${commonPrompt}/ap-invoice-import/list`, {
    method: 'GET',
    query: param,
  });
}

export async function queryDetail(params) {
  const { invoiceImportId } = params;
  return request(`${commonPrompt}/ap-invoice-import/detail/${invoiceImportId}`, {
    method: 'GET',
  });
}
