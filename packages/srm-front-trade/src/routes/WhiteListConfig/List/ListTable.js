/**
 * @Description: 白名单配置列表 - 查询结果
 * @date 2023-02-16
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

const commonPrompt = 'spub.whiteListConfig';

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
        title: intl.get(`${commonPrompt}.view.model.configCode`).d('配置编码'),
        dataIndex: 'configCode',
        width: 120,
        render: (val) => tooltipRender(val),
      },
      {
        title: intl.get(`${commonPrompt}.view.model.description`).d('描述'),
        dataIndex: 'description',
        width: 180,
        render: (val) => tooltipRender(val),
      },
      {
        title: intl.get(`${commonPrompt}.view.model.openFlag`).d('是否开启过滤'),
        dataIndex: 'openFlagMeaning',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.view.model.interfaceType`).d('接口类型'),
        dataIndex: 'interfaceTypeMeaning',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.view.model.interfaceCode`).d('接口编码'),
        dataIndex: 'interfaceCode',
        width: 220,
        render: (val) => tooltipRender(val),
      },
      {
        title: intl.get(`${commonPrompt}.view.model.interfaceName`).d('接口名称'),
        dataIndex: 'interfaceName',
        width: 160,
        render: (val) => tooltipRender(val),
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
          rowKey="whiteListConfigId"
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
