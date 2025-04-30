import uuid from 'uuid/v4';
import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import {
  queryList,
  deleteJudgesLine,
  saveJudges,
  savejudgeGroups,
} from '@/services/judgesManagementService';

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
  namespace: 'judgesManagementModel',
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
      return res;
    },

    // 删除草稿状态列表
    // *deleteLine({ payload }, { call }) {
    //   const response = getResponse(yield call(deleteLine, payload));
    //   return response;
    // },

    // 保存评委组信息
    *savejudgeGroups({ payload }, { call }) {
      const response = yield call(savejudgeGroups, payload);
      return response;
    },

    // 保存评委信息
    *saveJudges({ payload }, { call }) {
      const response = yield call(saveJudges, payload);
      return response;
    },

    // 删除评委信息
    *deleteJudgesLine({ payload }, { call }) {
      const response = getResponse(yield call(deleteJudgesLine, payload));
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
