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
import CusInput from '_cus_components/CusInput';
import { tooltipRender } from '_cus_utils/render';
import { numberRender } from 'utils/renderer';
import CusInputNumber from '_cus_components/CusInputNumber';

@Form.create({ fieldNameProp: null })
export default class MaterialList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { dataSource, pagination, rowSelection, state, purchaseApplicationCusModel, isEdit } = this.props;
    const { priceBasicInfo } = purchaseApplicationCusModel;
    console.log('priceBasicInfo', priceBasicInfo)

    const columns = [
      {
        title: intl.get('HKPC.commom.view.title.materialname').d('物料名称'),
        key: 'matName',
        dataIndex: 'matName',
        width: 180,
        render: tooltipRender,
        fixed: true,
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
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.quantity').d('数量'),
        key: 'quantity',
        dataIndex: 'quantity',
        width: 130,
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.OrderQuantity').d('下单数量'),
        key: 'orderQuantity',
        dataIndex: 'orderQuantity',
        required: true,
        width: 180,
        render: (_, record) => {
          const { getFieldDecorator } = record.$form;
          return !isEdit || record.isQuote === 'Y' ? (
            <Form.Item>
              {getFieldDecorator(`orderQuantity`, {
                initialValue: record.orderQuantity,
                rules: [
                  {
                    required: priceBasicInfo?.isFrameAgreement === 'N',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('HKPC.commom.view.title.OrderQuantity').d('下单数量'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => {
                      if(priceBasicInfo?.isFrameAgreement === 'N') {
                        if (Number(value) > Number(record.surplusQuantity)) {
                          callback(
                            new Error(
                              intl
                                .get('HKPC.commom.view.title.insufficientbalance')
                                .d('余额不足,剩余') + record.surplusQuantity
                            )
                          );
                        } else {
                          callback();
                        }
                      } else {
                        callback();
                      }
                    },
                  },
                ],
              })(
                <CusInputNumber
                  min={0}
                  precision={4}
                  className="cus-input-money"
                  onChange={(value) => {
                    record.orderQuantity = value;
                    record.matSelectedAmountOc =
                      parseInt(value) *
                      parseFloat(record.unitPrice)
                  }}
                />
              )}
            </Form.Item>
          ) : (
            tooltipRender(record.orderQuantity)
          );
        },
      },
      {
        title: intl.get('HKPC.commom.view.title.UnitPrice').d('单价'),
        key: 'unitPrice',
        width: 180,
        dataIndex: 'unitPrice',
        required: true,
        render: (_, record) => {
          return (!isEdit || record.isQuote === 'Y') && record.refMatId === -1 ? (
            <Form.Item>
              {record.$form.getFieldDecorator('unitPrice', {
                initialValue: record.unitPrice,
                rules: [
                  {
                    required: priceBasicInfo?.isFrameAgreement === 'N',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('HKPC.commom.view.title.UnitPrice').d('单价'),
                    }),
                  },
                ],
              })(
                <CusInputNumber
                  min={0}
                  precision={2}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  className='cus-input-money'
                  onChange={(value) => {
                    record.unitPrice = value;
                    record.matSelectedAmountOc =
                    parseInt(record.orderQuantity) *
                    parseFloat(value)
                  }}
                />
              )}
            </Form.Item>
          ) : (
            <div style={{textAlign: 'right'}}>
              {tooltipRender(numberRender(record.unitPrice, 2))}
            </div>
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.Selectedamount').d('中选金额'),
        key: 'matSelectedAmountOc',
        dataIndex: 'matSelectedAmountOc',
        width: 180,
        render: (record) => {
          return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
        },
      },

      {
        title: intl.get('HKPC.commom.view.title.WarrantyPeriod').d('质保期'),
        key: 'warrantyPeriod',
        dataIndex: 'warrantyPeriod',
        required: true,
        width: 180,
        render: (_, record) => {
          return (!isEdit || record.isQuote === 'Y') && record.refMatId === -1 ? (
            <Form.Item>
              {record.$form.getFieldDecorator('warrantyPeriod', {
                initialValue: record.warrantyPeriod,
                rules: [
                  {
                    required: priceBasicInfo?.isFrameAgreement === 'N',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('HKPC.commom.view.title.WarrantyPeriod').d('质保期'),
                    }),
                  },
                ],
              })(
                <CusInput.TextArea
                  autoChangeSize
                  onChange={(e) => {
                    record.warrantyPeriod = e.target.value
                  }}
                />
              )}
            </Form.Item>
          ) : (
            tooltipRender(record.warrantyPeriod)
          )
        }
      },
    ].filter(Boolean);

    const tableProps = {
      dataSource: dataSource,
      columns,
      pagination: false,
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
    );
  }
}
