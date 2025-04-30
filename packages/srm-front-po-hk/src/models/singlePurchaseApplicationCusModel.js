/**
 * purchaseApplicationModel.js - 简易询价详情页面
 * @date: 2023-09-6
 * @author: <jinkai.lu@hand-china.com>
 */
import { createPagination, getResponse } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import uuid from 'uuid/v4';
import {
  saveDetail,
  queryDetail,
  firstQueryDetail,
  getUuid,
  saveAttachment,
  getSupplierList,
  getMaterialList,
  getRate,
  getQuotationDetail,
  getQuotationListDetail,
  getQuotationListDetailBid,
  getQuotationClauseDetail,
  getMatList,
  getMatListBefore,
  getPriceDetail,
  demanderCreateQuery,
  demanderEditQuery,
  getMatSup,
  demanderSave,
  stageQuery,
  queryProjectId,
  stagePreview,
  supplierPreview,
  supplierSend,
  searchRound,
  editTimeSave,
  addNextRoundSave,
  getPriceCollect,
  getPriceTolList,
  getReviewPrice,
  handlePurchaseLineInfo,
  getPriceSummaryList,
  priceSummarySave,
  getQuoteMatList,
  priceSummaryMatSave,
  simulateApprove,
  getPriceValidate,
  projectEditName,
  getProjectName,
  getPriceList,
  getInquireDetail,
  getMilestoneState,
  saveEditMat,
  saveSelectSupplier,
} from '../services/singlePurchaseApplicationCusService';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';

export default {
  namespace: 'singlePurchaseApplicationCusModel',
  state: {
    projectName: '', // 基本信息——项目名称
    purchaseApplicationList: [], // 采购申请列表数据
    purchaseApplicationPagination: {}, // 分页对象
    inquireBaseInfo: {}, // 询价基本信息
    quotationFormatList: [], // 报价表格式
    quotationFormatListPagination: {}, // 报价表格式分页
    InviteSuppliersList: [], // 邀请供应商
    InviteSuppliersListPagination: {}, // 邀请供应商分页
    stageList: [], // 阶段数据
    refHeadId: null, // 简易询价单子 id
    supplierList: [], //供应商列表
    selectedRowKeys: [], // 供应商列表选中行,在报价递交参数，选择供应商需要用到；
    prNumber: '', // 采购申请编号
    prName: '', // 采购申请名称

    statusList: [
      {
        code: 'PENDING_REFER',
        name: '草稿',
      },
      {
        code: 'In_Approval',
        name: '审批中',
      },
      {
        code: 'Approved',
        name: '已审批',
      },
    ], // 状态

    equal: null, // 申请人是否等于需求人

    // 报价文件详情
    infomationForm: {}, // 项目基本信息
    inquiryRoundForm: {}, // 询价轮次
    quotationList: [], // 报价表数据
    quotationPagination: {}, // 报价表分页
    quotationTermsList: [], // 报价条款数据
    quotationTermsPagination: {}, // 报价条款分页
    priceList: [], // 比价数据

    inquireDetailList: [], // 报价详情数据
    inquireDetailPagination: {}, // 报价详情分页

    // 需求人确认执行
    prThirdHeadId: null, //采购申请询价单主键Id  和refHeadId貌似重复
    purchasingCategoriesVal: false, //判断【采购类别】是否有值
    projectId: '', //项目编码
    purchasingCategoriesMean: '', //采购类别mean

    purchasingCategoriesCode: '', // 采购类别Code
    purchasingCategories: '', // 采购类别
    budgetInfoList: [], // 完善物料&预算信息
    inquiryResultList: [], // 询价结果

    //价格汇总详细页
    priceBasicInfo: {}, //项目基本信息
    priceSummaryList: [], // 价格汇总
    reviewPriceData: [], // 选择报价——> 历史评审价格

    // 财务审批
    purchaseApproveForm: {}, // 基本信息
    purchaseApproveList: [], // 预算信息
    purchaseApproveLineList: [], // 采购申请行信息
    purchaseApproveLinePagination: {}, // 采购申请行信息分页

    // 50w < hkd <=100w
    materialDetailList: [], //物料采购详情
    materialDetailListPagination: {}, //物料采购详情分页
    detailEnumMap: {}, // 值集
  },

  effects: {
    *init({ payload }, { put, call }) {
      const res = yield call(queryMapIdpValue, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            ...res,
          },
        });
      }
      return res;
    },
    // -查询详情值集
    *fetchDetailEnum(params, { put, call }) {
      const detailEnumMap = getResponse(
        yield call(queryMapIdpValue, {
          budgetTypeList: 'HKPC.BUDGETTYPE', // 预算类型
          purchaseCategoryList: 'HKPC.PURCHASINGCATEGORY', // 采购类别
        })
      );
      if (detailEnumMap) {
        yield put({
          type: 'updateState',
          payload: {
            detailEnumMap,
          },
        });
      }
    },
    // 保存简易询价
    *saveDetail({ payload }, { call, put }) {
      return cusGetResponse(yield call(saveDetail, payload));
    },
    // 简易询价详情 优先调用
    *firstQueryDetail({ payload }, { call, put }) {
      return cusGetResponse(yield call(firstQueryDetail, payload));
    },
    // 简易询价详情
    *queryDetail({ payload }, { call, put }) {
      return cusGetResponse(yield call(queryDetail, payload));
    },
    // 查询项目id
    *queryProjectId({ payload }, { call, put }) {
      return cusGetResponse(yield call(queryProjectId, payload));
    },
    // 简易询价详情—— 附件查询
    *getUuid({ payload }, { call, put }) {
      return cusGetResponse(yield call(getUuid, payload));
    },
    // 简易询价详情—— 附件保存
    *saveAttachment({ payload }, { call, put }) {
      return cusGetResponse(yield call(saveAttachment, payload));
    },
    // 邀请供应商查询
    *getSupplierList({ payload }, { call, put }) {
      const response = cusGetResponse(yield call(getSupplierList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            InviteSuppliersList: response.content.map((n) => ({
              ...n,
              _status: 'update',
              copyEmail: n.email,
              copyContacts: n.contacts,
              copyPhone: n.phone,
              uuid: n?.uuid ? n.uuid : uuid(),
            })),
            InviteSuppliersListPagination: createPagination(response),
          },
        });
      }
    },
    // 物料查询
    *getMaterialList({ payload }, { call, put }) {
      const response = cusGetResponse(yield call(getMaterialList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            quotationFormatList: response.content,
            quotationFormatListPagination: createPagination(response),
          },
        });
      }
    },
    // 汇率查询
    *getRate({ payload }, { call, put }) {
      return cusGetResponse(yield call(getRate, payload));
    },
    // 阶段查询
    *stageQuery({ payload }, { call, put }) {
      return cusGetResponse(yield call(stageQuery, payload));
    },
    // 阶段预览
    *stagePreview({ payload }, { call, put }) {
      return cusGetResponse(yield call(stagePreview, payload));
    },
    // 询价邀请 ——供应商预览
    *supplierPreview({ payload }, { call, put }) {
      return cusGetResponse(yield call(supplierPreview, payload));
    },
    // 阶段——询价邀请 —— 发送(包括全部发送)
    *supplierSend({ payload }, { call, put }) {
      return cusGetResponse(yield call(supplierSend, payload));
    },
    //编辑时间——轮次查询
    *searchRound({ payload }, { call, put }) {
      return cusGetResponse(yield call(searchRound, payload));
    },
    // 编辑时间保存
    *editTimeSave({ payload }, { call, put }) {
      return cusGetResponse(yield call(editTimeSave, payload));
    },
    // 添加下一轮保存
    *addNextRoundSave({ payload }, { call, put }) {
      return cusGetResponse(yield call(addNextRoundSave, payload));
    },
    // 查询价格汇总基本信息
    *getPriceCollect({ payload }, { call, put }) {
      return cusGetResponse(yield call(getPriceCollect, payload));
    },

    // 查询历史评审价格
    *getReviewPrice({ payload }, { call, put }) {
      return cusGetResponse(yield call(getReviewPrice, payload));
    },
    // 查询历史评审价格
    *getPriceTolList({ payload }, { call, put }) {
      return cusGetResponse(yield call(getPriceTolList, payload));
    },
    // 价格汇总物料查询
    *getMatList({ payload }, { call, put }) {
      return cusGetResponse(yield call(getMatList, payload));
    },
    // 价格汇总物料查询
    *getMatListBefore({ payload }, { call, put }) {
      return cusGetResponse(yield call(getMatListBefore, payload));
    },
    // 查询价格汇总数据
    *getPriceSummaryList({ payload }, { call, put }) {
      return cusGetResponse(yield call(getPriceSummaryList, payload));
    },
    // 价格汇总保存
    *priceSummarySave({ payload }, { call, put }) {
      return cusGetResponse(yield call(priceSummarySave, payload));
    },
    // 价格汇总——物料保存
    *priceSummaryMatSave({ payload }, { call, put }) {
      return cusGetResponse(yield call(priceSummaryMatSave, payload));
    },

    // 查询报价文件详情数据
    *getQuotationDetail({ payload }, { call, put }) {
      return cusGetResponse(yield call(getQuotationDetail, payload));
    },
    // 查询50-100万报价文件详情数据——报价表
    *getQuotationListDetail({ payload }, { call, put }) {
      return cusGetResponse(yield call(getQuotationListDetail, payload));
    },
    // 查询100万报价文件详情数据——报价表
    *getQuotationListDetailBid({ payload }, { call, put }) {
      return cusGetResponse(yield call(getQuotationListDetailBid, payload));
    },
    // 查询报价文件详情数据——报价条款
    *getQuotationClauseDetail({ payload }, { call, put }) {
      return cusGetResponse(yield call(getQuotationClauseDetail, payload));
    },
    // 查询比价数据
    *getPriceDetail({ payload }, { call, put }) {
      return cusGetResponse(yield call(getPriceDetail, payload));
    },
    // 需求人确认执行查询
    *demanderCreateQuery({ payload }, { call, put }) {
      return cusGetResponse(yield call(demanderCreateQuery, payload));
    },
    // 需求人确认执行查询
    *demanderEditQuery({ payload }, { call, put }) {
      return cusGetResponse(yield call(demanderEditQuery, payload));
    },
    // 需求人确认执行物料查询
    *getMatSup({ payload }, { call, put }) {
      // return cusGetResponse(yield call(getMatSup, payload));
      const response = cusGetResponse(yield call(getMatSup, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            materialDetailList: response.content.map((n) => ({
              ...n,
              _status: 'update',
              uuid: n?.uuid ? n.uuid : uuid(),
            })),
            materialDetailListPagination: createPagination(response),
          },
        });
      }
    },
    // 需求人确认执行物料查询
    *getQuoteMatList({ payload }, { call, put }) {
      return cusGetResponse(yield call(getQuoteMatList, payload));
    },
    // 需求人确认执行保存
    *demanderSave({ payload }, { call, put }) {
      return cusGetResponse(yield call(demanderSave, payload));
    },
    // 简易询价财务审批
    *handlePurchaseLineInfo({ payload }, { call, put }) {
      return cusGetResponse(yield call(handlePurchaseLineInfo, payload));
    },
    // 模拟致远财务审批
    *simulateApprove({ payload }, { call, put }) {
      return cusGetResponse(yield call(simulateApprove, payload));
    },
    // 校验金额字段
    *getPriceValidate({ payload }, { call }) {
      const res = getResponse(yield call(getPriceValidate, payload));
      return res;
    },
    // 查询总的项目名称
    *getProjectName({ payload }, { call }) {
      const res = cusGetResponse(yield call(getProjectName, payload));
      return res;
    },
    // 修改项目名称
    *projectEditName({ payload }, { call }) {
      const res = cusGetResponse(yield call(projectEditName, payload));
      return res;
    },
    // 新报价表数据
    *getPriceList({ payload }, { call }) {
      const res = cusGetResponse(yield call(getPriceList, payload));
      return res;
    },
    // 报价详情查询
    *getInquireDetail({ payload }, { call }) {
      const res = cusGetResponse(yield call(getInquireDetail, payload));
      return res;
    },
    // 获取里程碑当前行状态
    *getMilestoneState({ payload }, { call }) {
      const res = cusGetResponse(yield call(getMilestoneState, payload));
      return res;
    },
    // 保存新增的物料
    *saveEditMat({ payload }, { call }) {
      const res = cusGetResponse(yield call(saveEditMat, payload));
      return res;
    },
    // 保存中选供应商
    *saveSelectSupplier({ payload }, { call }) {
      const res = cusGetResponse(yield call(saveSelectSupplier, payload));
      return res;
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
