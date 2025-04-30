/**
 * index.js - 协议模板管理
 * @date: 2019-05-15
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import {
  update,
  queryList,
  getHeaderAttachmentUuid,
  getLineAttachmentUuid,
  fetchCompany,
  saveCompany,
  // queryAllDetailList,
} from '@/services/contractTemplateService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'contractTemplate',
  state: {
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
    dataSource: [],
    pagination: {},
    selectedRows: [],
    operationRecordPagination: {},
    operationRecordList: [],
  },
  effects: {
    // -查询列表
    *queryList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content.map(n => ({
              ...n,
              _status: 'update',
            })),
            pagination: createPagination(response),
          },
        });
      }
    },
    // -查询值集
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          flag: 'HPFM.FLAG',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap: enumMap || {},
        },
      });
    },
    // 获取明细头附件uuid
    *getHeaderAttachmentUuid({ data }, { call }) {
      const res = yield call(getHeaderAttachmentUuid, data);
      return getResponse(res);
    },
    // 获取明细行附件uuid
    *getLineAttachmentUuid({ data }, { call }) {
      const res = yield call(getLineAttachmentUuid, data);
      return getResponse(res);
    },
    // 更新模板协议编码列表
    *update({ payload }, { call }) {
      const response = getResponse(yield call(update, payload.headerData));
      return response;
    },
    *fetchCompany({ payload }, { call }) {
      const response = getResponse(yield call(fetchCompany, payload));
      return response;
    },
    // -保存公司协议模板
    *saveCompany({ payload }, { call }) {
      const response = getResponse(yield call(saveCompany, payload));
      return response;
    },
    // *updateState({ payload }, { put }) {
    //   yield put({
    //     type: 'updateState',
    //     payload: {
    //       a: 1
    //     },
    //   });
    // },
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
