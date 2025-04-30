/*
 * @Description: 退回供应商 - 弹框
 * @LastEditors: 何智鹏 <he.zhipeng@hand-china.com>
 * @Date: 2023-08-22 11:46:43
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import intl from 'utils/intl';
import { Form } from 'antd';
import CusInput from '_cus_components/CusInput';

const FormItem = Form.Item;

@connect(({ resaleRequestDetail = {} }) => ({ resaleRequestDetail }))
export default class index extends Component {
  render() {
    const { returnToSupplierForm } = this.props.resaleRequestDetail;
    return (
      <Form ref={returnToSupplierForm} className="customize-form">
        <FormItem
          label={intl.get(`spcm.paymentRequest.view.rejectReason`).d('退回原因')}
          name="rejectReason"
          rules={[
            {
              required: true,
              message: intl.get('hzero.common.validation.notNull', {
                name: intl.get(`spcm.paymentRequest.view.rejectReason`).d('退回原因'),
              }),
            },
          ]}
        >
          <CusInput.TextArea rows={3} autoSize={{ minRows: 3, maxRows: 3 }} />
        </FormItem>
      </Form>
    );
  }
}
