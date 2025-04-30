/*
 * pricingComparisonModels - 比价
 * @date: 2022-04-24
 * @author: CJ <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import {getResponse } from 'utils/utils';
import {
    priceHeaderInfo,
    getNewPrice,
    fetchHistoryQuotationProcessChart
} from '@/services/priceComparisonService';

export default {
  namespace: 'priceComparisonModels',

  state: {
    poHeaderInfo: {},
    historyQuotationProcessChartList: [], // 本次报价过程折线图
  },

  effects: {
    // 比价-头信息
    *priceHeaderInfo({ payload }, { put, call }) {
      const response = getResponse(yield call(priceHeaderInfo, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            poHeaderInfo: response || {},
          },
        });
      }
      return response;
    },

    *getNewPrice({ payload }, { call }) {
      const response = getResponse(yield call(getNewPrice, payload));
      return response;
    },

    // 查询本次报价过程-折线图表
    *fetchHistoryQuotationProcessChart({ payload }, { call, put }) {
      let result = yield call(fetchHistoryQuotationProcessChart, payload);
      result = getResponse(result);
      // console.log('result',result)
      // if (result) {
      //   // console.log(123)
      //   yield put({
      //     type: 'updateState',
      //     payload: {
      //       historyQuotationProcessChartList: result,
      //     },
      //   });
      // }
      return result
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
