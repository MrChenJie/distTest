/*
 * invitationList - 邀约汇总
 * @date: 2018/10/13 08:59:23
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, getCurrentOrganizationId, createPagination } from 'utils/utils';
import { fetchInviteList } from '@/services/invitationListService';
import { queryIdpValue } from 'hzero-front/lib/services/api';

const tenantId = getCurrentOrganizationId();
export default {
  namespace: 'invitationList',

  state: {
    emitList: [], // 发出的邀约列表
    receiveList: [], // 接收的邀约列表
    inviteType: [], // 邀请类型列表
    processStatus: [], // 邀约状态
    sendPagination: {},
    receivePagination: {},
    dataSourceMap: {},
    selectedRowKeys: [],
    privacyPolicyText: {},
  },

  effects: {
    // 查询发出的列表
    *fetchInviteList({ payload }, { call, put }) {
      const { searchType, ...query } = payload;
      const result = getResponse(yield call(fetchInviteList, { ...query, searchType, tenantId }));
      if (result) {
        if (searchType === 'send') {
          yield put({
            type: 'updateState',
            payload: {
              emitList: result.content || [],
              sendPagination: createPagination(result),
            },
          });
        } else if (searchType === 'receive') {
          yield put({
            type: 'updateState',
            payload: {
              receiveList: result.content || [],
              receivePagination: createPagination(result),
            },
          });
        }
      }
    },

    /**
     * 初始化值集获取
     * @param {Object} params
     * @param {Function} { call, put }
     */
    *init(params, { call, put }) {
      const inviteType = getResponse(yield call(queryIdpValue, 'SPFM.PARTNER_INVITE_TYPE'));
      const processStatus = getResponse(yield call(queryIdpValue, 'SPFM.PARTNER_INVITE_STATUS'));
      yield put({
        type: 'updateState',
        payload: {
          inviteType: inviteType || [],
          processStatus: processStatus || [],
        },
      });
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
