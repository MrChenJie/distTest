import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { Bind } from 'lodash-decorators';

const prompt = 'spfmhk.supplier';

export default class ApplyListTable extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  @Bind()
  pushRouter(record) {
    const { userUnit, unitCode, isPub } = this.props;
    const { supplierCategory, id, caseId, accessSource } = record;
    // 门户数据，跳转进门户页面；
    if (accessSource === 'portal') {
      if (caseId) {
        window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${caseId}`);
      } else {
        window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM-CGGYSXXBG-GYS&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/spfm-hk/supplier/PRSA-infomation-portal/basicUpdate&createdBy=${id}`)}`);
      }
      return;
    }
    window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${caseId}`);
  }

  render() {
    const { rowSelection, rowKey, pagination, dataSource, onChange } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.field.request.status`).d('申请状态'),
        width: 130,
        dataIndex: 'lineNum',
        render: (_, record) => {
          return (
            <span>{record.applyStatusMeaning}</span>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.application.num`).d('申请单号'),
        width: 200,
        dataIndex: 'applyNumber',
        render: (value, record) => {
          return (
            <a onClick={() => { this.pushRouter(record) }}>
              {value}
            </a>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.supplier.num`).d('供应商编号'),
        width: 200,
        dataIndex: 'supplierNumber'
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
        title: intl.get(`${prompt}.view.table.ChangeDetails`).d('信息变更明细'),
        width: 200,
        dataIndex: 'editReason'
      },
      {
        title: intl.get(`${prompt}.field.request.date`).d('申请日期'),
        width: 200,
        dataIndex: 'applyDate'
      },
      {
        title: intl.get(`${prompt}.view.table.applicant`).d('申请人'),
        width: 200,
        dataIndex: 'applyUser'
      },
      // {
      //   title: intl.get(`${prompt}.view.table.Buyer`).d('采购员'),
      //   width: 200,
      //   dataIndex: 'salesman'
      // },
    ];
    return (
      <>
        <CusTable
          bordered
          rowKey={rowKey}
          pagination={pagination}
          columns={columns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
