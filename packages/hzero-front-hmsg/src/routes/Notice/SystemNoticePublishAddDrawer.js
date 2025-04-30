/**
 * SystemNoticePublishAddDrawer
 * @author WY <yang.wang06@hand-china.com>
 * @date 2019-06-12
 * @copyright 2019-06-12 © HAND
 */

import React, { Component } from 'react';
import uuid from 'uuid/v4';
import { Button, Drawer, Form, Select, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isNil } from 'lodash';

import EditTable from 'components/EditTable';
import Lov from 'components/Lov';

import intl from 'utils/intl';
import { getEditTableData } from 'utils/utils';
import { operatorRender } from 'utils/renderer';

const fullWidthStyle = {
  width: '100%',
};

@Form.create({ fieldNameProp: null })
export default class SystemNoticePublishAddDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      selectedRows: [],
      selectedRowKeys: [],
    };
  }

  // Btn
  @Bind()
  handleAddBtnClick() {
    const { dataSource = [] } = this.state;
    this.setState({
      dataSource: [...dataSource, { id: uuid(), _status: 'create' }],
    });
  }

  @Bind()
  handleDelBtnClick() {
    const { dataSource = [], selectedRows = [] } = this.state;
    this.setState({
      dataSource: dataSource.filter(r => selectedRows.every(rd => rd.id !== r.id)),
      selectedRows: [],
      selectedRowKeys: [],
    });
  }

  @Bind()
  handleSaveBtnClick() {
    const { dataSource = [] } = this.state;
    if (dataSource.length > 0) {
      const validationDataSource = getEditTableData(dataSource, ['id', '_status']);
      if (dataSource.length === validationDataSource.length) {
        // 校验通过
        const { onAddReceiver, record, organizationId } = this.props;
        onAddReceiver({
          records: validationDataSource.map(rd => {
            if (isNil(rd.tenantId)) {
              return {
                ...rd,
                tenantId: organizationId,
                receiverSourceId: rd.receiverTypeCode === 'ALL' ? 0 : rd.receiverSourceId,
              }; // 全局时，receiverSourceId 取0
            } else {
              return {
                ...rd,
                receiverSourceId: rd.receiverTypeCode === 'ALL' ? 0 : rd.receiverSourceId,
              };
            }
          }),
          noticeId: record.noticeId,
        });
      }
    } else {
      this.handleClose();
    }
  }

  // Table
  @Bind()
  handleRowSelectionChange(_, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys: selectedRows.map(r => r.id),
    });
  }

  // Table Record
  @Bind()
  removeRecord(record) {
    const { dataSource = [] } = this.state;
    this.setState({
      dataSource: dataSource.filter(r => r.id !== record.id),
    });
  }

  @Bind()
  renderReceiverType() {
    const { record = {}, isTenantRole, receiverRecordType = [] } = this.props;
    // 通知类型
    if (record.receiverTypeCode === 'NOTIFY') {
      return (isTenantRole
        ? receiverRecordType.filter(item => item.value !== 'TENANT' && item.value !== 'ALL')
        : receiverRecordType.filter(item => item.value !== 'ALL')
      ).map(item => (
        <Select.Option key={item.value} value={item.value}>
          {item.meaning}
        </Select.Option>
      ));
    } else if (record.receiverTypeCode === 'ANNOUNCE') {
      return (isTenantRole
        ? receiverRecordType.filter(item => item.value === 'UNIT' || item.value === 'ALL')
        : receiverRecordType.filter(
            item => item.value === 'TENANT' || item.value === 'UNIT' || item.value === 'ALL'
          )
      ).map(item => (
        <Select.Option key={item.value} value={item.value}>
          {item.meaning}
        </Select.Option>
      ));
    }
  }

  getColumns() {
    return [
      {
        dataIndex: 'receiverTypeCode',
        title: intl.get('hmsg.notice.model.receive.receiverType').d('类型'),
        width: 160,
        render: (_, record) => {
          const { $form: form } = record;
          return (
            <>
              <Form.Item>
                {form.getFieldDecorator('receiverTypeCode', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hmsg.notice.model.receive.receiverType').d('类型'),
                      }),
                    },
                  ],
                })(
                  <Select
                    onChange={() => {
                      form.setFieldsValue({
                        receiverSourceId: null,
                      });
                    }}
                    style={fullWidthStyle}
                  >
                    {this.renderReceiverType()}
                  </Select>
                )}
              </Form.Item>
              {form.getFieldDecorator('tenantId')(<div />)}
            </>
          );
        },
      },
      {
        dataIndex: 'receiverSourceId',
        title: intl.get('hmsg.notice.model.receive.receiverSource').d('接收方名称'),
        render: (receiverSource, record) => {
          const { isTenantRole, organizationId } = this.props;
          const { $form: form } = record;
          // 接收方类型,值集：HMSG.NOTICE.RECEIVER_RECORD_TYPE
          // 租户：HPFM.TENANT
          // 组织部门：isTenantRole ? 'HMSG.NOTICE_RECEIVER_UNIT': 'HMSG.SITE.NOTICE_RECEIVER_UNIT',
          // 用户组：HIAM.USER_GROUP
          // 用户：HIAM.SITE.USER
          const type = form.getFieldValue('receiverTypeCode');
          const lovCode = {
            TENANT: isTenantRole ? '' : 'HPFM.TENANT',
            UNIT: isTenantRole ? 'HMSG.NOTICE_RECEIVER_UNIT' : 'HMSG.SITE.NOTICE_RECEIVER_UNIT',
            USER_GROUP: 'HIAM.USER_GROUP',
            USER: 'HIAM.SITE.USER',
          }[type];
          const queryParams = {};
          switch (type) {
            case 'TENANT':
              break;
            case 'UNIT':
              break;
            case 'USER_GROUP':
              queryParams.tenantId = organizationId;
              break;
            case 'USER':
              queryParams.organizationId = organizationId;
              break;
            default:
              break;
          }
          return (
            <Form.Item>
              {form.getFieldDecorator('receiverSourceId', {
                rules: [
                  {
                    required: type !== 'ALL',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hmsg.notice.model.receive.receiverSource').d('接收方名称'),
                    }),
                  },
                ],
              })(
                <Lov
                  key={lovCode}
                  // 全局(ALL) 时不允许编辑
                  disabled={!type || type === 'ALL'}
                  code={lovCode}
                  style={fullWidthStyle}
                  onChange={(_, lovRecord) => {
                    if (!isNil(lovRecord.tenantId)) {
                      form.setFieldsValue({
                        tenantId: lovRecord.tenantId,
                      });
                    }
                  }}
                  queryParams={queryParams}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        key: 'action',
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        render: (_, record) => {
          const operators = [];
          operators.push({
            key: 'delete',
            ele: (
              <a
                onClick={() => {
                  this.removeRecord(record);
                }}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </a>
            ),
            len: 2,
            title: intl.get('hzero.common.button.delete').d('删除'),
          });
          return operatorRender(operators);
        },
      },
    ];
  }

  // Drawer
  @Bind()
  handleClose() {
    const { onClose } = this.props;
    onClose();
  }

  render() {
    const { visible = false, createReceiverLoading = false } = this.props;
    const { dataSource = [], selectedRowKeys = [] } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectionChange,
    };
    const columns = this.getColumns();
    return (
      <Drawer
        width={800}
        title={intl.get('hmsg.notice.view.title.createPublishRecord').d('新增发布记录')}
        visible={visible}
        onClose={this.handleClose}
      >
        <Spin spinning={createReceiverLoading}>
          <div className="table-operator">
            <Button
              type="primary"
              onClick={this.handleSaveBtnClick}
              disabled={dataSource.length === 0}
              loading={createReceiverLoading}
            >
              {intl.get('hzero.common.button.release').d('发布')}
            </Button>
            <Button onClick={this.handleDelBtnClick} disabled={createReceiverLoading}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            <Button onClick={this.handleAddBtnClick} disabled={createReceiverLoading}>
              {intl.get('hzero.common.button.add').d('新增')}
            </Button>
          </div>
          <EditTable
            bordered
            pagination={false}
            rowKey="id"
            dataSource={dataSource}
            columns={columns}
            rowSelection={rowSelection}
          />
        </Spin>
      </Drawer>
    );
  }
}
