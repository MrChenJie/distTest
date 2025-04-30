import { createPagination } from 'utils/utils';
import { getResponse } from '_cus_utils/utils';
import {
  queryList,
  deleteList,
  getEmployeeName,
  getCompanyName,
  batchRemoveInvoices,
  getDetailInfo,
  getBillList,
  deleteBillList,
  getWriteOff,
  getPaymentAdvicePer,
  getBillDetail,
  saveAll,
  queryBillAmount,
  getLinesAmountSum,
  queryBankInfo,
  deleteBankInfo,
  getAttachFiles,
  deleteOtherAtt,
  getSupplyAttachFiles,
  saveSupplyAttachFiles,
  deleteSupplyAttachFiles,
  saveWriteOff,
  deleteBillLine,
  exportPdf,
  fileBatchDownload,
  pureCheck,
  checkRepeatInvoice,
  checkAllowReturnBank,
  approvalDetail,
  mipSubmit,
} from '@/services/costRequestService';
import uuidv4 from 'uuid/v4';

export default {
  namespace: 'costRequest',

  state: {
    dataSource: [],
    pagination: [],
    supAttViewButtonFlag: false, // 补充附件按钮权限
  },

  effects: {
    *queryList({ payload }, { call, put }) {
      const res = getResponse(yield call(queryList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: res.content.map((item) => ({ rowKey: uuidv4(), ...item })),
            pagination: createPagination(res),
          },
        });
      }
      return res;
    },
    *deleteList({ payload }, { call }) {
      return getResponse(yield call(deleteList, payload));
    },

    *getEmployeeName({ payload }, { call }) {
      return getResponse(yield call(getEmployeeName, payload));
    },
    *getCompanyName({ payload }, { call }) {
      return getResponse(yield call(getCompanyName, payload));
    },

    *batchRemoveInvoices({ payload }, { call }) {
      return getResponse(yield call(batchRemoveInvoices, payload));
    },
    *getDetailInfo({ payload }, { call }) {
      return getResponse(yield call(getDetailInfo, payload));
    },
    *getBillList({ payload }, { call }) {
      return getResponse(yield call(getBillList, payload));
    },
    *deleteBillList({ payload }, { call }) {
      return getResponse(yield call(deleteBillList, payload));
    },
    *getBillDetail({ payload }, { call }) {
      return getResponse(yield call(getBillDetail, payload));
    },
    *deleteBillLine({ payload }, { call }) {
      return getResponse(yield call(deleteBillLine, payload));
    },
    *getWriteOff({ payload }, { call }) {
      return getResponse(yield call(getWriteOff, payload));
    },
    *getPaymentAdvicePer({ payload }, { call, put }) {
      const res = getResponse(yield call(getPaymentAdvicePer, payload));
      if (res) {
        const { viewButtonFlag } = res;
        yield put({
          type: 'updateState',
          payload: {
            supAttViewButtonFlag: viewButtonFlag === 'Y',
          },
        });
      }
      return res;
    },

    *saveAll({ payload }, { call }) {
      return getResponse(yield call(saveAll, payload));
    },
    *queryBillAmount({ payload }, { call }) {
      return getResponse(yield call(queryBillAmount, payload));
    },

    *getLinesAmountSum({ payload }, { call }) {
      return getResponse(yield call(getLinesAmountSum, payload));
    },
    *queryBankInfo({ payload }, { call }) {
      return getResponse(yield call(queryBankInfo, payload));
    },
    *deleteBankInfo({ payload }, { call }) {
      return getResponse(yield call(deleteBankInfo, payload));
    },
    *getAttachFiles({ payload }, { call }) {
      return getResponse(yield call(getAttachFiles, payload));
    },
    *deleteOtherAtt({ payload }, { call }) {
      return getResponse(yield call(deleteOtherAtt, payload));
    },

    *saveWriteOff({ payload }, { call }) {
      return getResponse(yield call(saveWriteOff, payload));
    },
    *pureCheck({ payload }, { call }) {
      return yield call(pureCheck, payload);
    },
    *checkRepeatInvoice({ payload }, { call }) {
      return getResponse(yield call(checkRepeatInvoice, payload));
    },
    *checkAllowReturnBank({ payload }, { call }) {
      return getResponse(yield call(checkAllowReturnBank, payload));
    },
    *approvalDetail({ payload }, { call }) {
      return yield call(approvalDetail, payload);
    },
    *mipSubmit({ payload }, { call }) {
      return yield call(mipSubmit, payload);
    },

    //---------------------------------- 补充附件 start  ----------------------------------
    *getSupplyAttachFiles({ payload }, { call }) {
      return getResponse(yield call(getSupplyAttachFiles, payload));
    },
    *saveSupplyAttachFiles({ payload }, { call }) {
      return getResponse(yield call(saveSupplyAttachFiles, payload));
    },
    *deleteSupplyAttachFiles({ payload }, { call }) {
      return getResponse(yield call(deleteSupplyAttachFiles, payload));
    },
    //---------------------------------- end  ----------------------------------

    *exportPdf({ payload }, { call }) {
      return getResponse(yield call(exportPdf, payload));
    },
    *fileBatchDownload({ payload }, { call }) {
      return getResponse(yield call(fileBatchDownload, payload));
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
