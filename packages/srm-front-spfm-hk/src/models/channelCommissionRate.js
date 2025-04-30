/**
 * model 渠道商酬金比例维护
 * @date: 2022-11-21
 * @author: Xinyi <xinyi.he02@hand-china.com>
 * @copyright Copyright (c) 2022, Hand
 */
import {
  queryList,
  save,
  updateCommissionRate,
  queryCommissionRateAudit,
  readChannelFile,
} from '@/services/channelCommissionRateService';
import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';

export default {
  namespace: 'channelCommissionRate',

  state: {
    dataSource: [],
    pagination: {},
  },

  effects: {
    // 获取渠道商酬金比例信息
    *queryList({ payload }, { call, put }) {
      const res = getResponse(yield call(queryList, payload));
      if (res && res.content) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: res.content,
            pagination: createPagination(res),
          },
        });
      }
      return res;
    },

    *save({ payload }, { call }) {
      const res = getResponse(yield call(save, payload));
      return res;
    },

    *updateCommissionRate({ payload }, { call }) {
      const res = getResponse(yield call(updateCommissionRate, payload));
      return res;
    },

    *queryCommissionRateAudit({ payload }, { call }) {
      const res = getResponse(yield call(queryCommissionRateAudit, payload));
      return res;
    },

    *readChannelFile({ payload }, { call }) {
      const res = getResponse(yield call(readChannelFile, payload));
      return res;
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
