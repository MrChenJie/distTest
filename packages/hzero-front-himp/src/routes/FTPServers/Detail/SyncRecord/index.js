/**
 * @Description: FTP服务器信息 - FTP上次读取时间
 * @date 2023-02-02
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import { Button, Col, Form, Input, Row } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import { operatorRender } from 'utils/renderer';
import notification from 'utils/notification';
import { isEmpty } from 'lodash';
import { tableScrollWidth, getEditTableData } from 'utils/utils';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import saveIcon from '@/assets/buttonIcons/保存.png';
import { dateTimeRender } from 'utils/renderer';
const commonPrompt = 'himp.ftpServers';

@connect(({ ftpServers, loading }) => ({
  ftpServers,
  fetchLoading: loading.effects['ftpServers/fetchSyncRecordList'],
  saveLoading: loading.effects['ftpServers/saveSyncRecordList'],
}))
export default class SyncRecord extends React.Component {
  state = {
    selectedRows: [],
    selectedRowKeys: [],
  };
  componentDidMount() {
    this.fetchSyncRecordList();
  }

  @Bind()
  fetchSyncRecordList(page = {}) {
    const { dispatch, match } = this.props;
    const {
      params: { lineId },
    } = match;
    dispatch({
      type: 'ftpServers/fetchSyncRecordList',
      payload: { page: isEmpty(page) ? {} : page, serverLineId: lineId },
    });
  }

  @Bind()
  handleEdit(record, flag) {
    const {
      ftpServers: { syncRecordList = [] },
      dispatch,
    } = this.props;
    const newList = syncRecordList.map((item) => {
      if (record.syncRecordId === item.syncRecordId) {
        return { ...item, _status: flag ? 'update' : undefined };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'ftpServers/updateState',
      payload: { syncRecordList: newList },
    });
  }

  @Bind()
  handleSave() {
    const {
      match,
      dispatch,
      ftpServers: { syncRecordList = {} },
    } = this.props;
    const {
      params: { lineId },
    } = match;
    const params = getEditTableData(syncRecordList, ['syncRecordId']);
    dispatch({
      type: `ftpServers/saveSyncRecordList`,
      payload: { list: params, serverLineId: lineId },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchSyncRecordList();
      }
    });
  }

  render() {
    const {
      match,
      fetchLoading = false,
      saveLoading = false,
      ftpServers: { syncRecordList = [], syncRecordPagination = {} },
    } = this.props;
    const {
      params: { id },
    } = match;
    const columns = [
      {
        title: intl.get(`${commonPrompt}.model.configList.lastSyncTimeFrom`).d('上次同步时间从'),
        dataIndex: 'lastSyncTimeFrom',
        width: 160,
        render: dateTimeRender
      },
      {
        title: intl.get(`${commonPrompt}.model.configList.lastSyncTime`).d('上次同步时间'),
        width: 160,
        dataIndex: 'lastSyncTime',
        render: (val, record) => {
          if (record._status === 'update' || record._status === 'create') {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('lastSyncTime', {
                  initialValue: record.lastSyncTime,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${commonPrompt}.model.configList.lastSyncTime`)
                          .d('上次同步时间'),
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
        title: intl.get(`${commonPrompt}.model.configList.lastBatchNum`).d('同步批次号'),
        dataIndex: 'lastBatchNum',
        width: 180,
      },
      {
        title: intl.get(`${commonPrompt}.model.configList.fileProcessMsg`).d('处理信息'),
        dataIndex: 'fileProcessMsg',
        width: 200,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
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
          title={intl.get(`${commonPrompt}.view.title.syncRecord`).d('FTP上次读取时间')}
          backPath={`/himp/ftp-servers/detail/${id}`}
        />
        <Content>
          <Row style={{ marginTop: '15px', marginBottom: '15px' }}>
            <Col offset={12} span={12} className="customize-buttons">
              <Button onClick={this.handleSave} loading={saveLoading}>
                <img src={saveIcon} alt="" style={{ width: '15px' }} />
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            </Col>
          </Row>
          <EditTable
            bordered
            rowKey="syncRecordId"
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            loading={fetchLoading}
            dataSource={syncRecordList}
            pagination={syncRecordPagination}
            onChange={(page) => this.fetchSyncRecordList(page)}
          />
        </Content>
      </>
    );
  }
}
