/**
 * @Description: FTP服务器信息 - 读取记录行
 * @date 2023-02-02
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import { Button, Checkbox, Col, Form, Input, InputNumber, Row } from 'hzero-ui';
import { isNumber } from 'lodash';
import { connect } from 'dva';
import { Link } from 'dva/router';
import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import { tableScrollWidth } from 'utils/utils';
import ValueList from 'components/ValueList';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { operatorRender, yesOrNoRender } from 'utils/renderer';
import addIcon from '@/assets/buttonIcons/新建.png';
import deleteIcon from '@/assets/buttonIcons/删除.png';

const commonPrompt = 'himp.ftpServers';

@connect(({ ftpServers }) => ({
  ftpServers,
}))
export default class ServerLine extends React.Component {
  state = {
    selectedRows: [],
    selectedRowKeys: [],
  };
  @Bind()
  handleCreate() {
    const {
      dispatch,
      detailId,
      ftpServers: { ftpServerLineList = [] },
    } = this.props;
    dispatch({
      type: 'ftpServers/updateState',
      payload: {
        ftpServerLineList: [
          {
            _status: 'create',
            serverId: detailId,
            serverLineId: uuid(),
          },
          ...ftpServerLineList,
        ],
      },
    });
  }

  @Bind()
  handleDelete() {
    const {
      dispatch,
      queryDetail,
      ftpServers: { ftpServerLineList = [] },
    } = this.props;
    const { selectedRows, selectedRowKeys } = this.state;
    const deleteLine = selectedRows.filter((item) => item._status !== 'create');
    const createLine = selectedRows.filter((item) => item._status === 'create');
    if (createLine.length > 0) {
      const newList = ftpServerLineList.filter((item) => {
        return !selectedRowKeys.includes(item.serverLineId);
      });
      dispatch({
        type: 'ftpServers/updateState',
        payload: {
          ftpServerLineList: newList,
        },
      });
    }
    if (deleteLine.length > 0) {
      dispatch({
        type: 'ftpServers/deleteServersLine',
        payload: deleteLine,
      }).then((res) => {
        if (res) {
          queryDetail();
        }
      });
    }
    notification.success();
  }

  @Bind()
  handleServerEdit(record, flag) {
    const {
      ftpServers: { ftpServerLineList = [] },
      dispatch,
    } = this.props;
    const newList = ftpServerLineList.map((item) => {
      if (record.serverLineId === item.serverLineId) {
        return { ...item, _status: flag ? 'update' : undefined };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'ftpServers/updateState',
      payload: { ftpServerLineList: newList },
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
      ftpServers: { ftpServerLineList = [] },
      detailId,
      idpValueMap,
    } = this.props;
    const { selectedRows } = this.state;
    const columns = [
      {
        title: intl.get(`${commonPrompt}.serverLine.serverLineCode`).d('FTP读取配置编码'),
        width: 200,
        dataIndex: 'serverLineCode',
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('serverLineCode', {
                  initialValue: record.serverLineCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${commonPrompt}.serverLine.serverLineCode`)
                          .d('FTP读取配置编码'),
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
        title: intl.get(`${commonPrompt}.serverLine.description`).d('描述'),
        width: 200,
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
        title: intl.get(`${commonPrompt}.serverLine.actionType`).d('操作类型'),
        dataIndex: 'actionType',
        width: 200,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('actionType', {
                  initialValue: record.actionType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.serverLine.actionType`).d('操作类型'),
                      }),
                    },
                  ],
                })(
                  <ValueList
                    allowClear
                    lazyLoad={false}
                    style={{ width: '100%' }}
                    options={idpValueMap['HFLE.FTP_ACTION_TYPE']}
                  />
                )}
              </Form.Item>
            );
          } else {
            return record.actionTypeMeaning;
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.serverLine.targetPath`).d('读取/上传目录'),
        dataIndex: 'targetPath',
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('targetPath', {
                  initialValue: record.targetPath,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.serverLine.targetPath`).d('读取/上传目录'),
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
        title: intl.get(`${commonPrompt}.serverLine.fileNameRegRule`).d('文件名正则匹配规则'),
        dataIndex: 'fileNameRegRule',
        width: 200,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('fileNameRegRule', {
                  initialValue: record.fileNameRegRule,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`hzero.common.status.includeDirFlag`).d('是否读取子目录'),
        dataIndex: 'includeDirFlag',
        width: 150,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('includeDirFlag', {
                  initialValue: record.includeDirFlag || 'N',
                })(<Checkbox checkedValue="Y" unCheckedValue="N" />)}
              </Form.Item>
            );
          } else {
            return yesOrNoRender(val === 'Y' ? 1 : 0);
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.serverLine.csvSplit`).d('CSV文件分割符'),
        dataIndex: 'csvSplit',
        width: 200,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('csvSplit', {
                  initialValue: record.csvSplit,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.serverLine.sheetIndex`).d('EXCEL文件读取sheet页'),
        dataIndex: 'sheetIndex',
        width: 200,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('sheetIndex', {
                  initialValue: record.sheetIndex,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.serverLine.startLine`).d('文件读取开始行'),
        dataIndex: 'startLine',
        width: 200,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('startLine', {
                  initialValue: record.startLine,
                })(<InputNumber min={0} step={1} precision={0} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.serverLine.serverCode`).d('回调服务代码'),
        dataIndex: 'serverCode',
        width: 200,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('serverCode', {
                  initialValue: record.serverCode,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.serverLine.interfaceCode`).d('回调接口编码'),
        dataIndex: 'interfaceCode',
        width: 200,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('interfaceCode', {
                  initialValue: record.interfaceCode,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`${commonPrompt}.serverLine.readLatestFlag`).d('是否只读取最新文件'),
        dataIndex: 'readLatestFlag',
        width: 200,
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('readLatestFlag', {
                  initialValue: record.readLatestFlag || 'Y',
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
        width: 250,
        fixed: 'right',
        render: (val, record) => {
          const operators = [];
          if (
            record.serverId !== undefined &&
            record.serverLineId !== undefined &&
            isNumber(record.serverLineId)
          ) {
            operators.push({
              key: 'config',
              ele: (
                <Link to={`/himp/ftp-servers/config/${detailId}/${record.serverLineId}`}>
                  {intl.get(`${commonPrompt}.serverLine.action.configList`).d('配置列表')}
                </Link>
              ),
              len: 5,
              title: intl.get(`${commonPrompt}.serverLine.action.configList`).d('配置列表'),
            });
            operators.push({
              key: 'sync',
              ele: (
                <Link to={`/himp/ftp-servers/syncRecord/${detailId}/${record.serverLineId}`}>
                  {intl.get(`${commonPrompt}.serverLine.action.syncRecord`).d('读取时间')}
                </Link>
              ),
              len: 5,
              title: intl.get(`${commonPrompt}.serverLine.action.syncRecord`).d('读取时间'),
            });
          }
          if (record._status === 'update') {
            operators.push({
              key: 'cancel',
              ele: (
                <a onClick={() => this.handleServerEdit(record, false)}>
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
                <a onClick={() => this.handleServerEdit(record, true)}>
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
        <Row style={{ marginTop: '15px', marginBottom: '15px' }}>
          <Col offset={12} span={12} className="customize-buttons">
            <Button onClick={this.handleDelete}>
              <img src={deleteIcon} alt="" style={{ width: '15px' }} />
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            <Button onClick={this.handleCreate}>
              <img src={addIcon} alt="" style={{ width: '15px' }} />
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </Col>
        </Row>
        <EditTable
          bordered
          rowKey="serverLineId"
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          dataSource={ftpServerLineList}
          pagination={false}
          rowSelection={{
            onChange: this.onSelectChange,
            selectedRowKeys: selectedRows.map((n) => n.serverLineId),
          }}
        />
      </>
    );
  }
}
