import { getResponse } from '_cus_utils/utils';
import { queryList, batchRemoveFiles, submitEvaluate } from '@/services/customTemplateService';
import { queryFileList } from '@/services/cooperativeEventsService';

export default {
  namespace: 'customTemplate',

  state: {
    emsCooperateFiles: [],
    evaluationScore: undefined,
  },

  effects: {
    *queryList({ payload }, { call, put }) {
      const res = getResponse(yield call(queryList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            contractInfo: res,
            emsCooperateFiles: res.emsCooperateFiles,
          },
        });
      }
      return res;
    },

    *batchRemoveFiles({ payload }, { call }) {
      return getResponse(yield call(batchRemoveFiles, payload));
    },

    *queryFileList({ payload }, { call }) {
      return getResponse(yield call(queryFileList, payload));
    },

    *submitEvaluate({ payload }, { call }) {
      return getResponse(yield call(submitEvaluate, payload));
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
