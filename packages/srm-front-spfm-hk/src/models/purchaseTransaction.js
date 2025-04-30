/**
 * model 采购事务类型定义
 * @date: 2018-12-18
 * @author: DTM <tingmin.deng@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchPurchaseTransList,
  updatePurchaseTransList,
} from '@/services/purchaseTransactionService';

/**
 * @param {object} list -
 */
// function changeDataStatus(list) {
//   // 判断是否是编辑状态
//   const { content, ...otherValue } = list;
//   const lines = [];
//   content.forEach(item => {
//     const items = { ...item };
//     if (!item._status) {
//       items._status = 'update';
//       items.isUpdate = false;
//     }
//     lines.push(items);
//   });
//   return { content: lines, ...otherValue };
// }

export default {
  namespace: 'purchaseTransaction',

  state: {
    list: {}, // 事务类型定义列表
    pagination: {}, // 分页参数
    dataSource: {}, // 备份事务类型定义列表
  },

  effects: {
    // 获取采购事务类型定义列表
    *fetchPurchaseTransList({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchPurchaseTransList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            pagination: createPagination(res),
          },
        });
      }
      return res;
      // if (list) {
      //   yield put({
      //     type: 'updateState',
      //     payload: {
      //       list: changeDataStatus(list),
      //       dataSource: changeDataStatus(list),
      //       pagination: createPagination(list),
      //     },
      //   });
      // }
    },

    // 批量创建采购事务类型
    *updatePurchaseTransList({ payload }, { call }) {
      const res = yield call(updatePurchaseTransList, payload);
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
