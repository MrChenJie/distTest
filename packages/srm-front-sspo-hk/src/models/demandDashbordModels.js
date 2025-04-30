/*
 * demandQaModel - 需求人工作台model
 * @date: 2019-05-15
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { getFetchList } from '@/services/demandDashbordService';

export default {
  namespace: 'demandDashbordModels',

  state: {
    dataSource: [],
    pagination: {}
  },

  effects: {
    *getFetchList({ payload }, { put, call }) {
      const res = getResponse(yield call(getFetchList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: res.content.map((n) => ({
              ...n,
              _status: 'update',
            })),
            pagination: createPagination(res),
          },
        });
      }
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
