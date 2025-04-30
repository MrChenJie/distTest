import uuid from 'uuid/v4';
import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import {
  queryList,
  deleteLine,
  getUserUnit,
  getApplier,
  getApplyDept,
  getMaterialsDetail,
  queryDetail,
  querySaleList,
  queryPurchaseInformationList,
  savePurchaseInfo,
  saveSalePlanInfo,
  deleteSalePlanLine,
  savePurchaseInformationInfo,
  deletePurchaseInformationLine,
  querySalePlanList,
  getPurchasingCategory,
  handleSupplierInfo,
  getPurchaseApplicationRate,
  getPoNumber,
  getPlanNameList,
  checkAmount,
  getItemQty,
} from '@/services/phoneBusinessListService';

function dealDataState(data) {
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map((item) => {
      return {
        ...item,
        rowKey: uuid(),
      };
    });
  }
  return config;
}

export default {
  namespace: 'phoneBusinessListModal',

  state: {
    dataSource: [], // 汇总的数据源
    pagination: {}, // 汇总的分页对象
  },

  effects: {
    *queryList({ payload }, { call, put }) {
      const res = yield call(queryList, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: dealDataState(response.content),
            pagination: createPagination(response),
          },
        });
      }
      return res;
    },

    // 查询物料列表数据
    *getMaterialsDetail({ payload }, { call, put }) {
      const res = getResponse(yield call(getMaterialsDetail, payload));
      if (res) {
        const { content = [] } = res;
        const pagination = createPagination(res);
        const newDataSource = content.map((item) => ({
          ...item,
          _status: 'update',
          uuid: uuid(),
        }));
        yield put({
          type: 'updateState',
          payload: {
            materialsList: newDataSource,
            materialsPagination: pagination,
          },
        });
      }
      return res;
    },

    // 查询采购详情-基本信息
    *queryDetail({ payload }, { call }) {
      const response = getResponse(yield call(queryDetail, payload));
      return response;
    },

    // 查询采购详情-采购计划详情
    *querySaleList({ payload }, { call }) {
      const response = getResponse(yield call(querySaleList, payload));
      return response;
    },
    // 查询采购详情-采购计划详情
    *queryPurchaseInformationList({ payload }, { call }) {
      const response = getResponse(yield call(queryPurchaseInformationList, payload));
      return response;
    },

    // 保存采购详情
    *savePurchaseInfo({ payload }, { call }) {
      const response = getResponse(yield call(savePurchaseInfo, payload));
      return response;
    },

    // 保存销售计划详情
    *saveSalePlanInfo({ payload }, { call }) {
      const response = getResponse(yield call(saveSalePlanInfo, payload));
      return response;
    },

    // 删除销售计划详情
    *deleteSalePlanLine({ payload }, { call }) {
      const response = getResponse(yield call(deleteSalePlanLine, payload));
      return response;
    },

    // 保存采购申请行信息详情
    *savePurchaseInformationInfo({ payload }, { call }) {
      const response = getResponse(yield call(savePurchaseInformationInfo, payload));
      return response;
    },

    // 删除采购申请行信息详情
    *deletePurchaseInformationLine({ payload }, { call }) {
      const response = getResponse(yield call(deletePurchaseInformationLine, payload));
      return response;
    },

    // 申请人部门接口
    *getUserUnit({ payload }, { call }) {
      const response = getResponse(yield call(getUserUnit, payload));
      return response;
    },

    // 需求人接口
    *getApplier({ payload }, { call }) {
      const response = getResponse(yield call(getApplier, payload));
      return response;
    },

    // 需求人部门接口
    *getApplyDept({ payload }, { call }) {
      const response = getResponse(yield call(getApplyDept, payload));
      return response;
    },

    // 查询销售计划表
    *querySalePlanList({ payload }, { call }) {
      const response = getResponse(yield call(querySalePlanList, payload));
      return response;
    },

    // 旧PO查询
    *getPurchasingCategory({ payload }, { call }) {
      const response = getResponse(yield call(getPurchasingCategory, payload));
      return response;
    },

    // 查询供应商信息
    *handleSupplierInfo({ payload }, { call }) {
      const response = getResponse(yield call(handleSupplierInfo, payload));
      return response;
    },

    // 查询供应商信息
    *getPurchaseApplicationRate({ payload }, { call }) {
      const response = getResponse(yield call(getPurchaseApplicationRate, payload));
      return response;
    },

    // 获取PO编号
    *getPoNumber({ payload }, { call }) {
      const response = getResponse(yield call(getPoNumber, payload));
      return response;
    },

    // 获取采购计划单名称列表
    *getPlanNameList({ payload }, { call }) {
      const response = getResponse(yield call(getPlanNameList, payload));
      return response;
    },

    // 校验品牌各预算金额
    *checkAmount({ payload }, { call }) {
      const response = getResponse(yield call(checkAmount, payload));
      return response;
    },

    // 获取物料库存
    *getItemQty({ payload }, { call }) {
      const response = getResponse(yield call(getItemQty, payload));
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
