/**
 * model 渠道商酬金数据查询页面
 * @date: 2022-11-21
 * @author: Xinyi <xinyi.he02@hand-china.com>
 * @copyright Copyright (c) 2022, Hand
 */
import {
  queryList,
  saveCommission,
  queryData,
  syncCommissionData,
  queryCost,
  checkCommissionAmount,
  checkCommissionRate,
} from '@/services/channelCommissionInquiryService';
import { getResponse } from '_cus_utils/utils';

export default {
  namespace: 'channelCommissionInquiry',

  state: {},

  effects: {
    // 渠道商酬金数据信息
    *queryList({ payload }, { call }) {
      const res = getResponse(yield call(queryList, payload));
      return res;
    },

    *saveCommission({ payload }, { call }) {
      const res = getResponse(yield call(saveCommission, payload));
      return res;
    },

    *queryData({ payload }, { call }) {
      const res = getResponse(yield call(queryData, payload));
      return res;
    },

    *syncCommissionData({ payload }, { call }) {
      const res = getResponse(yield call(syncCommissionData, payload));
      return res;
    },

    *queryCost({ payload }, { call }) {
      const res = getResponse(yield call(queryCost, payload));
      return res;
    },

    *checkCommissionAmount({ payload }, { call }) {
      const res = getResponse(yield call(checkCommissionAmount, payload));
      return res;
    },

    *checkCommissionRate({ payload }, { call }) {
      return getResponse(yield call(checkCommissionRate, payload));
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
