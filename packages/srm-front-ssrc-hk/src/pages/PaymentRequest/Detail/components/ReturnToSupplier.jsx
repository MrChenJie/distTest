import React from 'react';

import { Modal, Form, Input } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@Form.create({})
export default class ReturnToSupplier extends React.Component{
  constructor(props) {
    super(props);
  }

  @Bind()
  handleOk() {
    const { form, onOk = e => e } = this.props;
    form.validateFields((errors, values) => {
      if (errors) {
        return;
      };
      onOk(values.rejectReason);
    });
  }

  render() {
    const {
      visible,
      onCancel = (e) => e,
      form,
    } = this.props;
    const { getFieldDecorator = e => e } = form;
    return (
      <Modal
        title={intl.get('spcm.paymentRequest.view.isReturnToSupplierPayApply').d('是否要退回供应商收款申请？')}
        visible={visible}
        onCancel={onCancel}
        width={400}
        destroyOnClose
        onOk={this.handleOk}
      >
        <Form>
          <Form.Item
            {...formItemLayout}
            label={intl.get(`spcm.paymentRequest.view.rejectReason`).d('退回原因')}
          >
            {getFieldDecorator('rejectReason', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spcm.paymentRequest.view.rejectReason`).d('退回原因'),
                    }),
                  },
                ],
              })(
                <Input.TextArea
                  autosize={{ minRows: 3, maxRows: 6 }}
                />
              )}
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}
