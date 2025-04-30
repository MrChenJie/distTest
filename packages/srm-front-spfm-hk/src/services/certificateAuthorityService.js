/*
 * @Description: certificateAuthorityService - CA认证
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-08-06 16:09:07
 * @LastEditTime: 2019-08-12 15:30:25
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hands
 */
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 查询列表
 * @param {Object} params - 查询参数
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ca-auth-result/page`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存列表页
 */
export async function save(body) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ca-auth-result/batch-save`, {
    method: 'PUT',
    body,
  });
}
/**
 * 查询明细
 * @param {Object} params - 查询参数
 */
export async function fetchDetailInfo(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-ca-auth-info/detail`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存明细
 */
export async function saveDetail(body) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-ca-auth-info`, {
    method: 'PUT',
    body,
  });
}

/**
 * 提交明细
 */
export async function submitDetail(body) {
  const { companyId } = body;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/company-ca-auth-info/${companyId}/submit`, {
    method: 'POST',
    body,
  });
}
