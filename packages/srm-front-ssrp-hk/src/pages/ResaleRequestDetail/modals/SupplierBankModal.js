/*
 * @Description: 银行信息 - 供应商银行信息
 * @LastEditors: 何智鹏 <he.zhipeng@hand-china.com>
 * @Date: 2023-08-03 18:10:17
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { Component } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';

export default class index extends Component {
  /**
   * @name: 定义 - Table列元素
   * @return {array} Table列数据集
   */
  get columns() {
    return [
      {
        title: intl.get(`spcm.paymentRequest.view.detail.invoice.termsDate`).d('发票到期日'),
        dataIndex: 'termsDate',
        width: 120,
      },
    ];
  }

  render() {
    const dataSource = [];
    return (
      <>
        <CusTable
          rowKey="TODO" // TODO
          columns={this.columns}
          dataSource={dataSource}
          scroll={{ x: tableScrollWidth(this.columns) }}
        />
      </>
    );
  }
}
