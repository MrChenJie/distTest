import { getResponse } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { queryMapIdpValue } from 'services/api';
import uuidv4 from 'uuid/v4';
import { createPagination } from 'hzero-front/lib/utils/utils';
import { queryUnifyIdpValue } from 'hzero-front/lib/services/api';
import {
  queryInfo,
  getPurchaseApplicationRate,
  queryFileList,
  saveQuotationInfo,
  submitQuotationInfo,
} from '@/services/enterQuotationServices';

export default {
  namespace: 'enterQuotationModel',
  state: {
    evaluationList: [],
    evaluationListPagination: {},
    enumMap: {},
  },
  effects: {
    // -查询列表值集
    *fetchEnum(params, { put, call }) {
      const enumMap = cusGetResponse(
        yield call(queryMapIdpValue, {
          deliveryTermsOptions: 'HKPC.DELIVERYTERMS', // 报价条款
          paymentTermsOptions: 'HKPC.PAYMENTTERMS', // 付款条款
          paymentMethodOptions: 'HKPC.PAYMENTMETHOD', // 付款方式
          isofferOptions: 'CMHK.OFFER_OR_NOT', // 是否报价
        })
      );
      if (enumMap) {
        yield put({
          type: 'updateState',
          payload: {
            enumMap,
          },
        });
      }
    },

    *queryInfo({ payload }, { put, call }) {
      const response = cusGetResponse(yield call(queryInfo, payload));
      return response;
    },

    *getPurchaseApplicationRate({ payload }, { put, call }) {
      const response = cusGetResponse(yield call(getPurchaseApplicationRate, payload));
      return response;
    },

    *queryFileList({ payload }, { put, call }) {
      const response = cusGetResponse(yield call(queryFileList, payload));
      return response;
    },

    *saveQuotationInfo({ payload }, { put, call }) {
      const response = cusGetResponse(yield call(saveQuotationInfo, payload));
      return response;
    },

    *submitQuotationInfo({ payload }, { put, call }) {
      const response = cusGetResponse(yield call(submitQuotationInfo, payload));
      return response;
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
