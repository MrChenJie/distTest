import uuid from 'uuid/v4';
import { getResponse, createPagination } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  queryList,
  add,
  saveInfo,
  getQueryBasicName,
  deleteLine,
  deleteTradeLine
} from '@/services/cooperationCategoryService';

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
  namespace: 'cooperationCategoryModal',
  state: {
    enumMap: {}
  },

  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          linkRevItemOptions: 'LINK.REV_ITEM',
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

    // 合作伙伴列表查询
    *queryList({ payload }, { call, put }) {
      const res = yield call(queryList, payload);
      const response = getResponse(res);
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

    // 合作伙伴列表新增
    *add({ payload }, { call }) {
      const response = cusGetResponse(yield call(add, payload));
      return response;
    },

    // 合作伙伴详情 保存
    *saveInfo({ payload }, { call }) {
      const response = cusGetResponse(yield call(saveInfo, payload));
      return response;
    },

    // 合作伙伴详情 查询
    *getQueryBasicName({ payload }, { call }) {
      const response = cusGetResponse(yield call(getQueryBasicName, payload));
      return response;
    },

    // 合作伙伴详情 删除
    *deleteLine({ payload }, { call }) {
      const response = cusGetResponse(yield call(deleteLine, payload));
      return response;
    },
    // 附件 删除
    *deleteTradeLine({ payload }, { call }) {
      const response = cusGetResponse(yield call(deleteTradeLine, payload));
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
 