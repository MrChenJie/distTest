/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-12 15:25:43
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { dateRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';

export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
  }

  handleActiveLink = (record) => {
    const url = `/pub/platform/bid-management/Detail/${record.id}`;
    window.open(url, '_blank');
  }

  render() {
    const {
      rowSelection,
      dataSource = [],
      pagination = {},
      onChange = (e) => e,
    } = this.props;
    const columns = [
      {
        title: intl.get(`spfmhk.trade.field.ActivityID`).d('活动ID'),
        width: 160,
        dataIndex: 'actId',
        key: 'actId',
        render: (_, record) => {
          return (
            <a onClick={() => this.handleActiveLink(record)}>
              {tooltipRender(record.actId)}
            </a>
          )
        },
      },
      {
        title: intl.get(`spfmhk.trade.field.ActivityName`).d('活动名称'),
        width: 160,
        dataIndex: 'actName',
        key: 'actName',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.field.ActivityStat`).d('活动状态'),
        width: 100,
        dataIndex: 'actStatusMeaning',
        key: 'actStatusMeaning',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.field.failBid`).d('活动流标'),
        width: 100,
        dataIndex: 'isFailWinMeaning',
        key: 'isFailWinMeaning',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.field.QuotatDateEnd`).d('报价截止日期'),
        width: 100,
        dataIndex: 'quoteEndTime',
        key: 'quoteEndTime',
        render: dateRender,
      },
    ];
    return (
      <>
        <CusTable
          rowKey="rowKey"
          rowSelection={rowSelection}
          pagination={pagination}
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
