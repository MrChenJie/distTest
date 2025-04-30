import React from 'react';
import { Input, Row, Col, Form, InputNumber } from 'antd';
import intl from 'utils/intl';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import cacheComponent from '_cus_components/CusCacheComponent';
import { getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import dayjs from 'dayjs';
import { mediumScreenWidth } from '_cus_utils/constants';
import { wordTruncation } from '_cus_utils/utils';

const language = getCurrentLanguage();
const screenWidth = window.screen.width;
const commonPrompt = 'spcm.resaleQuery';

@cacheComponent({ cacheKey: '/spcm/payment-request/query' })
export default class FilterForm extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);

    this.state = {
      isShowMore: false,
    };
  }

  form = React.createRef();

  handleShowMore = () => {
    const { isShowMore } = this.state;
    this.setState({
      isShowMore: !isShowMore,
    });
  };

  handleReset = () => {
    this.form.current?.resetFields();
  };

  componentDidMount() {
    language === 'en_US' && wordTruncation();
  }

  componentDidUpdate() {
    language === 'en_US' && wordTruncation();
  }

  render() {
    const { onSearch = (e) => e, idpValueMap = {} } = this.props;
    const { isShowMore } = this.state;
    const { getFieldValue, setFieldsValue } = this.form.current || {};
    return (
      <>
        <div className="customize-form">
          <Form ref={this.form}>
            <Row>
              <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.query.requestNum`).d('付款申请编号')}
                  wrapperCol={{ span: 24 }}
                  name="requestNum"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.query.requestEmployeeName`).d('申请人')}
                  wrapperCol={{ span: 24 }}
                  name="requestEmployeeName"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.query.draftEmployeeName`).d('起草人')}
                  wrapperCol={{ span: 24 }}
                  name="draftEmployeeName"
                >
                  <Input />
                </Form.Item>
              </Col>
              <div style={{ display: isShowMore ? 'block' : 'none' }}>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.requestTitle`).d('付款申请标题')}
                    wrapperCol={{ span: 24 }}
                    name="requestTitle"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.companyOrgName`).d('采购签约主体')}
                    wrapperCol={{ span: 24 }}
                    name="companyOrgCode"
                  >
                    <CusSelect allowClear options={idpValueMap['VP.PRICE_CONTRACT_SIGN_ENTITY']} />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.requestStatus`).d('申请状态')}
                    wrapperCol={{ span: 24 }}
                    name="requestStatus"
                  >
                    <CusSelect allowClear options={idpValueMap['SPCM.COST_REQUEST_STATUS']} />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item style={{ display: 'none' }} name="levelUnitName">
                    <div />
                  </Form.Item>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.requestDepartment`).d('申请部门')}
                    wrapperCol={{ span: 24 }}
                    name="requestDepartment"
                  >
                    <CusLov
                      code="SPRM.USER_UNIT"
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                      lovOptions={{ valueField: 'unitCode' }}
                      textField="levelUnitName"
                      form={this.form.current}
                      onChange={(val, record) => {
                        setFieldsValue({
                          levelUnitName: record.levelUnitName,
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.currencyCode`).d('发票币种')}
                    wrapperCol={{ span: 24 }}
                    name="currencyCode"
                  >
                    <CusLov
                      code="HPFM.CURRENCY"
                      textField="currencyCode"
                      form={this.form.current}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.requestDateFrom`).d('申请日期从')}
                    wrapperCol={{ span: 24 }}
                    name="requestDateFrom"
                  >
                    <CusDatePicker
                      disabledDate={(currentDate) => {
                        const endDate = getFieldValue(`requestDateTo`);
                        if (endDate && dayjs(endDate).isValid()) {
                          return currentDate.isAfter(endDate);
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.requestDateTo`).d('申请日期至')}
                    wrapperCol={{ span: 24 }}
                    name="requestDateTo"
                  >
                    <CusDatePicker
                      disabledDate={(currentDate) => {
                        const startDate = getFieldValue(`requestDateFrom`);
                        if (startDate && dayjs(startDate).isValid()) {
                          return currentDate.isBefore(startDate);
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.invoiceNum`).d('发票号码')}
                    wrapperCol={{ span: 24 }}
                    name="invoiceNum"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.invoiceDateFrom`).d('发票日期从')}
                    wrapperCol={{ span: 24 }}
                    name="invoiceDateFrom"
                  >
                    <CusDatePicker
                      disabledDate={(currentDate) => {
                        const endDate = getFieldValue(`invoiceDateTo`);
                        if (endDate && dayjs(endDate).isValid()) {
                          return currentDate.isAfter(endDate);
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.invoiceDateTo`).d('发票日期至')}
                    wrapperCol={{ span: 24 }}
                    name="invoiceDateTo"
                  >
                    <CusDatePicker
                      disabledDate={(currentDate) => {
                        const startDate = getFieldValue(`invoiceDateFrom`);
                        if (startDate && dayjs(startDate).isValid()) {
                          return currentDate.isBefore(startDate);
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.vendorCompanyName`).d('供应商名称')}
                    wrapperCol={{ span: 24 }}
                    name="vendorCompanyName"
                  >
                    <CusLov
                      code="SSLM.COST_SUPPLIER_INFO_URL"
                      lovOptions={{ valueField: 'vendorName' }}
                      textField="vendorCompanyName"
                      form={this.form.current}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.vendorCompanyNum`).d('供应商编号')}
                    wrapperCol={{ span: 24 }}
                    name="vendorCompanyNum"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.circuitNumber`).d('客户电路编号')}
                    wrapperCol={{ span: 24 }}
                    name="circuitNumber"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.invoiceAmountFrom`).d('发票金额从')}
                    wrapperCol={{ span: 24 }}
                    name="invoiceAmountFrom"
                  >
                    <InputNumber />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.invoiceAmountTo`).d('发票金额至')}
                    wrapperCol={{ span: 24 }}
                    name="invoiceAmountTo"
                  >
                    <InputNumber />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.contractNo`).d('采购合同编号')}
                    wrapperCol={{ span: 24 }}
                    name="contractNo"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl
                      .get(`${commonPrompt}.view.query.importEbsDateFrom`)
                      .d('导入EBS日期从')}
                    wrapperCol={{ span: 24 }}
                    name="importEbsDateFrom"
                  >
                    <CusDatePicker
                      disabledDate={(currentDate) => {
                        const endDate = getFieldValue(`importEbsDateTo`);
                        if (endDate && dayjs(endDate).isValid()) {
                          return currentDate.isAfter(endDate);
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl
                      .get(`${commonPrompt}.view.query.importEbsDateTo`)
                      .d('导入EBS日期至')}
                    wrapperCol={{ span: 24 }}
                    name="importEbsDateTo"
                  >
                    <CusDatePicker
                      disabledDate={(currentDate) => {
                        const startDate = getFieldValue(`importEbsDateFrom`);
                        if (startDate && dayjs(startDate).isValid()) {
                          return currentDate.isBefore(startDate);
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.poNumber`).d('采购订单编号')}
                    wrapperCol={{ span: 24 }}
                    name="poNumber"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.approvalStatus`).d('审批环节')}
                    wrapperCol={{ span: 24 }}
                    name="approvalStatus"
                  >
                    <CusSelect
                      allowClear
                      options={idpValueMap['RS_IP_APPROVAL_NODE']?.filter((i) =>
                        i.tag.includes('Z')
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item style={{ display: 'none' }} name="name">
                    <div />
                  </Form.Item>
                  <Form.Item
                    label={intl
                      .get(`${commonPrompt}.view.query.currentNodeNameQuery`)
                      .d('当前节点处理人')}
                    wrapperCol={{ span: 24 }}
                    name="currentNodeNameQuery"
                  >
                    <CusLov
                      code="SPFM.CURRENT_NODE_HANDLER"
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                      lovOptions={{ valueField: 'employeeNum' }}
                      textField="name"
                      form={this.form.current}
                      onChange={(val, record) => {
                        setFieldsValue({
                          name: record.name,
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl
                      .get(`${commonPrompt}.view.query.invoiceHkAmountTotalFrom`)
                      .d('港币总金额从')}
                    wrapperCol={{ span: 24 }}
                    name="invoiceHkAmountTotalFrom"
                  >
                    <InputNumber />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl
                      .get(`${commonPrompt}.view.query.invoiceHkAmountTotalTo`)
                      .d('港币总金额至')}
                    wrapperCol={{ span: 24 }}
                    name="invoiceHkAmountTotalTo"
                  >
                    <InputNumber />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.sourceCode`).d('创建方式')}
                    wrapperCol={{ span: 24 }}
                    name="sourceCode"
                  >
                    <CusSelect allowClear options={idpValueMap['SRSP.PAYMENT_REQUEST_SOURCE']} />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.isPrepayFlag`).d('是否预付款核销')}
                    wrapperCol={{ span: 24 }}
                    name="isPrepayFlag"
                  >
                    <CusSelect allowClear options={idpValueMap['SPFM.YES_NO']} />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.termsDateFrom`).d('发票到期日从')}
                    wrapperCol={{ span: 24 }}
                    name="termsDateFrom"
                  >
                    <CusDatePicker
                      disabledDate={(currentDate) => {
                        const endDate = getFieldValue(`termsDateTo`);
                        if (endDate && dayjs(endDate).isValid()) {
                          return currentDate.isAfter(endDate);
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.termsDateTo`).d('发票到期日至')}
                    wrapperCol={{ span: 24 }}
                    name="termsDateTo"
                  >
                    <CusDatePicker
                      disabledDate={(currentDate) => {
                        const startDate = getFieldValue(`termsDateFrom`);
                        if (startDate && dayjs(startDate).isValid()) {
                          return currentDate.isBefore(startDate);
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.pressLevel`).d('紧急程度')}
                    wrapperCol={{ span: 24 }}
                    name="pressLevel"
                  >
                    <CusSelect allowClear options={idpValueMap['SPCM.COST_PRESS_LEVEL']} />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl
                      .get(`${commonPrompt}.view.query.expectPaymentDateFrom`)
                      .d('期望付款日期从')}
                    wrapperCol={{ span: 24 }}
                    name="expectPaymentDateFrom"
                  >
                    <CusDatePicker
                      disabledDate={(currentDate) => {
                        const endDate = getFieldValue(`expectPaymentDateTo`);
                        if (endDate && dayjs(endDate).isValid()) {
                          return currentDate.isAfter(endDate);
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl
                      .get(`${commonPrompt}.view.query.expectPaymentDateTo`)
                      .d('期望付款日期至')}
                    wrapperCol={{ span: 24 }}
                    name="expectPaymentDateTo"
                  >
                    <CusDatePicker
                      disabledDate={(currentDate) => {
                        const startDate = getFieldValue(`expectPaymentDateFrom`);
                        if (startDate && dayjs(startDate).isValid()) {
                          return currentDate.isBefore(startDate);
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl
                      .get(`${commonPrompt}.view.query.paymentOwnerName`)
                      .d('下沉付款责任人')}
                    wrapperCol={{ span: 24 }}
                    name="paymentOwnerName"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl
                      .get(`${commonPrompt}.view.query.circuitRoleType`)
                      .d('主理人/代理人')}
                    wrapperCol={{ span: 24 }}
                    name="circuitRoleType"
                  >
                    <CusSelect
                      allowClear
                      options={idpValueMap['SRSP.ESTIMATE_CIRCUIT_ROLE_TYPE']}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.view.query.payAdviceFlag`).d('付款凭证')}
                    wrapperCol={{ span: 24 }}
                    name="payAdviceFlag"
                  >
                    <CusSelect allowClear options={idpValueMap['SPCM.PAYMENT_ADVICE_FLAG']} />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl
                      .get(`${commonPrompt}.view.query.pendingApportionFlag`)
                      .d('是否待摊')}
                    wrapperCol={{ span: 24 }}
                    name="pendingApportionFlag"
                  >
                    <CusSelect allowClear options={idpValueMap['HPFM.FLAG']} />
                  </Form.Item>
                </Col>
              </div>
              <Col span={screenWidth > mediumScreenWidth ? 8 : 12} style={{ float: 'right' }}>
                <CusQueryButtons
                  onQuery={onSearch}
                  onReset={this.handleReset}
                  onShowMore={this.handleShowMore}
                  isShowMore={isShowMore}
                />
              </Col>
            </Row>
          </Form>
        </div>
      </>
    );
  }
}
