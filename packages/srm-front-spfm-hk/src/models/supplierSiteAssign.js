/**
 * @Description: 供应商Site分配 model
 * @date 2021-04-12
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2021, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import { queryData, pushEBS } from '@/services/supplierSiteAssignService';

export default {
  namespace: 'supplierSiteAssign',
  state: {
    dateSource: [],
    pagination: {},
    fileTemplateList: [],
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
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            dateSource: res.content || [],
            pagination: page,
          },
        });
      }
      return res;
    },

    *pushEBS({ payload }, { call }) {
      return getResponse(yield call(pushEBS, payload));
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
