/*
 * 简易询价列表页面
 * @date: 2023-10-18
 * @author: 36712
 */
import { getResponse } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { queryMapIdpValue } from 'services/api';
import uuidv4 from 'uuid/v4';
import { createPagination } from 'hzero-front/lib/utils/utils';
import { queryUnifyIdpValue } from 'hzero-front/lib/services/api';
import {
  queryList,
} from '@/services/contractMaintainService';

function dealDataState(data) {
  // 处理行 处理字段为update
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map((item) => {
      return {
        ...item,
        rowKey: uuidv4(),
        _status: 'update',
      };
    });
  }
  return config;
}

export default {
  namespace: 'simpleInquireModel',
  state: {
    evaluationList: [],
    evaluationListPagination: {},
    enumMap: {},
  },
  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = cusGetResponse(
        yield call(queryUnifyIdpValue, {
          // 询价单状态
          recordsstatus: 'HKPC.PRRECORDSSTATUS',
          // 预算类型
          budgeType: 'HKPC.BUDGETTYPE',
          // 采购类别
          purchasingCategory: 'HKPC.PURCHASINGCATEGORY',
          // 采购实施状态
          kkk: 'HKPC.PESTAUS'
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

    *queryInfo({ payload }, { put, call }) {
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            evaluationList: response.content.map(n => ({
              ...n,
              _status: 'update',
              resultId: uuidv4(),
            })),
            evaluationListPagination: createPagination(response),
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
