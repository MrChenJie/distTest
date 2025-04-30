import { createPagination } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import {
  deletePurchaseResultApplication,
  exportPurchaseInquiryList,
  queryPurchaseInquiryList,
  editPurchaseResultApplication
} from '../services/purchaseInquiryQueryServiceErp';

export default {
  namespace: 'purchaseInquiryQueryModelErp',
  state: {
    purchaseInquiryList: [], // 采购申请列表数据
    purchaseInquiryPagination: {}, // 分页对象
    detailInfomation: {} // 详情信息
  },

  effects: {
    // 转售列表查询
    * queryPurchaseInquiryList({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(queryPurchaseInquiryList, payload));
      if (res) {
        yield put({
          type: 'commentUpdateState',
          payload: {
            purchaseInquiryList: res.content,
            purchaseInquiryPagination: createPagination(res),
          },
        });
      }
      return res;
    },
    // 导出
    * exportPurchaseInquiryList({ payload }, { call }) {
      return cusGetResponse(yield call(exportPurchaseInquiryList, payload));
    },
    // ICT采购结果编辑
    * editPurchaseResultApplication({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(editPurchaseResultApplication, payload));
      return res;
    },
    // ICT采购结果删除
    * deletePurchaseResultApplication({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(deletePurchaseResultApplication, payload));
      return res;
    },
  },

  reducers: {
    commentUpdateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};

