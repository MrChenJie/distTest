/**
 * approvalHK.js - 审批状态待办model
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/10/19
 * @Copyright: Copyright (c), 2023, hand
 */
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import {
  previewSupplierA2pDetail, previewSupplierBankDetail,
  queryApprovalInfo,
  queryCompanyFile,
  queryNoticeType,
  supplierInfoDataSave,
  getAddressBankInfoList,
  getBankInfoList,
  bankInfoExport,
  getLeaveCode,
} from '@/services/approvalHKService';

export default {
  namespace: 'approvalHK',
  state: {
    previewData: {}, // 单据详情数据
    fileData: [], // 供应商附件数据
    fileCascader: [],// 附件类型值集
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
      yield put({
        type: 'updateState',
        payload: {
          fileCascader
        }
      });
    },
    // 查询单据详情
    *queryApprovalInfo({ payload }, { call, put }) {
      const res = yield call(queryApprovalInfo, payload);
      const previewData = cusGetResponse(res);
      if(previewData) {
        yield put({
          type: 'updateState',
          payload: { previewData },
        });
      }
      return res;
    },
    // 查询附件信息
    *queryCompanyFile({ payload }, { call, put }) {
      const res = yield call(queryCompanyFile, payload);
      const fileData = cusGetResponse(res);
      if(fileData) {
        yield put({
          type: 'updateState',
          payload: { fileData },
        });
      }
      return res;
    },
    // 查询供应商a2p信息
    *previewSupplierA2pDetail({ payload }, { call, put }) {
      const res = yield call(previewSupplierA2pDetail, payload);
      return cusGetResponse(res);
    },
    // 查询供应商银行信息
    *previewSupplierBankDetail({ payload }, { call, put }) {
      const res = yield call(previewSupplierBankDetail, payload);
      return cusGetResponse(res);
    },
    // 供应商信息保存
    *supplierInfoDataSave({ payload }, { call, put }) {
      const res = yield call(supplierInfoDataSave, payload);
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
    // 导出银行信息
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
  }
}
