/**
 * DICT合作伙伴入库model
 * @Author: qi.xue01@hand-china.com
 * @Date: 2024/10/18
 * @Copyright: Copyright (c), 2024, hand
 */
import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import uuid from 'uuid/v4';
import {
  delContactInfo,
  delCustomerInfo,
  deletePartnerInfo,
  delFiles,
  delFinance,
  delProjectInfo, getCooperationMode,
  queryContactInfo,
  queryCustomerInfo,
  queryFiles,
  queryFinance,
  queryPartnerBaseData,
  queryPartnerInfoUpdateList,
  queryProjectInfo,
  saveContactInfo,
  saveCustomerInfo,
  saveFiles,
  saveFinance,
  savePartnerBaseData,
  saveProjectInfo,
} from '@/services/partnerInfoUpdateManagementService';

function dealDataState(data) {
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map((item) => {
      return {
        ...item,
        rowKey: uuid(),
      };
    });
  }
  return config;
}

export default {
  namespace: 'partnerInfoUpdateManagement',
  state: {
    tableData: [],
    pagination: {},
  },
  effects: {
    *getCooperationMode({ payload }, { call }) {
      return getResponse(yield call(getCooperationMode, payload));
    },
    *queryPartnerInfoUpdateList({payload}, { call, put }) {
      const res = yield call(queryPartnerInfoUpdateList, payload);
      const response = getResponse(res);
      if(response) {
        yield put({
          type: 'updateState',
          payload: {
            tableData: dealDataState(response.content),
            pagination: createPagination(response),
          }
        })
      }
    },
    *deletePartnerInfo({payload}, { call, put }) {
      const res = yield call(deletePartnerInfo, payload);
      return getResponse(res);
    },
    *queryPartnerBaseData({payload}, { call, put }) {
      const res = yield call(queryPartnerBaseData, payload);
      return getResponse(res);
    },
    *queryContactInfo({payload}, { call, put }) {
      const res = yield call(queryContactInfo, payload);
      return getResponse(res);
    },
    *queryCustomerInfo({payload}, { call, put }) {
      const res = yield call(queryCustomerInfo, payload);
      return getResponse(res);
    },
    *queryProjectInfo({payload}, { call, put }) {
      const res = yield call(queryProjectInfo, payload);
      return getResponse(res);
    },
    *queryFiles({payload}, { call, put }) {
      const res = yield call(queryFiles, payload);
      return getResponse(res);
    },
    *savePartnerBaseData({payload}, { call, put}) {
      const res = yield call(savePartnerBaseData, payload);
      return getResponse(res);
    },
    *saveContactInfo({payload}, { call, put }) {
      const res = yield call(saveContactInfo, payload);
      return getResponse(res);
    },
    *saveCustomerInfo({payload}, { call, put }) {
      const res = yield call(saveCustomerInfo, payload);
      return getResponse(res);
    },
    *saveProjectInfo({payload}, { call, put }) {
      const res = yield call(saveProjectInfo, payload);
      return getResponse(res);
    },
    *saveFiles({payload}, { call, put }) {
      const res = yield call(saveFiles, payload);
      return getResponse(res);
    },
    *delContactInfo({payload}, { call, put }) {
      const res = yield call(delContactInfo, payload);
      return getResponse(res);
    },
    *delCustomerInfo({payload}, { call, put }) {
      const res = yield call(delCustomerInfo, payload);
      return getResponse(res);
    },
    *delProjectInfo({payload}, { call, put }) {
      const res = yield call(delProjectInfo, payload);
      return getResponse(res);
    },
    *delFiles({payload}, { call, put }) {
      const res = yield call(delFiles, payload);
      return getResponse(res);
    },
    *saveFinance({payload}, { call, put }) {
      const res = yield call(saveFinance, payload);
      return getResponse(res);
    },
    *queryFinance({payload}, { call, put }) {
      const res = yield call(queryFinance, payload);
      return getResponse(res);
    },
    *delFinance({payload}, { call, put }) {
      const res = yield call(delFinance, payload);
      return getResponse(res);
    },

  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
}
