/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-15 17:18:09
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import CusTable from '_cus_components/CusTable';
import { tableScrollWidth } from 'utils/utils';
import { tooltipRender } from '_cus_utils/render';

@Form.create()
export default class PayTradeList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    const {
      form,
      bidManagementListModal,
    } = this.props;

    const {
      payTradeDataSource,
      payTradePagination,
    } = bidManagementListModal;

    const columns = [
      {
        title: intl.get(`spfmhk.trade.field.TradeName`).d('贸易商名称'),
        dataIndex: 'refTradeName',
        width: 250,
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.field.PayStatus`).d('付款状态'),
        dataIndex: 'statusMeaning',
        width: 150,
        render: tooltipRender,
      },
    ];

    return (
      <>
        <CusTable
          rowKey="rowKey"
          columns={columns}
          dataSource={payTradeDataSource}
          pagination={payTradePagination}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </>
    );
  }
}
