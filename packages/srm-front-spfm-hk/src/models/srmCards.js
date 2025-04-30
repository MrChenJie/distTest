/**
 * model - 工作台卡片
 * @date: 2019-02-23
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { getResponse, createPagination, isTenantRoleLevel } from 'utils/utils';
import { queryIdpValue } from 'services/api';
import intl from 'utils/intl';
import { filter } from 'lodash';
import {
  queryFunctions,
  queryAllFunctions,
  queryStatistical,
  queryTodo,
  queryWorkflow,
  queryPurchasingReport,
  queryReports,
  addPurchases,
  querySystemMessage,
  queryAnnouncement,
  addFunctions,
  changeRead,
  queryRiskDaily,
  queryRiskCategory,
  queryRiskDetail,
  queryRiskDailyModal,
  queryEnterpriseRisk,
  queryCompanyNotice,
  // queryEnterpriseRiskRead,
  addSourceEvent,
} from '@/services/srmCardsService';

export default {
  namespace: 'srmCards',
  state: {
    // Hzero
    functions: [], // 固定的常用功能
    allFunction: [], // 全部的常用功能
    workflowList: [], // 工作流
    workflowLoading: true,
    // systemMessageList: [], // 系统消息
    announcementList: [], // 公告消息
    PlatformNoticeList: [], // 平台公告
    checkedKeys: [], // 选中的常用功能
    isListLoad: null,
    allCheckedKeys: [],
    commonlyUsedLoading: true, // 常用功能预加载loading
    // SRM
    allPurchase: [], // 全部采购订单
    purchases: [], // 显示的采购订单
    selectedRowKeys: [], // 选中的采购订单
    allManagement: [], // 全部供应商管理数据
    managementList: [], // 显示的供应商管理数据
    managementKeys: [], // 选中的供应商管理数据
    allFinancial: [], // 全部采购方财务数据
    financialList: [], // 显示的采购方财务数据
    financialKeys: [], // 选中的采购方财务数据
    allPurchaserQuality: [], // 全部的采购方质量业务
    purchaserQualityKeys: [], // 选中的采购方质量业务
    purchaserQuality: [], // 显示的采购方质量业务
    allGoods: [], // 全部收货数据
    goodsList: [], // 显示的收货数据
    goodsKeys: [], // 选中的收货数据
    allCustomer: [], // 全部客户管理条目
    customerList: [], // 显示的客户管理条目
    customerKeys: [], // 选中的客户管理条目
    allSalesOrder: [], // 全部的销售订单条目
    salesOrder: [], // 显示的销售订单条目
    salesOrderKeys: [], // 选中的销售订单条目
    allDelivery: [], // 全部送货条目
    deliveryList: [], // 显示的送货条目
    deliveryKeys: [], // 选中的送货条目
    allSupplierQuality: [], // 全部的供应商质量业务条目
    supplierQuality: [], // 显示的供应商质量业务条目
    supplierQualityKeys: [], // 选中的供应商质量业务条目
    allSupplierFinancial: [], // 全部的供应商财务条目
    supplierFinancial: [], // 显示的供应商财务条目
    supplierFinancialKeys: [], // 选中的供应商财务条目
    todoList: [], // 采购方待办事项
    supplierTodoList: [], // 供应商待办事项
    purchaseAmount: null, // 采购总金额
    purchasingReport: [], // 采购报表数据
    amounts: null, // 供应商看到的总金额
    reports: [], // 供应商报表数据
    reportsYear: [], // 供应商年度数据
    leadershipAmounts: null, // 采购方领导看到的总金额
    leadershipReports: [], // 采购方领导报表月度数据
    leadershipYear: [], // 采购方领导年度数据
    messageLoading: true, // 系统消息预加载loading
    noticeLoading: true, // 平台公告预加载loading
    PlatformNoticeLoading: true, // 系统公告预加载loading
    financialLoading: true, // 采购方财务预加载loading
    customerLoading: true, // 客户管理预加载loading
    deliveryLoading: true, // 送货预加载loading
    goodsLoading: true, // 收货预加载loading
    purchaseOrderLoading: true, // 采购订单预加载loading
    purchaserBusinessLoading: true, // 采购方质量业务预加载loading
    salesOrderLoading: true, // 销售订单预加载loading
    supplierFinancialLoading: true, // 供应商财务预加载loading
    managementLoading: true, // 供应商管理预加载loading
    supplierBusinessLoading: true, // 供应商质量业务预加载loading
    purchaseRequisitLoading: true, // 采购申请预加载loading
    contractLoading: true, // 采购协议预加载loading
    singContractLoading: true, // 供应商采购协议预加载loading
    riskDailyList: [], // 风险监控日报list
    categoryList: [], // 分类List
    riskDetailList: [], // 风险监控详情list
    riskDailyModalList: [], // 风险日报详情列表
    riskDailyModalPagination: {}, // 风险日报详情分页
    noticeCategory: [], // 公告消息值集列表，区分平台和租户
    srmSourceEventList: [], // 寻源事件数据列表
    sourceEventKeys: [], // 寻源选择keys
    allSourceEvent: [], // 寻源全部条目
    srmPurchaseRequisitList: [], // 采购申请数据列表
    purchaseRequisitKeys: [], // 申请选择Keys
    allPurchaseRequisit: [], // 申请条目
    srmContractList: [], // 采购协议数据列表
    contractKeys: [], // 采购协议选中Keys
    allContract: [], // 采购协议条目
    srmSingContractList: [], // 供应商采购协议数据列表
    singContractKeys: [], // 供应商采购协议选中Keys
    allSingContract: [], // 供应商采购协议条目
  },

  effects: {
    // 查询固定的常用功能
    *queryFunctions(_, { call, put }) {
      const data = getResponse(yield call(queryFunctions));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            functions: data,
          },
        });
        return data;
      }
    },

    // 查询全部常用功能
    *queryAllFunctions(_, { call, put }) {
      const data = getResponse(yield call(queryAllFunctions));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            allFunction: data.tree,
            checkedKeys: data.codes,
            isListLoad: false,
          },
        });
      }
    },

    // 采购订单数据查询
    *queryPurchaseOrder({ payload }, { call, put }) {
      const data = getResponse(yield call(queryStatistical, payload));
      if (data) {
        const purchases = filter(data, item => {
          return item.isShow === 0;
        });
        const selectedRowKeys = purchases.map(item => item.clauseId);
        yield put({
          type: 'updateState',
          payload: {
            allPurchase: data,
            purchases,
            selectedRowKeys,
          },
        });
        return data;
      }
    },

    // 供应商管理数据查询
    *queryManagement({ payload }, { call, put }) {
      const data = getResponse(yield call(queryStatistical, payload));
      if (data) {
        const managementList = filter(data, item => {
          return item.isShow === 0;
        });
        const managementKeys = managementList.map(item => item.clauseId);
        yield put({
          type: 'updateState',
          payload: {
            allManagement: data,
            managementList,
            managementKeys,
          },
        });
        return data;
      }
    },

    // 采购方财务数据查询
    *queryFinancial({ payload }, { call, put }) {
      const data = getResponse(yield call(queryStatistical, payload));
      if (data) {
        const financialList = filter(data, item => {
          return item.isShow === 0;
        });
        const financialKeys = financialList.map(item => item.clauseId);
        yield put({
          type: 'updateState',
          payload: {
            allFinancial: data,
            financialList,
            financialKeys,
          },
        });
        return data;
      }
    },

    // 采购方质量业务数据查询
    *queryPurchaserQuality({ payload }, { call, put }) {
      const data = getResponse(yield call(queryStatistical, payload));
      if (data) {
        const purchaserQuality = filter(data, item => {
          return item.isShow === 0;
        });
        const purchaserQualityKeys = purchaserQuality.map(item => item.clauseId);
        yield put({
          type: 'updateState',
          payload: {
            allPurchaserQuality: data,
            purchaserQuality,
            purchaserQualityKeys,
          },
        });
        return data;
      }
    },

    // 收货数据查询
    *queryGoods({ payload }, { call, put }) {
      const data = getResponse(yield call(queryStatistical, payload));
      if (data) {
        const goodsList = filter(data, item => {
          return item.isShow === 0;
        });
        const goodsKeys = goodsList.map(item => item.clauseId);
        yield put({
          type: 'updateState',
          payload: {
            allGoods: data,
            goodsList,
            goodsKeys,
          },
        });
        return data;
      }
    },

    // 客户管理数据查询
    *queryCustomer({ payload }, { call, put }) {
      const data = getResponse(yield call(queryStatistical, payload));
      if (data) {
        const customerList = filter(data, item => {
          return item.isShow === 0;
        });
        const customerKeys = customerList.map(item => item.clauseId);
        yield put({
          type: 'updateState',
          payload: {
            allCustomer: data,
            customerList,
            customerKeys,
          },
        });
        return data;
      }
    },

    // 销售订单数据查询
    *querySalesOrder({ payload }, { call, put }) {
      const data = getResponse(yield call(queryStatistical, payload));
      if (data) {
        const salesOrder = filter(data, item => {
          return item.isShow === 0;
        });
        const salesOrderKeys = salesOrder.map(item => item.clauseId);
        yield put({
          type: 'updateState',
          payload: {
            allSalesOrder: data,
            salesOrder,
            salesOrderKeys,
          },
        });
        return data;
      }
    },

    // 送货数据查询
    *queryDelivery({ payload }, { call, put }) {
      const data = getResponse(yield call(queryStatistical, payload));
      if (data) {
        const deliveryList = filter(data, item => {
          return item.isShow === 0;
        });
        const deliveryKeys = deliveryList.map(item => item.clauseId);
        yield put({
          type: 'updateState',
          payload: {
            allDelivery: data,
            deliveryList,
            deliveryKeys,
          },
        });
        return data;
      }
    },

    // 供应商质量业务数据查询
    *queryQuality({ payload }, { call, put }) {
      const data = getResponse(yield call(queryStatistical, payload));
      if (data) {
        const supplierQuality = filter(data, item => {
          return item.isShow === 0;
        });
        const supplierQualityKeys = supplierQuality.map(item => item.clauseId);
        yield put({
          type: 'updateState',
          payload: {
            allSupplierQuality: data,
            supplierQuality,
            supplierQualityKeys,
          },
        });
        return data;
      }
    },

    // 供应商财务数据查询
    *querySupplierFinancial({ payload }, { call, put }) {
      const data = getResponse(yield call(queryStatistical, payload));
      if (data) {
        const supplierFinancial = filter(data, item => {
          return item.isShow === 0;
        });
        const supplierFinancialKeys = supplierFinancial.map(item => item.clauseId);
        yield put({
          type: 'updateState',
          payload: {
            allSupplierFinancial: data,
            supplierFinancial,
            supplierFinancialKeys,
          },
        });
        return data;
      }
    },

    // 寻源事件
    *querySrmSourceEvent({ payload }, { call, put }) {
      const data = getResponse(yield call(queryStatistical, payload));
      if (data) {
        const srmSourceEventList = filter(data, item => {
          return item.isShow === 0;
        });
        const sourceEventKeys = srmSourceEventList.map(item => item.clauseId);
        yield put({
          type: 'updateState',
          payload: {
            allSourceEvent: data,
            srmSourceEventList,
            sourceEventKeys,
          },
        });
        return data;
      }
    },

    // 采购需求
    *querySrmPurchaseRequisit({ payload }, { call, put }) {
      const data = getResponse(yield call(queryStatistical, payload));
      if (data) {
        const srmPurchaseRequisitList = filter(data, item => {
          return item.isShow === 0;
        });
        const purchaseRequisitKeys = srmPurchaseRequisitList.map(item => item.clauseId);
        yield put({
          type: 'updateState',
          payload: {
            allPurchaseRequisit: data,
            srmPurchaseRequisitList,
            purchaseRequisitKeys,
          },
        });
        return data;
      }
    },

    // 采购协议
    *querySrmContract({ payload }, { call, put }) {
      const data = getResponse(yield call(queryStatistical, payload));
      if (data) {
        const srmContractList = filter(data, item => {
          return item.isShow === 0;
        });
        const contractKeys = srmContractList.map(item => item.clauseId);
        yield put({
          type: 'updateState',
          payload: {
            allContract: data,
            srmContractList,
            contractKeys,
          },
        });
        return data;
      }
    },

    // 供应商采购协议
    *querySrmSingContract({ payload }, { call, put }) {
      const data = getResponse(yield call(queryStatistical, payload));
      if (data) {
        const srmSingContractList = filter(data, item => {
          return item.isShow === 0;
        });
        const singContractKeys = srmSingContractList.map(item => item.clauseId);
        yield put({
          type: 'updateState',
          payload: {
            allSingContract: data,
            srmSingContractList,
            singContractKeys,
          },
        });
        return data;
      }
    },

    // 添加需要展示的采购订单
    *addPurchases({ payload }, { call }) {
      const orderType = yield call(addPurchases, payload);
      return getResponse(orderType);
    },

    // 添加需要展示的寻源条目
    *addSourceEvent({ payload }, { call }) {
      const orderType = yield call(addSourceEvent, payload);
      return getResponse(orderType);
    },

    // 添加需要展示的常用功能
    *addFunctions({ payload }, { call }) {
      const orderType = yield call(addFunctions, payload);
      return getResponse(orderType);
    },

    // 查询系统消息
    *querySystemMessage({ payload }, { call }) {
      const data = getResponse(yield call(querySystemMessage, payload));
      return data;
    },

    // 查询采购方待办事项
    *queryTodo({ payload }, { call, put }) {
      const data = getResponse(yield call(queryTodo, payload));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            todoList: data,
          },
        });
        return data;
      }
    },

    // 查询供应商待办事项
    *querySupplierTodo({ payload }, { call, put }) {
      const data = getResponse(yield call(queryTodo, payload));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            supplierTodoList: data,
          },
        });
        return data;
      }
    },

    // 查询工作流
    *queryWorkflow({ payload }, { call, put }) {
      const data = getResponse(yield call(queryWorkflow, payload));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            workflowList: data.content,
          },
        });
        return data;
      }
    },

    // 查询企业公告
    *queryAnnouncement({ payload }, { call }) {
      const data = getResponse(yield call(queryAnnouncement, payload));
      return data;
    },

    // 查询平台公告
    *queryCompanyNotice({ payload }, { call }) {
      const data = getResponse(yield call(queryCompanyNotice, payload));
      return data;
    },

    // 查询采购方报表
    *queryPurchasingReport({ payload }, { call, put }) {
      const data = getResponse(yield call(queryPurchasingReport, payload));
      if (data) {
        const res = data.dashboardAmtStatsList;
        const purchasingReport = res.map(item => ({
          x: item.amountStatisticsDate.substring(5, 10),
          y: item.taxIncludedAmount,
        }));
        yield put({
          type: 'updateState',
          payload: {
            purchaseAmount: data.amout,
            purchasingReport,
          },
        });
      }
    },

    // 查询供应方月度报表
    *queryReports({ payload }, { call, put }) {
      const data = getResponse(yield call(queryReports, payload));
      if (data) {
        const res = data.dashboardAmtStatsList;
        const reports = res.map(item => ({
          x: item.amountStatisticsDate.substring(5, 10),
          y: item.taxIncludedAmount,
        }));
        yield put({
          type: 'updateState',
          payload: {
            amounts: data.amout,
            reports,
          },
        });
      }
    },

    // 查询供应方年度报表
    *queryReportsYear({ payload }, { call, put }) {
      const data = getResponse(yield call(queryReports, payload));
      if (data) {
        const res = data.dashboardAmtStatsList;
        const reportsYear = res.map(item => ({
          x: `${item.month.toString()}${intl.get('spfm.dashboard.view.report.month').d('月')}`,
          y: item.taxIncludedAmount,
        }));
        yield put({
          type: 'updateState',
          payload: {
            amounts: data.amout,
            reportsYear,
          },
        });
      }
    },

    // 查询采购方领导月度报表
    *queryLeadership({ payload }, { call, put }) {
      const data = getResponse(yield call(queryPurchasingReport, payload));
      if (data) {
        const res = data.dashboardAmtStatsList;
        const leadershipReports = res.map(item => ({
          x: item.amountStatisticsDate.substring(5, 10),
          y: item.taxIncludedAmount,
        }));
        yield put({
          type: 'updateState',
          payload: {
            leadershipAmounts: data.amout,
            leadershipReports,
          },
        });
      }
    },

    // 查询采购方领导年度报表
    *queryLeadershipYear({ payload }, { call, put }) {
      const data = getResponse(yield call(queryPurchasingReport, payload));
      if (data) {
        const res = data.dashboardAmtStatsList;
        const leadershipYear = res.map(item => ({
          x: `${item.month.toString()}${intl.get('spfm.dashboard.view.report.month').d('月')}`,
          y: item.taxIncludedAmount,
        }));
        yield put({
          type: 'updateState',
          payload: {
            leadershipAmounts: data.amout,
            leadershipYear,
          },
        });
      }
    },

    // 系统消息变为已读
    *changeRead({ payload }, { call }) {
      const response = yield call(changeRead, payload);
      return getResponse(response);
    },

    // 查询风险日报
    *queryRiskDaily({ payload }, { call, put }) {
      const data = getResponse(yield call(queryRiskDaily, payload));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            riskDailyList: data,
          },
        });
        return data;
      }
    },
    // 查询风险日报
    *queryRiskCategory(_, { call, put }) {
      const data = getResponse(yield call(queryRiskCategory));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            categoryList: data,
          },
        });
      }
    },
    // 查询风险详情
    *queryRiskDetail({ payload }, { call, put }) {
      const data = getResponse(yield call(queryRiskDetail, payload));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            riskDetailList: data,
          },
        });
        return data;
      }
    },
    // 查询风险监控日报详情
    *queryRiskDailyModal({ payload }, { call, put }) {
      const data = getResponse(yield call(queryRiskDailyModal, payload));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            riskDailyModalList: data.content,
            riskDailyModalPagination: createPagination(data),
          },
        });
        return true;
      }
    },
    // 查询风险监控url
    *queryEnterpriseRisk({ payload }, { call }) {
      const response = yield call(queryEnterpriseRisk, payload);
      return getResponse(response);
    },

    // 风险监控标记已读
    //   *queryEnterpriseRiskRead({ payload }, { call }) {
    //     const data = getResponse(yield call(queryEnterpriseRiskRead, payload));
    //     return data;
    //   },

    // 获取多个值集
    // 获取初始化数据
    *init(_, { call, put }) {
      const noticeCategory = getResponse(
        yield call(
          queryIdpValue,
          isTenantRoleLevel() ? 'SPFM.TENANT_NOTICE_TYPE' : 'SPFM.PLATFORM_NOTICE_TYPE'
        )
      );
      yield put({
        type: 'updateState',
        payload: {
          noticeCategory,
        },
      });
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
