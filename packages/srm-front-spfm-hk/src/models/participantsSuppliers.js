/*
 * invitationList - 邀约汇总
 * @date: 2020-08-12
 * @author: CQX <qingxin.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { queryUnifyIdpValue, queryIdpValue } from 'services/api';
import {
  fetchParticipantsList,
  fetchCompanySupplierList,
  fetchListChannelCompanySupplier,
  getDeleteFlag,
  deleteCompanySupplier,
  getInviteViewFlag,
  inviteRegister,
  inviteCooperation,
  onceToComplete,
  getButtonPermission,
  returnToSupplier,
  fetchInviteData,
  queryLabelContent,
  sendFeishu,
} from '@/services/participantsSuppliers';
import { fetchIndustries } from '@/services/businessService';
import { permissions } from '@/services/commonService';
import uuidv4 from 'uuid/v4';

export default {
  namespace: 'participantsSuppliers',
  state: {
    participantsList: [],
    participantsPagination: {},
    industries: [], // 使用行业的数据当做品类的数据

    editFlag: undefined, // 编辑权限 Y-可编辑，N-不可编辑
  },
  effects: {
    *init({ payload }, { call, put }) {
      const industries = yield call(fetchIndustries, payload);
      yield put({
        type: 'updateState',
        payload: {
          industries,
        },
      });
    },

    // 查询公司值集
    *fetchCompany({ payload }, { call }) {
      const res = getResponse(yield call(queryUnifyIdpValue, 'HPFM.COMPANY', payload));
      return res;
    },

    // 查询新增客户链接值集
    *fetchCustomerLink(_, { call }) {
      const res = getResponse(yield call(queryIdpValue, 'NEW_CUST_LINK'));
      return res;
    },

    //  查询列表
    *fetchParticipantsList({ payload }, { call, put }) {
      const res = yield call(fetchParticipantsList, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            participantsList: (res.content || []).map(item => {
              return { ...item, rowKey: uuidv4() };
            }),
            participantsPagination: createPagination(res),
          },
        });
      }
    },

    //  新的查询列表
    *fetchCompanySupplierList({ payload }, { call, put }) {
      const res = yield call(fetchCompanySupplierList, payload);
      if (cusGetResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            participantsList: (res.content || []).map(item => {
              return { ...item, rowKey: uuidv4() };
            }),
            participantsPagination: createPagination(res),
          },
        });
      }
    },

    //  新的查询列表
    *fetchListChannelCompanySupplier({ payload }, { call, put }) {
      const res = yield call(fetchListChannelCompanySupplier, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            participantsList: (res.content || []).map(item => {
              return { ...item, rowKey: uuidv4() };
            }),
            participantsPagination: createPagination(res),
          },
        });
      }
    },

    *getDeleteFlag({ payload }, { call }) {
      return cusGetResponse(yield call(getDeleteFlag, payload));
    },

    *deleteCompanySupplier({ payload }, { call }) {
      return cusGetResponse(yield call(deleteCompanySupplier, payload));
    },

    *getInviteViewFlag({ payload }, { call }) {
      const res = getResponse(yield call(getInviteViewFlag, payload));
      return res;
    },

    *inviteRegister({ payload }, { call }) {
      const res = cusGetResponse(yield call(inviteRegister, payload));
      return res;
    },

    *inviteCooperation({ payload }, { call }) {
      const res = cusGetResponse(yield call(inviteCooperation, payload));
      return res;
    },

    *permissions({ payload }, { call, put }) {
      const response = getResponse(yield call(permissions, payload));
      if (response) {
        const { editFlag } = response;
        yield put({
          type: 'updateState',
          payload: {
            editFlag,
          },
        });
      }
    },
    *onceToComplete({ payload }, { call }) {
      return getResponse(yield call(onceToComplete, payload));
    },

    *getButtonPermission({ payload }, { call }) {
      return getResponse(yield call(getButtonPermission, payload));
    },

    *returnToSupplier({ payload }, { call }) {
      return getResponse(yield call(returnToSupplier, payload));
    },

    *fetchInviteData({ payload }, { call }) {
      return getResponse(yield call(fetchInviteData, payload));
    },
    *queryLabelContent({ payload }, { call }) {
      return getResponse(yield call(queryLabelContent, payload));
    },

    *sendFeishu({ payload }, { call }) {
      return getResponse(yield call(sendFeishu, payload));
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
