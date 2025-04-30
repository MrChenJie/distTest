import React, { PureComponent } from 'react';
import { Form, Row, Col, InputNumber } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusSelect from '_cus_components/CusSelect';
import dayjs from 'dayjs';

const { Item } = Form;
const prefix = 'spfm.channelCommissionInquiry';

export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expandFlag: false,
    };
  }

  @Bind
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind
  @Debounce(300, { leading: true })
  handleSearch() {
    const { onSearch = (e) => e } = this.props;
    onSearch();
  }

  @Bind
  toggleForm() {
    const { expandFlag } = this.state;
    this.setState({
      expandFlag: !expandFlag,
    });
  }

  render() {
    const { form, idpValueMap = {}, defaultParams } = this.props;
    const { expandFlag } = this.state;
    const { getFieldDecorator, getFieldValue } = form;

    return (
      <Form className="customize-form">
        <Row>
          <Col span={12}>
            <Item label={intl.get(`${prefix}.model.query.company`).d('销售订单公司主体')}>
              {getFieldDecorator('company', {
                initialValue: defaultParams.ouOrgCode,
              })(
                <CusLov
                  allowClear={false}
                  code="SPUC.CHANNEL_COMPANY"
                  lovOptions={{ valueField: 'tag', displayField: 'tag' }}
                  textValue={defaultParams.ouOrgCode}
                  disabled
                />
              )}
            </Item>
          </Col>
          <Col span={12}>
            <Item label={intl.get(`${prefix}.model.query.channelName`).d('渠道商名称')}>
              {getFieldDecorator('channelName')(
                <CusLov
                  allowClear
                  code="SPUC.CHANNEL_LIST"
                  lovOptions={{ valueField: 'companyName', displayField: 'companyName' }}
                />
              )}
            </Item>
          </Col>
          <div style={{ display: expandFlag ? 'block' : 'none' }}>
            <Col span={12}>
              <Item label={intl.get(`${prefix}.model.query.channelCode`).d('渠道商EBS编码')}>
                {getFieldDecorator('channelCode', {
                  initialValue: defaultParams.vendorCompanyNum,
                })(<CusInput disabled />)}
              </Item>
            </Col>
            <Col span={12}>
              <Item label={intl.get(`${prefix}.model.query.customerName`).d('客户名称')}>
                {getFieldDecorator('customerName')(
                  <CusLov
                    allowClear
                    code="SPUC.CHANNEL_CUSTOMER_INFO"
                    lovOptions={{ valueField: 'customerName', displayField: 'customerName' }}
                  />
                )}
              </Item>
            </Col>
            <Col span={12}>
              <Item label={intl.get(`${prefix}.model.query.customerCode`).d('客户EBS编码')}>
                {getFieldDecorator('customerCode')(<CusInput />)}
              </Item>
            </Col>
            <Col span={12}>
              <Item label={intl.get(`${prefix}.model.query.circuitId`).d('客户电路编号')}>
                {getFieldDecorator('circuitId')(<CusInput />)}
              </Item>
            </Col>
            <Col span={12}>
              <Item
                label={intl.get(`${prefix}.model.query.serviceStartDateFrom`).d('服务开始日期从')}
              >
                {getFieldDecorator('serviceStartDateFrom')(
                  <CusDatePicker
                    disabledDate={(currentDate) => {
                      const endDate = getFieldValue(`serviceStartDateTo`);
                      if (endDate && dayjs(endDate).isValid()) {
                        return currentDate.isAfter(endDate);
                      }
                    }}
                  />
                )}
              </Item>
            </Col>
            <Col span={12}>
              <Item
                label={intl.get(`${prefix}.model.query.serviceStartDateTo`).d('服务开始日期至')}
              >
                {getFieldDecorator('serviceStartDateTo')(
                  <CusDatePicker
                    disabledDate={(currentDate) => {
                      const startDate = getFieldValue(`serviceStartDateFrom`);
                      if (startDate && dayjs(startDate).isValid()) {
                        return currentDate.isBefore(startDate);
                      }
                    }}
                  />
                )}
              </Item>
            </Col>
            <Col span={12}>
              <Item label={intl.get(`${prefix}.model.query.currencyCode`).d('币种')}>
                {getFieldDecorator('currencyCode', {
                  initialValue: defaultParams.currencyCode,
                })(
                  <CusLov
                    allowClear={false}
                    code="HPFM.CURRENCY"
                    textValue={defaultParams.currencyCode}
                    disabled
                  />
                )}
              </Item>
            </Col>
            <Col span={12}>
              <Item
                label={intl.get(`${prefix}.model.query.serviceEndDateFrom`).d('服务结束日期从')}
              >
                {getFieldDecorator('serviceEndDateFrom')(
                  <CusDatePicker
                    disabledDate={(currentDate) => {
                      const endDate = getFieldValue(`serviceEndDateTo`);
                      if (endDate && dayjs(endDate).isValid()) {
                        return currentDate.isAfter(endDate);
                      }
                    }}
                  />
                )}
              </Item>
            </Col>
            <Col span={12}>
              <Item label={intl.get(`${prefix}.model.query.serviceEndDateTo`).d('服务结束日期至')}>
                {getFieldDecorator('serviceEndDateTo')(
                  <CusDatePicker
                    disabledDate={(currentDate) => {
                      const startDate = getFieldValue(`serviceEndDateFrom`);
                      if (startDate && dayjs(startDate).isValid()) {
                        return currentDate.isBefore(startDate);
                      }
                    }}
                  />
                )}
              </Item>
            </Col>
            <Col span={12}>
              <Item label={intl.get(`${prefix}.model.query.referenceNumber`).d('发票编号')}>
                {getFieldDecorator('referenceNumber')(<CusInput />)}
              </Item>
            </Col>
            <Col span={12}>
              <Item label={intl.get(`${prefix}.model.query.commissionRate`).d('酬金比例(%)')}>
                {getFieldDecorator('commissionRate')(<InputNumber />)}
              </Item>
            </Col>
            <Col span={12}>
              <Item
                label={intl
                  .get(`${prefix}.model.query.unpaidPaymentAmountFrom`)
                  .d('未付款申请酬金从')}
              >
                {getFieldDecorator('unpaidPaymentAmountFrom')(
                  <InputNumber
                    step={0.01}
                    className="cus-input-money"
                    precision={2}
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    allowThousandth
                  />
                )}
              </Item>
            </Col>
            <Col span={12}>
              <Item
                label={intl
                  .get(`${prefix}.model.query.unpaidPaymentAmountTo`)
                  .d('未付款申请酬金至')}
              >
                {getFieldDecorator('unpaidPaymentAmountTo')(
                  <InputNumber
                    step={0.01}
                    className="cus-input-money"
                    precision={2}
                    min={0}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    allowThousandth
                  />
                )}
              </Item>
            </Col>
            <Col span={12}>
              <Item label={intl.get(`${prefix}.model.query.status`).d('状态')}>
                {getFieldDecorator('status', {
                  initialValue: 'OPEN',
                })(<CusSelect options={idpValueMap['SPUC.CHANNEL_SETTLE_TYPE']} allowClear />)}
              </Item>
            </Col>
          </div>
          <Col span={12} style={{ float: 'right' }}>
            <CusQueryButtons
              onQuery={this.handleSearch}
              onReset={this.handleReset}
              onShowMore={this.toggleForm}
              isShowMore={expandFlag}
            />
          </Col>
        </Row>
      </Form>
    );
  }
}
