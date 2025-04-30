import { getResponse as cusGetResponse } from '_cus_utils/utils';
import {
  queryList,
  deleteList,
  saveList,
  queryLabelType,
  saveLabelType,
  deleteLabelType,
  queryLabelContent,
  saveLabelContent,
  deleteLabelContent,
  editPermissions,
  deptEditPermissions,
} from '@/services/supplierLabelService';
import { createPagination } from 'utils/utils';

export default {
  namespace: 'supplierLabel',
  state: {
    dataSource: [],
    pagination: {},
    labelTypeDataSource: [],
    labelTypePagination: {},
    labelContentDataSource: [],
    labelContentDSK: [],
  },
  effects: {
    *queryList({ payload }, { call, put }) {
      const res = yield call(queryList, payload);
      if (cusGetResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: res.content,
            pagination: createPagination(res),
          },
        });
      }
      return res;
    },
    *deleteList({ payload }, { call }) {
      return cusGetResponse(yield call(deleteList, payload));
    },
    *saveList({ payload }, { call }) {
      return cusGetResponse(yield call(saveList, payload));
    },
    *queryLabelType({ payload }, { call, put }) {
      const res = yield call(queryLabelType, payload);
      if (cusGetResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            labelTypeDataSource: res.content,
            labelTypePagination: createPagination(res),
          },
        });
      }
      return res;
    },
    *saveLabelType({ payload }, { call }) {
      return cusGetResponse(yield call(saveLabelType, payload));
    },
    *deleteLabelType({ payload }, { call }) {
      return cusGetResponse(yield call(deleteLabelType, payload));
    },

    *queryLabelContent({ payload }, { call, put }) {
      const res = yield call(queryLabelContent, payload);
      if (cusGetResponse(res)) {
        const defaultSelectedRowKeys = [];
        const recursion = (data) => {
          data.map((item) => {
            if (item.relationFlag === 1) {
              defaultSelectedRowKeys.push(item.labelId);
            }
            if (Array.isArray(item.children) && item.children.length > 0) {
              recursion(item.children);
            }
          });
        };
        recursion(res || []);
        yield put({
          type: 'updateState',
          payload: {
            labelContentDataSource: res,
            labelContentDSK: defaultSelectedRowKeys,
          },
        });
      }
      return res;
    },
    *saveLabelContent({ payload }, { call }) {
      return cusGetResponse(yield call(saveLabelContent, payload));
    },
    *deleteLabelContent({ payload }, { call }) {
      return cusGetResponse(yield call(deleteLabelContent, payload));
    },
    *editPermissions({ payload }, { call }) {
      return cusGetResponse(yield call(editPermissions, payload));
    },
    *deptEditPermissions({ payload }, { call }) {
      return cusGetResponse(yield call(deptEditPermissions, payload));
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
