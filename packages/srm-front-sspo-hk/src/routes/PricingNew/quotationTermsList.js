/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2023-11-10 19:58:42
 * Copyright (c) 2023, All Rights Reserved. 
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import styles from './index.less';
import CusSpin from '_cus_components/CusSpin';
import CusTable from '_cus_components/CusTable';
import { tooltipRender } from '_cus_utils/render';

@Form.create({ fieldNameProp: null })

export default class QuotationTermsList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      pricingModels,
      onPageChange = (e) => e,
    } = this.props;

    const {
      quotationTermsSource = [],
      quotationTermsPagination = {}, 
    } = pricingModels;

    console.log('pricingModels', quotationTermsSource, quotationTermsPagination)

    const columns = [
      {
        title: intl.get('bid.bidcommon.view.title.suppliername').d('供应商名称'),
        key: 'supplierName',
        dataIndex: 'supplierName',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.DeliveryTerms').d('发货条款'),
        key: 'deliveryClauseMeaning',
        dataIndex: 'deliveryClauseMeaning',
        width: 180,
      },
      {
        title: intl.get('HKPC.commom.view.title.PaymentTerms').d('付款条款'),
        key: 'paymentClauseMeaning',
        dataIndex: 'paymentClauseMeaning',
        width: 180,
      },
      {
        title: intl.get('HKPC.commom.view.title.Paymentmethod').d('付款方式'),
        key: 'paymentMethodMeaning',
        dataIndex: 'paymentMethodMeaning',
        width: 180,
      },
      {
        title: intl.get('HKPC.commom.view.title.PaymentArrangement').d('付款安排'),
        key: 'paymentArrangement',
        dataIndex: 'paymentArrangement',
        width: 180,
      },
      {
        title: intl.get('HKPC.commom.view.title.Quotationnumber').d('报价单编号'),
        key: 'quotationNumber',
        dataIndex: 'quotationNumber',
        width: 180,
        render: tooltipRender
      },
      {
        title: intl.get('HKPC.commom.view.title.WarrantyPeriod').d('质保期'),
        key: 'warranty',
        dataIndex: 'warranty',
        width: 110,
      },
    ].filter(Boolean);

    const tableProps = {
      dataSource: quotationTermsSource,
      columns,
      pagination: quotationTermsPagination,
      rowKey: 'supplierId',
      scroll: { x: tableScrollWidth(columns) }, // y: 480
      onChange: onPageChange,
    };

    return (
      <>
        <CusSpin spinning={false}>
          <CusTable {...tableProps} />
        </CusSpin>
      </>
    )
  }
}