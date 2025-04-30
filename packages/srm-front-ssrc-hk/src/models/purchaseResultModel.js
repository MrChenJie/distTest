import { createPagination } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import {
  normalQueryPurchaseResultDetail,
  queryPurchaseResultDetail,
  queryPurchaseResultList,
  savePurchaseResultDetail,
  updatePurchaseResultDetail,
  getNodeInfo,
  saveNormalPurchaseResultDetail,
  normalDowloadFile,
  queryProjectId,
  queryPrId,
  getResultModal,
  getResultModalEasy,
  queryDraftList,
  getViCoScSu,
  getBasicInfo,
  fetchPricingList,
  getDecisionInformation,
  getExportPriceAll,
  getExportPriceAllBid,
  saveDecisionInfo,
} from '@/services/purchaseResultService';

export default {
  namespace: 'purchaseResultModel',
  state: {
    purchaseResultList: [], // 采购结果列表数据
    purchaseResultPagination: {}, // 分页对象
    draftList: [], // 结果起草信息
    draftPagination: [], // 结果起草分页对象
    cmhkPrFourthHead: {}, //结果信息
    cmhkPrFourthBgList: [], //预算信息
    cmhkPrFourthSup: {}, //推荐供应商信息
    cmhkPrFourthQuoteList: [], //报价单信息
    cmhkPrFourthClause: [], //报价条款
    cmhkPrFourthPoList: [], //采购订单相关信息
    //TODO供应商附件
    purchaseResultName: '', //采购结果名称
    orderHandler: '', //订单经办人code
    orderHandlerName: '', //订单经办人名称
    chooseSupplier: '', //选择供应商code
    supplierNameCh: '', //选择供应商名称
    paStatus: '', //采购结果状态

    /*一般采购采购结果*/
    fourthHead: {}, //主表数据
    fourthPackageList: [], //标包数据
    content: '', //决策内容
    decisionsList: [], //决策信息
    fourthFileList: [], //决策信息附件
    fourthQuoteList: [], //报价单信息
    fourthClauseList: [], //报价条款
    fourthPoList: [], //采购订单相关信息
    paStatusYB: '', //一般采购结果状态code
    procurementHandlerYB: '', //一般采购结果采购经办人code
    purchasingCategoryYB: '', //一般采购结果采购类别code
    agent: '', //订单经办人code
    projectId: '', //项目id
    prPlanId: '', //采购方案id
    isShow: false, //是否展示选择供应商
    prId: '', // 采购申请id
    resultId: '', // 采购结果id
    infoSource: {},
  },
  effects: {
    // 简易采购结果列表查询接口
    *queryPurchaseResultList({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(queryPurchaseResultList, payload));
      if (res) {
        yield put({
          type: 'commentUpdateState',
          payload: {
            purchaseResultList: res.content, // 采购结果列表数据
            purchaseResultPagination: createPagination(res), // 分页对象
          },
        });
      }
      return res;
    },

    // 结果起草查询接口
    *queryPurchaseResultDraftList({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(queryDraftList, payload));
      if (res) {
        yield put({
          type: 'commentUpdateState',
          payload: {
            draftList: res.content, // 采购结果起草列表数据
            draftPagination: createPagination(res), // 分页对象
          },
        });
      }
      return res;
    },

    // 简易采购结果详情页面变更
    *updatePurchaseResultDetail({ payload }, { call }) {
      const res = cusGetResponse(yield call(updatePurchaseResultDetail, payload));
      return res;
    },

    // 简易采购结果详情列表
    *queryPurchaseResultDetail({ payload }, { call }) {
      const res = cusGetResponse(yield call(queryPurchaseResultDetail, payload));
      return res;
    },

    // 简易采购结果详情保存
    *savePurchaseResultDetail({ payload }, { call }) {
      const res = cusGetResponse(yield call(savePurchaseResultDetail, payload));
      return res;
    },

    // 一般采购结果详情列表
    *normalQueryPurchaseResultDetail({ payload }, { call }) {
      const res = cusGetResponse(yield call(normalQueryPurchaseResultDetail, payload));
      return res;
    },

    // 一般采购结果详情保存
    *saveNormalPurchaseResultDetail({ payload }, { call }) {
      const res = cusGetResponse(yield call(saveNormalPurchaseResultDetail, payload));
      return res;
    },

    // 一般采购结果决策附件下载
    *normalDowloadFile({ payload }, { call }) {
      const res = cusGetResponse(yield call(normalDowloadFile, payload));
      return res;
    },

    // 查询节点信息
    *getNodeInfo({ payload }, { call }) {
      const res = cusGetResponse(yield call(getNodeInfo, payload));
      return res;
    },

    // 查询项目id
    *queryProjectId({ payload }, { call }) {
      const res = cusGetResponse(yield call(queryProjectId, payload));
      return res;
    },

    // 查询申请id
    *queryPrId({ payload }, { call }) {
      const res = cusGetResponse(yield call(queryPrId, payload));
      return res;
    },

    // 一般采购结果小页面查询
    *getResultModal({ payload }, { call }) {
      const res = cusGetResponse(yield call(getResultModal, payload));
      return res;
    },

    // 简易采购结果小页面查询
    *getResultModalEasy({ payload }, { call }) {
      const res = cusGetResponse(yield call(getResultModalEasy, payload));
      return res;
    },

    // 查询综合评分汇总
    *getViCoScSu({ payload }, { call }) {
      const res = cusGetResponse(yield call(getViCoScSu, payload));
      return res;
    },

    /**
     * 基本信息查询
     * */
    *getBasicInfo({ payload }, { call, put }) {
      const response = cusGetResponse(yield call(getBasicInfo, payload));
      if (response) {
        yield put({
          type: 'commentUpdateState',
          payload: {
            infoSource: response,
          },
        });
      }
      return response;
    },

    // 报价模式列表
    *fetchPricingList({ payload }, { call }) {
      const response = cusGetResponse(yield call(fetchPricingList, payload));
      return response;
    },

    // 查询纪要信息
    *getDecisionInformation({ payload }, { call }) {
      const res = cusGetResponse(yield call(getDecisionInformation, payload));
      return res;
    },

    // 全部报价轮次导出
    *getExportPriceAll({ payload }, { call }) {
      const res = cusGetResponse(yield call(getExportPriceAll, payload));
      return res;
    },

    // 全部100万报价轮次导出
    *getExportPriceAllBid({ payload }, { call }) {
      const res = cusGetResponse(yield call(getExportPriceAllBid, payload));
      return res;
    },

    // 保存决策信息
    *saveDecisionInfo({ payload }, { call }) {
      const res = cusGetResponse(yield call(saveDecisionInfo, payload));
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
