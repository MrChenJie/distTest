/**
 * 单据权限配置 model
 *
 * @date    2023-03-23
 * @author  陈深星 <chen.shenxing@hand-china.com>
 */

import uuid from 'uuid/v4';
import { getResponse } from '_cus_utils/utils';
import { createPagination } from 'utils/utils';
import {
  queryLovData,
  queryLovList,
  queryUnitList,
  queryList,
  batchUpdate,
  batchDelete,
} from '@/services/docPermissionConfigService';
import '@/routes/DocPermissionConfig/index.less';

export default {
  namespace: 'docPermissionConfig',

  state: {},
  effects: {
    // 查询值集列表
    *queryLovList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryLovList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: { ...response },
        });
      }
      return response;
    },

    // 查询值集数据
    *queryLovData({ payload }, { call, put }) {
      const response = getResponse(yield call(queryLovData, payload));
      return { [`${payload.lovCode}`]: response };
    },

    // 查询部门数据
    *queryUnitList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryUnitList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: { unitList: response },
        });
        response.forEach((item) => {
          const { unitId } = item;
          const children = response.filter((d) => d.parentUnitId === unitId);
          Object.assign(item, {
            children,
            key: item.unitCode,
            title: item.unitName,
            value: item.unitCode,
          });
        });
        response.unshift({
          unitId: -1,
          parentUnitId: null,
          key: 'ALL',
          title: 'ALL',
          value: 'ALL',
          unitCode: 'ALL',
          unitName: 'ALL',
          children: [],
        });
        yield put({
          type: 'updateState',
          payload: { unitTreeList: response.filter((item) => item.parentUnitId === null) },
        });
      }
      return response;
    },

    // 查询列表
    *queryList({ payload }, { call, put }) {
      const { docType } = payload;
      const response = yield call(queryList, payload);
      if (getResponse(response)) {
        yield put({
          type: 'updateState',
          payload: {
            [`${docType}-configList`]:
              response.content &&
              response.content.map((item) => ({
                ...item,
                isNew: false,
                tempId: uuid(),
                cacheData: item,
              })),
            pagination: createPagination(response),
          },
        });
      }
    },

    // 批量更新
    *batchUpdate({ payload }, { call, put }) {
      const response = yield call(batchUpdate, payload);
      return getResponse(response);
    },

    // 批量删除
    *batchDelete({ payload }, { call, put }) {
      const response = yield call(batchDelete, payload);
      return getResponse(response);
    },
  },

  reducers: {
    updateState(state, action) {
      const newState = action.payload;
      return { ...state, ...newState };
    },
  },
};
