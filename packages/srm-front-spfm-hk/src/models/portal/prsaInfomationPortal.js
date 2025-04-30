/*
 * prsaInfomationPortal - 采购复核供应商准入信息（门户）
 * @date: 2023-09-20
 * @author: FHS <huasheng.fang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import { getResponse } from '_cus_utils/utils';
import {
  fetchList,
  save,
  deleteLines,
  generateAccount,
  supplierExport,
  fetchPermissionTree,
  batchAssignPermissionSets,
  batchUnAssignPermissionSets,
  fetchUserData,
  updateUserData,
  contactAdd,
  queryNoticeType,
  addAttachment,
  queryInfo,
  queryBasicInfo,
  queryBankInfo,
  saveInfo,
  submitInfo,
  submitBankInfo,
  backInfo,
  backInfoQuery,
  backSendEmail,
  finishedDone,
  accessSaveInfo,
  accessSaveBasic,
  checkSupplierName,
  checkRegistrationNumber,
  returnPortal,
  returnPortalChange,
  getAddressBankInfoList,
  getBankInfoList,
  deleteAddressBankInfoLine,
  deleteBankInfoLine,
  saveBankInfoList,
  getEditAddressBankInfoList,
  getEditBankInfoList,
  bankInfoExport,
  bankInfoEditExport,
  getLeaveCode,
} from '../../services/portal/prsaInfomationService';
import { getResponse as cusGetResponse } from '_cus_utils/utils';
import { isEmpty, cloneDeep } from 'lodash';

export default {
  namespace: 'prsaInfomationPortal',
  state: {
    basicInfo: {},
    companyInfo: {},
    contactList: [],
    clientList: [],
    bankList: [],
    attachmentList: [],
    fileCascader: [], // 附件类型值集
    lineInfo: {},
  },

  effects: {
    // 查询附件类型值集
    *initValueList(params, { put, call }) {
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

    *fetchList({ payload }, { call }) {
      return getResponse(yield call(fetchList, payload));
    },

    *queryInfo({ payload }, { call }) {
      return getResponse(yield call(queryInfo, payload));
    },
    *queryBasicInfo({ payload }, { call }) {
      return getResponse(yield call(queryBasicInfo, payload));
    },
    *queryBankInfo({ payload }, { call }) {
      return getResponse(yield call(queryBankInfo, payload));
    },
    *saveInfo({ payload }, { call }) {
      return getResponse(yield call(saveInfo, payload));
    },
    *accessSaveInfo({ payload }, { call }) {
      return getResponse(yield call(accessSaveInfo, payload));
    },
    *accessSaveBasic({ payload }, { call }) {
      return getResponse(yield call(accessSaveBasic, payload));
    },
    *submitInfo({ payload }, { call }) {
      return getResponse(yield call(submitInfo, payload));
    },
    *submitBankInfo({ payload }, { call }) {
      return getResponse(yield call(submitBankInfo, payload));
    },
    *backInfo({ payload }, { call }) {
      return getResponse(yield call(backInfo, payload));
    },
    *backInfoQuery({ payload }, { call }) {
      return getResponse(yield call(backInfoQuery, payload));
    },
    *backSendEmail({ payload }, { call }) {
      return getResponse(yield call(backSendEmail, payload));
    },
    *finishedDone({ payload }, { call }) {
      return getResponse(yield call(finishedDone, payload));
    },
    *save({ payload }, { call }) {
      return getResponse(yield call(save, payload));
    },

    *deleteLines({ payload }, { call }) {
      return getResponse(yield call(deleteLines, payload));
    },

    *generateAccount({ payload }, { call }) {
      return getResponse(yield call(generateAccount, payload));
    },
    *supplierExport({ payload }, { call }) {
      return getResponse(yield call(supplierExport, payload));
    },
    *checkSupplierName({ payload }, { call }) {
      return getResponse(yield call(checkSupplierName, payload));
    },
    *checkRegistrationNumber({ payload }, { call }) {
      return getResponse(yield call(checkRegistrationNumber, payload));
    },
    *fetchPermissionTree({ roleId, tenantId }, { call }) {
      const res = yield call(fetchPermissionTree, roleId, tenantId);
      const response = getResponse(res);
      const defaultExpandedRowKeys = [];

      /**
       * 组装新dataSource
       * @function assignListData
       * @param {!Array} [collections = []] - 树节点集合
       * @returns {Array} - 新的dataSourcee
       *
       */
      function assignListData(collections = []) {
        return collections.map((n) => {
          const m = n;
          m.key = n.id;
          if (isEmpty(m.subMenus)) {
            m.subMenus = null;
          } else {
            m.subMenus = assignListData(m.subMenus);
            defaultExpandedRowKeys.push(m.id);
            const checkedCount = m.subMenus.filter((o) => o.checkedFlag === 'Y').length;
            const indeterminateCount = m.subMenus.filter((o) => o.checkedFlag === 'P').length;
            m.checkedFlag =
              checkedCount === m.subMenus.length
                ? 'Y'
                : checkedCount === 0
                  ? indeterminateCount === 0
                    ? null
                    : 'P'
                  : 'P';
          }
          return m;
        });
      }
      function filterPsData(collections = []) {
        return collections.map((n) => {
          const m = n;
          m.key = n.id;
          if (isEmpty(m.subMenus)) {
            m.subMenus = null;
          } else if (n.subMenus.length > 0 && n?.subMenus[0]?.type === 'ps') {
            m.subMenus = null;
          } else {
            m.subMenus = filterPsData(m.subMenus);
          }
          return m;
        });
      }
      const originDataSource = assignListData(response || []);
      const dataSource = cloneDeep(originDataSource);

      return {
        originDataSource,
        dataSource: filterPsData(dataSource || []),
        defaultExpandedRowKeys,
      };
    },
    *batchAssignPermissionSets({ payload }, { call }) {
      return getResponse(yield call(batchAssignPermissionSets, payload));
    },

    *batchUnAssignPermissionSets({ payload }, { call }) {
      return getResponse(yield call(batchUnAssignPermissionSets, payload));
    },
    *fetchUserData({ payload }, { call }) {
      return getResponse(yield call(fetchUserData, payload));
    },
    *updateUserData({ payload }, { call }) {
      return getResponse(yield call(updateUserData, payload));
    },
    *contactAdd({ payload }, { call }) {
      return getResponse(yield call(contactAdd, payload));
    },

    *addAttachment({ payload }, { call }) {
      const response = yield call(addAttachment, payload);
      return getResponse(response);
    },

    *returnPortal({ payload }, { call }) {
      const response = yield call(returnPortal, payload);
      return getResponse(response);
    },

    *returnPortalChange({ payload }, { call }) {
      const response = yield call(returnPortalChange, payload);
      return getResponse(response);
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
    // 查询编码规则
    *getLeaveCode({ payload }, { call, put }) {
      const res = yield call(getLeaveCode, payload);
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
