/**
 * @Description:
 * @date 2021-01-27 单据访问权限配置界面 - modal
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchPermissionList,
  savePermissions,
  enable,
} from '@/services/doctAccessPermissionService';
import uuid from 'uuid/v4';
import { queryMapIdpValue } from 'services/api';

function dealDataState(data) {
  // 处理行 处理字段为update
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
  namespace: 'documentAccessPermission',
  state: {
    dataSource: [],
    pagination: {},
    permissionTypeList: [],
    yesNoFlag: [],
  },

  effects: {
    // 聚合快码请求
    *loadMutilFastCode({ payload }, { call, put }) {
      const res = yield call(queryMapIdpValue, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            ...res,
          },
        });
      }
    },

    //  查询列表
    *fetchPermissionList({ payload }, { call, put }) {
      const res = yield call(fetchPermissionList, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: dealDataState(res.content),
            pagination: createPagination(res),
          },
        });
      }
    },

    // 保存
    *savePermissions({ payload }, { call }) {
      return getResponse(yield call(savePermissions, payload));
    },

    // 启用，禁用
    *enable({ payload }, { call }) {
      return getResponse(yield call(enable, payload));
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
