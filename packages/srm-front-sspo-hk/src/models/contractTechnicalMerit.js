/*
 * contractTechnicalMerit - 技术评分汇总接口
 * @date: 2022-04-21
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  getProjectInfo,
  getMilestoneInfo,
  getPriceTable,
  startPrice,
  getScoreDetail,
  getScoreDetailJudge,
  getJudgesList,
  revertDetail,
  getComplianceList,
  getPriceTableList,
  getPriceList,
  uploadList,
  saveList,
  finishList,
  saveListNew,
  downloadJudgeList,
  skillQueryNewExport,
  handleQuotationDetails,
} from '@/services/TechnicalMeritService';

export default {
  namespace: 'contractTechnicalMerit',
  state: {
    infoSource: [], // 基本信息数据
    priceSource: [], // 报价汇总表
    scorcDetail: [], // 技术评分详情
    scorcDetailJudge: [], // 评委评分表
    judgesList: [], // 退回的评委列表数据源
    complianceList: [], // 符合性审查表汇总
    pagination: {},
    priceSourceList: [],
    priceList: [],
    paginationList: {},
  },
  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          yesNO: 'BID.YES_OR_NO',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap,
        },
      });
    },

    // -查询项目基本信息
    *getProjectInfo({ payload }, { call, put }) {
      const response = getResponse(yield call(getProjectInfo, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            infoSource: response,
            // pagination: createPagination(response),
          },
        });
      }
      return response;
    },

    // -查询里程碑信息
    *getMilestoneInfo({ payload }, { call }) {
      const response = getResponse(yield call(getMilestoneInfo, payload));
      return response;
    },

    /**
     * 查询报价汇总表
     * */

    *getPriceTable({ payload }, { call, put }) {
      const response = getResponse(yield call(getPriceTable, payload));
      if (response && response.content) {
        yield put({
          type: 'updateState',
          payload: {
            priceSource: response.content.map((n) => ({
              ...n,
              _status: 'update',
            })),
            // pagination: createPagination(response),
          },
        });
      }
    },
    /**
     * 查询报价列表
     * */
    *getPriceTableList({ payload }, { call, put }) {
      const response = getResponse(yield call(getPriceTableList, payload));
      const newConst = response.map((n) => ({
        ...n,
        _status: 'update',
      }));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            priceList: newConst,
          },
        });
      }
    },

    /**
     * 查询供应商报价表
     * */
    *getPriceList({ payload }, { call, put }) {
      const response = getResponse(yield call(getPriceList, payload));
      const datalist = response.content.map((n) => ({
        ...n,
        _status: 'update',
      }));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            priceSourceList: datalist,
            paginationList: createPagination(response),
          },
        });
      }
    },

    /**
     * 更新
     * */
    *uploadList({ payload }, { call }) {
      const response = getResponse(yield call(uploadList, payload));
      return response;
    },

    /**
     * 保存
     * */
    *saveList({ payload }, { call }) {
      const response = getResponse(yield call(saveList, payload));
      return response;
    },
    /**
     * 保存评分
     * */
    *saveListNew({ payload }, { call }) {
      const response = getResponse(yield call(saveListNew, payload));
      return response;
    },

    /**
     * 结束
     * */

    *finishList({ payload }, { call, put }) {
      const response = getResponse(yield call(finishList, payload));
      return response;
    },

    /**
     * 发起报价
     * */

    *startPrice({ payload }, { call }) {
      const response = getResponse(yield call(startPrice, payload));
      return response;
    },

    /**
     * 查询技术评分详情表
     */
    *getScoreDetail({ payload }, { call, put }) {
      const response = getResponse(yield call(getScoreDetail, payload));
      if (response && response.content) {
        yield put({
          type: 'updateState',
          payload: {
            scorcDetail: response.content.map((n) => ({
              ...n,
              _status: 'update',
            })),
            pagination: createPagination(response),
          },
        });
      }
    },

    /**
     * 查询评委评分详情表
     */
    *getScoreDetailJudge({ payload }, { call, put }) {
      const response = getResponse(yield call(getScoreDetailJudge, payload));
      if (response && response.content) {
        yield put({
          type: 'updateState',
          payload: {
            scorcDetailJudge: response.content.map((n) => ({
              ...n,
              _status: 'update',
            })),
            pagination: createPagination(response),
          },
        });
      }
    },

    /**
     * 退回弹框
     * */
    *getJudgesList({ payload }, { call, put }) {
      const response = getResponse(yield call(getJudgesList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            judgesList: response.content.map((n) => ({
              ...n,
              _status: 'update',
            })),
            pagination: createPagination(response),
          },
        });
      }
    },

    /**
     * 退回
     * */
    *revertDetail({ payload }, { call }) {
      const response = getResponse(yield call(revertDetail, payload));
      return response;
    },

    /**
     * 符合性审查表汇总表
     * */

    *getComplianceList({ payload }, { call, put }) {
      const response = getResponse(yield call(getComplianceList, payload));
      if (response.content != undefined) {
        yield put({
          type: 'updateState',
          payload: {
            complianceList: response.content.map((n) => ({
              ...n,
              _status: 'update',
            })),
            pagination: createPagination(response),
          },
        });
      }
    },

    /**
     * 导出评委评审列表
     * */
    *downloadJudgeList({ payload }, { call }) {
      const response = getResponse(yield call(downloadJudgeList, payload));
      return response;
    },
    *skillQueryNewExport({ payload }, { call }) {
      const response = getResponse(yield call(skillQueryNewExport, payload));
      return response;
    },
    *handleQuotationDetails({ payload }, { call }) {
      const response = getResponse(yield call(handleQuotationDetails, payload));
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
