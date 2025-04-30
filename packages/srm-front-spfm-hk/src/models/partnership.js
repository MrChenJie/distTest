/**
 * model 集团企业查询
 * @date: 2018-8-7
 * @author: <tingmin.deng@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { queryIdpValue } from 'hzero-front/lib/services/api';
import {
  queryPartnership,
  queryActionDetail,
  queryGroupData,
  updateGroupData,
  queryCompanyData,
  updateCompanyData,
} from '@/services/partnershipService';

export default {
  namespace: 'partnership',

  state: {
    list: {}, // 合作关系列表
    actionList: {}, // 合作关系操作记录
    inviteCompleteStatus: [], // 邀约完成状态值集
    inviteStatus: [], // 邀约状态值集
    companyDataSource: [], // 公司查询列表
    groupDataSource: [], // 集团查询列表
    groupSaveFlag: false,
    pagination: {}, // 参数
    groupPagination: {}, // 集团参数
    companyPagination: {}, // 公司参数
  },

  effects: {
    // 查询邀约状态值集
    *queryIdpValue(_, { call, put }) {
      const inviteStatusRes = yield call(queryIdpValue, 'SPFM.PARTNER_INVITE_STATUS');
      const inviteCompleteStatusRes = yield call(queryIdpValue, 'SPFM.INVITE_COMPLETE_STATUS');
      const inviteStatus = getResponse(inviteStatusRes);
      const inviteCompleteStatus = getResponse(inviteCompleteStatusRes);
      yield put({
        type: 'updateState',
        payload: {
          inviteStatus,
          inviteCompleteStatus,
        },
      });
    },

    // 查询合作关系
    *queryPartnership({ payload }, { call, put }) {
      const res = yield call(queryPartnership, payload);
      const list = getResponse(res);
      const pagination = createPagination(list);
      yield put({
        type: 'updateState',
        payload: { list, pagination },
      });
      return list;
    },

    // 查询操作明细
    *queryActionDetail({ payload }, { call, put }) {
      const res = yield call(queryActionDetail, payload);
      const actionList = getResponse(res);
      yield put({
        type: 'updateState',
        payload: { actionList },
      });
      return actionList;
    },
    // 查询集团列表
    *queryGroupData({ payload }, { call, put }) {
      const res = yield call(queryGroupData, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            groupDataSource: list,
            groupPagination: createPagination(list),
          },
        });
      }
    },

    // 更改集团列表
    *updateGroupData({ payload }, { call }) {
      const res = yield call(updateGroupData, payload);
      const list = getResponse(res);
      return list;
    },

    // 查询公司列表
    *queryCompanyData({ payload }, { call, put }) {
      const res = yield call(queryCompanyData, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            companyDataSource: list,
            companyPagination: createPagination(list),
          },
        });
      }
    },

    // 更新公司数据
    *updateCompanyData({ payload }, { call }) {
      const res = yield call(updateCompanyData, payload);
      const list = getResponse(res);
      return list;
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
