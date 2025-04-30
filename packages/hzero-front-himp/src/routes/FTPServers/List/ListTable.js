/**
 * @Description: FTP服务器信息 - 查询结果
 * @date 2023-02-02
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Button, Table, Avatar } from 'hzero-ui';
import { tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import { operatorRender } from 'utils/renderer';
import addIcon from '@/assets/buttonIcons/新建.png';
import deleteIcon from '@/assets/buttonIcons/删除.png';
import queryResBtn from '@/assets/buttonIcons/查询结果.png';

const commonPrompt = 'himp.ftpServers';

export default class ListTable extends PureComponent {
  changeEdit(record) {
    this.props.onEdit(record);
  }

  render() {
    const { loading, dataSource, pagination, rowSelection, onChange, onAdd, onDelete } = this.props;

    const columns = [
      {
        title: intl.get(`${commonPrompt}.view.model.serverCode`).d('ftp服务器编码'),
        dataIndex: 'serverCode',
        width: 220,
      },
      {
        title: intl.get(`${commonPrompt}.view.model.description`).d('描述'),
        dataIndex: 'description',
        width: 220,
      },
      {
        title: intl.get(`${commonPrompt}.view.model.ftpType`).d('ftp类型'),
        dataIndex: 'ftpTypeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${commonPrompt}.view.model.host`).d('host'),
        dataIndex: 'host',
        width: 200,
      },
      {
        title: intl.get(`${commonPrompt}.view.model.userName`).d('用户名'),
        dataIndex: 'userName',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.view.model.port`).d('端口'),
        dataIndex: 'port',
        width: 100,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        key: 'action',
        width: 80,
        render: (_, record) => {
          const operators = [
            {
              key: 'edit',
              ele: (
                <a
                  onClick={() => {
                    this.changeEdit(record);
                  }}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              ),
              len: 3,
              title: intl.get('hzero.common.button.edit').d('编辑'),
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
            <Button onClick={onDelete}>
              <img src={deleteIcon} alt="" style={{ width: '15px' }} />
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
            <Button onClick={onAdd}>
              <img src={addIcon} alt="" style={{ width: '15px' }} />
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </Col>
        </Row>
        <Table
          bordered
          loading={loading}
          rowKey="serverId"
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          dataSource={dataSource}
          pagination={pagination}
          rowSelection={rowSelection}
          onChange={onChange}
        />
      </>
    );
  }
}
