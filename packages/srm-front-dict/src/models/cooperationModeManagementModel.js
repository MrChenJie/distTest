import uuid from 'uuid/v4';
import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import {
  queryList,
  queryDetail,
  queryAttachmentInfo,
  saveCooperationModeInfo,
  expirePartnerMode,
  saveAttachmentInfo,
  deleteAttachmentLine,
} from '@/services/cooperationModeManagementService';

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
  namespace: 'cooperationModeManagementModel',

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

    // 查询合作模式基本信息
    *queryDetail({ payload }, { call }) {
      const response = getResponse(yield call(queryDetail, payload));
      return response;
    },

    // 查询合作模式-附件详情
    *queryAttachmentInfo({ payload }, { call }) {
      const response = getResponse(yield call(queryAttachmentInfo, payload));
      return response;
    },

    // 保存合作模式基本信息
    *saveCooperationModeInfo({ payload }, { call }) {
      const response = getResponse(yield call(saveCooperationModeInfo, payload));
      return response;
    },

    // 保存合作模式-附件详情
    *saveAttachmentInfo({ payload }, { call }) {
      const response = getResponse(yield call(saveAttachmentInfo, payload));
      return response;
    },
    //失效合作模式
    *expirePartnerMode({ payload }, { call }) {
      const response = getResponse(yield call(expirePartnerMode, payload));
      return response;
    },
    // 删除合作模式-附件详情
    *deleteAttachmentLine({ payload }, { call }) {
      const response = getResponse(yield call(deleteAttachmentLine, payload));
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
