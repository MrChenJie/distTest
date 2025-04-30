import React, { Component } from 'react';
import { Collapse, Row, Col, LocaleProvider, Avatar, Spin } from 'hzero-ui';
// eslint-disable-next-line camelcase
import formatterCollections from 'utils/intl/formatterCollections';
import { routerRedux } from 'dva/router';
import { sum } from 'lodash';
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
import { SRM_SPUC, SRM_PLATFORM } from '_utils/config';
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
  Button,
} from 'choerodon-ui/pro';
import { Tag, Icon } from 'choerodon-ui';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import uuidv4 from 'uuid/v4';
import { Header, Content } from 'components/Page';
import { queryIdpValue } from 'services/api';
import ExcelExport from '@/components/ExcelExport';
import notification from 'utils/notification';
import detailInfo from './dataset/detailInfoDS';
import InvoiceTable from './components/InvoiceTable';
import invoiceInfo from './dataset/invoiceTableDS';
import invoiceLine from './dataset/invoiceLineDS';
import InvoiceLines from './components/InvoiceLines';
import attachmentTable from './dataset/attachmentTableDS';
import otherAttachmentTable from './dataset/otherAttachmentTableDS';
import AttachmentTable from './components/AttachmentTable';
import ApprovalList from './components/ApprovalList';
import styles from './index.less';
import { getStringBytes, interceptString } from './utils';
import ProductTypeModal from './components/ProductTypeModal/index';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import { fastCodeLoader } from '@/utils/decorators';
import { closeWindow } from '_cus_utils/utils';

const organizationId = getCurrentOrganizationId();
const currentUser = getCurrentUser();
const currentLanguage = getCurrentLanguage();
const { Option } = Select;

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

async function submitPreCheck(costRequestId) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/resale-payment-requests/submit-pre-check/${costRequestId}`,
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

const prompt = 'spcm.paymentRequest';
@formatterCollections({ code: [prompt, 'spcm.costPayment'] })
@fastCodeLoader(['SPFM.ICON_LINK_CONFIG'])
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
        onLoadSuccess: () => {
          this.setState({
            lineLoading: false,
          });
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
    invoiceInfoDS.bind(detailInfoDS, 'resaleDetailInvoiceList');
    attachmentTableDS.bind(detailInfoDS, 'AttachmentList');
    otherAttachmentTableDS.bind(detailInfoDS, 'otherAttachmentList');
    invoiceLineDS.bind(invoiceInfoDS, 'resaleDetailLineList');
    const isPub = this.props.location.pathname.includes('pub'); // 判断是否为pub页面
    const { open, workflowtype } = queryString.parse(this.props.location.search.substr(1)); // 判断是否飞书打开

    this.state = {
      open,
      isPub,
      detailInfoDS,
      invoiceInfoDS,
      invoiceLineDS,
      attachmentTableDS,
      otherAttachmentTableDS,
      isCreate: id === 'create',
      lineAddAble: false,
      saving: false,
      submitting: false,
      costRequestLoading: false,
      costRequestId: id,
      activeKey: ['basicInfo', 'bankInfo', 'paymentDetail', 'attachmentUpload', 'approvalList'],
      approvalReqRecVOList: [],
      currentNodeName: '',
      operators: [],
      requestTitleLen: 0,
      requestRemarksLen: 0,
      workflowtype,
      errorMessage: undefined,
      viewOnly: path.includes('/spcm/payment-request-view/detail/:id'),
      fetchLoading: true,
      preChecking: false,
      lineLoading: false,
      hasSubmitButton: false, // 是否有提交审批按钮
      importFlag: false, // 导入标识
      riskWarning: '',

      productType: undefined,
      productTypeModalVisible: false,
      productTypeCodes: [],
    };
    if (id !== 'create') {
      detailInfoDS.query();
    }
  }

  remarkDS = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'select',
        type: 'string',
      },
      {
        name: 'remark',
        type: 'string',
      },
    ],
  });

  @Bind()
  selectChange(value) {
    if (value !== '1') this.remarkDS.current.set('remark', value);
  }

  componentDidMount() {
    const { costRequestId } = this.state;
    const { location = {} } = this.props;
    const { state = {} } = location;
    const { newFlag = false } = state;
    window.addEventListener('message', this.receiveMessage, false);
    this.workFlowDetailInfo(+costRequestId, !newFlag ? 1 : undefined);
    this.initPermission();
    this.fetchProductTypeCodes();
    this.loadIbossSoUrl();
  }

  componentDidUpdate() {
    this.changeHelpIcon();
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
      // this.state.detailInfoDS.query();
    } else if (routerParam.opt === 'close') {
      Modal.destroyAll();
      switchModalContainerClassName();
      // this.getDataSetDetail();
      // window.close();
      // this.state.detailInfoDS.query();
      // this.workFlowDetailInfo(+costRequestId, 1);
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
      notification.warning({
        message: intl
          .get(`spcm.paymentRequest.message.warning.unmodified.save`)
          .d('未对页面进行修改！'),
      });
      return;
    }
    if (!current.dirty) {
      current.set('validateFlag', uuidv4());
    }
    // detailInfoDS.validate().then((res) => {
    //   if (res) {
    this.setState({
      saving: true,
    });
    // const { validate } = detailInfoDS;
    // detailInfoDS.validate = () => true;
    detailInfoDS.submit().then((valid) => {
      if (valid && valid.success) {
        notification.success();
      }
    });
    // .finally(() => {
    //   detailInfoDS.validate = validate;
    // });
    //   } else {
    //     this.setState({
    //       saving: false,
    //     });
    //     notification.warning({
    //       message: intl.get('spcm.paymentRequest.warning.message.validate.failed').d('校验失败！'),
    //     });
    //   }
    // });
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
    notification.warning({
      message: error.message,
    });
    this.setState({
      saving: false,
      submitting: false,
    });
  }

  @Bind()
  handleLoadSuccess(resp = {}) {
    const { costPaymentRequest = {} } = resp;
    const {
      requestStatus,
      conversionRate,
      requestTitle,
      requestRemarks,
      paymentDate,
      productType,
      riskWarningMeaning,
      draftEmployeeId, // 起草人id
      requestEmployeeId, // 申请人id
      requestEmployeeNum, // 申请人编码
      signFlag, // 是否会签给申请人
      returnRequestId, // EBS request id
    } = costPaymentRequest;
    this.setState({
      status: requestStatus,
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
      signFlag,
      draftEmployeeId,
      requestEmployeeId,
      requestEmployeeNum,
      returnRequestId,
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
    // const { detailInfoDS, costRequestId } = this.state;
    // detailInfoDS.query();
    // this.workFlowDetailInfo(+costRequestId, 1);
    this.handleSave(true);
    // notification.success();
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
          this.state.detailInfoDS.query();
        } else {
          if (times === 1) {
            this.state.detailInfoDS.query();
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
      .sort((one, two) => {
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
          } else {
            if (
              item.buttonKey === 'HandleForwardName' &&
              ['DRAFT', 'REVOKE', undefined].includes(status)
            ) {
              return null;
            }
            return (
              <Tooltip placement="top" title={isEn ? item.nameE : item.name}>
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
          }
        } else {
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
        }
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
    const { costRequestId, preChecking, currentNodeName } = this.state;
    // 判断是否在校验状态，是则中断后续操作
    if (preChecking) {
      return false;
    }
    this.optionButtonKey = record.buttonKey;
    if (['submitName', 'takingopinionsName'].includes(record.buttonKey)) {
      const { detailInfoDS } = this.state;
      if (!detailInfoDS.dirty) {
        this.setState({
          preChecking: true,
        });
        submitPreCheck(costRequestId).then((res) => {
          this.setState({
            preChecking: false,
          });
          if (!res) {
            switchModalContainerClassName();
            return false;
          }
          if (!res.failed) {
            const { costPaymentRequest = {} } = detailInfoDS.current.toData() || {};
            const {
              invoiceHkAmountTotal,
              companyOrgCode,
              signFlag,
              requestStatus,
              requestEmployeeId,
              draftEmployeeId,
            } = costPaymentRequest; // 判断是否为总部，总部编码为1510，是则判断大于100万，否则判断大于50万
            const thresholdAmount = companyOrgCode === '1510' ? 1000000 : 500000;
            if (['submitName'].includes(record.buttonKey)) {
              if (!signFlag && requestStatus === 'DRAFT' && requestEmployeeId != draftEmployeeId) {
                notification.error({
                  message: intl
                    .get('spcm.costPayment.modal.children.signToRequestEmployee')
                    .d('请会签给申请人'),
                });
                switchModalContainerClassName();
                return false;
              }
            }
            if (
              record.buttonKey === 'submitName' &&
              currentNodeName === '05 财务第一复核人审批' &&
              invoiceHkAmountTotal &&
              invoiceHkAmountTotal > thresholdAmount
            ) {
              Modal.info({
                key: Modal.key(),
                children: intl.get('spcm.costPayment.modal.tip.submit.largeAmount', {
                  amount: numberRender(thresholdAmount, 2),
                }),
                okText: intl.get('spcm.costPayment.modal.okText.haveRead').d('已阅读'),
              }).then(() => {
                this.openIframe(record);
              });
            } else {
              this.openIframe(record);
            }
          } else {
            switchModalContainerClassName();
            const { message } = res;
            this.setState(
              {
                errorMessage: typeof message === 'string' ? message.split(';') : undefined,
              },
              () => {
                this.handleScrollTop();
              }
            );
          }
        });
      } else {
        detailInfoDS.submit().then((valid) => {
          if (valid && valid.success) {
            this.setState({
              preChecking: true,
            });
            submitPreCheck(costRequestId).then((res) => {
              this.setState({
                preChecking: false,
              });
              if (!res) {
                switchModalContainerClassName();
                return false;
              }
              if (!res.failed) {
                const { costPaymentRequest = {} } = detailInfoDS.current.toData() || {};
                const {
                  invoiceHkAmountTotal,
                  companyOrgCode,
                  signFlag,
                  requestStatus,
                  requestEmployeeId,
                  draftEmployeeId,
                } = costPaymentRequest;
                const thresholdAmount = companyOrgCode === '1510' ? 1000000 : 500000;

                if (['submitName'].includes(record.buttonKey)) {
                  if (
                    !signFlag &&
                    requestStatus === 'DRAFT' &&
                    requestEmployeeId != draftEmployeeId
                  ) {
                    notification.error({
                      message: intl
                        .get('spcm.costPayment.modal.children.signToRequestEmployee')
                        .d('请会签给申请人'),
                    });
                    switchModalContainerClassName();
                    return false;
                  }
                }

                if (
                  currentNodeName === '05 财务第一复核人审批' &&
                  invoiceHkAmountTotal &&
                  invoiceHkAmountTotal > thresholdAmount
                ) {
                  Modal.info({
                    key: Modal.key(),
                    children: intl.get('spcm.costPayment.modal.tip.submit.largeAmount', {
                      amount: numberRender(thresholdAmount, 2),
                    }),
                    okText: intl.get('spcm.costPayment.modal.okText.haveRead').d('已阅读'),
                  }).then(() => {
                    this.openIframe(record);
                  });
                } else {
                  this.openIframe(record);
                }
              } else {
                switchModalContainerClassName();
                const { message } = res;
                this.setState(
                  {
                    errorMessage: typeof message === 'string' ? message.split(';') : undefined,
                  },
                  () => {
                    this.handleScrollTop();
                  }
                );
              }
            });
          }
        });
      }
    } else {
      Modal.open({
        key: Modal.key(),
        title: currentLanguage === 'en_US' ? record.nameE : record.name,
        maskClosable: true,
        closable: true,
        destroyOnClose: true,
        footer: null,
        style: {
          width: `${record.width > 1200 ? record.width - 300 : record.width}px`,
          height: `${record.height}px`,
          maxWidth: '90vw',
          overflow: 'hidden',
        },
        onClose: () => {
          switchModalContainerClassName();
        },
        children: (
          <iframe
            title="urlContent"
            src={record.url}
            frameBorder="0"
            style={{ width: '100%', overflow: 'auto', height: '100%' }}
            marginWidth="1"
            marginHeight="1"
          />
        ),
      });
    }

    switchModalContainerClassName(true);
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
    }
    switchModalContainerClassName(true);
  }

  lastApprovalPrecheck(costRequestId) {
    this.setState({
      preChecking: true,
    });
    submitPreCheck(costRequestId).then((res) => {
      this.setState({
        preChecking: false,
      });
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
              <Col span={4}>
                <Select name="select" onChange={this.selectChange}>
                  <Option
                    value={intl
                      .get('spcm.paymentRequest.valuelist.meaning.pleasehandle')
                      .d('请处理')}
                  >
                    {intl.get('spcm.paymentRequest.valuelist.meaning.pleasehandle').d('请处理')}
                  </Option>
                  <Option value="1">
                    {intl
                      .get('spcm.paymentRequest.valuelist.meaning.choosecommonwords')
                      .d('选择常用语')}
                  </Option>
                </Select>
              </Col>
            </Row>
            <Row style={{ marginTop: '10px' }}>
              <Col span={24}>
                <TextArea
                  name="remark"
                  placeholder={intl.get('spcm.paymentRequest.placeholder.pleaseinput').d('请输入')}
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
          const { remark } = this.remarkDS.current.data;
          this.lastApproval(costRequestId, requestId, loginId, remark, params);
        },
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
          notification.error({
            description: <p style={{ wordBreak: 'break-all' }}>{resonseData.message}</p>,
            duration: null,
          });

          this.setState({
            costRequestLoading: false,
          });
        } else {
          // 提交审批成功 刷新详情信息/审批流
          notification.success();
          // this.getDataSetDetail();
          // window.close();
          // this.state.detailInfoDS.query();
          this.pollingWorkFLowDetail('001 归档');
          // const { isPub, workflowtype } = this.state;
          // // 是否待办打开
          // if (workflowtype) {
          //   window.close();
          // } else {
          //   const { history } = this.props;
          //   history.push(`${isPub ? '/pub' : ''}/spcm/payment-request/query`);
          // }
        }
        // this.workFlowDetailInfo(+params.costRequestId, 1);
      })
      .catch(() => {
        this.setState({
          costRequestLoading: false,
          lastApprovalFlag: false,
        });
        notification.error({
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

  @Bind()
  rendererRiskWarning() {
    let { riskWarning } = this.state;
    let result;
    riskWarning = riskWarning.split(';');
    if (Array.isArray(riskWarning)) {
      result = riskWarning.map((item) => <p style={{ marginBottom: '0px' }}>{item}</p>);
    }
    return <div style={{ color: '#d50000' }}>{result}</div>;
  }

  @Bind()
  renderRiskWarningLabel() {
    const label = intl.get(`spcm.paymentRequest.view.detail.riskWarning`).d('风险提示');
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
      <span>
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
      <span>
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

  render() {
    const {
      status,
      paymentDate,
      conversionRate,
      costRequestId,
      lineAddAble,
      saving,
      submitting,
      activeKey,
      // detailInfoDS,
      costRequestLoading,
      approvalReqRecVOList,
      currentNodeName,
      isPub,
      open,
      operators,
      exportPdfLoading = false,
      requestTitleLen,
      requestRemarksLen,
      errorMessage,
      viewOnly,
      fetchLoading,
      preChecking,
      lineLoading,
      importFlag,
      riskWarning,
      productType,
      productTypeModalVisible,
      productTypeCodes,
      signFlag,
      requestEmployeeNum,
    } = this.state;
    let { hasSubmitButton } = this.state;
    const { realName, loginName } = currentUser;
    hasSubmitButton = signFlag && requestEmployeeNum === loginName ? true : hasSubmitButton;
    const {
      location: { search },
      match: { path },
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
    return (
      <>
        <Header
          /* title={
            open === 'fs'
              ? intl.get('spcm.paymentRequest.view.fsTitle').d('付款申请【转售采购成本】')
              : intl.get('spcm.paymentRequest.view.title').d('转售采购成本付款申请')
          } */
          backPath={
            !workflowtype &&
            `${isPub ? '/pub' : ''}/spcm/payment-request${isView ? '-view' : ''}/query${
              open ? '?open=fs' : ''
            }`
          }
        >
          {!viewOnly &&
            isOperator &&
            hasSubmitButton &&
            ['DRAFT', 'PENDING_MODIFY', 'REVOKE', 'PENDING_REVIEW'].includes(status) && (
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
            <LocaleProvider locale={currentLanguage === 'en_US' ? undefined : zhCN}>
              <ExcelExport
                requestUrl={`${SRM_SPUC}/v1/${organizationId}/resale-payment-requests/resalePaymentExport`}
                queryParams={{ costRequestId }}
              />
            </LocaleProvider>
          )}
          {/* {!viewOnly && this.generateApprovalBtns()} */}
        </Header>
        <Content className={styles['content-bottom']}>
          <LocaleProvider locale={currentLanguage === 'en_US' ? undefined : zhCN}>
            <>
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
                        showHelp={status === 'PAID' && 'tooltip'}
                        help={
                          status === 'PAID' &&
                          intl
                            .get('spcm.costPayment.help.requestStatus')
                            .d('因网上转账时延，预计两天哪收到款项，如有疑问可与财务部联系')
                        }
                        renderer={({ value, record }) => {
                          const text = record.getField('requestStatus').getText(value) || '';
                          return status === 'PAID'
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
                      />
                      <TextField name="draftEmployeeName" disabled />
                      <Select
                        name="companyOrgCode"
                        // tableProps={{ selectionMode: 'dblclick', alwaysShowRowBox: true }}
                        // noCache
                        disabled={!editable || !isOperator || viewOnly}
                      />
                      <Select name="pressLevel" disabled={!editable || !isOperator || viewOnly} />
                      <TextField name="vendorCompanyNum" disabled />
                      <Lov
                        name="vendorCompany"
                        tableProps={{ selectionMode: 'dblclick', alwaysShowRowBox: true }}
                        noCache
                        disabled={!editable || !isOperator || viewOnly}
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
                      <NumberField
                        name="conversionRate"
                        // className="center-algin"
                        // disabled={!editable || !isOperator || viewOnly}
                        disabled
                      />
                      <Select
                        name="originalReceived"
                        dropdownMatchSelectWidth={false}
                        disabled={!editable || !isOperator || viewOnly}
                      />
                      <Output
                        name="productType"
                        renderer={() => (
                          <a onClick={this.showProductTypeModal}>
                            {intl.get('spcm.paymentRequest.view.productType').d('查看业务类型')}
                          </a>
                        )}
                      />
                      {/* <TextArea
                      name="requestTitle"
                      disabled={!editable || !isOperator}
                      resize="vertical"
                    />
                    <TextArea
                      name="requestRemarks"
                      disabled={!editable || !isOperator}
                      resize="vertical"
                    /> */}
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

                      {riskWarning && (
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
                    </Form>
                  </div>
                </Collapse.Panel>
                {/* <Collapse.Panel */}
                {/*  header={intl.get(`spcm.paymentRequest.view.bank.info.title`).d('银行信息')} */}
                {/*  key="bankInfo" */}
                {/* > */}
                {/*  <div className={styles['basic-info']}> */}
                {/*    <Form */}
                {/*      dataSet={this.state.detailInfoDS} */}
                {/*      columns={2} */}
                {/*      labelLayout={LabelLayout.horizontal} */}
                {/*      labelWidth={150} */}
                {/*      useColon */}
                {/*      labelAlign="right" */}
                {/*    > */}
                {/*      <TextField */}
                {/*        name="bankAccountName" */}
                {/*        disabled={!editable || !isOperator || viewOnly} */}
                {/*      /> */}
                {/*      <TextField */}
                {/*        name="bankAccountNum" */}
                {/*        disabled={!editable || !isOperator || viewOnly} */}
                {/*      /> */}
                {/*      <TextField name="bankName" disabled={!editable || !isOperator || viewOnly} /> */}
                {/*      <TextField name="swiftCode" disabled={!editable || !isOperator || viewOnly} /> */}
                {/*    </Form> */}
                {/*  </div> */}
                {/* </Collapse.Panel> */}
                <Collapse.Panel
                  header={intl.get(`spcm.paymentRequest.view.payment.info.title`).d('付款明细')}
                  key="paymentDetail"
                >
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
                  />
                  <Tag.CheckableTag key="line" style={{ fontSize: '13px', margin: '15px 0 4px 0' }}>
                    {intl.get('spcm.costPayment.view.pay.detail').d('账单明细')}
                  </Tag.CheckableTag>
                  <InvoiceLines
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
                  />
                </Collapse.Panel>
                <Collapse.Panel
                  header={intl.get(`spcm.paymentRequest.view.attchment.info.title`).d('附件上传')}
                  key="attachmentUpload"
                >
                  <Tag.CheckableTag
                    key="required"
                    style={{ fontSize: '13px', margin: '8px 0 4px 0' }}
                  >
                    {intl.get('spcm.costPayment.view.file.require').d('必要附件')}
                  </Tag.CheckableTag>
                  <div style={{ height: 0, color: '#d50000' }}>
                    <span>
                      {intl
                        .get('spcm.costPayment.view.tip.requiredAttachment')
                        .d(
                          '注意：当上传附件选择附件类型为发票时，对应附件会开放给供应商查看，请注意发票类型的附件只能上传发票附件。'
                        )}
                    </span>
                  </div>
                  <AttachmentTable
                    dataSet={this.state.attachmentTableDS}
                    editable={editable}
                    isOperator={isOperator}
                    currentNodeName={currentNodeName}
                    viewOnly={viewOnly}
                    hasSubmitButton={hasSubmitButton}
                  />
                  <Tag.CheckableTag
                    key="others"
                    style={{ fontSize: '13px', margin: '15px 0 4px 0' }}
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
        />
        {productTypeModalVisible && <ProductTypeModal {...productTypeModalProps} />}
      </>
    );
  }
}
