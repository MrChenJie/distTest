import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { tableScrollWidth } from 'utils/utils';

import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'enquiryPriceId';
export default class ClauseDataTable extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      rfqResponseVisible: false,
      exportModalVisible: false,
      nowRecord: {},
    };
  }

  @Bind()
  clearState() {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    });
  }

  render() {
    const { onChange = (e) => e, getQueryParams = (e) => e, purchaseResultModel } = this.props;
    const {
      selectedRows,
      selectedRowKeys,
      rfqResponseVisible,
      nowRecord,
      exportModalVisible = false,
    } = this.state;
    const { cmhkPrFourthClause = [] } = purchaseResultModel;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.DeliveryTerms`).d('发货条款'),
        dataIndex: 'deliveryTerms',
        width: 180,
      },
      {
        title: intl.get(`${promptCode}.view.title.PaymentTerms`).d('付款条款'),
        dataIndex: 'paymentTerms',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.Paymentmethod`).d('付款方式'),
        dataIndex: 'paymentMethod',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.PaymentArrangement`).d('付款安排'),
        dataIndex: 'paymentArrangement',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.view.title.Quotationnumber`).d('报价单编号'),
        dataIndex: 'quotationNumber',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.view.title.WarrantyPeriod`).d('质保期'),
        dataIndex: 'warrantyPeriod',
        width: 120,
      },
    ];

    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onSelect: this.onSelect,
      onSelectAll: this.onSelectAll,
    };
    return (
      <React.Fragment>
        <CusTable
          rowKey={ROW_KEY}
          dataSource={cmhkPrFourthClause}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={false}
          onChange={onChange}
          rowSelection={false}
        />
      </React.Fragment>
    );
  }
}
