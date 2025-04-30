/*
 * partnerRelation - 参与方关联关系
 * @date: 2022-04-19
 * @author: CQX <yuzhang.dong@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import {
  queryPartnerRelationList,
  queryOperationRecordsList,
  queryPartnerRelationDetail,
  saveNewPartnerRelation,
  queryRsHeaders,
  validateRelationship,
  queryUpdateRelationList,
  saveUpdatePartnerRelation,
  getDepatement,
} from '@/services/partnerRelationship';
import { queryMapIdpValue } from 'services/api';
import uuid from 'uuid/v4';
import { createPagination } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';

function dealDataState(data) {
  // 处理行 处理字段为update
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map((item) => {
      return {
        ...item,
        rowKey: uuid(),
        _status: 'update',
      };
    });
  }
  return config;
}

export default {
  namespace: 'partnerRelationship',

  state: {
    partnerRelationList: [],
    operationRecordsList: [],
    partnerRelationPagination: {},
    operationRecordsPagination: {},
    attachmentList: [], // 附件行
    companyInfoList: [{ _status: 'create' }], // 企业信息列表
    associedCompanyInfoList: [], // 关联企业信息列表
    headerData: {}, // 关联单头数据

    mobileRFIList: [], // 证书类型
  },
  effects: {
    *queryInviteTypes(params, { call, put }) {
      const lovCode = {
        inviteTypeCode: 'SPFM.PURCHASE_CERT_TYPE',
      };
      const res = cusGetResponse(yield call(queryMapIdpValue, lovCode));
      if (res) {
        const mobileRFIList = [];
        // res.inviteTypeCode
        for (let i = 0; i < res.inviteTypeCode.length; i++) {
          if (res.inviteTypeCode[i].tag === 'MOBILE-RFI') {
            mobileRFIList.push(res.inviteTypeCode[i]);
          }
        }
        yield put({
          type: 'updateState',
          payload: {
            mobileRFIList,
          },
        });
      }
    },
    *queryPartnerRelationList({ payload }, { call, put }) {
      const res = yield call(queryPartnerRelationList, payload);
      if (cusGetResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            partnerRelationList: dealDataState(res.content) || {},
            partnerRelationPagination: createPagination(res),
          },
        });
      }
    },
    *queryOperationRecordsList({ payload }, { call, put }) {
      const res = yield call(queryOperationRecordsList, payload);
      if (cusGetResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            operationRecordsList: res.content || {},
            operationRecordsPagination: createPagination(res),
          },
        });
      }
    },
    *queryPartnerRelationDetail({ payload }, { call, put }) {
      const res = yield call(queryPartnerRelationDetail, payload);
      if (cusGetResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            createHeaderData: res.headerData,
            attachmentList: res.attachmentList || {},
            companyInfoList: res.companyInfoList,
            associedCompanyInfoList: res.associedCompanyInfoList,
          },
        });
      }
    },
    *queryRsHeaders({ payload }, { call, put }) {
      const res = yield call(queryRsHeaders, payload);
      if (cusGetResponse(res)) {
        const headerData = {
          rsReqNumber: res.rsReqNumber,
          rsReqStatusMeaning: res.rsReqStatusMeaning,
          rsReqTypeMeaning: res.rsReqTypeMeaning,
          creatorName: res.creatorName,
          creatorDept: res.creatorDept,
          creationDate: res.creationDate,
        };
        const companyInfoList = [
          {
            fromCompanyId: res.fromCompanyId,
            fromCompanyNum: res.fromCompanyNum,
            fromCompanyName: res.fromCompanyName,
            fromEbsVendorCode: res.fromEbsVendorCode,
            groupName: res.groupName,
            businessType: res.businessType,
            businessCode: res.businessCode,
            businessName: res.businessName,
          },
        ];
        yield put({
          type: 'updateState',
          payload: {
            headerData,
            attachmentList: res.comRsFileLineList || {},
            companyInfoList: dealDataState(companyInfoList),
            associedCompanyInfoList: dealDataState(res.companyRsLineReqDTOList),
            associedCompanyPagination: {
              current: 1,
              total: res.companyRsLineReqDTOList.length,
              pageSize: 10,
            },
          },
        });
      }
    },
    *queryUpdateRelationList({ payload }, { call, put }) {
      const res = yield call(queryUpdateRelationList, payload);
      const { companyRsLineReqDTOList, comRsFileLineList, ...info } = res;
      if (cusGetResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            associedCompanyInfoList: dealDataState(res.companyRsLineReqDTOList),
            associedCompanyPagination: {
              current: 1,
              total: res.companyRsLineReqDTOList.length,
              pageSize: 10,
            },
            attachmentList: res.comRsFileLineList || [],
            companyInfoList: [{
              ...info,
              _status: 'create',
            }]
          },
        });
      }
    },
    *saveNewPartnerRelation({ payload }, { call, put }) {
      const res = yield call(saveNewPartnerRelation, payload);
      return res;
    },
    *saveUpdatePartnerRelation({ payload }, { call, put }) {
      const res = yield call(saveUpdatePartnerRelation, payload);
      return res;
    },
    *validateRelationship({ payload }, { call, put }) {
      const res = yield call(validateRelationship, payload);
      return res;
    },
    *getDepatement({ payload }, { call, put }) {
      const res = yield call(getDepatement, payload);
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
