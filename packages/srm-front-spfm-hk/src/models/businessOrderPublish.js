import { queryIdpValue } from 'hzero-front/lib/services/api';
import { getResponse, createPagination, delItemsToPagination } from 'utils/utils';
import {
  fetchDataList,
  fetchOperate,
  fetchForm,
  fetchTable,
  fetchSignStatusList,
  saveBusinessOrder,
  deleteBusinessOrder,
  publishBusinessOrder,
  fetchSupplier,
  fetchAllSupplier,
  deleteSupplier,
} from '@/services/businessOrderPublishService';

export default {
  namespace: 'businessOrderPublish',
  state: {
    notificationStatus: [], // 通知单状态值集
    notificationType: [], // 通知单类型值集
    dataList: [], // 入口页面行
    pagination: {}, // 入口页面行分页
    operateRecord: [], // 操作记录
    operatePagination: {}, // 操作记录分页
    signRecord: [], // 签收状态
    signPagination: {}, // 签收状态分页
    orderFormData: {}, // 详细页头信息
    supplierTable: [], // 详细页供应商行信息
    supplierPagination: {}, // 详细页供应商行分页
    suppLovPagination: {}, // 供应商多选lov分页
    suppLovDataSource: [], // 供应商多选lov数据
    contentBody: '',
  },
  effects: {
    // 查询值集
    *queryIdpValue(_, { call, put }) {
      const notificationStatus = getResponse(yield call(queryIdpValue, 'SNTM.NOTIFICATION_STATUS'));
      const notificationType = getResponse(yield call(queryIdpValue, 'SNTM.NOTIFICATION_TYPE'));
      if (notificationStatus) {
        yield put({
          type: 'updateState',
          payload: {
            notificationStatus,
          },
        });
      }
      if (notificationType) {
        yield put({
          type: 'updateState',
          payload: {
            notificationType,
          },
        });
      }
    },
    // 查询业务通知单发布列表
    *fetchDataList({ payload }, { call, put }) {
      const res = yield call(fetchDataList, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataList: response.content,
            pagination: createPagination(response),
          },
        });
      }
    },
    // 查询业务通知单详细页头数据
    *fetchForm({ payload }, { call, put }) {
      const res = yield call(fetchForm, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            orderFormData: response,
            contentBody: response.notificationContent,
          },
        });
      }
      return response;
    },
    // 详细页供应商列表
    *fetchTable({ payload }, { call, put }) {
      const res = yield call(fetchTable, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            supplierTable: response.content.map(item => ({ ...item, _status: 'update' })) || [],
            supplierPagination: createPagination(response),
          },
        });
      }
    },
    // 供应商多选Lov
    *fetchSupplier({ payload }, { call, put }) {
      const res = yield call(fetchSupplier, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            suppLovDataSource: response.content,
            suppLovPagination: createPagination(response),
          },
        });
      }
    },
    // 查询全部供应商
    *fetchAllSupplier({ payload }, { call }) {
      const res = yield call(fetchAllSupplier, payload);
      return getResponse(res);
    },
    // 查询操作记录
    *fetchOperate({ payload }, { call, put }) {
      const res = yield call(fetchOperate, payload);
      const operateData = getResponse(res);
      if (operateData) {
        yield put({
          type: 'updateState',
          payload: {
            operateRecord: operateData.content || [],
            operatePagination: createPagination(operateData),
          },
        });
      }
    },
    // 查询签收状态明细
    *fetchSignStatusList({ payload }, { call, put }) {
      const res = yield call(fetchSignStatusList, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            signRecord: response.content || [],
            signPagination: createPagination(response),
          },
        });
      }
    },
    *deleteSupplier({ payload }, { call }) {
      const res = yield call(deleteSupplier, payload);
      return getResponse(res);
    },
    // 保存
    *saveBusinessOrder({ payload }, { call }) {
      const res = yield call(saveBusinessOrder, payload);
      return getResponse(res);
    },
    // 删除
    *deleteBusinessOrder({ payload }, { call }) {
      const res = yield call(deleteBusinessOrder, payload);
      return getResponse(res);
    },
    // 发布
    *publishBusinessOrder({ payload }, { call }) {
      const res = yield call(publishBusinessOrder, payload);
      return getResponse(res);
    },
  },
  reducers: {
    deleteRow(state, { payload }) {
      const newState = state.supplierTable.filter(
        item => !payload.includes(item.supplierCompanyId)
      );
      return {
        ...state,
        supplierTable: newState,
        supplierPagination: delItemsToPagination(
          payload.length,
          state.supplierTable.length,
          state.supplierPagination
        ),
      };
    },
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
