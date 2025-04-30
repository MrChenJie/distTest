import React, { PureComponent, Fragment } from 'react';
import { Form, Input, Select } from 'hzero-ui';
import { toSafeInteger } from 'lodash';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';

import intl from 'utils/intl';

const FormItem = Form.Item;
const { Option } = Select;

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

@Form.create({ fieldNameProp: null })
export default class EditorForm extends PureComponent {
  state = {};

  parserSort(value) {
    return toSafeInteger(value);
  }

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
        <FormItem
          label={intl.get(`hitf.interfaces.model.interfaces.authLevelValue`).d('认证层级值')}
          {...formLayout}
        >
          {getFieldDecorator('authLevelValue', {
            initialValue: authLevelValue,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get(`hitf.interfaces.model.interfaces.authLevelValue`).d('认证层级值'),
                }),
              },
            ],
          })(<Lov code={lovType[authLevel]} textValue={authLevelValueMeaning} />)}
        </FormItem>
      )
    );
  }

  @Bind()
  onAuthLevelChange(value) {
    const { form = {}, interfaceId } = this.props;
    const { setFieldsValue = () => {} } = form;
    setFieldsValue({
      authLevelValue: value === 'INTERFACE' ? interfaceId : undefined,
    });
  }

  /**
   * 切换授权类型
   * @param {string} value - 授权类型
   */
  @Bind()
  onAuthTypeChange(value) {
    const { onAuthTypeChange = () => {} } = this.props;
    onAuthTypeChange(value);
  }

  render() {
    const {
      form: { getFieldDecorator = e => e, getFieldValue = () => {} },
      dataSource = {},
      code,
    } = this.props;

    const {
      authUsername,
      authPassword,
      authType,
      authLevel,
      accessTokenUrl,
      clientId,
      clientSecret,
      soapUsername,
      soapPassword,
      soapWssPasswordType,
      grantType,
      remark,
      passwordEncodeType,
    } = dataSource;
    return (
      <Fragment>
        <Form>
          <FormItem
            label={intl.get(`hitf.interfaces.model.interfaces.authLevel`).d('认证层级')}
            {...formLayout}
          >
            {getFieldDecorator('authLevel', {
              initialValue: authLevel,
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
          </FormItem>
          {this.authLevelValueRender()}

          <FormItem
            label={intl.get(`hitf.interfaces.model.interfaces.authType`).d('认证模式')}
            {...formLayout}
          >
            {getFieldDecorator('authType', {
              initialValue: authType,
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
          </FormItem>

          {getFieldValue('authType') === 'OAUTH2' && (
            <FormItem
              label={intl.get(`hitf.interfaces.model.interfaces.grantType`).d('授权模式')}
              {...formLayout}
            >
              {getFieldDecorator('grantType', {
                initialValue: grantType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`hitf.interfaces.model.interfaces.grantType`).d('授权模式'),
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
            </FormItem>
          )}
          {(getFieldValue('authType') === 'BASIC' ||
            (getFieldValue('authType') === 'OAUTH2' &&
              getFieldValue('grantType') === 'PASSWORD')) && (
              <Fragment>
                <FormItem
                  label={intl.get(`hitf.interfaces.model.interfaces.authUsername`).d('认证用户名')}
                  {...formLayout}
                >
                  {getFieldDecorator('authUsername', {
                  initialValue: authUsername,
                  rules: [
                    {
                      max: 80,
                      message: intl.get('hzero.common.validation.max', {
                        max: 80,
                      }),
                    },
                  ],
                })(<Input inputChinese={false} typeCase="upper" />)}
                </FormItem>
                <FormItem
                  label={intl.get(`hitf.interfaces.model.interfaces.authPassword`).d('认证密码')}
                  {...formLayout}
                >
                  {getFieldDecorator('authPassword', {
                  initialValue: authPassword,
                  rules: [
                    {
                      max: 255,
                      message: intl.get('hzero.common.validation.max', {
                        max: 255,
                      }),
                    },
                  ],
                })(<Input type="password" inputChinese={false} />)}
                </FormItem>
              </Fragment>
          )}
          {getFieldValue('authType') === 'OAUTH2' && getFieldValue('grantType') === 'PASSWORD' && (
            <FormItem
              label={intl
                .get(`hitf.interfaces.model.interfaces.passwordEncodeType`)
                .d('密码加密类型')}
              {...formLayout}
            >
              {getFieldDecorator('passwordEncodeType', {
                initialValue: passwordEncodeType,
              })(
                <Select allowClear>
                  {(code['HITF.PASSWORD_ENCODE_TYPE'] || []).map(item => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          )}
          {getFieldValue('authType') === 'OAUTH2' && (
            <Fragment>
              <FormItem label="Token URL" {...formLayout}>
                {getFieldDecorator('accessTokenUrl', {
                  initialValue: accessTokenUrl,
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
              </FormItem>
              <FormItem
                label={intl.get(`hitf.interfaces.model.interfaces.clientId`).d('客户端ID')}
                {...formLayout}
              >
                {getFieldDecorator('clientId', {
                  initialValue: clientId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`hitf.interfaces.model.interfaces.clientId`).d('客户端ID'),
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
              </FormItem>
              <FormItem
                label={intl.get(`hitf.interfaces.model.interfaces.clientSecret`).d('客户端密钥')}
                {...formLayout}
              >
                {getFieldDecorator('clientSecret', {
                  initialValue: clientSecret,
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
              </FormItem>
            </Fragment>
          )}
          <FormItem
            label={intl
              .get(`hitf.interfaces.model.interfaces.soapWssPasswordType`)
              .d('SOAP加密类型')}
            {...formLayout}
          >
            {getFieldDecorator('soapWssPasswordType', {
              initialValue: soapWssPasswordType,
            })(
              <Select allowClear>
                {(code['HITF.SOAP_WSS_PASSWORD_TYPE'] || []).map(n => (
                  <Option key={n.value} value={n.value}>
                    {n.meaning}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
          {(getFieldValue('soapWssPasswordType') === 'PasswordText' ||
            getFieldValue('soapWssPasswordType') === 'PasswordDegist') && (
            <Fragment>
              <FormItem
                label={intl.get(`hitf.interfaces.model.interfaces.soapUsername`).d('校验用户名')}
                {...formLayout}
              >
                {getFieldDecorator('soapUsername', {
                  initialValue: soapUsername,
                  rules: [
                    {
                      max: 255,
                      message: intl.get('hzero.common.validation.max', {
                        max: 255,
                      }),
                    },
                  ],
                })(<Input inputChinese={false} typeCase="upper" />)}
              </FormItem>
              <FormItem
                label={intl.get(`hitf.interfaces.model.interfaces.soapPassword`).d('校验密码')}
                {...formLayout}
              >
                {getFieldDecorator('soapPassword', {
                  initialValue: soapPassword,
                  rules: [
                    {
                      max: 255,
                      message: intl.get('hzero.common.validation.max', {
                        max: 255,
                      }),
                    },
                  ],
                })(<Input type="password" inputChinese={false} />)}
              </FormItem>
            </Fragment>
          )}
          <FormItem
            label={intl.get(`hitf.interfaces.model.interfaces.remark`).d('备注')}
            {...formLayout}
          >
            {getFieldDecorator('remark', {
              initialValue: remark,
              rules: [
                {
                  max: 480,
                  message: intl.get('hzero.common.validation.max', {
                    max: 480,
                  }),
                },
              ],
            })(<Input />)}
          </FormItem>
        </Form>
      </Fragment>
    );
  }
}
