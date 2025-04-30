/**
 * index.js - 我收到的协议
 * @date: 2019-05-24
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import { queryList } from '../services/supplierContractViewService';

export default {
  namespace: 'supplierContractView',
  state: {
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
    dataSource: [], // 列表数据
    pagination: {},
    operationRecordPagination: {},
    operationRecordList: [],
  },

  effects: {
    // -查询列表
    *queryList({ payload }, { call, put }) {
      const { page, ...otherParams } = payload;
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            listQuery: otherParams,
            dataSource: response.content.map(n => ({
              ...n,
              _status: 'update',
            })),
            pagination: createPagination(response),
          },
        });
      }
    },
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          status: 'SPCM.CONTRACT.KIND',
          source: 'SPRM.SRC_PLATFORM',
          flag: 'SPCM.CONTRACT.STATUS',
        })
      );
      if (enumMap) {
        yield put({
          type: 'updateState',
          payload: {
            enumMap,
          },
        });
      }
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
