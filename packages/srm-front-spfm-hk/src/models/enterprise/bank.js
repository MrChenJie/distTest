import { fetchBankData, saveBankData, queryCurrentCMIData, deleteBank } from '@/services/bankService';
import { getResponse } from 'utils/utils';

export default {
  namespace: 'enterpriseBank',

  state: {
    bankList: [],
    CurrentCMIData: {},
  },

  effects: {
    *queryBankAccount({ payload }, { call, put }) {
      // const { ...params } = payload;
      const bankAccountData = getResponse(yield call(fetchBankData, payload));
      if (bankAccountData) {
        yield put({
          type: 'updateState',
          payload: {
            bankList: bankAccountData,
          },
        });
      }
    },

    *queryCurrentCMIData({ payload }, { call, put } ){
      const res = yield call(queryCurrentCMIData, payload);
      if (res){
        yield put({
          type: 'updateState',
          payload: {
            currentCMIData: res.content[0] || {},
          },
        });
      }
    },

    *saveBankAccount({ payload }, { call }) {
      const bankAccountData = getResponse(yield call(saveBankData, payload));
      return bankAccountData;
    },

    *deleteBank({ payload }, { call }) {
      return getResponse(yield call(deleteBank, payload));
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
