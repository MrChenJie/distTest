/**
 * evaluationList.js - 供应商评审model
 * @Author: qi.xue01@hand-china.com
 * @Date: 2024/1/3
 * @Copyright: Copyright (c), 2024, hand
 */
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { createPagination } from 'utils/utils';
import {
  delEvaluationListInfo, evaluationSave, getCollectDetailById, getPurchaseOrderData, getSupplierDetail,
  queryEvaluationCollectList, queryEvaluationDetailBySupplierId,
  queryEvaluationList, getNodeInfo, resultDataExport,
} from '@/services/evaluationListService';

export default {
  namespace: 'evaluation',
  state: {
    evaluationList: [], // 供应商评审列表数
    evaluationListPagination: {}, // 供应商评审列表分页
    evaluationCollectList: [], // 供应商汇总列表
    evaluationCollectPagination: {}, // 供应商评审汇总列表分页
    evaluationDetail: {}, // 评审详情
    supplierData: {}, // 供应商基础信息
    purchaseOrderList: {}, // 采购订单信息列表
    purchaseOrderListPagination: {}, // 采购订单信息列表分页
    collectDetail: {}, // 供应商评审详情
  },
  effects: {
    // 查询供应商评审列表
    *queryEvaluationList({ payload }, { call, put}) {
     const res = yield call(queryEvaluationList, payload);
     const evaluationList = cusGetResponse(res);
     const evaluationListPagination = createPagination(evaluationList);
     yield put({
       type: 'updateState',
       payload: { evaluationList, evaluationListPagination },
     });
     return evaluationList;
    },
    // 删除供应商评审数据
    *delEvaluationListInfo({ payload }, { call, put }) {
      const res = yield call(delEvaluationListInfo, payload.selectedRowKeys);
      return cusGetResponse(res);
    },
    // 查询供应商评审汇总列表
    *queryEvaluationCollectList({ payload }, { call, put }){
      const res = yield call(queryEvaluationCollectList, payload);
      const evaluationCollectList = cusGetResponse(res);
      const evaluationCollectPagination = createPagination(evaluationCollectList);
      yield put({
        type: 'updateState',
        payload: { evaluationCollectList, evaluationCollectPagination },
      });
      return evaluationCollectList
    },
    // 根据id查询评审详情
    *queryEvaluationDetailBySupplierId({ payload }, { call, put }) {
      const res = yield call(queryEvaluationDetailBySupplierId, payload);
      const evaluationDetail = cusGetResponse(res);
      if(evaluationDetail) {
        yield put({
          type: 'updateState',
          payload: {
            evaluationDetail,
            purchaseOrderList: evaluationDetail?.po,
          }
        });
      }
      return res;
    },
    // 查询供应商汇总信息
    *getSupplierDetail({ payload }, { call, put }) {
      const res = yield call(getSupplierDetail, payload);
      const supplierData = cusGetResponse(res);
      if(supplierData) {
        yield put({
          type: 'updateState',
          payload: { supplierData },
        });
      }
      return res;
    },
    // 采购订单信息查询
    *getPurchaseOrderData({ payload }, { call, put }) {
      const res = yield call(getPurchaseOrderData, payload);
      const purchaseOrderList = cusGetResponse(res);
      const purchaseOrderListPagination = createPagination(purchaseOrderList);
      yield put({
        type: 'updateState',
        payload: { purchaseOrderList, purchaseOrderListPagination },
      });
      return purchaseOrderList
    },
    // 根据供应商评审汇总id查询详情
    *getCollectDetailById({ payload }, { call, put }) {
      const res = yield call(getCollectDetailById, payload);
      const collectDetail = cusGetResponse(res);
      if(collectDetail) {
        yield put({
          type: 'updateState',
          payload: { collectDetail }
        });
      }
      return res
    },
    *evaluationSave({ payload }, { call, put }) {
      const res = yield call(evaluationSave, payload);
      if (res.type === 'error') { 
        return res
      } else {
        const evaluationDetail = cusGetResponse(res);
        yield put({
          type: 'updateState',
          payload: { evaluationDetail },
        });
        return cusGetResponse(res);
      }
    },
    *getNodeInfo({ payload }, { call, put }) {
      const res = yield call(getNodeInfo, payload);
      return cusGetResponse(res);
    },
    *resultDataExport({ payload }, { call, put }) {
      return cusGetResponse(yield call(resultDataExport, payload))
    }
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
}
