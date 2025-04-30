import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import { queryList, deleteList } from '@/services/resaleRequestService';
import uuidv4 from 'uuid/v4';

export default {
  namespace: 'resaleRequest',

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
            dataSource: res.content.map(item => ({ rowKey: uuidv4(), ...item })),
            pagination: createPagination(res),
          },
        });
      }
      return res;
    },
    *deleteList({ payload }, { call }) {
      return getResponse(yield call(deleteList, payload));
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
