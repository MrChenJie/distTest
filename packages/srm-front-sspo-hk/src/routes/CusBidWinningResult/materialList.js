/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2023-11-11 11:37:41
 * Copyright (c) 2023, All Rights Reserved. 
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import styles from './index.less';
import CusSpin from '_cus_components/CusSpin';
import EditTable from '_cus_components/EditTable';
import { tooltipRender } from '_cus_utils/render';
import CusInputNumber from '_cus_components/CusInputNumber';

@Form.create({ fieldNameProp: null })

export default class MaterialList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      dataSource,
      pagination,
      rowSelection,
    } = this.props;

    console.log('this.props', this.props)

    const columns = [
      {
        title: intl.get('bid.bidcommon.view.title.suppliername1').d('物料名称'),
        key: 'materialName',
        dataIndex: 'materialName',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get('bid.bidcommon.view.title.suppliername1').d('规格型号'),
        key: 'specification',
        dataIndex: 'specification',
        width: 180,
      },
      {
        title: intl.get('bid.bidcommon.view.title.suppliername1').d('单位'),
        key: 'unit',
        dataIndex: 'unit',
        width: 180,
      },
      {
        title: intl.get('bid.bidcommon.view.title.supplierna1me').d('数量'),
        key: 'quantityTotal',
        dataIndex: 'quantityTotal',
        width: 180,
      },
      {
        title: intl.get('bid.bidcommon.view.title.supplierna1me').d('下单数量'),
        key: 'ordersNumber',
        dataIndex: 'ordersNumber',
        width: 180,
        render:(_, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <Form.Item>
              {getFieldDecorator('ordersNumber', {
                initialValue: record.ordersNumber,
                rules: [
                  {
                    validator: (rule, value, callback) => {
                      if(value > record.availableQuantity) {
                        callback(
                          new Error(
                            intl
                              .get('demo')
                              .d('余额不足,剩余') + record.availableQuantity
                          )
                        );
                      } else {
                        callback();
                      }
                    }
                  }
                ]
              })(
                <CusInputNumber
                  min={0}
                  precision={4}
                  allowThousandth
                  className="cus-input-money"
                  onChange={(value) => {
                    record.ordersNumber = value
                  }}
                />
              )}
            </Form.Item>
          );
        }
      },
      {
        title: intl.get('bid.bidcommon.view.title.suppliernam1e').d('报价货币'),
        key: 'currency',
        dataIndex: 'currency',
        width: 180,
        render: tooltipRender
      },
    ].filter(Boolean);

    const tableProps = {
      dataSource: dataSource,
      columns,
      pagination: pagination,
      rowSelection: rowSelection,
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