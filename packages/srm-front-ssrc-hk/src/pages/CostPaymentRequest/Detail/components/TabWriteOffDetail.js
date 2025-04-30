import React from 'react';
// import { Bind } from 'lodash-decorators';
import { Form, Row, Col, Input, Radio } from 'hzero-ui';
import intl from 'utils/intl';
import { numberRender } from 'utils/renderer';
import styles from './index.less';

const FormItem = Form.Item;
const RadioGroup = Radio.Group
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({})
export default class TabWriteOffDetail extends React.Component {
  render() {
    const { form, payWriteOffData = {}, prompt } = this.props;
    const { getFieldDecorator } = form;
    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-search-form">
          <Row>
            <Col span={7}>
              <FormItem
                label={intl.get(`${prompt}.view.amountFlag`).d('是否预付款核销')}
                {...formLayout}
              >
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
            <Col span={8}>
              <FormItem
                label={intl.get(`${prompt}.view.amountTotal`).d('本次核销原币金额')}
                {...formLayout}
              >
                {getFieldDecorator('amountTotal', {
                  initialValue: numberRender(payWriteOffData.amountTotal, 2),
                })(
                  <Input className={styles['input-money']} disabled />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={intl.get(`${prompt}.view.amountTotalHkd`).d('本次核销港币金额')}
                {...formLayout}
              >
                {getFieldDecorator('amountTotalHkd', {
                  initialValue: numberRender(payWriteOffData.amountTotalHkd, 2),
                })(
                  <Input className={styles['input-money']} disabled />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={7}></Col>
            <Col span={8}>
              <FormItem
                label={intl.get(`${prompt}.view.payAmount`).d('净支付原币金额')}
                {...formLayout}
              >
                {getFieldDecorator('payAmount', {
                  initialValue:numberRender(payWriteOffData.payAmount, 2),
                })(
                  <Input className={styles['input-money']} disabled />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={intl.get(`${prompt}.view.payAmountHkd`).d('净支付港币金额')}
                {...formLayout}
              >
                {getFieldDecorator('payAmountHkd', {
                  initialValue: numberRender(payWriteOffData.payAmountHkd, 2),
                })(
                  <Input className={styles['input-money']} disabled />
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    )
  }
}