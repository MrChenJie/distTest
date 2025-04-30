import uuid from 'uuid/v4';
import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import {
  queryList,
  queryDetail,
  queryBasic,
  saveInfo,
  deleteLines,
} from '@/services/blacklistManagementService';

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
  namespace: 'blacklistManagementModel',

  state: {
    dataSource: [], // 汇总的数据源
    pagination: {}, // 汇总的分页对象
  },

  effects: {
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
      console.log("createPagination(response)",createPagination(response))
      return res;
    },

    // 删除草稿状态列表
    // *deleteLine({ payload }, { call }) {
    //   const response = getResponse(yield call(deleteLine, payload));
    //   return response;
    // },

    // 查询基本信息
    *queryDetail({ payload }, { call }) {
      const response = getResponse(yield call(queryDetail, payload));
      return response;
    },
    *queryBasic({ payload }, { call }) {
      const response = getResponse(yield call(queryBasic, payload));
      return response;
    },

    // 保存基本信息
    *saveInfo({ payload }, { call }) {
      const response = getResponse(yield call(saveInfo, payload));
      return response;
    },

    // 删除
    *deleteLines({ payload }, { call }) {
      const response = getResponse(yield call(deleteLines, payload));
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
