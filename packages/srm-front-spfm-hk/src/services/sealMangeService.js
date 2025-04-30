/*
 * index-印章管理
 * @date: 2019-08-07
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  //   getResponse,
} from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 查询-列表页
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ca-auth-result/page`, {
    method: 'GET',
    query,
  });
}

/**
 * -详情头查询
 * @param {String} pcTypeId - 头id
 */
export async function queryModalList(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { companyId } = query;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/seal/company/${companyId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 模态框保存修改
 * @async
 * @function update
 * @param {object}  body - 头数据
 * @returns {object} fetch Promise
 */
export async function update(body) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/seal/company/${body.companyId}/batch-save`, {
    method: 'POST',
    body: body.lines,
  });
}

/**
 * -模态框删除功能
 */
export async function deletes(params) {
  const { body, companyId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/seal/company/${companyId}/batch-delete`, {
    method: 'DELETE',
    body,
  });
}
