import React, { Component } from 'react';
import { Bind, Debounce } from 'lodash-decorators';
import { TreeSelect, Form, Button, notification, Row, Col, Avatar } from 'hzero-ui';
import uuidv4 from 'uuid/v4';
import moment from 'moment';

import EditTable from 'components/EditTable';
import ValueList from 'components/ValueList';
import ExcelExport from '@/components/ExcelExport';
import Lov from './Lov';
import intl from 'utils/intl';
import { tableScrollWidth, getCurrentUser, getCurrentOrganizationId } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { SRM_SPUC } from '_utils/config';

import exportIcon from '@/assets/buttonIcons/导出.png';
import addIcon from '@/assets/buttonIcons/新建.png';
import deleteIcon from '@/assets/buttonIcons/删除.png';
import queryResBtn from '@/assets/buttonIcons/查询结果.png';

const ROW_KEY = 'permissionConfigId';

export default class ListTable extends Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);
    this.state = {
      editRowKey: undefined,
      selectedRowKeys: [],
    };
  }

  @Bind
  clearEditRowKey() {
    this.setState({
      editRowKey: undefined,
    });
  }

  @Bind
  getEditStatus(record) {
    const { editRowKey } = this.state;
    return editRowKey === record[ROW_KEY] && ['create', 'update'].includes(record._status);
  }

  @Bind
  handleEdit(record) {
    this.setState({
      editRowKey: record[ROW_KEY],
    });
  }

  @Bind
  handleCancel(record) {
    if (record._status === 'create') {
      const { onDeleteLine = (e) => e } = this.props;
      onDeleteLine([record[ROW_KEY]], () => {
        this.setState({
          editRowKey: undefined,
        });
      });
    } else {
      this.setState({
        editRowKey: undefined,
      });
    }
  }

  @Bind
  yesOrNoRender(val) {
    const { idpValueMap } = this.props;
    const data = (idpValueMap['SPFM.YES_NO'] || []).find((item) => item.value === val) || {};
    return data.meaning;
  }

  @Bind
  @Debounce(300, { leading: true })
  handleSave(record) {
    const { onSaveLine = (e) => e } = this.props;
    record.$form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return false;
      }
      onSaveLine({
        ...record,
        ...values,
        permissionConfigId: record._status === 'create' ? undefined : record.permissionConfigId,
      });
    });
  }

  @Bind
  handleAdd() {
    const { onAddLine = (e) => e } = this.props;
    const { editRowKey } = this.state;
    if (editRowKey) {
      notification.warning({
        message: intl
          .get('spcm.csPermissionConfig.warning.message.createNeedAfterSave')
          .d('请保存当前行再新建'),
      });
      return false;
    }
    const key = uuidv4();
    const user = getCurrentUser();
    const { loginName } = user;
    onAddLine({
      [ROW_KEY]: key,
      _status: 'create',
      creator: loginName,
      creationDate: moment().format('YYYY-MM-DD 00:00:00'),
    });
    this.setState({
      editRowKey: key,
    });
  }

  @Bind
  handleDelete() {
    const { onDeleteLine = (e) => e } = this.props;
    const { selectedRowKeys, editRowKey } = this.state;
    onDeleteLine(selectedRowKeys, () => {
      this.setState({
        selectedRowKeys: [],
        editRowKey: selectedRowKeys.includes(editRowKey) ? undefined : editRowKey,
      });
    });
  }

  render() {
    const {
      idpValueMap,
      dataSource = [],
      pagination = {},
      loading = false,
      saveLoading = false,
      treeData = [],
      getQueryParams = (e) => e,
      onChange = (e) => e,
    } = this.props;
    const { editRowKey, selectedRowKeys } = this.state;
    const columns = [
      {
        title: intl.get('spcm.csPermissionConfig.model.userName').d('用户名称'),
        dataIndex: 'userName',
        width: 100,
        className: 'required-header',
        render: (val, record) =>
          this.getEditStatus(record) ? (
            <>
              <Form.Item style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('userName', {
                  initialValue: record.userName,
                })}
              </Form.Item>
              <Form.Item>
                {record.$form.getFieldDecorator('userId', {
                  initialValue: record.userId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('spcm.csPermissionConfig.model.userName').d('用户名称'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    textField="userName"
                    code="HPFM.EMPLOYEE"
                    queryParams={{ tenantId: getCurrentOrganizationId() }}
                    lovOptions={{ valueField: 'employeeId', displayField: 'name' }}
                    onChange={(_, dataList) => {
                      Object.assign(record, { userUnitName: dataList.unitName });
                    }}
                  />
                )}
              </Form.Item>
            </>
          ) : (
            val
          ),
      },
      {
        title: intl.get('spcm.csPermissionConfig.model.userUnitName').d('用户部门'),
        dataIndex: 'userUnitName',
        width: 150,
      },
      {
        title: intl.get('spcm.csPermissionConfig.model.documentType').d('单据类型'),
        dataIndex: 'documentType',
        width: 100,
        className: 'required-header',
        render: (val, record) =>
          this.getEditStatus(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('documentType', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('spcm.csPermissionConfig.model.documentType').d('单据类型'),
                    }),
                  },
                ],
              })(
                <ValueList
                  options={idpValueMap['SPUC.DOCUMENT_TYPE']}
                  allowClear
                  lazyLoad={false}
                  style={{ width: '100%' }}
                  onChange={() => {
                    record.$form.setFieldsValue({
                      businessType: undefined,
                    });
                  }}
                />
              )}
            </Form.Item>
          ) : (
            record.documentTypeMeaning
          ),
      },
      {
        title: intl.get('spcm.csPermissionConfig.model.salesUnit').d('采购部门'),
        dataIndex: 'unitList',
        width: 200,
        className: 'required-header',
        render: (val, record) =>
          this.getEditStatus(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('unitList', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('spcm.csPermissionConfig.model.salesUnit').d('采购部门'),
                    }),
                  },
                ],
              })(
                <TreeSelect
                  allowClear
                  dropdownMatchSelectWidth={false}
                  multiple
                  treeCheckable
                  treeData={treeData}
                  style={{ width: '100%' }}
                  showCheckedStrategy={TreeSelect.SHOW_PARENT}
                  filterTreeNode={(inputValue, treeNode) => {
                    return treeNode.props.title.includes(inputValue);
                  }}
                  dropdownStyle={{ maxHeight: '300px' }}
                  treeDefaultExpandedKeys={val}
                />
              )}
            </Form.Item>
          ) : (
            <TreeSelect
              dropdownMatchSelectWidth={false}
              multiple
              treeCheckable
              treeData={treeData}
              style={{ width: '100%' }}
              value={val}
              maxTagCount={2}
              showCheckedStrategy={TreeSelect.SHOW_PARENT}
              key={treeData}
              dropdownStyle={{ maxHeight: '300px' }}
              treeDefaultExpandedKeys={val}
            />
          ),
      },
      {
        title: intl.get('spcm.csPermissionConfig.model.businessType').d('业务类型'),
        dataIndex: 'businessType',
        width: 100,
        className: 'required-header',
        render: (val, record) =>
          this.getEditStatus(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('businessType', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('spcm.csPermissionConfig.model.businessType').d('业务类型'),
                    }),
                  },
                ],
              })(
                <ValueList
                  options={
                    idpValueMap['SPUC.BUSINESS_TYPE'] &&
                    idpValueMap['SPUC.BUSINESS_TYPE'].filter((item) => {
                      return (
                        item.tag && item.tag.includes(record.$form.getFieldValue('documentType'))
                      );
                    })
                  }
                  allowClear
                  lazyLoad={false}
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get('spcm.csPermissionConfig.model.editFlag').d('是否可编辑'),
        dataIndex: 'editFlag',
        width: 100,
        className: 'required-header',
        render: (val, record) =>
          this.getEditStatus(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('editFlag', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('spcm.csPermissionConfig.model.editFlag').d('是否可编辑'),
                    }),
                  },
                ],
              })(
                <ValueList
                  options={idpValueMap['SPFM.YES_NO']}
                  allowClear
                  lazyLoad={false}
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          ) : (
            this.yesOrNoRender(val)
          ),
      },
      {
        title: intl.get('spcm.csPermissionConfig.model.creator').d('创建人'),
        dataIndex: 'creator',
        width: 100,
      },
      {
        title: intl.get('spcm.csPermissionConfig.model.creationDate').d('创建日期'),
        dataIndex: 'creationDate',
        width: 100,
        render: (val) => dateRender(val),
      },
      {
        title: intl.get('hzero.common.table.column.option').d('操作'),
        dataIndex: 'operation',
        width: 100,
        render: (_, record) => (
          <div style={{ textAlign: 'center' }}>
            {editRowKey !== record[ROW_KEY] ? (
              <a disabled={editRowKey !== undefined} onClick={() => this.handleEdit(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            ) : (
              <a onClick={() => this.handleCancel(record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            &nbsp;&nbsp;
            <a disabled={editRowKey !== record[ROW_KEY]} onClick={() => this.handleSave(record)}>
              {intl.get('hzero.common.button.save').d('保存')}
            </a>
          </div>
        ),
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      onChange: (keys) => {
        this.setState({
          selectedRowKeys: keys,
        });
      },
    };

    return (
      <>
        <Row style={{ margin: '15px 0' }}>
          <Col span={12}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar size="small" src={queryResBtn} />
              <span style={{ verticalAlign: 'middle' }}>
                {intl.get('hzero.common.button.result').d('结果')}
              </span>
            </div>
          </Col>
          <Col span={12}>
            <div className="customize-buttons">
              <ExcelExport
                requestUrl={`${SRM_SPUC}/v1/${getCurrentOrganizationId()}/spuc-permission-configs/export`}
                otherButtonProps={{
                  icon: null,
                }}
                buttonText={
                  <>
                    <img src={exportIcon} alt="" />
                    {intl.get('hzero.common.button.export').d('导出')}
                  </>
                }
                downloadType="Blob"
                fileName={intl
                  .get('spcm.csPermissionConfig.view.export.permissionConfig')
                  .d('跨部门权限配置')}
                queryParams={getQueryParams}
              />
              <Button onClick={this.handleDelete}>
                <img src={deleteIcon} alt="" />
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
              <Button onClick={this.handleAdd}>
                <img src={addIcon} alt="" />
                {intl.get('hzero.common.button.add').d('新增')}
              </Button>
            </div>
          </Col>
        </Row>
        <EditTable
          rowKey={ROW_KEY}
          bordered
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          loading={loading || saveLoading}
          scroll={{ x: tableScrollWidth(columns) }}
          rowSelection={rowSelection}
          onChange={(page) => onChange(page)}
        />
      </>
    );
  }
}
