import uuid from 'uuid/v4';
import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import {
  getPartnerInfo,
  getContactInfo,
  getCustomersInfo,
  getFinancialInfo,
  getAttachmentInfo,
  getProjectInfo,
  getScoreInfo,
  saveScoreInfo,
  getRefuseEmail,
  sendRefuseRmail,
  getJudgePartnerInfo,
  saveRefuseRmail,
  submitScoreInfo,
} from '@/services/partnerReviewService';

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
  namespace: 'partnerReview',

  state: {
    dataSource: [], // 数据源
    pagination: {}, // 分页对象
    partnerInfo: {}, // 基本信息
    contactList: [], // 联系人
    customerList: [], // 客户资料
    financialList: [], // 财务条件
    attachmentList: [], // 公司附件
    projectList: [], //项目经验
    scoreList: [], //打分
    mailInfo: {}, // 拒绝邮件信息
  },

  effects: {
    // 合作伙伴详情查询
    *getPartnerInfo({ payload }, { call, put }) {
      const res = yield call(getPartnerInfo, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            partnerInfo: response,
          },
        });
      }
      return res;
    },

    // 联系人查询
    *getContactInfo({ payload }, { call, put }) {
      const res = yield call(getContactInfo, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            contactList: dealDataState(response.content),
          },
        });
      }
      return res;
    },

    // 客户资料查询
    *getCustomersInfo({ payload }, { call, put }) {
      const res = yield call(getCustomersInfo, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            customerList: dealDataState(response.content),
          },
        });
      }
      return res;
    },

    //财务条件查询
    *getFinancialInfo({ payload }, { call, put }) {
      const res = yield call(getFinancialInfo, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            financialList: dealDataState(response.content),
          },
        });
      }
      return res;
    },

    //公司附件查询
    *getAttachmentInfo({ payload }, { call, put }) {
      const res = yield call(getAttachmentInfo, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            attachmentList: dealDataState(response.content),
          },
        });
      }
      return res;
    },

    //项目经验查询
    *getProjectInfo({ payload }, { call, put }) {
      const res = yield call(getProjectInfo, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            projectList: dealDataState(response.content),
          },
        });
      }
      return res;
    },

    // 打分列表查询
    *getScoreInfo({ payload }, { call, put }) {
      const res = yield call(getScoreInfo, payload);
      const response = getResponse(res);

      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            scoreList: dealDataState(response),
          },
        });
      }
      return res;
    },

    // 保存打分列表
    *saveScoreInfo({ payload }, { call }) {
      const res = yield call(saveScoreInfo, payload);
      return res;
    },

    // 提交打分列表

    *submitScoreInfo({ payload }, { call }) {
      const res = yield call(submitScoreInfo, payload);
      return res;
    },

    // 获取合作伙伴拒绝邮件模板
    *getRefuseEmail({ payload }, { call }) {
      const res = yield call(getRefuseEmail, payload);
      return res;
    },

    //保存合作伙伴拒绝邮件
    *saveRefuseRmail({ payload }, { call }) {
      const res = yield call(saveRefuseRmail, payload);
      return res;
    },

    //发送合作伙伴拒绝邮件
    *sendRefuseRmail({ payload }, { call }) {
      const res = yield call(sendRefuseRmail, payload);
      return res;
    },

    //合作伙伴详情查询--评委评审时用
    *getJudgePartnerInfo({ payload }, { call }) {
      const res = yield call(getJudgePartnerInfo, payload);
      return res;
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
