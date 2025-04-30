/*
 * projectQaModel - 项目答疑model
 * @date: 2019-05-15
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import {
  fetchPurchaseReplyList,
  fetchCmiContentList,
  savePurchaseReply,
  saveClarification,
  saveClarificationAnswers,
  deleteClarification,
  queryProjectQaInfo,
  queryProjectQaMilestonesInfo,
  submit,
  submitPrice,
  priceQaList,
  assign,
  getQaSummaryFile,
  saveQaSummaryFile,
  deletePriceQa,
  submitRows,
  getQaSummaryFileNew,
  saveQaSummaryFileNew,
  deleteQaSummaryFileNew,
} from '@/services/projectQaService';

export default {
  namespace: 'projectQaModels',

  state: {
    purchaseReplyDataSource: [],
    purchaseReplyPagination: {},
    clarificationDataSource: [],
    clarificationPagination: {},
    poHeaderInfo: {},
    code:{},
    newFileUrl:'',
    poHeaderMilestonesInfo: {},
    qaSummaryFileNew: [],
    qaSummaryFilePaginationNew: [],
  },

  effects: {
    // 价格澄清
    *priceQaList({ payload }, { call }) {
      const response = getResponse(yield call(priceQaList, payload));
      return response;
    },

    // 项目答疑-CMI答复内容表
    *fetchPurchaseReplyList({ payload }, { call }) {
      const response = getResponse(yield call(fetchPurchaseReplyList, payload));
      return response;
    },

    // 项目答疑-CMI主动澄清
    *fetchCmiContentList({ payload }, { call }) {
      const response = getResponse(yield call(fetchCmiContentList, payload));
      return response;
    },

    // 项目答疑-CMI答复内容表保存
    *savePurchaseReply({ payload }, { call }) {
      const response = getResponse(yield call(savePurchaseReply, payload));
      return response;
    },

    // 项目答疑-CMI回复澄清表保存(保存问题)
    *saveClarification({ payload }, { call }) {
      const response = getResponse(yield call(saveClarification, payload));
      return response;
    },

    // 项目答疑-CMI回复澄清表保存(保存答案)
    *saveClarificationAnswers({ payload }, { call }) {
      const response = getResponse(yield call(saveClarificationAnswers, payload));
      return response;
    },

    // 项目答疑-CMI回复澄清表删除
    *deleteClarification({ payload }, { call }) {
      const response = getResponse(yield call(deleteClarification, payload));
      return response;
    },

    *queryProjectQaInfo({ payload }, { put, call }) {
      const res = getResponse(yield call(queryProjectQaInfo, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            poHeaderInfo: res || {},
          },
        });
      }
      return res;
    },

    *queryProjectQaMilestonesInfo({ payload }, { put, call }) {
      const res = getResponse(yield call(queryProjectQaMilestonesInfo, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            poHeaderMilestonesInfo: res || {},
          },
        });
      }
      return res;
    },

    // 提交
    *submit({ payload }, { call }) {
      const response = getResponse(yield call(submit, payload));
      return response;
    },

   // 提交价格澄清
   *submitPrice({ payload }, { call }) {
    const response = getResponse(yield call(submitPrice, payload));
    return response;
  },
    // 分配
    *assign({ payload }, { call }) {
      const response = getResponse(yield call(assign, payload));
      return response;
    },

     // 查询纪要
     *getQaSummaryFile({ payload }, { call }) {
      const response = getResponse(yield call(getQaSummaryFile, payload));
      return response;
    },

     // 保存纪要
     *saveQaSummaryFile({ payload }, { call }) {
      const response = getResponse(yield call(saveQaSummaryFile, payload));
      return response;
    },

     // 删除价格澄清
     *deletePriceQa({ payload }, { call }) {
      const response = getResponse(yield call(deletePriceQa, payload));
      return response;
    },

      // 项目答疑单条提交
      *submitRows({ payload }, { call }) {
      const response = cusGetResponse(yield call(submitRows, payload));
      return response;
    },

      // 项目答疑单条提交
      *getQaSummaryFileNew({ payload }, { call }) {
      const response = getResponse(yield call(getQaSummaryFileNew, payload));
      return response;
    },

    // 项目答疑保存
    *saveQaSummaryFileNew({ payload }, { call }) {
      const response = getResponse(yield call(saveQaSummaryFileNew, payload));
      return response;
    },

    // 项目答疑删除
    *deleteQaSummaryFileNew({ payload }, { call }) {
      const response = getResponse(yield call(deleteQaSummaryFileNew, payload));
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
    setCodeReducer(state, { payload }) {
      return {
        ...state,
        code: Object.assign(state.code, payload),
      };
    },

  },
};
