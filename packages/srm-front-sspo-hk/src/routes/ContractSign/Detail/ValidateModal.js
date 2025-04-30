/*
 * @Description: 手机验证模态框
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-08-14 09:30:12
 * @LastEditTime: 2019-08-14 13:46:36
 */
import React, { Component, Fragment } from 'react';
import { Modal, Input, Form, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { isFunction } from 'lodash';

import styles from './index.less';

const modelPrompt = 'spcm.contractChapter.model.common';
const messagePrompt = 'spcm.contractChapter.view.message';

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

@Form.create({ fieldNameProp: null })
export default class ValidateModal extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      remainingTime: 60,
      getCheckCode: true,
    };
  }

  @Bind()
  handleCancel() {
    this.setState({
      remainingTime: 60,
      getCheckCode: true,
    });
    const {
      onClose,
      form: { resetFields },
    } = this.props;
    onClose();
    clearInterval(this.validateModal);
    resetFields();
  }

  validateModal;

  /**
   *
   *  手机验证码获取并进行倒计时
   * @memberof ValidateModal
   */
  @Bind()
  handleCheckCode() {
    const { form, onGetCheckCode } = this.props;
    const mobile = form.getFieldValue('mobile');
    onGetCheckCode(mobile);
    const that = this;
    form.validateFields(['mobile'], err => {
      if (!err) {
        that.setState({ getCheckCode: false });
        let remainingTime = 60;
        this.validateModal = setInterval(() => {
          remainingTime--;
          that.setState({ remainingTime });
          if (remainingTime === -1) {
            clearInterval(that.validateModal);
            that.setState({ getCheckCode: true, remainingTime: 60 });
          }
        }, 1000);
      }
    });
  }

  /**
   * 保存 modal 数据，并且关闭 modal
   */
  @Bind()
  handleOk() {
    const { form, onModalOk } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        clearInterval(this.validateModal);
        this.setState({ getCheckCode: true, remainingTime: 60 });
        onModalOk(values);
      }
    });
  }

  render() {
    const {
      mobileModalVisible,
      contractLoading,
      form: { getFieldDecorator },
    } = this.props;
    const { getCheckCode, remainingTime } = this.state;
    return (
      <Modal
        title={intl.get(`${messagePrompt}.title.noteVerification`).d('短信验证')}
        visible={mobileModalVisible}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        footer={
          <Fragment>
            <Button onClick={this.handleCancel}>
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </Button>
            <Button type="primary" onClick={this.handleOk} loading={contractLoading}>
              {intl.get(`hzero.common.button.ok`).d('确定')}
            </Button>
          </Fragment>
        }
      >
        <div className={styles.mobileModal}>
          <Form.Item
            label={intl.get(`${modelPrompt}.mobileNumber`).d('手机号码')}
            {...formItemLayout}
            onSubmit={this.afterCheckNumber}
          >
            {getFieldDecorator('mobile', {
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl.get(`${modelPrompt}.mobileNumber`).d('手机号码'),
                    })
                    .d(`${intl.get(`${modelPrompt}.mobileNumber`).d('手机号码')}不能为空`),
                },
                {
                  pattern: /^1(3|4|5|6|7|8|9)\d{9}$/,
                  message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                },
              ],
            })(<Input onChange={this.afterNumber} disabled={!getCheckCode} />)}
            {getCheckCode ? (
              <Button type="primary" onClick={this.handleCheckCode}>
                {intl.get(`${modelPrompt}.getVerificationCode`).d('获取验证码')}
              </Button>
            ) : (
              <Button type="primary" disabled>
                {intl.get(`${modelPrompt}.remainingTime`).d('剩余时间')}
                {remainingTime}s
              </Button>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get(`${modelPrompt}.verificationCode`).d('验证码')}
            {...formItemLayout}
          >
            {getFieldDecorator('verifiCode', {
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl.get(`${modelPrompt}.verificationCode`).d('验证码'),
                    })
                    .d(`${intl.get(`${modelPrompt}.verificationCode`).d('验证码')}不能为空`),
                },
              ],
            })(<Input />)}
          </Form.Item>
        </div>
      </Modal>
    );
  }
}
