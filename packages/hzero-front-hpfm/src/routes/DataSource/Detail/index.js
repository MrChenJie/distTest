import React from 'react';
import { Card, Form, Input, Select, Spin, Row, Col } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty, map } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import Switch from 'components/Switch';
import Lov from 'components/Lov';
import { Button as ButtonPermission } from 'components/Permission';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import {
  isTenantRoleLevel,
  getCurrentOrganizationId,
  getResponse,
  filterNullValueObject,
  encryptPwd,
} from 'utils/utils';
import { CODE_UPPER } from 'utils/regExp';
import notification from 'utils/notification';
import {
  EDIT_FORM_ITEM_LAYOUT,
  DETAIL_CARD_CLASSNAME,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_3_LAYOUT,
} from 'utils/constants';

@Form.create({ fieldNameProp: null })
@connect(({ dataSource, loading }) => ({
  dataSource,
  fetchDetailLoading: loading.effects['dataSource/fetchDataSourceDetail'],
  saving:
    loading.effects['dataSource/editDataSource'] || loading.effects['dataSource/createDataSource'],
  testing: loading.effects['dataSource/testConnection'],
  isSiteFlag: !isTenantRoleLevel(),
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['hpfm.ruleEngine', 'entity.tenant', 'hpfm.dataSource'],
})
export default class Detail extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const lovCodes = {
      dataSourceType: 'HPFM.DATABASE_TYPE', // 数据源类型值集
      dbPoolType: 'HPFM.DB_POOL_TYPE', // 连接池类型值集
      dsPurposeCode: 'HPFM.DATASOURCE_PURPOSE', // 数据源用途值集
    };
    // 初始化 值集
    dispatch({
      type: `dataSource/batchCode`,
      payload: {
        lovCodes,
      },
    });
    this.fetchDetail();
    this.fetchPublicKey();
  }

  @Bind()
  fetchDetail() {
    const { dispatch, match } = this.props;
    const {
      params: { datasourceId },
    } = match;
    if (datasourceId !== 'create') {
      dispatch({
        type: 'dataSource/fetchDataSourceDetail',
        payload: { datasourceId },
      }).then(res => {
        if (res) {
          dispatch({
            type: 'dataSource/fetchFormParams',
            payload: {
              formCode: res.dbType,
            },
          });
        }
      });
    } else {
      dispatch({
        type: 'dataSource/updateState',
        payload: { dataSourceDetail: {}, dbPoolParams: {} },
      });
    }
  }

  /**
   * 请求公钥
   */
  @Bind()
  fetchPublicKey() {
    const { dispatch = () => {} } = this.props;
    dispatch({
      type: 'dataSource/getPublicKey',
    });
  }

  @Bind()
  handleOk() {
    const { form, onOk } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onOk(values);
      }
    });
  }

  /**
   * 获取连接池参数
   */
  @Bind()
  changeDbPoolType(value) {
    const { dispatch, dataSourceDetail = {} } = this.props;
    if (dataSourceDetail.dbPoolParams !== value) {
      dispatch({
        type: 'dataSource/getDbPoolParams',
        payload: { dbPoolType: value },
      });
    }
  }

  /**
   * 改变数据源类型,获取驱动类和连接字符串
   */
  @Bind()
  changeDbType(value) {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'dataSource/fetchFormParams',
      payload: {
        formCode: value,
      },
    });
    dispatch({
      type: 'dataSource/getDriverClass',
      payload: { dbType: value },
    }).then(res => {
      if (res) {
        const formValues = {
          driverClass: res.driverClass,
          datasourceUrl: res.datasourceUrl,
        };
        form.setFieldsValue(formValues);
      }
    });
  }

  /**
   * 更新数据源
   */
  @Bind()
  handleUpdateDataSource() {
    const {
      dispatch,
      form,
      history,
      match: { params: { datasourceId } } = {},
      dataSource: { dataSourceDetail, dbPoolParams = {}, extConfigs = [], publicKey },
    } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        // 解析连接池参数
        const newOptions = {};
        Object.keys(dbPoolParams).forEach(item => {
          newOptions[item] = values[item];
        });
        // 表单配置
        const newExtConfig = {};
        extConfigs.forEach(item => {
          newExtConfig[item.itemCode] = values[item.itemCode];
        });
        const newValues = { ...values };
        if (values.passwordEncrypted) {
          newValues.passwordEncrypted = encryptPwd(values.passwordEncrypted, publicKey);
        }
        let temp = { ...newValues };
        if (values.password === dataSourceDetail.password) {
          const { password, ...other } = newValues;
          temp = other;
        }
        if (temp.driverId && dataSourceDetail.driverClass) {
          delete dataSourceDetail.driverClass;
        }
        dispatch({
          type: `dataSource/${datasourceId !== 'create' ? 'editDataSource' : 'createDataSource'}`,
          payload: {
            ...dataSourceDetail,
            ...temp,
            options: JSON.stringify(newOptions),
            extConfig: JSON.stringify(newExtConfig),
          },
        }).then(res => {
          if (res) {
            notification.success();
            if (datasourceId === 'create') {
              history.push(`/hpfm/data-source/detail/${res.datasourceId}`);
            }
            this.fetchDetail();
          }
        });
      }
    });
  }

  // 测试
  @Bind()
  handleTestConnection(params) {
    const {
      form,
      dispatch,
      dataSource: { dataSourceDetail, dbPoolParams = {}, extConfigs = [] },
    } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        // 解析连接池参数
        const newOptions = {};
        Object.keys(dbPoolParams).forEach(item => {
          newOptions[item] = values[item];
        });
        // 表单配置
        const newExtConfig = {};
        extConfigs.forEach(item => {
          newExtConfig[item.itemCode] = values[item.itemCode];
        });
        let temp = { ...values };
        if (values.password === dataSourceDetail.password) {
          const { password, ...other } = values;
          temp = other;
        }
        dispatch({
          type: 'dataSource/testConnection',
          payload: { ...params, ...filterNullValueObject(temp) },
        }).then(res => {
          if (JSON.stringify(res) === '{}') {
            notification.success({
              message: intl.get('hpfm.dataSource.view.message.test.success').d('测试成功'),
            });
          } else {
            getResponse(res);
          }
        });
      }
    });
  }

  render() {
    const {
      isSiteFlag,
      saving = false,
      testing = false,
      fetchDetailLoading = false,
      form,
      match: {
        params: { datasourceId: createFlag },
      },
      match,
      dataSource: {
        dataSourceDetail = {},
        dataSourceTypeList = [],
        dbPoolTypeList = [],
        dbPoolParams = {},
        dsPurposeCodeList = [],
        extConfigs = [],
      },
    } = this.props;
    const { getFieldDecorator } = this.props.form;
    const {
      datasourceId,
      dsPurposeCode,
      datasourceCode,
      username,
      passwordEncrypted,
      dbType,
      dbPoolType,
      description,
      remark,
      tenantId,
      tenantName,
      driverId,
      driverName,
      driverClass,
      datasourceUrl,
      enabledFlag = 1,
      extConfig = '{}',
    } = dataSourceDetail;
    // 获取连接池参数
    const newDbPoolParams = map(dbPoolParams, (value, key) => ({ key, value }));
    const newExtConfig = JSON.parse(extConfig);
    return (
      <>
        <Header
          title={
            createFlag !== 'create'
              ? intl.get('hpfm.dataSource.model.dataSource.detail').d('数据源详情')
              : intl.get('hpfm.dataSource.model.dataSource.create').d('数据源新建')
          }
          backPath="/hpfm/data-source/list"
        >
          <ButtonPermission
            type="primary"
            loading={saving}
            permissionList={[
              {
                code: `${match.path}.button.save`,
                type: 'button',
                meaning: '数据源-保存',
              },
            ]}
            disabled={testing}
            onClick={this.handleUpdateDataSource}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </ButtonPermission>
          <ButtonPermission
            loading={testing}
            onClick={() => this.handleTestConnection(dataSourceDetail)}
            permissionList={[
              {
                code: `${match.path}.button.test`,
                type: 'button',
                meaning: '数据源-测试连接',
              },
            ]}
          >
            {intl.get('hpfm.dataSource.model.dataSource.testConnection').d('测试连接')}
          </ButtonPermission>
        </Header>
        <Content>
          <Spin spinning={fetchDetailLoading}>
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              loading={false}
              title={
                <h3>
                  {intl
                    .get('hpfm.reportDataSource.model.reportDataSource.baseParams')
                    .d('基本参数')}
                </h3>
              }
            >
              <Form>
                <Row {...EDIT_FORM_ROW_LAYOUT} type="flex" justify="start">
                  {isSiteFlag && (
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        label={intl.get('entity.tenant.tag').d('租户')}
                        {...EDIT_FORM_ITEM_LAYOUT}
                      >
                        {getFieldDecorator('tenantId', {
                          rules: [
                            {
                              required: true,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl.get('entity.tenant.tag').d('租户'),
                              }),
                            },
                          ],
                          initialValue: tenantId,
                        })(
                          <Lov
                            code="HPFM.TENANT"
                            textValue={tenantName}
                            disabled={datasourceId !== undefined}
                          />
                        )}
                      </Form.Item>
                    </Col>
                  )}
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl
                        .get('hpfm.dataSource.model.dataSource.datasourceCode')
                        .d('数据源编码')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('datasourceCode', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('hpfm.dataSource.model.dataSource.datasourceCode')
                                .d('数据源编码'),
                            }),
                          },
                          {
                            pattern: CODE_UPPER,
                            message: intl
                              .get('hzero.common.validation.codeUpper')
                              .d('全大写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
                          },
                          {
                            max: 30,
                            message: intl.get('hzero.common.validation.max', {
                              max: 30,
                            }),
                          },
                        ],
                        initialValue: datasourceCode,
                      })(
                        <Input
                          trim
                          typeCase="upper"
                          inputChinese={false}
                          disabled={datasourceId !== undefined}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl
                        .get('hpfm.ruleEngine.model.ruleEngine.description')
                        .d('数据源名称')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('description', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('hpfm.ruleEngine.model.ruleEngine.description')
                                .d('数据源名称'),
                            }),
                          },
                          {
                            max: 600,
                            message: intl.get('hzero.common.validation.max', {
                              max: 600,
                            }),
                          },
                        ],
                        initialValue: description,
                      })(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl
                        .get('hpfm.reportDataSource.model.reportDataSource.dsPurposeCode')
                        .d('数据源用途')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('dsPurposeCode', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('hpfm.reportDataSource.model.reportDataSource.dsPurposeCode')
                                .d('数据源用途'),
                            }),
                          },
                        ],
                        initialValue: dsPurposeCode,
                      })(
                        <Select allowClear={false} disabled={datasourceId !== undefined}>
                          {dsPurposeCodeList.map(item => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl.get('hpfm.ruleEngine.model.dataSource.dbType').d('数据库类型')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('dbType', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('hpfm.ruleEngine.model.dataSource.dbType')
                                .d('数据库类型'),
                            }),
                          },
                        ],
                        initialValue: dbType,
                      })(
                        <Select
                          allowClear={false}
                          onChange={this.changeDbType}
                          disabled={datasourceId !== undefined}
                        >
                          {dataSourceTypeList.map(item => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl.get('hpfm.dataSource.model.dataSource.driverId').d('数据源驱动')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('driverId', {
                        initialValue: driverId,
                      })(
                        <Lov
                          code="HPFM.DATASOURCE_DRIVER"
                          textValue={driverName}
                          queryParams={
                            isSiteFlag
                              ? {
                                  tenantId: form.getFieldValue('tenantId'),
                                  databaseType: form.getFieldValue('dbType'),
                                }
                              : {
                                  tenantId: getCurrentOrganizationId(),
                                  databaseType: form.getFieldValue('dbType'),
                                }
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl.get('hpfm.dataSource.model.dataSource.driverClass').d('数据类')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('driverClass', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('hpfm.dataSource.model.dataSource.driverClass')
                                .d('数据类'),
                            }),
                          },
                          {
                            max: 240,
                            message: intl.get('hzero.common.validation.max', {
                              max: 240,
                            }),
                          },
                        ],
                        initialValue: driverClass,
                      })(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl
                        .get('hpfm.dataSource.model.dataSource.datasourceUrl')
                        .d('URL地址')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('datasourceUrl', {
                        initialValue: datasourceUrl,
                        rules: [
                          {
                            max: 600,
                            message: intl.get('hzero.common.validation.max', {
                              max: 600,
                            }),
                          },
                        ],
                      })(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl
                        .get('hpfm.reportDataSource.model.reportDataSource.dbPoolType')
                        .d('连接池类型')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('dbPoolType', {
                        initialValue: dbPoolType,
                      })(
                        <Select allowClear={false} onChange={this.changeDbPoolType}>
                          {dbPoolTypeList.map(item => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl.get('hpfm.dataSource.model.dataSource.user').d('用户')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('username', {
                        initialValue: username,
                        rules: [
                          {
                            max: 100,
                            message: intl.get('hzero.common.validation.max', {
                              max: 100,
                            }),
                          },
                        ],
                      })(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl.get('hpfm.dataSource.model.dataSource.password').d('密码')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('passwordEncrypted', {
                        initialValue: passwordEncrypted,
                        rules: [
                          {
                            max: 110,
                            message: intl.get('hzero.common.validation.max', {
                              max: 110,
                            }),
                          },
                        ],
                      })(
                        <Input
                          autocomplete="new-password"
                          type="password"
                          placeholder={
                            datasourceId !== undefined
                              ? intl.get('hzero.common.validation.notChange').d('未更改')
                              : ''
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl.get('hzero.common.remark').d('备注')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('remark', {
                        initialValue: remark,
                        rules: [
                          {
                            max: 240,
                            message: intl.get('hzero.common.validation.max', {
                              max: 240,
                            }),
                          },
                        ],
                      })(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl.get('hzero.common.status.enable').d('启用')}
                      {...EDIT_FORM_ITEM_LAYOUT}
                    >
                      {getFieldDecorator('enabledFlag', {
                        initialValue: enabledFlag,
                      })(<Switch />)}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>
            {extConfigs.length > 0 && (
              <Card
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                loading={false}
                title={
                  <h3>
                    {intl
                      .get('hpfm.reportDataSource.model.reportDataSource.formParams')
                      .d('表单配置')}
                  </h3>
                }
              >
                <Row {...EDIT_FORM_ROW_LAYOUT}>
                  {extConfigs.map(item => {
                    const rules = [
                      {
                        required: item.requiredFlag === 1,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: item.itemName,
                        }),
                      },
                    ];
                    if (item.valueConstraint) {
                      rules.push({
                        pattern: item.valueConstraint,
                        message: intl.get('hzero.common.validation.format').d('数据格式校验不通过'),
                      });
                    }
                    return (
                      <Col {...FORM_COL_3_LAYOUT}>
                        <Form.Item
                          label={`${item.itemName}(${item.itemCode})`}
                          {...EDIT_FORM_ITEM_LAYOUT}
                          key={`${item.formLineId}`}
                          required={item.requiredFlag === 1}
                        >
                          {getFieldDecorator(`${item.itemCode}`, {
                            initialValue: newExtConfig[item.itemCode] || item.defaultValue,
                            rules,
                          })(
                            <Input
                              type={item.itemTypeCode.toLowerCase()}
                              disabled={item.updatableFlag === 0 && createFlag !== 'create'}
                            />
                          )}
                        </Form.Item>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
            )}
            {!isEmpty(newDbPoolParams) && (
              <Card
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                loading={false}
                title={
                  <h3>
                    {intl
                      .get('hpfm.reportDataSource.model.reportDataSource.dbPoolParams')
                      .d('连接池参数')}
                  </h3>
                }
              >
                <Row {...EDIT_FORM_ROW_LAYOUT}>
                  {newDbPoolParams.map(item => (
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        label={`${item.key}`}
                        {...EDIT_FORM_ITEM_LAYOUT}
                        key={`${item.key}`}
                      >
                        {getFieldDecorator(`${item.key}`, {
                          initialValue: `${item.value}`,
                        })(<Input />)}
                      </Form.Item>
                    </Col>
                  ))}
                </Row>
              </Card>
            )}
          </Spin>
        </Content>
      </>
    );
  }
}
