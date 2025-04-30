import React, { Component, Fragment } from 'react';
import { Modal, Form, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import styles from './index.less';

const FormItem = Form.Item;
const { TextArea } = Input;
@Form.create()
export default class componentName extends Component {
  /**
   * 确认回调
   */
  @Bind()
  handleOk() {
    const {
      onOk,
      form: { validateFields },
    } = this.props;
    validateFields((err, values) => {
      if (!err) {
        if (onOk) {
          onOk(values);
          // this.handleCancel();
        }
      }
    });
  }

  @Bind()
  handleCancel() {
    const {
      onCancel,
      form: { resetFields },
    } = this.props;
    resetFields();
    onCancel();
  }

  render() {
    const {
      visible,
      terminateLoading,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Modal
        className={styles['reject-modal']}
        footer={
          <Fragment>
            <Button onClick={this.handleCancel}>
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </Button>
            <Button type="primary" onClick={this.handleOk} loading={terminateLoading}>
              {intl.get(`hzero.common.button.ok`).d('确定')}
            </Button>
          </Fragment>
        }
        title={intl.get(`spcm.contractChange.view.button.terminate`).d('终止')}
        onCancel={this.handleCancel}
        visible={visible}
      >
        <Form>
          <FormItem
            label={intl.get(`spcm.common.model.terminationReason`).d('终止原因')}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
          >
            {getFieldDecorator('terminationReason', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`spcm.common.model.terminationReason`).d('终止原因'),
                  }),
                },
              ],
            })(<TextArea className={styles['text-area']} rows={4} />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
