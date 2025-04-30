/**
 * @Description: 应付发票导入记录页面models
 * @date 2023-02-22
 * @author <xinyi.he02@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { queryData, queryDetail } from '@/services/invoiceImportService';

export default {
  namespace: 'invoiceImport',
  state: {
    dataSource: [], // 汇总的数据源
    pagination: {}, // 汇总的分页对象
    invoiceImportBasic: {}, // 详情头对象
    invoiceErrorList: [], //详情行数据源
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
        const { invoiceImport, invoiceErrorList } = response;
        yield put({
          type: 'updateState',
          payload: {
            invoiceImportBasic: invoiceImport || {},
            invoiceErrorList: invoiceErrorList || [],
          },
        });
      }
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
 