/**
 * model 组织架构维护
 * @date: 2018-6-19
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { isNil } from 'lodash';

import { getResponse, createPagination } from 'utils/utils';
import { queryIdpValue } from 'hzero-front/lib/services/api';
import { organizationQueryLazyTree, queryList } from '../services/organizationService';

// function buildNewTreeDataSource(treeDataSource = [], iterFunc) {
//   return treeDataSource.map(item => {
//     if (item.children) {
//       const newItem = iterFunc(item);
//       return {
//         ...newItem,
//         children: buildNewTreeDataSource(newItem.children, iterFunc),
//       };
//     } else {
//       return iterFunc(item);
//     }
//   });
// }

function transformData(dataSource = [], indent = 0) {
  console.log('dataSource', dataSource);
  return dataSource.map((item) => {
    if (item.hasNextFlag === 1) {
      console.log('item', item);
      return {
        ...item,
        indent,
        // children: [],
      };
    } else {
      return {
        ...item,
        indent,
      };
    }
  });
}

export default {
  namespace: 'organization',

  state: {
    treeDataSource: [], // 树结构数据
    expandKeys: [], // 树结构数据展开的数据
  },

  effects: {
    *unitsQueryLazyTree({ payload = {} }, { call, put }) {
      const { unitId, indent = -1 } = payload;
      console.log('unitId', payload);
      const params = {};
      const queryChild = !isNil(unitId);
      if (queryChild) {
        params.unitId = unitId;
      }
      yield put({
        type: 'updateLoadingExpandKeys',
        payload: {
          queryChild,
          unitId,
          type: 'load',
        },
      });
      // const res = yield call(organizationQueryLazyTree, params);
      const res = yield call(queryList, params);
      const responseRes = getResponse(res);
      console.log('responseRes', responseRes);
      if (responseRes) {
        yield put({
          type: 'updateTreeDataSource',
          payload: {
            queryChild,
            unitId,
            treeData: transformData(responseRes.content, indent + 1),
          },
        });
      }
      alert('sdfds');
      yield put({
        type: 'updateLoadingExpandKeys',
        payload: {
          queryChild,
          unitId,
          type: 'unload',
        },
      });
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
              // if (item.proId === unitId) {
              return {
                ...item,
                // children: treeData,
              };
              // } else {
              //   return item;
              // }
            })
          : treeData,
        expandKeys: queryChild ? [...state.expandKeys, unitId] : [],
      };
    },
  },
};
