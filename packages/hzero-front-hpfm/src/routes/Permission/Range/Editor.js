/**
 * @version 0.9.x
 */
import React, { Fragment, PureComponent } from 'react';
import { Button, Form, Icon, Input, notification, Popconfirm, Switch, Table } from 'hzero-ui';
import { isEmpty, isNumber } from 'lodash';

import { Button as ButtonPermission } from 'components/Permission';
import Lov from 'components/Lov';

import { Content } from 'components/Page';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';
import { CODE_LOWER } from 'utils/regExp';
import { operatorRender, enableRender } from 'utils/renderer';

import Drawer from '../Drawer';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@Form.create({ fieldNameProp: null })
export default class DrawerForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentRecord: {},
    };
    this.update = this.update.bind(this);
    this.create = this.create.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  state = {};

  componentDidMount() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  update() {
    const {
      form: { validateFields },
      dataSource,
      handleUpdate = e => e,
    } = this.props;
    const { cancel } = this;
    validateFields((err, values) => {
      if (isEmpty(err)) {
        handleUpdate(
          {
            ...dataSource,
            ...values,
            enabledFlag: values.enabledFlag ? 1 : 0,
            customRuleFlag: values.customRuleFlag ? 1 : 0,
          },
          () => {
            notification.success({
              message: intl.get('hzero.common.notification.success.save').d('保存成功'),
            });
            cancel();
          }
        );
      }
    });
  }

  create() {
    const {
      form: { validateFields },
      dataSource,
      handleCreate = e => e,
      handleSetEditorDataSource = e => e,
    } = this.props;
    // const { cancel } = this;
    validateFields((err, values) => {
      if (isEmpty(err)) {
        handleCreate(
          {
            ...dataSource,
            ...values,
            enabledFlag: values.enabledFlag ? 1 : 0,
            customRuleFlag: values.customRuleFlag ? 1 : 0,
          },
          res => {
            handleSetEditorDataSource(res);
            notification.success({
              message: intl.get('hzero.common.notification.success.create').d('创建成功'),
            });
          }
        );
      }
    });
  }

  cancel() {
    const {
      onCancel = e => e,
      form: { resetFields },
    } = this.props;
    resetFields();
    onCancel();
  }

  validator(rule, value, callback) {
    const {
      form: { getFieldValue = e => e },
    } = this.props;
    if (!isNumber(getFieldValue('tenantId'))) {
      callback(
        intl.get('hzero.common.validation.notNull', {
          name: intl.get('hpfm.permission.model.permission.tenant').d('租户'),
        })
      );
    }
    callback();
  }

  onSelectRuleOk(selectedData = {}) {
    const { handleAddPermissionRel = e => e, dataSource = {} } = this.props;
    const { rangeId } = dataSource;
    handleAddPermissionRel({
      rangeId,
      ruleId: selectedData.ruleId,
    });
  }

  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  onDeletePermissionRel(record) {
    const { handleDeletePermissionRel = e => e } = this.props;
    handleDeletePermissionRel(record);
    this.setState({ currentRecord: record });
  }

  defaultTableRowKey = 'permissionRelId';

  render() {
    const {
      match,
      visible,
      processing = {},
      form: { getFieldDecorator = e => e },
      dataSource = {},
      permissionRelDataSource = [],
    } = this.props;
    const { currentRecord } = this.state;
    const {
      rangeId,
      tableName,
      sqlId,
      serviceName,
      ruleName,
      description,
      enabledFlag = 1,
      customRuleFlag,
      tenantId,
      tenantName,
    } = dataSource;
    // 是否平台级
    const isSiteFlag = !isTenantRoleLevel();
    const drawerProps = {
      title: isNumber(rangeId)
        ? intl.get('hpfm.permission.view.option.updateRangeTitle').d('修改屏蔽范围')
        : intl.get('hpfm.permission.view.option.createRangeTitle').d('添加屏蔽范围'),
      visible,
      anchor: 'right',
      onCancel: this.cancel.bind(this),
      footer: (
        <Fragment>
          <Button onClick={this.cancel.bind(this)} disabled={processing.save}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button
            type="primary"
            loading={processing.save || false}
            onClick={() => (isNumber(rangeId) ? this.update() : this.create())}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        </Fragment>
      ),
      width: 550,
    };

    const tableProps = {
      dataSource: permissionRelDataSource || [],
      pagination: false,
      columns: [
        {
          title: intl.get('hpfm.permission.model.permission.ruleCode').d('规则编码'),
          width: 160,
          dataIndex: 'ruleCode',
          onCell: this.onCell.bind(this),
        },
        {
          title: intl.get('hpfm.permission.model.permission.ruleName').d('规则名称'),
          dataIndex: 'ruleName',
        },
        {
          title: intl.get('hzero.common.status').d('状态'),
          dataIndex: 'enabledFlag',
          align: 'center',
          width: 80,
          render: enableRender,
        },
        {
          title: intl.get('hzero.common.button.action').d('操作'),
          align: 'center',
          width: 80,
          render: (text, record) => {
            const operators = [
              {
                key: 'delete',
                ele: (
                  <Popconfirm
                    title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
                    onConfirm={() => this.onDeletePermissionRel(record)}
                  >
                    <ButtonPermission
                      type="text"
                      permissionList={[
                        {
                          code: `${match.path}.button.rangeRuleDelete`,
                          type: 'button',
                          meaning: '数据权限范围规则-删除',
                        },
                      ]}
                    >
                      {
                        <Icon
                          type={
                            currentRecord.permissionRelId === record.permissionRelId &&
                            processing.deletePermissionRel
                              ? 'loading'
                              : 'delete'
                          }
                        />
                      }
                    </ButtonPermission>
                  </Popconfirm>
                ),
                len: 2,
                title: intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？'),
              },
            ];
            return operatorRender(operators);
          },
        },
      ],
      rowKey: this.defaultTableRowKey,
      loading: processing.queryPermissionRel,
      bordered: true,
    };

    return (
      <Drawer {...drawerProps}>
        <div>
          <Content>
            <Form>
              <FormItem
                label={intl.get('hpfm.permission.model.permission.tableName').d('屏蔽表名')}
                {...formLayout}
              >
                {getFieldDecorator('tableName', {
                  initialValue: tableName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hpfm.permission.model.permission.tableName').d('屏蔽表名'),
                      }),
                    },
                    {
                      pattern: CODE_LOWER,
                      message: intl
                        .get('hzero.common.validation.codeLower')
                        .d('全小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
                    },
                    {
                      max: 60,
                      message: intl.get('hzero.common.validation.max', {
                        max: 60,
                      }),
                    },
                  ],
                })(<Input trim typeCase="lower" inputChinese={false} />)}
              </FormItem>
              <FormItem
                label={intl.get('hpfm.permission.model.permission.sqlId').d('SQLID')}
                {...formLayout}
              >
                {getFieldDecorator('sqlId', {
                  initialValue: sqlId,
                  rules: [
                    {
                      max: 120,
                      message: intl.get('hzero.common.validation.max', {
                        max: 120,
                      }),
                    },
                  ],
                })(<Input />)}
              </FormItem>
              {!isTenantRoleLevel() && (
                <FormItem
                  label={intl.get('hpfm.permission.model.permission.tenant').d('租户')}
                  {...formLayout}
                >
                  {getFieldDecorator('tenantId', {
                    initialValue: tenantId,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.permission.model.permission.tenant').d('租户'),
                        }),
                      },
                    ],
                  })(
                    <Lov textValue={tenantName} disabled={isNumber(rangeId)} code="HPFM.TENANT" />
                  )}
                </FormItem>
              )}
              <FormItem
                label={intl.get('hpfm.permission.model.permission.serviceName').d('服务名')}
                {...formLayout}
              >
                {getFieldDecorator('serviceName', {
                  initialValue: serviceName,
                  rules: [
                    {
                      max: 60,
                      message: intl.get('hzero.common.validation.max', {
                        max: 60,
                      }),
                    },
                  ],
                })(
                  <Lov
                    textValue={serviceName}
                    code={isSiteFlag ? 'HADM.ROUTE.SERVICE_CODE' : 'HADM.ROUTE.SERVICE_CODE.ORG'}
                  />
                )}
              </FormItem>
              <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
                {getFieldDecorator('enabledFlag', {
                  initialValue: enabledFlag === 1,
                  valuePropName: 'checked',
                })(<Switch />)}
              </FormItem>
              <FormItem
                label={intl
                  .get('hpfm.permission.model.permission.customRuleFlag')
                  .d('自定义规则标识')}
                {...formLayout}
              >
                {getFieldDecorator('customRuleFlag', {
                  initialValue: customRuleFlag === 1,
                  valuePropName: 'checked',
                })(<Switch />)}
              </FormItem>
              <FormItem
                label={intl.get('hpfm.permission.model.permission.description').d('描述')}
                {...formLayout}
              >
                {getFieldDecorator('description', {
                  initialValue: description,
                  rules: [
                    {
                      max: 240,
                      message: intl.get('hzero.common.validation.max', {
                        max: 240,
                      }),
                    },
                  ],
                })(<Input />)}
              </FormItem>
            </Form>
            {isNumber(rangeId) && (
              <Fragment>
                <div
                  className="action"
                  style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Lov
                    textValue={ruleName}
                    isButton
                    permissionList={[
                      {
                        code: `${match.path}.button.rangeRuleAdd`,
                        type: 'button',
                        meaning: '数据权限范围规则-添加屏蔽规则',
                      },
                    ]}
                    type="primary"
                    disabled={tenantId === undefined}
                    onOk={this.onSelectRuleOk.bind(this)}
                    style={{ marginRight: 8, textAlign: 'right' }}
                    queryParams={isSiteFlag ? { tenantId, enabledFlag: 1 } : { enabledFlag: 1 }}
                    code={isSiteFlag ? 'HPFM.PERMISSION_RANGE.RULE' : 'HPFM.PERMISSION_RULE.ORG'}
                  >
                    {intl.get('hpfm.permission.view.option.add').d('添加屏蔽规则')}
                  </Lov>
                </div>
                <Table {...tableProps} />
              </Fragment>
            )}
          </Content>
        </div>
      </Drawer>
    );
  }
}
