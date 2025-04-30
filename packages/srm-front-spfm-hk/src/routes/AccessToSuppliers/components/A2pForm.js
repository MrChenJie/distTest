import React, { PureComponent } from 'react';
import { Form } from 'hzero-ui';
import { Col, Row } from 'antd';
import CusInput from '_cus_components/CusInput';
import intl from 'utils/intl';
import { EMAIL } from 'utils/regExp';
const prompt = 'spfmhk.supplier';
@Form.create()
export default class A2pForm extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { form: { getFieldDecorator }, initialValue, disabled = false } = this.props;
    const gridSpan = {
      xs: 12,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12,
      xxl: 12
    }
    return (
      <Form className="customize-form">
        <Row gutter={24}>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.a2p.info.quotation.mail`).d('供应商报价邮件')}>
              {getFieldDecorator('quoteEmail', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.a2p.info.quotation.mail`).d('供应商报价邮件'),
                    }),
                  },
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ],
                initialValue: initialValue?.quoteEmail
              })(<CusInput trimAll allowClear disabled={disabled}/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.a2p.info.advance.in.price`).d('涨价通知期')}>
              {getFieldDecorator('priceIncreaseNotice', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.a2p.info.advance.in.price`).d('涨价通知期'),
                  }),
                }],
                initialValue: initialValue?.priceIncreaseNotice
              })(<CusInput trimAll allowClear disabled={disabled}/>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.a2p.info.credit.limit`).d('Credit Limit')}>
              {getFieldDecorator('creditLimit', {
                initialValue: initialValue?.creditLimit
              })(<CusInput trimAll allowClear disabled={disabled}/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.a2p.info.settlement.term`).d('结算条件')}>
              {getFieldDecorator('settlementCondition',  {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.a2p.info.settlement.term`).d('结算条件'),
                  }),
                }],
                initialValue: initialValue?.settlementCondition
              })(<CusInput trimAll allowClear disabled={disabled}/>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.a2p.info.settlement.account.email`).d('结算账户邮箱')}>
              {getFieldDecorator('settlementEmail',  {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.a2p.info.settlement.account.email`).d('结算账户邮箱'),
                    }),
                  },
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ],
                initialValue: initialValue?.settlementEmail
              })(<CusInput trimAll allowClear disabled={disabled}/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.a2p.info.payment.period`).d('缴费期限')}>
              {getFieldDecorator('paymentDeadline',  {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.a2p.info.payment.period`).d('缴费期限'),
                  }),
                }],
                initialValue: initialValue?.paymentDeadline
              })(<CusInput trimAll allowClear disabled={disabled}/>)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.a2p.info.sla`).d('SLA')}>
              {getFieldDecorator('sla', {
                initialValue: initialValue?.sla
              })(<CusInput trimAll allowClear disabled={disabled}/>)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
