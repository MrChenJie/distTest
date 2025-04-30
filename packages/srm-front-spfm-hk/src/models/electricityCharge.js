/**
 * @Description: IDC电费用量 - model
 * @date 2022-12-06
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import {
  fetchCostRequest,
  fetchPriceRequest,
  fetchIbossData,
  fetchIbossDataSummary,
  batchSubmit,
  templateExport,
  exportForm,
  exportPdf,
  idcDelete,
  syncToIboss,
  selectFile,
  downloadTemplate,
  queryImportResult,
  queryDetail,
  save,
  submit,
  returnBack,
  filesDelete,
  profileValue,
  profileValueSummary,
  getEmailTemplate,
  sendEmail,
  getEmailRecord,
  queryEmailDetail,
  customFileSummary,
} from '@/services/electricityChargeService';

export default {
  namespace: 'electricityCharge',
  state: {
    basicInfo: {}, // 基础信息
    costInfo: {}, // 成本信息
    priceInfo: {}, // 价格信息
    idcChargeFileList: [], // 附件信息
    idcChargeOperateHisList: [], // 操作历史
    idcChargeEmailList: [], // 邮件历史
    emailPagination: {}, // 邮件历史分页
    productType: '', //产品类型
    expenseType: '', // 费用类型
  },

  effects: {
    *fetchCostRequest({ payload }, { call }) {
      return getResponse(yield call(fetchCostRequest, payload));
    },
    *fetchPriceRequest({ payload }, { call }) {
      return getResponse(yield call(fetchPriceRequest, payload));
    },

    *fetchIbossData({ payload }, { call }) {
      return getResponse(yield call(fetchIbossData, payload));
    },

    *fetchIbossDataSummary({ payload }, { call }) {
      return getResponse(yield call(fetchIbossDataSummary, payload));
    },

    *batchSubmit({ payload }, { call }) {
      return getResponse(yield call(batchSubmit, payload));
    },

    *templateExport({ payload }, { call }) {
      return getResponse(yield call(templateExport, payload));
    },

    *exportForm({ payload }, { call }) {
      return getResponse(yield call(exportForm, payload));
    },

    *exportPdf({ payload }, { call }) {
      return getResponse(yield call(exportPdf, payload));
    },

    *idcDelete({ payload }, { call }) {
      return getResponse(yield call(idcDelete, payload));
    },

    *syncToIboss({ payload }, { call }) {
      return getResponse(yield call(syncToIboss, payload));
    },

    *selectFile({ payload }, { call }) {
      return getResponse(yield call(selectFile, payload));
    },

    *downloadTemplate({ payload }, { call }) {
      return getResponse(yield call(downloadTemplate, payload));
    },

    *queryImportResult({ payload }, { call }) {
      return getResponse(yield call(queryImportResult, payload));
    },

    // 详情查询
    *queryDetail({ payload }, { call, put }) {
      const res = getResponse(yield call(queryDetail, payload));
      if (res) {
        const { idcChargeDTO, idcChargeOperateHisList } = res;
        const {
          idcChargeBasic,
          idcChargeCostList,
          idcChargePriceList,
          idcChargeFileList,
        } = idcChargeDTO || {};
        yield put({
          type: 'updateState',
          payload: {
            basicInfo: idcChargeBasic || {},
            costInfo: (idcChargeCostList || [])[0],
            priceInfo: (idcChargePriceList || [])[0],
            idcChargeFileList: (idcChargeFileList || []).map(item => ({ ...item, _status: 'update' })),
            idcChargeOperateHisList: idcChargeOperateHisList,
            productType: (idcChargeCostList || [])[0]?.productType,
            expenseType: (idcChargeBasic || {}).expenseType,
          }
        })
      };
      return res;
    },

    // 详情保存
    *save({ payload }, { call }) {
      return getResponse(yield call(save, payload));
    },

    *submit({ payload }, { call }) {
      return getResponse(yield call(submit, payload));
    },

    *returnBack({ payload }, { call }) {
      return getResponse(yield call(returnBack, payload));
    },

    *filesDelete({ payload }, { call }) {
      return getResponse(yield call(filesDelete, payload));
    },

    *profileValue({ payload }, { call }) {
      return getResponse(yield call(profileValue, payload));
    },

    *profileValueSummary({ payload }, { call }) {
      return getResponse(yield call(profileValueSummary, payload));
    },
    
    *getEmailTemplate({ payload }, { call }) {
      return getResponse(yield call(getEmailTemplate, payload));
    },

    *sendEmail({ payload }, { call }) {
      return getResponse(yield call(sendEmail, payload));
    },

    *getEmailRecord({ payload }, { call, put }) {
      const res =  getResponse(yield call(getEmailRecord, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            idcChargeEmailList: res.content || [],
            emailPagination: createPagination(res) || {},
          }
        })
      }
    },

    *queryEmailDetail({ payload }, { call }) {
      return getResponse(yield call(queryEmailDetail, payload));
    },

    *customFileSummary({ payload }, { call }) {
      return getResponse(yield call(customFileSummary, payload));
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
