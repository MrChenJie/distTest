/*
 * @Author: huasheng.fang@hand-china.com
 * @Date: 2024-01-06
 * Copyright (c) 2023, All Rights Reserved. 
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import styles from './index.less';
import { numberRender, dateRender } from 'utils/renderer';
import CusSpin from '_cus_components/CusSpin';
import EditTable from '_cus_components/EditTable';
import { tooltipRender } from '_cus_utils/render';
import CusInputNumber from '_cus_components/CusInputNumber';

@Form.create({ fieldNameProp: null })

export default class MaterialDetailList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      singlePurchaseApplicationCusModel,
    } = this.props;

    const { materialDetailList = [] } = singlePurchaseApplicationCusModel;

    const columns = [
      {
        title: intl.get('HKPC.commom.view.title.materialname').d('物料名称'),
        key: 'matName',
        dataIndex: 'matName',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.specification').d('规格型号'),
        key: 'model',
        dataIndex: 'model',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.unit').d('单位'),
        key: 'unit',
        dataIndex: 'unit',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.WinningSupplier').d('中选供应商'),
        key: 'supplierName',
        dataIndex: 'supplierName',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.OrderQuantity').d('下单数量'),
        key: 'orderQuantity',
        dataIndex: 'orderQuantity',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.Selectedamount').d('中选金额'),
        key: 'matSelectedAmount',
        dataIndex: 'matSelectedAmount',
        width: 180,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },
    ].filter(Boolean);

    const tableProps = {
      dataSource: materialDetailList,
      columns,
      rowKey: 'poOrderId',
      scroll: { x: tableScrollWidth(columns) }, // y: 480
      // onChange: onPageChange,
    };

    return (
      <>
        <CusSpin spinning={false}>
          <EditTable {...tableProps} />
        </CusSpin>
      </>
    )
  }
}