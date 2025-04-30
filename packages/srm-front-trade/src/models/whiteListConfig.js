/**
 * @Description: 白名单配置列表页面models
 * @date 2023-02-16
 * @author <xinyi.he02@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { queryData, queryDetail, save } from '@/services/whiteListConfigService';

export default {
  namespace: 'whiteListConfig',
  state: {
    dataSource: [], // 汇总的数据源
    pagination: {}, // 汇总的分页对象
    whiteListConfigheader: {}, // 详情头对象
    whiteListConfigList: [], //详情行数据源
  },
  effects: {
    *queryData({ payload }, { call, put }) {
      const res = yield call(queryData, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content,
            pagination: createPagination(response),
          },
        });
      }
      return res;
    },

    *queryDetail({ payload }, { call, put }) {
      const res = yield call(queryDetail, payload);
      const response = getResponse(res);
      if (response) {
        const { whiteListConfig, whiteListDetailList } = response;
        yield put({
          type: 'updateState',
          payload: {
            whiteListConfigheader: whiteListConfig || {},
            whiteListConfigList: whiteListDetailList?.map(item => ({ ...item, _status: 'update' })),
          },
        });
      }
      return res;
    },

    *save({ payload }, { call }) {
      const res = yield call(save, payload);
      return getResponse(res);
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
 