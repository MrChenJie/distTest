/*
 * contractBidWinningResult - 协议拟制model
 * @date: 2022-04-20
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  getBasicInfo,
  getTableInfo,
  getTableEmailInfo,
  saveInfo,
  getDecision,
  approvalProcess,
  getMaterialName,
  saveMaterial,
  getImproveMaterial,
  saveOnlyResult,
  delMaterial,
  saveImproveMaterial,
  getBudgetInfor,
  getPriceValidate,
  getProjectName,
  projectEditName,
  fetchPricingList,
  getDudgetDetailList,
  saveEditMat,
  getDecisionInformation,
  getProjectId,
} from '@/services/BidWinningResultService';

export default {
  namespace: 'contractBidWinningResult',
  state: {
    infoSource: [],
    tableSource: [], // 表数据
    tablePagination: {},
    pagination: {},
    tableEmailSource: '',

    budgetDetailList: [],
    budgetDetailPagination: {},
  },
  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          yesNo: 'BID.YES_OR_NO',
          status: 'BID.APPLYSTATUS_BIDDINGRESULT',
          category: 'HKPC.PURCHASINGCATEGORY', // 采购类别
          budgetType: 'HKPC.BUDGETTYPE', // 预算类型
          yesNoAlternate: 'HKPC.SELECTED_SUP',
          decisionType:'BID.DECISION_TYPE', //决策类型
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

    /**
     * 基本信息查询
     * */

    *getBasicInfo({ payload }, { call, put }) {
      const response = getResponse(yield call(getBasicInfo, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            infoSource: response,
          },
        });
      }
      return response;
    },
    /**
     * 表信息查询
     * */

    *getTableInfo({ payload }, { call, put }) {
      const response = getResponse(yield call(getTableInfo, payload));
      if (response.content != undefined) {
        yield put({
          type: 'updateState',
          payload: {
            tableSource: response.content.map((n) => ({
              ...n,
              _status: 'update',
            })),
            tablePagination: createPagination(response),
          },
        });
        return response;
      }
    },
    /**
     * 邮件模板的预览
     * */

    *getTableEmailInfo({ payload }, { call, put }) {
      const response = getResponse(yield call(getTableEmailInfo, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            tableEmailSource: response.content,
          },
        });
      }
      return response;
    },
    /**
     * 保存
     */
    *saveInfo({ payload }, { call }) {
      const response = getResponse(yield call(saveInfo, payload));
      return response;
    },

    /**
     * 保存后获取决策内容
     */
    *getDecision({ payload }, { call }) {
      const response = getResponse(yield call(getDecision, payload));
      return response;
    },

    /**
     * 保存结果后发起MIP审批
     */
    *approvalProcess({ payload }, { call }) {
      const response = getResponse(yield call(approvalProcess, payload));
      return response;
    },

    /**
     * 获取物料名称
     */
    *getMaterialName({ payload }, { call }) {
      const response = getResponse(yield call(getMaterialName, payload));
      return response;
    },

    /**
     * 保存物料名称
     */
    *saveMaterial({ payload }, { call }) {
      const response = cusGetResponse(yield call(saveMaterial, payload));
      return response;
    },

    /**
     * 查询完善物料&预算信息表格
     */
    *getImproveMaterial({ payload }, { call }) {
      const response = getResponse(yield call(getImproveMaterial, payload));
      return response;
    },

    /**
     * 单独保存采购结果
     */
    *saveOnlyResult({ payload }, { call }) {
      const response = getResponse(yield call(saveOnlyResult, payload));
      return response;
    },

    /**
     * 清除物料剩余数量
     */
    *delMaterial({ payload }, { call }) {
      const response = getResponse(yield call(delMaterial, payload));
      return response;
    },

    /**
     * 保存预算信息
     */
    *saveImproveMaterial({ payload }, { call }) {
      const response = getResponse(yield call(saveImproveMaterial, payload));
      return response;
    },

    /**
     * 查询预算信息
     */
    *getBudgetInfor({ payload }, { call }) {
      const response = getResponse(yield call(getBudgetInfor, payload));
      return response;
    },
    // 校验金额字段
    *getPriceValidate({ payload }, { call }) {
      const res = getResponse(yield call(getPriceValidate, payload));
      return res;
    },
    // 查询总的项目名称
    *getProjectName({ payload }, { call }) {
      const res = cusGetResponse(yield call(getProjectName, payload));
      return res;
    },
    // 修改项目名称
    *projectEditName({ payload }, { call }) {
      const res = cusGetResponse(yield call(projectEditName, payload));
      return res;
    },
    // 报价模式列表
    *fetchPricingList({ payload }, { call }) {
      const response = getResponse(yield call(fetchPricingList, payload));
      return response;
    },
    // 最终轮报价详细数据
    *getDudgetDetailList({ payload }, { call }) {
      const response = getResponse(yield call(getDudgetDetailList, payload));
      return response;
    },
    // 保存新增的物料
    *saveEditMat({ payload }, { call }) {
      const res = cusGetResponse(yield call(saveEditMat, payload));
      return res;
    },
    // 查询纪要信息
    *getDecisionInformation({ payload }, { call }) {
      const res = cusGetResponse(yield call(getDecisionInformation, payload));
      return res;
    },
    // 查询项目id
    *getProjectId({ payload }, { call }) {
      const res = cusGetResponse(yield call(getProjectId, payload));
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
