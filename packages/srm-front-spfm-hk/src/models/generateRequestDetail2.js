import { getApprovalDetail, getByRequestId } from '@/services/GenerateRequestDetail2';
import { getResponse } from 'hzero-front/lib/utils/utils';

export default {
  namespace: 'GenerateRequestDetail2',

  state: {
    headerDetail: {},
    approvalList: [],
    btnList: [],
  },

  effects: {
    *getApprovalDetail({ payload }, { call, put }) {
      const res = yield call(getApprovalDetail, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            headerDetail: res.approvalRequestHeaderVO,
            approvalList: res.approvalReqRecVOList,
            btnList: res.approvalRequestButtonVOList,
          },
        });
      }
    },

    *getByRequestId({ payload }, { call }) {
      const res = yield call(getByRequestId, payload);
      return res.sourceRequestId || null;
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
