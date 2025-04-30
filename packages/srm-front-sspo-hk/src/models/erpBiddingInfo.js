/*
 * erpBidding - ERP-model
 * @date: 2022-04-24
 * @author: CJ <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import { getResponse } from 'utils/utils';
import {
  getErpInfo,
  getErpProCode,
  subcontracting,
  subcontractingSave,
  subcontractingRemove,
  getPanesAll
} from '@/services/erpBiddingInfoService';

export default {
  namespace: 'erpBiddingInfo',

  state: {
    erpInfo: {},
    erpAllInfo: {},
    panesAll: {},
    formList: [],
  },

  effects: {
    // 获取基础信息
    *getErpInfo({ payload }, { put, call }) {
      const res = getResponse(yield call(getErpInfo, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            erpInfo: res || {},
          },
        });
        yield put({
          type: 'updateState',
          payload: {
            erpAllInfo: res || {},
          },
        });
      }
      return res;
    },

    // 获取erp的采购方案编号换取项目Id(proID)
    *getErpProCode({ payload }, { call }) {
      const response = getResponse(yield call(getErpProCode, payload));
      return response;
    },

    // 分标包
    *subcontracting({ payload }, { call }) {
      const response = getResponse(yield call(subcontracting, payload));
      return response;
    },

    // 分标包-保存
    *subcontractingSave({ payload }, { call }) {
      const response = getResponse(yield call(subcontractingSave, payload));
      return response;
    },

    // 分标包-删除
    *subcontractingRemove({ payload }, { call }) {
      const response = getResponse(yield call(subcontractingRemove, payload));
      return response;
    },

    // 获取基础信息
    *getPanesAll({ payload }, { put, call }) {
      const res = getResponse(yield call(getPanesAll, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            panesAll: res || {},
          },
        });
      }
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
