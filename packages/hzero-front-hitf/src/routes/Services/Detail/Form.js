/*
 * Form - 服务注册编辑弹窗
 * @date: 2018-10-25
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Form, Input, Select, Row, Col } from 'hzero-ui';
import { toSafeInteger } from 'lodash';
import { Bind } from 'lodash-decorators';
import Switch from 'components/Switch';
import Lov from 'components/Lov';

import intl from 'utils/intl';
import { CODE_UPPER } from 'utils/regExp';
import {
  DETAIL_EDIT_FORM_CLASSNAME,
  EDIT_FORM_ITEM_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_3_LAYOUT,
} from 'utils/constants';

const FormItem = Form.Item;
const { Option } = Select;

@Form.create({ fieldNameProp: null })
export default class EditorForm extends React.Component {
  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  // componentDidUpdate() {
  //   const { checkFormChanged = () => {}, form = {} } = this.props;
  //   const { getFieldsValue = () => {} } = form;
  //   checkFormChanged(getFieldsValue());
  // }

  parserSort(value) {
    return toSafeInteger(value);
  }

  handleResetClientKey() {
    const {
      resetClientKey = e => e,
      form: { getFieldsValue },
    } = this.props;
    resetClientKey(getFieldsValue(['clientId', 'clientKey']));
  }

  /**
   * 切换服务类别
   * @param {string} value - 选中值
   */
  @Bind()
  handleChangeCategory(value) {
    const {
      form: { setFieldsValue = () => {} },
      onChangeType = () => {},
    } = this.props; // 上面接口定义DOM节点
    if (value === 'INTERNAL') {
      setFieldsValue({ serviceType: 'REST' });
    }
    setFieldsValue({ domainUrl: undefined });
    onChangeType(value);
  }

  render() {
    const {
      form: { getFieldDecorator = e => e, getFieldValue },
      editable,
      dataSource = {},
      tenantRoleLevel,
      onTypeChange = e => e,
      changeListTenant,
      serviceTypes = [],
      wssPasswordTypes = [],
      currentInterfaceType,
      serviceCategory = [],
    } = this.props;
    // const { dirModelVisible, currentParentDir, dirModelDataSource } = this.state;
    const {
      serverCode,
      tenantId,
      realName,
      serviceType,
      domainUrl,
      serverName,
      soapNamespace,
      soapElementPrefix,
      soapUsername,
      soapPassword,
      enabledFlag,
      enabledCertificateFlag,
      soapWssPasswordType,
      certificateId,
      domainName,
      namespace,
    } = dataSource;
    const prefixArr = [{ value: 'http://', key: 1 }, { value: 'https://', key: 2 }];
    let inputUrl = '';
    let protocol = 'http://';
    if (domainUrl && currentInterfaceType === 'EXTERNAL') {
      const urlArr = domainUrl.split('//');
      const [prefix, url] = urlArr;
      protocol = `${prefix}//`;
      inputUrl = url;
    }
    const prefixSelector = getFieldDecorator('protocol', {
      initialValue: protocol || 'http://',
    })(
      <Select style={{ width: 84 }} onChange={this.handleChangeProtocol}>
        {prefixArr.map(item => {
          return (
            <Option key={item.key} value={item.value}>
              {item.value}
            </Option>
          );
        })}
      </Select>
    );
    return (
      <Form className={DETAIL_EDIT_FORM_CLASSNAME}>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          {!tenantRoleLevel && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`hitf.services.model.services.tenant`).d('所属租户')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('tenantId', {
                  initialValue: tenantId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`hitf.services.model.services.tenant`).d('所属租户'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    textValue={realName || ''}
                    code="HPFM.TENANT"
                    onChange={changeListTenant}
                    disabled={editable}
                  />
                )}
              </FormItem>
            </Col>
          )}
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`hitf.services.model.services.code`).d('服务代码')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('serverCode', {
                initialValue: serverCode,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`hitf.services.model.services.code`).d('服务代码'),
                    }),
                  },
                  {
                    max: 128,
                    message: intl.get('hzero.common.validation.max', {
                      max: 128,
                    }),
                  },
                  {
                    pattern: CODE_UPPER,
                    message: intl
                      .get('hzero.common.validation.codeUpper')
                      .d('全大写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
                  },
                ],
                validateFirst: true,
              })(<Input trim typeCase="upper" inputChinese={false} disabled={editable} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`hitf.services.model.services.name`).d('服务名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('serverName', {
                initialValue: serverName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`hitf.services.model.services.name`).d('服务名称'),
                    }),
                  },
                  {
                    max: 250,
                    message: intl.get('hzero.common.validation.max', {
                      max: 250,
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
          {editable && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get('hitf.services.model.services.serviceNamespace').d('服务命名空间')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('namespace', {
                  initialValue: namespace,
                })(<Input disabled />)}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`hitf.services.model.services.type`).d('服务类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('serviceType', {
                initialValue: editable ? serviceType : 'REST',
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`hitf.services.model.services.type`).d('服务类型'),
                    }),
                  },
                ],
              })(
                <Select
                  onChange={onTypeChange}
                  disabled={getFieldValue('serviceCategory') === 'INTERNAL'}
                >
                  {serviceTypes.map(item => (
                    <Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`hitf.services.model.services.category`).d('服务类别')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('serviceCategory', {
                initialValue: currentInterfaceType,
              })(
                <Select onChange={this.handleChangeCategory} disabled={editable}>
                  {serviceCategory.map(item => (
                    <Select.Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          {getFieldValue('serviceCategory') === 'INTERNAL' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`hitf.services.model.services.address`).d('服务地址')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('domainUrl', {
                  initialValue: domainUrl,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl.get(`hitf.services.model.services.address`).d('服务地址'),
                      }),
                    },
                  ],
                })(<Lov textValue={domainUrl} code="HADM.ROUTE_INFORMATION" disabled={editable} />)}
              </FormItem>
            </Col>
          )}
          {getFieldValue('serviceCategory') === 'EXTERNAL' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`hitf.services.model.services.address`).d('服务地址')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('domainUrl', {
                  initialValue: inputUrl,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl.get(`hitf.services.model.services.address`).d('服务地址'),
                      }),
                    },
                    {
                      max: 190,
                      message: intl.get('hzero.common.validation.max', {
                        max: 190,
                      }),
                    },
                  ],
                })(<Input addonBefore={prefixSelector} />)}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`hzero.common.status`).d('状态')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('enabledFlag', {
                initialValue: enabledFlag === 0 ? 0 : 1,
              })(<Switch />)}
            </FormItem>
          </Col>
          {getFieldValue('protocol') === 'https://' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl
                  .get(`hitf.services.model.services.enabledCertificateFlag`)
                  .d('是否启用证书')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('enabledCertificateFlag', {
                  initialValue: enabledCertificateFlag === 1 ? 1 : 0,
                })(<Switch />)}
              </FormItem>
            </Col>
          )}
          {getFieldValue('enabledCertificateFlag') === 1 && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get('hitf.services.model.services.certificate').d('证书')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('certificateId', {
                  initialValue: certificateId,
                  rules: [
                    {
                      required: getFieldValue('enabledCertificateFlag') === 1,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`hitf.services.model.services.certificate`).d('证书'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    textValue={domainName}
                    code="HPFM.CERTIFICATE"
                    queryParams={{
                      serverUrl: `${getFieldValue('protocol')}${getFieldValue('domainUrl')}`,
                    }}
                  />
                )}
              </FormItem>
            </Col>
          )}
        </Row>
        {/* 服务类型为SOAP：显示命名空间、参数前缀、加密类型 */}
        {getFieldValue('serviceType') === 'SOAP' && (
          <Row {...EDIT_FORM_ROW_LAYOUT}>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`hitf.services.model.services.nameSpace`).d('命名空间')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('soapNamespace', {
                  initialValue: soapNamespace,
                })(<Input />)}
              </FormItem>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`hitf.services.model.services.paramPrefix`).d('参数前缀')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('soapElementPrefix', {
                  initialValue: soapElementPrefix,
                  rules: [
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                  ],
                })(<Input />)}
              </FormItem>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`hitf.services.model.services.encryptionType`).d('加密类型')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('soapWssPasswordType', {
                  initialValue: soapWssPasswordType,
                })(
                  <Select>
                    {wssPasswordTypes.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
        )}
        {/* 加密类型不为None：显示校验用户名、校验密码 */}
        {getFieldValue('soapWssPasswordType') !== 'None' &&
          getFieldValue('serviceType') === 'SOAP' && (
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`hitf.services.model.services.userName`).d('校验用户名')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('soapUsername', {
                    initialValue: soapUsername,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`hitf.services.model.services.password`).d('校验密码')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('soapPassword', {
                    initialValue: soapPassword,
                  })(<Input type="password" />)}
                </FormItem>
              </Col>
            </Row>
          )}
      </Form>
    );
  }
}
