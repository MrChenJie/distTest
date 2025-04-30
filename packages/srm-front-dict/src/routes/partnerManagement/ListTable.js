import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import formatterCollections from 'utils/intl/formatterCollections';
import dayjs from 'dayjs';

const prompt = 'spfmhk.dict';
@formatterCollections({ code: [prompt] })

export default class ListTable extends PureComponent {
  constructor(props) {
    super(props);
  }

  openPartnerDetail = (record) => {
    window.open(`/pub/dict/partnerReview?partnerId=${record.partnerId}&type=detail`, '_blank');
  };

  render() {
    const {
      rowSelection,
      dataSource,
      pagination = {},
      onChange = (e) => e,
      idpValueMap,
      handleReviewPoint,
    } = this.props;

    const columns = [
      {
        title: intl.get(`${prompt}.view.field.partner.code`).d('合作伙伴编号'),
        width: 160,
        dataIndex: 'partnerNum',
        render: (value, record) => {
          return <a onClick={() => this.openPartnerDetail(record)}>{value}</a>;
        },
      },
      {
        title: intl.get(`${prompt}.view.field.supplier.code`).d('供应商编号'),
        width: 160,
        dataIndex: 'supplierNumber',
      },
      {
        title: intl.get(`${prompt}.view.field.companynameen`).d('公司名称（英文）'),
        width: 160,
        dataIndex: 'cmpanyNameEn',
      },
      {
        title: intl.get(`${prompt}.view.field.companynamecn`).d('公司名称(中文)'),
        width: 160,
        dataIndex: 'cmpanyNameCh',
      },
      {
        title: intl.get(`${prompt}.view.field.partner.status`).d('合作伙伴状态'),
        width: 160,
        dataIndex: 'partnerStorageStatus',
        render: (value, record) => {
          return <>{idpValueMap['DICT.PARTNER_STATUS']?.find(item => item.value === value)?.meaning}</>;
        },
      },
      {
        title: intl.get(`${prompt}.view.field.cooperationmode`).d('合作模式'),
        width: 160,
        dataIndex: 'collaborationMode',
      },
      {
        title: intl.get(`${prompt}.view.field.supplier.category`).d('供应商类别'),
        width: 160,
        dataIndex: 'supplierCategory',
        render: (value, record) => {
          return <>{idpValueMap['HKSP.SUP_CATEGORY']?.find(item => item.value === value)?.meaning}</>;
        },
      },
      {
        title: intl.get(`${prompt}.view.field.partner.point`).d('合作伙伴分数'),
        width: 160,
        dataIndex: 'appraisalScore',
        render: (value, record) => {
          return <a onClick={() => handleReviewPoint(record)}>{value}</a>;
        },
      },
      {
        title: intl.get(`${prompt}.view.field.recruitmentmethod`).d('招募方式'),
        width: 160,
        dataIndex: 'source',
        render: (value, record) => {
          return <>{idpValueMap['DICT.RECUITMENT_METHOD']?.find(item => item.value === value)?.meaning}</>;
        },
      },
      {
        title: intl.get(`${prompt}.view.field.partner.email`).d('合作伙伴电邮'),
        width: 220,
        dataIndex: 'email',
      },
      {
        title: intl.get(`${prompt}.view.field.partner.phone`).d('合作伙伴电话'),
        width: 160,
        dataIndex: 'phone',
      },
      {
        title: intl.get(`${prompt}.view.field.admittance.date`).d('准入日期'),
        width: 160,
        dataIndex: 'admissionDate',
        render: (value) => {
          if (value) {
            return <>{dayjs(value).format('YYYY-MM-DD')}</>;
          }
          return <></>;
        },
      },
    ];

    return (
      <>
        <CusTable
          rowKey="rowKey"
          pagination={pagination}
          columns={columns}
          dataSource={dataSource}
          onChange={onChange}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </>
    );
  }
}
