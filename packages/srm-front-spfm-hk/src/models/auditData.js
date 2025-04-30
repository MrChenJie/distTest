/**
 * @Description: 参与方稽核平台 - model
 * @date 2022-12-01
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import { getResponse } from 'utils/utils';
import { fetchList, cancelList, createOrRelateCompanyData } from '@/services/auditDataService';

export default {
  namespace: 'auditData',
  state: {},

  effects: {
    *fetchList({ payload }, { call }) {
      return getResponse(yield call(fetchList, payload));
    },
    *cancelList({ payload }, { call }) {
      return getResponse(yield call(cancelList, payload));
    },
    *createOrRelateCompanyData({ payload }, { call }) {
      return getResponse(yield call(createOrRelateCompanyData, payload));
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
