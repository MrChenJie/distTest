/**
 * @Description: 应付发票导入记录列表 - 查询结果
 * @date 2023-02-22
 * @author <xinyi.he02@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { PureComponent } from 'react';
import { Row, Col, Table, Avatar } from 'hzero-ui';
import { tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import { tooltipRender } from '@/utils/utils';
import queryResBtn from '@/assets/buttonIcons/查询结果.png';

const commonPrompt = 'spub.invoiceImport';

export default class ListTable extends PureComponent {
  render() {
    const {
      loading,
      dataSource,
      pagination,
      onChange = (e) => e,
      onDetail = (e) =>e,
    } = this.props;

    const columns = [
      {
        title: intl.get(`${commonPrompt}.view.model.invoiceImportId`).d('导入标识'),
        dataIndex: 'invoiceImportId',
        width: 120,
        render: (val, record) => (
          <a onClick={() => onDetail(record)}>
            {val}
          </a>
        ),
      },
      {
        title: intl.get(`${commonPrompt}.view.model.requestNum`).d('付款申请编号'),
        dataIndex: 'requestNum',
        width: 180,
        render: (val) => tooltipRender(val),
      },
      {
        title: intl.get(`${commonPrompt}.view.model.costRequestType`).d('付款申请类型'),
        dataIndex: 'costRequestType',
        width: 180,
        render: (val) => tooltipRender(val),
      },
      {
        title: intl.get(`${commonPrompt}.view.model.ebsRequestId`).d('Ebs请求标识'),
        dataIndex: 'ebsRequestId',
        width: 140,
        render: (val) => tooltipRender(val),
      },
      {
        title: intl.get(`${commonPrompt}.view.model.creationDate`).d('导入时间'),
        dataIndex: 'creationDate',
        width: 180,
      },
      {
        title: intl.get(`${commonPrompt}.view.model.processStatus`).d('导入状态'),
        dataIndex: 'processStatusMeaning',
        width: 120,
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
