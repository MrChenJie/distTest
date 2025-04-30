import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { Bind } from 'lodash-decorators';

const prompt = 'spfmhk.supplier';

export default class ListTable extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  @Bind()
  pushRouter(record) {
    if(record?.caseId) {
      window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`);
    }
  }

  @Bind()
  viewSupplierDetail(record) {

  }

  @Bind()
  getColumns() {
    const {} = this.props;
    return [
      {
        title: intl.get(`${prompt}.view.table.ApplicationNo`).d('申请单号'),
        dataIndex: 'applyNo',
        width: 200,
        render: (val, record, index) => {
          return (
            <a onClick={() => this.pushRouter(record)}>{val}</a>
          )
        }
      },
      {
        title: intl.get(`${prompt}.view.table.ApplicationStatus`).d('申请状态'),
        width: 200,
        dataIndex: 'applyStatusMeaning'
      },
      {
        title: intl.get(`${prompt}.view.table.ChangeType`).d('变更类型'),
        width: 200,
        dataIndex: 'changeTypeMeaning'
      },
      {
        title: intl.get(`${prompt}.field.supplier.num`).d('供应商编号'),
        width: 200,
        dataIndex: 'supplierNumber',
      },
      {
        title: intl.get(`${prompt}.field.company.name.en`).d('公司名称（英文）'),
        width: 200,
        dataIndex: 'companyNameEn'
      },
      {
        title: intl.get(`${prompt}.field.company.name.cn`).d('公司名称（中文）'),
        width: 200,
        dataIndex: 'companyNameCh'
      },
      {
        title: intl.get(`${prompt}.field.supplier.versionBefore`).d('供应商版本'),
        width: 200,
        dataIndex: 'supplierVersion'
      },
      {
        title: intl.get(`${prompt}.view.table.ApplicationDate`).d('申请日期'),
        width: 200,
        dataIndex: 'applyDate'
      },
    ];
  }

  render() {
    const { rowSelection, onChange, loading, pagination, dataSource, rowKey } = this.props;
    return (
      <>
        <CusTable
          bordered
          loading={loading}
          pagination={pagination}
          columns={this.getColumns()}
          dataSource={dataSource}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(this.getColumns()) }}
          onChange={onChange}
          rowKey={rowKey}
        />
      </>
    )
  }

}
