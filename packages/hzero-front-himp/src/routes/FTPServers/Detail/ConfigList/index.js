/**
 * @Description: FTP服务器信息 - SFTP文件读取配置
 * @date 2023-02-02
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import { Button, Checkbox, Col, Form, Input, Row } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import { isEmpty } from 'lodash';
import { operatorRender, yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import uuid from 'uuid/v4';
import {
  tableScrollWidth,
  addItemToPagination,
  delItemsToPagination,
  getEditTableData,
} from 'utils/utils';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import addIcon from '@/assets/buttonIcons/新建.png';
import deleteIcon from '@/assets/buttonIcons/删除.png';
import saveIcon from '@/assets/buttonIcons/保存.png';
import ValueList from 'hzero-front/lib/components/ValueList';
import { fastCodeLoader } from '../../../../utils/decorators';
const commonPrompt = 'himp.ftpServers';

@connect(({ ftpServers, loading }) => ({
  ftpServers,
  fetchLoading: loading.effects['ftpServers/fetchConfigList'],
  deleteLoading: loading.effects['ftpServers/deleteConfigList'],
  saveLoading: loading.effects['ftpServers/saveConfigList'],
}))
@fastCodeLoader(['HPDM.CONFIG_TYPE'])
export default class ConfigList extends React.Component {
  state = {
    selectedRows: [],
    selectedRowKeys: [],
  };
  componentDidMount() {
    this.fetchConfigList();
  }

  @Bind()
  fetchConfigList(page = {}) {
    const { dispatch, match } = this.props;
    const {
      params: { lineId },
    } = match;
    dispatch({
      type: 'ftpServers/fetchConfigList',
      payload: { page: isEmpty(page) ? {} : page, serverLineId: lineId },
    });
  }

  @Bind()
  handleDelete() {
    const {
      dispatch,
      ftpServers: { configList = [], configPagination },
    } = this.props;
    const { selectedRows, selectedRowKeys } = this.state;
    const deleteLine = selectedRows.filter((item) => item._status !== 'create');
    const createLine = selectedRows.filter((item) => item._status === 'create');
    if (createLine.length > 0) {
      const newList = configList.filter((item) => {
        return !selectedRowKeys.includes(item.lineCfgId);
      });
      dispatch({
        type: 'ftpServers/updateState',
        payload: {
          configList: newList,
          configPagination: delItemsToPagination(
            createLine.length,
            configList.length,
            configPagination
          ),
        },
      });
    }
    if (deleteLine.length > 0) {
      dispatch({
        type: 'ftpServers/deleteConfigList',
        payload: deleteLine,
      }).then((res) => {
        if (res) {
          this.fetchConfigList();
        }
      });
    }
    notification.success();
  }

  @Bind()
  handleEdit(record, flag) {
    const {
      ftpServers: { configList = [] },
      dispatch,
    } = this.props;
    const newList = configList.map((item) => {
      if (record.lineCfgId === item.lineCfgId) {
        return { ...item, _status: flag ? 'update' : undefined };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'ftpServers/updateState',
      payload: { configList: newList },
    });
  }

  @Bind()
  handleCreate() {
    const {
      dispatch,
      match,
      ftpServers: { configList = [], configPagination },
    } = this.props;
    const {
      params: { lineId },
    } = match;
    dispatch({
      type: 'ftpServers/updateState',
      payload: {
        configList: [
          {
            _status: 'create',
            lineCfgId: uuid(),
            serverLineId: lineId,
          },
          ...configList,
        ],
        configPagination: addItemToPagination(configList.length, configPagination),
      },
    });
  }

  @Bind()
  handleSave() {
    const {
      dispatch,
      ftpServers: { configList = {} },
    } = this.props;
    const params = getEditTableData(configList, ['lineCfgId']);
    dispatch({
      type: `ftpServers/saveConfigList`,
      payload: params,
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchConfigList();
      }
    });
  }

  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  render() {
    const {
      match,
      fetchLoading = false,
      deleteLoading = false,
      saveLoading = false,
      idpValueMap = {},
      ftpServers: { configList = [], configPagination = {} },
    } = this.props;
    const { selectedRows } = this.state;
    const {
      params: { id },
    } = match;
    const columns = [
      {
        title: intl.get(`${commonPrompt}.model.configList.columnCode`).d('列编码'),
        width: 160,
        dataIndex: 'columnCode',
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('columnCode', {
                  initialValue: record.columnCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.model.configList.columnCode`).d('列编码'),
                      }),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.model.configList.columnName`).d('列名称'),
        dataIndex: 'columnName',
        width: 180,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('columnName', {
                  initialValue: record.columnName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.model.configList.columnName`).d('列名称'),
                      }),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.model.configList.columnType`).d('列类型'),
        dataIndex: 'columnType',
        width: 150,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('columnType', {
                  initialValue: record.columnType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.model.configList.columnType`).d('列类型'),
                      }),
                    },
                  ],
                })(
                  <ValueList
                    allowClear
                    lazyLoad={false}
                    style={{ width: '100%' }}
                    options={idpValueMap['HPDM.CONFIG_TYPE']}
                  />
                )}
              </Form.Item>
            );
          } else {
            return record.columnType;
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.model.configList.columnIndex`).d('列序号'),
        width: 100,
        dataIndex: 'columnIndex',
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('columnIndex', {
                  initialValue: record.columnIndex,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.model.configList.columnIndex`).d('列序号'),
                      }),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.model.configList.formatMask`).d('格式掩码'),
        width: 150,
        dataIndex: 'formatMask',
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('formatMask', {
                  initialValue: record.formatMask,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.model.configList.description`).d('描述'),
        width: 150,
        dataIndex: 'description',
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('description', {
                  initialValue: record.description,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.model.configList.enabledFlag`).d('是否启用'),
        width: 100,
        dataIndex: 'enabledFlag',
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('enabledFlag', {
                  initialValue: record.enabledFlag || 'Y',
                })(<Checkbox checkedValue="Y" unCheckedValue="N" />)}
              </Form.Item>
            );
          } else {
            return yesOrNoRender(val === 'Y' ? 1 : 0);
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.model.configList.judgeUpdateFlag`).d('是否用于更新判断'),
        width: 150,
        dataIndex: 'judgeUpdateFlag',
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('judgeUpdateFlag', {
                  initialValue: record.judgeUpdateFlag || 'N',
                })(<Checkbox checkedValue="Y" unCheckedValue="N" />)}
              </Form.Item>
            );
          } else {
            return yesOrNoRender(val === 'Y' ? 1 : 0);
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        fixed: 'right',
        width: 100,
        render: (val, record) => {
          const operators = [];
          if (record._status === 'update') {
            operators.push({
              key: 'cancel',
              ele: (
                <a onClick={() => this.handleEdit(record, false)}>
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </a>
              ),
              len: 3,
              title: intl.get('hzero.common.button.cancel').d('取消'),
            });
          } else if (record._status === undefined) {
            operators.push({
              key: 'edit',
              ele: (
                <a
                  onClick={() => {
                    this.handleEdit(record, true);
                  }}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              ),
              len: 3,
              title: intl.get('hzero.common.button.edit').d('编辑'),
            });
          }
          return operatorRender(operators, record);
        },
      },
    ];
    return (
      <>
        <Header
          title={intl.get(`${commonPrompt}.view.title.configList`).d('读取配置行列表')}
          backPath={`/himp/ftp-servers/detail/${id}`}
        />
        <Content>
          <Row style={{ marginTop: '15px', marginBottom: '15px' }}>
            <Col offset={12} span={12} className="customize-buttons">
              <Button
                onClick={this.handleDelete}
                loading={deleteLoading}
                disabled={selectedRows.length === 0}
              >
                <img src={deleteIcon} alt="" style={{ width: '15px' }} />
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
              <Button onClick={this.handleCreate}>
                <img src={addIcon} alt="" style={{ width: '15px' }} />
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
              <Button onClick={this.handleSave} loading={saveLoading}>
                <img src={saveIcon} alt="" style={{ width: '15px' }} />
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            </Col>
          </Row>
          <EditTable
            bordered
            rowKey="lineCfgId"
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            loading={fetchLoading}
            dataSource={configList}
            pagination={configPagination}
            onChange={(page) => this.fetchConfigList(page)}
            rowSelection={{
              onChange: this.onSelectChange,
              selectedRowKeys: selectedRows.map((n) => n.lineCfgId),
            }}
          />
        </Content>
      </>
    );
  }
}
