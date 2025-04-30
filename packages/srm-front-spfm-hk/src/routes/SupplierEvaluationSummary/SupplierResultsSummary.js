/**
 * SupperlierResultsSummary - 供应商考列表结果展示
 * @date: 2022-9-06
 * @author: jinkai.lu
 * @version: 0.0.1
 */
import React, { PureComponent } from 'react';
import { tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import CusTable from '_cus_components/CusTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';

@formatterCollections({ code: ['spfmhk.supplier'] })

export default class SupplierResultsSummary extends PureComponent {

  constructor(props) {
    super(props);
  }

  @Bind()
  pushRouter(record) {
    window.open(`/pub/spfm-hk/supplier/supplier-evaluation-summary/collect-detail?id=${record.id}`);
  }

  render() {
    const { rowSelection, onChange, loading, pagination, dataSource, rowKey } = this.props;

    const columns = [
      {
        title: intl.get(`spfmhk.supplier.basic.info.sumOrder.No`).d('汇总单号'),
        dataIndex: 'gatNo',
        ellipsis: true,
        width: 120,
        render: (val, record, index) => {
          return (
            <a onClick={() => this.pushRouter(record)}>{val}</a>
          )
        }
      },
      {
        title: intl.get(`spfmhk.supplier.view.table.supplier.num`).d('供应商编号'),
        dataIndex: 'supplierNumber',
        ellipsis: true,
        width: 200,
      },
      {
        title: intl.get(`spfmhk.supplier.field.company.name.en`).d('公司名称（英文）'),
        dataIndex: 'companyNameEn',
        ellipsis: true,
        width: 200,
      },
      {
        title: intl.get(`spfmhk.supplier.field.company.name.cn`).d('公司名称（中文）'),
        dataIndex: 'companyNameCh',
        ellipsis: true,
        width: 120,
      },
      {
        title: intl.get(`spfmhk.supplier.field.info.reviewYear`).d('评审年度'),
        dataIndex: 'revYear',
        ellipsis: true,
        width: 120,
      },
      {
        title: intl.get(`spfmhk.supplier.field.info.reviewQuater`).d('评审季度'),
        dataIndex: 'revQuarterMeaning',
        ellipsis: true,
        width: 225,
      },
      {
        title: intl.get(`spfmhk.supplier.basic.info.supplierGrade`).d('供应商等级'),
        dataIndex: 'revGrade',
        ellipsis: true,
        width: 120,
      },
      {
        title: intl.get(`spfmhk.supplier.basic.info.classDFrequency`).d('E级频次'),
        dataIndex: 'eFrequency',
        ellipsis: true,
        width: 120,
      },
      {
        title: intl.get(`spfmhk.supplier.basic.info.sumScore.Date`).d('评分汇总日期'),
        dataIndex: 'gatTime',
        ellipsis: true,
        width: 120,
      },
    ];

    return (
      <>
        <CusTable
          bordered
          loading={loading}
          pagination={pagination}
          columns={columns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
          rowKey={rowKey}
        />
      </>
    )
  }
}
