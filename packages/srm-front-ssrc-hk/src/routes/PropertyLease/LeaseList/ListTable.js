import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { dateRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';
import CusButton from '_cus_components/CusButton';

const promptCode = 'HKPC.commom';
export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
  }

  handleLeaseLink = (record, status) => {
    const url = `/pub/ssrc-hk/propertyLease/applicationForm/${record.laNumber}`;
    if (status) {
      window.open(url + `?isModify=${status}`, '_blank');
    } else {
      window.open(url, '_blank');
    }
  };
  render() {
    const { rowSelection, dataSource = [], pagination = {}, onChange = (e) => e } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.applicationformno`).d('申请单编号'),
        width: 160,
        dataIndex: 'laNumber',
        key: 'laNumber',
        render: (_, record) => {
          return (
            <a onClick={() => this.handleLeaseLink(record)}>{tooltipRender(record.laNumber)}</a>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.applicaitonformname`).d('申请单名称'),
        width: 150,
        dataIndex: 'laName',
        key: 'laName',
      },
      {
        title: intl.get(`${promptCode}.view.title.formstate`).d('单据状态'),
        width: 160,
        dataIndex: 'statusMeaning',
        key: 'statusMeaning',
      },
      {
        title: intl.get(`${promptCode}.view.title.propertyno`).d('主体编号'),
        width: 160,
        dataIndex: 'storeNumber',
        key: 'storeNumber',
      },
      {
        title: intl.get(`${promptCode}.view.title.leasestartdate`).d('租赁开始日期'),
        width: 150,
        dataIndex: 'leaseStartDate',
        key: 'leaseStartDate',
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.leaseenddate`).d('租赁结束日期'),
        width: 150,
        dataIndex: 'leaseEndDate',
        key: 'leaseEndDate',
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.maturityyear`).d('到期年份'),
        width: 150,
        dataIndex: 'leaseEndYear',
        key: 'leaseEndYear',
      },
      {
        title: intl.get(`${promptCode}.view.title.quarterdue`).d('到期季度'),
        width: 150,
        dataIndex: 'leaseEndQuarter',
        key: 'leaseEndQuarter',
      },
      {
        title: intl.get(`${promptCode}.view.title.actualmonthlyrent`).d('实际月租(HK$)'),
        width: 150,
        dataIndex: 'monthlyRent',
        key: 'monthlyRent',
      },
      {
        title: intl.get(`${promptCode}.view.title.actualscaleprice`).d('实际尺价(HK$)'),
        width: 150,
        dataIndex: 'footPrice',
        key: 'footPrice',
      },
      {
        title: intl.get(`${promptCode}.view.title.prade`).d('申请日期'),
        width: 150,
        dataIndex: 'applyDate',
        key: 'applyDate',
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.rental`).d('租金总额'),
        width: 150,
        dataIndex: 'amounts',
        key: 'amounts',
      },
      {
        title: intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称'),
        width: 150,
        dataIndex: 'supName',
        key: 'supName',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        key: 'operate',
        // width: getCurrentLanguage() === 'zh_CN' ? 108 : 162,
        dataIndex: 'operate',
        render: (_, record) => (
          <>
            {record.statusMeaning == '已提交' && (
              <CusButton
                type="plain"
                onClick={() => this.handleLeaseLink(record, 'modify')}
                style={{ marginRight: '16px' }}
              >
                {intl.get(`${promptCode}.view.button.modify`).d('修改')}
              </CusButton>
            )}
          </>
        ),
      },
    ];
    return (
      <>
        <CusTable
          rowKey="id"
          rowSelection={rowSelection}
          pagination={pagination}
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
