/*
 * Form - 接口表单
 * @date: 2018-10-25
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  // Icon,
} from 'hzero-ui';
import { toSafeInteger } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { FORM_COL_2_LAYOUT, MODAL_FORM_ITEM_LAYOUT } from 'utils/constants';
import MappingClassModal from '@/components/MappingClassModal';

const FormItem = Form.Item;
const { Option } = Select;

@Form.create({ fieldNameProp: null })
export default class EditorForm extends PureComponent {
  state = {
    currentCode: '',
    isShowModal: false,
  };

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
   * 获取映射类内容
   */
  @Bind()
  getCurrentCode() {
    const { dataSource = {} } = this.props;
    const { mappingClass } = dataSource;
    const { currentCode } = this.state;
    return currentCode || mappingClass;
  }

  /**
   * 显示映射类弹窗
   */
  @Bind()
  handleOpenMappingClassModal() {
    const { dataSource = {}, onFetchMappingClass = () => {} } = this.props;
    const { mappingClass } = dataSource;
    const { currentCode } = this.state;
    let code = '';
    if (currentCode) {
      code = currentCode;
    } else if (mappingClass) {
      code = mappingClass;
    } else {
      onFetchMappingClass().then(res => {
        if (res) {
          this.setState({
            currentCode: res.template,
            isShowModal: true,
          });
        }
      });
    }
    this.setState({
      currentCode: code,
      isShowModal: true,
    });
  }

  /**
   * 关闭映射类弹窗
   */
  @Bind()
  handleCloseMappingClassModal(value) {
    this.setState({
      isShowModal: false,
      currentCode: value,
    });
  }

  /**
   * 测试映射类
   * @param {string} value - 映射类代码
   */
  @Bind()
  handleTestMappingClass(value, cb = e => e) {
    const {
      onTestMappingClass = () => {},
      dataSource = {},
      fetchMappingClassLoading,
      testMappingClassLoading,
      editable,
    } = this.props;
    const { interfaceId } = dataSource;
    this.setState({
      currentCode: value,
    });
    if (fetchMappingClassLoading || testMappingClassLoading) return;
    const tempInterfaceId = editable ? interfaceId : null;
    onTestMappingClass(tempInterfaceId, value).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  render() {
    const {
      form: { getFieldDecorator = e => e },
      dataSource = {},
      serviceTypes, // 发布类型
      requestTypes, // 请求方式值集
      soapVersionTypes, // 接口soap版本号
      interfaceStatus, // 接口状态
      contentTypes, // 接口类型
      currentInterfaceType, // 服务的类型
      editable,
      // editorHeaderForm,
      type,
      fetchMappingClassLoading,
      testMappingClassLoading,
    } = this.props;
    // const { dirModelVisible, currentParentDir, dirModelDataSource } = this.state;
    const {
      interfaceCode = '',
      publishType,
      interfaceName,
      interfaceUrl,
      requestMethod,
      requestHeader = 'application/json',
      status,
      soapVersion,
      publishUrl,
      interfaceId,
      soapAction,
    } = dataSource;
    const { isShowModal, currentCode } = this.state;
    return (
      <Fragment>
        <Form style={{ paddingBottom: '40px' }}>
          <Row>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem
                label={intl.get(`hitf.services.model.services.interfaceCode`).d('接口编码')}
                {...MODAL_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('interfaceCode', {
                  initialValue: interfaceCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl.get(`hitf.services.model.services.interfaceCode`).d('接口编码'),
                      }),
                    },
                    {
                      max: 128,
                      message: intl.get('hzero.common.validation.max', {
                        max: 128,
                      }),
                    },
                  ],
                  validateFirst: true,
                })(<Input trim inputChinese={false} disabled={interfaceId && editable} />)}
              </FormItem>
            </Col>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem
                label={intl.get(`hitf.services.model.services.interfaceName`).d('接口名称')}
                {...MODAL_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('interfaceName', {
                  initialValue: interfaceName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`hitf.services.model.services.interfaceName`).d('接口名称'),
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
          </Row>
          <Row>
            {currentInterfaceType !== 'COMPOSITE' && (
              <Col {...FORM_COL_2_LAYOUT}>
                <FormItem
                  label={intl.get(`hitf.services.model.services.interfaceAddress`).d('接口地址')}
                  {...MODAL_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('interfaceUrl', {
                    initialValue: interfaceUrl,
                    rules: [
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
            {type === 'SOAP' && (
              <Col {...FORM_COL_2_LAYOUT}>
                <FormItem
                  label={intl.get(`hitf.services.model.services.soapVersion`).d('SOAP版本')}
                  {...MODAL_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('soapVersion', {
                    initialValue: soapVersion,
                  })(
                    <Select>
                      {soapVersionTypes.map(item => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            )}
          </Row>
          {/* 服务类型为REST：显示请求方式、接口ContentType、隐藏soap版本||发布类型为SOAP时相反 */}
          {type === 'REST' && (
            <Row>
              <Col {...FORM_COL_2_LAYOUT}>
                <FormItem
                  label={intl.get(`hitf.services.model.services.requestMethod`).d('请求方式')}
                  {...MODAL_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('requestMethod', {
                    initialValue: requestMethod,
                  })(
                    <Select>
                      {requestTypes.map(n => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_2_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`hitf.services.model.services.requestHeader`)
                    .d('接口ContentType')}
                  {...MODAL_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('requestHeader', {
                    initialValue: requestHeader,
                  })(
                    <Select>
                      {contentTypes.map(n => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          )}
          <Row>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem
                label={intl.get(`hitf.services.model.services.releaseType`).d('发布类型')}
                {...MODAL_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('publishType', {
                  initialValue: editable ? publishType : 'REST',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`hitf.services.model.services.releaseType`).d('发布类型'),
                      }),
                    },
                  ],
                })(
                  <Select>
                    {serviceTypes.map(n => (
                      <Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            {type === 'SOAP' && (
              <Col {...FORM_COL_2_LAYOUT}>
                <FormItem label="soapAction" {...MODAL_FORM_ITEM_LAYOUT}>
                  {getFieldDecorator('soapAction', {
                    initialValue: soapAction,
                  })(<Input />)}
                </FormItem>
              </Col>
            )}
          </Row>
          <Row>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem
                label={intl.get(`hitf.services.model.services.mappingClass`).d('映射类')}
                {...MODAL_FORM_ITEM_LAYOUT}
              >
                <a onClick={this.handleOpenMappingClassModal}>
                  {intl
                    .get('hitf.services.view.message.title.detail.mapping.class')
                    .d('查看映射类详情')}
                </a>
              </FormItem>
            </Col>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem
                label={intl.get(`hzero.common.status`).d('状态')}
                {...MODAL_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('status', {
                  initialValue: editable ? status : 'ENABLED',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`hzero.common.status`).d('状态'),
                      }),
                    },
                  ],
                })(
                  <Select>
                    {interfaceStatus.map(n => (
                      <Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem
                label={intl.get(`hitf.services.model.services.publishUrl`).d('发布地址')}
                {...MODAL_FORM_ITEM_LAYOUT}
                labelCol={{ span: 3 }}
              >
                {getFieldDecorator('publishUrl', {
                  initialValue: publishUrl,
                })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
        <MappingClassModal
          data={currentCode}
          loading={fetchMappingClassLoading}
          testLoading={testMappingClassLoading}
          visible={isShowModal}
          onCancel={this.handleCloseMappingClassModal}
          onTest={this.handleTestMappingClass}
        />
      </Fragment>
    );
  }
}
