import React, { Component } from 'react';
import {
  Collapse,
  Row,
  Col,
  LocaleProvider,
  Avatar,
  Spin,
  Modal as Modal1,
  Button,
} from 'hzero-ui';
// eslint-disable-next-line camelcase
import formatterCollections from 'utils/intl/formatterCollections';
import { routerRedux } from 'dva/router';
import { queryMapIdpValue } from 'services/api';
import { sum, isEmpty, last } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import { observer } from 'mobx-react';
import queryString from 'querystring';
import moment from 'moment';
import intl from 'utils/intl';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import { numberRender, dateRender } from 'utils/renderer';
import {
  getCurrentOrganizationId,
  getCurrentUser,
  getResponse,
  getCurrentLanguage,
} from 'utils/utils';
import request from 'utils/request';
import { SRM_SPUC, SRM_PLATFORM, SRM_SPCM } from '_utils/config';
import { SRM_SPCM_RISK } from '@/common/config';
import {
  Form,
  DataSet,
  Lov,
  TextField,
  TextArea,
  Select,
  NumberField,
  Modal,
  Tooltip,
  Output,
  DatePicker,
  CheckBox,
} from 'choerodon-ui/pro';
import { Tag, Icon } from 'choerodon-ui';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import uuidv4 from 'uuid/v4';
import { Header, Content } from 'components/Page';
import { queryIdpValue } from 'services/api';
import ExcelExport from '@/components/ExcelExport';
import { queryEmployeeFlag } from '@/services/contractStatementService';
// import notification from 'utils/notification';
import detailInfo from './dataset/detailInfoDS';
import InvoiceTable from './components/InvoiceTable';
import invoiceInfo from './dataset/invoiceTableDS';
import invoiceLine from './dataset/invoiceLineDS';
import InvoiceLines from './components/InvoiceLines';
import attachmentTable from './dataset/attachmentTableDS';
import otherAttachmentTable from './dataset/otherAttachmentTableDS';
import AttachmentTable from './components/AttachmentTable';
import supplyAttachment from './dataset/supplyAttachmentDS';
import SupplyAttachment from './components/SupplyAttachment';
import IbossApproval from './components/IbossApproval';
import BankInfo from './components/BankInfo';
import bankInfo from './dataset/bankInfoDS';
import ApprovalList from './components/ApprovalList';
import TabWriteOffDetail from './components/TabWriteOffDetail';
import styles from './index.less';
import { getStringBytes, interceptString } from './utils';
import ProductTypeModal from './components/ProductTypeModal/index';
import ReturnToSupplier from './components/ReturnToSupplier';
import FinancialAudit from './components/FinancialAudit';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import { fastCodeLoader } from '@/utils/decorators';
import CusStep from './components/CusStep';
import CusNotification from '_cus_components/CusNotification';
import { batchDownloadFileReform } from '@/common/utils';
import { closeWindow } from '_cus_utils/utils';

const organizationId = getCurrentOrganizationId();
const currentUser = getCurrentUser();
const currentLanguage = getCurrentLanguage();
const { Option } = Select;

// const SRM_SPCM_RISK = '/hptc-risk-wnn';

const REQUEST_TITLE_MAX_LENGTH = 170;
const REQUEST_REMARKS_MAX_LENGTH = 770;

async function exportPdf(costRequestId) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/resale-payment-requests/export-pdf/${costRequestId}`,
    {
      method: 'GET',
      responseType: 'blob',
    }
  );
}

async function fetchGeneralRequestResult(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/approval-requests/detail/targetHeaderAll`, {
    method: 'POST',
    body: params,
  });
}

async function submitPreCheck(costRequestId, currentNodeName) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/resale-payment-requests/submit-pre-check/${costRequestId}`,
    {
      method: 'GET',
      query: {
        currentNodeName,
      },
    }
  );
}

async function getButtonPermission() {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/cost-attach-files/payment-advice/button-permission`,
    {
      method: 'GET',
    }
  );
}

// 更换modalContainer的类名控制能否移动
function switchModalContainerClassName(flag) {
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
}

async function fetchPermission(params) {
  return request(`/spfm/v1/${organizationId}/pub-ctl-permissions/edit`, {
    method: 'POST',
    body: params,
  });
}

async function returnToSupplier(params) {
  const { costRequestId, rejectReason } = params;
  return request(`${SRM_SPUC}/v1/isp/${organizationId}/receive-payment/reject/${costRequestId}`, {
    method: 'GET',
    query: {
      rejectReason,
    },
  });
}

async function withdraw(costRequestId) {
  return request(
    `${SRM_SPUC}/v1/isp/${organizationId}/receive-payment/revoke-reject/${costRequestId}`,
    {
      method: 'GET',
    }
  );
}

async function queryIbossApproval(costRequestId) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/resale-payment-requests/query-iboss-business-approval/${costRequestId}`,
    {
      method: 'GET',
    }
  );
}

async function queryUserInfo(userId) {
  return request(`/hpfm/v1/${organizationId}/employee-users/employee`, {
    method: 'GET',
    query: {
      enabledFlag: 1,
      userId,
    },
  });
}

const prompt = 'spcm.paymentRequest';
@formatterCollections({
  code: [prompt, 'spcm.costPayment', 'srsp.riskmanagement'],
})
@fastCodeLoader([
  'SPUC.FIN_VIEW_USER',
  'SPFM.ICON_LINK_CONFIG',
  'RS_IP_ATTACHMENT_TYPE',
  'SPUC.PAYMENT_IBOSS_URL',
  'SPUC.PURCHASE_ORDER_LINE_STATUS',
  'SPCM.FINANCIAL_AUDIT_FILE',
  'SPCM.SIGNATURE.OPINION',
  'SPFM.URGE.FORMLINK',
  'SPUC.IBOSS_SO_URL',
  'SRSP.PAYMENT_COPY_PERSON',
  'RS_IP_APPROVAL_NODE',
  'SRSP.PAYMENT_INFORM_EXCLUDE_DEPARTMENT',
])
@observer
export default class CostPaymentRequestDetail extends Component {
  constructor(props) {
    super(props);
    const { match = {} } = this.props;
    const { params = {}, path } = match;
    const { id } = params;
    const detailInfoDS = new DataSet(
      detailInfo({
        costRequestId: id,
        onSaveSuccess: this.handleSaveSuccess,
        onSaveOrSubmitFaild: this.handleSaveOrSubmitFaild,
        onLoadSuccess: this.handleLoadSuccess,
        onUpdate: () => {
          this.setState({});
        },
      })
    );
    // 不触发校验
    detailInfoDS.validate = () => true;
    const invoiceInfoDS = new DataSet(
      invoiceInfo({
        onDeleteSuccess: this.handleDeleteLineSuccess,
        setLineAddAble: (flag) => {
          const { lineAddAble } = this.state;
          if (lineAddAble !== flag) {
            this.setState({
              lineAddAble: flag,
            });
          }
        },
      })
    );
    const invoiceLineDS = new DataSet(
      invoiceLine({
        costRequestId: id,
        onDeleteSuccess: this.handleDeleteLineSuccess,
        onQuery: () => {
          this.setState({
            lineLoading: true,
          });
        },
        onLoadSuccess: (res) => {
          this.setState({
            lineLoading: false,
            colorAnnotation: res.some((item) => {
              return ((item.resaleDetailLine || {}).poHeaders || {}).highLightFlag;
            }),
            resaleDetailLine: res.map((item) => {
              return item.resaleDetailLine;
            }),
          });
          this.getOtherRiskTips();
        },
      })
    );
    const attachmentTableDS = new DataSet(
      attachmentTable({
        onDeleteSuccess: this.handleDeleteLineSuccess,
      })
    );
    const otherAttachmentTableDS = new DataSet(
      otherAttachmentTable({
        onDeleteSuccess: this.handleDeleteLineSuccess,
      })
    );
    const supplyAttachmentDS = new DataSet(
      supplyAttachment({
        detailInfoDS,
      })
    );
    const bankInfoDS = new DataSet(
      bankInfo({
        costRequestId: id,
      })
    );
    invoiceInfoDS.bind(detailInfoDS, 'resaleDetailInvoiceList');
    attachmentTableDS.bind(detailInfoDS, 'AttachmentList');
    otherAttachmentTableDS.bind(detailInfoDS, 'otherAttachmentList');
    supplyAttachmentDS.bind(detailInfoDS, 'supplyAttachmentList');
    invoiceLineDS.bind(invoiceInfoDS, 'resaleDetailLineList');
    bankInfoDS.bind(detailInfoDS, 'paymentBankInfo');
    const isPub = this.props.location.pathname.includes('pub'); // 判断是否为pub页面
    const { open, workflowtype, newFlag } = queryString.parse(this.props.location.search.substr(1)); // 判断是否飞书打开

    this.state = {
      newFlag,
      open,
      isPub,
      detailInfoDS,
      invoiceInfoDS,
      invoiceLineDS,
      attachmentTableDS,
      otherAttachmentTableDS,
      supplyAttachmentDS,
      bankInfoDS,
      isCreate: id === 'create',
      lineAddAble: false,
      saving: false,
      submitting: false,
      costRequestLoading: false,
      costRequestId: id,
      activeKey: [
        'basicInfo',
        'bankInfo',
        'paymentDetail',
        'attachmentUpload',
        'supplyAttachment',
        'approvalList',
      ],
      approvalReqRecVOList: [],
      currentNodeName: '',
      operators: [],
      requestTitleLen: 0,
      requestRemarksLen: 0,
      workflowtype,
      errorMessage: undefined,
      viewOnly: path.includes('/spcm/payment-request-view/detail/:id'),
      viewButtonFlag: false, // 补充附件按钮控制权限
      fetchLoading: true,
      preChecking: false,
      lineLoading: false,
      hasSubmitButton: false, // 是否有提交审批按钮
      importFlag: false, // 导入标识
      riskWarning: '',
      otherRiskWarning: false,
      productType: undefined,
      productTypeModalVisible: false,
      returnToSupplierModalVisible: false,
      productTypeCodes: [],
      newNodeStep: {}, //最新节点
      riskStatus: 0, //是否有风险，有为1 ,没有为0
      checkStatus: 0, //是否进行过风险校验, 是为1, 否为0
      businessInfo: [], //更新风险校验入参信息
      resaleDetailLine: [], //账单明细数据
      switchRisk: 1, //风险提示值集开关  1/0 ——> 开/关
      paymentRiskStatus: 0, // 是否收款
      cmiEmployeeInfo: {}, // 员工信息
      paymentOwnerEditFlag: null,
      userEmployeeId: '', // 当前登录人工号
      requestDepartment: '',
    };
    if (id !== 'create') {
      detailInfoDS.query();
      this.getWriteOff();
    }
  }

  remarkDS = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'select',
        type: 'string',
        defaultValue: currentLanguage === 'en_US' ? 'Agree' : '同意',
      },
      {
        name: 'remark',
        type: 'string',
        defaultValue: currentLanguage === 'en_US' ? 'Agree' : '同意',
      },
    ],
  });

  @Bind()
  selectChange(value) {
    if (value !== '1') this.remarkDS.current.set('remark', value);
  }

  componentDidMount() {
    const { costRequestId, newFlag = false } = this.state;
    window.addEventListener('message', this.receiveMessage, false);
    this.workFlowDetailInfo(+costRequestId, !newFlag ? 1 : undefined);
    this.initPermission();
    this.fetchProductTypeCodes();
    this.loadIbossSoUrl();
    this.getWriteOff();
    this.getStepsData();
    this.getenumMap();
    this.fetchNodeStepCodes();
    this.fetchUserInfo();

    // 查询CMI员工编号
    request(`/hpfm/v1/lovs/sql/data`, {
      method: 'GET',
      query: {
        lovCode: 'HIAM.QUERY_CMI_EMPLOYEE_UM',
        loginName: currentUser.loginName,
      },
    }).then((res) => {
      if (getResponse(res)) {
        const cmiEmployeeInfo = (res?.content || [])[0];
        this.setState({ cmiEmployeeInfo });
      }
    });
  }

  componentDidUpdate() {
    this.changeHelpIcon();
  }

  /**
   * @name: 查询 - 用户信息
   */
  fetchUserInfo = async () => {
    const res = await queryUserInfo(currentUser.id);
    if (getResponse(res)) {
      this.setState({ userEmployeeId: res.employeeId });
    }
  };

  @Bind
  getIbossApproval() {
    const { costRequestId } = this.state;
    return new Promise((resolve, reject) => {
      queryIbossApproval(costRequestId).then((res) => {
        if (getResponse(res) && Array.isArray(res) && res.length > 0) {
          resolve(res.map((item) => ({ ...item, rowKey: uuidv4() })));
        } else {
          resolve(false);
        }
      });
    });
  }

  @Bind
  fetchNodeStepCodes() {
    const lovCode = 'RS_IP_APPROVAL_NODE';
    queryIdpValue(lovCode).then((res) => {
      if (getResponse(res)) {
        this.setState({
          nodeStepCodes: res,
        });
      }
    });
  }

  /**
   * 改变表单提示图标
   *
   * @memberof CostPaymentRequestDetail
   */
  changeHelpIcon() {
    const icons = document.querySelectorAll('.c7n-pro-field-wrapper .icon-help');
    icons.forEach((node) => {
      // eslint-disable-next-line no-param-reassign
      node.className = 'icon icon-error_outline';
      // eslint-disable-next-line no-param-reassign
      node.style.color = '#0085d0';
      // eslint-disable-next-line no-param-reassign
      node.style.fontWeight = 'bold';
    });
  }

  initPermission() {
    const { id, currentRoleId } = currentUser;
    fetchPermission({
      routePath: '/spcm/payment-request',
      userId: id,
      roleId: currentRoleId,
    }).then((res) => {
      if (getResponse(res)) {
        const { editFlag } = res;
        const { viewOnly } = this.state;
        this.setState({
          viewOnly: viewOnly || editFlag !== 'Y',
        });
      }
    });

    // 补充附件按钮权限
    getButtonPermission().then((res) => {
      if (getResponse(res)) {
        const { viewButtonFlag } = res;
        this.setState({
          viewButtonFlag: viewButtonFlag === 'Y',
        });
      }
    });
  }

  // 审批流监听
  @Bind
  receiveMessage(param) {
    const { costRequestId, currentNodeName } = this.state;
    const {
      data: { routerParam = {} },
    } = param;
    if (routerParam.opt === 'ok') {
      Modal.destroyAll();
      if (this.optionButtonKey === 'submitName' && currentNodeName === '05 财务第一复核人审批') {
        this.pollingWorkFLowDetail('06 财务第二复核人审批');
        return false;
      }
      // this.getDataSetDetail();
      // 停留在原单据页面，刷新页面
      if (
        [
          'forwardName',
          'HandleForwardName',
          'takingopinionsName',
          'isretractName',
          'givingopinionsName',
        ].includes(this.optionButtonKey)
      ) {
        this.workFlowDetailInfo(+costRequestId, 1);
      } else if (['DeleteBtn', 'submitName', 'rejectName'].includes(this.optionButtonKey)) {
        const { isPub, workflowtype } = this.state;
        // 是否待办打开
        if (workflowtype) {
          window.close();
        } else {
          const { history } = this.props;
          history.push(`${isPub ? '/pub' : ''}/spcm/payment-request/query`);
        }
      }

      // 飞书提交审批后关闭tag页
      closeWindow();
      switchModalContainerClassName();
    } else if (routerParam.opt === 'close') {
      Modal.destroyAll();
      switchModalContainerClassName();
    } else if (routerParam.opt === 'refresh') {
      Modal.destroyAll();
      switchModalContainerClassName();
      window.location.reload();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
    window.removeEventListener('message', this.receiveMessage);
    // 组件卸载时，取消倒计时
    clearInterval(this.requestInterval);
  }

  @Bind()
  handleSave(uncheckFlag) {
    const { detailInfoDS } = this.state;
    const { current } = detailInfoDS;
    if (!uncheckFlag && !current.dirty) {
      CusNotification.warning({
        message: intl
          .get(`spcm.paymentRequest.message.warning.unmodified.save`)
          .d('未对页面进行修改！'),
      });
      return;
    }
    if (!current.dirty) {
      current.set('validateFlag', uuidv4());
    }
    this.setState({
      saving: true,
    });
    detailInfoDS.submit().then((valid) => {
      if (valid && valid.success) {
        CusNotification.success();
      }
    });
    this.getWriteOff();
  }

  @Bind()
  handleSaveSuccess(resp) {
    const { history } = this.props;
    const {
      isCreate,
      detailInfoDS,
      isPub,
      open,
      lastApprovalFlag,
      importFlag = false,
    } = this.state;
    const { content = [] } = resp;
    const { costPaymentRequest = {} } = content[0];
    const { costRequestId } = costPaymentRequest;
    if (importFlag) {
      this.setState({
        importFlag: false,
      });
      return false;
    }
    if (!isCreate && !lastApprovalFlag) {
      detailInfoDS.query();
      this.workFlowDetailInfo(+costRequestId);
      this.getWriteOff();
    }
    if (content.length > 0) {
      if (costRequestId) {
        history.push({
          pathname: `${isPub ? '/pub' : ''}/spcm/payment-request/detail/${costRequestId}`,
          search: `${open ? '?open=fs' : ''}`,
        });
      }
    }
  }

  @Bind()
  handleSaveOrSubmitFaild(error) {
    CusNotification.warning({
      message: error.message,
    });
    this.setState({
      saving: false,
      submitting: false,
    });
  }

  @Bind()
  handleLoadSuccess(resp = {}) {
    const { costPaymentRequest = {}, paymentOwnerFlag, needAutoCopyPermissionFlag } = resp;
    const {
      requestStatus,
      supplierStatus,
      conversionRate,
      requestTitle,
      requestRemarks,
      paymentDate,
      productType,
      riskWarningMeaning,
      otherRiskWarning,
      otherRiskWarningMeaning,
      draftEmployeeId, // 起草人id
      draftUserId, // 起草人用户id
      requestEmployeeId, // 申请人id
      requestEmployeeNum, // 申请人编码
      signFlag, // 是否会签给申请人
      returnRequestId, // EBS request id
      requestNum, // 申请编号
      sourceCode, //来源
      chequePayFlag, // 是否发票支付
      vendorCompanyNum, //供应商编号
      companyOrgName, // 公司主体
      transferOrderFlag, // 是否转网订单
      requestDepartment,
    } = costPaymentRequest;
    this.setState({
      paymentOwnerFlag,
      needAutoCopyPermissionFlag: needAutoCopyPermissionFlag === 'Y',
      status: requestStatus,
      supplierStatus,
      paymentDate,
      conversionRate,
      lineAddAble: false,
      saving: false,
      submitting: false,
      requestTitleLen: getStringBytes(requestTitle),
      requestRemarksLen: getStringBytes(requestRemarks),
      fetchLoading: false,
      productType,
      riskWarning: riskWarningMeaning,
      otherRiskWarning: otherRiskWarningMeaning && otherRiskWarningMeaning != ';',
      otherRiskWarningMeaning: otherRiskWarningMeaning,
      signFlag,
      draftEmployeeId,
      draftUserId,
      requestEmployeeId,
      requestEmployeeNum,
      returnRequestId,
      requestNum,
      sourceCode,
      isCheckBankInfo: chequePayFlag === 'N',
      vendorCompanyNum,
      companyOrgName,
      transferOrderFlag,
      requestDepartment,
    });
  }

  @Bind()
  @Debounce(500, { leading: true })
  handleBatchImport() {
    const { location = {}, dispatch } = this.props;
    const { costRequestId, isPub, open, detailInfoDS } = this.state;
    const { pathname } = location;
    this.setState(
      {
        importFlag: true,
      },
      () => {
        detailInfoDS.submit().then(() => {
          dispatch(
            routerRedux.push({
              pathname: `${isPub ? '/pub' : ''}/spcm/payment-request/import`,
              state: {
                costRequestId,
                backPath: pathname,
              },
              search: `${open ? '?open=fs' : ''}`,
            })
          );
        });
      }
    );
  }

  @Bind()
  handleDeleteLineSuccess() {
    this.handleSave(true);
  }

  @Bind()
  handleCollapseChange(keys) {
    this.setState({
      activeKey: keys,
    });
  }

  @Bind()
  pollingWorkFLowDetail(nodeName) {
    if (this.polling) {
      return false;
    }
    this.setState({
      costRequestLoading: true,
    });
    this.polling = setInterval(() => {
      const { costRequestId } = this.state;
      fetchGeneralRequestResult({
        requestType: 'SCM_ZCFKSQ',
        targetHeaderId: costRequestId,
        tenantId: organizationId,
      }).then((res) => {
        if (getResponse(res)) {
          const { currentNodeName } = res.approvalRequestHeaderVO;
          if (currentNodeName === nodeName) {
            clearInterval(this.polling);
            this.polling = undefined;
            this.workFlowDetailInfo(+costRequestId, 1);
          }
        } else {
          this.setState({
            costRequestLoading: false,
          });
          clearInterval(this.polling);
          this.polling = undefined;
        }
      });
    }, 1000);
  }

  /**
   * 审批记录获取
   */
  @Bind
  workFlowDetailInfo(costRequestId, times = 30, nextTime = 0) {
    if (times <= 0) {
      clearTimeout(this.timeout);
      this.setState({
        costRequestLoading: false,
      });
      return;
    }
    this.setState({
      costRequestLoading: true,
    });
    this.timeout = setTimeout(() => {
      // 根据requestType去查询获得通用审批的数据内容，设置定时器，在结束上一个请求的2s之后再执行下一次的。
      fetchGeneralRequestResult({
        requestType: 'SCM_ZCFKSQ',
        targetHeaderId: costRequestId,
        tenantId: organizationId,
      }).then((res) => {
        if (
          res &&
          !res.failed &&
          res.approvalRequestHeaderVO &&
          Array.isArray(res.approvalReqRecVOList) &&
          res.approvalReqRecVOList.length > 0
        ) {
          const { currentNodeName, currentNodeId } = res.approvalRequestHeaderVO;
          // const { operator } = res.approvalReqRecVOList[res.approvalReqRecVOList.length - 1];
          const operators = res.approvalReqRecVOList
            .filter((item) => item.currentNodeId === currentNodeId)
            .map((item) => item.operator);
          const { approvalReqRecVOList = [] } = res;
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
          const approvalList = approvalReqRecVOList.filter((l) => {
            const prefix = l.currentNodeName && l.currentNodeName.substr(0, 2);
            if (prefix === '00') {
              return l.approvingOpinion && l.optionTypeName;
            } else if (prefix === '04') {
              return approvalList04.length === 0 ? true : l.operateDate || !l.approvingOpinion;
            } else if (prefix === '05') {
              return approvalList05.length === 0 ? true : l.operateDate || !l.approvingOpinion;
            } else if (prefix === '06') {
              return approvalList06.length === 0 ? true : l.operateDate || !l.approvingOpinion;
            } else {
              return true;
            }
          });
          const { approvalRequestButtonVOList = [] } = res;
          const hasSubmitButton =
            Array.isArray(approvalRequestButtonVOList) &&
            approvalRequestButtonVOList.some((button) => button.buttonKey === 'submitName');
          this.setState({
            costRequestLoading: false,
            currentNodeName,
            operators,
            approvalRequestHeaderVO: res.approvalRequestHeaderVO || {},
            approvalReqRecVOList: approvalList,
            approvalRequestButtonVOList,
            hasSubmitButton,
          });
          // DS.query()异步，queryApprovalRemind()需要获取明细数据，置于查询完成后回调触发。
          this.state.detailInfoDS.query().then(() => {
            this.getWriteOff();
            this.queryApprovalRemind();
          });
        } else {
          if (times === 1) {
            this.state.detailInfoDS.query();
            this.getWriteOff();
            this.setState({
              currentNodeName: '',
              operators: [],
              approvalRequestHeaderVO: {},
              approvalReqRecVOList: [],
              approvalRequestButtonVOList: [],
              hasSubmitButton: false,
            });
          }
          this.workFlowDetailInfo(costRequestId, times - 1, 2000);
        }
      });
    }, nextTime);
  }

  generateApprovalBtns() {
    const { idpValueMap = {} } = this.props;
    const iconConfigList = idpValueMap['SPFM.ICON_LINK_CONFIG'] || [];
    const { approvalRequestHeaderVO = {}, approvalRequestButtonVOList = [], status } = this.state;
    const isEn = getCurrentLanguage() === 'en_US';
    return approvalRequestButtonVOList
      ?.sort((one, two) => {
        return one.buttonOrder - two.buttonOrder;
      })
      .map((item) => {
        const src = (
          iconConfigList.find((icon) => {
            return item.buttonKey === icon.value;
          }) || {}
        ).tag;
        // 审批节点 12 财务第二复核人审批 currentNodeName
        if (
          approvalRequestHeaderVO.currentNodeName === '06 财务第二复核人审批' &&
          item.buttonKey === 'submitName'
        ) {
          return (
            <Tooltip
              placement="top"
              title={intl.get(`spcm.paymentRequest.view.detail.submit`).d('提交审批')}
            >
              <div className={styles.btn} onClick={() => this.openSubmitModal()}>
                <Avatar className={styles.icon} src={src} />
                <p
                  style={{ maxWidth: isEn ? '90px' : '56px', minWidth: isEn ? '90px' : '56px' }}
                  className={styles.text}
                >
                  {intl.get(`spcm.paymentRequest.view.detail.submit`).d('提交审批')}
                </p>
              </div>
            </Tooltip>
          );
        } else if (
          item.buttonKey === 'takingopinionsName' ||
          item.buttonKey === 'forwardName' ||
          item.buttonKey === 'HandleForwardName' ||
          item.buttonKey === 'DeleteBtn'
        ) {
          const { processStatus } = this.state.detailInfoDS.current;
          if (processStatus === 'SUCCESS') {
            return null;
          }
        }
        return (
          <Tooltip placement="top" title={isEn ? item.nameE : item.name} key={item.nameE}>
            <div className={styles.btn} onClick={() => this.openModal(item)}>
              <Avatar className={styles.icon} src={src} />
              <p
                style={{ maxWidth: isEn ? '90px' : '56px', minWidth: isEn ? '90px' : '56px' }}
                className={styles.text}
              >
                {isEn ? item.nameE : item.name}
              </p>
            </div>
          </Tooltip>
        );
      });
  }

  @Bind
  openIframe(record) {
    Modal.open({
      key: Modal.key(),
      title: currentLanguage === 'en_US' ? record.nameE : record.name,
      maskClosable: true,
      closable: true,
      destroyOnClose: true,
      footer: null,
      style: {
        width: Number(record.width) + 50,
        height: Number(record.height) + 100,
      },
      onClose: () => {
        switchModalContainerClassName();
      },
      children: (
        <iframe
          title="urlContent"
          src={record.url}
          frameBorder="0"
          style={{ width: `${record.width}px`, height: `${record.height}px` }}
          marginWidth="1"
          marginHeight="1"
        />
      ),
    });
    this.setState({
      errorMessage: undefined,
    });
  }

  @Bind
  openModal(record) {
    const {
      preChecking,
      checkStatus,
      costRequestId,
      resaleDetailLine,
      vendorCompanyNum,
      requestNum,
      switchRisk,
      approvalRequestHeaderVO = {},
    } = this.state;
    if (['submitName'].includes(record.buttonKey)) {
      //switchRisk判断是根据获取的风险开关值集,1则正常校验,0则跳过校验
      if (switchRisk == 1) {
        this.rendererOtherRiskWarning();
        this.saveSnapshot();
        //checkStatus判断 是 判断是否进行过风险校验 ,0是未进行过风险校验, 1是进行过风险校验
        // if (checkStatus == 0) {
        //   notification.warning({
        //     message: intl
        //       .get(`srsp.riskmanagement.Risk.Submitpop-up`)
        //       .d(
        //         '提示：该付款申请单还未进行过风险校验，系统将自动进行风险校验，时间预计为1分钟，请耐性等待。'
        //       ),
        //   });
        //   // console.log('vendorCompanyNum', vendorCompanyNum);
        // this.setState({
        //   preChecking: true,
        // });
        let businessInfoData = [];
        let circuitIds = [];
        resaleDetailLine.forEach((item) => {
          let obj = {
            billId: item.serviceStartDate, //发票开始日期
            businessType: item.serviceEndDate, //发票结束日期
            customerOrderId: item.poHeaders.circuitNumber, //发票编号(客户电路编号)
          };
          let circuitIdsObj = {
            circuitId: item.poHeaders.circuitNumber, // 客户电路编号
            paymentArrange: item.poLines.paymentArrange, // 项目付款安排
            paymentArrangeExplain: item.poLines.paymentArrangeExplain, // 项目付款安排说明
          };
          businessInfoData.push(obj);
          circuitIds.push(circuitIdsObj);
        });
        request(`${SRM_SPCM_RISK}/v1/${organizationId}/srsp-risk-sanpshot/updateSnapshot`, {
          method: 'POST',
          body: {
            staffNo: costRequestId, //租户id
            tenantId: '100',
            applicationNumber: requestNum, //申请编号
            businessInfo: businessInfoData, //入参信息
            supplierNum: vendorCompanyNum, //供应商编号
          },
        }).then((res) => {
          if (getResponse(res)) {
            request(`${SRM_SPCM_RISK}/v1/${organizationId}/srsp-risk-sanpshot/riskstatus`, {
              method: 'POST',
              body: {
                ebsCode: vendorCompanyNum, // 供应商ebsCode
                // arrangeDTOS: circuitIds // 客户电路编号
                applicationNumber: requestNum, //申请编号
              },
            }).then((res2) => {
              if (getResponse(res2)) {
                this.setState({
                  riskStatus: res2.riskStatus,
                  checkStatus: res2.checkStatus,
                  paymentRiskStatus: res2.paymentRiskStatus,
                  updateRiskCheckLoading: false,
                });
              }
            });
            // this.getOtherRiskTips();
          }
        });
        // } else {
        // renderRiskState = true;
        // this.saveSnapshot();
        // }
      } else {
        this.saveSnapshot();
      }
    }
    // 判断是否在校验状态，是则中断后续操作
    // if (preChecking) {
    //   return false;
    // }
    this.optionButtonKey = record.buttonKey;
    if (record.buttonKey === 'urge') {
      this.handleUrge(record);
    } else if (record.buttonKey === 'submitMaterial') {
      this.handelSubmitMaterial(record);
    } else if (record.buttonKey === 'submitBankBack') {
      this.handleSubmitBankBack(record);
    } else if (['submitName', 'takingopinionsName'].includes(record.buttonKey)) {
      const draftNodeCheck =
        approvalRequestHeaderVO.currentNodeName === '01 起草' && record.buttonKey === 'submitName';
      const { detailInfoDS } = this.state;
      const c = setInterval(() => {
        clearInterval(c);
        if (!detailInfoDS.dirty) {
          this.handleSubmitModal(detailInfoDS, record, draftNodeCheck);
        } else {
          detailInfoDS.submit().then((valid) => {
            if (valid && valid.success) {
              this.handleSubmitModal(detailInfoDS, record, draftNodeCheck);
            }
          });
        }
      }, 1000);
    } else {
      this.openIframe(record);
    }

    switchModalContainerClassName(true);
  }

  @Bind
  handleUrge(record) {
    const { idpValueMap = {} } = this.props;
    const { costRequestId, approvalRequestHeaderVO } = this.state;
    const formLink = idpValueMap['SPFM.URGE.FORMLINK'].find(
      (item) => item.value === 'RESALE_PAYMENT'
    ).tag;
    const formLinkApp = idpValueMap['SPFM.URGE.FORMLINK'].find(
      (item) => item.value === 'formLinkApp'
    ).tag;
    record.paramVO.formLinkApp = `${formLinkApp}${approvalRequestHeaderVO.sourceRequestId}`;
    record.paramVO.formLinkPc = `${formLink}${costRequestId}?requestid=${approvalRequestHeaderVO.sourceRequestId}&workflowtype=SCM_ZCFKSQ&open=fs`;
    _DIC_COMMON_JS_.showUrgeDialog(record.paramVO).then((res) => {
      //回调
      console.log(res);
    });
  }

  @Bind
  handelSubmitMaterial(record) {
    const { costRequestId } = this.state;
    request(
      `${SRM_SPUC}/v1/${organizationId}/payment-request-common-apis/checkRepeatInvoice/${costRequestId}`,
      {
        method: 'POST',
      }
    ).then((res) => {
      if (res.repeatFlag === 'Y') {
        this.setState(
          {
            errorMessage: res.repeatMsg,
          },
          () => {
            this.handleScrollTop();
          }
        );
      } else {
        this.openIframe(record);
      }
    });
  }

  @Bind
  handleSubmitBankBack(record) {
    const { costRequestId } = this.state;
    request(
      `${SRM_SPUC}/v1/${organizationId}/payment-request-common-apis/checkAllowReturnBank/${costRequestId}`,
      {
        method: 'POST',
      }
    ).then((res) => {
      if (getResponse(res) && res.returnFlag === 'N') {
        this.setState(
          {
            errorMessage: [res.checkMsg],
          },
          () => {
            this.handleScrollTop();
          }
        );
      } else {
        this.openIframe(record);
      }
    });
  }

  @Bind
  async handleSubmitModal(detailInfoDS, record, draftNodeCheck) {
    const { costRequestId, currentNodeName, bankInfoDS, isCheckBankInfo } = this.state;
    this.setState({
      preChecking: true,
    });
    const { data } = bankInfoDS.records[0] || {};
    const { bankApprovalStatus } = data || {};

    const validateBeforeOpenModal = (checkResult) => {
      if (!checkResult.failed) {
        const { costPaymentRequest = {} } = detailInfoDS.current.toData() || {};
        const {
          invoiceHkAmountTotal,
          companyOrgCode,
          signFlag,
          requestStatus,
          requestEmployeeId,
          draftEmployeeId,
          paymentOwnerId,
        } = costPaymentRequest;
        // 判断是否为总部，总部编码为1510，是则判断大于100万，否则判断大于50万
        const thresholdAmount = companyOrgCode === '1510' ? 1000000 : 500000;
        if (['submitName'].includes(record.buttonKey)) {
          if (
            !signFlag &&
            requestStatus === 'DRAFT' &&
            requestEmployeeId != draftEmployeeId &&
            !paymentOwnerId
          ) {
            CusNotification.error({
              message: intl
                .get('spcm.costPayment.modal.children.signToRequestEmployee')
                .d('请会签给申请人'),
              duration: 6,
            });
            switchModalContainerClassName();
            return false;
          }
        }

        const msg = [];
        if (record.buttonKey === 'submitName' && currentNodeName === '05 财务第一复核人审批') {
          if (bankApprovalStatus !== 'Y' && isCheckBankInfo) {
            msg.push(
              <p>
                {intl
                  .get('spcm.costPayment.message.confirm.bankInfo')
                  .d('请对银行信息进行审核，请确认。')}
              </p>
            );
          }
          if (invoiceHkAmountTotal && invoiceHkAmountTotal > thresholdAmount) {
            msg.push(
              <p>
                {intl.get('spcm.costPayment.modal.tip.submit.largeAmount', {
                  amount: numberRender(thresholdAmount, 2),
                })}
              </p>
            );
          }
        }
        if (msg.length > 0) {
          Modal.info({
            key: Modal.key(),
            children: msg,
            okText: intl.get('spcm.costPayment.modal.okText.haveRead').d('已阅读'),
          }).then(() => {
            this.openIframe(record);
          });
        } else {
          this.openIframe(record);
        }
      } else {
        switchModalContainerClassName();
        const { message } = checkResult;
        this.setState(
          {
            errorMessage: typeof message === 'string' ? message.split(';') : undefined,
          },
          () => {
            this.handleScrollTop();
          }
        );
      }
    };

    const checkResult = await submitPreCheck(costRequestId, currentNodeName);
    this.setState({
      preChecking: false,
    });
    const v = await detailInfoDS.query();
    if (!v) {
      return false;
    }
    if (!checkResult) {
      switchModalContainerClassName();
      return false;
    }
    const validateWarnMsg = (
      <div>
        {checkResult.warnList.map((i) => {
          return <div>{i}</div>;
        })}
        {this.state.paymentRiskStatus == 1 ? (
          <div>
            <span>
              {intl
                .get(`srsp.riskmanagement.Risk.PaymentArrangeRiskTips`)
                .d('此项目的付款安排为“客户先付CMI款,CMI后付供应商”，请及时收款后再发起付款！')}
            </span>
          </div>
        ) : null}
        {this.state.riskStatus == 1 ? (
          <div style={{ color: '#d50000' }}>
            <span>
              {intl
                .get(`srsp.riskmanagement.Risk.RiskPrompt`)
                .d('此参与方或电路编号存在多项付款风险，谨慎付款。')}
            </span>
            <span
              onClick={this.goAccruedRisk}
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
            >
              {intl.get(`srsp.riskmanagement.Risk.Risklink`).d('点击查看明细')}
            </span>
          </div>
        ) : null}
      </div>
    );
    if (draftNodeCheck) {
      const ibossApproval = await this.getIbossApproval();
      if (!(ibossApproval || checkResult.warnFlag)) {
        validateBeforeOpenModal(checkResult);
        return false;
      }
      Modal.open({
        key: Modal.key(),
        maskClosable: true,
        destroyOnClose: true,
        style: {
          width: 800,
        },
        children: (
          <IbossApproval
            ibossApproval={ibossApproval}
            warnMsg={checkResult.warnFlag ? validateWarnMsg : false}
          />
        ),
        onOk: () => {
          validateBeforeOpenModal(checkResult);
        },
      });
    } else if (checkResult.warnFlag) {
      Modal1.warning({
        title: intl.get('hzero.common.message.warningMessage').d('警告信息:'),
        content: validateWarnMsg,
        okText: intl.get(`hzero.common.button.ok`).d('确定'),
        onOk: () => {
          validateBeforeOpenModal(checkResult);
        },
      });
    } else {
      validateBeforeOpenModal(checkResult);
    }
  }

  @Bind
  openSubmitModal() {
    this.optionButtonKey = 'submitName';
    const { costRequestId, detailInfoDS, preChecking } = this.state;
    // 判断是否在校验状态，是则中断后续操作
    if (preChecking) {
      return false;
    }
    if (detailInfoDS.dirty) {
      this.setState(
        {
          lastApprovalFlag: true,
        },
        () => {
          detailInfoDS.submit().then((valid) => {
            if (valid && valid.success) {
              this.lastApprovalPrecheck(costRequestId);
            }
          });
        }
      );
    } else {
      this.lastApprovalPrecheck(costRequestId);
      this.saveSnapshot();
    }
    switchModalContainerClassName(true);
  }

  @Bind()
  lastApprovalPrecheck(costRequestId) {
    const { currentNodeName, detailInfoDS } = this.state;
    this.setState({
      preChecking: true,
    });
    submitPreCheck(costRequestId, currentNodeName).then((res) => {
      this.setState({
        preChecking: false,
      });
      // 校验接口，后端会做保存操作更新版本号，因此重新刷新数据，更新版本号
      detailInfoDS.query().then((result) => {
        if (result) {
          if (!res) {
            return false;
          } else if (res.failed) {
            const { message } = res;
            this.setState(
              {
                errorMessage: typeof message === 'string' ? message.split(';') : undefined,
              },
              () => {
                this.handleScrollTop();
              }
            );
            return false;
          }
          let isNeedBankOption = false;
          const bankInfoMsg = intl
            .get('spcm.paymentRequest.valuelist.meaning.bankInfo')
            .d('【银行信息已审核】');
          if (this.state.bankInfoDS.records.length < 1) {
            isNeedBankOption = false;
          } else if (this.state.bankInfoDS.records.length === 1) {
            const { bankApprovalStatus } = this.state.bankInfoDS.records[0].data;
            if (this.state.bankInfoDS.records[0].isRemoved) {
              isNeedBankOption = false;
            } else if (bankApprovalStatus === 'Y' || bankApprovalStatus === 'FINISHED') {
              isNeedBankOption = false;
            } else {
              isNeedBankOption = true;
            }
          }
          // 归档自定义弹框
          const openModal = () => {
            Modal.open({
              key: Modal.key(),
              title: intl.get('spcm.paymentRequest.view.title.archive').d('归档'),
              maskClosable: true,
              destroyOnClose: true,
              closable: true,
              style: {
                width: 800,
              },
              onClose: () => {
                switchModalContainerClassName();
              },
              children: (
                <Form dataSet={this.remarkDS} labelLayout="horizontal">
                  <Row style={{ display: 'flex', alignItems: 'center' }}>
                    <Col span={4}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        {intl.get('spcm.costPayment.view.detail.opinion').d('签字意见')}
                      </span>
                    </Col>
                    <Col span={8}>
                      <TextField name="select" disabled />
                    </Col>
                  </Row>
                  <Row style={{ marginTop: '10px' }}>
                    <Col span={24}>
                      <TextArea
                        name="remark"
                        placeholder={intl
                          .get('spcm.paymentRequest.placeholder.pleaseinput')
                          .d('请输入')}
                        style={{ width: '100%' }}
                      />
                    </Col>
                  </Row>
                </Form>
              ),
              onOk: () => {
                this.setState({
                  costRequestLoading: true,
                });
                const { match = {} } = this.props;
                const { approvalRequestButtonVOList } = this.state;
                const { params } = match;
                const { url } = approvalRequestButtonVOList[0];
                const requestId = url.split('&')[2].split('=')[1];
                const loginId = currentUser.loginName;
                let { remark } = this.remarkDS.current.data;
                remark = isNeedBankOption ? `${bankInfoMsg};` + remark : remark;
                this.lastApproval(costRequestId, requestId, loginId, remark, params);
              },
            });
          };
          let flag = true;
          if (res.warnFlag) {
            flag = false;
            Modal1.warning({
              title: intl.get('hzero.common.message.warningMessage').d('警告信息:'),
              content: (
                <div>
                  {res.warnList.map((i) => {
                    return <div>{i}</div>;
                  })}
                  {this.state.paymentRiskStatus == 1 ? (
                    <div style={{ color: '#d50000' }}>
                      <span>
                        {intl
                          .get(`srsp.riskmanagement.Risk.PaymentArrangeRiskTips`)
                          .d(
                            '此项目的付款安排为“客户先付CMI款,CMI后付供应商”，请及时收款后再发起付款！'
                          )}
                      </span>
                    </div>
                  ) : null}
                  {this.state.riskStatus == 1 ? (
                    <div style={{ color: '#d50000' }}>
                      <span>
                        {intl
                          .get(`srsp.riskmanagement.Risk.RiskPrompt`)
                          .d('此参与方或电路编号存在多项付款风险，谨慎付款。')}
                      </span>
                      <span
                        onClick={this.goAccruedRisk}
                        style={{ textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        {intl.get(`srsp.riskmanagement.Risk.Risklink`).d('点击查看明细')}
                      </span>
                    </div>
                  ) : null}
                </div>
              ),
              okText: intl.get(`hzero.common.button.ok`).d('确定'),
              onOk: () => {
                openModal();
              },
            });
          }
          if (flag) {
            openModal();
          }
        }
      });
    });
  }

  lastApproval(costRequestId, requestId, loginId, remark) {
    request(
      `${SRM_SPUC}/v1/${organizationId}/resale-payment-requests/last-approve/${costRequestId}`,
      {
        method: 'POST',
        body: {
          requestId,
          loginId,
          remark,
          operationType: 'submitname',
        },
      }
    )
      .then((resonseData) => {
        this.setState({
          // costRequestLoading: false,
          lastApprovalFlag: false,
        });
        if (resonseData.failed) {
          CusNotification.error({
            description: <p style={{ wordBreak: 'break-all' }}>{resonseData.message}</p>,
            duration: null,
          });

          this.setState({
            costRequestLoading: false,
          });
        } else {
          // 提交审批成功 刷新详情信息/审批流
          CusNotification.success();
          // this.pollingWorkFLowDetail('14 待付款');
          this.pollingWorkFLowDetail('14 已完成等待系统自动归档');
        }
      })
      .catch(() => {
        this.setState({
          costRequestLoading: false,
          lastApprovalFlag: false,
        });
        CusNotification.error({
          description: 'error',
        });
      });
  }

  @Bind()
  handlePoDetail(poHeadersId, poType) {
    // const { history } = this.props;
    const { open } = this.state;
    let url;
    if (poType === 'STANDARD') {
      url = `/pub/sodr/purchase-order/standard/viewOnly/detail/${poHeadersId}${
        open ? '/?open=fs' : ''
      }`;
    } else if (poType === 'ICTS') {
      url = `/pub/sodr/purchase-order/viewOnly/detail/${poHeadersId}${open ? '/?open=fs' : ''}`;
    } else if (poType === 'DATA_APP') {
      url = `/pub/sodr/purchase-order/dataApp/viewOnly/detail/${poHeadersId}${
        open ? '/?open=fs' : ''
      }`;
    } else if (poType === 'IDC') {
      url = `/pub/sodr/purchase-order/idc/viewOnly/detail/${poHeadersId}${open ? '/?open=fs' : ''}`;
    } else if (poType === 'CO_SD_WAN') {
      url = `/pub/sodr/purchase-order/cosdwan/viewOnly/detail/${poHeadersId}${
        open ? '/?open=fs' : ''
      }`;
    } else if (poType === 'SD_WAN') {
      url = `/pub/sodr/purchase-order/sdwan/viewOnly/detail/${poHeadersId}${
        open ? '/?open=fs' : ''
      }`;
    } else if (poType === 'CIDC') {
      url = `/pub/sodr/purchase-order/cidc/viewOnly/detail/${poHeadersId}${
        open ? '/?open=fs' : ''
      }`;
    } else if (poType === 'AAS') {
      url = `/pub/sodr/purchase-order/aas/viewOnly/detail/${poHeadersId}${open ? '/?open=fs' : ''}`;
    }
    window.open(url, '_blank');
    // history.push({
    //   pathname: `${isPub ? '/pub' : ''}/sodr/purchase-order/viewOnly/detail/${poHeadersId}`,
    //   search: `${open ? '?open=fs' : ''}`,
    // });
  }

  @Bind()
  handleSoDetail(salesContractId) {
    const { soUrl } = this.state;
    const { loginName } = currentUser;
    const url = Base64.stringify(
      Utf8.parse(
        `/mks/cmi-to-approval-details?workflowtype=BOSS_ICTSHTSP&uuid=${salesContractId}&requestid=&loginid=${loginName}`
      )
    );
    return soUrl + url;
  }

  @Bind()
  handleExportPdf() {
    this.setState({
      exportPdfLoading: true,
    });
    const { costRequestId, detailInfoDS } = this.state;
    const { current } = detailInfoDS;
    exportPdf(costRequestId).then((res) => {
      this.setState({
        exportPdfLoading: false,
      });
      if (res) {
        const blob = new Blob([res], {
          type: 'application/pdf',
        });
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${current.get('requestNum')}.pdf`);
          return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = current.get('requestNum');
        a.click();
        a.remove();
      }
    });
  }

  @Bind()
  async fileBatchDownload() {
    const { costRequestId, detailInfoDS } = this.state;
    const { current } = detailInfoDS;
    this.setState({
      fileDownloadLoading: true,
    });
    const fileList = await request(
      `${SRM_SPCM}/v1/${organizationId}/cost-payment/queryPaymentAttach/${costRequestId}/resale`,
      {
        method: 'GET',
      }
    ).then((res) => {
      if (getResponse(res)) {
        return res;
      }
    });
    const fileName = `${current.get('requestNum')}-${intl
      .get(`spcm.paymentRequest.button.fileDownload`)
      .d('附件下载')}-${moment(new Date()).format('YYYYMMDD')}`;
    await batchDownloadFileReform(fileList.batchFileList, fileList.ccmFileIdList, fileName);
    this.setState({
      fileDownloadLoading: false,
    });
  }

  @Bind()
  @Debounce(200)
  handleRequestTitleInput(value) {
    if (value && typeof value === 'string') {
      this.setState({
        requestTitleLen: getStringBytes(value),
      });
    } else {
      this.setState({
        requestTitleLen: 0,
      });
    }
  }

  @Bind()
  @Debounce(200)
  handleRequestRemarksInput(value) {
    if (value && typeof value === 'string') {
      this.setState({
        requestRemarksLen: getStringBytes(value),
      });
    } else {
      this.setState({
        requestRemarksLen: 0,
      });
    }
  }

  @Bind()
  handleScrollTop() {
    const node = document.querySelector('.page-content-wrap');
    if (node.scrollTo) {
      node.scrollTo(0, 0);
    } else {
      node.scrollTop = 0;
    }
  }

  // open退回供应商Modal
  @Bind()
  openReturnModal(falg = true) {
    this.setState({
      returnToSupplierModalVisible: falg,
    });
  }

  @Bind()
  handleReturnToSupplier(rejectReason) {
    const { costRequestId, detailInfoDS } = this.state;
    returnToSupplier({ costRequestId, rejectReason }).then((res) => {
      if (getResponse(res)) {
        this.openReturnModal(false);
        CusNotification.success();
        detailInfoDS.query();
        this.workFlowDetailInfo(+costRequestId, 1);
      }
    });
  }

  @Bind()
  handleWithdraw() {
    const { costRequestId, detailInfoDS } = this.state;
    withdraw(costRequestId).then((res) => {
      if (getResponse(res)) {
        CusNotification.success();
        detailInfoDS.query();
        this.workFlowDetailInfo(+costRequestId, 1);
      }
    });
  }

  @Bind()
  rendererRiskWarning() {
    let { riskWarning = '' } = this.state;
    let result;
    riskWarning = riskWarning.split(';');
    if (Array.isArray(riskWarning)) {
      result = riskWarning.map((item) => <p style={{ marginBottom: '0px' }}>{item}</p>);
    }
    return <div style={{ color: '#d50000' }}>{result}</div>;
  }

  @Bind()
  renderRiskWarningLabel() {
    const label = intl.get(`spcm.paymentRequest.Risk.POmodified`).d('PO变更提醒');
    return (
      <span style={{ fontWeight: 'bolder' }}>
        <span style={{ color: '#d50000' }}>{label}</span>
        <Tooltip
          title={intl
            .get('spcm.paymentRequest.toolTip.help.riskWarning')
            .d(
              '当【供应商】、【签约主体】、【币种】、【MRC金额】、【NRC金额】信息有变更情况时，系统则显示此风险提示。'
            )}
        >
          <Icon style={{ color: '#0085d0' }} type="help_outline" />
        </Tooltip>
      </span>
    );
  }

  @Bind
  goAccruedRisk() {
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    const { requestNum, resaleDetailLine, companyOrgName, vendorCompanyNum } = this.state;
    let circuitIds = [];
    resaleDetailLine.forEach((item) => {
      circuitIds.push(item.poHeaders.circuitNumber);
    });
    const resaleDetailInfo = {
      ebsCode: vendorCompanyNum, // 供应商编号
      circuitIds: circuitIds, // 线路号
      companyEntityName: companyOrgName, // 公司主体
    };
    localStorage.setItem('resaleDetailInfo', JSON.stringify(resaleDetailInfo));
    const url = `${isPub ? '/pub' : ''}/scpc/payment-center/AccruedRiskDetailed/${requestNum}`;
    window.open(url, '_blank');
  }

  @Bind()
  rendererOtherRiskWarning() {
    let { otherRiskWarningMeaning = '', riskStatus, paymentRiskStatus, detailInfoDS } = this.state;
    let result;
    otherRiskWarningMeaning = otherRiskWarningMeaning.split(';').filter((i) => i && i.trim());
    if (Array.isArray(otherRiskWarningMeaning)) {
      result = otherRiskWarningMeaning.map((item, index) => (
        <p style={{ marginBottom: '0px' }}>
          {index + 1}.{item}
        </p>
      ));
    }
    const { transferOrderFlag } = detailInfoDS.current.toData();
    return (
      <>
        {transferOrderFlag !== 'Y' && <div style={{ color: '#d50000' }}>{[result]}</div>}
        {paymentRiskStatus == 1 ? (
          <div style={{ color: '#d50000' }}>
            <span>
              {otherRiskWarningMeaning.length > 0 ? `${otherRiskWarningMeaning.length + 1}.` : ''}
              {intl
                .get(`srsp.riskmanagement.Risk.PaymentArrangeRiskTips`)
                .d('此项目的付款安排为“客户先付CMI款,CMI后付供应商”，请及时收款后再发起付款！')}
            </span>
          </div>
        ) : null}
        {riskStatus == 1 ? (
          <div style={{ color: '#d50000' }}>
            <span>
              {otherRiskWarningMeaning.length > 0
                ? paymentRiskStatus == 1
                  ? `${otherRiskWarningMeaning.length + 2}.`
                  : `${otherRiskWarningMeaning.length + 1}.`
                : ''}
              {intl
                .get(`srsp.riskmanagement.Risk.RiskPrompt`)
                .d('此参与方或电路编号存在多项付款风险，谨慎付款。')}
            </span>
            <span
              onClick={this.goAccruedRisk}
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
            >
              {intl.get(`srsp.riskmanagement.Risk.Risklink`).d('点击查看明细')}
            </span>
          </div>
        ) : null}
      </>
    );
  }

  @Bind()
  renderOtherRiskWarningLabel() {
    const label = intl.get(`spcm.paymentRequest.view.detail.riskWarning`).d('风险提示');
    return (
      <span style={{ fontWeight: 'bolder' }}>
        <span style={{ color: '#d50000' }}>{label}</span>
      </span>
    );
  }

  @Bind()
  renderApprovalRemindLabel() {
    const label = intl.get(`spcm.paymentRequest.view.detail.approvalRemind`).d('审批提示');
    return (
      <span style={{ fontWeight: 'bolder' }}>
        <span style={{ color: '#d50000' }}>{label}</span>
      </span>
    );
  }

  @Bind()
  rendererApprovalRemind() {
    const { approvalRemind } = this.state;
    const { remindDetailDTOList = [] } = approvalRemind;
    let checkRule;
    const isEn = getCurrentLanguage() === 'en_US';
    if (Array.isArray(remindDetailDTOList)) {
      checkRule = remindDetailDTOList.map((item, index) => (
        <>
          <p style={{ marginBottom: '0px', display: 'flex' }}>
            <span style={{ width: isEn ? '80%' : '60%' }}>
              {index + 1}.{item.checkMeaning}
            </span>
            <span style={{ color: item.checkResult === 'Y' ? '#d50000' : '#333' }}>
              {item.checkResultMeaning}
            </span>
          </p>
        </>
      ));
    }
    return <div>{checkRule}</div>;
  }

  /**
   * 获取业务类型编码
   *
   * @memberof CostPaymentRequestDetail
   */
  @Bind
  fetchProductTypeCodes() {
    const lovCode = 'RS_IBOSS_PRODUCT_TYPE';
    queryIdpValue(lovCode).then((res) => {
      if (getResponse(res)) {
        this.setState({
          productTypeCodes: res.map((item) => ({ value: item.value, label: item.meaning })),
        });
      }
    });
  }

  @Bind()
  loadIbossSoUrl() {
    const lovCode = 'SPUC.IBOSS_SO_URL';
    queryIdpValue(lovCode).then((res) => {
      if (getResponse(res)) {
        // 销售合同对应的值集里的值
        const soValue = 'IBOSS_SO_URL';
        const soUrl = (res.find((item) => item.value === soValue) || {}).tag;
        this.setState({
          soUrl,
        });
      }
    });
  }

  @Bind
  showProductTypeModal() {
    this.setState({
      productTypeModalVisible: true,
    });
  }

  @Bind
  hideProductTypeModal() {
    this.setState({
      productTypeModalVisible: false,
    });
  }

  @Bind()
  renderRequestNum() {
    const { returnRequestId } = this.state;
    const label = intl.get(`spcm.paymentRequest.view.detail.requestNum`).d('申请编号');
    return (
      <span title={label}>
        <span>{label}</span>
        {returnRequestId && (
          <Tooltip title={`EBS Request ID：${returnRequestId}`}>
            <Icon style={{ color: '#0085d0' }} type="help_outline" />
          </Tooltip>
        )}
      </span>
    );
  }

  @Bind()
  renderRequestEmployeeName() {
    const label = intl.get(`spcm.paymentRequest.view.detail.requestEmployeeName`).d('申请人');
    return (
      <span title={label}>
        <span>{label}</span>
        <Tooltip
          title={intl
            .get('spcm.paymentRequest.view.requestEmployeeName.tooltip')
            .d('针对付款本地化线路，请区域起草人选择并会签总部申请人')}
        >
          <Icon style={{ color: '#0085d0' }} type="help_outline" />
        </Tooltip>
      </span>
    );
  }

  @Bind()
  renderExprctPaymentDate() {
    const label = intl.get(`spcm.paymentRequest.view.detail.expectPaymentDate`).d('期望付款日期');
    return (
      <span title={label}>
        <span>{label}</span>
        <Tooltip
          title={intl
            .get('spcm.paymentRequest.view.exprctPaymentDate.tooltip')
            .d('若未填写期望付款日期，则按照紧急程度及历史付款时间计算默认期望付款日期。')}
        >
          <Icon style={{ color: '#0085d0' }} type="help_outline" />
        </Tooltip>
      </span>
    );
  }

  @Bind()
  renderExpenseCategory() {
    const label = intl.get(`spcm.paymentRequest.view.detail.expenseCategory`).d('银行费用类别');
    return (
      <span title={label}>
        <span>{label}</span>
        <Tooltip
          title={intl
            .get('spcm.paymentRequest.view.expenseCategory.tooltip')
            .d('如银行费用由CMI方全部承担，須上传相关审批文件（如MSA协议）支撑本次付款。')}
        >
          <Icon style={{ color: '#0085d0' }} type="help_outline" />
        </Tooltip>
      </span>
    );
  }

  @Bind()
  getWriteOff() {
    const { costRequestId } = this.state;
    request(`${SRM_SPUC}/v1/${organizationId}/resale-prepayment-write-offs/payAndWriteOffInfo`, {
      method: 'GET',
      query: {
        costRequestId,
      },
    }).then((res) => {
      if (getResponse(res)) {
        this.setState({
          payWriteOffData: res,
        });
      }
    });
  }
  /**
   * 查询审批提醒
   */
  @Bind()
  queryApprovalRemind() {
    const { costRequestId, currentNodeName, detailInfoDS } = this.state;
    const { transferOrderFlag } = detailInfoDS.current.toData(); // 是否转网订单
    // “是否转网订单”为“是” 且 “当前节点”为“GM”或“DM”，触发校验并弹出提醒弹框；
    if (transferOrderFlag === 'Y' && (/DM/.test(currentNodeName) || /GM/.test(currentNodeName))) {
      Modal1.info({
        title: intl.get(`spcm.paymentRequest.view.info.dataConfirm`).d('信息确认'),
        content: (
          <div style={{ fontSize: '14px' }}>
            {intl.get(`spcm.paymentRequest.view.info.transferOrder`).d('此付款申请为转网订单')}
          </div>
        ),
        width: '300px',
        onOk() {},
      });
    } else if (currentNodeName.startsWith('02') || currentNodeName.startsWith('03')) {
      request(`${SRM_SPCM}/v1/${organizationId}/payment-approval-remind/validate`, {
        method: 'GET',
        query: {
          costRequestId,
          // 【硬编码】这和写死常量没有区别，若节点描述变更了会有越界的风险，建议换成includes判断；
          approvalNode: currentNodeName.slice(3, 5),
        },
      }).then((res) => {
        if (getResponse(res)) {
          this.setState({
            approvalRemind: res,
          });
          if (res.haveApprovalRemind === 'Y') {
            const { remindDetailDTOList = [] } = res;
            let checkRule;
            const isEn = getCurrentLanguage() === 'en_US';
            if (Array.isArray(remindDetailDTOList)) {
              checkRule = remindDetailDTOList.map((item, index) => (
                <>
                  <p style={{ marginBottom: '0px', display: 'flex' }}>
                    <span style={{ width: isEn ? '90%' : '80%' }}>
                      {index + 1}.{item.checkMeaning}
                    </span>
                    <span style={{ color: item.checkResult === 'Y' ? '#d50000' : '#333' }}>
                      {item.checkResultMeaning}
                    </span>
                  </p>
                </>
              ));
            }
            Modal1.info({
              title: (
                <div style={{ display: 'flex', fontSize: '16px', justifyContent: 'space-between' }}>
                  <span>
                    {intl.get(`spcm.paymentRequest.view.detail.approvalRemind`).d('审批提示')}
                  </span>
                  <span>
                    {intl.get(`spcm.paymentRequest.view.info.checkDate`).d('校验时间')}:
                    {res.checkDate}
                  </span>
                </div>
              ),
              content: <div style={{ fontSize: '14px' }}>{checkRule}</div>,
              width: '600px',
              onOk() {},
            });
          }
        }
      });
    }
  }

  //值集获取
  @Bind()
  getenumMap() {
    queryMapIdpValue({
      switchRisk: 'SRSP.RISK_SWITCH',
    }).then((res) => {
      if (getResponse(res)) {
        this.setState({
          switchRisk: res.switchRisk[0].tag || 1,
        });
      }
    });
  }

  @Bind()
  getStepsData() {
    const { costRequestId } = this.state;
    request(`${SRM_SPCM}/v1/${organizationId}/payment-progresss/queryPaymentProgressStatus`, {
      method: 'GET',
      query: {
        requestId: costRequestId,
        paymentType: 'RESALE_PAYMENT',
      },
    }).then((res) => {
      if (getResponse(res)) {
        let newNode = this.getNewNode(res);
        this.setState({
          stepsData: res,
          newNodeStep: newNode,
        });
      }
    });
  }

  //风险快照提交按钮
  @Bind()
  saveSnapshot() {
    const {
      costRequestId,
      requestNum,
      resaleDetailLine,
      vendorCompanyNum,
      nodeStepCodes,
      approvalReqRecVOList,
    } = this.state;
    const isEn = getCurrentLanguage() === 'en_US';
    let circuitIds = [];
    let approvalNode = '';
    resaleDetailLine.forEach((item) => {
      circuitIds.push(item.poHeaders.circuitNumber);
    });
    if (isEn) {
      approvalNode = nodeStepCodes.filter((item) => {
        return (
          last(approvalReqRecVOList).currentNodeName.includes(item.meaning) && item.tag !== 'C'
        );
      })[0].value;
    } else {
      approvalNode = last(approvalReqRecVOList).currentNodeName;
    }
    // this.setState({
    //   preChecking: true,
    // })
    request(`${SRM_SPCM_RISK}/v1/${organizationId}/srsp-risk-sanpshot/saveSnapshot`, {
      method: 'POST',
      body: {
        applicationNumber: requestNum, //申请编号
        approvalNode: approvalNode, //节点名称
        ebsCode: vendorCompanyNum, // 供应商编号
        circuitIds: circuitIds, // 客户电路编号
      },
    }).then((res) => {
      if (getResponse(res)) {
        // this.setState({
        //   preChecking: false,
        // })
      }
    });
  }

  //获取最新节点信息
  @Bind
  getNewNode(stepData) {
    let newNode = {};
    pub: for (let i = stepData.length - 1; i >= 0; i--) {
      let item = stepData[i];
      if (item.hasPassFlag == 'Y') {
        if (item.haveChildFlag == 'Y') {
          let child = item.childPaymentProgressStatusList;
          for (let j = child.length - 1; j >= 0; j--) {
            let item2 = child[j];
            if (item2.hasPassFlag == 'Y') {
              newNode = item2;
              break pub;
            } else {
              continue;
            }
          }
        } else {
          newNode = item;
          break;
        }
      } else {
        continue;
      }
    }
    return newNode;
  }

  //获取所有历史节点(已完成节点)信息
  @Bind
  getAllHistoryNode(stepData) {
    let AllHistoryNode = [];
    stepData.forEach((item) => {
      if (item.hasPassFlag == 'Y') {
        if (item.haveChildFlag == 'Y') {
          const child = item.childPaymentProgressStatusList;
          child.forEach((item2) => {
            if (item2.hasPassFlag) {
              AllHistoryNode.push(item2);
            }
          });
        } else {
          AllHistoryNode.push(item);
        }
      }
    });
    return AllHistoryNode;
  }

  //查询对应节点是否存在风险信息
  @Bind
  getOtherRiskTips() {
    const { costRequestId, requestNum, resaleDetailLine, vendorCompanyNum } = this.state;
    let circuitIds = [];
    resaleDetailLine.forEach((item) => {
      let circuitIdsObj = {
        circuitId: item.poHeaders.circuitNumber, // 客户电路编号
        paymentArrange: item.poLines.paymentArrange, // 项目付款安排
        paymentArrangeExplain: item.poLines.paymentArrangeExplain, // 项目付款安排说明
      };
      circuitIds.push(circuitIdsObj);
    });
    request(`${SRM_SPCM_RISK}/v1/${organizationId}/srsp-risk-sanpshot/riskstatus`, {
      method: 'POST',
      body: {
        ebsCode: vendorCompanyNum, // 供应商ebsCode
        // arrangeDTOS: circuitIds // 客户电路编号
        applicationNumber: requestNum, //申请编号
      },
    }).then((res) => {
      if (getResponse(res)) {
        this.setState({
          riskStatus: res.riskStatus,
          checkStatus: res.checkStatus,
          paymentRiskStatus: res.paymentRiskStatus,
        });
        this.rendererOtherRiskWarning();
      }
    });
  }

  //更新风险校验
  @Bind
  updateRiskCheck() {
    const {
      costRequestId,
      resaleDetailLine,
      vendorCompanyNum,
      requestNum,
      approvalReqRecVOList,
    } = this.state;
    this.setState({
      updateRiskCheckLoading: true,
      // preChecking: true,
    });
    let businessInfoData = [];
    resaleDetailLine.forEach((item) => {
      let obj = {
        billId: item.serviceStartDate, //发票开始日期
        businessType: item.serviceEndDate, //发票结束日期
        customerOrderId: item.poHeaders.circuitNumber, //发票编号(客户电路编号)
      };
      businessInfoData.push(obj);
    });
    const isEn = getCurrentLanguage() === 'en_US';
    let approvalNode = '';
    if (isEn) {
      approvalNode = nodeStepCodes.filter((item) => {
        return (
          last(approvalReqRecVOList).currentNodeName.includes(item.meaning) && item.tag !== 'C'
        );
      })[0].value;
    } else {
      approvalNode = last(approvalReqRecVOList).currentNodeName;
    }
    request(`${SRM_SPCM_RISK}/v1/${organizationId}/srsp-risk-sanpshot/updateSnapshot`, {
      method: 'POST',
      body: {
        staffNo: costRequestId, //租户id
        tenantId: '100',
        applicationNumber: requestNum, //申请编号
        businessInfo: businessInfoData, //入参信息
        supplierNum: vendorCompanyNum, //供应商编号
        approvalNode: approvalNode,
      },
    }).then((res) => {
      this.setState({
        updateRiskCheckLoading: false,
        // preChecking: false,
      });
      if (getResponse(res)) {
        this.getOtherRiskTips();
      }
      CusNotification.success({
        message: intl
          .get(`srsp.riskmanagement.Risk.RISKTip`)
          .d('风险校验完成，请刷新页面查看最新风险提示'),
      });
    });
    // Modal1.confirm({
    //   content: intl
    //     .get('srsp.riskmanagement.Risk.Riskpop-up')
    //     .d('提示：风险校验时间预计为1分钟，期间不允许进行流程操作，请确认是否进行风险校验？'),
    //   okText: intl.get(`hzero.common.button.ok`).d('确定'),
    //   cancelText: intl.get(`hzero.common.button.cancel`).d('取消'),
    //   onOk: () => {

    //   },
    // });
  }

  @Bind()
  handleDeleteBankInfo() {
    const { data } = this.state.bankInfoDS.records[0] || {};
    const { bankInfoId } = data || {};
    if (this.state.bankInfoDS.length >= 1 && bankInfoId) {
      request(`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/payment-bank-infos/${bankInfoId}`, {
        method: 'DELETE',
      }).then(() => {
        this.state.bankInfoDS.query();
      });
    } else {
      this.state.bankInfoDS.removeAll();
    }
  }

  @Bind()
  handleFinancialAudit() {
    const { idpValueMap = {} } = this.props;
    Modal.open({
      key: Modal.key(),
      title: intl.get('spcm.costPayment.view.title.financialAudit').d('财务审核说明'),
      maskClosable: true,
      closable: true,
      destroyOnClose: true,
      footer: null,
      style: {
        width: 800,
      },
      children: <FinancialAudit idpValueMap={idpValueMap} prompt="spcm.costPayment" />,
    });
  }

  @Bind
  chequePayFlagChange(value) {
    if (value === 'N') {
      this.setState({
        isCheckBankInfo: true,
      });
      this.state.bankInfoDS.query();
    } else {
      this.setState({
        isCheckBankInfo: false,
      });
      this.state.bankInfoDS.removeAll();
      Modal1.info({
        content: (
          <div style={{ fontSize: '14px' }}>
            {intl
              .get(`${prompt}.view.chequePayFlag.info`)
              .d('请以信函形式提供付款指示，并在公司信笺下盖章签名。')}
          </div>
        ),
        okText: intl.get(`hzero.common.button.ok`).d('确定'),
        onOk: () => {},
      });
    }
  }

  @Bind()
  changeMultiCurrencyFlag(multiCurrencyFlag) {
    const { detailInfoDS } = this.state;
    if (multiCurrencyFlag === 'N') {
      detailInfoDS.current.set('actualCurrency', null);
      detailInfoDS.current.set('actualPaidCurrency', null);
      detailInfoDS.current.set('actualPaidCurrencyMeaning', null);
    }
  }

  @Bind()
  changePressLevel(pressLevel) {
    const { detailInfoDS } = this.state;
    const requestStatus = detailInfoDS.current.get('requestStatus');
    if (['DRAFT'].includes(requestStatus) && ['GENERAL'].includes(pressLevel)) {
      detailInfoDS.current.set('expectPaymentDate', null);
    }
  }

  @Bind()
  changeNotNeedPaidFlag(notNeedPaidFlag) {
    if (['Y'].includes(notNeedPaidFlag)) {
      Modal1.info({
        content: (
          <div style={{ fontSize: '14px' }}>
            {intl
              .get(`${prompt}.view.notNeedPaidFlag.info`)
              .d(
                '若勾选【不需要支付】，则表示财务用户无需对此付款申请下的发票进行付款，请谨慎勾选！'
              )}
          </div>
        ),
        okText: intl.get(`hzero.common.button.ok`).d('确定'),
        onOk: () => {},
      });
    }
  }

  @Bind
  handleToContractCenter() {
    const { CCM_HOST } = process.env;
    const { requestNum } = this.state;
    window.open(`${CCM_HOST}/resaleView?requestNum=${requestNum}`, '_black');
  }

  /**
   * @name: 操作 - 判断申请人时候能编辑下沉付款责任人
   * @param {number} id 申请人id
   */
  hanldeSearchEmployeeFlag = async (id) => {
    const { costRequestId } = this.state;
    const res = await queryEmployeeFlag({ requestEmployeeId: id }, costRequestId);
    this.setState({ paymentOwnerEditFlag: res });
  };

  render() {
    const {
      status,
      supplierStatus,
      paymentDate,
      conversionRate,
      costRequestId,
      requestNum,
      sourceCode,
      lineAddAble,
      saving,
      submitting,
      activeKey,
      detailInfoDS,
      costRequestLoading,
      approvalReqRecVOList,
      currentNodeName,
      isPub,
      open,
      operators,
      exportPdfLoading = false,
      updateRiskCheckLoading = false,
      requestTitleLen,
      requestRemarksLen,
      errorMessage,
      viewOnly,
      viewButtonFlag,
      fetchLoading,
      preChecking,
      lineLoading,
      importFlag,
      riskWarning,
      otherRiskWarning,
      riskStatus,
      productType,
      productTypeModalVisible,
      returnToSupplierModalVisible,
      productTypeCodes,
      signFlag,
      requestEmployeeNum,
      payWriteOffData = {},
      stepsData = [],
      draftUserId,
      colorAnnotation = false,
      paymentOwnerFlag,
      needAutoCopyPermissionFlag,
      fileDownloadLoading = false,
      isCheckBankInfo = true,
      approvalRemind,
      cmiEmployeeInfo,
      transferOrderFlag,
      paymentOwnerEditFlag,
      userEmployeeId,
      requestDepartment,
    } = this.state;
    let { hasSubmitButton } = this.state;
    const { realName, loginName, id } = currentUser;
    hasSubmitButton = signFlag && requestEmployeeNum === loginName ? true : hasSubmitButton;
    const {
      history,
      location: { search },
      match: { path },
      idpValueMap = {},
    } = this.props;
    const isView = path.includes('/spcm/payment-request-view/detail/:id');
    const queryParams = queryString.parse(search.substr(1));
    const editable = ['DRAFT', 'REVOKE'].includes(status) && hasSubmitButton;
    const isOperator = operators.includes(realName);
    const { workflowtype } = queryParams;
    const defaultProductValue = typeof productType === 'string' ? productType.split(',') : [];
    const productTypeModalProps = {
      visible: productTypeModalVisible,
      options: productTypeCodes,
      defaultValue: defaultProductValue,
      onCancel: this.hideProductTypeModal,
    };
    const { standardFlag, amountFlag } = payWriteOffData;

    const financialViewPermission = (idpValueMap['SPUC.FIN_VIEW_USER'] || []).some(
      (i) => i.value === loginName
    );

    // 是否转网订单编辑权限
    const transferOrderFlagCanEdit = (
      idpValueMap['SRSP.PAYMENT_INFORM_EXCLUDE_DEPARTMENT'] || []
    ).some((i) => {
      return i.value === requestDepartment;
    });

    return (
      <>
        <Header>
          {!viewOnly &&
            ((isOperator &&
              hasSubmitButton &&
              ['DRAFT', 'PENDING_MODIFY', 'REVOKE', 'PENDING_REVIEW', 'TRANSPORTING'].includes(
                status
              )) ||
              (!draftUserId
                ? ['DRAFT'].includes(status) &&
                  ['EXTERNAL_SUBMIT', 'EXTERNAL_REFUSE'].includes(supplierStatus) &&
                  sourceCode === 'ISP' &&
                  approvalReqRecVOList.length === 0
                : ['DRAFT'].includes(status) &&
                  ['EXTERNAL_SUBMIT', 'EXTERNAL_REFUSE'].includes(supplierStatus) &&
                  sourceCode === 'ISP' &&
                  approvalReqRecVOList.length === 0 &&
                  id === draftUserId) ||
              (['PAYING'].includes(status) && currentNodeName.includes('起草人银行修改'))) && (
              <Button
                icon="save"
                onClick={this.handleSave}
                disabled={submitting}
                loading={saving && !submitting}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            )}
          {!viewOnly && (
            <Button
              icon="download"
              loading={exportPdfLoading}
              onClick={this.handleExportPdf}
              disabled={costRequestLoading}
            >
              {intl.get('spcm.paymentRequest.button.exportPdf').d('下载PDF')}
            </Button>
          )}
          {!viewOnly && (
            <>
              <Button
                icon="download"
                onClick={this.fileBatchDownload}
                loading={fileDownloadLoading}
              >
                {intl.get(`spcm.paymentRequest.button.fileDownload`).d('附件下载')}
              </Button>
              <LocaleProvider locale={currentLanguage === 'en_US' ? undefined : zhCN}>
                <ExcelExport
                  requestUrl={`${SRM_SPUC}/v1/${organizationId}/resale-payment-requests/resalePaymentExport`}
                  queryParams={{ costRequestId }}
                />
              </LocaleProvider>
            </>
          )}
          {!viewOnly &&
            ['DRAFT'].includes(status) &&
            ['EXTERNAL_SUBMIT', 'EXTERNAL_REFUSE'].includes(supplierStatus) &&
            sourceCode === 'ISP' &&
            (!draftUserId
              ? approvalReqRecVOList.length === 0 ||
                (approvalReqRecVOList.length === 1 && currentNodeName === '01 起草')
              : (approvalReqRecVOList.length === 0 ||
                  (approvalReqRecVOList.length === 1 && currentNodeName === '01 起草')) &&
                id === draftUserId) && (
              <Button icon="settings_backup_restore" onClick={this.openReturnModal}>
                {intl.get('spcm.paymentRequest.button.returnToSupplier').d('退回供应商')}
              </Button>
            )}
          {!viewOnly &&
            ['DRAFT'].includes(status) &&
            ['EXTERNAL_REJECT'].includes(supplierStatus) &&
            sourceCode === 'ISP' &&
            (!draftUserId
              ? approvalReqRecVOList.length === 0 ||
                (approvalReqRecVOList.length === 1 && currentNodeName === '01 起草')
              : (approvalReqRecVOList.length === 0 ||
                  (approvalReqRecVOList.length === 1 && currentNodeName === '01 起草')) &&
                id === draftUserId) && (
              <Button icon="settings_backup_restore" onClick={this.handleWithdraw}>
                {intl.get('spcm.paymentRequest.button.withdraw').d('撤回')}
              </Button>
            )}
          {financialViewPermission && (
            <Button onClick={this.handleToContractCenter}>
              {intl.get('spcm.paymentRequest.view.button.financialView').d('财务视图')}
            </Button>
          )}
          {!viewOnly && (
            <Button icon="sync" loading={updateRiskCheckLoading} onClick={this.updateRiskCheck}>
              {intl.get('srsp.riskmanagement.Risk.UpdateRisk').d('更新收付风险')}
            </Button>
          )}
          <Button onClick={this.handleFinancialAudit}>
            {intl.get('spcm.paymentRequest.button.financialAudit').d('财务审核说明')}
          </Button>
          {/* {!viewOnly && this.generateApprovalBtns()} */}
        </Header>
        <Content className={styles['content-bottom']}>
          <LocaleProvider locale={currentLanguage === 'en_US' ? undefined : zhCN}>
            <>
              {!isEmpty(stepsData) && (
                <CusStep
                  data={stepsData}
                  costRequestId={costRequestId}
                  pressLevel={this.state.detailInfoDS.current.get('pressLevel')}
                />
              )}
              {errorMessage && (
                <aside className={styles['error-message']}>
                  {errorMessage.map((item) => (
                    <p key={uuidv4()}>{item}</p>
                  ))}
                </aside>
              )}
              <Collapse activeKey={activeKey} onChange={this.handleCollapseChange}>
                <Collapse.Panel
                  header={intl.get(`spcm.paymentRequest.view.basic.info.title`).d('基本信息')}
                  key="basicInfo"
                >
                  <div className={styles['basic-info']}>
                    <Form
                      dataSet={this.state.detailInfoDS}
                      columns={3}
                      labelLayout={LabelLayout.horizontal}
                      labelWidth={150}
                      useColon
                      labelAlign="right"
                    >
                      <TextField name="requestNum" disabled label={this.renderRequestNum()} />
                      <Select
                        name="requestStatus"
                        disabled
                        // 付款申请状态统一优化：删除【已付款】状态下的说明
                        showHelp={['PROCESSED', 'NETTING'].includes(status) && 'tooltip'}
                        help={
                          // 付款申请状态统一优化：删除【已付款】状态下的说明
                          //(status === 'PAID' &&
                          //intl
                          //  .get('spcm.costPayment.help.requestStatus')
                          //   .d('因网上转账时延，预计两天哪收到款项，如有疑问可与财务部联系'))
                          (status === 'PROCESSED' &&
                            intl
                              .get('spcm.costPayment.help.Processed.requestStatus')
                              .d(
                                '2022年7月或之前部分历史数据, 未实现付款状态的自动回写, 如有需要请联系财务同事查询'
                              )) ||
                          (status === 'NETTING' &&
                            intl
                              .get('spcm.costPayment.help.netting.requestStatus')
                              .d('付款申请已全额对冲'))
                        }
                        renderer={({ value, record }) => {
                          const text = record.getField('requestStatus').getText(value) || '';
                          return ['PAID', 'NETTING'].includes(status)
                            ? `${text} ${paymentDate ? dateRender(paymentDate) : ''}`
                            : text;
                        }}
                      />
                      <TextField
                        name="requestDate"
                        renderer={({ value }) => moment(value).format('YYYY-MM-DD')}
                        disabled
                      />
                      <Lov
                        name="requestEmployeeName"
                        disabled={!editable || !isOperator || viewOnly}
                        label={this.renderRequestEmployeeName()}
                        onChange={(val) => {
                          if (val && val.employeeId) {
                            this.hanldeSearchEmployeeFlag(val.employeeId);
                          }
                        }}
                      />
                      <TextField name="draftEmployeeName" disabled />
                      <Select
                        name="companyOrgCode"
                        // tableProps={{ selectionMode: 'dblclick', alwaysShowRowBox: true }}
                        // noCache
                        disabled={!editable || !isOperator || viewOnly}
                      />
                      <TextField name="vendorCompanyNum" disabled />
                      <Lov
                        name="vendorCompany"
                        tableProps={{ selectionMode: 'dblclick', alwaysShowRowBox: true }}
                        noCache
                        disabled={!editable || !isOperator || viewOnly}
                        onChange={this.handleDeleteBankInfo}
                      />
                      <Select
                        name="pressLevel"
                        disabled={!editable || !isOperator || viewOnly}
                        onChange={this.changePressLevel}
                      />
                      <Lov
                        name="currency"
                        tableProps={{ selectionMode: 'dblclick', alwaysShowRowBox: true }}
                        noCache
                        disabled={!editable || !isOperator || viewOnly}
                      />
                      <TextField
                        name="totalAmount"
                        renderer={() => {
                          return numberRender(
                            sum(
                              this.state.invoiceInfoDS.records.map((item) =>
                                item.get('invoiceAmount')
                              )
                            ),
                            2
                          );
                        }}
                        className="right-align"
                        disabled
                      />
                      <DatePicker
                        name="expectPaymentDate"
                        disabled={!editable || !isOperator || viewOnly}
                        min={moment()}
                        label={this.renderExprctPaymentDate()}
                      />
                      <NumberField
                        name="conversionRate"
                        // className="center-algin"
                        // disabled={!editable || !isOperator || viewOnly}
                        disabled
                      />
                      <TextField
                        name="totalAmountHKD"
                        renderer={({ record }) =>
                          numberRender(
                            sum(
                              this.state.invoiceInfoDS.records.map((item) =>
                                item.get('invoiceAmount')
                              )
                            ) * record.get('conversionRate'),
                            2
                          )
                        }
                        className="right-align"
                        disabled
                      />
                      <Select
                        name="originalReceived"
                        dropdownMatchSelectWidth={false}
                        disabled={!editable || !isOperator || viewOnly}
                      />
                      <CheckBox
                        name="chequePayFlag"
                        onChange={this.chequePayFlagChange}
                        disabled={
                          !(
                            (editable && !viewOnly) ||
                            (currentNodeName.includes('起草人补充') &&
                              isOperator &&
                              this.state.detailInfoDS.current.get('bankReturnFlag') === 'Y') ||
                            (currentNodeName.includes('起草人银行修改') && isOperator)
                          )
                        }
                      />
                      <Select name="sourceCode" dropdownMatchSelectWidth={false} disabled />
                      <Select
                        name="expenseCategory"
                        dropdownMatchSelectWidth={false}
                        label={this.renderExpenseCategory()}
                        disabled={!editable || !isOperator || viewOnly}
                      />
                      <CheckBox
                        name="multiCurrencyFlag"
                        disabled={!editable || !isOperator || viewOnly}
                        onChange={this.changeMultiCurrencyFlag}
                      />
                      <Lov
                        name="actualCurrency"
                        tableProps={{ selectionMode: 'dblclick', alwaysShowRowBox: true }}
                        noCache
                        disabled={!editable || !isOperator || viewOnly}
                      />
                      <CheckBox
                        name="notNeedPaidFlag"
                        disabled={!editable || !isOperator || viewOnly}
                        onChange={this.changeNotNeedPaidFlag}
                      />
                      <Lov
                        name="paymentOwner" // 下沉责任人
                        tableProps={{ selectionMode: 'dblclick', alwaysShowRowBox: true }}
                        noCache
                        disabled={
                          paymentOwnerEditFlag === null
                            ? !editable || !(paymentOwnerFlag && ['DRAFT'].includes(status))
                            : !paymentOwnerEditFlag
                        }
                      />
                      <CheckBox
                        name="needAutoCopy"
                        disabled={
                          !editable || !isOperator || viewOnly || !needAutoCopyPermissionFlag
                        }
                      />
                      <Output
                        name="productType"
                        renderer={() => (
                          <a onClick={this.showProductTypeModal}>
                            {intl.get('spcm.paymentRequest.view.productType').d('查看业务类型')}
                          </a>
                        )}
                      />
                      <CheckBox
                        name="transferOrderFlag"
                        disabled={
                          !editable ||
                          !isOperator ||
                          viewOnly ||
                          !transferOrderFlagCanEdit ||
                          userEmployeeId !== detailInfoDS.current.get('draftEmployeeId')
                        }
                      />
                    </Form>
                    <Form
                      dataSet={this.state.detailInfoDS}
                      columns={1}
                      labelLayout={LabelLayout.horizontal}
                      labelWidth={150}
                      useColon
                      labelAlign="right"
                    >
                      <TextField
                        name="requestTitle"
                        disabled={!editable || !isOperator || viewOnly}
                        prefix="COS-"
                        className={styles['input-prefix']}
                        help={
                          isOperator && editable && !viewOnly
                            ? `${intl
                                .get(`spcm.costPayment.view.detail.characters.left`)
                                .d('剩余字符:')}${REQUEST_TITLE_MAX_LENGTH - requestTitleLen}`
                            : null
                        }
                        onInput={(e) => {
                          const { nativeEvent } = e;
                          const { value } = nativeEvent.target;
                          if (getStringBytes(value) > REQUEST_TITLE_MAX_LENGTH) {
                            const newValue = interceptString(value, REQUEST_TITLE_MAX_LENGTH);
                            nativeEvent.target.value = newValue;
                          }
                          this.handleRequestTitleInput(nativeEvent.target.value);
                        }}
                      />
                      <TextArea
                        name="requestRemarks"
                        disabled={!editable || !isOperator || viewOnly}
                        resize="vertical"
                        help={
                          isOperator && editable && !viewOnly
                            ? `${intl
                                .get(`spcm.costPayment.view.detail.characters.left`)
                                .d('剩余字符:')}${REQUEST_REMARKS_MAX_LENGTH - requestRemarksLen}`
                            : null
                        }
                        onInput={(e) => {
                          const { nativeEvent } = e;
                          const { value } = nativeEvent.target;
                          if (getStringBytes(value) > REQUEST_REMARKS_MAX_LENGTH) {
                            const newValue = interceptString(value, REQUEST_REMARKS_MAX_LENGTH);
                            nativeEvent.target.value = newValue;
                          }
                          this.handleRequestRemarksInput(nativeEvent.target.value);
                        }}
                      />

                      {riskWarning && transferOrderFlag !== 'Y' && (
                        <Output
                          label={this.renderRiskWarningLabel()}
                          name="riskWarningMeaning"
                          renderer={this.rendererRiskWarning}
                          help="test"
                          showHelp="tooltip"
                          style={{
                            height: '90px',
                            overflowY: 'scroll',
                            border: '0.01rem solid rgba(0, 0, 0, 0.2)',
                          }}
                        />
                      )}

                      {(otherRiskWarning || riskStatus == 1) && (
                        <Output
                          label={this.renderOtherRiskWarningLabel()}
                          name="otherRiskWarningMeaning"
                          renderer={this.rendererOtherRiskWarning}
                          style={{
                            height: '90px',
                            overflowY: 'scroll',
                            border: '0.01rem solid rgba(0, 0, 0, 0.2)',
                          }}
                        />
                      )}
                      {approvalRemind?.haveApprovalRemind === 'Y' && (
                        <Output
                          label={this.renderApprovalRemindLabel()}
                          name="approvalRemind"
                          renderer={this.rendererApprovalRemind}
                          style={{
                            height: '90px',
                            overflowY: 'scroll',
                            border: '0.01rem solid rgba(0, 0, 0, 0.2)',
                          }}
                        />
                      )}
                    </Form>
                  </div>
                </Collapse.Panel>
                <Collapse.Panel
                  header={intl.get(`spcm.paymentRequest.view.payment.info.title`).d('付款明细')}
                  key="paymentDetail"
                >
                  {standardFlag === 'Y' && amountFlag === 'Y' && (
                    <>
                      <Tag.CheckableTag key="soHead" style={{ fontSize: '13px', margin: '4px 0' }}>
                        {intl.get(`${prompt}.view.pay.tabWriteOffDetail`).d('支付及核销信息')}
                      </Tag.CheckableTag>
                      <TabWriteOffDetail
                        payWriteOffData={payWriteOffData}
                        prompt={'spcm.costPayment'}
                      />
                    </>
                  )}
                  <Tag.CheckableTag key="head" style={{ fontSize: '13px', margin: '4px 0' }}>
                    {intl
                      .get('spcm.costPayment.view.pay.tabToViewDetail')
                      .d('账单列表 （点击账单进行切换查看账单明细）')}
                  </Tag.CheckableTag>
                  <InvoiceTable
                    dataSet={this.state.invoiceInfoDS}
                    onImportData={this.handleBatchImport}
                    editable={editable}
                    isOperator={isOperator}
                    status={status}
                    currentNodeName={currentNodeName}
                    viewOnly={viewOnly}
                    lineLoading={lineLoading}
                    hasSubmitButton={hasSubmitButton}
                    importLoading={importFlag}
                    prompt={'spcm.costPayment'}
                    idpValueMap={idpValueMap}
                  />
                  <Tag.CheckableTag key="line" style={{ fontSize: '13px', margin: '15px 0 4px 0' }}>
                    {intl.get('spcm.costPayment.view.pay.detail').d('账单明细')}
                    {colorAnnotation && (
                      <span style={{ marginLeft: '10px', color: 'red' }}>
                        {intl
                          .get('spcm.costPayment.view.colorAnnotation.tips')
                          .d(
                            '注：橙色底色的明细行关联的是纯转售的标准品采购订单，黄色底色的明细行关联的是EC会审批的标准品采购订单。'
                          )}
                      </span>
                    )}
                  </Tag.CheckableTag>
                  <InvoiceLines
                    costRequestId={costRequestId}
                    dataSet={this.state.invoiceLineDS}
                    editable={editable}
                    isOperator={isOperator}
                    status={status}
                    conversionRate={conversionRate}
                    lineAddAble={lineAddAble}
                    isCreate={false}
                    currentNodeName={currentNodeName}
                    onPoDetail={this.handlePoDetail}
                    onSoDetail={this.handleSoDetail}
                    viewOnly={viewOnly}
                    lineLoading={lineLoading}
                    hasSubmitButton={hasSubmitButton}
                    switchModalContainerClassName={switchModalContainerClassName}
                    idpValueMap={idpValueMap}
                  />
                </Collapse.Panel>
                <Collapse.Panel
                  header={intl.get(`spcm.paymentRequest.view.bankInfo.info.title`).d('银行信息')}
                  key="bankInfo"
                >
                  <BankInfo
                    dataSet={this.state.bankInfoDS}
                    detailInfoDS={this.state.detailInfoDS}
                    costRequestId={costRequestId}
                    currentNodeName={currentNodeName}
                    isOperator={isOperator}
                    status={status}
                    isPub={isPub}
                    viewOnly={viewOnly}
                    history={history}
                    isCheckBankInfo={isCheckBankInfo}
                  />
                </Collapse.Panel>
                <Collapse.Panel
                  header={intl.get(`spcm.paymentRequest.view.attchment.info.title`).d('附件上传')}
                  key="attachmentUpload"
                >
                  <Tag.CheckableTag
                    key="others"
                    style={{ fontSize: '13px', margin: '8px 0 4px 0' }}
                  >
                    {intl.get('spcm.costPayment.view.file.other').d('其他附件')}
                  </Tag.CheckableTag>
                  <AttachmentTable
                    dataSet={this.state.otherAttachmentTableDS}
                    editable={editable}
                    isOperator={isOperator}
                    currentNodeName={currentNodeName}
                    viewOnly={viewOnly}
                    isOther
                    hasSubmitButton={hasSubmitButton}
                  />
                  <Tag.CheckableTag
                    key="required"
                    style={{ fontSize: '13px', margin: '15px 0 4px 0' }}
                  >
                    <span style={{ display: 'flex' }}>
                      {intl.get('spcm.costPayment.view.file.require').d('必要附件')}
                      <Tooltip
                        title={intl
                          .get('spcm.paymentRequest.view.requiredAttachment.tooltip')
                          .d('必要附件仅供下载查看，不可手动上传')}
                      >
                        <Icon style={{ color: '#0085d0' }} type="help_outline" />
                      </Tooltip>
                    </span>
                  </Tag.CheckableTag>
                  <AttachmentTable
                    dataSet={this.state.attachmentTableDS}
                    editable={editable}
                    isOperator={isOperator}
                    currentNodeName={currentNodeName}
                    viewOnly={viewOnly}
                    hasSubmitButton={hasSubmitButton}
                  />
                </Collapse.Panel>
                <Collapse.Panel
                  header={intl
                    .get(`spcm.paymentRequest.view.supllyAttachment.info.title`)
                    .d('补充附件')}
                  key="supplyAttachment"
                >
                  {this.state.supplyAttachmentDS.records.length < 1 &&
                    this.state.detailInfoDS.current.data.checkDateFlag === 'Y' && (
                      <span style={{ color: 'red' }}>
                        {intl
                          .get(`${prompt}.view.message.supplyAttachment.notProvided`)
                          .d('银行自付款日起30天，尚未提供付款凭证信息')}
                      </span>
                    )}
                  <SupplyAttachment
                    dataSet={this.state.supplyAttachmentDS}
                    viewButtonFlag={viewButtonFlag}
                  />
                </Collapse.Panel>
                <Collapse.Panel
                  header={intl.get(`spcm.paymentRequest.view.approval.info.title`).d('审批历史')}
                  key="approvalList"
                >
                  {approvalReqRecVOList.length > 0 && (
                    <ApprovalList dataSource={approvalReqRecVOList} />
                  )}
                </Collapse.Panel>
              </Collapse>
            </>
          </LocaleProvider>
        </Content>
        {!viewOnly && <div className={styles['approval-btn']}>{this.generateApprovalBtns()}</div>}
        <Spin
          className={styles.spin}
          spinning={costRequestLoading || fetchLoading || preChecking}
          style={{ display: costRequestLoading || fetchLoading || preChecking ? 'flex' : 'none' }}
          tip={
            preChecking && (
              <div style={{ fontSize: '18px', fontWeight: 'bolder' }}>
                {intl
                  .get(`spcm.paymentRequest.view.paymentRequest.loading`)
                  .d('正在后台验证相关数据，请稍等')}
              </div>
            )
          }
        />
        {productTypeModalVisible && <ProductTypeModal {...productTypeModalProps} />}
        {/* 退回供应商原因 */}
        {returnToSupplierModalVisible && (
          <ReturnToSupplier
            visible={returnToSupplierModalVisible}
            onCancel={() => this.openReturnModal(false)}
            onOk={this.handleReturnToSupplier}
          />
        )}
      </>
    );
  }
}
