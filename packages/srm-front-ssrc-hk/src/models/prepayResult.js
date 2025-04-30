import { getResponse } from '_cus_utils/utils';
import { fetchData, newPushEBS } from '../services/prepayResultServices';

export default {
  namespace: 'prepayResult',
  state: {},
  effects: {
    *fetchData({ payload }, { call }) {
      const res = yield call(fetchData, payload);
      return getResponse(res);
    },

    *newPushEBS({ payload }, { call }) {
      return getResponse(yield call(newPushEBS, payload));
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
