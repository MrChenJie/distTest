/*
 * JudgesDashbordService - 协议拟制service
 * @date: 2022-04-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_BID } from '@/common/config';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';
const organizationId = getCurrentOrganizationId();

/**
 * -评委/审计权限数据查询
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-judgess/selectJudgeWorkbench/${params.state}`, {
    method: 'GET',
    query
  });
}

/**
 * 点击阅读评委守则的事件
 */
export async function setReadState(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-judgess/selectJudgesRuleState/${params.proId}`, {
    method: 'GET',
  });
}

/**
 * 阅读评委守则后的确认状态更新
 */
export async function updateReadState(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-pro-judgess/updateJudgesRuleState?proId=${params.proId}&stateNum=${params.stateNum}&organizationId=${params.organizationId}`, {
    method: 'GET',
  });
}
