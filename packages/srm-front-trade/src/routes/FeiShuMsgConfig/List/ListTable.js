/**
 * @Description: 飞书消息配置列表 - 查询结果
 * @date 2023-02-09
 * @author <xinyi.he02@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Button, Table, Avatar } from 'hzero-ui';
import { tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import { operatorRender } from 'utils/renderer';
import { tooltipRender } from '@/utils/utils';
import addIcon from '@/assets/buttonIcons/新建.png';
import queryResBtn from '@/assets/buttonIcons/查询结果.png';

const commonPrompt = 'spub.feiShuMsgConfig';

export default class ListTable extends PureComponent {
  changeEdit(record) {
    this.props.onEdit(record);
  }

  render() {
    const {
      loading,
      dataSource,
      pagination,
      onChange = (e) => e,
      onAdd = (e) => e,
    } = this.props;

    const columns = [
      {
        title: intl.get(`${commonPrompt}.view.model.msgConfigCode`).d('配置编码'),
        dataIndex: 'msgConfigCode',
        width: 160,
        render: (val) => tooltipRender(val),
      },
      {
        title: intl.get(`${commonPrompt}.view.model.description`).d('描述'),
        dataIndex: 'description',
        width: 180,
        render: (val) => tooltipRender(val),
      },
      {
        title: intl.get(`${commonPrompt}.view.model.title`).d('标题'),
        dataIndex: 'title',
        width: 160,
        render: (val) => tooltipRender(val),
      },
      {
        title: intl.get(`${commonPrompt}.view.model.titleCode`).d('标题编码'),
        dataIndex: 'titleCode',
        width: 200,
        render: (val) => tooltipRender(val),
      },
      {
        title: intl.get(`${commonPrompt}.view.model.enabledFlag`).d('是否有效'),
        dataIndex: 'enabledFlagMeaning',
        width: 120,
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
            <Button onClick={onAdd}>
              <img src={addIcon} alt="" style={{ width: '15px' }} />
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </Col>
        </Row>
        <Table
          bordered
          loading={loading}
          rowKey="msgConfigId"
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          dataSource={dataSource}
          pagination={pagination}
          onChange={onChange}
        />
      </>
    );
  }
}
