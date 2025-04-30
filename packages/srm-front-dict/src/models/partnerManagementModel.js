/**
 * DICT合作伙伴入库model
 * @Author: qi.xue01@hand-china.com
 * @Date: 2024/10/18
 * @Copyright: Copyright (c), 2024, hand
 */
import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import {
  masterDataExport,
  queryPartnerManagementList,
  invitationRegister,
  queryScore,
} from '@/services/partnerManagementService';
import uuid from 'uuid/v4';

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
  namespace: 'partnerManagement',
  state: {
    tableData: [],
    pagination: {},
  },
  effects: {
    *queryPartnerManagementList({ payload }, { call, put }) {
      const res = yield call(queryPartnerManagementList, payload);
      const response = getResponse(res);
      if(response) {
        yield put({
          type: 'updateState',
          payload: {
            tableData: dealDataState(response.content),
            pagination: createPagination(response),
          },
        });
      }
      return res;
    },
    *masterDataExport({payload }, { call, put }) {
      return getResponse(yield call(masterDataExport, payload));
    },
    *invitationRegister({payload}, {call, put}) {
      const res = yield call(invitationRegister, payload);
      return getResponse(res);
    },
    *queryScore({payload }, { call, put }) {
      return getResponse(yield call(queryScore, payload));
    }
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
