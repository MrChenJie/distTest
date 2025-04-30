import { createPagination } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import {
  addPurchaseResultApplication,
  addPurchaseResultAttach,
  addPurchaseResultMaterial,
  editPurchaseResultApplication,
  queryPurchaseResult,
  delMaterials,
  delAttachs,
  querySaleOrderDetails
} from '../services/purchaseInquirySheetService';

export default {
  namespace: 'purchaseInquirySheetModel',
  state: {
    basicInfo: {}, // 基本信息
    purchaseInquiryList: [], // 采购申请列表数据
    purchaseInquiryPagination: {}, // 分页对象
    contact: '', // 送货联系人
    contactTel: '', //送货联系电话
    ictPrDetailHeadsList: {},
    ictPrAttachList: [],
    ictPrDetailMatList: [],
    rate: '', //汇率
    totalAmount: null, //总金额原币
    totalAmountHkd: '',
    currency: '', //传递到设备信息的币种
    originalCurrency: '', //币种，是一个id
    originalCurrencyStr: '', //币种字符串
    cmhkIctPrSo: {}, //销售订单数据
    cmhkIctPrDeviceInfoList: [], //设备信息
    hasCmhkIctPrDeviceInfoList: [], //已选择的设备信息
    equipmentLineNo: '', //设备信息行号
    glCode: '',
    prApplyStatus: '', //采购申请状态,
    PRjine: '',
    saleOrderList: [],
    saleOrderListPagination: {},
    prer: '',
  },

  effects: {
    // ICT采购结果编辑
    *editPurchaseResultApplication({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(editPurchaseResultApplication, payload));
      return res;
    },

    // ICT采购结果申请单新增或者变更
    *addPurchaseResultApplication({ payload }, { call }) {
      const res = cusGetResponse(yield call(addPurchaseResultApplication, payload));
      return res;
    },

    // ICT采购结果物料表新增或变更
    *addPurchaseResultMaterial({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(addPurchaseResultMaterial, payload));
      return res;
    },
    // ICT采购结果物料表新增或变更
    *addPurchaseResultAttach({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(addPurchaseResultAttach, payload));
      return res;
    },
    // ICT采购结果单号信息
    *queryPurchaseResult({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(queryPurchaseResult, payload));
      return res;
    },
    // 币种获取
    *currencyPurchaseResultApplication({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(currencyPurchaseResultApplication, payload));
      return res;
    },
    // 删除物料
    *delMaterials({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(delMaterials, payload));
      return res;
    },
    // 删除附件
    *delAttachs({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(delAttachs, payload));
      return res;
    },
    //ICT待办进入查询销售订单的数据
    *querySaleOrderDetails({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(querySaleOrderDetails, payload));
      if (res) {
        yield put({
          type: 'commentUpdateState',
          payload: {
            saleOrderList: res.content,
            saleOrderListPagination: createPagination(res),
          },
        });
      }
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

