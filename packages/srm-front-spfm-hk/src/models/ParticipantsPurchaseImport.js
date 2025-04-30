import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  queryData,
} from '@/services/purchaseImportService';

export default {
  namespace: 'ParticipantsPurchaseImport',
  state: {
    purchaseOrderDateSource: [],
    pagination: {},
    templateList: [], // 下载模板的url
  },

  effects: {

    *init({ payload }, { call, put }) {
      const res = yield call(queryMapIdpValue, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            ...res,
          },
        });
      }
    },

    *queryData({ payload }, { call, put }) {
      const res = getResponse(yield call(queryData, payload));
      const page = createPagination(res);
      if(res) {
        yield put({
          type: 'updateState',
          payload: {
            purchaseOrderDateSource: res.content || [],
            pagination: page,
          },
        });
      }
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
