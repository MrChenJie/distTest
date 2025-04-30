/**
 * @Description: 飞书消息配置列表页面models
 * @date 2023-02-09
 * @author <xinyi.he02@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { queryData, queryDetail, save } from '@/services/feiShuMsgConfigService';

export default {
  namespace: 'feiShuMsgConfig',
  state: {
    dataSource: [], // 汇总的数据源
    pagination: {}, // 汇总的分页对象
    feiShuMsgConfigheader: {}, // 详情头对象
    feiShuMsgConfigList: [], //详情行数据源
  },
  effects: {
    *queryData({ payload }, { call, put }) {
      const res = yield call(queryData, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content,
            pagination: createPagination(response),
          },
        });
      }
      return res;
    },

    *queryDetail({ payload }, { call, put }) {
      const res = yield call(queryDetail, payload);
      const response = getResponse(res);
      if (response) {
        const { feiShuMsgConfig, feiShuMsgConfigDtlList } = response;
        yield put({
          type: 'updateState',
          payload: {
            feiShuMsgConfigheader: feiShuMsgConfig || {},
            feiShuMsgConfigList: (feiShuMsgConfigDtlList || []).map(item => ({ ...item, _status: 'update' })),
          },
        });
      }
      return res;
    },

    *save({ payload }, { call }) {
      const res = yield call(save, payload);
      return getResponse(res);
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
