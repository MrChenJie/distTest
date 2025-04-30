import React from 'react';
import { Input, Form } from 'antd';
import { Bind } from 'lodash-decorators';
import CusModal from '_cus_components/CusModal';
import intl from 'utils/intl';

const FormItem = Form.Item;

export default class TLModal extends React.Component {
  form = React.createRef();

  @Bind()
  saveAndClose() {
    const { onOK = (e) => e } = this.props;
    const { validateFields } = this.form.current;
    validateFields().then((fieldsValue) => {
      onOK(fieldsValue);
    });
  }

  render() {
    const { modalVisible, onCancel, list, label, width = '520px', inputSize = {} } = this.props;
    const { zh = 60, en = 180 } = inputSize;
    return (
      <CusModal
        destroyOnClose
        title={label}
        width={width}
        visible={modalVisible}
        onCancel={onCancel}
        onOk={this.saveAndClose}
      >
        <Form ref={this.form} className="customize-form">
          {list.map((item) => (
            <FormItem
              label={item.name}
              key={item.code}
              name={item.code}
              initialValue={item.value}
              rules={[
                {
                  max: item.code === 'zh_CN' ? zh : en,
                  message: intl.get('hzero.common.validation.max', {
                    max: item.code === 'zh_CN' ? zh : en,
                  }),
                },
              ]}
            >
              <Input />
            </FormItem>
          ))}
        </Form>
      </CusModal>
    );
  }
}
