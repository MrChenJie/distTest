/**
 * @Description: 活动申请
 * @date 2024-07-12
 * @author <jie.chen06@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2024, Hand
 */
import uuid from 'uuid/v4';
import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import {
  queryList,
  deleteLine,
  queryDetail,
  queryListDetail,
  saveActiveInfo,
  saveProductInfo,
  deleteProductLine,
  goProduInforExport,
} from '@/services/activeApplicationListService';

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
  namespace: 'activeApplicationListModal',

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
    *deleteLine({ payload }, { call }) {
      const response = getResponse(yield call(deleteLine, payload));
      return response;
    },

    // 查询活动详情-基本信息
    *queryDetail({ payload }, { call }) {
      const response = getResponse(yield call(queryDetail, payload));
      return response;
    },

    // 查询活动详情-商品详情
    *queryListDetail({ payload }, { call }) {
      const response = getResponse(yield call(queryListDetail, payload));
      return response;
    },

    // 保存活动详情
    *saveActiveInfo({ payload }, { call }) {
      const response = getResponse(yield call(saveActiveInfo, payload));
      return response;
    },

    // 保存商品详情
    *saveProductInfo({ payload }, { call }) {
      const response = getResponse(yield call(saveProductInfo, payload));
      return response;
    },

    // 删除商品详情
    *deleteProductLine({ payload }, { call }) {
      const response = getResponse(yield call(deleteProductLine, payload));
      return response;
    },

    // 导出商品详情
    *goProduInforExport({ payload }, { call }) {
      const response = getResponse(yield call(goProduInforExport, payload));
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
 