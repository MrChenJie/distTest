/*
 * Form - 服务注册编辑弹窗
 * @date: 2018-10-25
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Card, Col, Form, InputNumber, Row, Select } from 'hzero-ui';
import Switch from 'components/Switch';
import Lov from 'components/Lov';

import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME, FORM_COL_2_LAYOUT } from 'utils/constants';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const FormItem = Form.Item;
const { Option } = Select;

const formItemLayout = {
  labelCol: {
    span: 9,
  },
  wrapperCol: {
    span: 14,
  },
};

@Form.create({ fieldNameProp: null })
export default class EditorForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    const {
      form: { getFieldDecorator = () => {} },
      dataSource = {},
      code = {},
      interfaceId,
      activeinvokeStatisticsFlag,
      onInvokeStatisticsFlagChange = () => {},
      activeHealthCheckFlag,
      onHealthCheckFlagChange = () => {},
      tenantId,
    } = this.props;

    const {
      invokeDetailsFlag = 0,
      statisticsPeriod,
      invokeStatisticsFlag = 0,
      statisticsLevel,
      statisticsGrace,
      statisticsThreshold,
      statisticsExceedAction,
      statisticsWarningBefore,
      healthCheckFlag = 0,
      checkUsecaseId,
      checkRoundRobin,
      checkPeriod,
      checkWarningSmsFlag = 0,
      checkThreshold,
      checkWarningEmailFlag = 0,
      checkWarningUserId,
      checkWarningMsgTplCode,
      checkWarningUserName,
      checkUsecaseName,
    } = dataSource;
    const activeSwitchLayout =
      activeinvokeStatisticsFlag !== 1 && activeHealthCheckFlag !== 1
        ? {
            labelCol: {
              span: 14,
            },
            wrapperCol: {
              span: 10,
            },
          }
        : {};
    return (
      <Form>
        <Row>
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl.get(`hitf.services.model.services.invokeDetailsFlag`).d('记录调用详情')}
              {...formItemLayout}
              {...activeSwitchLayout}
            >
              {getFieldDecorator('invokeDetailsFlag', {
                initialValue: invokeDetailsFlag,
                valuePropName: 'checked',
              })(<Switch />)}
            </FormItem>
          </Col>
        </Row>
        <Card
          key="value-list-header"
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={<h3>{intl.get('hitf.services.view.title.statisticalAnalysis').d('统计分析')}</h3>}
        >
          <Row>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem
                label={intl
                  .get(`hitf.services.model.services.invokeStatisticsFlag`)
                  .d('是否记录调用次数')}
                {...formItemLayout}
                {...activeSwitchLayout}
              >
                {getFieldDecorator('invokeStatisticsFlag', {
                  initialValue: invokeStatisticsFlag,
                  valuePropName: 'checked',
                })(<Switch onChange={onInvokeStatisticsFlagChange} />)}
              </FormItem>
            </Col>
          </Row>
          {activeinvokeStatisticsFlag === 1 && (
            <Row>
              <Col {...FORM_COL_2_LAYOUT}>
                <FormItem
                  label={intl.get(`hitf.services.model.services.statisticsLevel`).d('统计维度')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('statisticsLevel', {
                    initialValue: statisticsLevel,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`hitf.services.model.services.statisticsLevel`)
                            .d('统计维度'),
                        }),
                      },
                    ],
                  })(
                    <Select allowClear>
                      {(code['HITF.STATISTICS_LEVEL'] || []).map(n => (
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
                  label={intl.get(`hitf.services.model.services.statisticsPeriod`).d('统计周期')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('statisticsPeriod', {
                    initialValue: statisticsPeriod,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`hitf.services.model.services.statisticsPeriod`)
                            .d('统计周期'),
                        }),
                      },
                    ],
                  })(
                    <Select allowClear>
                      {(code['HITF.STATISTICS_PERIOD'] || []).map(n => (
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
                  label={intl.get(`hitf.services.model.services.statisticsThreshold`).d('统计阈值')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('statisticsThreshold', {
                    initialValue: statisticsThreshold,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`hitf.services.model.services.statisticsThreshold`)
                            .d('统计阈值'),
                        }),
                      },
                    ],
                  })(<InputNumber min={0} step={1} />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_2_LAYOUT}>
                <FormItem
                  label={intl.get(`hitf.services.model.services.statisticsGrace`).d('宽免次数')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('statisticsGrace', {
                    initialValue: statisticsGrace,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`hitf.services.model.services.statisticsGrace`)
                            .d('宽免次数'),
                        }),
                      },
                    ],
                  })(<InputNumber min={0} step={1} />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_2_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`hitf.services.model.services.statisticsExceedAction`)
                    .d('超阈值措施')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('statisticsExceedAction', {
                    initialValue: statisticsExceedAction,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`hitf.services.model.services.statisticsExceedAction`)
                            .d('超阈值措施'),
                        }),
                      },
                    ],
                  })(
                    <Select allowClear>
                      {(code['HITF.EXCEED_THRESHOLD_ACTION'] || []).map(n => (
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
                    .get(`hitf.services.model.services.statisticsWarningBefore`)
                    .d('提前预警（次数）')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('statisticsWarningBefore', {
                    initialValue: statisticsWarningBefore,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`hitf.services.model.services.statisticsWarningBefore`)
                            .d('提前预警（次数）'),
                        }),
                      },
                    ],
                  })(<InputNumber min={0} step={1} />)}
                </FormItem>
              </Col>
            </Row>
          )}
        </Card>
        <Card
          key="healthExamination"
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={<h3>{intl.get('hitf.services.view.title.healthExamination').d('健康检查')}</h3>}
        >
          <Row>
            <Col {...FORM_COL_2_LAYOUT}>
              <FormItem
                label={intl
                  .get(`hitf.services.model.services.healthCheckFlag`)
                  .d('是否开启健康检查')}
                {...formItemLayout}
                {...activeSwitchLayout}
              >
                {getFieldDecorator('healthCheckFlag', {
                  initialValue: healthCheckFlag,
                  valuePropName: 'checked',
                })(<Switch onChange={onHealthCheckFlagChange} />)}
              </FormItem>
            </Col>
          </Row>
          {activeHealthCheckFlag === 1 && (
            <Row>
              <Col {...FORM_COL_2_LAYOUT}>
                <FormItem
                  label={intl.get(`hitf.services.model.services.checkUsecaseId`).d('所用测试用例')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('checkUsecaseId', {
                    initialValue: checkUsecaseId,
                  })(
                    <Lov
                      code={!isTenantRoleLevel() ? 'HITF.SITE.USE_CASE' : 'HITF.USE_CASE'}
                      textValue={checkUsecaseName}
                      queryParams={{ organizationId: tenantId, interfaceId }}
                      // onChange={value => this.handleLovChange(value, 'companyId')}
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_2_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`hitf.services.model.services.checkRoundRobin`)
                    .d('轮询周期（秒）')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('checkRoundRobin', {
                    initialValue: checkRoundRobin,
                    rules: [
                      {
                        required: true,
                        message: intl.get(`hzero.common.validation.notNull`, {
                          name: intl
                            .get(`hitf.services.model.services.checkRoundRobin`)
                            .d('轮询周期（秒）'),
                        }),
                      },
                    ],
                  })(<InputNumber min={0} />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_2_LAYOUT}>
                <FormItem
                  label={intl.get(`hitf.services.model.services.checkPeriod`).d('统计周期（秒）')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('checkPeriod', {
                    initialValue: checkPeriod,
                    rules: [
                      {
                        required: true,
                        message: intl.get(`hzero.common.validation.notNull`, {
                          name: intl
                            .get(`hitf.services.model.services.checkPeriod`)
                            .d('统计周期（秒）'),
                        }),
                      },
                    ],
                  })(<InputNumber min={0} />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_2_LAYOUT}>
                <FormItem
                  label={intl.get(`hitf.services.model.services.checkThreshold`).d('异常阈值')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('checkThreshold', {
                    initialValue: checkThreshold,
                    rules: [
                      {
                        required: true,
                        message: intl.get(`hzero.common.validation.notNull`, {
                          name: intl
                            .get(`hitf.services.model.services.checkThreshold`)
                            .d('异常阈值'),
                        }),
                      },
                    ],
                  })(<InputNumber min={0} />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_2_LAYOUT}>
                <FormItem
                  label={intl.get(`hitf.services.model.services.checkWarningSmsFlag`).d('短信预警')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('checkWarningSmsFlag', {
                    initialValue: checkWarningSmsFlag,
                    valuePropName: 'checked',
                  })(<Switch />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_2_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`hitf.services.model.services.checkWarningEmailFlag`)
                    .d('邮件预警')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('checkWarningEmailFlag', {
                    initialValue: checkWarningEmailFlag,
                    valuePropName: 'checked',
                  })(<Switch />)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_2_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`hitf.services.model.services.checkWarningUserId`)
                    .d('预警目标用户')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('checkWarningUserId', {
                    initialValue: checkWarningUserId,
                    rules: [
                      {
                        required: true,
                        message: intl.get(`hzero.common.validation.notNull`, {
                          name: intl.get(`hitf.services.model.services.modelCode`).d('模型编码'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="HIAM.TENANT.USER"
                      queryParams={{ organizationId }}
                      textValue={checkWarningUserName}
                    />
                  )}
                </FormItem>
              </Col>
              <Col {...FORM_COL_2_LAYOUT}>
                <FormItem
                  label={intl
                    .get(`hitf.services.model.services.checkWarningMsgTplCode`)
                    .d('预警消息模板代码')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('checkWarningMsgTplCode', {
                    initialValue: checkWarningMsgTplCode,
                    rules: [
                      {
                        required: true,
                        message: intl.get(`hzero.common.validation.notNull`, {
                          name: intl
                            .get(`hitf.services.model.services.checkWarningMsgTplCode`)
                            .d('预警消息模板代码'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="HITF.MESSAGE_TEMPLATE"
                      queryParams={{ tenantId: organizationId }}
                      textValue={checkWarningMsgTplCode}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          )}
        </Card>
      </Form>
    );
  }
}
