/**
 * index.js - 印章管理
 * @date: 2019-08-7
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import { queryList, queryModalList, update, deletes } from '@/services/sealMangeService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'sealMange',
  state: {
    enumMap: {}, // 列表CA状态值集
    detailEnumMap: {}, // 详情值集
    dataSource: [],
    pagination: {},
    // modalDataSource: [],
    // modalPagination: {},
  },
  effects: {
    // 查询列表
    *queryList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: (response.content || []).map(n => ({ ...n, _status: 'update' })),
            pagination: createPagination(response),
          },
        });
      }
    },

    // -查询值集
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          flag: 'SPFM.CA_STATUS',
          kind: 'HPFM.FLAG',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap: enumMap || {},
        },
      });
    },

    // 查询模态框
    *queryModalList({ payload }, { call }) {
      const response = getResponse(yield call(queryModalList, payload));
      return response;
    },

    // 保存更新模态框
    *update({ payload }, { call }) {
      const response = getResponse(yield call(update, payload.headerData));
      return response;
    },

    // -删除模态框
    *deletes({ payload }, { call }) {
      const response = getResponse(yield call(deletes, payload));
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
