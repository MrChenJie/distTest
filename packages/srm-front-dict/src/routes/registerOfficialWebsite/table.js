import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { dateRender, operatorRender } from 'utils/renderer';
import { tooltipRender, labelTip } from '_cus_utils/render';
import formatterCollections from 'utils/intl/formatterCollections';

const prompt = 'spfmhk.dict';

@formatterCollections({ code: [prompt] })
export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
  }

  // 进入详情页面
  handleNameEnLink = (record) => {
    console.log('record', record);
    const { isPub } = this.props;
    // window.open(`/dict/register-management/detail?formRecordId=${record.partnerId}`, '_blank');
    // window.open(`/pub/dict/partnerReview?partnerId=${record.partnerId}&type=detail`, '_blank');
    window.open(
      `${isPub ? '/pub' : ''}/dict/register-officialWebsite/detail?recordId=${record.recordId}`,
      '_blank'
    );
  };

  // 发送邮件
  handleSendEmail = (record) => {
    console.log('record', record);
    const { isPub } = this.props;
    window.open(`${isPub ? '/pub' : ''}/dict/register-officialWebsite/SendEmail?registId=${record.recordId}`,'_blank');
  };

  render() {
    const {
      dataSource = [],
      pagination = {},
      onChange = (e) => e,
      rowKey,
      rowSelection,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.view.field.companyname`).d('公司名称'),
        width: 200,
        dataIndex: 'cmpanyName',
        key: 'cmpanyName',
        render: (_, record) => {
          return (
            <a onClick={() => this.handleNameEnLink(record)}>{tooltipRender(record.cmpanyName)}</a>
          );
        },
      },
      {
        title: intl.get(`${prompt}.view.field.cooperationmode`).d('合作模式'),
        width: 160,
        dataIndex: 'collaborationMode',
        key: 'collaborationMode',
        render: (_, record) => {
          return tooltipRender(record.collaborationMode);
        },
      },
      {
        title: intl.get(`${prompt}.view.field.recruitmentmethod`).d('招募方式'),
        width: 160,
        dataIndex: 'sourceMeaning',
        key: 'sourceMeaning',
      },
      {
        title: intl.get(`${prompt}.view.search.officialWebsiteRegistrationDate`).d('官网报名日期'),
        width: 160,
        dataIndex: 'registrationDateStr',
        key: 'registrationDateStr',
        render: dateRender,
      },
      {
        title: intl.get(`${prompt}.view.search.systemautomaticreview`).d('系统自动审核'),
        width: 160,
        dataIndex: 'isSuccessMeaning',
        key: 'isSuccessMeaning',
        render: (_, record) => {
          return labelTip({
            label: record.isSuccessMeaning,
            tip: record.registerMessage,
          });
        },
      },
      {
        title: intl.get(`${prompt}.view.search.doestheportalsubmit`).d('门户是否提交'),
        width: 160,
        dataIndex: 'portalSubmitMeaning',
        key: 'portalSubmitMeaning',
      },
      {
        title: intl.get('spfmhk.dict.view.field.operate').d('操作'),
        key: 'action',
        width: 160,
        fixed: 'right',
        render: (_, record) => {
          const operators = [
            {
              key: 'emailsend',
              ele: (
                <a
                  onClick={() => {
                    this.handleSendEmail(record);
                  }}
                >
                  {intl.get('spfmhk.dict.view.operate.emailsend').d('邮件发送')}
                </a>
              ),
              len: 5,
              title: intl.get('spfmhk.dict.view.operate.emailsend').d('邮件发送'),
            },
          ];
          return operatorRender(operators);
        },
      },
    ];
    return (
      <>
        <CusTable
          rowKey={rowKey}
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
