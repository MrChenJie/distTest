import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import {
  queryList,
  saveEvents,
  getEmsCooperateFiles,
  batchRemove,
  batchSave,
  queryFileList,
  batchRemoveFiles,
} from '@/services/cooperativeEventsService';

export default {
  namespace: 'cooperativeEvents',

  state: {
    dataSource: [],
    pagination: {},
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

    *saveEvents({ payload }, { call }) {
      return getResponse(yield call(saveEvents, payload));
    },

    *getEmsCooperateFiles({ payload }, { call }) {
      return getResponse(yield call(getEmsCooperateFiles, payload));
    },

    *batchRemove({ payload }, { call }) {
      return getResponse(yield call(batchRemove, payload));
    },

    *batchSave({ payload }, { call }) {
      return getResponse(yield call(batchSave, payload));
    },

    *queryFileList({ payload }, { call }) {
      return getResponse(yield call(queryFileList, payload));
    },

    *batchRemoveFiles({ payload }, { call }) {
      return getResponse(yield call(batchRemoveFiles, payload));
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
