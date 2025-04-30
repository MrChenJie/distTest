import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import {
  queryList,
  save,
  controlPermission,
} from '@/services/supplierRateService';

export default {
  namespace: 'supplierRate',

  state: {
    dataSource: [],
    pagination: [],
  },

  effects: {
    *queryList({ payload }, { call, put }) {
      const res = getResponse(yield call(queryList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: res.content.map(item => {
              const { vendorNum, categoryId, supplierRateId } = item;
              return {
                ...item,
                rowkey: `${vendorNum}${categoryId}${supplierRateId}`,
              };
            }),
            pagination: createPagination(res),
          },
        });
      }
      return res;
    },

    *save({ payload }, { call }) {
      const res = getResponse(yield call(save, payload));
      return res;
    },

    *controlPermission({ payload }, { call }) {
      const res = getResponse(yield call(controlPermission, payload));
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
