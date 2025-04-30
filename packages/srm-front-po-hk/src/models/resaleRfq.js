/*
 * @Descripttion:rfq model
 * @version: 0.0.1
 * @Author: xinyi.he02@hand-china.com
 * @Date: 2022-02-14
 */
import React from 'react';
import { createPagination } from 'utils/utils';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import CusNotification from '_cus_components/CusNotification';
import {
  queryRfqList,
  queryRfqHistoryList,
  queryRfqResponse,
  queryRfqDetail,
  updateRfqInfo,
  updateRfqIctsInfo,
  querySoRequiry,
  querySoRequirySummary,
  querySoLine,
  confirmSoLine,
  ictsConfirmSoLine,
  associate,
  orderTracking,
  finishWorkQueue,
  publish,
  publishSummary,
  ictsPublish,
  ictsPublishSummary,
  stop,
  submit,
  submitSummary,
  ictsSubmit,
  ictsSubmitSummary,
  reEnquiry,
  submitValidate,
  submitValidateSummary,
  ictsSubmitValidate,
  ictsSubmitValidateSummary,
  deleteEnquiryPriceByList,
  queryStandardLibrary,
  copyDetailsLine,
  ictsCopyDetailsLine,
  deleteEnquiryDetailsLines,
  queryEnquiryFiles,
  deleteEnquiryFiles,
  queryEnquiryDetailQtDbts,
  enquiryQtDbtAudits,
  saveEnquiryDetailQtDbts,
  deleteEnquiryDetailQtDbts,
  queryEnquiryConversations,
  sendEnquiryConversations,
  sendEnquiryConversationsIcts,
  enquiryAuditRecord,
  enquiryPriceExport,
  validateFailed,
  ictsEnquiryPriceExport,
  ictsValidateFailed,
  chinaDiaEnquiryPriceExport,
  chinaDiaValidateFailed,
  queryEnquiryDetailDtls,
  queryEnquiryDetailDtlsAudits,
  saveEnquiryDetailDtls,
  deleteEnquiryDetailDtls,
  queryEnquiryPriceDetail,
  saveEnquiryPrice,
  submitEnquiryPrice,
  submitEnquiryPriceSummary,
  reEnquiryPrice,
  submitValidateCommon,
  submitValidateCommonSummary,
  publishEnquiryPrice,
  publishEnquiryPriceSummary,
  stopEnquiryPrice,
  enquiryExport,
  enquiryAssign,
  enquiryFeedback,
  enquiryAssignAudits,
} from '../services/resaleRfqService';
import { permissions } from '@/services/commonService';

export default {
  namespace: 'resaleRfq',
  state: {
    rfqList: [], // 询价列表数据
    rfqPagination: {}, // 分页对象
    rfqHistoryList: [], // 历史记录询价列表数据
    rfqHistoryPagination: {}, // 历史记录分页对象
    priceCompanyList: [], // CMI签约主体
    yesNoFlag: [], // 是否标识

    headerData: {}, // 价格录入头信息
    enquiryPriceRounds: {},
    sourceType: null, // 来源类型
    enquiryPriceTplVOList: [], // 询价模板列表
    templateOptions: [], // 价格属性下拉框选项
    propertyColumns: [], // 属性模板动态列
    quotationColumns: [], // 费用动态列

    priceLibraryStatus: [], // 选用价格库行状态值集
    serviceTypeList: [], // 服务类型值集
    lastNodeList: [], // 审批流最后一个节点
    selectedRows: [], // 选用价格库选择的行
    pagination: {}, // 选用价格库分页对象
    dynamicData: [], // 价格库查询数据
    attachmentsDataSource: [], // 附件信息
    meetingDataSource: [], // 会议纪要
    conversationsDataSource: [], // 会话记录

    editFlag: undefined, // 编辑权限 Y-可编辑，N-不可编辑
  },

  effects: {
    // 询价汇总查询
    *queryRfqList({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(queryRfqList, payload));
      if (res) {
        yield put({
          type: 'commentUpdateState',
          payload: {
            rfqList: res.content,
            rfqPagination: createPagination(res),
          },
        });
      }
      return res;
    },

    // 询价历史记录汇总界面查询
    *queryRfqHistoryList({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(queryRfqHistoryList, payload));
      if (res) {
        yield put({
          type: 'commentUpdateState',
          payload: {
            rfqHistoryList: res.content,
            rfqHistoryPagination: createPagination(res),
          },
        });
      }
      return res;
    },

    // 查询线上报价情况
    *queryRfqResponse({ payload }, { call }) {
      const res = cusGetResponse(yield call(queryRfqResponse, payload));
      return res;
    },

    // 价格录入明细查询
    *queryRfqDetail({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(queryRfqDetail, payload));
      if (res) {
        const { enquiryPrice, enquiryPriceRounds, enquiryPriceTplVOList, sourceType, editFlag } =
          res;
        // 设置编辑表格标识(必须)
        // let tplIndex = 0;
        for (const item of enquiryPriceTplVOList) {
          item._status = 'update';
          // item.lineNum = ++tplIndex;
          // let index = 0;
          for (const ctg of item.enquiryDetailVOList) {
            ctg._status = 'update';
            // ctg.lineNum = ++index;
            for (const ct of ctg.enquiryDetailPtList) {
              ct._status = 'update';
            }
          }
        }
        yield put({
          type: 'commentUpdateState',
          payload: {
            headerData: enquiryPrice,
            enquiryPriceRounds,
            enquiryPriceTplVOList,
            sourceType,
            editPermission: editFlag === 'Y',
          },
        });
        return res;
      }
    },

    // ICTS价格录入明细查询
    *queryRfqDetailIcts({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(queryRfqDetail, payload));
      if (res) {
        const { enquiryPrice, enquiryPriceRounds, enquiryPriceTplVOList, sourceType, editFlag } =
          res;
        // 设置编辑表格标识(必须)
        // let tplIndex = 0;
        for (const item of enquiryPriceTplVOList) {
          item._status = 'update';
          // item.lineNum = ++tplIndex;
          // let index = 0;
          for (const ctg of item.enquiryDetailVOList) {
            ctg._status = 'update';
            // ctg.lineNum = ++index;
            for (const ct of ctg.enquiryDetailPtList) {
              ct._status = 'update';
            }
          }
        }
        yield put({
          type: 'commentUpdateState',
          payload: {
            headerData: enquiryPrice,
            enquiryPriceRounds,
            enquiryPriceTplVOList,
            sourceType,
            editPermission: editFlag !== 'N',
          },
        });
        return res;
      }
    },

    // 价格录入信息更新
    *updateRfqInfo({ payload }, { call }) {
      const res = cusGetResponse(yield call(updateRfqInfo, payload));
      return res;
    },

    // ICTS价格录入信息更新
    *updateRfqIctsInfo({ payload }, { call }) {
      const res = cusGetResponse(yield call(updateRfqIctsInfo, payload));
      return res;
    },

    *permissions({ payload }, { call, put }) {
      const response = cusGetResponse(yield call(permissions, payload));
      if (response) {
        const { editFlag } = response;
        yield put({
          type: 'commentUpdateState',
          payload: {
            editFlag,
          },
        });
      }
    },

    *querySoRequiry({ payload }, { call }) {
      return cusGetResponse(yield call(querySoRequiry, payload));
    },

    *querySoRequirySummary({ payload }, { call }) {
      return cusGetResponse(yield call(querySoRequirySummary, payload));
    },

    *querySoLine({ payload }, { call }) {
      return cusGetResponse(yield call(querySoLine, payload));
    },

    *confirmSoLine({ payload }, { call }) {
      return cusGetResponse(yield call(confirmSoLine, payload));
    },

    *ictsConfirmSoLine({ payload }, { call }) {
      return cusGetResponse(yield call(ictsConfirmSoLine, payload));
    },

    *associate({ payload }, { call }) {
      return cusGetResponse(yield call(associate, payload));
    },

    *orderTracking({ payload }, { call }) {
      return cusGetResponse(yield call(orderTracking, payload));
    },

    *finishWorkQueue({ payload }, { call }) {
      return cusGetResponse(yield call(finishWorkQueue, payload));
    },

    *publishSummary({ payload }, { call }) {
      return cusGetResponse(yield call(publishSummary, payload));
    },

    *publish({ payload }, { call }) {
      return cusGetResponse(yield call(publish, payload));
    },

    *ictsPublish({ payload }, { call }) {
      return cusGetResponse(yield call(ictsPublish, payload));
    },

    *ictsPublishSummary({ payload }, { call }) {
      return cusGetResponse(yield call(ictsPublishSummary, payload));
    },

    *stop({ payload }, { call }) {
      return cusGetResponse(yield call(stop, payload));
    },

    // 汇总
    *submitSummary({ payload }, { call }) {
      return cusGetResponse(yield call(submitSummary, payload));
    },

    *submit({ payload }, { call }) {
      return cusGetResponse(yield call(submit, payload));
    },

    // 汇总
    *ictsSubmitSummary({ payload }, { call }) {
      return cusGetResponse(yield call(ictsSubmitSummary, payload));
    },

    *ictsSubmit({ payload }, { call }) {
      return cusGetResponse(yield call(ictsSubmit, payload));
    },

    *reEnquiry({ payload }, { call }) {
      return cusGetResponse(yield call(reEnquiry, payload));
    },

    // 汇总
    *submitValidateSummary({ payload }, { call }) {
      return cusGetResponse(yield call(submitValidateSummary, payload), (res) => {
        const description = (
          <div>
            {res.message.split(';').map((item) => (
              <p style={{ marginBottom: 0 }}>{item}</p>
            ))}
          </div>
        );
        const msg = {
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description,
        };
        switch (res.type) {
          case 'info':
            CusNotification.info(msg);
            break;
          case 'warn':
            CusNotification.warning(msg);
            break;
          case 'error':
          default:
            CusNotification.error(msg);
            break;
        }
      });
    },

    *submitValidate({ payload }, { call }) {
      return cusGetResponse(yield call(submitValidate, payload), (res) => {
        const description = (
          <div>
            {res.message.split(';').map((item) => (
              <p style={{ marginBottom: 0 }}>{item}</p>
            ))}
          </div>
        );
        const msg = {
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description,
        };
        switch (res.type) {
          case 'info':
            CusNotification.info(msg);
            break;
          case 'warn':
            CusNotification.warning(msg);
            break;
          case 'error':
          default:
            CusNotification.error(msg);
            break;
        }
      });
    },

    // 汇总
    *ictsSubmitValidateSummary({ payload }, { call }) {
      return cusGetResponse(yield call(ictsSubmitValidateSummary, payload), (res) => {
        const description = (
          <div>
            {res.message.split(';').map((item) => (
              <p style={{ marginBottom: 0 }}>{item}</p>
            ))}
          </div>
        );
        const msg = {
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description,
        };
        switch (res.type) {
          case 'info':
            CusNotification.info(msg);
            break;
          case 'warn':
            CusNotification.warning(msg);
            break;
          case 'error':
          default:
            CusNotification.error(msg);
            break;
        }
      });
    },

    *ictsSubmitValidate({ payload }, { call }) {
      return cusGetResponse(yield call(ictsSubmitValidate, payload), (res) => {
        const description = (
          <div>
            {res.message.split(';').map((item) => (
              <p style={{ marginBottom: 0 }}>{item}</p>
            ))}
          </div>
        );
        const msg = {
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description,
        };
        switch (res.type) {
          case 'info':
            CusNotification.info(msg);
            break;
          case 'warn':
            CusNotification.warning(msg);
            break;
          case 'error':
          default:
            CusNotification.error(msg);
            break;
        }
      });
    },

    *deleteEnquiryPriceByList({ payload }, { call }) {
      return cusGetResponse(yield call(deleteEnquiryPriceByList, payload));
    },

    *queryStandardLibrary({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(queryStandardLibrary, payload));
      if (res) {
        yield put({
          type: 'commentUpdateState',
          payload: {
            dynamicData: res.content,
            pagination: createPagination(res),
          },
        });
      }
    },

    *copyDetailsLine({ payload }, { call }) {
      return cusGetResponse(yield call(copyDetailsLine, payload));
    },

    *ictsCopyDetailsLine({ payload }, { call }) {
      return cusGetResponse(yield call(ictsCopyDetailsLine, payload));
    },

    *deleteEnquiryDetailsLines({ payload }, { call }) {
      return cusGetResponse(yield call(deleteEnquiryDetailsLines, payload));
    },

    *queryEnquiryFiles({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(queryEnquiryFiles, payload));
      if (res) {
        yield put({
          type: 'commentUpdateState',
          payload: {
            attachmentsDataSource: res.content.map((item) => ({ ...item, _status: 'update' })),
          },
        });
      }
    },

    *deleteEnquiryFiles({ payload }, { call }) {
      return cusGetResponse(yield call(deleteEnquiryFiles, payload));
    },

    *queryEnquiryDetailQtDbts({ payload }, { call }) {
      return cusGetResponse(yield call(queryEnquiryDetailQtDbts, payload));
    },

    *saveEnquiryDetailQtDbts({ payload }, { call }) {
      return cusGetResponse(yield call(saveEnquiryDetailQtDbts, payload));
    },

    *deleteEnquiryDetailQtDbts({ payload }, { call }) {
      return cusGetResponse(yield call(deleteEnquiryDetailQtDbts, payload));
    },

    *queryEnquiryConversations({ payload }, { call }) {
      return cusGetResponse(yield call(queryEnquiryConversations, payload));
    },

    *sendEnquiryConversations({ payload }, { call }) {
      return cusGetResponse(yield call(sendEnquiryConversations, payload));
    },

    *sendEnquiryConversationsIcts({ payload }, { call }) {
      return cusGetResponse(yield call(sendEnquiryConversationsIcts, payload));
    },

    *enquiryAuditRecord({ payload }, { call }) {
      return cusGetResponse(yield call(enquiryAuditRecord, payload));
    },

    *enquiryQtDbtAudits({ payload }, { call }) {
      return cusGetResponse(yield call(enquiryQtDbtAudits, payload));
    },

    *enquiryPriceExport({ payload }, { call }) {
      return cusGetResponse(yield call(enquiryPriceExport, payload));
    },

    *validateFailed({ payload }, { call }) {
      return cusGetResponse(yield call(validateFailed, payload));
    },

    *ictsEnquiryPriceExport({ payload }, { call }) {
      return cusGetResponse(yield call(ictsEnquiryPriceExport, payload));
    },

    *ictsValidateFailed({ payload }, { call }) {
      return cusGetResponse(yield call(ictsValidateFailed, payload));
    },

    *chinaDiaEnquiryPriceExport({ payload }, { call }) {
      return cusGetResponse(yield call(chinaDiaEnquiryPriceExport, payload));
    },

    *chinaDiaValidateFailed({ payload }, { call }) {
      return cusGetResponse(yield call(chinaDiaValidateFailed, payload));
    },

    *queryEnquiryDetailDtls({ payload }, { call }) {
      return cusGetResponse(yield call(queryEnquiryDetailDtls, payload));
    },

    *queryEnquiryDetailDtlsAudits({ payload }, { call }) {
      return cusGetResponse(yield call(queryEnquiryDetailDtlsAudits, payload));
    },

    *saveEnquiryDetailDtls({ payload }, { call }) {
      return cusGetResponse(yield call(saveEnquiryDetailDtls, payload));
    },

    *deleteEnquiryDetailDtls({ payload }, { call }) {
      return cusGetResponse(yield call(deleteEnquiryDetailDtls, payload));
    },

    // 价格录入明细查询 CHINA_DIA
    *queryEnquiryPriceDetail({ payload }, { call, put }) {
      const res = cusGetResponse(yield call(queryEnquiryPriceDetail, payload));
      if (res) {
        const { enquiryPrice, enquiryPriceRounds, enquiryPriceTplVOList, sourceType, editFlag } =
          res;
        // 设置编辑表格标识(必须)
        // let tplIndex = 0;
        for (const item of enquiryPriceTplVOList) {
          item._status = 'update';
          // item.lineNum = ++tplIndex;
          // let index = 0;
          for (const ctg of item.enquiryDetailVOList) {
            ctg._status = 'update';
            // ctg.lineNum = ++index;
            for (const ct of ctg.enquiryDetailPtList) {
              ct._status = 'update';
            }
          }
        }
        yield put({
          type: 'commentUpdateState',
          payload: {
            headerData: enquiryPrice,
            enquiryPriceRounds,
            enquiryPriceTplVOList,
            sourceType,
            editPermission: editFlag === 'Y',
          },
        });
        return res;
      }
    },

    // 价格录入信息更新
    *saveEnquiryPrice({ payload }, { call }) {
      const res = cusGetResponse(yield call(saveEnquiryPrice, payload));
      return res;
    },

    *publishEnquiryPrice({ payload }, { call }) {
      return cusGetResponse(yield call(publishEnquiryPrice, payload));
    },

    *publishEnquiryPriceSummary({ payload }, { call }) {
      return cusGetResponse(yield call(publishEnquiryPriceSummary, payload));
    },

    *stopEnquiryPrice({ payload }, { call }) {
      return cusGetResponse(yield call(stopEnquiryPrice, payload));
    },

    *submitEnquiryPriceSummary({ payload }, { call }) {
      return cusGetResponse(yield call(submitEnquiryPriceSummary, payload));
    },

    *submitEnquiryPrice({ payload }, { call }) {
      return cusGetResponse(yield call(submitEnquiryPrice, payload));
    },

    *reEnquiryPrice({ payload }, { call }) {
      return cusGetResponse(yield call(reEnquiryPrice, payload));
    },

    *submitValidateCommonSummary({ payload }, { call }) {
      return cusGetResponse(yield call(submitValidateCommonSummary, payload), (res) => {
        const description = (
          <div>
            {res.message.split(';').map((item) => (
              <p style={{ marginBottom: 0 }}>{item}</p>
            ))}
          </div>
        );
        const msg = {
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description,
        };
        switch (res.type) {
          case 'info':
            CusNotification.info(msg);
            break;
          case 'warn':
            CusNotification.warning(msg);
            break;
          case 'error':
          default:
            CusNotification.error(msg);
            break;
        }
      });
    },

    *submitValidateCommon({ payload }, { call }) {
      return cusGetResponse(yield call(submitValidateCommon, payload), (res) => {
        const description = (
          <div>
            {res.message.split(';').map((item) => (
              <p style={{ marginBottom: 0 }}>{item}</p>
            ))}
          </div>
        );
        const msg = {
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description,
        };
        switch (res.type) {
          case 'info':
            CusNotification.info(msg);
            break;
          case 'warn':
            CusNotification.warning(msg);
            break;
          case 'error':
          default:
            CusNotification.error(msg);
            break;
        }
      });
    },

    *enquiryExport({ payload }, { call }) {
      return cusGetResponse(yield call(enquiryExport, payload));
    },

    *enquiryAssign({ payload }, { call }) {
      return cusGetResponse(yield call(enquiryAssign, payload));
    },

    *enquiryFeedback({ payload }, { call }) {
      return cusGetResponse(yield call(enquiryFeedback, payload));
    },

    *enquiryAssignAudits({ payload }, { call }) {
      return cusGetResponse(yield call(enquiryAssignAudits, payload));
    },
  },

  reducers: {
    commentUpdateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
