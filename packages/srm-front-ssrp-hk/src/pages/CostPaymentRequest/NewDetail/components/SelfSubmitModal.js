import React, { Component } from 'react';
import { Form, Col, Row } from 'hzero-ui';
import CusModal from '_cus_components/CusModal';
import CusInput from '_cus_components/CusInput';
import { getCurrentLanguage } from 'utils/utils';
import intl from 'utils/intl';

const prompt = 'spcm.costPayment';

@Form.create({ fieldNameProp: null })
class SelfSubmitModal extends Component {
  render() {
    const {
      onCancel = (e) => e,
      form: { getFieldValue, getFieldDecorator },
      onOk = (e) => e,
      ...restProps
    } = this.props;
    return (
      <CusModal
        {...restProps}
        title={intl.get(`${prompt}.view.detail.archive`).d('归档')}
        destroyOnClose
        onOk={() => {
          const remark = getFieldValue('remark');
          onOk(remark);
        }}
        onCancel={onCancel}
        width={800}
      >
        <div style={{ marginLeft: '16px', marginBottom: '32px' }}>
          <Form className="customize-form">
            <Row>
              <Col span={12}>
                <Form.Item label={intl.get(`${prompt}.view.detail.opinion`).d('签字意见')}>
                  {getFieldDecorator('select', {
                    initialValue: getCurrentLanguage() === 'en_US' ? 'Agree' : '同意',
                  })(<CusInput disabled />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                {getFieldDecorator('remark', {
                  initialValue: getCurrentLanguage() === 'en_US' ? 'Agree' : '同意',
                })(<CusInput.TextArea rows={3} autoSize={{ minRows: 3, maxRows: 3 }} />)}
              </Col>
            </Row>
          </Form>
        </div>
      </CusModal>
    );
  }
}

export default SelfSubmitModal;
