/*
 * @Description: 转售付款详情页 - model
 * @LastEditors: 何智鹏 <he.zhipeng@hand-china.com>
 * @Date: 2023-08-15 09:39:53
 * @Copyright: Copyright (c) 2023, Hand
 */
import { getheaderInfo, getBillLine } from '@/services/resaleRequestDetailService';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import { getResponse, createPagination, getCurrentUser } from 'utils/utils';

export default {
  namespace: 'resaleRequestDetail',
  state: {
    // 加载标识
    defaultHeaderLoading: false, // 头数据初始化 - 加载标识
    WorkFlowLoading: false, // 查询审批记录 - 加载标识
    bankQueryLoading: false, // 查询银行信息 - 加载标识
    payWriteOffLoading: false, // 查询支付核销 - 加载标识
    otherRiskTipsLoading: false, // 查询风险提示 - 加载标识
    costRequestLoading: false, // 单据提交 - 加载标识
    fileDownloadLoading: false, // 批量下载附件 - 加载标识
    exportPdfLoading: false, // 下载PDF - 加载标识
    updateRiskCheckLoading: false, // 更新风险校验 - 加载标识
    withdrawLoading: false, // 单据撤回 - 加载标识
    returnToSupplierLoading: false, // 退回供应商 - 加载标识
    actionSaveLoading: false, // 保存单据 - 加载标识
    supplyAttachmentLoading: false, // 查询补充附件 - 加载标识
    // 权限标识
    costRequestId: 0, // 单据id
    isPub: false, // 是否pub页面
    isEn: false, // 是否英文环境
    optionButtonKey: '', // 当前选择操作按钮标识
    optionButtonData: {}, // 当前选择按钮相关数据
    viewButtonFlag: true, // 补充附件按钮控制权限
    createFlag: false, // 创建单据标识
    viewOnly: false, // 是否为只读页面
    editable: false, // 是否单据状态可编辑
    paymentOwnerEditFlag: null, // 下沉责任人是否可编辑
    // 基础数据
    lovData: {}, // 值集数据
    isUpdate: [], // 是否存在变更
    pagePathname: '', // 页面路由
    // 其他数据
    switchRisk: 1, // 风险提示值集开关  1/0 ——> 开/关
    otherRiskWarning: false, // 是否存在风险提示
    checkStatus: 0, // 是否进行过风险校验, 是为1, 否为0
    riskStatus: 0, // 是否有风险，有为1 ,没有为0
    paymentRiskStatus: 0, // 是否收款
    soUrl: '', // 销售合同地址
    userEmployeeId: '', // 当前操作用户工号
    financialViewPermission: false, // 财务视图 - 显示标识
    returnToSupplierForm: {}, // 退回供应商 - form
    submitErrorMessage: '', // 提交校验错误信息
    approvalRemind: {}, // 审批提醒数据
    productTypeModalVisible: false, // 业务类型 - 弹框显示标识
    productTypeCodes: [], // 业务类型数据
    approvalRemindModalVisible: false, // 审批提示 - 弹框显示标识
    approvalRemindModalContent: null, // 审批提示 - 弹框内容
    // 审批数据
    currentNodeName: '', // 审批数据 - 当前节点名称
    isOperator: false, // 审批记录 - 是否为操作人
    approvalReqRecVOList: [], // 审批数据 - 审批记录
    approvalRequestHeaderVO: {}, // 审批数据 - 审批记录头数据
    approvalRequestButtonVOList: [], // 审批数据 - 审批按钮数据
    hasSubmitButton: false, // 审批数据 - 是否存在提交按钮
    // 飞书参数
    open: '',
    workflowtype: '',
    newFlag: '',
    // 头数据
    headerData: {}, // 头数据 - 数据集
    infoForm: {}, // 头数据 - form
    // 账单列表
    blDataSource: [], // 账单列表 - 表格数据
    blListAttachment: [], // 账单列表 - 附件数据
    blListNewAttachment: [], // 账单列表 - 新增的附件数据
    blListIndexId: 0, // 账单列表 - 当前操作行
    blListSelectedRowKeys: [], // 账单列表 - 勾选行的id集合
    blListSelectedRows: [], // 账单列表 - 勾选行的数据集合
    // 账单明细
    bdDataForm: {}, // 账单明细 - 查询条件Form
    bdDataSource: [], // 账单明细 - 表格数据
    bdDataPagination: {}, // 账单明细 - 分页数据
    bdDataSelectedRowKeys: [], // 账单明细 - 勾选行的id集合
    bdDataSelectedRows: [], // 账单明细 - 勾选行的数据集合
    // 银行信息
    bankDataSource: [], // 银行信息 - 表格数据
    // 支付核销
    payWriteOffData: {}, // 支付核销 - 数据集
    payWriteOffForm: {}, // 支付核销 - form
    // 补充附件
    supplyAttachmentSource: [], // 补充附件 - 表格数据
    supplyAttachmentPagination: {}, // 补充附件 - 分页数据
    otherAttachmentSource: [], // 其他附件 - 表格数据
    attachmentSource: [], // 必要附件 - 表格数据
  },
  effects: {
    // 查询详情值集
    *fetchLoveData(_, { put, call }) {
      const response = getResponse(
        yield call(queryMapIdpValue, {
          'VP.PRICE_CONTRACT_SIGN_ENTITY': 'VP.PRICE_CONTRACT_SIGN_ENTITY',
          'SPCM.COST_PRESS_LEVEL': 'SPCM.COST_PRESS_LEVEL',
          'SPUC.COST_ORIGINAL_RECEIVED': 'SPUC.COST_ORIGINAL_RECEIVED',
          'SRSP.BANK_CHARGE_TYPE': 'SRSP.BANK_CHARGE_TYPE',
          RS_IP_ATTACHMENT_TYPE: 'RS_IP_ATTACHMENT_TYPE',
          'SPUC.IBOSS_SO_URL': 'SPUC.IBOSS_SO_URL',
          RS_IBOSS_PRODUCT_TYPE: 'RS_IBOSS_PRODUCT_TYPE',
          'SRSP.RISK_SWITCH': 'SRSP.RISK_SWITCH',
          RS_IP_APPROVAL_NODE: 'RS_IP_APPROVAL_NODE',
          'SPCM.FINANCIAL_AUDIT_FILE': 'SPCM.FINANCIAL_AUDIT_FILE',
          'SPUC.FIN_VIEW_USER': 'SPUC.FIN_VIEW_USER',
          'SPFM.URGE.FORMLINK': 'SPFM.URGE.FORMLINK',
          'SRSP.PAYMENT_REQUEST_SOURCE': 'SRSP.PAYMENT_REQUEST_SOURCE',
          'SRSP.PAYMENT_INFORM_EXCLUDE_DEPARTMENT': 'SRSP.PAYMENT_INFORM_EXCLUDE_DEPARTMENT',
        })
      );
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            lovData: response,
            switchRisk: response['SRSP.RISK_SWITCH'][0].tag || 1,
            soUrl: (
              response['SPUC.IBOSS_SO_URL'].find((item) => item.value === 'IBOSS_SO_URL') || {}
            ).tag,
            financialViewPermission: (response['SPUC.FIN_VIEW_USER'] || []).some(
              (i) => i.value === getCurrentUser().loginName
            ),
            productTypeCodes: response.RS_IBOSS_PRODUCT_TYPE.map((item) => ({
              value: item.value,
              label: item.meaning,
            })),
          },
        });
      }
    },

    // 查询头数据
    *fetchDetailData({ payload }, { put, call }) {
      const response = yield call(getheaderInfo, payload);
      if (response) {
        const { otherRiskWarningMeaning } = response.costPaymentRequest;
        yield put({
          type: 'updateState',
          payload: {
            headerData: response,
            blDataSource: response.resaleDetailInvoiceList.map((list) => ({
              ...list,
              ...list.costDetailInvoice,
            })),
            otherRiskWarning: otherRiskWarningMeaning && otherRiskWarningMeaning !== ';',
            blListSelectedRowKeys: [],
            blListSelectedRows: [],
            editable: ['DRAFT', 'REVOKE'].includes(response.costPaymentRequest?.requestStatus),
          },
        });
      }
      return response;
    },

    // 查询发票明细
    *fetchBillLineDetail({ payload }, { put, call }) {
      const response = yield call(getBillLine, payload);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            bdDataSource: response.content.map((list) => ({
              ...list,
              ...list.resaleDetailLine,
              ...list.resaleDetailLine?.poHeaders,
              ...list.resaleDetailLine?.poLines,
            })),
            blListIndexId: payload.costInvoiceId,
            bdDataPagination: createPagination(response),
            bdDataSelectedRowKeys: [],
            bdDataSelectedRows: [],
          },
        });
      }
      return response;
    },

    // 修改状态值
    *handleSetState({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload,
      });
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
