import uuid from 'uuid/v4';
import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import {
  dataExport,
  getPartnerJudges,
  queryDetail,
  queryList,
  queryListDetail,
  queryPartnerFileData,
  queryPartnerListData, resetPartnerJudge, submitApplyJudges,
} from '@/services/registerManagementService';
import { queryMapIdpValue } from 'services/api';

function dealDataState(data) {
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
  namespace: 'registerManagementModel',
  state: {
    dataSource: [], // 汇总的数据源
    pagination: {}, // 汇总的分页对象
    enumMap: {}, // 值集
  },
  effects: {
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          JUDGE_DEPART: 'DICT.JUDGE_DEPART',
          LINK_PARTNER_CATEGORY: 'LINK.PARTNER_CATEGORY'
        }),
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap
        }
      })
      return enumMap
    },
    *queryList({ payload }, { call, put }) {
      const res = yield call(queryList, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: dealDataState(response.content),
            pagination: createPagination(response),
          },
        });
      }
      return res;
    },

    // 删除草稿状态列表
    // *deleteLine({ payload }, { call }) {
    //   const response = getResponse(yield call(deleteLine, payload));
    //   return response;
    // },

    // 查询报名信息基本信息
    *queryDetail({ payload }, { call }) {
      const response = getResponse(yield call(queryDetail, payload));
      return response;
    },

    // 查询报名信息-附件详情
    *queryListDetail({ payload }, { call }) {
      const response = getResponse(yield call(queryListDetail, payload));
      return response;
    },

    // 保存报名信息基本信息
    *saveCooperationModeInfo({ payload }, { call }) {
      const response = getResponse(yield call(saveCooperationModeInfo, payload));
      return response;
    },

    // 保存报名信息-附件详情
    *saveAttachmentInfo({ payload }, { call }) {
      const response = getResponse(yield call(saveAttachmentInfo, payload));
      return response;
    },

    // 删除报名信息-附件详情
    *deleteAttachmentLine({ payload }, { call }) {
      const response = getResponse(yield call(deleteAttachmentLine, payload));
      return response;
    },
    // 合作伙伴列表查询
    *queryPartnerListData({ payload }, { call }) {
      const res = yield call(queryPartnerListData, payload);
      return getResponse(res);
    },
    // 合作伙伴列表附件查询
    *queryPartnerFileData({ payload }, { call }) {
      const res = yield call(queryPartnerFileData, payload);
      return getResponse(res);
    },
    // 评委抽取
    *getPartnerJudges({ payload }, { call }) {
      const res = yield call(getPartnerJudges, payload);
      return getResponse(res);
    },
    // 发起评委流程
    *submitApplyJudges({payload }, { call }) {
      const res = yield call(submitApplyJudges, payload);
      return getResponse(res);
    },
    *resetPartnerJudge({payload }, { call }) {
      const res = yield call(resetPartnerJudge, payload);
      return getResponse(res);
    },
    *dataExport({payload }, { call }) {
      return getResponse(yield call(dataExport, payload));
    }
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
