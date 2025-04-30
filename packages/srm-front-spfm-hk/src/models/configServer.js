/*
 * configServer - 配置中心
 * @date: 2018/09/18 19:07:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import lodash, { isNumber, isNaN } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, createPagination, getCurrentOrganizationId } from 'utils/utils';

import {
  saveOuterPriceShieldHeader,
  searchHeader,
  searchLines,
  deleteLines,
  fetchSettings,
  fetchRcvTrxTypeList,
  saveSettings,
  resetSettings,
  searchInnerList,
  searchInnerShieldOrg,
  saveInnerShieldInner,
  deleteInnerLines,
  fetchOrderConfigList,
  saveOrderConfigList,
  queryDocMergeRulesList,
  saveDocMergeRule,
  fetchAsnMergeRules,
  deleteAsnMergeRules,
  saveAsnMergeRules,
  saveRcvTrxType,
  fetchoOrderConfirmRuleList,
  saveOrderConfirmRule,
  fetchPurchaseRequisitionApprovalList,
  savePurchaseRequisitionApproval,
  deletePurchaseRequisitionApproval,
  fetchPurchaseRequisitionSendBackPurchaseRequest, // 采购申请回传
  savefetchPurchaseRequisitionSendBackPurchaseRequest,
  deletefetchPurchaseRequisitionSendBackPurchaseRequest,
  fetchOrderMergeRuleList,
  saveOrderMergeRule,
  fetchSplitOrderRules,
  saveSplitOrderRules,
  fetchSupplierAddMonitor,
  saveSupplierAddMonitor,
  fetchRiskScan,
  saveRiskScan,
  fetchNotPermitList,
  fetchPermitList,
  handleAssign,
  handleCancelAssign,
  fetchOpenResult,
  inviteCompany,
  directInvoiceRules,
  saveDirectInvoiceRules,
  deleteDirectInvoiceRules,
  directInvoiceRulesDetails,
  saveDirectInvoiceRulesDetails,
  directInvoiceInfo, // 查询直连开票基础信息
  saveDirectInvoiceInfo, // 保存直连开票基础信息
  deleteDirectInvoiceInfo, // 删除直连开票基础信息
  fetchImportErpDefault, // 查询导入Erp基础信息
  saveImportErpDefault, // 保存导入erp默认数据
  fetchNewImport,
  queryAgreementDataSource,
  saveAgreementDataSource,
  queryAgreementMergeRule,
  saveAgreementMergeRule,
  queryOrderPriceModifiable,
  saveOrderPriceModifiable,
  queryOrderEvaluate,
  saveOrderEvaluate,
  fetchShieldNeedsInfList, // 查询需求信息屏蔽角色列表
  deleteShieldNeedsInf, // 删除供应商角色
  saveShieldNeedsInf, // 保存供应商角色
  fetchAutoDeductNote,
  saveAutoDeductNote,
  deleteAutoDeductNote,
  fetchPointAndMethod,
  savePointAndMethod,
  deletePointAndMethod,
  queryMinimumOrderAmountList, // 查询最小下单金额定义列表
  addMinimumOrderAmount, // 新增最小下单金额定义列表
  delMinimumOrderAmount, // 删除最小下单金额定义列表
  fetchMergeSourceSet,
  saveMergeSourceSet,
  fetchPurchaserUpdateFields,
  fetchPurchaserUpdateSave,
  fetchReconciliationSource, // 查询对账数据来源
  saveReconciliationSource, // 保存对账数据来源
  deleteReconciliationSource, // 删除对账数据来源
  queryModalList,
  updateSave,
  deletes,
} from '@/services/configServerService';
import { queryMapIdpValue, queryUnifyIdpValue } from 'hzero-front/lib/services/api';

const tenantId = getCurrentOrganizationId();

function getAllSelectedChilds(list) {
  let arr = [];
  list.forEach(record => {
    const findChilds = r => {
      if (r.checkedFlag) {
        arr = lodash.unionWith(arr, [r]);
      }
      if (r.children) {
        r.children.forEach(child => {
          findChilds(child);
        });
      }
    };
    findChilds(record);
  });
  return arr;
}

/**
 * @param {object} list --配置中心-对账单数据
 */
function setUpdateToData(list) {
  // 判断是否是编辑状态
  const lines = [];
  list.content.forEach(item => {
    const items = { ...item };
    if (!item._status) {
      items._status = 'update';
    }
    lines.push(items);
  });
  return lines;
}

function dealDataExist(response) {
  if (response.code === 'error.data_exists') {
    notification.error({
      description: intl
        .get('spfm.configServer.view.deliver.notification.dataExist')
        .d('数据已存在'),
    });
  }
}

export default {
  namespace: 'configServer',

  state: {
    settings: {}, // 配置信息
    enumMap: {}, // 值集
    outMostActiveKey: 'common',

    innerControlList: [], // 内部控制列表
    innerControlListPagination: {}, // 内部控制分页
    selectedRowKeysInner: [], // 内部控制选中主键
    innerControlMap: {},
    leftCurrentRow: -1, // 内部控制左侧当前选中行

    outerControlList: [], // 外部控制列表
    includeAllFlag: false,
    outerControlHeader: {}, // 外部控制头信息
    outerControlListPagination: {}, // 外部控制分页
    selectedRowKeysOuter: [], // 外部控制选中主键
    outerQuery: {},

    organizationList: [], // 组织列表
    organizationPagination: {}, // 组织列表分页
    historyData: [], // 历史选中的组织数据
    checkedData: [], // 选中的组织数据

    activeKey: 'inner',
    versionRules: [], // 订单版本管理规则
    pagination: {},
    dataSourceMap: {},
    selectedRowKeys: [],

    orderConfigList: [], // 订单配置表列表
    orderConfigPagination: {},
    orderQuery: {},

    deliverTemplates: [], // 送货单打印模板
    doMergeRulesList: [], // 对账及开票并单规则数据

    mergeRules: [], // 并单规则列表
    mergeRulesPagination: {}, // 并单规则分页

    trxTypeList: {}, // 采购事务类型列表
    trxTypePagination: {}, // 采购事务类型分页信息

    splitOrderRules: [], // 拆分订单规则列表
    splitOrderPagination: {}, // 拆分订单规则分页信息

    supplierAddMonitorList: [], // 供应商加入监控列表
    riskScanList: [], // 风险扫描列表

    openResult: false, // 是否开启电签

    importErpList: [], // 导入erp默认配置页面数据
    newImportErpData: [], // 导入erp默认页面所有数据

    minOrderAmountList: [], // 最小下单金额定义列表
    minOrderAmountPagination: {}, // 最小下单金额定义列表f分页
    mergeSourceList: [],
    mergeSourcepagination: {},
  },

  effects: {
    // 查询值集
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          prSourcePlat: 'HPFM.PR_SOURCE',
          typeFlag: 'SODR.PO_STATUS',
          templates: 'SODR.PO_PRINT_TYPE',
          delivery: 'SODR.DEFUALT_DELIVERY_DATE',
          rules: 'SPFM.ORDER.VERSION_RULE',
          approval: 'SODR.SRM_APPROVE_TYPE',
          mergeRules: 'SINV.ASN.DOC_MERGE_RULE_CODE',
          approvalMethod: 'SPRM.PR_APPROVAL_METHOD',
          prSrcPlateForm: 'SPRM.SRC_PLATFORM',
          sourceFrom: 'HPFM.DATA_SOURCE',
          pcApprovalMethod: 'SPCM.CONFIG.PC_APPROVAL_METHOD',
          pcApprovalOrder: 'SPCM.PC_APPROVAL_ORDER',
          supplierAddMonitor: 'SSLM.MONITOR_FUNCTION',
          riskScan: 'SSLM.RISK_SCAN',
          listType: 'SPRM.PR_ERP_EXEC_TYPE',
          signOrder: 'SPCM.ELECTRIC_SIGN_ORDER',
          taxType: 'SPRM.PR_INVOICE_TYPE',
          assignPurchasers: 'SPRM.AUTO_ASSIGN_TYPE',
          formPrint: 'SSLM.QUALIFIED_PRINT', // 申请单打印值集
          checkApprove: 'SPUC.ACCEPT_LIST_APPROVAL_TYPE',
          // deliverPrint: 'SINV.PRINT_CONFIG', // 送货单模板打印
          productApprove: 'SCEC.PRODUCT_APPROVAL', // 商品审批
          createPriceWay: 'SSRC.PRICE_LIB_APPROVAL_TYPE', // 手工创建“价格库”审批方式
          parityRules: 'SMAL.GOODS_COMPARE', // 比价单配置
          freeHandleType: 'SQAM.PAYMENT_TYPE',
          defaultLender: 'SFIN.DEBIT_CREDIT_CODE',
          claimApprovalPoints: 'SQAM.CLAIM_APPROVAL_POINT',
          claimApprovalMethods: 'SQAM.CLAIM_APPROVAL_METHOD',
          evaluateClarifyRule: 'SSRC_EVALUATE_CLARIFY_RULE', // 评审澄清规则
          numSource: 'SFIN.DATA_SOURCE',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap,
        },
      });
    },
    *fetchDeliverPrint(params, { call, put }) {
      const deliverPrint = getResponse(
        yield call(queryUnifyIdpValue, 'SINV.PRINT_CONFIG', { tenantId })
      );
      yield put({
        type: 'updateState',
        payload: {
          deliverPrint,
        },
      });
    },
    // 查询导入erp所有数据
    *fetchNewImport({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchNewImport, payload));
      yield put({
        type: 'updateState',
        payload: {
          newImportErpData: response,
        },
      });
      return response;
    },

    // 查询导入Erp默认配置
    *fetchImportErpDefault({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchImportErpDefault, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            importErpList: response.content || [],
            paginationList: createPagination(response),
          },
        });
      }
    },
    // 查询配置信息
    *fetchSettings(params, { call, put }) {
      const result = getResponse(yield call(fetchSettings));
      if (result) {
        // 扩展性，不影响其原有逻辑情况，添加其他功能逻辑特殊处理
        if (!result['010408']) {
          result['010408'] = null;
        }
        const newResult = {};
        for (const key in result) {
          if (isNumber(+result[key]) && !isNaN(+result[key]) && result[key] !== null) {
            newResult[key] = +result[key];
          } else if (result[key] === null) {
            newResult[key] = undefined;
          } else {
            newResult[key] = result[key];
          }
        }
        yield put({
          type: 'updateState',
          payload: {
            settings: newResult,
          },
        });
      }
      return result;
    },
    // 保存配置信息
    *saveSettings({ payload }, { call }) {
      const result = getResponse(yield call(saveSettings, payload.customizeSetting));
      return result;
    },
    // 重置配置信息
    *resetSettings(params, { call, put }) {
      const result = getResponse(yield call(resetSettings));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            settings: result,
          },
        });
      }
      return result;
    },
    // 保存外部屏蔽头
    *saveOuterPriceShieldHeader({ payload }, { call, put }) {
      const result = getResponse(yield call(saveOuterPriceShieldHeader, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            includeAllFlag: result.includeAllFlag,
            outerControlHeader: result,
          },
        });
      }
      return result;
    },
    // 查询内部控制
    *searchInnerList({ payload }, { call, put }) {
      const result = getResponse(yield call(searchInnerList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            innerControlList: result.content,
            innerControlListPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 查询内部控制屏蔽组织列表
    *searchInnerShieldOrg({ payload }, { call, put, select }) {
      const { innerControlMap } = yield select(state => state.configServer);
      const { shieldId } = payload;
      const result = getResponse(yield call(searchInnerShieldOrg, payload));
      if (result && result.treeList) {
        innerControlMap[shieldId] = getAllSelectedChilds(result.treeList);
        yield put({
          type: 'updateState',
          payload: {
            organizationList: result.treeList,
            historyData: getAllSelectedChilds(result.treeList),
            checkedData: getAllSelectedChilds(result.treeList),
            innerControlMap,
          },
        });
      } else {
        yield put({
          type: 'updateState',
          payload: {
            organizationList: [],
          },
        });
      }
      return result;
    },
    // 保存内部控制信息
    *saveInnerShieldInner({ payload }, { call }) {
      const result = getResponse(yield call(saveInnerShieldInner, payload));
      return result;
    },
    // 查询外部控制头
    *searchHeader({ payload }, { call, put }) {
      const result = getResponse(yield call(searchHeader, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            includeAllFlag: result.includeAllFlag,
            outerControlHeader: result,
          },
        });
      }
      return result;
    },
    // 查询外部控制行
    *searchLines({ payload }, { call, put, select }) {
      const { includeAllFlag } = yield select(state => state.configServer);
      const result = getResponse(yield call(searchLines, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            outerControlList: includeAllFlag ? [] : result.content,
            outerControlListPagination: includeAllFlag
              ? {
                  showSizeChanger: true,
                  current: 1,
                  pageSize: 10, // 每页大小
                  total: 0,
                  showTotal: 0,
                }
              : createPagination(result),
          },
        });
      }
    },

    // 查询对账单及开票规则数据
    *fetchDocMergeRulesList({ payload }, { call, put }) {
      const response = yield call(queryDocMergeRulesList, payload);
      const list = getResponse(response);
      yield put({
        type: 'updateState',
        payload: {
          doMergeRulesList: setUpdateToData(list),
        },
      });
    },

    // 查询租户级配置中心_接收事务类型数据
    *fetchReceiveTrxType({ payload }, { call, put }) {
      const { isUpdate, ...other } = payload;
      const response = yield call(fetchRcvTrxTypeList, other);

      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            trxTypeList: {
              ...list,
              content: list.content.map(item => (isUpdate ? { _status: 'update', ...item } : item)),
            },
            trxTypePagination: createPagination(list),
          },
        });
      }
    },

    // 保存对账单及开票规则数据
    *saveDocMergeRulesList({ payload }, { call }) {
      const result = getResponse(yield call(saveDocMergeRule, payload));
      return result;
    },

    *deleteLines({ payload }, { call }) {
      const result = getResponse(yield call(deleteLines, payload));
      return result;
    },
    *deleteInnerLines({ payload }, { call }) {
      const result = getResponse(yield call(deleteInnerLines, payload));
      return result;
    },
    *fetchOrderConfigList({ payload }, { call }) {
      const result = getResponse(yield call(fetchOrderConfigList, payload));
      return result;
    },
    *saveOrderConfigList({ payload }, { call }) {
      const res = yield call(saveOrderConfigList, payload);
      return getResponse(res);
    },

    // 查询送货单并单规则列表
    *fetchAsnMergeRules({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchAsnMergeRules, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            mergeRules: result.content.map(item => ({ _status: 'update', ...item })) || [],
            mergeRulesPagination: createPagination(result),
          },
        });
      }
    },

    // 删除并单规则
    *deleteAsnMergeRules({ payload }, { call }) {
      const result = getResponse(yield call(deleteAsnMergeRules, payload));
      return result;
    },

    // 保存并单规则
    *saveAsnMergeRules({ payload }, { call }) {
      const result = getResponse(yield call(saveAsnMergeRules, payload), dealDataExist);
      return result;
    },

    // 保存租户级配置中心_接收事务类型数据
    *saveRcvTrxType({ payload }, { call }) {
      const list = getResponse(yield call(saveRcvTrxType, payload));
      return list;
    },

    // 查询采购申请审批列表
    *fetchPurchaseRequisitionApprovalList(_payload, { call }) {
      const list = getResponse(yield call(fetchPurchaseRequisitionApprovalList));
      return list;
    },

    // 保存采购申请审批数据
    *savePurchaseRequisitionApproval({ payload }, { call }) {
      const list = getResponse(yield call(savePurchaseRequisitionApproval, payload));
      return list;
    },

    // 删除采购申请审批数据
    *deletePurchaseRequisitionApproval({ payload }, { call }) {
      const list = getResponse(yield call(deletePurchaseRequisitionApproval, payload));
      return list;
    },

    // 查询采购申请回传列表
    *fetchPurchaseRequisitionSendBackPurchaseRequest(_payload, { call }) {
      const list = getResponse(yield call(fetchPurchaseRequisitionSendBackPurchaseRequest));
      return list;
    },

    // 保存采购申请回传数据
    *savefetchPurchaseRequisitionSendBackPurchaseRequest({ payload }, { call }) {
      const list = getResponse(
        yield call(savefetchPurchaseRequisitionSendBackPurchaseRequest, payload)
      );
      return list;
    },

    // 删除采购申请回传数据
    *deletefetchPurchaseRequisitionSendBackPurchaseRequest({ payload }, { call }) {
      const list = getResponse(
        yield call(deletefetchPurchaseRequisitionSendBackPurchaseRequest, payload)
      );
      return list;
    },

    // 查询采购申请审批列表
    *fetchOrderMergeRuleList(_payload, { call }) {
      const list = getResponse(yield call(fetchOrderMergeRuleList));
      return list;
    },

    // 查询采购申请审批列表
    *saveOrderMergeRule({ payload }, { call }) {
      const list = getResponse(yield call(saveOrderMergeRule, payload.poMergeRules));
      return list;
    },

    // 查询拆单规则
    *fetchSplitOrderRules({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchSplitOrderRules, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            splitOrderRules: result.content.map(item => ({ _status: 'update', ...item })) || [],
            splitOrderPagination: createPagination(result),
          },
        });
      }
    },
    // 保存拆单规则
    *saveSplitOrderRules({ payload }, { call }) {
      const res = getResponse(yield call(saveSplitOrderRules, payload));
      return res;
    },
    // 查询供应商加入监控
    *fetchSupplierAddMonitor({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchSupplierAddMonitor, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            supplierAddMonitorList: res,
          },
        });
      }
      return res;
    },
    // 保存供应商加入监控
    *saveSupplierAddMonitor({ payload }, { call }) {
      const res = getResponse(yield call(saveSupplierAddMonitor, payload));
      return res;
    },
    // 查询风险扫描
    *fetchRiskScan({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchRiskScan, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            riskScanList: res.content,
          },
        });
      }
      return res;
    },
    // 保存导入erp默认
    *saveImportErpDefault(params, { call }) {
      const { payload } = params;
      const { importErpList } = payload;
      const res = getResponse(yield call(saveImportErpDefault, importErpList));
      return res;
    },
    // 保存风险扫描
    *saveRiskScan({ payload }, { call }) {
      const res = getResponse(yield call(saveRiskScan, payload));
      return res;
    },
    // 查询未分配的供应商列表
    *fetchNotPermitList({ payload }, { call }) {
      const res = getResponse(yield call(fetchNotPermitList, payload));
      return res;
    },
    // 查询已分配的供应商列表
    *fetchPermitList({ payload }, { call }) {
      const res = getResponse(yield call(fetchPermitList, payload));
      return res;
    },
    // 允许供应商在线确认
    *handleAssign({ payload }, { call }) {
      const res = getResponse(yield call(handleAssign, payload));
      return res;
    },
    // 取消供应商在线确认
    *handleCancelAssign({ payload }, { call }) {
      const res = getResponse(yield call(handleCancelAssign, payload));
      return res;
    },
    // 查询配置信息
    *fetchOpenResult(params, { call }) {
      return getResponse(yield call(fetchOpenResult, params));
    },
    // 邀请公司CA认证
    *inviteCompany(params, { call }) {
      const result = getResponse(yield call(inviteCompany));
      return result;
    },
    // 查询直连开票规则
    *directInvoiceRules({ payload }, { call }) {
      const result = getResponse(yield call(directInvoiceRules, payload));
      return result;
    },
    // 保存直连开票规则
    *saveDirectInvoiceRules({ payload }, { call }) {
      const result = getResponse(yield call(saveDirectInvoiceRules, payload));
      return result;
    },
    // 删除直连开票规则
    *deleteDirectInvoiceRules({ payload }, { call }) {
      const result = getResponse(yield call(deleteDirectInvoiceRules, payload));
      return result;
    },
    // 直连开票规则明细查询
    *directInvoiceRulesDetails({ payload }, { call }) {
      const result = getResponse(yield call(directInvoiceRulesDetails, payload));
      return result;
    },
    // 直连开票规则明细保存
    *saveDirectInvoiceRulesDetails({ payload }, { call }) {
      const result = getResponse(yield call(saveDirectInvoiceRulesDetails, payload));
      return result;
    },

    // 查询直连开票规则
    *directInvoiceInfo({ payload }, { call }) {
      const result = getResponse(yield call(directInvoiceInfo, payload));
      return result;
    },
    // 保存直连开票基本信息
    *saveDirectInvoiceInfo({ payload }, { call }) {
      const result = getResponse(yield call(saveDirectInvoiceInfo, payload));
      return result;
    },
    // 删除直连开票基本信息
    *deleteDirectInvoiceInfo({ payload }, { call }) {
      const result = getResponse(yield call(deleteDirectInvoiceInfo, payload));
      return result;
    },
    // 查询采购协议数据来源
    *queryAgreementDataSource({ payload }, { call }) {
      const result = getResponse(yield call(queryAgreementDataSource, payload));
      return result;
    },
    // 保存采购协议数据来源
    *saveAgreementDataSource({ payload }, { call }) {
      const result = getResponse(yield call(saveAgreementDataSource, payload));
      return result;
    },
    // 查询采购协议并单规则
    *queryAgreementMergeRule({ payload }, { call }) {
      const result = getResponse(yield call(queryAgreementMergeRule, payload));
      return result;
    },
    // 采购协议并单规则保存
    *saveAgreementMergeRule({ payload }, { call }) {
      const result = getResponse(yield call(saveAgreementMergeRule, payload));
      return result;
    },
    // 订单维护价格修改配置
    *queryOrderPriceModifiable({ payload }, { call }) {
      const result = getResponse(yield call(queryOrderPriceModifiable, payload));
      return result;
    },
    // 订单维护价格配置保存
    *saveOrderPriceModifiable({ payload }, { call }) {
      const result = getResponse(yield call(saveOrderPriceModifiable, payload));
      return result;
    },
    // 查询订单评价配置
    *queryOrderEvaluate({ payload }, { call }) {
      const result = getResponse(yield call(queryOrderEvaluate, payload));
      return result;
    },
    // 保存订单评价配置
    *saveOrderEvaluate({ payload }, { call }) {
      const result = getResponse(yield call(saveOrderEvaluate, payload));
      return result;
    },
    // 查询需求信息屏蔽角色列表
    *fetchShieldNeedsInfList({ payload }, { call }) {
      const response = getResponse(yield call(fetchShieldNeedsInfList, payload));
      return response;
    },
    // 删除供应商角色
    *deleteShieldNeedsInf({ payload }, { call }) {
      const list = getResponse(yield call(deleteShieldNeedsInf, payload));
      return list;
    },
    // 保存供应商角色
    *saveShieldNeedsInf({ payload }, { call }) {
      const result = getResponse(yield call(saveShieldNeedsInf, payload));
      return result;
    },
    // 订单确认、反馈审核及回传ERP规则
    *fetchoOrderConfirmRuleList({ payload }, { call }) {
      const result = getResponse(yield call(fetchoOrderConfirmRuleList, payload));
      return result;
    },
    // 订单确认、反馈审核及回传ERP规则
    *saveOrderConfirmRule({ payload }, { call }) {
      const list = getResponse(yield call(saveOrderConfirmRule, payload.poMergeRules));
      return list;
    },
    // 查询扣款单默认值定义
    *fetchAutoDeductNote({ payload }, { call }) {
      const result = getResponse(yield call(fetchAutoDeductNote, payload));
      return result;
    },
    // 查询扣款单默认值定义
    *saveAutoDeductNote({ payload }, { call }) {
      const result = getResponse(yield call(saveAutoDeductNote, payload));
      return result;
    },
    // 查询扣款单默认值定义
    *deleteAutoDeductNote({ payload }, { call }) {
      const result = getResponse(yield call(deleteAutoDeductNote, payload));
      return result;
    },
    // 查询索赔单审批配置项
    *fetchPointAndMethod({ payload }, { call }) {
      const result = getResponse(yield call(fetchPointAndMethod, payload));
      return result;
    },
    // 保存索赔单审批配置项
    *savePointAndMethod({ payload }, { call }) {
      const result = getResponse(yield call(savePointAndMethod, payload));
      return result;
    },
    // 删除索赔单审批配置项
    *deletePointAndMethod({ payload }, { call }) {
      const result = getResponse(yield call(deletePointAndMethod, payload));
      return result;
    },
    // 查询最小下单金额定义列表
    *queryMinimumOrderAmountList({ payload }, { put, call }) {
      const result = getResponse(yield call(queryMinimumOrderAmountList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            minOrderAmountList: result.content.map(item => ({ ...item, _status: 'update' })),
            minOrderAmountPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 新增最小下单金额定义列表
    *addMinimumOrderAmount({ payload }, { call }) {
      const result = getResponse(yield call(addMinimumOrderAmount, payload));
      return result;
    },
    // 删除最小下单金额定义列表
    *delMinimumOrderAmount({ payload }, { call }) {
      const result = getResponse(yield call(delMinimumOrderAmount, payload));
      return result;
    },

    // 查询申请转寻源并单规则
    *fetchMergeSourceSet({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchMergeSourceSet, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            mergeSourceList: setUpdateToData(response),
            mergeSourcepagination: createPagination(response),
          },
        });
      }
      return response;
    },
    // 查询申请转寻源并单规则
    *saveMergeSourceSet({ payload }, { call }) {
      const result = getResponse(yield call(saveMergeSourceSet, payload));
      return result;
    },
    // 需求变更列表
    *fetchPurchaserUpdateFields({ payload }, { call }) {
      const result = getResponse(yield call(fetchPurchaserUpdateFields, payload));
      return result;
    },
    // 需求变更列表
    *fetchPurchaserUpdateSave({ payload }, { call }) {
      const result = getResponse(yield call(fetchPurchaserUpdateSave, payload));
      return result;
    },
    // 查询质量对账数据来源
    *fetchReconciliationSource({ payload }, { call }) {
      const result = getResponse(yield call(fetchReconciliationSource, payload));
      return result;
    },
    // 保存质量对账数据来源
    *saveReconciliationSource({ payload }, { call }) {
      const result = getResponse(yield call(saveReconciliationSource, payload));
      return result;
    },
    // 删除质量对账数据来源
    *deleteReconciliationSource({ payload }, { call }) {
      const result = getResponse(yield call(deleteReconciliationSource, payload));
      return result;
    },
    // 查询自动创建订单
    *queryModalList({ payload }, { call }) {
      const result = getResponse(yield call(queryModalList, payload));
      return result;
    },

    // 保存更新模态框
    *updateSave({ payload }, { call }) {
      const response = getResponse(yield call(updateSave, payload.headerData));
      return response;
    },

    // -删除模态框
    *deletes({ payload }, { call }) {
      const response = getResponse(yield call(deletes, payload));
      return response;
    },
  },
  reducers: {
    // 修改导入erp启用状态
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
