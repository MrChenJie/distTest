import React, { Component, Fragment } from 'react';
import { Modal, Form, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import styles from './index.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const viewMessagePrompt = 'spcm.contractApproval.view.message';
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
          this.handleCancel();
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
      rejectLoading,
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
            <Button type="primary" onClick={this.handleOk} loading={rejectLoading}>
              {intl.get(`hzero.common.button.ok`).d('确定')}
            </Button>
          </Fragment>
        }
        title={intl.get(`spfm.certificationApproval.view.button.approval`).d('审批通过')}
        onCancel={this.handleCancel}
        visible={visible}
      >
        <Form>
          <FormItem
            label={intl.get(`${viewMessagePrompt}.approvalOpinion`).d('审批意见')}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
          >
            {getFieldDecorator('approvedRemark', {
              rules: [
                {
                  // required: true,
                  message: intl.get('hzero.common.approvedRemark.notNull', {
                    name: intl.get(`${viewMessagePrompt}.approvalOpinion`).d('审批意见'),
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
