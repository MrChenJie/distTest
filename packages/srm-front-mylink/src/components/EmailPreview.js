import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined, isFunction, isArray } from 'lodash';
import { Form, Input, Row } from 'antd';
import intl from 'utils/intl';
import { EMAIL } from 'utils/regExp';

import CusSelect from '_cus_components/CusSelect';
import CusNotification from '_cus_components/CusNotification';
import CusSpin from '_cus_components/CusSpin';
import StaticTextEditor from './StaticTextEditor';

const FormItem = Form.Item;
const commonPrompt = 'spfm.electricityCharge';
const formLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 24 },
};
const formLayout2 = {
  labelCol: { span: 0 },
  wrapperCol: { span: 24 },
};
@connect(({ loading, electricityCharge }) => ({
  // electricityCharge,
  // fetchLoading: loading.effects['electricityCharge/getEmailTemplate'],
  // sendEmailLoading: loading.effects['electricityCharge/sendEmail'],
}))
class EmailPreview extends Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }
    this.staticTextEditor = React.createRef();
    this.state = {
      emailTemplate: undefined,
      emailInfo: {},
      sendTo: [],
    };
  }
  form = React.createRef();

  componentDidMount() {
    this.handleSearch();
  }

  // @Bind()
  // handleSearch() {
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: 'electricityCharge/getEmailTemplate',
  //     payload: { templateCode: 'SQAM.IDC_CHARGE_MANUAL_EMAIL' },
  //   }).then((res) => {
  //     if (res) {
  //       this.setState({
  //         emailInfo: res,
  //       });
  //       this.getEmailTemplate(res);
  //     }
  //   });
  // }

  @Bind()
  getEmailTemplate(emailInfo) {
    const { templateContent } = emailInfo;
    let emailTemplate = templateContent;
    this.setState({
      emailTemplate,
    });
  }

  /**
   * 保存
   */
  @Bind()
  handelSaveOption() {
    const {
      dispatch,
      selectedData,
      setSendLoading = (e) => e,
      onClose = (e) => e,
      onQuery = (e) => e,
    } = this.props;
    const { emailInfo } = this.state;
    let templateContent = '';
    const { validateFields = (e) => e } = this.form?.current;
    validateFields()
      .then(values => {
        this.getEditData().then((data) => {
          if (data.text !== undefined) {
            templateContent = data.text;
            if (templateContent === '' || isUndefined(templateContent)) {
              return;
            }
            const { sender, sendTo, ccTo, ...others } = values;
            let emailValidate = true;
            let errMessageList = [];
            if (!EMAIL.test(sender)) {
              emailValidate = false;
                errMessageList.push(
                  intl
                    .get(`${commonPrompt}.view.message.email.validate`, {
                      email: sender,
                    })
                    .d('${email}邮箱格式不对')
                );
            };
            sendTo.map((item) => {
              if (!EMAIL.test(item)) {
                emailValidate = false;
                errMessageList.push(
                  intl
                    .get(`${commonPrompt}.view.message.email.validate`, {
                      email: item,
                    })
                    .d('${email}邮箱格式不对')
                );
              }
            });
            Array.isArray(ccTo) &&
              ccTo.map((item) => {
                if (!EMAIL.test(item)) {
                  emailValidate = false;
                  errMessageList.push(
                    intl
                      .get(`${commonPrompt}.view.message.email.validate`, {
                        email: item,
                      })
                      .d('${email}邮箱格式不对')
                  );
                }
              });
            if (emailValidate) {
              let receiverList;
              if (sendTo && isArray(sendTo)) {
                receiverList = sendTo.map((item) => {
                  return { email: item };
                });
              }
              dispatch({
                type: 'electricityCharge/sendEmail',
                payload: {
                  ...emailInfo,
                  ...others,
                  sender,
                  receiverList,
                  ccList: ccTo,
                  content: templateContent,
                  chargeIdList: selectedData.map(item => item.chargeId),
                },
              }).then((res) => {
                setSendLoading(false);
                if (res) {
                  CusNotification.success();
                  onClose();
                  if (onQuery) {
                    onQuery();
                  }
                }
              });
            } else {
              const description = (
                <div>
                  {errMessageList.map((item) => (
                    <p>{item}</p>
                  ))}
                </div>
              );
              CusNotification.error({
                message: intl.get('hzero.common.notification.error').d('操作失败'),
                description: description,
              });
              setSendLoading(false);
            }
          }
        });
      })
      .catch(() => {
        setSendLoading(false);
      })
  }

  @Bind()
  getEditData() {
    if (!this.staticTextEditor) {
      return Promise.reject();
    }
    return new Promise((resolve, reject) => {
      const { validateFields = (e) => e } = this.form?.current;
      validateFields()
        .then(fieldsValue => {
          const { editor } = (this.staticTextEditor.staticTextEditor || {}).current;
          if (!editor || !editor.getData()) {
            return CusNotification.error({
              message: intl
                .get(`${commonPrompt}.view.message.alert.contentRequired`)
                .d('请输入邮件内容'),
            });
          }
          resolve({
            ...fieldsValue,
            text: editor.getData(),
          });
        })
        .catch(() => {
          reject();
        })
    });
  }

  render() {
    const {
      idpValueMap,
      fetchLoading = false,
      sendEmailLoading = false
    } = this.props;
    const { emailTemplate } = this.state;

    return (
      <div className='customize-form'>
        <CusSpin spinning={fetchLoading || sendEmailLoading}>
          <Form ref={this.form}>
            <Row>
              <FormItem
                label={intl.get(`${commonPrompt}.view.emailPreview.subject`).d('Email Subject:')}
                {...formLayout}
                name="subject"
                rules={[
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${commonPrompt}.view.emailPreview.subject`)
                        .d('Email Subject:'),
                    }),
                  },
                ]}
              >
                <Input />
              </FormItem>
            </Row>
            <Row>
              <FormItem
                label={intl.get(`${commonPrompt}.view.emailPreview.sender`).d('Sender: ')}
                {...formLayout}
                name="sender"
                rules={[
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${commonPrompt}.view.emailPreview.sender`)
                        .d('Sender:'),
                    }),
                  },
                ]}
              >
                <CusSelect
                  options={idpValueMap['IDC_ELECTRICITY_CHARGE_PUBLIC_MAILBOX']}
                />
              </FormItem>
            </Row>
            <Row>
              <FormItem
                label={intl.get(`${commonPrompt}.view.emailPreview.sendTo`).d('Send To:')}
                {...formLayout}
                name="sendTo"
                rules={[
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.view.emailPreview.sendTo`).d('Send To:'),
                    }),
                  },
                ]}
              >
                <CusSelect mode="tags" showArrow={false} dropdownStyle={{ display: 'none' }} />
              </FormItem>
            </Row>
            <Row>
              <FormItem
                label={intl.get(`${commonPrompt}.view.emailPreview.ccTo`).d('CC To:')}
                {...formLayout}
                name="ccTo"
              >
                <CusSelect mode="tags" showArrow={false} dropdownStyle={{ display: 'none' }} />
              </FormItem>
            </Row>
            <Row>
              <FormItem
                label={intl.get(`${commonPrompt}.view.emailPreview.exportType`).d('PDF 模板：')}
                {...formLayout}
                name="exportType"
                rules={[
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${commonPrompt}.view.emailPreview.exportType`)
                        .d('PDF 模板：'),
                    }),
                  },
                ]}
              >
                <CusSelect
                  options={idpValueMap['IDC_ELECTRICITY_CHARGE_PDF_TYPE']}
                />
              </FormItem>
            </Row>
            <Row>
              <Form.Item {...formLayout2}>
                {!fetchLoading && emailTemplate && (
                  <StaticTextEditor
                    key={1}
                    content={emailTemplate}
                    readOnly={false}
                    onRef={(staticTextEditor) => {
                      this.staticTextEditor = staticTextEditor;
                    }}
                  />
                )}
              </Form.Item>
            </Row>
          </Form>
        </CusSpin>
      </div>
    );
  }
}

export default EmailPreview;
