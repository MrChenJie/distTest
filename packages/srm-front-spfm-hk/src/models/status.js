/**
 * status.js - 状态更新记录model
 * @Author: qi.xue01@hand-china.com
 * @Date: 2024/1/18
 * @Copyright: Copyright (c), 2024, hand
 */
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { createPagination } from 'utils/utils';
import { queryStatusList, queryStatusUpdateInfoById, statusInfoSave } from '@/services/statusService';

export default {
  namespace: 'status',
  state: {
    statusList: {}, // 状态更新记录列表
    statusListPagination: {}, // 状态更新记录列表分页
    statusUpdateInfo: {} // 自动发起黑名单
  },
  effects: {
    // 查询状态更新记录列表
    *queryStatusList({ payload }, { call, put }) {
      const res = yield call(queryStatusList, payload);
      const statusList = cusGetResponse(res);
      const statusListPagination = createPagination(statusList);
      yield put({
        type: 'updateState',
        payload: { statusList, statusListPagination },
      });
      return statusList
    },
    // 根据id查询状态记录更新单详情
    *queryStatusUpdateInfoById({ payload }, { call, put }) {
      const res = yield call(queryStatusUpdateInfoById, payload);
      const statusUpdateInfo = cusGetResponse(res);
      yield put({
        type: 'updateState',
        payload: { statusUpdateInfo },
      });
      return statusUpdateInfo
    },
    // 自动单保存
    *statusInfoSave({ payload }, { call, put }) {
      const res = yield call(statusInfoSave, payload);
      const statusUpdateInfo = cusGetResponse(res);
      yield put({
        type: 'updateState',
        payload: { statusUpdateInfo },
      });
      return statusUpdateInfo
    }
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  }
}
