import React, { Component, Fragment } from 'react';
import { Form, Modal, Input, Row, Col, Select } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import intl from 'utils/intl';

const { Option } = Select;
const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 16 },
};
const colSpan = { span: 12 };

@Form.create({ fieldNameProp: null })
export default class EditModal extends Component {
  @Bind()
  authLevelValueRender() {
    const { form = {}, dataSource = {} } = this.props;
    const { getFieldValue = () => {}, getFieldDecorator = () => {} } = form;
    const { authLevelValue, authLevelValueMeaning } = dataSource;
    const authLevel = getFieldValue('authLevel');
    const lovType = {
      TENANT: 'HITF.SELF_TENANT',
      ROLE: 'HITF.USER_ROLE',
      CLIENT: 'HITF.APPLICATION.CLIENT',
    };

    return (
      lovType[authLevel] && (
        <Col {...colSpan}>
          <Form.Item
            label={intl.get(`hitf.interfaces.model.interfaces.authLevelValue`).d('认证层级值')}
            {...formLayout}
          >
            {getFieldDecorator('authLevelValue', {
              initialValue: authLevelValue,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`hitf.interfaces.model.interfaces.authLevelValue`)
                      .d('认证层级值'),
                  }),
                },
              ],
            })(<Lov code={lovType[authLevel]} textValue={authLevelValueMeaning} />)}
          </Form.Item>
        </Col>
      )
    );
  }

  @Bind()
  handleSave() {
    const { form = {}, onOk = () => {}, interfaceId } = this.props;
    const { validateFields, setFieldsValue, getFieldValue } = form;

    if (getFieldValue('authLevel') === 'INTERFACE') {
      setFieldsValue({ authLevelValue: interfaceId });
    }

    validateFields((err, values) => {
      if (isEmpty(err)) {
        onOk(values);
      }
    });
  }

  render() {
    const {
      form: { getFieldDecorator = e => e, getFieldValue = () => {} },
      visible,
      confirmLoading,
      onCancel = () => {},
      code = {},
    } = this.props;
    return (
      <Modal
        title={intl.get('hitf.interfaces.view.button.add').d('批量添加认证')}
        visible={visible}
        destroyOnClose
        width="50%"
        onCancel={() => onCancel()}
        onOk={() => this.handleSave()}
        confirmLoading={confirmLoading}
      >
        <Form>
          <Row type="flex">
            <Col {...colSpan}>
              <Form.Item
                label={intl.get(`hitf.interfaces.model.interfaces.authLevel`).d('认证层级')}
                {...formLayout}
              >
                {getFieldDecorator('authLevel', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`hitf.interfaces.model.interfaces.authLevel`).d('认证层级'),
                      }),
                    },
                  ],
                })(
                  <Select allowClear onChange={this.onAuthLevelChange}>
                    {(code['HITF.AUTH_LEVEL'] || []).map(n => (
                      <Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            {this.authLevelValueRender()}
            <Col {...colSpan}>
              <Form.Item
                label={intl.get(`hitf.interfaces.model.interfaces.authType`).d('认证模式')}
                {...formLayout}
              >
                {getFieldDecorator('authType', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`hitf.interfaces.model.interfaces.authType`).d('认证模式'),
                      }),
                    },
                  ],
                })(
                  <Select allowClear onChange={this.onAuthTypeChange}>
                    {(code['HITF.AUTH_TYPE'] || []).map(n => (
                      <Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            {getFieldValue('authType') === 'OAUTH2' && (
              <Col {...colSpan}>
                <Form.Item
                  label={intl.get(`hitf.interfaces.model.interfaces.grantType`).d('授权模式')}
                  {...formLayout}
                >
                  {getFieldDecorator('grantType', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`hitf.interfaces.model.interfaces.grantType`)
                            .d('授权模式'),
                        }),
                      },
                    ],
                  })(
                    <Select allowClear>
                      {(code['HITF.GRANT_TYPE'] || []).map(n => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            )}
            {(getFieldValue('authType') === 'BASIC' ||
              (getFieldValue('authType') === 'OAUTH2' &&
                getFieldValue('grantType') === 'PASSWORD')) && (
                <Fragment>
                  <Col {...colSpan}>
                    <Form.Item
                      label={intl
                      .get(`hitf.interfaces.model.interfaces.authUsername`)
                      .d('认证用户名')}
                      {...formLayout}
                    >
                      {getFieldDecorator('authUsername', {
                      rules: [
                        {
                          max: 80,
                          message: intl.get('hzero.common.validation.max', {
                            max: 80,
                          }),
                        },
                      ],
                    })(<Input inputChinese={false} typeCase="upper" />)}
                    </Form.Item>
                  </Col>
                  <Col {...colSpan}>
                    <Form.Item
                      label={intl.get(`hitf.interfaces.model.interfaces.authPassword`).d('认证密码')}
                      {...formLayout}
                    >
                      {getFieldDecorator('authPassword', {
                      rules: [
                        {
                          max: 255,
                          message: intl.get('hzero.common.validation.max', {
                            max: 255,
                          }),
                        },
                      ],
                    })(<Input type="password" inputChinese={false} />)}
                    </Form.Item>
                  </Col>
                </Fragment>
            )}
            {getFieldValue('authType') === 'OAUTH2' && getFieldValue('grantType') === 'PASSWORD' && (
              <Col {...colSpan}>
                <Form.Item
                  label={intl
                    .get(`hitf.interfaces.model.interfaces.passwordEncodeType`)
                    .d('密码加密类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('passwordEncodeType')(
                    <Select allowClear>
                      {(code['HITF.PASSWORD_ENCODE_TYPE'] || []).map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            )}
            {getFieldValue('authType') === 'OAUTH2' && (
              <Fragment>
                <Col {...colSpan}>
                  <Form.Item label="Token URL" {...formLayout}>
                    {getFieldDecorator('accessTokenUrl', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`hitf.interfaces.model.interfaces.accessTokenUrl`)
                              .d('Token URL'),
                          }),
                        },
                        {
                          max: 255,
                          message: intl.get('hzero.common.validation.max', {
                            max: 255,
                          }),
                        },
                      ],
                    })(<Input inputChinese={false} />)}
                  </Form.Item>
                </Col>
                <Col {...colSpan}>
                  <Form.Item
                    label={intl.get(`hitf.interfaces.model.interfaces.clientId`).d('客户端ID')}
                    {...formLayout}
                  >
                    {getFieldDecorator('clientId', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`hitf.interfaces.model.interfaces.clientId`)
                              .d('客户端ID'),
                          }),
                        },
                        {
                          max: 255,
                          message: intl.get('hzero.common.validation.max', {
                            max: 255,
                          }),
                        },
                      ],
                    })(<Input inputChinese={false} />)}
                  </Form.Item>
                </Col>
                <Col {...colSpan}>
                  <Form.Item
                    label={intl
                      .get(`hitf.interfaces.model.interfaces.clientSecret`)
                      .d('客户端密钥')}
                    {...formLayout}
                  >
                    {getFieldDecorator('clientSecret', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`hitf.interfaces.model.interfaces.clientSecret`)
                              .d('客户端密钥'),
                          }),
                        },
                        {
                          max: 255,
                          message: intl.get('hzero.common.validation.max', {
                            max: 255,
                          }),
                        },
                      ],
                    })(<Input type="password" inputChinese={false} />)}
                  </Form.Item>
                </Col>
              </Fragment>
            )}
            <Col {...colSpan}>
              <Form.Item
                label={intl
                  .get(`hitf.interfaces.model.interfaces.soapWssPasswordType`)
                  .d('SOAP加密类型')}
                {...formLayout}
              >
                {getFieldDecorator('soapWssPasswordType')(
                  <Select allowClear>
                    {(code['HITF.SOAP_WSS_PASSWORD_TYPE'] || []).map(n => (
                      <Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            {(getFieldValue('soapWssPasswordType') === 'PasswordText' ||
              getFieldValue('soapWssPasswordType') === 'PasswordDegist') && (
              <Fragment>
                <Col {...colSpan}>
                  <Form.Item
                    label={intl
                      .get(`hitf.interfaces.model.interfaces.soapUsername`)
                      .d('校验用户名')}
                    {...formLayout}
                  >
                    {getFieldDecorator('soapUsername', {
                      rules: [
                        {
                          max: 255,
                          message: intl.get('hzero.common.validation.max', {
                            max: 255,
                          }),
                        },
                      ],
                    })(<Input inputChinese={false} typeCase="upper" />)}
                  </Form.Item>
                </Col>
                <Col {...colSpan}>
                  <Form.Item
                    label={intl.get(`hitf.interfaces.model.interfaces.soapPassword`).d('校验密码')}
                    {...formLayout}
                  >
                    {getFieldDecorator('soapPassword', {
                      rules: [
                        {
                          max: 255,
                          message: intl.get('hzero.common.validation.max', {
                            max: 255,
                          }),
                        },
                      ],
                    })(<Input type="password" inputChinese={false} />)}
                  </Form.Item>
                </Col>
              </Fragment>
            )}
            <Col {...colSpan}>
              <Form.Item
                label={intl.get(`hitf.interfaces.model.interfaces.remark`).d('备注')}
                {...formLayout}
              >
                {getFieldDecorator('remark', {
                  rules: [
                    {
                      max: 480,
                      message: intl.get('hzero.common.validation.max', {
                        max: 480,
                      }),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
