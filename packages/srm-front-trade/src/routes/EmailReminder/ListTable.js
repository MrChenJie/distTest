/**
 * @Description: 接口监控 -邮件提醒
 * @date 2023-02-17
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Button, Avatar, Form, Input } from 'hzero-ui';
import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { operatorRender, enableRender } from 'utils/renderer';
import { tooltipRender } from '@/utils/utils';
import ValueList from 'components/ValueList';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import addIcon from '@/assets/buttonIcons/新建.png';
import deleteIcon from '@/assets/buttonIcons/删除.png';
import exportIcon from '@/assets/buttonIcons/导出.png';
import queryResBtn from '@/assets/buttonIcons/查询结果.png';
import ExcelExport from '@/components/ExcelExport1';
import { SRM_SPUB } from '@/utils/config';

const commonPrompt = 'spub.emailReminder';

export default class ListTable extends PureComponent {
  render() {
    const {
      form,
      loading = false,
      deleteLoading = false,
      saveLoading = false,
      dataSource,
      pagination,
      rowSelection,
      idpValueMap,
      onChange = (e) => e,
      onAdd = (e) => e,
      onEdit = (e) => e,
      onSave = (e) => e,
      onDelete = (e) => e,
    } = this.props;

    const columns = [
      {
        title: intl.get(`${commonPrompt}.view.model.module`).d('模块'),
        dataIndex: 'moduleMeaning',
        width: 150,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('module', {
                  initialValue: record.module,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.view.model.module`).d('模块'),
                      }),
                    },
                  ],
                })(<ValueList
                  allowClear
                  lazyLoad={false}
                  style={{ width: '100%' }}
                  options={idpValueMap['SPUB.SCM_MODULE']}
                />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.model.serverCode`).d('服务代码'),
        dataIndex: 'serverCode',
        width: 200,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('serverCode', {
                  initialValue: record.serverCode,
                })(<Input disabled />)}
              </Form.Item>
            );
          } else {
            return tooltipRender(val);
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.model.serverName`).d('服务名称'),
        dataIndex: 'serverName',
        width: 180,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('serverName', {
                  initialValue: record.serverName,
                })(<Input disabled />)}
              </Form.Item>
            );
          } else {
            return tooltipRender(val);
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.model.serviceCategory`).d('服务类别'),
        dataIndex: 'serviceCategoryMeaning',
        width: 150,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('serviceCategory', {
                  initialValue: record.serviceCategory,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.view.model.serviceCategory`).d('服务类别'),
                      }),
                    },
                  ],
                })(
                  <ValueList
                    allowClear
                    disabled
                    lazyLoad={false}
                    style={{ width: '100%' }}
                    options={idpValueMap['HITF.SERVICE_CATEGORY']}
                  />
                )}
              </Form.Item>
            );
          } else {
            return tooltipRender(val);
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.model.interfaceCode`).d('接口代码'),
        dataIndex: 'interfaceCode',
        width: 180,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('interfaceCode', {
                  initialValue: record.interfaceCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.view.model.interfaceCode`).d('接口代码'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="SPUB_INTERFACE_MONITOR"
                    queryParams={{
                      tenantId: getCurrentOrganizationId(),
                    }}
                    onChange={(lovValue, lovData) => {
                      record.$form.setFieldsValue({
                        serverCode: lovData.serverCode,
                        serverName: lovData.serverName,
                        interfaceName: lovData.interfaceName,
                        serviceCategory: lovData.serviceCategory,
                      });
                    }}
                    textValue={record.interfaceCode}
                  />
                )}
              </Form.Item>
            );
          } else {
            return tooltipRender(val);
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.model.interfaceName`).d('接口名称'),
        dataIndex: 'interfaceName',
        width: 180,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('interfaceName', {
                  initialValue: record.interfaceName,
                })(<Input disabled />)}
              </Form.Item>
            );
          } else {
            return tooltipRender(val);
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.model.messageFiled`).d('返回消息字段名'),
        dataIndex: 'messageFiled',
        width: 180,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('messageFiled', {
                  initialValue: record.messageFiled,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return tooltipRender(val);
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.model.keyWord1`).d('关键字1'),
        dataIndex: 'keyWord1',
        width: 120,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('keyWord1', {
                  initialValue: record.keyWord1,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return tooltipRender(val);
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.model.keyWord2`).d('关键字2'),
        dataIndex: 'keyWord2',
        width: 120,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('keyWord2', {
                  initialValue: record.keyWord2,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return tooltipRender(val);
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.model.keyWord3`).d('关键字3'),
        dataIndex: 'keyWord3',
        width: 120,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('keyWord3', {
                  initialValue: record.keyWord3,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return tooltipRender(val);
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.view.model.enabledFlag`).d('启用标识'),
        dataIndex: 'enabledFlag',
        width: 120,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('enabledFlag', {
                  initialValue: record.enabledFlag?.toString() || '1',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.view.model.enabledFlag`).d('启用标识'),
                      }),
                    },
                  ],
                })(
                  <ValueList
                    allowClear
                    lazyLoad={false}
                    style={{ width: '100%' }}
                    options={idpValueMap['HPFM.ENABLED_FLAG']}
                  />
                )}
              </Form.Item>
            );
          } else {
            return enableRender(val);
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        key: 'action',
        width: 130,
        fixed: 'right',
        render: (_, record) => {
          const operators = [
            {
              key: 'edit',
              ele: (
                <a
                  onClick={() => {
                    onEdit(record, record._status === undefined);
                  }}
                >
                  {record._status === undefined
                    ? intl.get('hzero.common.button.edit').d('编辑')
                    : intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              ),
              len: 3,
              title: intl.get('hzero.common.button.edit').d('编辑'),
            },
            {
              key: 'save',
              ele: (
                <a
                  onClick={() => {
                    onSave(record);
                  }}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </a>
              ),
              len: 3,
              title: intl.get('hzero.common.button.save').d('保存'),
            },
          ];
          return operatorRender(operators);
        },
      },
    ];

    return (
      <>
        <Row style={{ marginTop: '15px', marginBottom: '15px' }}>
          <Col span={12}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar size="small" src={queryResBtn} />
              <span style={{ verticalAlign: 'middle' }}>
                {intl.get('hzero.common.button.result').d('结果')}
              </span>
            </div>
          </Col>
          <Col span={12} className="customize-buttons">
            <ExcelExport
              requestUrl={`${SRM_SPUB}/v1/${getCurrentOrganizationId()}/interfacemonitors/excel-export`}
              queryParams={() => {
                return form.getFieldsValue();
              }}
              downloadType="Blob"
              fileName={`${intl.get(`${commonPrompt}.view.export.fileName`).d('接口监控邮件提醒导出')}`}
              otherButtonProps={{
                icon: null,
              }}
              buttonText={
                <>
                  <img src={exportIcon} alt="" />
                  {intl.get('hzero.common.button.export').d('导出')}
                </>
              }
            />
            <Button onClick={onDelete} loading={deleteLoading}>
              <img src={deleteIcon} alt="" style={{ width: '15px' }} />
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            <Button onClick={onAdd}>
              <img src={addIcon} alt="" style={{ width: '15px' }} />
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </Col>
        </Row>
        <EditTable
          bordered
          loading={loading || saveLoading}
          rowKey="configId"
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          dataSource={dataSource}
          pagination={pagination}
          onChange={onChange}
          rowSelection={rowSelection}
        />
      </>
    );
  }
}
