import uuid from 'uuid/v4';
import { getResponse, createPagination } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  getCooperationList,
  getExportDetail,
  getTemplateContent,
  sendEmail,
  getEmailContent,
  handleApproval,
  getDrawjudgeList,
  getRedrawList,
  submitBeginProcess,
  getQueryBasicName,
  getQueryBasicNum,
  saveInfo,
  deleteTradeLine,
  returned,
  notPass,
  getRevTotalNum,
  queryFileTypeList,
  queryPartnerhead,
  deleteLine,
  saveInfoPartner,
  getQueryBasicPartner,
  deletePartner,
  deleteStoreLine,
  deleteUpdateStoreLine,
  recall,
} from '@/services/PartnerInformationService';

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
  namespace: 'PartnerInformationModal',
  state: {
    enumMap: {},
    fileTypeList: [],
    dataSource: [],
    pagination: {},
    partnerStore: {},
    partnerStoreFile: [],
  },

  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          linkRevItemOptions: 'LINK.REV_ITEM',
        })
      );
      if (enumMap) {
        yield put({
          type: 'updateState',
          payload: {
            enumMap,
          },
        });
      }
    },

    // 合作伙伴列表查询
    *getCooperationList({ payload }, { call }) {
      const response = cusGetResponse(yield call(getCooperationList, payload));
      return response;
    },

    // 数据导出
    *getExportDetail({ payload }, { call }) {
      const response = cusGetResponse(yield call(getExportDetail, payload));
      return response;
    },

    // 根据模板邮件内容查询
    *getTemplateContent({ payload }, { call }) {
      const response = cusGetResponse(yield call(getTemplateContent, payload));
      return response;
    },

    // 发送邮件
    *sendEmail({ payload }, { call }) {
      const response = cusGetResponse(yield call(sendEmail, payload));
      return response;
    },

    // 查看邮件内容
    *getEmailContent({ payload }, { call }) {
      const response = cusGetResponse(yield call(getEmailContent, payload));
      return response;
    },

    // 发起审批
    *handleApproval({ payload }, { call }) {
      const response = cusGetResponse(yield call(handleApproval, payload));
      return response;
    },

    // 评委抽取
    *getDrawjudgeList({ payload }, { call }) {
      const response = cusGetResponse(yield call(getDrawjudgeList, payload));
      return response;
    },

    // 重新抽取
    *getRedrawList({ payload }, { call }) {
      const response = cusGetResponse(yield call(getRedrawList, payload));
      return response;
    },

    // 发起审批
    *submitBeginProcess({ payload }, { call }) {
      const response = cusGetResponse(yield call(submitBeginProcess, payload));
      return response;
    },

    // 查询基础信息
    *getQueryBasicName({ payload }, { call }) {
      const response = cusGetResponse(yield call(getQueryBasicName, payload));
      return response;
    },

    // 查询基础信息
    *getQueryBasicNum({ payload }, { call }) {
      const response = cusGetResponse(yield call(getQueryBasicNum, payload));
      return response;
    },

    // 合作伙伴信息详情-保存
    *saveInfo({ payload }, { call }) {
      const response = cusGetResponse(yield call(saveInfo, payload));
      return response;
    },

    // 合作伙伴信息详情-删除附件
    *deleteTradeLine({ payload }, { call }) {
      const response = cusGetResponse(yield call(deleteTradeLine, payload));
      return response;
    },

    // 合作伙伴信息详情-退回商户
    *returned({ payload }, { call }) {
      const response = cusGetResponse(yield call(returned, payload));
      return response;
    },

    // 合作伙伴信息详情-不通过
    *notPass({ payload }, { call }) {
      const response = cusGetResponse(yield call(notPass, payload));
      return response;
    },

    // 获取得分详情
    *getRevTotalNum({ payload }, { call }) {
      const response = cusGetResponse(yield call(getRevTotalNum, payload));
      return response;
    },

    *queryFileTypeList({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(queryFileTypeList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            fileTypeList: res || [],
          },
        });
      }
      return res;
    },

    // 合作伙伴信息更新
    *queryPartnerhead({ payload }, { call, put }) {
      const res = yield call(queryPartnerhead, payload);
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

    // 列表删除
    *deleteLine({ payload }, { call }) {
      const response = cusGetResponse(yield call(deleteLine, payload));
      return response;
    },

    // 合作伙伴更新-保存
    *saveInfoPartner({ payload }, { call }) {
      const response = cusGetResponse(yield call(saveInfoPartner, payload));
      return response;
    },

    // 合作伙伴更新-详情查询
    *getQueryBasicPartner({ payload }, { call }) {
      const response = cusGetResponse(yield call(getQueryBasicPartner, payload));
      return response;
    },

    // 合作伙伴信息详情-删除附件更新
    *deletePartner({ payload }, { call }) {
      const response = cusGetResponse(yield call(deletePartner, payload));
      return response;
    },

    // 合作伙伴信息详情-删除店铺行数据
    *deleteStoreLine({ payload }, { call }) {
      const response = cusGetResponse(yield call(deleteStoreLine, payload));
      return response;
    },
    *deleteUpdateStoreLine({ payload }, { call }) {
      const response = cusGetResponse(yield call(deleteUpdateStoreLine, payload));
      return response;
    },
    // 撤回
    *recall({ payload }, { call }) {
      const response = cusGetResponse(yield call(recall, payload));
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
