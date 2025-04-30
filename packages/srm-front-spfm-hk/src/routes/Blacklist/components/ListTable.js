import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';

const prompt = 'spfmhk.supplier';

@formatterCollections({ code: [prompt] })
export default class ListTable extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  @Bind()
  pushRouter(record) {
    const { isPub, dispatch, userUnit } = this.props;
    const { supplierId, supplierCategory, supplierNumber } = record;
    // 根据供应商类别跳转采购/财务供应商预览页
    if(supplierCategory === 'FINANCIALPAYMENT') {
      window.open(`${isPub ? '/pub' : ''}/spfm-hk/supplier/finance-approved?supplierId=${supplierId}&supplierNumber=${supplierNumber}&approvalStatus=Approved`);
    } else {
      window.open(`${isPub ? '/pub' : ''}/spfm-hk/supplier/purchase-approved?supplierId=${supplierId}&supplierNumber=${supplierNumber}&approvalStatus=Approved`);
    }
  }

  render() {
    const { rowSelection, onChange, loading, pagination, dataSource, rowKey, isPub } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.field.application.num`).d('申请单号'),
        width: 200,
        dataIndex: 'applyNumber',
        render: (value, record) => {
          return (
            <a onClick={() => {
              if(record?.caseId) {
                window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`);
              } else {
                window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM-HGGYS-HMDGYS&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/spfm-hk/supplier/edit-blacklist?applyNumber=${record.id}`)}`);
              }
            }}>{value}</a>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.request.status`).d('申请状态'),
        width: 200,
        dataIndex: 'applyStatusMeaning'
      },
      {
        title: intl.get(`${prompt}.field.ApplicationType`).d('申请类型'),
        width: 200,
        dataIndex: 'applyTypeMeaning'
      },
      {
        title: intl.get(`${prompt}.field.supplier.num`).d('供应商编号'),
        width: 200,
        dataIndex: 'supplierNumber',
        render: (value, record) => {
          return (
            <a onClick={() => {this.pushRouter(record)}}>
              {value}
            </a>
          )
        }
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
        title: intl.get(`${prompt}.view.table.applicant`).d('申请人'),
        width: 200,
        dataIndex: 'applyUser'
      },
      {
        title: intl.get(`${prompt}.field.request.date`).d('申请日期'),
        width: 200,
        dataIndex: 'applyDate'
      },
      {
        title: intl.get(`${prompt}.field.ReasonOfBlackout`).d('列入黑名单原因'),
        width: 200,
        dataIndex: 'reason'
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
