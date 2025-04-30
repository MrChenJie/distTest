import { getResponse } from 'utils/utils';
import { fetchData, save, deleteLines, units } from '@/services/csPermissionConfigService';

export default {
  namespace: 'csPermissionConfig',
  state: {},
  effects: {
    *fetchData({ payload }, { call }) {
      const res = yield call(fetchData, payload);
      return getResponse(res);
    },
    *save({ payload }, { call }) {
      const res = yield call(save, payload);
      return getResponse(res);
    },
    *delete({ payload }, { call }) {
      const res = yield call(deleteLines, payload);
      return getResponse(res);
    },
    *units({ payload }, { call }) {
      const res = yield call(units, payload);
      return getResponse(res);
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
