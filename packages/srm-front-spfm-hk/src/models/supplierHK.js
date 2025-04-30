/**
 * supplierHK.js - 供应商管理model
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/20
 * @Copyright: Copyright (c), 2023, hand
 */

import { createPagination } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import {
  masterDataExport,
  previewSupplierBankDetail,
  previewSupplierDetail,
  queryPlatformSupplier,
  supplierCheck,
  supplierInfoDataSave,
  previewSupplierAttachmentDetail,
  queryNoticeType,
  previewSupplierA2pDetail,
  queryUnit,
  financeToPurchaseSave,
  queryUpdateInfo,
  delUpdateInfo,
  newSupplierInfo,
  updateInfoDetail,
  updateInfoSave,
  compareData,
  queryFinanceUpdateInfo,
  delFinanceUpdateInfo,
  newFinanceSupplierInfo,
  financeUpdateInfoDetail,
  queryBlackList,
  delBlackListInfo,
  newBlack,
  financeUpdateInfoSave,
  blackListInfoSave, blackInfoDetail, checkRegistrationNumber, checkSupplierName, getNodeInfo,
  getCaseId,
  getAddressBankInfoList,
  getBankInfoList,
  deleteAddressBankInfoLine,
  deleteBankInfoLine,
  saveBankInfoList,
  getEditAddressBankInfoList,
  getEditBankInfoList,
  deleteEditAddressBankInfoLine,
  deleteEditBankInfoLine,
  saveEditBankInfoList,
  bankInfoExport,
  bankInfoEditExport,
  baseInfoExport,
  getLeaveCode,
} from '@/services/supplierHKService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'supplierHK',
  state: {
    platformList: {}, // 供应商列表
    platformPagination: {}, // 供应商分页
    previewData: {}, // 供应商预览详情数据
    fileCascader: [], // 附件类型值集
    updateInfoList: {}, // 基本信息更新列表
    updateInfoPagination: {}, // 基本信息分页
    updateInfo: {},// 采购&财务供应商信息更新单详情数据
    comparisonData: {}, // 供应商对比信息数据
    financeUpdateInfoList: {}, // 财务信息更新列表数据
    financeUpdateInfoPagination: {}, // 财务信息更新列表分页
    financeUpdateInfo: {},// 财务供应商信息更新单详情数据
    blackInfoList: {}, // 黑名单列表数据
    blackInfoListPagination: {}, // 黑名单列表分页
    blackUpdateInfo: {},
    enumMap: {}, // 列表值集
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
          supplierStatus: 'HKSP.SUP_STATUS'
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
    // 查询供应商列表
    *queryPlatformSupplierAccessListCheck({ payload }, { call, put }) {
      const res = yield call(queryUpdateInfo, payload);
      return res;
    },
    // 主数据导出
    *masterDataExport({ payload }, { call, put }){
      return cusGetResponse(yield call(masterDataExport, payload))
    },
    // 查询供应商汇总信息
    *previewSupplierDetail({ payload }, { call, put }) {
      const res = yield call(previewSupplierDetail, payload);
      const previewData = cusGetResponse(res);
      if(previewData) {
        yield put({
          type: 'updateState',
          payload: { previewData },
        });
      }
      return res;
    },
    // 供应商信息保存
    *supplierInfoDataSave({ payload }, { call, put }) {
      const res = yield call(supplierInfoDataSave, payload);
      return cusGetResponse(res);
    },
    // 供应商查重
    *supplierCheck({payload}, {call, put}) {
      const res = yield call(supplierCheck, payload);
      const supplierCheckData =  cusGetResponse(res);
      if(supplierCheckData) {
        yield put({
          type: 'updateState',
          payload: { supplierCheckData },
        });
      }
      return cusGetResponse(res)
    },
    // 查询供应商银行信息
    *previewSupplierBankDetail({ payload }, { call, put }) {
      const res = yield call(previewSupplierBankDetail, payload);
      return cusGetResponse(res);
    },
    // 查询供应商附件信息
    *previewSupplierAttachmentDetail({ payload }, { call, put }) {
      const res = yield call(previewSupplierAttachmentDetail, payload);
      return cusGetResponse(res);
    },
    // 查询供应商a2p信息
    *previewSupplierA2pDetail({ payload }, { call, put }) {
      const res = yield call(previewSupplierA2pDetail, payload);
      return cusGetResponse(res);
    },
    // 查询当前登录人部门
    *queryUnit({ payload }, { call, put }) {
      const res = yield call(queryUnit, payload);
      return cusGetResponse(res);
    },
    // 财务转采购供应商信息保存
    *financeToPurchaseSave({ payload }, { call, put }) {
      const res = yield call(financeToPurchaseSave, payload);
      return cusGetResponse(res);
    },
    // 查询供应商基本信息变更列表
    *queryUpdateInfo({ payload }, { call, put }) {
      const res = yield call(queryUpdateInfo, payload);
      const updateInfoList = cusGetResponse(res);
      const updateInfoPagination = createPagination(updateInfoList);
      yield put({
        type: 'updateState',
        payload: { updateInfoList, updateInfoPagination },
      });
      return updateInfoList;
    },
    // 删除供应商基本信息
    *delUpdateInfo({ payload }, { call, put }) {
      const res = yield call(delUpdateInfo, payload.selectedRowKeys);
      return cusGetResponse(res);
    },
    // 新建供应商基本信息
    *newSupplierInfo({ payload }, { call, put }) {
      const res = yield call(newSupplierInfo, payload);
      const updateInfo = cusGetResponse(res);
      yield put({
        type: 'updateState',
        payload: { updateInfo },
      });
      return updateInfo
    },
    // 查询供应商信息更新详情
    *updateInfoDetail({ payload }, { call, put }) {
      const res = yield call(updateInfoDetail, payload);
      const updateInfo = cusGetResponse(res);
      yield put({
        type: 'updateState',
        payload: { updateInfo },
      });
      return updateInfo
    },
    // 供应商信息更新大保存
    *updateInfoSave({ payload }, { call, put }) {
      const res = yield call(updateInfoSave, payload);
      const updateInfo = cusGetResponse(res);
      yield put({
        type: 'updateState',
        payload: { updateInfo },
      });
      return updateInfo
    },
    // 供应商信息更新比对
    *compareData({ payload }, { call, put }) {
      const res = yield call(compareData, payload);
      yield put({
        type: 'updateState',
        payload: { comparisonData: res },
      });
      return cusGetResponse(res);
    },
    // 供应商财务信息更新列表
    *queryFinanceUpdateInfo({ payload }, { call, put }) {
      const res = yield call(queryFinanceUpdateInfo, payload);
      const financeUpdateInfoList = cusGetResponse(res);
      const financeUpdateInfoPagination = createPagination(financeUpdateInfoList);
      yield put({
        type: 'updateState',
        payload: { financeUpdateInfoList, financeUpdateInfoPagination },
      });
      return financeUpdateInfoList;
    },

    // 供应商财务信息更新列表 
    *queryFinanceUpdateInfoCheck({ payload }, { call, put }) {
      const res = yield call(queryFinanceUpdateInfo, payload);
      return cusGetResponse(res);
    },
    // 删除财务供应商基本信息
    *delFinanceUpdateInfo({ payload }, { call, put }) {
      const res = yield call(delFinanceUpdateInfo, payload.selectedRowKeys);
      return cusGetResponse(res);
    },
    // 新建财务供应商基本信息
    *newFinanceSupplierInfo({ payload }, { call, put }) {
      const res = yield call(newFinanceSupplierInfo, payload);
      const financeUpdateInfo = cusGetResponse(res);
      yield put({
        type: 'updateState',
        payload: { financeUpdateInfo },
      });
      return financeUpdateInfo
    },
    // 查询供应商财务信息变更详情
    *financeUpdateInfoDetail({ payload }, { call, put }) {
      const res = yield call(financeUpdateInfoDetail, payload);
      const financeUpdateInfo = cusGetResponse(res);
      yield put({
        type: 'updateState',
        payload: { financeUpdateInfo },
      });
      return financeUpdateInfo
    },
    // 查询黑名单列表
    *queryBlackList({ payload }, { call, put}) {
      const res = yield call(queryBlackList, payload);
      const blackInfoList = cusGetResponse(res);
      const blackInfoListPagination = createPagination(blackInfoList);
      yield put({
        type: 'updateState',
        payload: { blackInfoList, blackInfoListPagination },
      });
      return blackInfoList;
    },
    // 删除黑名单
    *delBlackListInfo({ payload }, { call, put }) {
      const res = yield call(delBlackListInfo, payload.selectedRowKeys);
      return cusGetResponse(res);
    },
    // 新增黑名单
    *newBlack({ payload }, { call, put }) {
      const res = yield call(newBlack, payload);
      const blackUpdateInfo = cusGetResponse(res);
      yield put({
        type: 'updateState',
        payload: { blackUpdateInfo },
      });
      return blackUpdateInfo
    },
    // 财务信息变更保存
    *financeUpdateInfoSave({ payload }, { call, put }) {
      const res = yield call(financeUpdateInfoSave, payload);
      const financeUpdateInfo = cusGetResponse(res);
      yield put({
        type: 'updateState',
        payload: { financeUpdateInfo },
      });
      return financeUpdateInfo
    },
    // 黑名单信息保存
    *blackListSave({ payload }, { call, put }) {
      const res = yield call(blackListInfoSave, payload);
      const blackUpdateInfo = cusGetResponse(res);
      yield put({
        type: 'updateState',
        payload: { blackUpdateInfo },
      });
      return cusGetResponse(res);
    },
    *blackInfoDetail({ payload }, { call, put }) {
      const res = yield call(blackInfoDetail, payload);
      const blackUpdateInfo = cusGetResponse(res);
      yield put({
        type: 'updateState',
        payload: { blackUpdateInfo },
      });
      return blackUpdateInfo
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
    *getCaseId({ payload }, { call, put }) {
      const res = yield call(getCaseId, payload);
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
    // 查询编辑供应商信息的银行地址信息
    *getEditAddressBankInfoList({ payload }, { call, put }) {
      const res = yield call(getEditAddressBankInfoList, payload);
      return cusGetResponse(res);
    },
    // 查询编辑供应商信息的银行明细信息
    *getEditBankInfoList({ payload }, { call, put }) {
      const res = yield call(getEditBankInfoList, payload);
      return cusGetResponse(res);
    },
    // 删除编辑供应商信息的银行地址信息
    *deleteEditAddressBankInfoLine({ payload }, { call, put }) {
      const res = yield call(deleteEditAddressBankInfoLine, payload);
      return cusGetResponse(res);
    },
    // 删除编辑供应商信息的银行明细信息
    *deleteEditBankInfoLine({ payload }, { call, put }) {
      const res = yield call(deleteEditBankInfoLine, payload);
      return cusGetResponse(res);
    },
    // 保存编辑供应商信息的银行关联关系
    *saveEditBankInfoList({ payload }, { call, put }) {
      const res = yield call(saveEditBankInfoList, payload);
      return cusGetResponse(res);
    },
    // 供应商Id导出银行信息
    *bankInfoExport({ payload }, { call, put }) {
      const res = yield call(bankInfoExport, payload);
      return cusGetResponse(res);
    },
    // 变更Id导出银行信息
    *bankInfoEditExport({ payload }, { call, put }) {
      const res = yield call(bankInfoEditExport, payload);
      return cusGetResponse(res);
    },
    // 信息比对导出
    *baseInfoExport({ payload }, { call, put }) {
      const res = yield call(baseInfoExport, payload);
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
}
