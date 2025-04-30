/**
 * @Description: 合作伙伴评估汇总
 * @date 2025-04-14
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
  queryCooperationModel,
  getJudgesSummarySource,
  handleOtherExport,
  handleSummaryExport,
  handleWithdrawalRequest,
  generateCaseId,
} from '@/services/partnerAssessmentSummaryService';

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
  namespace: 'partnerAssessmentSummaryModal',

  state: {
    dataSource: [], // 合作伙伴评估汇总数据源
    pagination: {}, // 合作伙伴评估汇总分页
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

    // 查询合作模式
    *queryCooperationModel({ payload }, { call }) {
      const response = cusGetResponse(yield call(queryCooperationModel, payload));
      return response;
    },

    // 查询评委评分列表
    *getJudgesSummarySource({ payload }, { call }) {
      const response = cusGetResponse(yield call(getJudgesSummarySource, payload));
      return response;
    },

    // 详情导出
    *handleOtherExport({ payload }, { call }) {
      const response = cusGetResponse(yield call(handleOtherExport, payload));
      return response;
    },

    // 半年度汇总导出
    *handleSummaryExport({ payload }, { call }) {
      const response = cusGetResponse(yield call(handleSummaryExport, payload));
      return response;
    },

    // 退出申请
    *handleWithdrawalRequest({ payload }, { call }) {
      const response = cusGetResponse(yield call(handleWithdrawalRequest, payload));
      return response;
    },

    // 查询caseID
    *generateCaseId({ payload }, { call }) {
      const response = cusGetResponse(yield call(generateCaseId, payload));
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
 