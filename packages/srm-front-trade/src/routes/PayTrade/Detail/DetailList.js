/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-31 09:15:29
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import CusTable from '_cus_components/CusTable';
import { tableScrollWidth } from 'utils/utils';
import { tooltipRender } from '_cus_utils/render';
import { numberRender } from 'utils/renderer';

@Form.create()
export default class DetailList extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      form,
      payTradeModal,
      readyOnly = false,
      onChange = (e) => e,
    } = this.props;

    const {
      successBidDetailSource,
      successBidDetailPagination,
    } = payTradeModal;

    console.log('successBidDetailSource', successBidDetailSource);

    const columns = [
      {
        title: intl.get(`spfmhk.trade.field.ProductName`).d('商品名称'),
        dataIndex: 'matName',
        width: 200,
        render: tooltipRender
      },
      {
        title: intl.get(`spfmhk.trade.field.ProductSpecif`).d('型号'),
        dataIndex: 'matModel',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.field.ProductCurrency`).d('币别'),
        dataIndex: 'currency',
        width: 100,
        render: tooltipRender
      },
      {
        title: intl.get(`spfmhk.trade.field.TradeSinBid`).d('贸易商单一出价'),
        dataIndex: 'quoteHkd',
        width: 160,
        render: (_, record) => {
          return (
            <div style={{textAlign: 'right'}}>
              {numberRender(record.quoteHkd, 2)}
            </div>
          )
        }
      },
      {
        title: intl.get('spfmhk.trade.field.TradeBidWinQuan').d('贸易商投标数量'),
        dataIndex: 'orderQuantity',
        width: 160,
        render: (_, record) => {
          return (
            <div>
              {numberRender(record.orderQuantity, 0)}
            </div>
          )
        }
      },
      {
        title: intl.get('spfmhk.trade.field.TradeBidWinAmount').d('贸易商投标总金额'),
        dataIndex: 'orderQuoteHkd',
        width: 160,
        render: (_, record) => {
          return (
            <div style={{textAlign: 'right'}}>
              {numberRender(record.orderQuoteHkd, 2)}
            </div>
          )
        }
      },
    ];

    return (
      <>
        <CusTable
          rowKey="rowKey"
          columns={columns}
          dataSource={successBidDetailSource}
          pagination={successBidDetailPagination}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
