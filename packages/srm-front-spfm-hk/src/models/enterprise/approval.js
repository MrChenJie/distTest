import { createPagination, getResponse } from 'utils/utils';
import uuidv4 from 'uuid/v4';
import {
  queryList,
  queryDetail,
  approve,
  reject,
  queryRecord,
  certificationBusiness,
} from '@/services/approvalService';

const tableState = {
  dataSource: [],
  pagination: {
    // pageSize: 10,
    // total: 0,
    // current: 1,
  },
  selectedRows: [],
};

export default {
  namespace: 'certificationApproval',
  state: {
    list: {
      ...tableState,
    },
    detail: {},
    record: [],
  },
  effects: {
    *queryList({ payload }, { put, call }) {
      const res = yield call(queryList, payload);
      const response = getResponse(res);
      if (response) {
        const { content = [] } = response || {};
        yield put({
          type: 'updateListReducer',
          payload: {
            dataSource: content,
            pagination: createPagination(response),
          },
        });
      }
    },
    *queryDetail({ payload }, { put, call }) {
      const res = yield call(queryDetail, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateStateReducer',
          payload: {
            detail: response,
          },
        });
      }
    },
    *reject({ payload }, { call }) {
      const response = yield call(reject, payload);
      return response;
    },
    *approve({ payload }, { call }) {
      const response = yield call(approve, payload);
      return response;
    },
    *approveBatch({ payload }, { call }) {
      const response = yield call(approve, payload);
      return response;
    },
    *queryRecord({ payload }, { put, call }) {
      const res = yield call(queryRecord, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateStateReducer',
          payload: {
            record: response.map(n => ({ ...n, key: uuidv4() })),
          },
        });
      }
    },

    // 三证验证
    *certificationBusiness({ payload }, { call }) {
      const res = yield call(certificationBusiness, payload);
      return getResponse(res);
    },
  },
  reducers: {
    updateStateReducer(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateListReducer(state, { payload }) {
      return {
        ...state,
        list: {
          ...state.list,
          ...payload,
        },
      };
    },
  },
};
