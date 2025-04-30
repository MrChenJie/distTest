/*
 * @Description: 转售采购成品付款申请 - 面板 - 付款明细 - 支付及核销信息
 * @LastEditors: 何智鹏 <he.zhipeng@hand-china.com>
 * @Date: 2023-08-18 14:34:28
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { Component } from 'react';
import { Col, Form, Row } from 'antd';
import intl from 'utils/intl';
import { InputNumber, Radio } from 'hzero-ui';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;

export default class index extends Component {
  render() {
    const { form } = this.props;
    return (
      <Form ref={form} className="customize-form">
        <Row>
          <Col span={8}>
            <FormItem
              label={intl.get(`spcm.costPayment.view.amountFlag`).d('是否预付款核销')}
              name="amountFlag"
            >
              <RadioGroup disabled>
                <Radio value="Y">{intl.get('hzero.common.status.yes').d('是')}</Radio>
                <Radio value="N">{intl.get('hzero.common.status.no').d('否')}</Radio>
              </RadioGroup>
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`spcm.costPayment.view.amountTotal`).d('本次核销原币金额')}
              name="amountTotal"
            >
              <InputNumber disabled precision={2} />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`spcm.costPayment.view.amountTotalHkd`).d('本次核销港币金额')}
              name="amountTotalHkd"
            >
              <InputNumber disabled precision={2} />
            </FormItem>
          </Col>
          <Col span={8} />
          <Col span={8}>
            <FormItem
              label={intl.get(`spcm.costPayment.view.payAmount`).d('净支付原币金额')}
              name="payAmount"
            >
              <InputNumber disabled precision={2} />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`spcm.costPayment.view.payAmountHkd`).d('净支付港币金额')}
              name="payAmountHkd"
            >
              <InputNumber disabled precision={2} />
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
