/**
 * model 公司
 * @date: 2018-8-24
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import {
  fetchCompany,
  enableCompany,
  disableCompany,
  saveCurrency,
} from '@/services/companyService';
import { getResponse } from 'utils/utils';

export default {
  namespace: 'spfmCompany',

  state: {
    companyFormKey: '',
    companyList: [],
  },

  effects: {
    // 获取公司信息
    *fetchCompany({ payload }, { call, put }) {
      const res = yield call(fetchCompany, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'saveReducers',
          payload: {
            companyList: list,
          },
        });
      }
    },
    // 设置公司启用
    *enableCompany({ payload }, { call }) {
      const res = yield call(enableCompany, payload);
      return getResponse(res);
    },

    // 设置公司禁用
    *disableCompany({ payload }, { call }) {
      const res = yield call(disableCompany, payload);
      return getResponse(res);
    },

    // 设置公司禁用
    *saveCurrency({ payload }, { call }) {
      const res = yield call(saveCurrency, payload);
      return getResponse(res);
    },
  },
  reducers: {
    saveReducers(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
