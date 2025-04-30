/**
 * @Description: 最新轮次报价
 * @date 2022-02-16
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
 import React, { Component } from 'react';
 import { Table } from 'hzero-ui';
 import CusTable from '_cus_components/CusTable';
 import intl from 'utils/intl';
 import { isEmpty } from 'lodash';
 import { numberRender } from 'utils/renderer';
  
 export default class NewPrice extends Component {
   state = {};

     /**
   * 渲染数据源
   */
  renderDataSource(dataSource) {
    let newDataSource = [];
    newDataSource = dataSource.map((item, i) => {
      const { supplierQuotationPriceList = [], ...otherItem } = item;
      let elementValue = {};
      supplierQuotationPriceList.forEach(ele => {
        elementValue = {
          ...elementValue,
          [`supplierPrice${ele.supplierUserId}`]: ele.highestQuotation
            ? ele.highestQuotation
            : '-',
        };
      });
      return {
        ...otherItem,
        ...elementValue,
      };
    });
    return newDataSource;
  }

     /**
   * 渲染列
   */
  renderColumns(dataSource) {
    let columns = [];
    if (!isEmpty(dataSource)) {
      const { supplierQuotationPriceList } = dataSource[0];
      columns = supplierQuotationPriceList.map((ele, i) => {
        return {
          title: ele.highestSupplierName,
          dataIndex: `supplierPrice${ele.supplierUserId}`,
          // align: 'right',
          width:200,
          render: (_ ,record) => {
            return (
              <div style={{ textAlign: 'right' }}>
                {numberRender(supplierQuotationPriceList[i].highestQuotation, 2)}
              </div>
            )
          }
          // render: (_ ,record) => record.supplierQuotationPriceList  ?(
          //   <span>
          //     {record.supplierQuotationPriceList[i].highestQuotation}
          //   </span>
          // ):(
          //   <span>
          //     -
          //   </span>
          // )
        };
      });
    }
    return [
      {
        title: '',
        dataIndex: 'itemName',
        width:200,
        render: (_, record) =>
          // record.itemCode !== null ? (
          //   <span>
          //     {record.itemCode} - {record.itemName}
          //   </span>
          // ) : (
          //   <span>{record.itemName}</span>
          // ),
          record.itemName === '汇总'?(
            <span>{intl
              .get(`bid.bidcommon.view.title.pricesummary`)
              .d('汇总')}</span>
          ) : (
            <span>{record.itemName}</span>

          )
          
      },
      ...columns,
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.lowestPrice').d('最低价'),
        dataIndex: 'lowestQuotationPrice',
        // align: 'right',
        width:200,
        render: (_, record) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(record.lowestQuotationPrice, 2)}</div>;
        }
      },
    ];
  }
 
   render() {
     const { dataSource = [], loading = false } = this.props;

     return (
       <div className="search-table">
         <CusTable
           bordered
           rowKey="itemId"
           dataSource={this.renderDataSource(dataSource)}
           pagination={false}
           loading={loading}
           columns={this.renderColumns(dataSource)}
         />
       </div>
     );
   }
 }
 