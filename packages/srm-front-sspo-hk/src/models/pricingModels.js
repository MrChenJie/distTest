/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2023-11-10 16:21:08
 * Copyright (c) 2023, All Rights Reserved. 
 */
/*
 * pricingModels - 核价model
 * @date: 2022-04-24
 * @author: CJ <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import { getResponse } from 'utils/utils';
import {
  fetchPricingList,
  saveAllQuotation,
  handleConfirm,
  computeRate,
  milestone,
  getQuotationTermsList,
} from '@/services/pricingService';

export default {
  namespace: 'pricingModels',

  state: {
    pricingAllDataSource: [],
    pricingAllPagination: {},
    pricingSingleDataSource: [],
    pricingSinglePagination: {},
    quotationTermsSource: [],
    quotationTermsPagination: {},
  },

  effects: {
    // 报价模式列表
    *fetchPricingList({ payload }, { call }) {
      const response = getResponse(yield call(fetchPricingList, payload));
      return response;
    },

    // 报总价模式保存
    *saveAllQuotation({ payload }, { call }) {
      const response = getResponse(yield call(saveAllQuotation, payload));
      return response;
    },

    // 确认核价
    *handleConfirm({ payload }, { call }) {
      const response = getResponse(yield call(handleConfirm, payload));
      return response;
    },

    // 计算汇率
    *computeRate({ payload }, { call }) {
      return getResponse(yield call(computeRate, payload));
    },

    // 里程碑列表
    *milestone({ payload }, { call }) {
      return getResponse(yield call(milestone, payload));
    },
    
    // 查询报价条款
    *getQuotationTermsList({ payload }, { call }) {
      return getResponse(yield call(getQuotationTermsList, payload));
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
