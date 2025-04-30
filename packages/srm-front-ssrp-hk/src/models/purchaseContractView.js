/**
 * index.js - 我发起的协议
 * @date: 2019-05-23
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import {
  queryList,
  sureFileContract,
  uploads,
  fetchStage,
  fetchDocument,
  fetchDetailList,
} from '../services/purchaseContractViewService';

export default {
  namespace: 'purchaseContractView',
  state: {
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
    dataSource: [], // 列表数据
    pagination: {},
    operationRecordPagination: {},
    operationRecordList: [],
    listQuery: {},
    stageList: [],
    stagePagination: {},
    documentList: [],
    documentPagination: {},
    detailList: [],
    detailPagination: {},
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

    // 归档
    *sureFileContract({ payload }, { call }) {
      const response = getResponse(yield call(sureFileContract, payload));
      return response;
    },

    // 附件
    *uploads({ payload }, { call }) {
      const response = getResponse(yield call(uploads, payload));
      return response;
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

    // -查询协议阶段
    *fetchStage({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchStage, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            stageList: response.content,
            stagePagination: createPagination(response),
          },
        });
      }
    },
    // -查询执行单据
    *fetchDocument({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchDocument, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            documentList: response.content,
            documentPagination: createPagination(response),
          },
        });
      }
    },
    // 按明细查询协议
    *fetchDetailList({ payload }, { call, put }) {
      const { page, ...otherParams } = payload;
      const response = getResponse(yield call(fetchDetailList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            listQuery: otherParams,
            detailList:
              response.content && response.content.map(r => ({ ...r, _status: 'update' })),
            detailPagination: createPagination(response),
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
