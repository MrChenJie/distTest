import { fetchData, syncDelegateInfo } from '../services/delegateInfoService';
import { getResponse } from 'utils/utils';

export default {
  namespace: 'delegateInfo',
  state: {},
  effects: {
    *fetchData({ payload }, { call }) {
      const res = yield call(fetchData, payload);
      return getResponse(res);
    },

    // *newPushEBS({ payload }, { call }) {
    //   return getResponse(yield call(newPushEBS, payload));
    // },
    *syncDelegateInfo({ payload }, { call }) {
      return getResponse(yield call(syncDelegateInfo, payload));
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
