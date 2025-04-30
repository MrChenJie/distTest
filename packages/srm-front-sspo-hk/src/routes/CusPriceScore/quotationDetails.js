/**
 * QuotationDetails - 报价详情
 * @date: 2025-03-11
 * @author: cj <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2025, Hand
 */
import React, { PureComponent } from 'react';
import { tableScrollWidth } from 'utils/utils';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import EditTable from '_cus_components/EditTable';
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
      contractTechnicalMerit,
    } = this.props;
    const { AppraisalDataSource = [] } = contractTechnicalMerit;
    console.log('AppraisalDataSource', AppraisalDataSource)
    let filteredColumns = [];
    let lists = [];
    let newDataList = [];
    AppraisalDataSource.map((item) => {
      if (item.supQuoteList.length > 0) {
        lists.push(item.supQuoteList)
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
    const rowSpans = getRowSpans(AppraisalDataSource, 'proPriceConfigId');
    let columns = [];
    if (newDataList.length > 0) {
      columns = [
        {
          dataIndex: 'lineNum',
          title: intl.get(`HKPC.commom.view.title.Procurementcontent`).d('采购内容'),
          width: 260,
          fixed: 'left',
          className: 'merge-border-class',
          render: (_, record, index) => {
            return {
              children: <span>{tooltipRender(record.itemName)}</span>,
              props: { rowSpan: rowSpans[index] },
            }
          }
        },
        {
          dataIndex: 'orderSeq',
          title: intl.get(`HKPC.commom.view.title.specification`).d('规格型号'),
          width: 120,
          fixed: 'left',
          className: 'merge-border-class',
          render: (_, record, index) => {
            return {
              children: <span>{tooltipRender(record.specification)}</span>,
              props: { rowSpan: rowSpans[index] },
            }
          }
        },
        {
          dataIndex: 'selected',
          title: intl.get(`HKPC.commom.view.title.quantity`).d('数量'),
          width: 80,
          fixed: 'left',
          className: 'merge-border-class',
          render: (_, record, index) => {
            return {
              children: <span>{tooltipRender(record.count)}</span>,
              props: { rowSpan: rowSpans[index] },
            }
          }
        },
        {
          dataIndex: 'operation',
          title: intl.get(`HKPC.commom.view.title.unit`).d('计量单位'),
          width: 105,
          fixed: 'left',
          className: 'merge-border-class',
          render: (_, record, index) => {
            return {
              children: <span>{tooltipRender(record.unit)}</span>,
              props: { rowSpan: rowSpans[index] },
            }
          }
        },
      ];
      if (AppraisalDataSource[0].supQuoteList.length > 0) {
        AppraisalDataSource[0].supQuoteList.map((supplier, k) => {
          columns.push({
            dataIndex: `${supplier.supName}${k}`, // 使用唯一的dataIndex
            title: supplier.supName,
            width: 180,
            children: [
              {
                title: intl.get(`HKPC.commom.view.title.UnitPrice`).d('单价(原币)'),
                dataIndex: `${supplier.priceOC}${k}`,
                width: 150,
                className: 'border-class',
                render: (_, record) => {
                  if(!(record?.isSum)) {
                    return (
                      record.supQuoteList[k]?.priceOC ?
                      <div style={{ textAlign: 'right' }}>{numberRender(record.supQuoteList[k]?.priceOC, 2)}</div>
                      :
                      <div style={{ textAlign: 'right' }}>{intl.get('HKPC.commom.view.title.notsubmitquotation').d('未报价')}</div>
                    )
                  }
                }
              },
              {
                title: intl.get(`HKPC.commom.view.title.prcurrency`).d('币种'),
                dataIndex: `${supplier.currency}${k}${k}`,
                width: 120,
                className: 'border-class',
                render: (_, record) => {
                  if(!(record?.isSum)) {
                    return (
                      record.supQuoteList[k]?.currency ?
                      <div >{record.supQuoteList[k]?.currency}</div>
                      :
                      <div >{intl.get('HKPC.commom.view.title.notsubmitquotation').d('未报价')}</div>
                    )
                  }
                }
              },
              {
                title: intl.get(`HKPC.commom.view.title.totalquoteori`).d('报价总金额(原币)'),
                dataIndex: `${supplier.totalPriceOC}${k}${k}`,
                width: 180,
                className: 'border-class',
                render: (_, record) => {
                  return (
                    record.supQuoteList[k]?.totalPriceOC ?
                    <div style={{ textAlign: 'right' }}>{numberRender(record.supQuoteList[k]?.totalPriceOC, 2)}</div>
                    :
                    <div >{intl.get('HKPC.commom.view.title.notsubmitquotation').d('未报价')}</div>
                  )
                }
              },
              {
                title: intl.get(`HKPC.commom.view.title.totalquotehkd`).d('报价总金额(HKD)'),
                dataIndex: `${supplier.totalPriceHKD}${k}${k}`,
                width: 180,
                className: 'border-class',
                render: (_, record) => {
                  return (
                    record.supQuoteList[k]?.totalPriceHKD ?
                    <div style={{ textAlign: 'right' }}>{numberRender(record.supQuoteList[k]?.totalPriceHKD, 2)}</div>
                    :
                    <div >{intl.get('HKPC.commom.view.title.notsubmitquotation').d('未报价')}</div>
                  )
                }
              },
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