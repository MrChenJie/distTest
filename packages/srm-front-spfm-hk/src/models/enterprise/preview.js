import { getResponse } from 'utils/utils';
import {
  fetchEnterpriseInfo,
  getApprovalDetail,
  getByRequestId,
  jumpIsAdd,
  canEditBank,
  deleteBankList,
  fetchFileNumber,
} from '@/services/enterpriseService';
import { queryMapIdpValue } from 'services/api';
import { companyCheckResult } from '@/services/legalService';
import { saveBankData, fetchBankData, queryCurrentCMIData } from '@/services/bankService';
import { addAttachment, queryAttachment, queryAttachmentType } from '@/services/attachmentService';
import { deleteAttachmentList } from '@/services/generalAccessService';

export default {
  namespace: 'approvalPreview',

  state: {
    previewDetail: {},
    headerDetail: {},
    approvalList: [],
    btnList: [],
  },

  effects: {
    // 聚合快码请求
    *loadMutilFastCode({ payload }, { call, put }) {
      const res = getResponse(yield call(queryMapIdpValue, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            ...res,
          },
        });
      }
      return res;
    },

    *fetchPreviewDetail({ payload }, { put, call }) {
      const res = getResponse(yield call(fetchEnterpriseInfo, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            previewDetail: res,
          },
        });
        return res;
      }
    },

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
    *jumpIsAdd({ payload }, { call }) {
      return getResponse(yield call(jumpIsAdd, payload));
    },

    *companyCheckResult({ payload }, { call }) {
      return getResponse(yield call(companyCheckResult, payload));
    },

    *canEditBank({ payload }, { call }) {
      return getResponse(yield call(canEditBank, payload));
    },
    *saveBankData({ payload }, { call }) {
      return getResponse(yield call(saveBankData, payload));
    },
    *fetchBankData({ payload }, { call }) {
      return getResponse(yield call(fetchBankData, payload));
    },
    *queryCurrentCMIData({ payload }, { call }) {
      return getResponse(yield call(queryCurrentCMIData, payload));
    },
    *deleteBankList({ payload }, { call }) {
      return getResponse(yield call(deleteBankList, payload));
    },

    *fetchAttachment({ payload }, { call, put }) {
      return getResponse(yield call(queryAttachment, payload));
    },

    *fetchFileNumber({ payload }, { call, put }) {
      return getResponse(yield call(fetchFileNumber, payload));
    },

    *fetchAttachmentType({ payload }, { call, put }) {
      const response = yield call(queryAttachmentType, payload);
      const data = getResponse(response);
      const arr = [];
      data.map((d) => {
        return arr.push({
          ...d,
          isLeaf: false,
        });
      });
      if (data) {
        yield put({
          type: 'queryAttachmentType',
          payload: arr,
        });
      }
    },
    *addAttachment({ payload }, { call }) {
      return getResponse(yield call(addAttachment, payload));
    },
    *deleteAttachmentList({ payload }, { call }) {
      return getResponse(yield call(deleteAttachmentList, payload));
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    queryAttachmentType(state, action) {
      return {
        ...state,
        code: {
          ...state.code,
          AttachmentType: action.payload,
        },
      };
    },
  },
};
