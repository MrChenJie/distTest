import uuid from 'uuid/v4';
import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import {
  queryLeaseList,
  queryLeaseDetail,
  deleteStoreLine,
  submitPropertyLeaseInfo,
  submitStoreInfo,
  queryStoreList,
  queryStoreDetail,
  deleteLeaseLine,
  queryHistoryStore,
  getUserUnit,
} from '@/services/propertyLeaseService';

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
  namespace: 'propertyLeaseModel',

  state: {
    dataSource: [], // 汇总的数据源
    pagination: {}, // 汇总的分页对象
  },

  effects: {
    *queryLeaseList({ payload }, { call, put }) {
      const res = yield call(queryLeaseList, payload);
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

    *queryStoreList({ payload }, { call, put }) {
      const res = yield call(queryStoreList, payload);
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

    // 查询物业租赁基本信息
    *queryLeaseDetail({ payload }, { call }) {
      const response = getResponse(yield call(queryLeaseDetail, payload));
      return response;
    },

    // 新增物业租赁申请单信息
    *submitPropertyLeaseInfo({ payload }, { call }) {
      const response = getResponse(yield call(submitPropertyLeaseInfo, payload));
      return response;
    },

    // 租赁信息删除
    *deleteLeaseLine({ payload }, { call }) {
      const response = getResponse(yield call(deleteLeaseLine, payload));
      return response;
    },

    // 租赁详情
    *queryLeaseDetail({ payload }, { call }) {
      const response = getResponse(yield call(queryLeaseDetail, payload));
      return response;
    },

    // 门店新增
    *submitStoreInfo({ payload }, { call }) {
      const response = getResponse(yield call(submitStoreInfo, payload));
      return response;
    },

    // 门店历史数据
    *queryHistoryStore({ payload }, { call }) {
      const response = getResponse(yield call(queryHistoryStore, payload));
      return response;
    },

    // 门店删除
    *deleteStoreLine({ payload }, { call }) {
      const response = getResponse(yield call(deleteStoreLine, payload));
      return response;
    },

    // 门店详情
    *queryStoreDetail({ payload }, { call }) {
      const response = getResponse(yield call(queryStoreDetail, payload));
      return response;
    },

    // 申请人部门接口
    *getUserUnit({ payload }, { call }) {
      const response = getResponse(yield call(getUserUnit, payload));
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
