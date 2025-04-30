import React from 'react';
import { Form } from 'hzero-ui';
import { Radio, Row, Col } from 'antd';
import CusInput from '_cus_components/CusInput';
import intl from 'utils/intl';
import { numberRender } from 'utils/renderer';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const prompt = 'spcm.costPayment';

@Form.create({ fieldNameProp: null })
export default class TabWriteOffDetail extends React.Component {
  render() {
    const { form, payWriteOffData = {} } = this.props;
    const { getFieldDecorator } = form;
    return (
      <React.Fragment>
        <div style={{ marginTop: '-8px', marginBottom: '16px' }}>
          {intl.get(`${prompt}.view.pay.tabWriteOffDetail`).d('支付及核销信息')}
        </div>
        <Form className="customize-form">
          <Row>
            <Col span={8}>
              <FormItem label={intl.get(`${prompt}.view.amountFlag`).d('是否预付款核销')}>
                {getFieldDecorator('amountFlag', {
                  initialValue: payWriteOffData.amountFlag,
                })(
                  <RadioGroup disabled>
                    <Radio value={'Y'}>{intl.get('hzero.common.status.yes').d('是')}</Radio>
                    <Radio value={'N'}>{intl.get('hzero.common.status.no').d('否')}</Radio>
                  </RadioGroup>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem label={intl.get(`${prompt}.view.amountTotal`).d('本次核销原币金额')}>
                {getFieldDecorator('amountTotal', {
                  initialValue: numberRender(payWriteOffData.amountTotal, 2),
                })(<CusInput disabled />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label={intl.get(`${prompt}.view.amountTotalHkd`).d('本次核销港币金额')}>
                {getFieldDecorator('amountTotalHkd', {
                  initialValue: numberRender(payWriteOffData.amountTotalHkd, 2),
                })(<CusInput disabled />)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <FormItem label={intl.get(`${prompt}.view.payAmount`).d('净支付原币金额')}>
                {getFieldDecorator('payAmount', {
                  initialValue: numberRender(payWriteOffData.payAmount, 2),
                })(<CusInput disabled />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label={intl.get(`${prompt}.view.payAmountHkd`).d('净支付港币金额')}>
                {getFieldDecorator('payAmountHkd', {
                  initialValue: numberRender(payWriteOffData.payAmountHkd, 2),
                })(<CusInput disabled />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    );
  }
}
