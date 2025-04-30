/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2023-11-11 11:37:41
 * Copyright (c) 2023, All Rights Reserved. 
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { numberRender } from 'utils/renderer';
import styles from './index.less';
import CusSpin from '_cus_components/CusSpin';
import EditTable from '_cus_components/EditTable';
import { tooltipRender } from '_cus_utils/render';
import CusInputNumber from '_cus_components/CusInputNumber';
import CusInput from '_cus_components/CusInput';

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
      contractBidWinningResult,
      lineRecord,
    } = this.props;

    const { infoSource = {} } = contractBidWinningResult;

    console.log('this.props', this.props)

    const columns = [
      {
        title: intl.get('HKPC.commom.view.title.materialname').d('物料名称'),
        key: 'materialName',
        dataIndex: 'materialName',
        width: 180,
        fixed: true,
        render: tooltipRender,
      },
      {
        title: intl.get('HKPC.commom.view.title.specification').d('规格型号'),
        key: 'specification',
        dataIndex: 'specification',
        width: 180,
      },
      {
        title: intl.get('HKPC.commom.view.title.unit').d('单位'),
        key: 'unit',
        dataIndex: 'unit',
        width: 180,
      },
      {
        title: intl.get('HKPC.commom.view.title.quantity').d('数量'),
        key: 'quantityTotal',
        dataIndex: 'quantityTotal',
        width: 180,
      },
      {
        title: intl.get('HKPC.commom.view.title.OrderQuantity').d('下单数量'),
        key: 'ordersNumber',
        dataIndex: 'ordersNumber',
        required: true,
        width: 180,
        render:(_, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            (record.isQuote === 'N' || (infoSource?.isFrameAgreement === 'Y' && lineRecord.beSelectedMoneyBefore) || lineRecord.isBeChosen === 'Standby') ? <> </>
            :
            <Form.Item>
              {getFieldDecorator('ordersNumber', {
                initialValue: record.ordersNumber,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('HKPC.commom.view.title.OrderQuantity').d('下单数量'),
                    }),
                  },
                  {
                    validator: (rule, value, callback) => {
                      if(infoSource?.isFrameAgreement === 'N') {
                        if(value > record.availableQuantity) {
                          callback(
                            new Error(
                              intl
                                .get('HKPC.commom.view.title.insufficientbalance')
                                .d('余额不足,剩余') + record.availableQuantity
                            )
                          );
                        } else {
                          callback();
                        }
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
        title: intl.get('HKPC.commom.view.title.unitpriceoportal').d('单价'),
        key: 'afterTaxPerPrice',
        dataIndex: 'afterTaxPerPrice',
        required: true,
        width: 180,
        render:(_, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            (record.isQuote === 'N' || (infoSource?.isFrameAgreement === 'Y' && lineRecord.beSelectedMoneyBefore) || lineRecord.isBeChosen === 'Standby') ?
              <div style={{textAlign: 'right'}}>
                {tooltipRender((numberRender(record.afterTaxPerPrice, 2)))}
              </div>
            :
            (
              record.addStatus == -1 ? <Form.Item>
                {getFieldDecorator('afterTaxPerPrice', {
                  initialValue: record.afterTaxPerPrice,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('HKPC.commom.view.title.unitpriceoportal').d('单价'),
                      }),
                    },
                  ]
                })(
                  <CusInputNumber
                    precision={2}
                    allowThousandth
                    className="cus-input-money"
                    onChange={(value) => {
                      record.afterTaxPerPrice = value
                    }}
                  />
                )}
              </Form.Item>
            : 
              <div style={{textAlign: 'right'}}>
                {tooltipRender((numberRender(record.afterTaxPerPrice, 2)))}
              </div>
            )
          )
        }
      },
      {
        title: intl.get('HKPC.commom.view.title.Selectedamount').d('中选金额'),
        key: 'afterTaxPrice',
        dataIndex: 'afterTaxPrice',
        width: 180,
        render: (_, record) => {
          record.afterTaxPrice = record.afterTaxPerPrice * record.ordersNumber;
          return (
            <div style={{ textAlign: 'right' }}>
              {tooltipRender(numberRender(record.afterTaxPrice, 2))}
            </div>
          );
        },
      },
      {
        title: intl.get('HKPC.commom.view.title.WarrantyPeriod').d('质保期'),
        key: 'warranty',
        dataIndex: 'warranty',
        width: 180,
        required: true,
        render: (_, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            (record.isQuote === 'N' || (infoSource?.isFrameAgreement === 'Y' && lineRecord.beSelectedMoneyBefore) || lineRecord.isBeChosen === 'Standby') ?
              tooltipRender(record.warranty)
            :
            (
              record.addStatus == -1 ? <Form.Item>
              {getFieldDecorator('warranty', {
                initialValue: record.warranty,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('HKPC.commom.view.title.WarrantyPeriod').d('质保期'),
                    }),
                  },
                ]
              })(
                <CusInput.TextArea
                  autoChangeSize
                  onChange={(e) => {
                    record.warranty = e.target.value
                  }}
                />
              )}
              </Form.Item>
            : 
              tooltipRender(record.warranty)
            )
          )
        }
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