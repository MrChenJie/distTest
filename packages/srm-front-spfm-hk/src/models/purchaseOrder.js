import { getResponse } from 'utils/utils';
import { fetchList, addOrderType } from '@/services/purchaseOrderService';

export default {
  namespace: 'purchaseOrder',

  state: {
    dataList: [],
    query: {},
  },

  effects: {
    *fetchList({ payload }, { call, put }) {
      const { ...query } = payload;
      const result = getResponse(yield call(fetchList, { ...query }));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            query,
            dataList: result,
          },
        });
      }
    },
    *addOrderType({ payload }, { call }) {
      const data = yield call(addOrderType, payload);
      return data;
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
