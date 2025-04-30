/*
 * contractMaintainService - 我发起的协议
 * @date: 2019-05-23
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
import { SRM_SPCM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// -获取列表数据
export async function queryList(params) {
  // const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/purchase-view/page`, {
    // query,
    query: parseParameters(params),
  });
}

export async function sureFileContract(params) {
  const { selectedRows } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/change-status?pcHeaderStatus=ARCHIVE`,
    {
      method: 'PUT',
      body: selectedRows,
    }
  );
}

export async function uploads(params) {
  const { pcHeaderId, archiveAttachmentUuid } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/archive-uuid?archiveAttachmentUuid=${archiveAttachmentUuid}`,
    {
      method: 'PUT',
      // body: params,
    }
  );
}

/**
 * 查询协议阶段
 * @param {*} params
 */
export async function fetchStage(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/contract-report/receiving/stage-accept/detail`, {
    query,
  });
}

/**
 * 查询执行单据
 * @param {*} params
 */
export async function fetchDocument(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPCM}/v1/${organizationId}/contract-report/receiving/execute-bills/detail`,
    {
      query,
    }
  );
}

/**
 * 查询执行单据
 * @param {*} params
 */
export async function fetchDetailList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/contract-report/receiving/details`, {
    query,
  });
}
