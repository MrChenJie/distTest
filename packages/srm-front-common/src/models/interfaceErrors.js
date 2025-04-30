import { getResponse, createPagination } from 'utils/utils';
import {
  queryList,
  queryDetail,
} from '@/services/interfaceErrorsService';

export default {
  namespace: 'interfaceErrors',

  state: {
    dataSource: [],
    pagination: {},
    detailList: {},
  },

  effects: {
    *queryList({ payload }, { call, put }) {
      const res = yield call(queryList, payload);
      if (getResponse(res)) {
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

    *queryDetail({ payload }, { call, put }) {
      const res = yield call(queryDetail, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            detailList: res,
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
