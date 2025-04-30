/*
 * @Description: 转售采购成品付款申请 - 详情页
 * @LastEditors: 何智鹏 <he.zhipeng@hand-china.com>
 * @Date: 2023-07-24 10:52:05
 * @Copyright: Copyright (c) 2023, Hand
 */
import { Button, Collapse, Dropdown, Modal } from 'antd';
import dayjs from 'dayjs';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { last } from 'lodash';
import moment from 'moment';
import queryString from 'querystring';
import React, { Component } from 'react';
import ellipsis from 'srm-front-common/lib/assets/ellipsis.svg';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  createPagination,
  getCurrentLanguage,
  getCurrentOrganizationId,
  getCurrentUser,
} from 'utils/utils';
import CusButton from '_cus_components/CusButton';
import CusApprovalButtons from '_cus_components/CusButton/CusApprovalButtons';
import PanelHeader from '_cus_components/CusCollapse';
import CusExcelExport from '_cus_components/CusExcelExport';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import PageWrapper from '_cus_components/Page/PageWrapper';
// import { closeWindow } from '_cus_utils/utils';
import { batchDownloadFileReform } from '@/common/utils';
import {
  actionSave,
  batchDownLoadFiles,
  checkAllowReturnBank,
  detailWithdraw,
  downLoadPdf,
  getBankData,
  getButtonPermission,
  getCompanyName,
  getEmployeeName,
  getExchangeRate,
  getGeneralRequestResult,
  getOtherRiskTips,
  getPayWriteOffData,
  getPermission,
  getService,
  getUserInfo,
  paymentApprovalRemindValidate,
  querySupplyAttachment,
  returnToSupplier,
  submitMaterial,
  updateRiskTips,
} from '@/services/resaleRequestDetailService';
import { fastCodeLoader } from '@/utils/decorators';
import ApprovalHistory from './components/ApprovalHistory';
import AttachmentPanel from './components/AttachmentPanel';
import BankPanel from './components/BankPanel';
import InfoPanel from './components/InfoPanel';
import PaymentDetailPanel from './components/PaymentDetailPanel';
import StepPanel from './components/StepPanel';
import SupplyAttachment from './components/SupplyAttachment';
import styles from './index.less';
import FinancialAuditModal from './modals/FinancialAuditModal';
import PageErrorMessage from './modals/PageErrorMessage';
import ProductTypeModal from './modals/ProductTypeModal';
import ReturnToSupplierModal from './modals/ReturnToSupplierModal';

const currentUser = getCurrentUser();
const currentLanguage = getCurrentLanguage();
const organizationId = getCurrentOrganizationId();
const { Panel } = Collapse;

@fastCodeLoader([
  'VP.PRICE_CONTRACT_SIGN_ENTITY',
  'SPCM.COST_PRESS_LEVEL',
  'SPUC.COST_ORIGINAL_RECEIVED',
  'SRSP.BANK_CHARGE_TYPE',
  'RS_IP_ATTACHMENT_TYPE',
])
@formatterCollections({ code: ['spcm.paymentRequest'] })
@connect(({ loading = {}, resaleRequestDetail = {} }) => ({
  resaleRequestDetail,
  loading: [
    resaleRequestDetail.supplyAttachmentLoading,
    resaleRequestDetail.actionSaveLoading,
    resaleRequestDetail.defaultHeaderLoading,
    resaleRequestDetail.WorkFlowLoading,
    resaleRequestDetail.bankQueryLoading,
    resaleRequestDetail.payWriteOffLoading,
    loading.effects['resaleRequestDetail/fetchLoveData'],
    loading.effects['resaleRequestDetail/fetchDetailData'],
    // loading.effects['resaleRequestDetail/fetchBillLineDetail'],
  ],
}))
export default class PageIndex extends Component {
  constructor(props) {
    super(props);
    const { match, dispatch, location } = props;
    const { id } = match.params;
    const { open, workflowtype, newFlag } = queryString.parse(location.search.substr(1)); // 判断是否飞书打开
    dispatch({ type: 'resaleRequestDetail/fetchLoveData' });
    dispatch({
      type: 'resaleRequestDetail/handleSetState',
      payload: {
        infoForm: React.createRef(),
        billDetailForm: React.createRef(),
        payWriteOffForm: React.createRef(),
        returnToSupplierForm: React.createRef(),
        createFlag: !id,
        costRequestId: id,
        isPub: location.pathname.includes('pub'),
        pagePathname: location.pathname,
        isEn: currentLanguage === 'en_US',
        open,
        workflowtype,
        newFlag,
        viewOnly: match.path.includes('/spcm/payment-request-view/detail/:id'),
      },
    });
    this.state = {
      activeKey: [
        'progress',
        'info',
        'payment-detail',
        'bank',
        'attachment',
        'supplementAttachment',
        'approvalHistory',
      ], // 面板标签数据
      costRequestId: id, // 单据Id
      financialAuditModalVisible: false, // 财务审核说明 - 弹框显示标识
      returnToSupplierModalVisible: false, // 退回供应商 - 弹框显示标识
      optionButtonModalVisible: false, // 操作按钮 - 弹框显示标识
    };
  }

  cusApprovalBtns = React.createRef();

  componentDidMount = async () => {
    const { dispatch } = this.props;
    const { costRequestId } = this.state;
    window.addEventListener('message', this.receiveMessage, false);
    if (!costRequestId) {
      dispatch({
        type: 'resaleRequestDetail/handleSetState',
        payload: { defaultHeaderLoading: true },
      });
      // 获取用户信息
      getEmployeeName({ employeeNum: currentUser.loginName }).then((res) => {
        const { resaleRequestDetail } = this.props;
        const { infoForm } = resaleRequestDetail;
        const employeeName = currentLanguage === 'en_US' ? res.nameEn : res.name;
        // 初始化数据
        infoForm.current.setFieldsValue({
          requestEmployeeName: employeeName,
          requestEmployeeNum: res.employeeNum,
          draftEmployeeName: employeeName,
          draftEmployeeId: res.employeeId,
          pressLevel: 'GENERAL',
          requestDate: moment(new Date()).format('YYYY-MM-DD'),
          expenseCategory: 'Share',
          chequePayFlag: 'N',
          multiCurrencyFlag: 'N',
          needAutoCopy: 'N',
          notNeedPaidFlag: 'N',
          transferOrderFlag: 'N',
          bankReturnFlag: 'N',
        });
      });
      // 获取默认公司
      getCompanyName().then((res) => {
        const { resaleRequestDetail } = this.props;
        const { infoForm } = resaleRequestDetail;
        infoForm.current.setFieldsValue({
          companyOrgCode: res.companyCode,
        });
        this.changeCompanyName(res.companyCode);
      });
    } else {
      this.handleRefreshData();
    }
  };

  componentWillUnmount() {
    window.removeEventListener('message', this.receiveMessage);
  }

  /**
   * @name: 操作 - 数据初始化
   */
  handleRefreshData = async () => {
    // 查询补充附件
    this.handleSupplyAttachment({ current: 1, pageSize: 10 });
    // 查询银行数据
    this.handleBank();
    // 查询支付核销数据
    this.handlePayWriteOff();
    // 获取当前用户信息
    this.handleUserInfo();
    // 获取权限
    this.initPermission();
    // 获取审批记录数据
    await this.handleWorkFlow();
    // 查询页面数据
    this.handleSearchInfo();
  };

  /**
   * @name: 监听事件 - 审批流
   * @param {object} param 参数
   */
  receiveMessage = (param) => {
    const { currentNodeName, optionButtonKey, isPub, workflowtype } =
      this.props.resaleRequestDetail;
    const { routerParam = {} } = param.data;
    if (routerParam.opt === 'ok') {
      Modal.destroyAll();
      if (optionButtonKey === 'submitName' && currentNodeName === '05 财务第一复核人审批') {
        this.pollingWorkFlowDetail('06 财务第二复核人审批');
        return false;
      }
      if (
        [
          'forwardName',
          'HandleForwardName',
          'takingopinionsName',
          'isretractName',
          'givingopinionsName',
        ].includes(optionButtonKey)
      ) {
        this.handleWorkFlow(1);
      } else if (['DeleteBtn', 'submitName', 'rejectName'].includes(optionButtonKey)) {
        // 是否待办打开
        if (workflowtype) {
          window.close();
        } else {
          const { history } = this.props;
          history.push(`${isPub ? '/pub' : ''}/spcm/payment-request/query`);
        }
      }

      // 飞书提交审批后关闭tag页
      try {
        window.h5sdk.ready(function () {
          window.h5sdk.biz.navigation.close({
            onSuccess(result) {
              console.log(result);
            },
          });
        });
      } catch (e) {
        console.log(e);
      }
      this.switchModalContainerClassName();
    } else if (routerParam.opt === 'close') {
      Modal.destroyAll();
      this.switchModalContainerClassName();
    } else if (routerParam.opt === 'refresh') {
      Modal.destroyAll();
      this.switchModalContainerClassName();
      window.location.reload();
    }
  };

  /**
   * @name: 监听事件 - 公司主体变更
   * @param {number} companyCode - 公司code
   */
  changeCompanyName = (companyCode) => {
    const { infoForm, lovData } = this.props.resaleRequestDetail;
    const data = lovData['VP.PRICE_CONTRACT_SIGN_ENTITY'] || [];
    data.map((list) => {
      // 设置币种
      if (list.value === companyCode) {
        infoForm.current.setFieldsValue({
          description: list.description,
          currencyCode: list.description,
          companyOrgName: list.meaning,
          ouOrgCode: list.tag,
        });
        this.changeCurrencyCode(list.description);
      }
      return list;
    });
  };

  /**
   * @name: 监听事件 - 币种变更
   * @param {number} currencyCode - 币种code
   */
  changeCurrencyCode = (currencyCode) => {
    const { resaleRequestDetail, dispatch } = this.props;
    const { infoForm } = resaleRequestDetail;
    // 设置汇率
    if (currencyCode === 'HKD') {
      infoForm.current.setFieldsValue({ conversionRate: 1 });
      dispatch({
        type: 'resaleRequestDetail/handleSetState',
        payload: { defaultHeaderLoading: false },
      });
    } else {
      getExchangeRate({
        currency: currencyCode,
        currencyTO: 'HKD',
        cvtDate: moment().format('YYYY-MM-DD 00:00:00'),
      }).then((res) => {
        if (res) {
          infoForm.current.setFieldsValue({ conversionRate: res.currencyRate });
          dispatch({
            type: 'resaleRequestDetail/handleSetState',
            payload: { defaultHeaderLoading: false },
          });
        }
      });
    }
  };

  /**
   * @name: 操作 - 获取当前用户信息
   */
  handleUserInfo = () => {
    const { dispatch } = this.props;
    getUserInfo(currentUser.id).then((res) => {
      if (res) {
        dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: { userEmployeeId: res.employeeId },
        });
      }
    });
  };

  /**
   * @name: 操作 - 获取权限
   */
  initPermission = () => {
    const { match, dispatch } = this.props;
    const { id, currentRoleId } = currentUser;
    getPermission({
      routePath: '/spcm/payment-request',
      userId: id,
      roleId: currentRoleId,
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: {
            viewOnly:
              match.path.includes('/spcm/payment-request-view/detail/:id') || res.editFlag !== 'Y',
          },
        });
      }
    });
    // 补充附件按钮权限
    getButtonPermission().then((res) => {
      if (res) {
        dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: {
            viewButtonFlag: res.viewButtonFlag === 'Y',
          },
        });
      }
    });
  };

  /**
   * @name: 操作 - 轮询工作流详细信息
   * @param {string} nodeName 节点名称
   */
  pollingWorkFlowDetail = (nodeName) => {
    const { dispatch } = this.props;
    const { costRequestId } = this.state;
    if (!this.polling) {
      dispatch({
        type: 'resaleRequestDetail/handleSetState',
        payload: { costRequestLoading: true },
      });
      this.polling = setInterval(async () => {
        const res = await getGeneralRequestResult({
          requestType: 'SCM_ZCFKSQ',
          targetHeaderId: costRequestId,
          tenantId: organizationId,
        });
        if (res) {
          const { currentNodeName } = res.approvalRequestHeaderVO;
          if (currentNodeName === nodeName) {
            clearInterval(this.polling);
            this.polling = undefined;
            this.handleWorkFlow(1);
          }
        } else {
          dispatch({
            type: 'resaleRequestDetail/handleSetState',
            payload: { costRequestLoading: false },
          });
          clearInterval(this.polling);
          this.polling = undefined;
        }
      }, 1000);
    }
  };

  /**
   * @name: 操作 - 查询数据
   */
  handleSearchInfo = () => {
    const { dispatch, resaleRequestDetail } = this.props;
    const { costRequestId } = this.state;
    const { lovData } = resaleRequestDetail;
    dispatch({
      type: 'resaleRequestDetail/fetchDetailData',
      payload: costRequestId,
    }).then((res) => {
      const { infoForm } = resaleRequestDetail;
      infoForm.current.setFieldsValue({
        ...res.costPaymentRequest,
        requestDate: moment(new Date(res.costPaymentRequest.requestDate)).format('YYYY-MM-DD'),
        expectPaymentDate:
          res.costPaymentRequest.expectPaymentDate &&
          dayjs(
            moment(new Date(res.costPaymentRequest.expectPaymentDate)).format('YYYYMMDD'),
            'YYYYMMDD'
          ),
      });
      // 其他附件
      const otherAttachmentSource = res?.costAttachFileList
        .filter((item) => {
          const type = lovData.RS_IP_ATTACHMENT_TYPE.find((d) => d.value === item.fileType);
          return type && type.tag === '2';
        })
        .map((list) => ({ ...list, _status: 'update' }));
      // 必要附件
      const attachmentSource = res?.costAttachFileList
        .filter((item) => {
          const type = lovData.RS_IP_ATTACHMENT_TYPE.find((d) => d.value === item.fileType);
          return type && type.tag === '3';
        })
        .map((list) => ({ ...list, _status: 'update' }));

      dispatch({
        type: 'resaleRequestDetail/handleSetState',
        payload: { otherAttachmentSource, attachmentSource },
      });

      // 查询发票明细
      const costInvoiceId = res.resaleDetailInvoiceList?.[0]?.costDetailInvoice.costInvoiceId;
      if (costInvoiceId) {
        dispatch({
          type: 'resaleRequestDetail/fetchBillLineDetail',
          payload: { page: 0, size: 10, costInvoiceId },
        });
      }
      // 查询风险信息
      this.handleOtherRiskTips();
      // 查询审批提醒
      this.queryApprovalRemind();
    });
  };

  /**
   * @name: 操作 - 更换modalContainer的类名控制能否移动
   * @param {boolean} flag 标识
   */
  switchModalContainerClassName = (flag = false) => {
    if (flag) {
      const container = document.querySelector('.c7n-pro-modal-container');
      if (container) {
        container.className = styles['c7n-pro-modal-container-moveable'];
      }
    } else {
      const container = document.querySelector(`.${styles['c7n-pro-modal-container-moveable']}`);
      if (container) {
        container.className = 'c7n-pro-modal-container';
      }
    }
  };

  /**
   * @name: 操作 - 查询审批记录
   * @param {number} times 剩余查询次数
   */
  handleWorkFlow = async (times = 30) => {
    const { dispatch } = this.props;
    const { costRequestId } = this.state;
    dispatch({
      type: 'resaleRequestDetail/handleSetState',
      payload: { WorkFlowLoading: times > 0 },
    });
    if (times > 0) {
      const res = await getGeneralRequestResult({
        requestType: 'SCM_ZCFKSQ',
        targetHeaderId: costRequestId,
        tenantId: organizationId,
      });
      if (!res.failed && res?.approvalReqRecVOList?.length > 0) {
        const {
          approvalReqRecVOList = [],
          approvalRequestHeaderVO,
          approvalRequestButtonVOList,
        } = res;
        const { currentNodeName, currentNodeId } = approvalRequestHeaderVO;
        const operators = approvalReqRecVOList
          .filter((item) => item.currentNodeId === currentNodeId)
          .map((item) => item.operator);
        const approvalList04 = approvalReqRecVOList.filter(
          (item) =>
            item.currentNodeName && item.currentNodeName.startsWith('04') && item.operateDate
        );
        const approvalList05 = approvalReqRecVOList.filter(
          (item) =>
            item.currentNodeName && item.currentNodeName.startsWith('05') && item.operateDate
        );
        const approvalList06 = approvalReqRecVOList.filter(
          (item) =>
            item.currentNodeName && item.currentNodeName.startsWith('06') && item.operateDate
        );
        const approvalList = approvalReqRecVOList.filter((item) => {
          const prefix = item.currentNodeName && item.currentNodeName.substr(0, 2);
          if (prefix === '00') {
            return item.approvingOpinion && item.optionTypeName;
          } else if (prefix === '04') {
            return approvalList04.length === 0 ? true : item.operateDate || !item.approvingOpinion;
          } else if (prefix === '05') {
            return approvalList05.length === 0 ? true : item.operateDate || !item.approvingOpinion;
          } else if (prefix === '06') {
            return approvalList06.length === 0 ? true : item.operateDate || !item.approvingOpinion;
          } else {
            return true;
          }
        });
        const hasSubmitButton =
          Array.isArray(approvalRequestButtonVOList) &&
          approvalRequestButtonVOList.some((button) => button.buttonKey === 'submitName');
        dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: {
            WorkFlowLoading: false,
            currentNodeName,
            isOperator: operators.includes(currentUser.realName),
            approvalRequestHeaderVO,
            approvalReqRecVOList: approvalList,
            approvalRequestButtonVOList,
            hasSubmitButton,
          },
        });
      } else {
        setTimeout(() => {
          dispatch({
            type: 'resaleRequestDetail/handleSetState',
            payload: {
              currentNodeName: '',
              isOperator: false,
              approvalRequestHeaderVO: {},
              approvalReqRecVOList: [],
              approvalRequestButtonVOList: [],
              hasSubmitButton: false,
            },
          });
          this.handleWorkFlow(times - 1);
        }, 2000);
      }
    }
  };

  /**
   * @name: 操作 - 查询银行信息
   */
  handleBank = () => {
    const { dispatch } = this.props;
    const { costRequestId } = this.state;
    dispatch({
      type: 'resaleRequestDetail/handleSetState',
      payload: { bankQueryLoading: true },
    });
    getBankData(costRequestId).then((res) => {
      if (res) {
        dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: {
            bankDataSource: [res],
            bankQueryLoading: false,
          },
        });
      } else {
        dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: { bankQueryLoading: false },
        });
      }
    });
  };

  /**
   * @name: 操作 -查询支付核销数据
   */
  handlePayWriteOff = () => {
    const { dispatch } = this.props;
    const { costRequestId } = this.state;
    dispatch({
      type: 'resaleRequestDetail/handleSetState',
      payload: { payWriteOffLoading: true },
    });
    getPayWriteOffData({ costRequestId }).then((res) => {
      if (res && res.standardFlag === 'Y' && res.amountFlag === 'Y') {
        const { payWriteOffForm } = this.props.resaleRequestDetail;
        payWriteOffForm.current.setFieldsValue(res);
        dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: {
            payWriteOffData: res,
            payWriteOffLoading: false,
          },
        });
      } else {
        dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: { payWriteOffLoading: false },
        });
      }
    });
  };

  /**
   * @name: 操作 - 查询风险信息
   */
  handleOtherRiskTips = async () => {
    const { resaleRequestDetail, dispatch } = this.props;
    const { vendorCompanyNum, requestNum } = resaleRequestDetail.headerData.costPaymentRequest;
    dispatch({
      type: 'resaleRequestDetail/handleSetState',
      payload: { otherRiskTipsLoading: true },
    });
    const res = await getOtherRiskTips({
      ebsCode: vendorCompanyNum,
      applicationNumber: requestNum,
    });
    if (res) {
      dispatch({
        type: 'resaleRequestDetail/handleSetState',
        payload: {
          otherRiskTipsLoading: false,
          riskStatus: res.riskStatus,
          paymentRiskStatus: res.paymentRiskStatus,
          checkStatus: res.checkStatus,
        },
      });
    } else {
      dispatch({
        type: 'resaleRequestDetail/handleSetState',
        payload: { otherRiskTipsLoading: false },
      });
    }
  };

  /**
   * @name: 方法 - 操作按钮
   */
  getApprovalBtn = () => {
    const {
      approvalRequestButtonVOList = [],
      isEn,
      costRequestId,
      fileDownloadLoading,
      exportPdfLoading,
      viewOnly,
      updateRiskCheckLoading,
      financialViewPermission,
      withdrawLoading,
      createFlag,
    } = this.props.resaleRequestDetail;
    // 操作按钮
    const operateBtn = approvalRequestButtonVOList?.filter(
      (item) => !['LookView', 'LookApproval'].includes(item.buttonKey)
    );
    // 合并 流程图，流程状态按钮
    const lookButton =
      approvalRequestButtonVOList
        ?.filter((item) => ['LookView', 'LookApproval'].includes(item.buttonKey))
        .map((item) => ({
          key: item.buttonKey,
          label: isEn ? item.nameE : item.name,
        })) || [];
    // 添加保存按钮
    if (this.showBtnFlag('saveName') || createFlag) {
      operateBtn.push({
        nameE: intl.get('hzero.common.button.save').d('保存'),
        name: intl.get('hzero.common.button.save').d('保存'),
        buttonOrder: 3.5,
        buttonKey: 'saveName',
      });
    }

    return (
      <>
        {operateBtn
          ?.sort((one, two) => {
            return one.buttonOrder - two.buttonOrder;
          })
          .map((item, index) => {
            return (
              <CusButton
                key={item.buttonKey}
                type={index === 0 ? 'primary' : 'normal'}
                onClick={() => this.approvalButtonClick(item)}
              >
                {isEn ? item.nameE : item.name}
              </CusButton>
            );
          })}
        {this.showBtnFlag('withdraw') && (
          <CusButton onClick={this.handleWithdraw} loading={withdrawLoading}>
            {intl.get('spcm.paymentRequest.button.withdraw').d('撤回')}
          </CusButton>
        )}
        {this.showBtnFlag('returnToSupplier') && (
          <CusButton onClick={() => this.setState({ returnToSupplierModalVisible: true })}>
            {intl.get('spcm.paymentRequest.button.returnToSupplier').d('退回供应商')}
          </CusButton>
        )}
        <CusButton onClick={() => this.setState({ financialAuditModalVisible: true })}>
          {intl.get('spcm.paymentRequest.button.financialAudit').d('财务审核说明')}
        </CusButton>
        {!viewOnly && !createFlag && (
          <CusButton loading={updateRiskCheckLoading} onClick={this.updateRiskCheck}>
            {intl.get('srsp.riskmanagement.Risk.UpdateRisk').d('更新收付风险')}
          </CusButton>
        )}
        {financialViewPermission && (
          <CusButton onClick={this.handleToContractCenter}>
            {intl.get('spcm.paymentRequest.view.button.financialView').d('财务视图')}
          </CusButton>
        )}
        {!createFlag && (
          <>
            <CusExcelExport
              requestUrl={`${getService('SPUC')}/resale-payment-requests/resalePaymentExport`}
              queryParams={{ costRequestId }}
            />
            <CusButton loading={fileDownloadLoading} onClick={this.handleFileBatchDownload}>
              {intl.get(`spcm.paymentRequest.button.fileDownload`).d('附件下载')}
            </CusButton>
            <CusButton loading={exportPdfLoading} onClick={this.handleExportPdf}>
              {intl.get('spcm.paymentRequest.button.exportPdf').d('下载PDF')}
            </CusButton>
          </>
        )}
        {lookButton.length === 2 && (
          <Dropdown
            menu={{
              items: lookButton,
              onClick: ({ key }) => {
                const buttonData = approvalRequestButtonVOList.find((b) => b.buttonKey === key);
                this.approvalButtonClick(buttonData);
              },
            }}
          >
            <Button
              className="customize-button-normal"
              style={{ padding: '0 8px', minWidth: '44px' }}
            >
              {intl.get(`spcm.paymentRequest.view.button.processDetail`).d('流程明细')}
              <img style={{ marginTop: '2px', marginLeft: '8px' }} src={ellipsis} alt="ellipsis" />
            </Button>
          </Dropdown>
        )}
      </>
    );
  };

  /**
   * @name: 方法 - 按钮显示控制标识
   * @param {string} buttonKey 按钮key
   */
  showBtnFlag = (buttonKey) => {
    const {
      viewOnly,
      isOperator,
      headerData,
      approvalReqRecVOList,
      currentNodeName,
      hasSubmitButton,
    } = this.props.resaleRequestDetail;
    const { requestStatus, draftUserId, supplierStatus, sourceCode } =
      headerData?.costPaymentRequest || {};
    if (buttonKey === 'saveName') {
      // 保存
      if (
        !viewOnly &&
        ((isOperator &&
          hasSubmitButton &&
          ['DRAFT', 'PENDING_MODIFY', 'REVOKE', 'PENDING_REVIEW', 'TRANSPORTING'].includes(
            requestStatus
          )) ||
          (!draftUserId
            ? ['DRAFT'].includes(requestStatus) &&
              ['EXTERNAL_SUBMIT', 'EXTERNAL_REFUSE'].includes(supplierStatus) &&
              sourceCode === 'ISP' &&
              approvalReqRecVOList.length === 0
            : ['DRAFT'].includes(requestStatus) &&
              ['EXTERNAL_SUBMIT', 'EXTERNAL_REFUSE'].includes(supplierStatus) &&
              sourceCode === 'ISP' &&
              approvalReqRecVOList.length === 0 &&
              currentUser.id === draftUserId) ||
          (['PAYING'].includes(requestStatus) && currentNodeName.includes('起草人银行修改')))
      ) {
        return true;
      }
    }
    if (buttonKey === 'withdraw') {
      // 撤回
      if (
        !viewOnly &&
        ['DRAFT'].includes(requestStatus) &&
        ['EXTERNAL_REJECT'].includes(supplierStatus) &&
        sourceCode === 'ISP' &&
        (!draftUserId
          ? approvalReqRecVOList.length === 0 ||
            (approvalReqRecVOList.length === 1 && currentNodeName === '01 起草')
          : (approvalReqRecVOList.length === 0 ||
              (approvalReqRecVOList.length === 1 && currentNodeName === '01 起草')) &&
            currentUser.id === draftUserId)
      ) {
        return true;
      }
    }
    if (buttonKey === 'returnToSupplier') {
      // 退回供应商
      if (
        !viewOnly &&
        ['DRAFT'].includes(requestStatus) &&
        ['EXTERNAL_SUBMIT', 'EXTERNAL_REFUSE'].includes(supplierStatus) &&
        sourceCode === 'ISP' &&
        (!draftUserId
          ? approvalReqRecVOList.length === 0 ||
            (approvalReqRecVOList.length === 1 && currentNodeName === '01 起草')
          : (approvalReqRecVOList.length === 0 ||
              (approvalReqRecVOList.length === 1 && currentNodeName === '01 起草')) &&
            currentUser.id === draftUserId)
      ) {
        return true;
      }
    }
    return false;
  };

  /**
   * @name: 操作 - 底部按钮点击事件
   * @param {object} record 按钮数据集
   */
  approvalButtonClick = async (record) => {
    const { dispatch, resaleRequestDetail } = this.props;
    const { buttonKey, isImportEbs } = record;
    const { requestStatus } = resaleRequestDetail?.headerData?.costPaymentRequest || {};
    await dispatch({
      type: 'resaleRequestDetail/handleSetState',
      payload: { optionButtonKey: buttonKey, optionButtonData: record },
    });
    if (buttonKey === 'saveName') {
      // 保存单据
      this.handleSave(true);
    } else if (buttonKey === 'urge') {
      // 催办单据
      this.handleUrge(record);
    } else if (buttonKey === 'submitMaterial') {
      // 补充材料
      this.handelSubmitMaterial();
    } else if (buttonKey === 'submitBankBack') {
      // 银行退回
      this.handleSubmitBankBack();
    } else if (
      ['submitName', 'takingopinionsName'].includes(buttonKey) &&
      (['DRAFT', 'PENDING_REVIEW', 'PENDING_MODIFY', 'REVOKE', 'TRANSPORTING', 'PAYING'].includes(
        requestStatus
      ) ||
        isImportEbs)
    ) {
      // 提交单据
    } else {
      // 打开mip弹框
      const { openModal } = this.cusApprovalBtns?.current;
      openModal(record);
    }
  };

  /**
   * @name: 操作 - 批量下载附件
   */
  handleFileBatchDownload = async () => {
    const { dispatch, resaleRequestDetail } = this.props;
    const { costRequestId } = this.state;
    const { requestNum } = resaleRequestDetail?.headerData?.costPaymentRequest;
    dispatch({
      type: 'resaleRequestDetail/handleSetState',
      payload: { fileDownloadLoading: true },
    });
    const res = await batchDownLoadFiles(costRequestId);
    if (res) {
      await batchDownloadFileReform(
        res.batchFileList,
        res.ccmFileIdList,
        `${requestNum}-${intl
          .get(`spcm.paymentRequest.button.fileDownload`)
          .d('附件下载')}-${moment(new Date()).format('YYYYMMDD')}`
      );
    }
    dispatch({
      type: 'resaleRequestDetail/handleSetState',
      payload: { fileDownloadLoading: false },
    });
  };

  /**
   * @name: 操作 - 下载PDF
   */
  handleExportPdf = async () => {
    const { dispatch, resaleRequestDetail } = this.props;
    const { costRequestId } = this.state;
    const { requestNum } = resaleRequestDetail?.headerData?.costPaymentRequest;
    dispatch({
      type: 'resaleRequestDetail/handleSetState',
      payload: { exportPdfLoading: true },
    });
    const res = await downLoadPdf(costRequestId);
    dispatch({
      type: 'resaleRequestDetail/handleSetState',
      payload: { exportPdfLoading: false },
    });
    if (res) {
      const blob = new Blob([res], {
        type: 'application/pdf',
      });
      if ('msSaveOrOpenBlob' in navigator) {
        // 使用ie下载
        navigator.msSaveOrOpenBlob(blob, `${requestNum}.pdf`);
        return false;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = requestNum;
      a.click();
      a.remove();
    }
  };

  /**
   * @name: 操作 - 更新风险校验
   */
  updateRiskCheck = async () => {
    const { dispatch, resaleRequestDetail } = this.props;
    const { costRequestId } = this.state;
    const { bdDataSource, isEn, lovData, approvalReqRecVOList } = resaleRequestDetail;
    const { requestNum, vendorCompanyNum } = resaleRequestDetail?.headerData?.costPaymentRequest;
    dispatch({
      type: 'resaleRequestDetail/handleSetState',
      payload: { updateRiskCheckLoading: true },
    });
    const businessInfoData = bdDataSource.map((list) => ({
      billId: list.serviceStartDate, // 发票开始日期
      businessType: list.serviceEndDate, // 发票结束日期
      customerOrderId: list.poHeaders.circuitNumber, // 发票编号(客户电路编号)
    }));
    let approvalNode = '';
    if (isEn) {
      approvalNode = lovData.RS_IP_APPROVAL_NODE.filter((item) => {
        return (
          last(approvalReqRecVOList).currentNodeName.includes(item.meaning) && item.tag !== 'C'
        );
      })[0].value;
    } else {
      approvalNode = last(approvalReqRecVOList).currentNodeName;
    }
    const res = await updateRiskTips({
      staffNo: costRequestId,
      applicationNumber: requestNum, // 申请编号
      businessInfo: businessInfoData, // 入参信息
      supplierNum: vendorCompanyNum, // 供应商编号
      approvalNode,
    });
    if (res) {
      this.handleOtherRiskTips();
      CusNotification.success({
        message: intl
          .get(`srsp.riskmanagement.Risk.RISKTip`)
          .d('风险校验完成，请刷新页面查看最新风险提示'),
      });
    }
    dispatch({
      type: 'resaleRequestDetail/handleSetState',
      payload: { updateRiskCheckLoading: false },
    });
  };

  /**
   * @name: 操作 - 跳转财务视图页面
   */
  handleToContractCenter = () => {
    const { CCM_HOST } = process.env;
    const { resaleRequestDetail } = this.props;
    const { requestNum } = resaleRequestDetail.headerData.costPaymentRequest;
    window.open(`${CCM_HOST}/resaleView?requestNum=${requestNum}`, '_black');
  };

  /**
   * @name: 操作 - 撤回操作
   */
  handleWithdraw = async () => {
    const { dispatch } = this.props;
    const { costRequestId } = this.state;
    dispatch({
      type: 'resaleRequestDetail/handleSetState',
      payload: { withdrawLoading: true },
    });
    const res = await detailWithdraw(costRequestId);
    dispatch({
      type: 'resaleRequestDetail/handleSetState',
      payload: { withdrawLoading: false },
    });
    if (res) {
      CusNotification.success();
      this.handleSearchInfo();
      this.handleWorkFlow(1);
    }
  };

  /**
   * @name: 操作 - 退回供应商
   */
  handleReturnToSupplier = async () => {
    const { dispatch, resaleRequestDetail } = this.props;
    const { returnToSupplierForm } = resaleRequestDetail;
    const { costRequestId } = this.state;
    const { validateFields } = returnToSupplierForm.current;
    const data = await validateFields();
    if (data) {
      dispatch({
        type: 'resaleRequestDetail/handleSetState',
        payload: { returnToSupplierLoading: true },
      });
      const res = await returnToSupplier({ ...data, costRequestId });
      dispatch({
        type: 'resaleRequestDetail/handleSetState',
        payload: { returnToSupplierLoading: false },
      });
      if (res) {
        this.setState({ returnToSupplierModalVisible: false });
        CusNotification.success();
        this.handleSearchInfo();
        this.handleWorkFlow(1);
      }
    }
  };

  /**
   * @name: 操作 - 催办单据
   */
  handleUrge = () => {
    const { lovData, approvalRequestHeaderVO } = this.props.resaleRequestDetail;
    const { costRequestId } = this.state;
    const formLink = lovData['SPFM.URGE.FORMLINK'].find(
      (item) => item.value === 'RESALE_PAYMENT'
    ).tag;
    const formLinkApp = lovData['SPFM.URGE.FORMLINK'].find(
      (item) => item.value === 'formLinkApp'
    ).tag;
    _DIC_COMMON_JS_
      .showUrgeDialog({
        formLinkApp: `${formLinkApp}${approvalRequestHeaderVO.sourceRequestId}`,
        formLinkPc: `${formLink}${costRequestId}?requestid=${approvalRequestHeaderVO.sourceRequestId}&workflowtype=SCM_ZCFKSQ&open=fs`,
      })
      .then((res) => {
        // 回调
        console.log(res);
      });
  };

  /**
   * @name: 操作 - 补充材料
   */
  handelSubmitMaterial = async () => {
    const { dispatch } = this.props;
    const { costRequestId } = this.state;
    const res = await submitMaterial(costRequestId);
    if (res) {
      if (res.repeatFlag === 'Y') {
        await dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: { submitErrorMessage: res.repeatMsg },
        });
        this.handleScrollTop();
      } else {
        this.setState({ optionButtonModalVisible: true });
      }
    }
  };

  /**
   * @name: 方法 - 滚动条移动到页面最上方
   */
  handleScrollTop = () => {
    const node = document.querySelector('.page-container');
    if (node.scrollTo) {
      node.scrollTo(0, 0);
    } else {
      node.scrollTop = 0;
    }
  };

  /**
   * @name: 操作 - 银行退回
   */
  handleSubmitBankBack = async () => {
    const { dispatch } = this.props;
    const { costRequestId } = this.state;
    const res = await checkAllowReturnBank(costRequestId);
    if (res) {
      if (res.returnFlag === 'N') {
        await dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: { submitErrorMessage: [res.checkMsg] },
        });
        this.handleScrollTop();
      } else {
        this.setState({ optionButtonModalVisible: true });
      }
    }
  };

  /**
   * @name: 处理 mip 弹框确定按钮回调
   */
  handleReceiveMipOK = () => {
    const { approvalRequestHeaderVO, optionButtonKey } = this.props.resaleRequestDetail;
    const { currentNodeName } = approvalRequestHeaderVO;

    if (optionButtonKey === 'submitName' && currentNodeName === '11 财务第一复核人审批') {
      this.pollingWorkFLowDetail('12 财务第二复核人审批');
      return false;
    }
    this.getDataSetDetail(false);
    // 财务复核第一 第二阶段 提交审批后不关闭窗口
    if (
      currentNodeName &&
      currentNodeName.slice(0, 2) !== '11' &&
      currentNodeName.slice(0, 2) !== '12'
    ) {
      window.close();
    }
    // 飞书提交审批后关闭tag页
    // closeWindow();
  };

  /**
   * @name: 详情查询
   * @param {boolean} flag 是否进行审批流轮询
   */
  getDataSetDetail = (flag = false) => {
    const { dispatch } = this.props;
    let num = 5;
    if (flag) {
      dispatch({
        type: 'resaleRequestDetail/handleSetState',
        payload: { costRequestLoading: true },
      });
      this.timer = setInterval(() => {
        this.handleWorkFlow(1);
        num -= 1;
        if (num <= 0) {
          dispatch({
            type: 'resaleRequestDetail/handleSetState',
            payload: { costRequestLoading: false },
          });
          clearInterval(this.timer);
        }
      }, 1000);
    } else {
      this.handleWorkFlow(1);
    }
    this.handleRefreshData();
  };

  /**
   * @name:
   */
  /**
   * @name: 操作 - 保存
   * @param {boolean} flag 是否保存后执行后续操作 - 标识
   */
  handleSave = async (flag = false) => {
    const { dispatch, resaleRequestDetail } = this.props;
    const { infoForm, headerData, isPub, open, createFlag } = resaleRequestDetail;
    const { getFieldValue } = infoForm.current;
    const formData = getFieldValue();
    const submitData = {
      ...headerData,
      costAttachFileList: [], // TODO
      resaleDetailInvoiceList: [], // TODO
    };
    submitData.costPaymentRequest = {
      ...formData,
      expectPaymentDate: formData.expectPaymentDate
        ? dayjs(formData.expectPaymentDate).format(`YYYY-MM--DD HH:mm:ss`)
        : undefined,
      _status: createFlag ? 'create' : 'update',
      AttachmentList: [], // TODO
      otherAttachmentList: [], // TODO
      paymentBankInfo: [], // TODO
      resaleDetailInvoiceList: [], // TODO
      supplyAttachmentList: [], // TODO
    };
    dispatch({
      type: 'resaleRequestDetail/handleSetState',
      payload: { actionSaveLoading: true },
    });
    const res = await actionSave(submitData);
    dispatch({
      type: 'resaleRequestDetail/handleSetState',
      payload: { actionSaveLoading: false },
    });
    if (res && flag) {
      CusNotification.success();
      if (createFlag) {
        const costRequestId = res.costPaymentRequest.costRequestId;
        dispatch(
          routerRedux.push({
            pathname: `${isPub ? '/pub' : ''}/spcm/payment-request-resale/detail/${costRequestId}`, // TODO 修改路由
            state: { newFlag: true },
            search: `${open ? '?open=fs' : ''}`,
          })
        );
      } else {
        this.handleRefreshData();
      }
    }
    if (res) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * @name: 操作 - 查看风险明细
   */
  goAccruedRisk = () => {
    const { isPub, headerData, bdDataSource } = this.props.resaleRequestDetail;
    const { requestNum, companyOrgName, vendorCompanyNum } = headerData.costPaymentRequest;
    const circuitIds = [];
    bdDataSource.forEach((item) => {
      circuitIds.push(item.poHeaders.circuitNumber);
    });
    localStorage.setItem(
      'resaleDetailInfo',
      JSON.stringify({
        ebsCode: vendorCompanyNum, // 供应商编号
        circuitIds, // 线路号
        companyEntityName: companyOrgName, // 公司主体
      })
    );
    window.open(
      `${isPub ? '/pub' : ''}/scpc/payment-center/AccruedRiskDetailed/${requestNum}`,
      '_blank'
    );
  };

  /**
   * @name: 操作 - 查询审批提醒
   */
  queryApprovalRemind = () => {
    const { resaleRequestDetail, dispatch } = this.props;
    const { costRequestId } = this.state;
    const { currentNodeName, infoForm } = resaleRequestDetail;
    const transferOrderFlag = infoForm.current.getFieldValue('transferOrderFlag');
    // “是否转网订单”为“是” 且 “当前节点”为“GM”或“DM”，触发校验并弹出提醒弹框；
    if (transferOrderFlag === 'Y' && (/DM/.test(currentNodeName) || /GM/.test(currentNodeName))) {
      CusModal.warning({
        content: intl.get(`spcm.paymentRequest.view.info.transferOrder`).d('此付款申请为转网订单'),
      });
    } else if (currentNodeName.startsWith('02') || currentNodeName.startsWith('03')) {
      paymentApprovalRemindValidate({
        costRequestId,
        // 【硬编码】这和写死常量没有区别，若节点描述变更了会有越界的风险，建议换成includes判断；
        approvalNode: currentNodeName.slice(3, 5),
      }).then((res) => {
        if (res) {
          const { remindDetailDTOList = [], haveApprovalRemind } = res;
          dispatch({
            type: 'resaleRequestDetail/handleSetState',
            payload: { approvalRemind: res },
          });
          if (haveApprovalRemind === 'Y') {
            const checkRule = remindDetailDTOList.map((item, index) => (
              <div
                style={{
                  display: 'flex',
                  padding: '0 16px',
                  height: 34,
                  alignItems: 'center',
                  borderBottom:
                    index === remindDetailDTOList.length - 1
                      ? null
                      : '0.01rem solid rgba(0, 0, 0, 0.2)',
                  background: index % 2 === 0 ? '#f5f6f7' : '#fff',
                  borderRadius:
                    index === 0
                      ? '4px 4px 0 0'
                      : index === remindDetailDTOList.length - 1
                      ? '0 0 4px 4px '
                      : 0,
                }}
              >
                <div style={{ width: '90%' }}>
                  {index + 1}. {item.checkMeaning}
                </div>
                <div
                  style={{
                    width: '10%',
                    color: item.checkResult === 'Y' ? '#f54a45' : '#333',
                    textAlign: 'right',
                  }}
                >
                  {item.checkResultMeaning}
                </div>
              </div>
            ));
            dispatch({
              type: 'resaleRequestDetail/handleSetState',
              payload: {
                approvalRemindModalVisible: true,
                approvalRemindModalContent: (
                  <div style={{ borderRadius: 4, border: '0.01rem solid rgba(0, 0, 0, 0.2)' }}>
                    {checkRule}
                  </div>
                ),
              },
            });
          }
        }
      });
    }
  };

  /**
   * @name: 操作 - 查询补充附件
   */
  handleSupplyAttachment = (page = {}) => {
    const { dispatch } = this.props;
    const { costRequestId } = this.state;
    dispatch({
      type: 'resaleRequestDetail/handleSetState',
      payload: { supplyAttachmentLoading: true },
    });
    querySupplyAttachment({ costRequestId, page: page.current - 1, size: page.pageSize }).then(
      (res) => {
        if (res) {
          dispatch({
            type: 'resaleRequestDetail/handleSetState',
            payload: {
              supplyAttachmentSource: res.content.map((list) => ({ ...list, _status: 'update' })),
              supplyAttachmentPagination: createPagination(res),
            },
          });
        }
        dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: { supplyAttachmentLoading: false },
        });
      }
    );
  };

  render() {
    const { resaleRequestDetail, loading, dispatch } = this.props;
    const {
      activeKey,
      costRequestId,
      financialAuditModalVisible,
      returnToSupplierModalVisible,
      optionButtonModalVisible,
    } = this.state;
    const {
      approvalReqRecVOList,
      returnToSupplierLoading,
      headerData,
      submitErrorMessage,
      optionButtonData,
      isEn,
      productTypeModalVisible,
      approvalRemindModalVisible,
      approvalRemindModalContent,
      approvalRemind,
      otherAttachmentSource,
      attachmentSource,
      editable,
      currentNodeName,
      isOperator,
      viewOnly,
      hasSubmitButton,
    } = resaleRequestDetail;
    const { pressLevel } = headerData?.costPaymentRequest || {};
    const createFlag = !costRequestId;
    return (
      <>
        <PageWrapper
          loading={loading.includes(true)}
          requiredColor
          pageTop={
            <>
              {submitErrorMessage && <PageErrorMessage message={submitErrorMessage} />}
              {!createFlag && <StepPanel pressLevel={pressLevel} requestId={costRequestId} />}
            </>
          }
        >
          <Collapse
            className="customize-collapse"
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => this.setState({ activeKey: collapseKeys })}
          >
            <Panel
              key="info"
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`spcm.paymentRequest.view.basic.info.title`).d('基本信息')}
                  arrowActive={activeKey.includes('info')}
                />
              }
            >
              <InfoPanel
                createFlag={createFlag}
                changeCurrencyCode={this.changeCurrencyCode}
                changeCompanyName={this.changeCompanyName}
                handleBank={this.handleBank}
                goAccruedRisk={this.goAccruedRisk}
              />
            </Panel>
            <Panel
              key="payment-detail"
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`spcm.paymentRequest.view.payment.info.title`).d('付款明细')}
                  arrowActive={activeKey.includes('payment-detail')}
                />
              }
            >
              <PaymentDetailPanel handleSave={this.handleSave} />
            </Panel>
            {!createFlag && (
              <Panel
                key="bank"
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`spcm.paymentRequest.view.bankInfo.info.title`).d('银行信息')}
                    arrowActive={activeKey.includes('bank')}
                  />
                }
              >
                <BankPanel createFlag={createFlag} />
              </Panel>
            )}
            <Panel
              key="attachment"
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`spcm.paymentRequest.view.attachment.info.title`).d('附件上传')}
                  arrowActive={activeKey.includes('attachment')}
                />
              }
            >
              <AttachmentPanel
                handleSupplyAttachment={this.handleSupplyAttachment}
                dataSource={otherAttachmentSource}
                editFlag={
                  hasSubmitButton &&
                  (editable || currentNodeName.includes('起草人补充')) &&
                  isOperator &&
                  !viewOnly
                }
                isOtherFile
              />
              <div style={{ marginBottom: 16 }} />
              <AttachmentPanel
                handleSupplyAttachment={this.handleSupplyAttachment}
                dataSource={attachmentSource}
                isOtherFile={false}
              />
            </Panel>
            <Panel
              key="supplementAttachment"
              showArrow={false}
              header={
                <PanelHeader
                  title={intl
                    .get(`spcm.paymentRequest.view.supllyAttachment.info.title`)
                    .d('补充附件')}
                  arrowActive={activeKey.includes('supplementAttachment')}
                />
              }
            >
              <SupplyAttachment handleSupplyAttachment={this.handleSupplyAttachment} />
            </Panel>

            {approvalReqRecVOList.length > 0 && (
              <Panel
                key="approvalHistory"
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`spcm.paymentRequest.view.approval.info.title`).d('审批历史')}
                    arrowActive={activeKey.includes('approvalHistory')}
                  />
                }
              >
                <ApprovalHistory />
              </Panel>
            )}
          </Collapse>
        </PageWrapper>

        {/* 操作按钮 - 面板 */}
        <CusApprovalButtons
          ref={this.cusApprovalBtns}
          onOk={this.handleReceiveMipOK}
          onClose={() => this.getDataSetDetail(false)}
          onModalCancel={this.handleRefreshData}
          isCloseModal={false}
        >
          {this.getApprovalBtn()}
        </CusApprovalButtons>

        {/* 财务审核说明 - 弹框 */}
        <CusModal
          visible={financialAuditModalVisible}
          width={800}
          destroyOnClose
          onCancel={() => this.setState({ financialAuditModalVisible: false })}
          cancelText={intl.get('hzero.common.button.close').d('关闭')}
        >
          <FinancialAuditModal />
        </CusModal>

        {/* 供应商退回 - 弹框 */}
        <CusModal
          title={intl.get('spcm.paymentRequest.button.returnToSupplier').d('退回供应商')}
          visible={returnToSupplierModalVisible}
          width={600}
          destroyOnClose
          onCancel={() => this.setState({ returnToSupplierModalVisible: false })}
          confirmLoading={returnToSupplierLoading}
          onOk={this.handleReturnToSupplier}
        >
          <ReturnToSupplierModal />
        </CusModal>

        {/* 操作按钮弹框 - 弹框 */}
        <CusModal
          title={isEn ? optionButtonData.nameE : optionButtonData.name}
          visible={optionButtonModalVisible}
          style={{
            width: Number(optionButtonData.width) + 50,
            height: Number(optionButtonData.height) + 100,
          }}
          destroyOnClose
          onCancel={() => this.setState({ optionButtonModalVisible: false })}
          cancelText={intl.get('hzero.common.button.close').d('关闭')}
        >
          <iframe
            title="urlContent"
            src={optionButtonModalVisible.url}
            frameBorder="0"
            style={{
              width: `${optionButtonModalVisible.width}px`,
              height: `${optionButtonModalVisible.height}px`,
            }}
            marginWidth="1"
            marginHeight="1"
          />
        </CusModal>

        {/* 审批提示 - 弹框 */}
        <CusModal
          title={intl.get(`spcm.paymentRequest.view.detail.approvalRemind`).d('审批提示')}
          visible={approvalRemindModalVisible}
          width={600}
          destroyOnClose
          onOk={() =>
            dispatch({
              type: 'resaleRequestDetail/handleSetState',
              payload: { approvalRemindModalVisible: false },
            })
          }
        >
          <div style={{ marginBottom: 16 }}>
            {intl.get(`spcm.paymentRequest.view.info.checkDate`).d('校验时间')}：
            {approvalRemind.checkDate}
          </div>
          {approvalRemindModalContent}
        </CusModal>

        {/* 查看产品类型 - 弹框 */}
        <CusModal
          title={intl.get('spcm.paymentRequest.view.productType').d('查看业务类型')}
          visible={productTypeModalVisible}
          width={800}
          destroyOnClose
          onCancel={() =>
            dispatch({
              type: 'resaleRequestDetail/handleSetState',
              payload: { productTypeModalVisible: false },
            })
          }
          cancelText={intl.get('hzero.common.button.close').d('关闭')}
        >
          <ProductTypeModal />
        </CusModal>
      </>
    );
  }
}
