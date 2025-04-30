import { getResponse } from 'utils/utils';

import { deleteConfig, queryConfigAll, queryConfigByOptions, saveConfig } from '@/services/homeServices';

export default {
  namespace: 'home',
  state: {},
  effects: {
    * queryConfigAll({ payload }, { call }) {
      const response = getResponse(yield call(queryConfigAll, payload));
      return response;
    },
    * queryConfigByOptions({ payload }, { call }) {
      const response = getResponse(yield call(queryConfigByOptions, payload));
      return response;
    },
    * deleteConfig({ payload }, { call }) {
      const response = getResponse(yield call(deleteConfig, payload));
      return response;
    },
    * saveConfig({ payload }, { call }) {
      const response = getResponse(yield call(saveConfig, payload));
      return response;
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
