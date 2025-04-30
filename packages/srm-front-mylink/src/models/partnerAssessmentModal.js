/**
 * @Description: 合作伙伴评估
 * @date 2025-04-12
 * @author <jie.chen06@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2025, Hand
 */
import uuid from 'uuid/v4';
import { createPagination } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import {
  queryList,
  queryHeadInfo,
  saveJudges,
  handleExport,
  handleImport,
  getJudgesSource,
} from '@/services/partnerAssessmentService';

function dealDataState(data) {
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map((item) => {
      return {
        ...item,
        rowKey: uuid(),
      };
    });
  }
  return config;
}

export default {
  namespace: 'partnerAssessmentModal',

  state: {
    dataSource: [], // 合作伙伴评估数据源
    pagination: {}, // 合作伙伴评估分页
  },

  effects: {
    *queryList({ payload }, { call, put }) {
      const res = yield call(queryList, payload);
      const response = cusGetResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: dealDataState(response.content),
            pagination: createPagination(response),
          },
        });
      }
      return res;
    },

    // 基本信息查询
    *queryHeadInfo({ payload }, { call }) {
      const response = cusGetResponse(yield call(queryHeadInfo, payload));
      return response;
    },

    // 模版导出
    *handleExport({ payload }, { call }) {
      const response = cusGetResponse(yield call(handleExport, payload));
      return response;
    },

    // 导入
    *handleImport({ payload }, { call }) {
      const response = cusGetResponse(yield call(handleImport, payload));
      return response;
    },

    // 保存评委评分信息
    *saveJudges({ payload }, { call }) {
      const response = cusGetResponse(yield call(saveJudges, payload));
      return response;
    },

    // 查询评委评分列表
    *getJudgesSource({ payload }, { call }) {
      const response = cusGetResponse(yield call(getJudgesSource, payload));
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
 