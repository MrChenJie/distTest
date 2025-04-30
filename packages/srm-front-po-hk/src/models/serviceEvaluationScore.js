import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import {
  queryList,
  exportPdf,
} from '@/services/serviceEvaluationScoreService';

export default {
  namespace: 'serviceEvaluationScore',

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
            dataSource: res.content?.map(item => {
              const { categoryId, vendorNo } = item;
              return {
                ...item,
                rowKey: `${categoryId}${vendorNo}`,
              };
            }),
            pagination: createPagination(res),
          },
        });
      }
      return res;
    },

    *exportPdf({ payload }, { call }) {
      const res = getResponse(yield call(exportPdf, payload));
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
