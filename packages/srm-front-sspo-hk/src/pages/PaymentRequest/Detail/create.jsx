import React, { PureComponent } from 'react';
import { Collapse, LocaleProvider, Spin } from 'hzero-ui';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import { routerRedux } from 'dva/router';
import formatterCollections from 'utils/intl/formatterCollections';
import { sum } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import moment from 'moment';
import intl from 'utils/intl';
import { numberRender } from 'utils/renderer';
import request from 'utils/request';
import { SRM_SPUC } from '_utils/config';
import {
  getCurrentOrganizationId,
  getCurrentUser,
  getCurrentLanguage,
  getResponse,
} from 'utils/utils';
import { Form, DataSet, Lov, TextField, TextArea, Select, Button, Tooltip } from 'choerodon-ui/pro';
import { Icon, Tag } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import querystring from 'querystring';
import detailInfo from './dataset/detailInfoDS';
import InvoiceTable from './components/InvoiceTable';
import invoiceInfo from './dataset/invoiceTableDS';
import invoiceLine from './dataset/invoiceLineDS';
import InvoiceLines from './components/InvoiceLines';
import attachmentTable from './dataset/attachmentTableDS';
import otherAttachmentTable from './dataset/otherAttachmentTableDS';
import AttachmentTable from './components/AttachmentTable';
import styles from './index.less';
import { getStringBytes, interceptString } from './utils';

const prompt = 'spcm.paymentRequest';
const organizationId = getCurrentOrganizationId();
const currentUser = getCurrentUser();
const currentLanguage = getCurrentLanguage();

const REQUEST_TITLE_MAX_LENGTH = 170;
const REQUEST_REMARKS_MAX_LENGTH = 770;

// const queryLovData = async function (lovCode) {
//   return request(`/hpfm/v1/${organizationId}/lovs/data`, {
//     method: 'GET',
//     query: {
//       lovCode,
//     },
//   });
// };
async function fetchPermission(params) {
  return request(`/spfm/v1/${organizationId}/pub-ctl-permissions/edit`, {
    method: 'POST',
    body: params,
  });
}

@formatterCollections({ code: [prompt, 'spcm.costPayment'] })
@observer
export default class CostPaymentRequestDetail extends PureComponent {
  constructor(props) {
    super(props);
    const defaultValue = querystring.parse(this.props.location.search.substring(1));
    const detailInfoDS = new DataSet(
      detailInfo({
        onSaveSuccess: this.handleSaveSuccess,
        onSaveOrSubmitFaild: this.handleSaveOrSubmitFaild,
        onLoadSuccess: this.handleLoadSuccess,
        defaultValue,
        onUpdate: () => {
          this.setState({});
        },
      })
    );
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
        onDeleteSuccess: this.handleDeleteLineSuccess,
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
    // attachmentTableDS.bind(detailInfoDS, 'costAttachFileList');
    attachmentTableDS.bind(detailInfoDS, 'AttachmentList');
    otherAttachmentTableDS.bind(detailInfoDS, 'otherAttachmentList');
    invoiceLineDS.bind(invoiceInfoDS, 'resaleDetailLineList');
    const isPub = this.props.location.pathname.includes('pub'); // 判断是否为pub页面
    const { open } = querystring.parse(this.props.location.search.substr(1)); // 判断是否飞书打开
    this.state = {
      open,
      isPub,
      detailInfoDS,
      invoiceInfoDS,
      invoiceLineDS,
      attachmentTableDS,
      otherAttachmentTableDS,
      isCreate: true,
      lineAddAble: false,
      saving: false,
      submitting: false,
      activeKey: ['basicInfo', 'bankInfo', 'paymentDetail', 'attachmentUpload'],
      currentNodeName: '',
      requestTitleLen: 0,
      requestRemarksLen: 0,
      viewOnly: true,
    };
  }

  componentDidMount() {
    this.getEmployeeName();
    this.getCompanyName();
    this.initPermission();
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
        this.setState({
          viewOnly: editFlag !== 'Y',
        });
      }
    });
  }

  getEmployeeName() {
    request(`/hpfm/v1/${organizationId}/employees/employee-num`, {
      method: 'GET',
      query: {
        organizationId,
        employeeNum: currentUser.loginName,
      },
    }).then((res) => {
      if (res.failed) {
        notification.error({
          message: res.message,
        });
        return;
      }
      const { detailInfoDS } = this.state;
      const employeeName = getCurrentLanguage() === 'en_US' ? res.nameEn : res.name;
      if (detailInfoDS.current) {
        detailInfoDS.current.set('requestEmployeeName', { name: employeeName });
        detailInfoDS.current.set('requestEmployeeNum', currentUser.loginName);
        detailInfoDS.current.set('draftEmployeeName', employeeName);
        detailInfoDS.current.set('draftEmployeeId', res.employeeId);
      }
    });
  }

  getCompanyName() {
    request(`${SRM_SPUC}/v1/${organizationId}/cost-payment-requests/getDefaultCompanyCode`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    }).then((res) => {
      if (getResponse(res)) {
        const { companyCode } = res;
        const { detailInfoDS } = this.state;
        const { current } = detailInfoDS;
        current.set('companyOrgCode', companyCode);
        // 获取默认公司主体code
        // queryLovData('VP.PRICE_CONTRACT_SIGN_ENTITY').then((r) => {
        //   if (getResponse(r)) {
        //     const companyOrg = r.find((item) => item.value === companyCode);
        //     if (companyOrg) {
        //       const { detailInfoDS } = this.state;
        //       const { current } = detailInfoDS;
        //       current.set('companyOrg', companyOrg);
        //     }
        //   }
        // });
      }
    });
  }

  @Bind()
  handleSave() {
    const { detailInfoDS } = this.state;
    // detailInfoDS.validate().then((res) => {
    // if (res) {
    this.setState({
      saving: true,
    });
    detailInfoDS.validate = () => true;
    detailInfoDS.submit();
    // } else {
    //   this.setState({
    //     saving: false,
    //   });
    // }
    // });
  }

  @Bind()
  handleSaveSuccess(resp) {
    notification.success();
    const { dispatch } = this.props;
    const { isCreate, detailInfoDS, isPub, open } = this.state;
    if (!isCreate) {
      detailInfoDS.query();
    }
    const { content = [] } = resp;
    if (content.length > 0) {
      const { costPaymentRequest = {} } = content[0];
      const { costRequestId } = costPaymentRequest;
      if (costRequestId) {
        dispatch(
          routerRedux.push({
            pathname: `${isPub ? '/pub' : ''}/spcm/payment-request/detail/${costRequestId}`,
            state: {
              newFlag: true,
            },
            search: `${open ? '?open=fs' : ''}`,
          })
        );
      }
    }
    this.setState({
      saving: false,
    });
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
    const { costPaymentRequest = {}, resaleDetailInvoiceList = [] } = resp;
    const { requestStatus, currencyCode, conversionRate } = costPaymentRequest;
    const bankFeesField = this.state.invoiceInfoDS.getField('bankFreesAmount');
    const step = ['IDR', 'VND', 'JPY', 'KRW'].includes(currencyCode) ? 1 : 0.01;
    bankFeesField.set('step', step);
    this.setState({
      status: requestStatus,
      conversionRate,
      lineAddAble: resaleDetailInvoiceList.length > 0,
      saving: false,
      submitting: false,
    });
  }

  @Bind()
  handleBatchImport() {
    // do nothing
  }

  @Bind()
  handleDeleteLineSuccess() {
    const { detailInfoDS } = this.state;
    detailInfoDS.query();
    notification.success();
  }

  @Bind()
  handleCollapseChange(keys) {
    this.setState({
      activeKey: keys,
    });
  }

  @Bind()
  handlePoDetail(poHeadersId, poType) {
    const { history } = this.props;
    const { isPub, open } = this.state;
    if (poType === 'STANDARD') {
      history.push({
        pathname: `${
          isPub ? '/pub' : ''
        }/sodr/purchase-order/standard/viewOnly/detail/${poHeadersId}`,
        search: `${open ? '?open=fs' : ''}`,
      });
    } else if (poType === 'ICTS') {
      history.push({
        pathname: `${isPub ? '/pub' : ''}/sodr/purchase-order/viewOnly/detail/${poHeadersId}`,
        search: `${open ? '?open=fs' : ''}`,
      });
    } else if (poType === 'DATA_APP') {
      history.push({
        pathname: `${
          isPub ? '/pub' : ''
        }/sodr/purchase-order/dataApp/viewOnly/detail/${poHeadersId}`,
        search: `${open ? '?open=fs' : ''}`,
      });
    }
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
      isCreate,
      status,
      conversionRate,
      lineAddAble,
      saving,
      submitting,
      activeKey,
      currentNodeName,
      isPub,
      open,
      requestTitleLen,
      requestRemarksLen,
      viewOnly,
    } = this.state;
    const editable = isCreate || ['DRAFT', 'REVOKE', 'PENDING_REVIEW'].includes(status);
    return (
      <>
        <Header
          /* title={
            open === 'fs'
              ? intl.get('spcm.paymentRequest.view.fsTitle').d('付款申请【转售采购成本】')
              : intl.get('spcm.paymentRequest.view.title').d('转售采购成本付款申请')
          } */
          backPath={`${isPub ? '/pub' : ''}/spcm/payment-request/query${open ? '?open=fs' : ''}`}
        >
          {!viewOnly && (
            <Button
              onClick={this.handleSave}
              icon="save"
              disabled={!editable || submitting}
              loading={saving}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}
        </Header>
        <Content>
          <LocaleProvider locale={currentLanguage === 'en_US' ? undefined : zhCN}>
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
                    <TextField name="requestNum" disabled />
                    <Select name="requestStatus" disabled />
                    <TextField
                      name="requestDate"
                      renderer={({ value }) => moment(value).format('YYYY-MM-DD')}
                      disabled
                    />
                    <Lov
                      name="requestEmployeeName"
                      noCache
                      disabled={!editable || viewOnly}
                      label={this.renderRequestEmployeeName()}
                    />
                    <TextField name="draftEmployeeName" disabled />
                    <Select
                      name="companyOrgCode"
                      // tableProps={{ selectionMode: 'dblclick', alwaysShowRowBox: true }}
                      // noCache
                      disabled={!isCreate || viewOnly}
                    />
                    <Select name="pressLevel" disabled={!editable || viewOnly} />
                    <TextField name="vendorCompanyNum" disabled />
                    <Lov
                      name="vendorCompany"
                      tableProps={{ selectionMode: 'dblclick', alwaysShowRowBox: true }}
                      noCache
                      disabled={!editable || viewOnly}
                    />
                    <Lov
                      name="currency"
                      tableProps={{ selectionMode: 'dblclick', alwaysShowRowBox: true }}
                      noCache
                      disabled={!editable || viewOnly}
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
                    <TextField
                      name="conversionRate"
                      // className="center-algin"
                      disabled
                    />
                    <Select name="originalReceived" dropdownMatchSelectWidth={false} />
                    {/* <TextArea name="requestTitle" disabled={!editable} resize="vertical" />
                    <TextArea name="requestRemarks" disabled={!editable} resize="vertical" /> */}
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
                      disabled={!editable || viewOnly}
                      prefix="COS-"
                      className={styles['input-prefix']}
                      help={`${intl
                        .get(`spcm.costPayment.view.detail.characters.left`)
                        .d('剩余字符:')}${REQUEST_TITLE_MAX_LENGTH - requestTitleLen}`}
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
                      disabled={!editable || viewOnly}
                      resize="vertical"
                      help={`${intl
                        .get(`spcm.costPayment.view.detail.characters.left`)
                        .d('剩余字符:')}${REQUEST_REMARKS_MAX_LENGTH - requestRemarksLen}`}
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
              {/*      <TextField name="bankAccountName" disabled={!editable || viewOnly} /> */}
              {/*      <TextField name="bankAccountNum" disabled={!editable || viewOnly} /> */}
              {/*      <TextField name="bankName" disabled={!editable || viewOnly} /> */}
              {/*      <TextField name="swiftCode" disabled={!editable || viewOnly} /> */}
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
                  isOperator
                  status={status}
                  currentNodeName={currentNodeName}
                  viewOnly={viewOnly}
                />
                <Tag.CheckableTag key="line" style={{ fontSize: '13px', margin: '15px 0 4px 0' }}>
                  {intl.get('spcm.costPayment.view.pay.detail').d('账单明细')}
                </Tag.CheckableTag>
                <InvoiceLines
                  dataSet={this.state.invoiceLineDS}
                  editable={editable}
                  isOperator
                  status={status}
                  conversionRate={conversionRate}
                  lineAddAble={lineAddAble}
                  isCreate
                  currentNodeName={currentNodeName}
                  onPoDetail={this.handlePoDetail}
                  viewOnly={viewOnly}
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
                  isOperator
                  currentNodeName={currentNodeName}
                  viewOnly={viewOnly}
                />
                <Tag.CheckableTag key="others" style={{ fontSize: '13px', margin: '15px 0 4px 0' }}>
                  {intl.get('spcm.costPayment.view.file.other').d('其他附件')}
                </Tag.CheckableTag>

                <AttachmentTable
                  dataSet={this.state.otherAttachmentTableDS}
                  editable={editable}
                  isOperator
                  currentNodeName={currentNodeName}
                  viewOnly={viewOnly}
                  isOther
                />
              </Collapse.Panel>
            </Collapse>
          </LocaleProvider>
        </Content>
        <Spin className={styles.spin} spinning={saving} />
      </>
    );
  }
}
