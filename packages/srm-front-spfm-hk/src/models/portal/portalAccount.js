/*
 * portalAccount - 供应商门户账号配置相关
 * @date: 2023-09-07
 * @author: FHS <huasheng.fang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import { getResponse } from '_cus_utils/utils';
import {
  fetchList,
  save,
  deleteLines,
  generateAccount,
  supplierExport,
  fetchPermissionTree,
  batchAssignPermissionSets,
  batchUnAssignPermissionSets,
  fetchUserData,
  updateUserData,
  saveWithAccount
} from '../../services/portal/portalAccountService';
import { isEmpty, cloneDeep } from 'lodash';

export default {
  namespace: 'companyAccountRec',
  state: {},

  effects: {
    *fetchList({ payload }, { call }) {
      return getResponse(yield call(fetchList, payload));
    },

    *save({ payload }, { call }) {
      return getResponse(yield call(save, payload));
    },
    *saveWithAccount({ payload }, { call }) {
      return getResponse(yield call(saveWithAccount, payload));
    },
    *deleteLines({ payload }, { call }) {
      return getResponse(yield call(deleteLines, payload));
    },

    *generateAccount({ payload }, { call }) {
      return getResponse(yield call(generateAccount, payload));
    },
    *supplierExport({ payload }, { call }) {
      return getResponse(yield call(supplierExport, payload));
    },
    *fetchPermissionTree({ roleId, tenantId }, { call }) {
      const res = yield call(fetchPermissionTree, roleId, tenantId);
      const response = getResponse(res);
      const defaultExpandedRowKeys = [];

      /**
       * 组装新dataSource
       * @function assignListData
       * @param {!Array} [collections = []] - 树节点集合
       * @returns {Array} - 新的dataSourcee
       *
       */
      function assignListData(collections = []) {
        return collections.map((n) => {
          const m = n;
          m.key = n.id;
          if (isEmpty(m.subMenus)) {
            m.subMenus = null;
          } else {
            m.subMenus = assignListData(m.subMenus);
            defaultExpandedRowKeys.push(m.id);
            const checkedCount = m.subMenus.filter((o) => o.checkedFlag === 'Y').length;
            const indeterminateCount = m.subMenus.filter((o) => o.checkedFlag === 'P').length;
            m.checkedFlag =
              checkedCount === m.subMenus.length
                ? 'Y'
                : checkedCount === 0
                ? indeterminateCount === 0
                  ? null
                  : 'P'
                : 'P';
          }
          return m;
        });
      }
      function filterPsData(collections = []) {
        return collections.map((n) => {
          const m = n;
          m.key = n.id;
          if (isEmpty(m.subMenus)) {
            m.subMenus = null;
          } else if (n.subMenus.length > 0 && n?.subMenus[0]?.type === 'ps') {
            m.subMenus = null;
          } else {
            m.subMenus = filterPsData(m.subMenus);
          }
          return m;
        });
      }
      const originDataSource = assignListData(response || []);
      const dataSource = cloneDeep(originDataSource);

      return {
        originDataSource,
        dataSource: filterPsData(dataSource || []),
        defaultExpandedRowKeys,
      };
    },
    *batchAssignPermissionSets({ payload }, { call }) {
      return getResponse(yield call(batchAssignPermissionSets, payload));
    },

    *batchUnAssignPermissionSets({ payload }, { call }) {
      return getResponse(yield call(batchUnAssignPermissionSets, payload));
    },
    *fetchUserData({ payload }, { call }) {
      return getResponse(yield call(fetchUserData, payload));
    },
    *updateUserData({ payload }, { call }) {
      return getResponse(yield call(updateUserData, payload));
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
