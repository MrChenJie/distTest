import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import dayjs from 'dayjs';

const prompt = 'spfmhk.dict';
@formatterCollections({ code: [prompt] })

export default class ListTable extends PureComponent {
  constructor(props) {
    super(props);
  }


  @Bind()
  openDetailPage(record) {
    // console.log(record.partnerId, record.editType);
    // window.open(`/pub/dict/partner-info-update/detail?editRecordId=${record.editRecordId}&editType=${record.editType}`);
    window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.editCaseId}`);
  }

  render() {
    const {
      rowSelection,
      pagination = {},
      onChange = (e) => e,
      dataSource,
    } = this.props;

    const columns = [
      {
        title: intl.get(`${prompt}.view.field.applicationno`).d('申请单号'),
        dataIndex: 'applyNum',
        render: (value, record) => {
          return <a onClick={() => this.openDetailPage(record)}>{value}</a>;
        },
      },
      {
        title: intl.get(`${prompt}.view.field.partner.code`).d('合作伙伴编号'),
        width: 160,
        dataIndex: 'partnerNum',
      },
      {
        title: intl.get(`${prompt}.view.common.partnername`).d('合作伙伴名称'),
        width: 160,
        dataIndex: 'cmpanyNameCh',
      },
      {
        title: intl.get(`${prompt}.view.field.cooperationmode`).d('合作模式'),
        dataIndex: 'collaborationMode',
      },
      {
        title: intl.get(`${prompt}.view.field.info.update.type`).d('信息更新类别'),
        dataIndex: 'editTypeMeaning',
      },
      {
        title: intl.get(`${prompt}.view.field.applicantionstatus`).d('申请状态'),
        dataIndex: 'editApplyStatusMeaning',
      },
      {
        title: intl.get(`${prompt}.view.field.applicantion.date`).d('申请日期'),
        dataIndex: 'creationDate',
        render: (value) => {
          return <>{dayjs(value).format('YYYY-MM-DD')}</>
        }
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
