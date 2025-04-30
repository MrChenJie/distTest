import uuid from 'uuid/v4';
import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import {
  queryList,
  getPartnerInfo,
  queryQAList,
  saveQAList,
  subQAList,
} from '@/services/clarificationService';

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
  namespace: 'qaManagementModel',

  state: {
    dataSource: [], // 数据源
    pagination: {}, // 分页对象
    partnerInfo: {}, // 基本信息
  },

  effects: {
    // 合作伙伴列表查询
    *queryList({ payload }, { call, put }) {
      const res = yield call(queryList, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: dealDataState(response.content),
            pagination: createPagination(response),
          },
        });
      }
      return res;
    },

    *getPartnerInfo({ payload }, { call, put }) {
      const res = yield call(getPartnerInfo, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            partnerInfo: response,
          },
        });
      }
      return res;
    },

    // 问题列表查询
    *queryQAList({ payload }, { call, put }) {
      const res = yield call(queryQAList, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: dealDataState([response]),
            pagination: createPagination(response),
          },
        });
      }
      return res;
    },

    // 保存问题列表
    *saveQAList({ payload }, { call }) {
      const res = yield call(saveQAList, payload);
      return res;
    },

    // 保存问题列表
    *subQAList({ payload }, { call }) {
      const res = yield call(subQAList, payload);
      return res;
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
