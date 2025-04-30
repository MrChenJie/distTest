import { getResponse, createPagination } from 'utils/utils';
import {
  mipApprovalQuery,
  mipApprovalDetail,
  mipApprovalSave,
  mipApprovalObjectDelete,
  mipApprovalFieldDelete,
  getFieldList,
} from '@/services/approvalService';

export default {
  namespace: 'mipApproval',
  state: {
    mipApprovalList: [],
    mipApprovalPagination: {},
    approvalObjectMap: {},
    approvalFieldMapList: [],
  },
  effects: {
    *fetchMipApproval({ payload }, { call, put }) {
      const res = yield call(mipApprovalQuery, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            mipApprovalList: response.content,
            mipApprovalPagination: createPagination(response),
          },
        });
      }
      return res;
    },

    *detailMipApproval({ payload }, { call }) {
      const res = yield call(mipApprovalDetail, payload);
      return res;
    },

    *saveMipApproval({ payload }, { call }) {
      const res = yield call(mipApprovalSave, payload);
      return res;
    },

    *deleteObject({ payload }, { call }) {
      const res = yield call(mipApprovalObjectDelete, payload);
      return res;
    },

    *deleteField({ payload }, { call }) {
      const res = yield call(mipApprovalFieldDelete, payload);
      return res;
    },

    *getFieldList({ payload }, { call }) {
      return getResponse(yield call(getFieldList, payload));
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
