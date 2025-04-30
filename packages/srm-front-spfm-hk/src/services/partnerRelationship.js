/*
 * partnerRelation - 参与方关联关系
 * @date: 2022-04-25
 * @author: CQX <yuzhang.dong@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import cusRequest from '_cus_utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';

const organizationId = getCurrentOrganizationId();

// 参与方关联关系汇总列表查询
export async function queryPartnerRelationList(params) {
  const queryParams = filterNullValueObject(parseParameters(params));
  return cusRequest(`${SRM_PLATFORM}/v1/${organizationId}/company-relationships`, {
    method: 'GET',
    query: queryParams,
  });
}

// 参与方关联关系操作记录
export async function queryOperationRecordsList(params) {
  const { page, record } = params;
  const queryParams = filterNullValueObject(parseParameters(page));
  return cusRequest(`${SRM_PLATFORM}/v1/${organizationId}/company-rs-headers/records`, {
    method: 'POST',
    query: queryParams,
    body: record,
  });
}

export async function queryPartnerRelationDetail(params) {
  // const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`${SRM_PLATFORM}/v1/companies/basic/queryPartnerRelationDetail`, {
    method: 'GET',
    query: params,
  });
}

// 保存参与方关联关系新建单
export async function saveNewPartnerRelation(params) {
  // const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`${SRM_PLATFORM}/v1/${organizationId}/company-rs-headers/save-new`, {
    method: 'POST',
    body: params,
  });
}

// 保存参与方关联关系更新单
export async function saveUpdatePartnerRelation(params) {
  // const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`${SRM_PLATFORM}/v1/${organizationId}/company-rs-headers/save-update`, {
    method: 'POST',
    body: params,
  });
}

// 参与方关联关系操作记录单据明细
export async function queryRsHeaders(params) {
  const { rsHeaderId } = params;
  // const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`${SRM_PLATFORM}/v1/${organizationId}/company-rs-headers/detail/${rsHeaderId}`, {
    method: 'GET',
    query: params,
  });
}

// 参与方关联关系更新单据明细
export async function queryUpdateRelationList(params) {
  const { fromCompanyId } = params;
  // const query = filterNullValueObject(parseParameters(params));
  return cusRequest(
    `${SRM_PLATFORM}/v1/${organizationId}/company-rs-headers/updateDetail/${fromCompanyId}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

// 验证关联关系是否存在
export async function validateRelationship(params) {
  // const query = filterNullValueObject(parseParameters(params));
  return cusRequest(`${SRM_PLATFORM}/v1/${organizationId}/company-rs-headers/validateRelationship`, {
    method: 'POST',
    body: params,
  });
}

// 获取部门信息接口
export async function getDepatement(params) {
  // const query = filterNullValueObject(parseParameters(params));
  const { createdBy } = params;
  return cusRequest(
    `${SRM_PLATFORM}/v1/${organizationId}/company-rs-headers/creator-dept/${createdBy}`,
    {
      method: 'GET',
      query: params,
      responseType: 'text',
    }
  );
}
