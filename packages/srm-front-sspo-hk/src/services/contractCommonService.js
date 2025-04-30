/*
 * contractCommonService - 协议公共service
 * @Author: HB <bin.huang02@hand-china.com>
 * @Date: 2019-08-02 09:22:50
 * @LastEditTime: 2019-11-07 19:41:19
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_FILE } from 'utils/config';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  getUserOrganizationId,
} from 'utils/utils';
import { SRM_SPCM, SRM_PLATFORM } from '_utils/config';
import { SRM_BID } from '@/common/config'

// const SRM_SPCM = '/spcm-22192';

const organizationId = getCurrentOrganizationId();

/**
 * 协议拟制详情头查询
 * @param {String} pcHeaderId - 头id
 */
export async function fetchHeader({ pcHeaderId, customizeUnitCode }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}`, {
    method: 'GET',
    query: { customizeUnitCode },
  });
}

/**
 * 合作伙伴行不分页查询
 * @param {String} params - 参数
 */
export async function fetchPartner(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-partner/list`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}
/**
 * 标的信息行查询
 * @param {String} params - 参数
 */
export async function fetchSubject(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-subject/page`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}
/**
 * 协议阶段行查询
 * @param {String} params - 参数
 */
export async function fetchStage(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/stage/page`, {
    method: 'GET',
    query: otherParams,
  });
}
/**
 * 业务条款行不分页查询
 * @param {String} params - 参数
 */
export async function fetchTerm(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-term/list`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 业务条款行分页查询
 * @param {String} params - 参数
 */
export async function fetchTermPage(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-term/page`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 查询品类定义
 * @param {Object} params
 */
export async function fetchOperationRecord(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { pcHeaderId, ...otherQuery } = query;
  return request(`/spcm/v1/${organizationId}/purchase-contract-action/${pcHeaderId}/page`, {
    method: 'GET',
    query: otherQuery,
  });
}

/* 获取fileList
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function fetchFilesByUrl(params) {
  const { bucketName, urls } = params;
  return request(`${HZERO_FILE}/v1/${organizationId}/files`, {
    method: 'POST',
    query: { bucketName },
    body: urls,
  });
}

/* deleteFilesByUrl - 删除url对应文件
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function deleteFilesByUrl(params) {
  const { bucketName, urls } = params;
  return request(`${HZERO_FILE}/v1/${organizationId}/files/delete-by-url`, {
    method: 'POST',
    query: { bucketName },
    body: urls,
  });
}

/* 查询协议头下面的配置附件列表
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function fetchPcAttachmentList(pcHeaderId) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-attachment/list`
  );
}

/* 更新协议头下面的配置附件信息
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function updatePcAttachmentList(params) {
  const { body, pcHeaderId } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/pc-attachment`, {
    method: 'PUT',
    body,
  });
}

/* 更新协议头下面的供应商uuid
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function updateSupplierUuid(params) {
  const { pcHeaderId } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/attachment-uuid/supplier`,
    {
      method: 'PUT',
      body: params,
    }
  );
}
/* 更新协议头下面的采购方uuid
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function updatePurchaseUuid(params) {
  const { pcHeaderId } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/attachment-uuid/purchase`,
    {
      method: 'PUT',
      body: params,
    }
  );
}
/* 更新协议模板的附件url
 * @param {object} params 传递参数
 * @param {string} params.urls - 文件urls
 */
export async function updateContractTemplateUrl(params) {
  const { pcTemplateId } = params;
  return request(
    `${SRM_SPCM}/v1/${getUserOrganizationId()}/purchase-contract-template/${pcTemplateId}/attachment`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

/**
 * 查询配置中心配置
 * @param {*} params
 */
export async function fetchConfigSetting() {
  return request(`${SRM_PLATFORM}/v1/${getUserOrganizationId()}/settings`, {
    method: 'GET',
  });
}

export async function saveProject(params) {
  const { body } = params;
  console.log(params)
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos`,{
    method: 'post',
    body
  });
}
/**
 * 返利信息查询
 * @param {*} params
 */
export async function fetchContractRebate(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPCM}/v1/${organizationId}/pc-rebate-informations/${pcHeaderId}/pc-rebate/page`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}
/**
 * 查询返利信息下的公司列表
 * @param {Object} params - 查询参数
 */
export async function fetchCompany(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPCM}/v1/${organizationId}/pc-affiliated-companys/${param.rebateInformationId}/page`,
    {
      method: 'GET',
      query: { ...param },
    }
  );
}

/**
 * 查询返利信息下的新增公司列表
 * @param {Object} params - 查询参数
 */
export async function fetchAddCompany(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/page/increase_company`, {
    method: 'GET',
    query: { ...param },
  });
}
/**
 * 保存协议类型列表下的新增公司
 * @param {Object} params - 查询参数
 */
export async function saveCompany(params) {
  const { rebateInformationId, companyDataSource } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/pc-affiliated-companys/${rebateInformationId}/company`,
    {
      method: 'POST',
      body: companyDataSource,
    }
  );
}

/**
 * 获取工作台头部信息
 */
 export async function getHeaderInfo(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-infos/listCount`, {
    method: 'GET',
    query: params,
  });
}
