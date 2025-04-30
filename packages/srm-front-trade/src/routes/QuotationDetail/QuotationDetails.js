/**
 * QuotationDetails - 竞价-贸易商报价明细
 * @date: 2024-07-26
 * @author: cj <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2024, Hand
 */
import React, { PureComponent } from 'react';
import { tableScrollWidth } from 'utils/utils';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import EditTable from '_cus_components/EditTable';
import CusInputNumber from '_cus_components/CusInputNumber';
import { tooltipRender } from '_cus_utils/render';
import { numberRender } from 'utils/renderer';
import './index.less';

@Form.create()
class QuotationDetails extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      quotationDetailModal,
      isFailWinValue,
    } = this.props;
    const { AppraisalDataSource = [], AssessFormSource } = quotationDetailModal;
    // console.log('AppraisalDataSource', AppraisalDataSource)
    let filteredColumns = [];
    let lists = [];
    let newDataList = [];
    AppraisalDataSource.map((item) => {
      if (item.cmhkActTradeQuoteList.length > 0) {
        lists.push(item.cmhkActTradeQuoteList)
      }
    })
    lists.map((items) => {
      newDataList.push(items)
    })
    console.log('lists', lists)
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
    const rowSpans = getRowSpans(AppraisalDataSource, 'id');
    let columns = [];
    if (newDataList.length > 0) {
      columns = [
        {
          dataIndex: 'lineNum',
          title: intl.get(`spfmhk.trade.field.ProductName`).d('商品名称'),
          width: 260,
          fixed: 'left',
          className: 'merge-border-class',
          render: (_, record, index) => {
            return {
              children: <span>{tooltipRender(record.matName)}</span>,
              props: { rowSpan: rowSpans[index] },
            }
          }
        },
        {
          dataIndex: 'orderSeq',
          title: intl.get(`spfmhk.trade.field.ProductSpecif`).d('规格型号'),
          width: 120,
          fixed: 'left',
          className: 'merge-border-class',
          render: (_, record, index) => {
            return {
              children: <span>{tooltipRender(record.matModel)}</span>,
              props: { rowSpan: rowSpans[index] },
            }
          }
        },
        {
          dataIndex: 'selected',
          title: intl.get(`spfmhk.trade.field.ProductCurrency`).d('币别'),
          width: 80,
          fixed: 'left',
          className: 'merge-border-class',
          render: (_, record, index) => {
            return {
              children: <span>{tooltipRender(record.currency)}</span>,
              props: { rowSpan: rowSpans[index] },
            }
          }
        },
        {
          dataIndex: 'operator',
          title: intl.get(`spfmhk.trade.field.ProductCost`).d('成本'),
          width: 150,
          required: isFailWinValue === 'N',
          fixed: 'left',
          className: 'merge-border-class',
          render: (_, record, index) => {
            return {
              children: (AssessFormSource?.winStatus === 'Draft' && isFailWinValue === 'N') ? <Form.Item>
                {record.$form && record.$form.getFieldDecorator('cost', {
                  initialValue: record.cost,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.trade.field.ProductCost`).d('成本'),
                      }),
                    },
                  ],
                })(
                  <CusInputNumber
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    // defaultValue={Number(record.cost).toFixed(2)}
                    onChange={(value) => {
                      record.cost = value
                    }}
                    precision={2}
                    min={0}
                    className="cus-input-money"
                  />
                )}
              </Form.Item>
              :
              <div style={{textAlign: 'right'}}>
                {numberRender(isFailWinValue === 'N' ? record.cost : null, 2)}
              </div>,
              props: { rowSpan: rowSpans[index] },
            }
          }
        },
        {
          dataIndex: 'operation',
          title: intl.get(`spfmhk.trade.field.ProductBidAvail`).d('可投标总数'),
          width: 105,
          fixed: 'left',
          className: 'merge-border-class',
          render: (_, record, index) => {
            return {
              children: <span>{tooltipRender(record.totals)}</span>,
              props: { rowSpan: rowSpans[index] },
            }
          }
        },
      ];
      if (AppraisalDataSource[0].cmhkActTradeQuoteList.length > 0) {
        // 遍历每个商品条目，为每个商品生成行和对应的供应商子表头
        AppraisalDataSource[0].cmhkActTradeQuoteList.map((supplier, k) => {
          columns.push({
            dataIndex: `${supplier.tradeName}${k}`, // 使用唯一的dataIndex
            title: supplier.tradeName,
            width: 180,
            children: [
              {
                title: intl.get(`spfmhk.trade.field.TradeSinBid`).d('贸易商单一报价'),
                dataIndex: `${supplier.quoteHkd}${k}`,
                width: 150,
                className: 'border-class',
                render: (_, record) => {
                  return (
                    <div style={{ textAlign: 'right' }}>{numberRender(record.cmhkActTradeQuoteList[k]?.quoteHkd, 2)}</div>
                  )
                }
              },
              {
                title: intl.get(`spfmhk.trade.field.TradeBidQuan`).d('贸易商投标数量'),
                dataIndex: `${supplier.quantity}${k}`,
                width: 150,
                className: 'border-class',
                render: (_, record) => {
                  return (
                    <div>{numberRender(record.cmhkActTradeQuoteList[k]?.quantity, 0)}</div>
                  )
                }
              },
              {
                title: intl.get(`spfmhk.trade.field.TradeBidAmount`).d('贸易商投标金额'),
                dataIndex: `${supplier.quoteTotalHkd}${k}${k}`,
                width: 180,
                className: 'border-class',
                render: (_, record) => {
                  return (
                    <div style={{ textAlign: 'right' }}>{numberRender(record.cmhkActTradeQuoteList[k]?.quoteTotalHkd, 2)}</div>
                  )
                }
              }
            ]
          })
        })
      }
    }
    // 最后要记得过滤掉空值的列
    filteredColumns = columns.filter(column => column);

    const tableProps = {
      dataSource: AppraisalDataSource,
      columns: filteredColumns,
      pagination: false,
      rowKey: 'rowKey',
      scroll: { x: tableScrollWidth(columns) },
    };
    return (
      <>
        <EditTable {...tableProps} />
      </>
    );
  }
}

export default QuotationDetails;