/*
 * purchaseOrder - 协议拟制model
 * @date: 2022-06-13
 * @author: 36765
 */
import { getResponse } from 'utils/utils';
import {
  savePoInfo,
  checkNeedCreateMipProcess,
  submitPo,
  saveOrderGroup,
  fetchOrderGroup,
  submitPreCheck,
} from '@/services/purchaseOrderService';

export default {
  namespace: 'purchaseOrder',
  state: {
    poHeader: {}, // 头信息
  },
  effects: {
    /**
     * MIP保存
     */
    *savePoInfo({ payload }, { call }) {
      return getResponse(yield call(savePoInfo, payload));
    },

    *saveOrderGroup({ payload }, { call }) {
      return getResponse(yield call(saveOrderGroup, payload));
    },

    /**
     * 查询是否需要创建审批流
     */
    *checkNeedCreateMipProcess({ payload }, { call }) {
      return getResponse(yield call(checkNeedCreateMipProcess, payload));
    },

    /**
     * MIP提交
     */
    *submitPo({ payload }, { put, call }) {
      const res = getResponse(yield call(submitPo, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            poHeader: res.poHeader || {},
          },
        });
      }
      return res;
    },

    *fetchOrderGroup({ payload }, { call }) {
      return getResponse(yield call(fetchOrderGroup, payload));
    },

    /**
     * MIP会签
    */
    *submitPreCheck({ payload }, { call }) {
      return getResponse(yield call(submitPreCheck, payload));
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
