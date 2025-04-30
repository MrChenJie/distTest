/**
 * accessToSupplierHK.js - 供应商准入model
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/26
 * @Copyright: Copyright (c), 2023, hand
 */

import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { createPagination } from 'utils/utils';
import {
  basicInfoSave,
  contactsInfoSave,
  financeInfoDataSave,
  invitationRegister,
  masterDataExport,
  previewSupplierBankDetail,
  previewSupplierDetail,
  previewSupplierFileDetail,
  purchaseInfoSave,
  supplierCheck,
  supplierInfoDataSave,
  queryNoticeType,
  queryPlatformSupplier,
  invitationEnrollment,
  inviteStateList,
  getInvitedOptions,
  queryUnit,
  queryPurchaseDetail,
  queryContactDetail,
  queryAttachmentDetail,
  previewSupplierA2pDetail,
  checkSupplierName,
  checkRegistrationNumber,
  getNodeInfo,
  getEmail,
  deleteSupplierByIds,
  queryBasicInfo,
  queryContactsInfo,
  queryConvertSupplierInfo,
  initDictDate,
  queryDictClientInfo,
  queryDictCompanyAttachment,
  invitationToRegister,
  getAddressBankInfoList,
  getBankInfoList,
  deleteAddressBankInfoLine,
  deleteBankInfoLine,
  saveBankInfoList,
  bankInfoExport,
  getLeaveCode,
} from '@/services/accessToSupplierHKService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'accessToSupplierHK',
  state: {
    platformList: {}, // 供应商列表
    platformPagination: {}, // 供应商分页数据
    previewData: {}, // 供应商预览详情数据
    supplierCheckData: {}, // 供应商查重数据
    supplierCheckDataPagination: {}, // 供应商查重数据分页
    basicInfo: {}, // 基本信息数据
    fileCascader: [], // 附件类型值集
    enumMap: {}, // 值集
  },
  effects: {
    // 查询附件类型值集
    *init(params, { put, call }) {
      const fileCascader = cusGetResponse(
        yield call(queryNoticeType, {
          'HKSP.COMPANY.ATTACHMENT_TYPE': 1,
          'HKSP.COMPANY.SUB_ATTACHMENT': 2,
        })
      );
      const enumMap = cusGetResponse(
        yield call(queryMapIdpValue, {
          unitCode: 'HKSP.UNIT_CODE', // 部门值集
          inviteType: 'DICT.PARTNER_INVITE_TYPE', // 邀请类型值集
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          fileCascader,
          enumMap,
        },
      });
    },
    *deleteSupplier({ payload }, { call, put }) {
      const res = yield call(deleteSupplierByIds, payload.ids);
      return res;
    },
    // 查询供应商列表
    *queryPlatformSupplierAccessList({ payload }, { call, put }) {
      const res = yield call(queryPlatformSupplier, payload);
      const platformList = cusGetResponse(res);
      const platformPagination = createPagination(platformList);
      yield put({
        type: 'updateState',
        payload: { platformList, platformPagination },
      });
      return platformList;
    },
    // 供应商信息保存
    *supplierInfoDataSave({ payload }, { call, put }) {
      const res = yield call(supplierInfoDataSave, payload);
      return cusGetResponse(res);
    },
    // 供应商基本信息保存
    *basicInfoSave({ payload }, { call, put }) {
      const res = yield call(basicInfoSave, payload);
      return cusGetResponse(res);
    },
    // 供应商联系人保存
    *contactsInfoSave({ payload }, { call, put }) {
      const res = yield call(contactsInfoSave, payload);
      return cusGetResponse(res);
    },
    // 查询供应商汇总信息
    *previewSupplierDetail({ payload }, { call, put }) {
      const res = yield call(previewSupplierDetail, payload);
      const previewData = cusGetResponse(res);
      if (previewData) {
        yield put({
          type: 'updateState',
          payload: { previewData },
        });
      }
      return res;
    },
    // 查询供应商银行信息
    *previewSupplierBankDetail({ payload }, { call, put }) {
      const res = yield call(previewSupplierBankDetail, payload);
      return cusGetResponse(res);
    },
    // 查询供应商附件信息
    *previewSupplierFileDetail({ payload }, { call, put }) {
      const res = yield call(previewSupplierFileDetail, payload);
      return cusGetResponse(res);
    },
    // 采购供应商信息保存
    *purchaseInfoSave({ payload }, { call, put }) {
      const res = yield call(purchaseInfoSave, payload);
      return cusGetResponse(res);
    },
    // 采购供应商信息详情
    *queryPurchaseDetail({ payload }, { call, put }) {
      const res = yield call(queryPurchaseDetail, payload);
      return cusGetResponse(res);
    },
    // 采购供应商客户信息详情
    *queryContactDetail({ payload }, { call, put }) {
      const res = yield call(queryContactDetail, payload);
      return cusGetResponse(res);
    },
    // 采购供应商附件信息详情
    *queryAttachmentDetail({ payload }, { call, put }) {
      const res = yield call(queryAttachmentDetail, payload);
      return cusGetResponse(res);
    },
    // 采购a2p信息详情
    *previewSupplierA2pDetail({ payload }, { call, put }) {
      const res = yield call(previewSupplierA2pDetail, payload);
      return cusGetResponse(res);
    },
    *financeInfoDataSave({ payload }, { call, put }) {
      const res = yield call(financeInfoDataSave, payload);
      return cusGetResponse(res);
    },
    // 邀请注册
    *invitationRegister({ payload }, { call, put }) {
      const res = yield call(invitationRegister, payload);
      return cusGetResponse(res);
    },

    // 邀请登记
    *invitationEnrollment({ payload }, { call, put }) {
      const res = yield call(invitationEnrollment, payload);
      return cusGetResponse(res);
    },
    // 供应商查重
    *supplierCheck({ payload }, { call, put }) {
      const res = yield call(supplierCheck, payload);
      const supplierCheckData = cusGetResponse(res);
      const supplierCheckDataPagination = createPagination(supplierCheckData);
      if (supplierCheckData) {
        yield put({
          type: 'updateState',
          payload: { supplierCheckData, supplierCheckDataPagination },
        });
      }
      return cusGetResponse(res);
    },
    // 主数据导出
    *masterDataExport({ payload }, { call, put }) {
      return cusGetResponse(yield call(masterDataExport, payload));
    },
    // 查询当前登录人部门
    *queryUnit({ payload }, { call, put }) {
      const res = yield call(queryUnit, payload);
      return cusGetResponse(res);
    },
    // 商业登记证号码查重
    *checkRegistrationNumber({ payload }, { call, put }) {
      const res = yield call(checkRegistrationNumber, payload);
      return cusGetResponse(res);
    },
    // 供应商名称查重
    *checkSupplierName({ payload }, { call, put }) {
      const res = yield call(checkSupplierName, payload);
      return cusGetResponse(res);
    },
    *getNodeInfo({ payload }, { call, put }) {
      const res = yield call(getNodeInfo, payload);
      return cusGetResponse(res);
    },

    *getEmail({ payload }, { call, put }) {
      const res = yield call(getEmail, payload);
      return res;
    },
    // 邀请状态
    *inviteStateList({ payload }, { call, put }) {
      const res = yield call(inviteStateList, payload);
      return res;
    },
    // 邀请供应商准入时，添加供应商查重功能
    *getInvitedOptions ({ payload }, { call, put }) {
      const res = yield call(getInvitedOptions, payload);
      return res;
    },
    *queryBasicInfo({ payload }, { call, put }) {
      const res = yield call(queryBasicInfo, payload);
      return cusGetResponse(res);
    },
    *queryContactsInfo({ payload }, { call, put }) {
      const res = yield call(queryContactsInfo, payload);
      return cusGetResponse(res);
    },
    *queryConvertSupplierInfo({ payload }, { call, put }) {
      const res = yield call(queryConvertSupplierInfo, payload);
      return cusGetResponse(res);
    },
    *initDictDate({ payload }, { call, put }) {
      const res = yield call(initDictDate, payload);
      return cusGetResponse(res);
    },
    *queryDictClientInfo({ payload }, { call, put }) {
      const res = yield call(queryDictClientInfo, payload);
      return cusGetResponse(res);
    },
    *queryDictCompanyAttachment({ payload }, { call, put }) {
      const res = yield call(queryDictCompanyAttachment, payload);
      return cusGetResponse(res);
    },
    *invitationToRegister({ payload }, { call, put }) {
      const res = yield call(invitationToRegister, payload);
      return cusGetResponse(res);
    },
    // 查询银行地址信息
    *getAddressBankInfoList({ payload }, { call, put }) {
      const res = yield call(getAddressBankInfoList, payload);
      return cusGetResponse(res);
    },
    // 查询银行明细信息
    *getBankInfoList({ payload }, { call, put }) {
      const res = yield call(getBankInfoList, payload);
      return cusGetResponse(res);
    },
    // 删除银行地址信息
    *deleteAddressBankInfoLine({ payload }, { call, put }) {
      const res = yield call(deleteAddressBankInfoLine, payload);
      return cusGetResponse(res);
    },
    // 删除银行明细信息
    *deleteBankInfoLine({ payload }, { call, put }) {
      const res = yield call(deleteBankInfoLine, payload);
      return cusGetResponse(res);
    },
    // 保存银行关联关系
    *saveBankInfoList({ payload }, { call, put }) {
      const res = yield call(saveBankInfoList, payload);
      return cusGetResponse(res);
    },
    // 银行信息导出
    *bankInfoExport({ payload }, { call, put }) {
      const res = yield call(bankInfoExport, payload);
      return cusGetResponse(res);
    },
    // 查询编码规则
    *getLeaveCode({ payload }, { call, put }) {
      const res = yield call(getLeaveCode, payload);
      return cusGetResponse(res);
    },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
