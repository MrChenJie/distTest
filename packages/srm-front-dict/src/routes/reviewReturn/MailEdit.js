import React from 'react';
import { Col, Input, Row } from 'hzero-ui';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import StaticTextEditor from './StaticTextEditor';
import { EMAIL } from 'utils/regExp';
import { Bind } from 'lodash-decorators';

const commonPrompt = 'spfmhk.dict';

@Form.create()
export default class MailEdit extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);
    this.staticTextEditor = React.createRef();
    this.state = {};
  }

  // 检验邮箱规则
  checkMails(value) {
    let arr = value.split(';');
    arr = arr.filter((item) => {
      return item !== '';
    });

    const result = arr.every((item) => {
      return EMAIL.test(item);
    });
    return result;
  }

  @Bind()
  onEditorChange(content) {
    const {
      form: { setFieldsValue },
    } = this.props;
    console.log(content);
    setFieldsValue({
      emailContent: content,
    });
  }

  render() {
    const { form, mailInfo = {}, isModelSelected, isEdit } = this.props;

    const { getFieldDecorator } = form;
    const formItemLayout = {
      wrapperCol: { span: 14, offset: 1 },
    };

    return (
      <>
        <div className="customize-form">
          <Form>
            <Row>
              <Col span={12}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.back.sendemailtime`).d('最近发送时间')}
                  name="lastUpdateDate"
                >
                  {getFieldDecorator('lastUpdateDate', {
                    initialValue: mailInfo.refuseDate,
                  })(<Input disabled />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.back.emailproject`).d('邮件主题')}
                  name="emailSubjuct"
                >
                  {getFieldDecorator('emailSubjuct', {
                    initialValue: mailInfo.emailSubjuct,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${commonPrompt}.view.back.emailproject`).d('邮件主题'),
                        }),
                      },
                    ],
                  })(<Input disabled={!isModelSelected || !isEdit} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.back.emailsendtosb`).d('发送至')}
                  name="sendTo"
                >
                  {getFieldDecorator('sendTo', {
                    initialValue: mailInfo.sendTo,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${commonPrompt}.view.field.email`).d('邮箱'),
                        }),
                      },
                      // {
                      //   pattern: EMAIL,
                      //   message: intl
                      //     .get(`${commonPrompt}.field.email.placeHolder`)
                      //     .d('邮箱格式不正确'),
                      // },
                      {
                        validator: (_, value, callback) => {
                          try {
                            if (this.checkMails(value)) {
                              callback();
                            } else
                              callback(
                                intl
                                  .get(`${commonPrompt}.field.email.placeHolder`)
                                  .d('邮箱格式不正确')
                              );
                          } catch (err) {
                            callback();
                          }
                        },
                      },
                    ],
                  })(<Input disabled={!isModelSelected || !isEdit} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.back.emailcctosb`).d('抄送至')}
                  name="ccTo"
                >
                  {getFieldDecorator('ccTo', {
                    initialValue: mailInfo.ccTo,
                    rules: [
                      // {
                      //   pattern: EMAIL,
                      //   message: intl
                      //     .get(`${commonPrompt}.field.email.placeHolder`)
                      //     .d('邮箱格式不正确'),
                      // },
                      {
                        validator: (_, value, callback) => {
                          try {
                            if (this.checkMails(value)) {
                              callback();
                            } else
                              callback(
                                intl
                                  .get(`${commonPrompt}.field.email.placeHolder`)
                                  .d('邮箱格式不正确')
                              );
                          } catch (err) {
                            callback();
                          }
                        },
                      },
                    ],
                  })(<Input disabled={!isModelSelected || !isEdit} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item name="emailContent" {...formItemLayout}>
                  {getFieldDecorator('emailContent', {
                    initialValue: mailInfo.emailContent,
                  })(
                    <StaticTextEditor
                      onRef={(staticTextEditor) => {
                        this.staticTextEditor = staticTextEditor;
                      }}
                      content={mailInfo.emailContent}
                      config={{ height: 300 }}
                      onEditorChange={this.onEditorChange}
                      disabled={!isModelSelected || !isEdit}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </>
    );
  }
}
