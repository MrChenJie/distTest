/*
 * AuthenticationServiceModal - 认证弹窗
 * @date: 2018-10-25
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Input, Row, Col, Select, Button } from 'hzero-ui';
import { isEmpty, omit } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

const FormItem = Form.Item;
const { Option } = Select;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

@Form.create({ fieldNameProp: null })
export default class AuthenticationServiceModal extends PureComponent {
  constructor(props) {
    super(props);
    // this.state = {
    //   isGrantTypeActive: false,
    // };
    this.cancel = this.cancel.bind(this);
    this.state = {
      isAuth: false,
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  // getSnapshotBeforeUpdate(prevProps) {
  //   const { visible, dataSource = {}, form = {}, edited } = this.props;
  //   if (visible && prevProps.visible !== visible && !edited) {
  //     const { setFieldsValue, getFieldDecorator } = form;
  //     Object.keys(dataSource).forEach((n) => {
  //       getFieldDecorator(n);
  //     });
  //     setFieldsValue(dataSource);
  //   }
  // }

  @Bind()
  ok() {
    const {
      onOk = e => e,
      onCancel = e => e,
      form: { validateFields },
    } = this.props;
    validateFields((err, values) => {
      if (isEmpty(err)) {
        onOk(values);
      }
    });
    onCancel(true);
  }

  @Bind()
  cancel() {
    const { onCancel = e => e } = this.props;
    onCancel();
  }

  @Bind()
  handleChangeAuthType() {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({ grantType: undefined });
  }

  defaultRowkey = 'id';

  @Bind()
  onGrantTypeChange(value) {
    const {
      form: { setFieldsValue, getFieldDecorator },
      dataSource,
    } = this.props;
    Object.keys(dataSource).forEach(n => {
      getFieldDecorator(n);
    });
    setFieldsValue({
      ...omit(dataSource, ['authType']),
      accessTokenUrl: value === dataSource.grantType ? dataSource.accessTokenUrl : undefined,
    });
    // this.setState({
    //   isGrantTypeActive: true,
    // });
  }

  /**
   * 测试信息是否配置正确
   */
  @Bind()
  testUrl() {
    const {
      onTestUrl = () => {},
      form: { validateFields },
      testLoading,
    } = this.props;
    if (testLoading) return;
    validateFields((err, values) => {
      if (isEmpty(err)) {
        onTestUrl(values);
      }
    });
  }

  @Bind()
  renderFooter() {
    const {
      testLoading,
      loading,
      form: { getFieldValue = e => e },
    } = this.props;
    const { isAuth } = this.state;
    return [
      <Button
        key="test"
        loading={testLoading}
        onClick={this.testUrl}
        style={{
          display:
            getFieldValue('authType') === 'OAUTH2' ||
            (isAuth && getFieldValue('authType') === undefined ? 'inline' : 'none'),
        }}
      >
        {intl.get('hitf.services.view.button.test').d('测试')}
      </Button>,
      <Button key="back" onClick={this.cancel.bind(this)}>
        {intl.get(`hzero.common.button.cancel`).d('取消')}
      </Button>,
      <Button key="submit" type="primary" loading={loading} onClick={this.ok.bind(this)}>
        {intl.get(`hzero.common.button.ok`).d('确定')}
      </Button>,
    ];
  }

  render() {
    const {
      title,
      visible,
      onCancel,
      onOk,
      dataSource,
      loading,
      defaultSelectedRow,
      form: { getFieldDecorator = e => e, getFieldValue },
      authTypes = [],
      grantTypes = [],
      passwordTypes = [],
      testLoading,
      ...others
    } = this.props;
    // const { isGrantTypeActive = false } = this.state;

    const {
      authType,
      grantType,
      authUsername,
      authPassword,
      clientSecret,
      clientId,
      accessTokenUrl,
      passwordEncodeType,
    } = dataSource;

    if (authType) {
      this.setState({
        isAuth: authType === 'OAUTH2',
      });
    }

    // 因为不能清空, 所以如果表单有值 就是表单的值, 否则是 初始值
    // const curAuthType = getFieldValue('authType');
    // const curGrantType = getFieldValue('grantType');

    return (
      <Modal
        title={intl.get(`hitf.services.view.message.title.editor.authConfig`).d('服务认证配置')}
        visible={visible}
        onOk={this.ok.bind(this)}
        onCancel={this.cancel.bind(this)}
        destroyOnClose
        width={750}
        footer={this.renderFooter()}
        {...others}
      >
        <Form>
          <Row>
            <Col span={12}>
              <FormItem
                label={intl.get(`hitf.services.model.services.authType`).d('认证模式')}
                {...formLayout}
              >
                {getFieldDecorator('authType', {
                  initialValue: authType || 'NONE',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`hitf.services.model.services.authType`).d('认证模式'),
                      }),
                    },
                  ],
                })(
                  <Select onChange={this.handleChangeAuthType} allowClear>
                    {authTypes.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            {getFieldValue('authType') === 'OAUTH2' && (
              <Col span={12}>
                <FormItem
                  label={intl.get(`hitf.services.model.services.grantType`).d('授权模式')}
                  {...formLayout}
                >
                  {getFieldDecorator('grantType', {
                    initialValue: authType === 'OAUTH2' ? grantType : undefined,
                  })(
                    <Select onChange={this.onGrantTypeChange} allowClear>
                      {grantTypes.map(n => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            )}
          </Row>
          {(getFieldValue('authType') === 'BASIC' ||
            (getFieldValue('authType') === 'OAUTH2' &&
              getFieldValue('grantType') === 'PASSWORD')) && (
              <Row>
                <Col span={12}>
                  <FormItem
                    label={intl.get(`hitf.services.model.services.authUsername`).d('认证用户名')}
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
                  })(<Input />)}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem
                    label={intl.get(`hitf.services.model.services.authPassword`).d('认证密码')}
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
                  })(<Input type="password" />)}
                  </FormItem>
                </Col>
              </Row>
          )}
          {getFieldValue('authType') === 'OAUTH2' && getFieldValue('grantType') === 'PASSWORD' && (
            <Row>
              <Col span={12}>
                <FormItem
                  label={intl
                    .get(`hitf.services.model.services.passwordEncodeType`)
                    .d('密码加密类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('passwordEncodeType', {
                    initialValue: passwordEncodeType,
                  })(
                    <Select allowClear>
                      {passwordTypes.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          )}
          <Row>
            {getFieldValue('authType') === 'OAUTH2' && (
              <Col span={12}>
                <FormItem
                  label={intl.get(`hitf.services.model.services.clientId`).d('客户端ID')}
                  {...formLayout}
                >
                  {getFieldDecorator('clientId', {
                    initialValue: clientId,
                    rules: [
                      {
                        required: getFieldValue('grantType') === 'CLIENT',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`hitf.services.model.services.clientId`).d('客户端ID'),
                        }),
                      },
                      {
                        max: 255,
                        message: intl.get('hzero.common.validation.max', {
                          max: 255,
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </Col>
            )}
            {getFieldValue('authType') === 'OAUTH2' && (
              <Col span={12}>
                <FormItem
                  label={intl.get(`hitf.services.model.services.clientSecret`).d('客户端密钥')}
                  {...formLayout}
                >
                  {getFieldDecorator('clientSecret', {
                    initialValue: clientSecret,
                    rules: [
                      {
                        required: getFieldValue('grantType') === 'CLIENT',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`hitf.services.model.services.clientSecret`)
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
                  })(<Input type="password" />)}
                </FormItem>
              </Col>
            )}
          </Row>
          <Row>
            {getFieldValue('authType') === 'OAUTH2' && (
              <Col span={18}>
                <FormItem
                  label={intl
                    .get(`hitf.services.model.services.accessTokenUrl`)
                    .d('获取Token的URL')}
                  {...formLayout}
                >
                  {getFieldDecorator('accessTokenUrl', {
                    initialValue: accessTokenUrl,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`hitf.services.model.services.accessTokenUrl`)
                            .d('获取Token的URL'),
                        }),
                      },
                      {
                        max: 255,
                        message: intl.get('hzero.common.validation.max', {
                          max: 255,
                        }),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </Col>
            )}
          </Row>
        </Form>
      </Modal>
    );
  }
}
