import React, { PureComponent } from 'react';
import { Form, Row, Col, Button, DatePicker, Input, InputNumber } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import moment from 'moment';

import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import styles from './index.less';

const { Item } = Form;
const prefix = 'spfm.channelCommissionInquiry';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
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
    const { form, idpValueMap = {}, headerDataSet } = this.props;
    const { expandFlag } = this.state;
    const { getFieldDecorator } = form;

    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={24}>
          <Col span={8}>
            <Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get(`${prefix}.model.query.company`).d('销售订单公司主体')}
            >
              {getFieldDecorator('company', {
                initialValue: headerDataSet.current.get('ouOrgCode'),
              })(
                <Lov
                  allowClear={false}
                  code="SPUC.CHANNEL_COMPANY"
                  lovOptions={{ valueField: 'tag', displayField: 'tag' }}
                  textValue={headerDataSet.current.get('ouOrgCode')}
                  disabled
                />
              )}
            </Item>
          </Col>
          <Col span={8}>
            <Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get(`${prefix}.model.query.channelName`).d('渠道商名称')}
            >
              {getFieldDecorator('channelName')(
                <Lov
                  allowClear
                  code="SPUC.CHANNEL_LIST"
                  lovOptions={{ valueField: 'companyName', displayField: 'companyName' }}
                />
              )}
            </Item>
          </Col>
          <Col span={8}>
            <Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get(`${prefix}.model.query.channelCode`).d('渠道商EBS编码')}
            >
              {getFieldDecorator('channelCode', {
                initialValue: headerDataSet.current.get('vendorCompanyNum'),
              })(<Input disabled />)}
            </Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col span={8}>
            <Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get(`${prefix}.model.query.customerName`).d('客户名称')}
            >
              {getFieldDecorator('customerName')(
                <Lov
                  allowClear
                  code="SPUC.CHANNEL_CUSTOMER_INFO"
                  lovOptions={{ valueField: 'customerName', displayField: 'customerName' }}
                />
              )}
            </Item>
          </Col>
          <Col span={8}>
            <Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get(`${prefix}.model.query.customerCode`).d('客户EBS编码')}
            >
              {getFieldDecorator('customerCode')(<Input />)}
            </Item>
          </Col>
          <Col span={8}>
            <Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get(`${prefix}.model.query.circuitId`).d('客户电路编号')}
            >
              {getFieldDecorator('circuitId')(<Input />)}
            </Item>
          </Col>
        </Row>

        <Row gutter={24} style={{ display: expandFlag ? 'block' : 'none' }}>
          <Col span={8}>
            <Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get(`${prefix}.model.query.serviceStartDateFrom`).d('服务开始日期从')}
            >
              {getFieldDecorator('serviceStartDateFrom')(
                <DatePicker
                  disabledDate={(currentDate) => {
                    return (
                      moment.isMoment(form.getFieldValue('serviceStartDateTo')) &&
                      currentDate &&
                      currentDate.isAfter(form.getFieldValue('serviceStartDateTo'))
                    );
                  }}
                />
              )}
            </Item>
          </Col>
          <Col span={8}>
            <Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get(`${prefix}.model.query.serviceStartDateTo`).d('服务开始日期至')}
            >
              {getFieldDecorator('serviceStartDateTo')(
                <DatePicker
                  disabledDate={(currentDate) => {
                    return (
                      moment.isMoment(form.getFieldValue('serviceStartDateFrom')) &&
                      currentDate &&
                      currentDate.isBefore(form.getFieldValue('serviceStartDateFrom'))
                    );
                  }}
                />
              )}
            </Item>
          </Col>
          <Col span={8}>
            <Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get(`${prefix}.model.query.currencyCode`).d('币种')}
            >
              {getFieldDecorator('currencyCode', {
                initialValue: headerDataSet.current.get('currencyCode'),
              })(
                <Lov
                  allowClear={false}
                  code="HPFM.CURRENCY"
                  textValue={headerDataSet.current.get('currencyCode')}
                  disabled
                />
              )}
            </Item>
          </Col>
        </Row>

        <Row gutter={24} style={{ display: expandFlag ? 'block' : 'none' }}>
          <Col span={8}>
            <Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get(`${prefix}.model.query.serviceEndDateFrom`).d('服务结束日期从')}
            >
              {getFieldDecorator('serviceEndDateFrom')(
                <DatePicker
                  disabledDate={(currentDate) => {
                    return (
                      moment.isMoment(form.getFieldValue('serviceEndDateTo')) &&
                      currentDate &&
                      currentDate.isAfter(form.getFieldValue('serviceEndDateTo'))
                    );
                  }}
                />
              )}
            </Item>
          </Col>
          <Col span={8}>
            <Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get(`${prefix}.model.query.serviceEndDateTo`).d('服务结束日期至')}
            >
              {getFieldDecorator('serviceEndDateTo')(
                <DatePicker
                  disabledDate={(currentDate) => {
                    return (
                      moment.isMoment(form.getFieldValue('serviceEndDateFrom')) &&
                      currentDate &&
                      currentDate.isBefore(form.getFieldValue('serviceEndDateFrom'))
                    );
                  }}
                />
              )}
            </Item>
          </Col>
          <Col span={8}>
            <Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get(`${prefix}.model.query.referenceNumber`).d('发票编号')}
            >
              {getFieldDecorator('referenceNumber')(<Input />)}
            </Item>
          </Col>
        </Row>

        <Row gutter={24} style={{ display: expandFlag ? 'block' : 'none' }}>
          <Col span={8}>
            <Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get(`${prefix}.model.query.commissionRate`).d('酬金比例(%)')}
            >
              {getFieldDecorator('commissionRate')(<InputNumber />)}
            </Item>
          </Col>
          <Col span={8}>
            <Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl
                .get(`${prefix}.model.query.unpaidPaymentAmountFrom`)
                .d('未付款申请酬金从')}
            >
              {getFieldDecorator('unpaidPaymentAmountFrom')(
                <InputNumber
                  step={0.01}
                  className={styles['input-money']}
                  precision={2}
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  allowThousandth
                />
              )}
            </Item>
          </Col>
          <Col span={8}>
            <Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get(`${prefix}.model.query.unpaidPaymentAmountTo`).d('未付款申请酬金至')}
            >
              {getFieldDecorator('unpaidPaymentAmountTo')(
                <InputNumber
                  step={0.01}
                  className={styles['input-money']}
                  precision={2}
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  allowThousandth
                />
              )}
            </Item>
          </Col>
        </Row>

        <Row gutter={24} style={{ display: expandFlag ? 'block' : 'none' }}>
          <Col span={8}>
            <Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get(`${prefix}.model.query.status`).d('状态')}
            >
              {getFieldDecorator('status', {
                initialValue: 'OPEN',
              })(
                <ValueList
                  options={idpValueMap['SPUC.CHANNEL_SETTLE_TYPE']}
                  lazyLoad={false}
                  allowClear
                />
              )}
            </Item>
          </Col>
        </Row>

        <Row>
          <Col span={24} className="custmize-querybar-buttons">
            <Button onClick={this.handleReset}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
            <Button type="primary" onClick={this.handleSearch} htmlType="submit">
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
            <Button onClick={this.toggleForm}>
              {expandFlag
                ? intl.get('hzero.common.button.collected').d('收起查询')
                : intl.get('hzero.common.button.viewMore').d('更多查询')}
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}
