import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import {
  queryList,
  queryJobTime,
  exportCheck,
  queryPermissionList,
} from '@/services/invoiceQueryService';

export default {
  namespace: 'invoiceQuery',

  state: {
    dataSource: [],
    pagination: [],
    invoiceUpdateTime: '', // 发票更新时间
    paymentDataUpdateTime: '', // 付款数据更新时间
  },

  effects: {
    *queryList({ payload }, { call, put }) {
      const res = getResponse(yield call(queryList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: res.content?.map(item => {
              const { invoiceId, lineNumber } = item;
              return { ...item, invoiceQueryId: `${invoiceId}-${lineNumber}` }
            }),
            pagination: createPagination(res),
          },
        });
      }
      return res;
    },

    *queryJobTime({ payload }, { call, put }) {
      const res = getResponse(yield call(queryJobTime, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            invoiceUpdateTime: res.content?.find(item => item.executeCode === 'ebsApInvoicesSynJob')?.lastExecuteTime,
            paymentDataUpdateTime: res.content?.find(item => item.executeCode === 'HMDM.SYNC_EBS_PAYMENT')?.lastExecuteTime,
          },
        })
      }
      return res;
    },

    *exportCheck({ payload }, { call }) {
      const res = getResponse(yield call(exportCheck, payload));
      return res;
    },

    *queryPermissionList({ payload }, { call }) {
      const res = getResponse(yield call(queryPermissionList, payload));
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
