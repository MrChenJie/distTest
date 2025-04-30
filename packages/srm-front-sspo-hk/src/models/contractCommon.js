/*
 * @Description: contractCommon - 协议公共model
 * @Author: HB <bin.huang02@hand-china.com>
 * @Date: 2019-05-15
 * @LastEditTime: 2019-11-07 19:21:51
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { queryFileListOrg, removeFileOrg } from 'services/api';
import {
  fetchOperationRecord,
  fetchHeader,
  fetchPartner,
  fetchSubject,
  fetchStage,
  fetchTerm,
  fetchTermPage,
  deleteFilesByUrl,
  fetchFilesByUrl,
  fetchPcAttachmentList,
  updatePcAttachmentList,
  updateSupplierUuid,
  updatePurchaseUuid,
  updateContractTemplateUrl,
  fetchConfigSetting,
  fetchContractRebate,
  fetchCompany,
  fetchAddCompany,
  saveCompany,
  saveProject,
  getHeaderInfo
} from '@/services/contractCommonService';

export default {
  namespace: 'contractCommon',

  state: {
    operationRecordPagination: {},
    operationRecordList: [],
    configSetting: {},
  },

  effects: {
    // 查询明细头
    *fetchHeader(payload, { call }) {
      const response = yield call(fetchHeader, payload);
      return getResponse(response);
    },
    // 查询合作伙伴列表
    *fetchPartner({ payload }, { call }) {
      const res = yield call(fetchPartner, payload);
      return getResponse(res);
    },
    // 查询标的信息列表
    *fetchSubject({ payload }, { call }) {
      const res = yield call(fetchSubject, payload);
      return getResponse(res);
    },
    // 获取阶段信息
    *fetchStage({ payload }, { call }) {
      const res = yield call(fetchStage, payload);
      return getResponse(res);
    },
    // 获取返利信息
    *fetchContractRebate({ payload }, { call }) {
      const res = yield call(fetchContractRebate, payload);
      return getResponse(res);
    },
    // 查询业务条款列表
    *fetchTerm({ payload }, { call }) {
      const res = yield call(fetchTerm, payload);
      return getResponse(res);
    },
    // 分页查询业务条款列表
    *fetchTermPage({ payload }, { call }) {
      const res = yield call(fetchTermPage, payload);
      return getResponse(res);
    },
    // 查询操作记录
    *fetchOperationRecord({ payload }, { call }) {
      const res = getResponse(yield call(fetchOperationRecord, payload));
      return res;
    },
    // 查询url对应的文件
    *fetchFilesByUrl({ payload }, { call }) {
      const res = getResponse(yield call(fetchFilesByUrl, payload));
      return res;
    },
    // 删除url对应的文件
    *deleteFilesByUrl({ payload }, { call }) {
      const res = getResponse(yield call(deleteFilesByUrl, payload));
      return res;
    },
    // 查询协议头下面的配置附件列表
    *fetchPcAttachmentList({ payload }, { call }) {
      const res = getResponse(yield call(fetchPcAttachmentList, payload));
      return res;
    },
    // 更新协议头的附件信息
    *updatePcAttachmentList({ payload }, { call }) {
      const res = getResponse(yield call(updatePcAttachmentList, payload));
      return res;
    },
    // 查询uuid对应的附件列表
    *queryFileListOrg({ payload }, { call }) {
      const res = getResponse(yield call(queryFileListOrg, payload));
      return res;
    },
    // 更新供应商头uuid
    *updateSupplierUuid({ payload }, { call }) {
      const res = getResponse(yield call(updateSupplierUuid, payload));
      return res;
    },
    // 更新供应商头uuid
    *updatePurchaseUuid({ payload }, { call }) {
      const res = getResponse(yield call(updatePurchaseUuid, payload));
      return res;
    },
    // 删除uuid下面的url对应的附件
    *removeFileOrg({ payload }, { call }) {
      const res = getResponse(yield call(removeFileOrg, payload));
      return res;
    },
    // 更新协议模板的附件url
    *updateContractTemplateUrl({ payload }, { call }) {
      const res = getResponse(yield call(updateContractTemplateUrl, payload));
      return res;
    },

    // 查询配置中心配置
    *fetchConfigSetting({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchConfigSetting, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            configSetting: result,
          },
        });
      }
    },
    // 查询关联公司列表
    *fetchCompany({ payload }, { call }) {
      const response = getResponse(yield call(fetchCompany, payload));
      return response;
    },
    // 查询关联公司列表
    *fetchAddCompany({ payload }, { call }) {
      const response = getResponse(yield call(fetchAddCompany, payload));
      return response;
    },
    // -新建保存公司
    *saveCompany({ payload }, { call }) {
      const response = getResponse(yield call(saveCompany, payload));
      return response;
    },
    // -新建保存
    *saveProject({ payload }, { call }) {
      const response = getResponse(yield call(saveProject, payload));
      return response;
    },

    // -获取工作台头部信息
    *getHeaderInfo({ payload }, { call }) {
      const response = getResponse(yield call(getHeaderInfo, payload));
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
