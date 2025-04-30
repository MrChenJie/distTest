/*
 * @Description:
 * @Author: 谭治鹏
 * @email: ZHIPENG.TAN01@HAND-CHINA.COM
 * @Date: 2025-03-04 13:34:05
 */
import uuid from 'uuid/v4';
import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import {
  queryList,
  getBasicInfo,
  getAttachmentInfo,
  getRegisteTemplate,
  saveRegisteInfo,
  sendRegisteEmail,
  getRegisteHistoryEmail,
} from '@/services/registerOfficialWebsiteService';
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
  namespace: 'registerOfficialWebsiteModel',
  state: {
    dataSource: [], // 数据源
    pagination: {}, // 分页对象
    enumMap: {}, // 值集
    basicInfo: {}, // 详情页基本信息
    attachmentList: [], // 详情页附件列表
  },
  effects: {
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          JUDGE_DEPART: 'DICT.JUDGE_DEPART',
          LINK_PARTNER_CATEGORY: 'LINK.PARTNER_CATEGORY',
          emailCode: 'DICT.OFFICIAL_WEBSITE_FEEDBACK', // 邮件模板
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap,
        },
      });
      return enumMap;
    },
    // 查询官网注册列表
    *queryList({ payload }, { call, put }) {
      const res = yield call(queryList, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content.map((item) => {
              return {
                ...item,
                rowKey: uuid(),
              };
            }),
            pagination: createPagination(response),
          },
        });
      }
      return res;
    },

    // 官网注册详情基本信息查询
    *getBasicInfo({ payload }, { call, put }) {
      const res = yield call(getBasicInfo, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            basicInfo: response,
          },
        });
      }
      return res;
    },

    //官网注册详情附件信息查询
    *getAttachmentInfo({ payload }, { call, put }) {
      const res = yield call(getAttachmentInfo, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            attachmentList: dealDataState(response),
          },
        });
      }
      return res;
    },

    // 获取DICT合作伙伴报名注册的邮件模板
    *getRegisteTemplate({ payload }, { call }) {
      const response = cusGetResponse(yield call(getRegisteTemplate, payload));
      return response;
    },

    // 保存报名注册邮件信息
    *saveRegisteInfo({ payload }, { call }) {
      const response = cusGetResponse(yield call(saveRegisteInfo, payload));
      return response;
    },

    // 发送合作伙伴报名注册的邮件
    *sendRegisteEmail({ payload }, { call }) {
      const response = cusGetResponse(yield call(sendRegisteEmail, payload));
      return response;
    },

    // 查询报名注册历史邮件信息
    *getRegisteHistoryEmail({ payload }, { call }) {
      const response = cusGetResponse(yield call(getRegisteHistoryEmail, payload));
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
