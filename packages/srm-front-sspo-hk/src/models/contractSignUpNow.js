/*
 * contractSignUpNow - 协议拟制model
 * @date: 2022-04-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { getNoticeDetail, goToSignUp } from '@/services/SignUpNowService';

export default {
  namespace: 'contractSignUpNow',
  state: {
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
    dataSource: [], // 列表数据
    signInfo: {},
    pagination: {},
    treeDataSource: [], // 树结构数据
    expandKeys: [], // 树结构数据展开的数据,
  },
  effects: {
    // -查询公告信息
    *getNoticeDetail({ payload }, { call, put }) {
      const response = getResponse(yield call(getNoticeDetail, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content.map(n => ({
              ...n,
              _status: 'update',
            })),
            // pagination: createPagination(response),
          },
        });
      }
    },

    // 立即报名
    *goToSignUp({ payload }, { call }) {
      const response = getResponse(yield call(goToSignUp, payload));
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
