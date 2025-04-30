/*
 * demandQaModel - 需求人答疑model
 * @date: 2019-05-15
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import { fetchDemandList, saveDemand, queryDemandInfo,demandSubmit, checkIsAllQaPublished } from '@/services/demandQaService';

export default {
  namespace: 'demandQaModels',

  state: {
    demandDataSource: [],
    demandPagination: {},
    poHeader: {}
  },

  effects: {
    // 需求人答疑表
    *fetchDemandList({ payload }, { call }) {
      const response = getResponse(yield call(fetchDemandList, payload));
      return response;
    },
    
    // 需求人答疑保存
    *saveDemand({ payload }, { call }) {
      const response = getResponse(yield call(saveDemand, payload));
      return response;
    },

    *queryDemandInfo({ payload }, { put, call }) {
      const res = getResponse(yield call(queryDemandInfo, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            poHeader: res || {},
          },
        });
      }
      return res;
    },

    // 查询单子是否提交
    *checkIsAllQaPublished({ payload }, { call }) {
      const response = getResponse(yield call(checkIsAllQaPublished, payload));
      return response;
    },

    // 提交
    *demandSubmit({ payload }, { put, call }) {
      const response = getResponse(yield call(demandSubmit, payload));
      return response;
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
