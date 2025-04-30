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
import { numberRender } from 'utils/renderer';

@Form.create()
export default class DetailList extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      form,
      bidManagementListModal,
      onChange = (e) => e,
    } = this.props;

    const {
      productDetailSource,
      productDetailPagination,
    } = bidManagementListModal;

    const columns = [
      {
        title: intl.get(`spfmhk.trade.field.ProductName`).d('商品名称'),
        dataIndex: 'matName',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.field.ProductSpecif`).d('型号'),
        dataIndex: 'matModel',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.field.ProductBidRule`).d('商品投标规则'),
        dataIndex: 'quoteRuleMeaning',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.field.ProductBidAvail`).d('可投标总数'),
        dataIndex: 'totals',
        width: 160,
        render: (_, record) => {
          return (
            <div>{numberRender(record.totals, 0)}</div>
          )
        },
      },
    ];

    return (
      <>
        <CusTable
          rowKey="rowKey"
          columns={columns}
          dataSource={productDetailSource}
          pagination={productDetailPagination}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
