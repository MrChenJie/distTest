/*
 * contractJudgesDashbord - 协议拟制model
 * @date: 2022-04-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  queryList,
  setReadState,
  updateReadState
} from '@/services/JudgesDashbordService';

export default {
  namespace: 'contractJudgesDashbord',
  state: {
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
    dataSource: [], // 列表数据
    pagination: {},
    treeDataSource: [], // 树结构数据
    expandKeys: [], // 树结构数据展开的数据,
  },
  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          demandDepart: 'BID.DEMAND.DEPARTMENT',
          status: 'BID.STATE',
          superiorDemandDepart: '',
          // flag: 'SPCM.CONTRACT.STATUS',
          // status: 'SPCM.CONTRACT.KIND',
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

    // -查询详情值集
    *fetchDetailEnum(params, { put, call }) {
      const detailEnumMap = getResponse(
        yield call(queryMapIdpValue, {
          kinds: 'SPCM.CONTRACT.KIND',
          partnerTypes: 'SPCM.PC_PARTNER_TYPE',
          contractPurposeList: 'SPCM.CONTRACT_PURPOSE',
          acceptTypeList: 'SPCM.ACCEPT_TYPE',
          propertiesList: 'SPUC.PR_LINE_ITEM_PROPERTIE',
          kiad: 'BID.SUPPLY_WAY_TEST',
        })
      );
      if (detailEnumMap) {
        yield put({
          type: 'updateState',
          payload: {
            detailEnumMap,
          },
        });
      }
    },

    // -评委表格数据
    *queryList({ payload }, { call }) {
      const response = getResponse(yield call(queryList, payload));
      // if (response) {
      //   yield put({
      //     type: 'updateState',
      //     payload: {
      //       dataSource: response,
      //       pagination: createPagination(response),
      //     },
      //   });
      // }
      return response;
    },

    // 点击阅读评委守则的事件
    *setReadState({ payload }, { call }) {
      const response = getResponse(yield call(setReadState, payload));
      return response;
    },

    // 阅读评委守则后的确认状态更新
    *updateReadState({ payload }, { call }) {
      const response = getResponse(yield call(updateReadState, payload));
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
    // 由于 可能异步问题 导致 数据不一致, 所以更新放到 reducer 中
    updateTreeDataSource(state, { payload }) {
      const { queryChild, unitId, treeData } = payload;
      return {
        ...state,
        treeDataSource: queryChild
          ? buildNewTreeDataSource(state.treeDataSource, (item) => {
              return {
                ...item,
                // children: treeData,
              };
            })
          : treeData,
        expandKeys: queryChild ? [...state.expandKeys, unitId] : [],
      };
    },
  },
};
