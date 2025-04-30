import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import { dateRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';

const prompt = 'spfmhk.supplier';

export default class ListTable extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  /**
   * 根据单据状态区分跳转页面
   * @param record
   */
  @Bind()
  pushRouterByApprovalStatus(record) {
    const { isPub } = this.props;
    const { supplierId, supplierNumber, approvalStatus, supplierCategory, accessSource, createdBy, caseId } = record;
    // 门户供应商
    if(accessSource === 'portal') {
      if(['Inapproval', 'Return'].includes(approvalStatus)) {
        if(caseId) {
          window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${caseId}`);
        } else {
          window.open(`${isPub ? '/pub' : ''}/spfm-hk/supplier/PRSA-infomation-portal/manager?createdBy=${createdBy}`)
        }
      } else {
        window.open(`${isPub ? '/pub' : ''}/spfm-hk/supplier/PRSA-infomation-portal/manager?createdBy=${createdBy}`)
      }
    } else {
      // 审批状态草稿单跳转编辑页面
      if(approvalStatus === 'Draft') {
        if(caseId) {
          window.open(`${isPub ? '/pub' : ''}/spfm-hk/supplier/edit-admittance?supplierId=${supplierId}&supplierNumber=${supplierNumber}&caseId=${caseId}`);
        } else {
          window.open(`${isPub ? '/pub' : ''}/spfm-hk/supplier/edit-admittance?supplierId=${supplierId}&supplierNumber=${supplierNumber}`);
        }
      }
      if(approvalStatus === 'Inapproval') {
        window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${caseId}`);
      }
      // 已审批跳转预览页
      if(approvalStatus === 'Approved' && supplierCategory === 'FINANCIALPAYMENT') {
        window.open(`${isPub ? '/pub' : ''}/spfm-hk/supplier/finance-approved?supplierId=${supplierId}&supplierNumber=${supplierNumber}`);
      }
      if(approvalStatus === 'Approved' && supplierCategory !== 'FINANCIALPAYMENT') {
        window.open(`${isPub ? '/pub' : ''}/spfm-hk/supplier/purchase-approved?supplierId=${supplierId}&supplierNumber=${supplierNumber}`);
      }
    }
  }

  /**
   * 财务转采购供应商
   */
  @Bind()
  financeToPurchase(record) {
    const { isPub } = this.props;
    const { supplierId, caseId, templateCode } = record;
    if(templateCode === 'BPM_SCM_caiwuzhuancaigou') {
      window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${caseId}`);
    } else {
      window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_caiwuzhuancaigou&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/spfm-hk/supplier/finance-to-purchase?supplierId=${supplierId}`)}`);
    }
    window.close();
  }

  render() {
    const { rowSelection, onChange, pagination, dataSource, rowKey } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.view.table.supplier.num`).d('供应商编号'),
        dataIndex: 'supplierNumber',
        width: 120,
      },
      {
        title: intl.get(`${prompt}.view.table.supplier.status`).d('供应商状态'),
        dataIndex: 'supplierStatusMeaning',
        width: 150
      },
      {
        title: intl.get(`${prompt}.view.table.supplier.category`).d('供应商类别'),
        dataIndex: 'supplierCategoryMeaning',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.view.table.company.name.en`).d('公司名称（英文）'),
        dataIndex: 'companyNameEn',
        width: 200
      },
      {
        title: intl.get(`${prompt}.view.table.company.name.cn`).d('公司名称（中文）'),
        dataIndex: 'companyNameCh',
        width: 200,
        render: (value, record) => {
          return (
            <a onClick={() => {this.pushRouterByApprovalStatus(record)}}>
              {value}
            </a>
          )
        }
      },
      {
        title: intl.get(`${prompt}.view.table.contact.person`).d('联系人'),
        dataIndex: 'contactMan',
        width: 120
      },
      {
        title: intl.get(`${prompt}.view.table.email`).d('电邮'),
        dataIndex: 'email',
        width: 200
      },
      {
        title: intl.get(`${prompt}.field.phoneNumber`).d('电话'),
        dataIndex: 'phoneNumber',
        width: 120
      },
      {
        title: intl.get(`${prompt}.view.table.applicant`).d('申请人'),
        dataIndex: 'salesMan',
        width: 120
      },
      {
        title: intl.get(`${prompt}.view.table.supplier.entry.date`).d('供应商准入日期'),
        dataIndex: 'supplierAccessTime',
        render: dateRender,
        width: 120
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        render: (_, record) => {
          if(record.supplierCategory === 'FINANCIALPAYMENT' && record.approvalStatus === 'Approved') {
            return (
              <>
                <CusButton type="plain" onClick={() => this.financeToPurchase(record)}>{intl.get(`${prompt}.view.table.transfer.procurement.supplier`).d('转采购供应商')}</CusButton>
              </>
            )
          }
        }
      }
    ];
    return (
      <>
        <CusTable
          bordered
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
