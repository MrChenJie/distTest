/**
 * model - 处理邀约
 * @date: 2018-8-13
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.2
 * @copyright Copyright (c) 2018, Hand
 */
import {
  getInvitingInformation,
  approveCoop,
  rejectCoop,
  queryCompany,
  sendInvestigate,
  fetchHeaderInfo,
  fetchInvestigationDetail,
  fetchPrivacyPolicy,
  fetchPrivacyPolicyText,
} from '@/services/disposeInviteService';
import { handleAgree, handleReject } from '@/services/investigationApprovalService';
// import { queryIdpValue } from 'hzero-front/lib/services/api';
import { getResponse } from 'utils/utils';

export default {
  namespace: 'disposeInvite',
  state: {
    headerInfo: {}, // 调查表头部信息
    invitingInfo: {}, // 邀约信息
    detail: {},
    companyInfo: {}, // 公司信息
    privacyPolicyText: {},
  },
  effects: {
    // 获取邀请信息
    *getInvitingInformation({ payload }, { call, put }) {
      const response = yield call(getInvitingInformation, payload);
      // const { inviteId } = payload;
      const invitingInfo = getResponse(response);
      if (invitingInfo) {
        yield put({
          type: 'updateState',
          payload: { invitingInfo },
        });
      }
      return invitingInfo;
    },
    // 同意邀约
    *approveCoop({ payload }, { call }) {
      const response = yield call(approveCoop, payload);
      return getResponse(response);
    },
    // 拒绝邀约
    *rejectCoop({ payload }, { call }) {
      const response = yield call(rejectCoop, payload);
      return getResponse(response);
    },
    // 发送调查表
    *sendInvestigate({ payload }, { call }) {
      const response = yield call(sendInvestigate, payload);
      return getResponse(response);
    },
    // 查询公司信息
    *queryCompany({ payload }, { call, put }) {
      const response = yield call(queryCompany, payload);
      const data = getResponse(response);
      if (data) {
        const { basic = {}, business = {} } = data;
        yield put({
          type: 'updateState',
          payload: { companyInfo: { ...basic, ...business } },
        });
      }
    },
    // // 查询值集
    // *init({ payload }, { call, put }) {
    //   const { investigateType } = payload;
    //   const investigateTypeList = yield call(queryIdpValue, investigateType);
    //   yield put({
    //     type: 'updateState',
    //     payload: {
    //       investigateTypeList,
    //     },
    //   });
    // },
    // // 查询调查表
    // *fetchTemplate({ payload }, { call, put }) {
    //   const { investigateTemplateId } = payload;
    //   const config = getResponse(
    //     yield call(investigationTemplateHeaderQueryAll, investigateTemplateId)
    //   );
    //   if (!isEmpty(config)) {
    //     yield put({
    //       type: 'updateState',
    //       payload: {
    //         config: dealConfigData(config),
    //       },
    //     });
    //   }
    // },
    // 查询头部信息
    *fetchHeaderInfo({ payload }, { call, put }) {
      const response = yield call(fetchHeaderInfo, payload);
      const headerInfo = getResponse(response);
      if (headerInfo) {
        yield put({
          type: 'updateState',
          payload: {
            headerInfo,
          },
        });
      }
    },
    // 查询详情
    *fetchInvestigationHeader({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchInvestigationDetail, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detail: result,
          },
        });
      }
    },
    // 审批通过
    *handleAgree({ payload }, { call, put }) {
      const result = getResponse(yield call(handleAgree, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detail: result,
          },
        });
      }
      return result;
    },
    // 审批拒绝
    *handleReject({ payload }, { call, put }) {
      const result = getResponse(yield call(handleReject, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detail: result,
          },
        });
      }
      return result;
    },

    // 查询是否启用隐私政策
    *fetchPrivacyPolicy({ payload }, { call }) {
      const res = yield call(fetchPrivacyPolicy, payload);
      return getResponse(res);
    },

    // 隐私政策文档
    *fetchPrivacyPolicyText({ payload }, { call, put }) {
      const res = yield call(fetchPrivacyPolicyText, payload);
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            privacyPolicyText: res || {},
          },
        });
      }
    },
  },
  reducers: {
    updateState(state, { payload }) {
      const inviteId = payload.inviteId ? payload.inviteId : state.inviteId;
      const object = {
        [inviteId]: {
          headerInfo: {},
          invitingInfo: {},
          detail: {},
          companyInfo: {},
          privacyPolicyText: {},
          ...state[inviteId],
          ...payload,
        },
      };
      return {
        ...state,
        ...object,
        inviteId,
      };
    },
  },
};
