/*
 * @Description: certificateAuthority- CA认证
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-08-06 16:09:07
 * @LastEditTime: 2019-08-16 15:13:05
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import {
  queryList,
  save,
  fetchDetailInfo,
  saveDetail,
  submitDetail,
} from '@/services/certificateAuthorityService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'certificateAuthority',
  state: {
    formEnumMap: {}, // 查询表单值集
    detailEnumMap: {}, // 详情值集
    dataSource: [],
    pagination: {},
  },
  effects: {
    // 查询表单值集
    *fetchFormEnum(params, { put, call }) {
      const formEnumMap = getResponse(
        yield call(queryMapIdpValue, {
          enableFlag: 'HPFM.FLAG',
          CAStatusFlag: 'SPFM.CA_STATUS',
        })
      );
      if (formEnumMap) {
        yield put({
          type: 'updateState',
          payload: {
            formEnumMap: formEnumMap || {},
          },
        });
      }
    },

    // 获取值集
    *fetchDetailEnum(_, { call, put }) {
      const detailEnumMap = getResponse(
        yield call(queryMapIdpValue, {
          certificatesType: 'SPFM.ID_TYPE',
          legalPersonPlace: 'SPFM.AUTH_INFO_LEAGA_AREA',
        })
      );
      if (detailEnumMap) {
        yield put({
          type: 'updateState',
          payload: {
            detailEnumMap: detailEnumMap || {},
          },
        });
      }
    },

    // 查询列表
    *queryList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content.map(n => ({ ...n, _status: 'update' })),
            pagination: createPagination(response),
          },
        });
      }
      return response;
    },

    // 查询明细
    *fetchDetailInfo({ payload }, { call }) {
      const response = getResponse(yield call(fetchDetailInfo, payload));
      return response;
    },

    // 保存列表
    *save({ payload }, { call }) {
      const response = getResponse(yield call(save, payload));
      return response;
    },

    // 保存明细
    *saveDetail({ payload }, { call }) {
      const response = getResponse(yield call(saveDetail, payload));
      return response;
    },

    // 提交明细
    *submitDetail({ payload }, { call }) {
      const response = getResponse(yield call(submitDetail, payload));
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
