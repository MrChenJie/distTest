/** -- 竞价-分配中标数量
 * @date: 2024-07-26
 * @author: cj <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { numberRender } from 'utils/renderer';
import intl from 'utils/intl';
import { tableScrollWidth, getEditTableData } from 'utils/utils';
import { tooltipRender } from '_cus_utils/render';
import EditTable from '_cus_components/EditTable';
import CusInputNumber from '_cus_components/CusInputNumber';
import { Bind } from 'lodash-decorators';
import './index.less';

let newList = []
@Form.create()
export default class AllocateWinBid extends Component {
  constructor(props) {
    super(props);
    props.onRef(this)
    this.state = {};
  }

  // 父组件调用的保存分配数量接口
  @Bind()
  saveWin = (callback) => {
    const { dispatch, isFailWinValue } = this.props;
    const allocateWinList = getEditTableData(newList, ['rowKey']);
    if(allocateWinList.length > 0) {
      const params = allocateWinList.map(item => ({
        refHeadId: item.refHeadId,
        refMatId: item.refMatId,
        refQuoteId: item.refQuoteId,
        refTradeId: item.refTradeId,
        quoteHkd: item.quoteHkd,
        quantity: item.quantity,
        orderQuantity: isFailWinValue === 'N' ? (item.orderQuantity || 0) : 0,
        orderQuoteHkd: isFailWinValue === 'N' ? (Number(item.orderQuantity * item.quoteHkd) || 0) : 0
      }))
      console.log('父组件调用', params);
      dispatch({
        type: 'quotationDetailModal/saveAllocateWin',
        // payload: (params || []).filter(item => (item.orderQuantity || item.orderQuantity == 0))
        payload: {
          list: params,
          isFailWinValue,
        },
      }).then((res) => {
        if (typeof callback === 'function') {
          callback(res);
        }
      })
    } else {
      CusNotification.warning({
        message: intl.get('demoTitle1').d('请完善分配数量')
      })
    }
  }

    // 父组件调用的提交分配数量接口
    @Bind()
    submitWin = (callback) => {
      const { dispatch, isFailWinValue } = this.props;
      const allocateWinList = getEditTableData(newList, ['rowKey']);
      if(allocateWinList.length > 0) {
        const params = allocateWinList.map(item => ({
          refHeadId: item.refHeadId,
          refMatId: item.refMatId,
          refQuoteId: item.refQuoteId,
          refTradeId: item.refTradeId,
          quoteHkd: item.quoteHkd,
          quantity: item.quantity,
          orderQuantity: isFailWinValue === 'N' ? (item.orderQuantity || 0) : 0,
          orderQuoteHkd: isFailWinValue === 'N' ? (Number(item.orderQuantity * item.quoteHkd) || 0) : 0
        }))
        console.log('父组件调用', params);
        dispatch({
          type: 'quotationDetailModal/submitAllocateWin',
          payload: {
            list: params,
            isFailWinValue,
          }
        }).then((res) => {
          if (typeof callback === 'function') {
            callback(res);
          }
        })
      } else {
        CusNotification.warning({
          message: intl.get('demoTitle1').d('请完善分配数量')
        })
      }
    }

  render() {
    const {
      dispatch,
      quotationDetailModal,
      isFailWinValue,
    } = this.props;
    const { AllocateDataSource = [], AssessFormSource } = quotationDetailModal;
    let newDataSource = [];
    if (AllocateDataSource) {
        AllocateDataSource.map((e, j) => {
        e.tradeWinList.map((i, k) => {
            newDataSource = [
                ...newDataSource,
                {
                    ...i,
                    ...e,
                    dataSourceIndex: j,
                    _status: 'update',
                },
            ];
        });
      });
    }
    console.log('newDataSource', AllocateDataSource, newDataSource,)
    newList = newDataSource;
    const getRowSpans = (arr, key) => {
        let sameValueLength = 0;
        const rowSpans = [];
        for (let i = arr.length - 1; i >= 0; i--) {
          if (i === 0) {
            rowSpans[i] = sameValueLength + 1;
            continue;
          }
          if (arr[i][key] === arr[i - 1][key]) {
            rowSpans[i] = 0;
            sameValueLength++;
          } else {
            rowSpans[i] = sameValueLength + 1;
            sameValueLength = 0;
          }
        }
        return rowSpans;
    };
    const rowSpans = getRowSpans(newDataSource, 'rowKey');
    const columns = [
      {
        title: intl.get('spfmhk.trade.field.ProductName').d('商品名称'),
        key: 'operator',
        dataIndex: 'operator',
        width: 275,
        fixed: 'left',
        render: (_, record, index) => {
          // console.log('index', index)
            const obj = {
              children: tooltipRender(record.matName),
              props: {
                className: 'merge-border-class',
              },
            };
            obj.props.rowSpan = rowSpans[index];
            return obj;
        },
      },
      {
        title: intl.get('spfmhk.trade.field.ProductSpecif').d('型号'),
        key: 'lineNum',
        dataIndex: 'lineNum',
        className:'borderRightBolder',
        width: 120,
        render: (_, record, index) => {
            const obj = {
              children: tooltipRender(record.matModel),
              props: {
                className: 'merge-border-class',
              },
            };
            obj.props.rowSpan = rowSpans[index];
            return obj;
        },
      },
      {
        title: intl.get('spfmhk.trade.field.ProductCurrency').d('币别'),
        key: 'orderSeq',
        dataIndex: 'orderSeq',
        className:'borderRightBolder',
        width: 80,
        render: (_, record, index) => {
            const obj = {
              children: tooltipRender(record.currency),
              props: {
                className: 'merge-border-class',
              },
            };
            obj.props.rowSpan = rowSpans[index];
            return obj;
        },
      },
      {
        title: intl.get('spfmhk.trade.field.ProductBidAvail').d('可投标总数'),
        key: 'operation',
        dataIndex: 'operation',
        className:'borderRightBolder',
        width: 100,
        render: (_, record, index) => {
            const obj = {
              children: tooltipRender(record.totals),
              props: {
                className: 'merge-border-class',
              },
            };
            obj.props.rowSpan = rowSpans[index];
            return obj;
        },
      },
      {
        title: intl.get('spfmhk.trade.field.TradeName').d('贸易商'),
        key: 'tradeName',
        dataIndex: 'tradeName',
        className:'borderRightBolder',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get('spfmhk.trade.field.TradeSinBid').d('贸易商单一出价'),
        key: 'quoteHkd',
        dataIndex: 'quoteHkd',
        className:'borderRightBolder',
        width: 150,
        render: (_, record) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(Number(record.quoteHkd).toFixed(2), 2)}</div>;
        },
      },
      {
        title: intl.get('spfmhk.trade.field.TradeBidQuan').d('报价数量'),
        key: 'quantity',
        className:'borderRightBolder',
        width: 100,
        dataIndex: 'quantity',
      },
      {
        title: intl.get('spfmhk.trade.field.TradeBidWinQuan').d('中标数量'),
        key: 'orderQuantity',
        dataIndex: 'orderQuantity',
        className:'borderRightBolder',
        width: 180,
        render: (_, record) => {
          return (
            (AssessFormSource?.winStatus === 'Draft' && isFailWinValue === 'N') ? <Form.Item>
                {record.$form && record.$form.getFieldDecorator('orderQuantity', {
                  initialValue: record.orderQuantity,
                  rules: [
                    // {
                    //   required: true,
                    //   message: intl.get('hzero.common.validation.notNull', {
                    //     name: intl.get(`spfmhk.trade.field.TradeBidWinQuan`).d('中标数量'),
                    //   }),
                    // },
                    {
                      validator: (rule, value, callback) => {
                        if(value > record.quantity) {
                          callback(intl.get('spfmhk.trade.view.verifytip.winbid').d('中選數量不能大於該貿易商的投標數量'))
                        } else if (value > record.residueTotals) {
                          callback(intl.get('spfmhk.trade.view.verifytip.winbidproduct').d('中選數量不能超過該商品的可投標數量'))
                        } else {
                          callback()
                        }
                      }
                    }
                  ],
                })(
                  <CusInputNumber
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    onChange={(value) => {
                      console.log('record', record);
                      record.tradeWinList?.map((item) => {
                        if(record.refQuoteId === item.refQuoteId) {
                          item.orderQuantity = value
                        }
                      })
                      record.orderQuantity = value;
                      // 计算剩余可投标总数
                      const sumInputs = record.tradeWinList.reduce((acc, obj) => acc + (obj.orderQuantity || 0), 0);
                      record.residueTotals = record.totals - sumInputs + value;
                    }}
                    precision={0}
                    min={0}
                  />
                )}
            </Form.Item>
            :
            numberRender(isFailWinValue === 'N' ? record.orderQuantity : null, 0)
          );
        },
      },
      {
        title: intl.get('spfmhk.trade.field.TradeBidWinAmount').d('中标金额'),
        key: 'orderQuoteHkd',
        dataIndex: 'orderQuoteHkd',
        className:'borderRightBolder',
        width: 150,
        render: (_, record) => {
          return (
            isFailWinValue === 'N' ? <div style={{ textAlign: 'right' }}>
              {numberRender(Number(record.orderQuantity * record.quoteHkd).toFixed(2), 2)}
            </div>
            :
            <div />
          );
        },
      },
    ].filter(Boolean);

    return (
      <div className='editTableClass'>
        <EditTable
          columns={columns}
          rowKey="rowKey"
          dataSource={newDataSource}
          pagination={false}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </div>

    );
  }
}
