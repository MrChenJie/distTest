/**
 * @Description: 参与方制裁名单
 * @date 2023-04-21
 * @author <xinyi02.he@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import { queryList, updateStatus, exportSanctions } from '@/services/sanctionsListService';

export default {
  namespace: 'sanctionsList',

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
            dataSource: response.content || [],
            pagination: createPagination(response),
          },
        });
      }
      return response;
    },

    *updateStatus({ payload }, { call }) {
      return getResponse(yield call(updateStatus, payload));
    },

    *exportSanctions({ payload }, { call }) {
      return getResponse(yield call(exportSanctions, payload));
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
