/**
 * SupperlierResults - 供应商考列表结果展示
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

@formatterCollections({ code: ['spfmhk.supplier'] })

export default class SupperlierResults extends PureComponent {

  constructor(props) {
    super(props);
  }

  @Bind()
  pushRouter(record) {
    const { caseId } = record;
    window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${caseId}`);
  }

  render() {
    const { rowSelection, onChange, loading, pagination, dataSource, rowKey } = this.props;

    const columns = [
      {
        dataIndex: 'revNo',
        ellipsis: true,
        title: intl.get(`spfmhk.supplier.field.info.reviewNumber`).d('评审单号'),
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
        dataIndex: 'companyNameEn',
        ellipsis: true,
        title: intl.get(`spfmhk.supplier.field.company.name.en`).d('公司名称（英文）'),
        width: 200,
      },
      {
        dataIndex: 'companyNameCh',
        ellipsis: true,
        title: intl.get(`spfmhk.supplier.field.company.name.cn`).d('公司名称（中文）'),
        width: 200,
      },
      {
        dataIndex: 'prPeopleMeaning',
        ellipsis: true,
        title: intl.get(`spfmhk.supplier.field.info.buyer`).d('采购员'),
        width: 120,
      },
      {
        dataIndex: 'revYear',
        ellipsis: true,
        title: intl.get(`spfmhk.supplier.field.info.reviewYear`).d('评审年度'),
        width: 120,
      },
      {
        dataIndex: 'revQuarterMeaning',
        ellipsis: true,
        title: intl.get(`spfmhk.supplier.field.info.reviewQuater`).d('评审季度'),
        width: 225,
      },
      {
        dataIndex: 'revTypeMeaning',
        ellipsis: true,
        title: intl.get(`spfmhk.supplier.field.info.reviewType`).d('评审类型'),
        width: 120,
      },
      {
        dataIndex: 'revStatusMeaning',
        ellipsis: true,
        title: intl.get(`spfmhk.supplier.field.info.reviewStatus`).d('评审状态'),
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
    );
  }
}
