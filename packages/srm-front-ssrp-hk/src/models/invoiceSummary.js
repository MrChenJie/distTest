import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { createPagination } from 'utils/utils';
import {
  queryBillList,
  deleteBillList,
  queryBillFileList,
  queryInvoiceDetailData,
  deleteDocks,
  deleteClaims,
  deleteFileList,
  saveInvoiceDetailData,
  submitInvoiceDetailData,
  queryClaimInsert,
  returnSupplier,
  historyVersion,
  transfer,
  cancelReturnSupplier,
  returnClaim,
  fetchFileNumber,
  queryDeafultPeer,
  returnDraft,
  getReturnReason,
  billAddRequest,
  checkBeforeSave,
  customFileSummary,
} from '@/services/invoiceSummaryService';
import uuid from 'uuid/v4';

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
  namespace: 'invoiceSummary',
  state: {
    billListDatasorce: [],
    billListPagination: [],

    billInvoice: {}, // 详情页头数据
    billInvoiceClaimList: [], // 发票CMI认领明细
    billInvoiceDockingList: [], // 发票CMI对接人明细
    billInvoiceFileList: [], // 附件上传
    costRequestPaymentDTOList: [], // 付款明细
    billInvoiceClaimHeaderData: {},
    historyVersion: [], // 历史记录弹框列表
    turnToDoPeopleList: [], // 转办人员列表
    turnToDoPeoplePagination: {},
    editFlag: true,
    revokeFlag: true,
    revokeReturnFlag: true,
    returnDraftFlag: true,
    superFlag: false,
    historyVersionList: [], // 历史记录版本列表
    historyVersionPagination: {},
    deafultPeerList: [], // 默认对接人明细
    deafultPeerPagination: {},
  },
  effects: {
    *queryBillList({ payload }, { call, put }) {
      const res = yield call(queryBillList, payload);
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            billListDatasorce: dealDataState(res.content),
            billListPagination: createPagination(res),
          },
        });
      }
      return cusGetResponse(res);
    },
    *deleteBillList({ payload }, { call }) {
      const res = yield call(deleteBillList, payload);
      return cusGetResponse(res);
    },
    *queryBillFileList({ payload }, { call, put }) {
      const res = yield call(queryBillFileList, payload);
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            billInvoiceFileList: dealDataState(res),
          },
        });
      }
      return cusGetResponse(res);
    },
    *queryInvoiceDetailData({ payload }, { call, put }) {
      const res = yield call(queryInvoiceDetailData, payload);
      if (cusGetResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            billInvoice: res.billInvoice || {},
            billInvoiceClaimList: dealDataState(res.billInvoiceClaimList) || [],
            billInvoiceDockingList: dealDataState(res.billInvoiceDockingList) || [],
            billInvoiceFileList: dealDataState(res.billInvoiceFileList) || [],
            costRequestPaymentDTOList: dealDataState(res.costRequestPaymentDTOList) || [],
            billInvoiceClaimHeaderData: {
              claimedAmount: res.claimedAmount,
              unclaimedAmount: res.unclaimedAmount,
            },
            editFlag: res.editFlag,
            revokeFlag: res.revokeFlag,
            revokeReturnFlag: res.billInvoice.revokeReturnFlag === 'Y',
            returnDraftFlag: res.returnDraftFlag,
            superFlag: res.superFlag,
          },
        });
      }
      return cusGetResponse(res);
    },
    *queryClaimInsert({ payload }, { call, put }) {
      const res = yield call(queryClaimInsert, payload);
      return cusGetResponse(res);
    },
    *saveInvoiceDetailData({ payload }, { call, put }) {
      const res = yield call(saveInvoiceDetailData, payload);
      return cusGetResponse(res);
    },
    *submitInvoiceDetailData({ payload }, { call, put }) {
      const res = yield call(submitInvoiceDetailData, payload);
      return cusGetResponse(res);
    },
    *deleteDocks({ payload }, { call, put }) {
      const res = yield call(deleteDocks, payload);
      return cusGetResponse(res);
    },
    *deleteClaims({ payload }, { call, put }) {
      const res = yield call(deleteClaims, payload);
      return cusGetResponse(res);
    },
    *deleteFileList({ payload }, { call, put }) {
      const res = yield call(deleteFileList, payload);
      return cusGetResponse(res);
    },
    *returnSupplier({ payload }, { call, put }) {
      const res = yield call(returnSupplier, payload);
      return cusGetResponse(res);
    },
    *cancelReturnSupplier({ payload }, { call, put }) {
      const res = yield call(cancelReturnSupplier, payload);
      return cusGetResponse(res);
    },
    *historyVersion({ payload }, { call, put }) {
      const res = yield call(historyVersion, payload);
      if (cusGetResponse(res)) {
        const arr = res.content.map((item, index) => {
          let fileAuditList = [];
          item.fileAuditList.map((item, index) => {
            fileAuditList = fileAuditList.concat(item.fieldAuditDTOList);
          });
          let claimAuditList = [];
          item.claimAuditList.map((item, index) => {
            claimAuditList = claimAuditList.concat(item.fieldAuditDTOList);
          });
          let dockingAuditList = [];
          item.dockingAuditList.map((item, index) => {
            dockingAuditList = dockingAuditList.concat(item.fieldAuditDTOList);
          });
          let invoiceAuditList = item.invoiceAudit.fieldAuditDTOList?.map((item, index) => {
            return {
              ...item,
            };
          });
          fileAuditList = fileAuditList || [];
          invoiceAuditList = invoiceAuditList || [];
          claimAuditList = claimAuditList || [];
          dockingAuditList = dockingAuditList || [];
          let allList = [
            ...fileAuditList,
            ...invoiceAuditList,
            ...claimAuditList,
            ...dockingAuditList,
          ];
          allList = allList.map((item, index) => {
            return {
              ...item,
              lineNum: index + 1,
            };
          });
          const list = [allList];
          return {
            list,
            modificationTime: item.modificationTime,
            modifier: item.modifier,
            auditType: item.auditType,
            auditTypeMeaning: item.auditTypeMeaning,
          };
        });
        yield put({
          type: 'updateState',
          payload: {
            historyVersionList: arr,
            historyVersionPagination: res,
          },
        });
      }
      return cusGetResponse(res);
    },
    *transfer({ payload }, { call, put }) {
      const res = yield call(transfer, payload);
      return cusGetResponse(res);
    },
    *returnClaim({ payload }, { call, put }) {
      const res = yield call(returnClaim, payload);
      return cusGetResponse(res);
    },
    *fetchFileNumber({ payload }, { call, put }) {
      const res = yield call(fetchFileNumber, payload);
      return cusGetResponse(res);
    },
    *queryDeafultPeer({ payload }, { call, put }) {
      const res = yield call(queryDeafultPeer, payload);
      if (cusGetResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            deafultPeerList: res.content,
            deafultPeerPagination: createPagination(res),
          },
        });
      }
      return cusGetResponse(res);
    },
    *returnDraft({ payload }, { call, put }) {
      const res = yield call(returnDraft, payload);
      return cusGetResponse(res);
    },
    *getReturnReason({ payload }, { call, put }) {
      const res = yield call(getReturnReason, payload);
      return cusGetResponse(res);
    },

    *billAddRequest({ payload }, { call }) {
      const res = yield call(billAddRequest, payload);
      return cusGetResponse(res);
    },

    *checkBeforeSave({ payload }, { call }) {
      const res = yield call(checkBeforeSave, payload);
      return cusGetResponse(res);
    },

    *customFileSummary({ payload }, { call }) {
      const res = yield call(customFileSummary, payload);
      return cusGetResponse(res);
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
