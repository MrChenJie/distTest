/**
 * @Description: 接口监控 -邮件提醒
 * @date 2023-02-17
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { queryData, save, deleteList } from '@/services/emailReminderService';

export default {
  namespace: 'emailReminder',
  state: {
    dataSource: [], // 汇总的数据源
    pagination: {}, // 汇总的分页对象
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

    *save({ payload }, { call }) {
      return getResponse(yield call(save, payload));
    },
    *deleteList({ payload }, { call }) {
      return getResponse(yield call(deleteList, payload));
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
