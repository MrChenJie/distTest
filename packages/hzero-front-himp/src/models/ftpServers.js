/**
 * @Description: FTP服务器信息 - model
 * @date 2023-02-02
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  query,
  save,
  deleteServers,
  deleteServersLine,
  queryDetail,
  fetchConfigList,
  deleteConfigList,
  saveConfigList,
  fetchSyncRecordList,
  saveSyncRecordList,
} from '../services/ftpServersService';

export default {
  namespace: 'ftpServers',
  state: {
    dataSource: [],
    pagination: {},
    ftpServer: {},
    ftpServerLineList: [],
    configList: [],
    configPagination: {},
    syncRecordList: [],
    syncRecordPagination: {},
  },
  effects: {
    *query({ payload }, { call, put }) {
      const res = yield call(query, payload);
      if (getResponse(res)) {
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
    *deleteServers({ payload }, { call, put }) {
      const res = yield call(deleteServers, payload);
      if (getResponse(res)) {
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

    *queryDetail({ payload }, { call, put }) {
      const res = yield call(queryDetail, payload);
      if (getResponse(res)) {
        const { ftpServer = {}, ftpServerLineList = [] } = res;
        yield put({
          type: 'updateState',
          payload: {
            ftpServer: ftpServer,
            ftpServerLineList,
          },
        });
      }
      return res;
    },

    // 更新模板头数据
    *save({ payload }, { call, put }) {
      const res = yield call(save, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            ftpServer: res,
          },
        });
        return res;
      }
    },

    *deleteServersLine({ payload }, { call }) {
      return getResponse(yield call(deleteServersLine, payload));
    },

    *fetchConfigList({ payload }, { call, put }) {
      const res = yield getResponse(call(fetchConfigList, payload));
      if (res && res.content) {
        yield put({
          type: 'updateState',
          payload: {
            configList: res.content,
            configPagination: createPagination(res),
          },
        });
      }
      return res;
    },

    *deleteConfigList({ payload }, { call }) {
      return getResponse(yield call(deleteConfigList, payload));
    },
    *saveConfigList({ payload }, { call }) {
      return getResponse(yield call(saveConfigList, payload));
    },

    *fetchSyncRecordList({ payload }, { call, put }) {
      const res = yield getResponse(call(fetchSyncRecordList, payload));
      if (res && res.content) {
        yield put({
          type: 'updateState',
          payload: {
            syncRecordList: res.content,
            syncRecordPagination: createPagination(res),
          },
        });
      }
      return res;
    },
    *saveSyncRecordList({ payload }, { call }) {
      return getResponse(yield call(saveSyncRecordList, payload));
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
