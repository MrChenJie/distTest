import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import {
  queryList,
} from '@/services/serviceEvaluationService';

export default {
  namespace: 'serviceEvaluation',

  state: {
    dataSource: [],
    pagination: [],
  },

  effects: {
    *queryList({ payload }, { call, put }) {
      const res = getResponse(yield call(queryList, payload));
      if (res) {
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
