import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { dateRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';
import formatterCollections from 'utils/intl/formatterCollections';

const prompt = 'spfmhk.dict';

@formatterCollections({ code: [prompt] })
export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
  }

  handleApplicationLink = (record) => {
    // window.open(`/dict/register-management/detail?formRecordId=${record.partnerId}`, '_blank');
    // window.open(`/pub/dict/partnerReview?partnerId=${record.partnerId}&type=review`, '_blank');
    window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.judgeCaseId}`);
  };
  handleNameEnLink = (record) => {
    // window.open(`/dict/register-management/detail?formRecordId=${record.partnerId}`, '_blank');
    window.open(`/pub/dict/partnerReview?partnerId=${record.partnerId}&type=detail`, '_blank');
  };

  render() {
    const {
      rowSelection,
      dataSource = [],
      pagination = {},
      onChange = (e) => e,
      rowKey,
      idpValueMap,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.view.field.reviewno`).d('评审单号'),
        width: 200,
        dataIndex: 'reviewNum',
        key: 'reviewNum',
        render: (_, record) => {
          return (
            <a onClick={() => this.handleApplicationLink(record)}>
              {tooltipRender(record.reviewNum)}
            </a>
          );
        },
      },
      {
        title: intl.get(`${prompt}.view.field.reviewsatatus`).d('评审状态'),
        width: 160,
        dataIndex: 'reviewStatusMeaning',
        key: 'reviewStatusMeaning',
      },
      {
        title: intl.get(`${prompt}.view.field.companynameen`).d('公司名称（英文）'),
        width: 160,
        dataIndex: 'cmpanyNameEn',
        key: 'cmpanyNameEn',
        render: (_, record) => {
          return (
            <a onClick={() => this.handleNameEnLink(record)}>
              {tooltipRender(record.cmpanyNameEn)}
            </a>
          );
        },
      },
      {
        title: intl.get(`${prompt}.view.field.companynamecn`).d('公司名称（中文）'),
        width: 160,
        dataIndex: 'cmpanyNameCh',
        key: 'cmpanyNameCh',
      },
      {
        title: intl.get(`${prompt}.view.field.cooperationmode`).d('合作模式'),
        width: 160,
        dataIndex: 'collaborationMode',
        key: 'collaborationMode',
      },
      {
        title: intl.get(`${prompt}.view.field.recruitmentmethod`).d('招募方式'),
        width: 160,
        dataIndex: 'recruitmentMethodMeaning',
        key: 'recruitmentMethodMeaning',
        // render: (_, record) => {
        //   const meaning = idpValueMap['DICT.RECUITMENT_METHOD']?.filter(i => i?.value === record.recruitmentMethod)[0]?.meaning;
        //   return <>{meaning}</>;
        // },
      },
      {
        title: intl.get(`${prompt}.view.field.wayofintitatereview`).d('发起评审方式'),
        width: 160,
        dataIndex: 'startAppraisalWayMeaning',
        key: 'startAppraisalWayMeaning',
      },
      {
        title: intl.get(`${prompt}.view.field.registrationdate`).d('报名日期'),
        width: 160,
        dataIndex: 'registrationDate',
        key: 'registrationDate',
        render: dateRender,
      },
      {
        title: intl.get(`${prompt}.view.field.reviewdate`).d('发起评审日期'),
        width: 160,
        dataIndex: 'startAppraisalDate',
        key: 'startAppraisalDate',
        render: dateRender,
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
