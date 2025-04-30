/*
 * @Author: 陆海涛 <haitao.lu02@hand-china.com>
 * @Date: 2024-09
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { dateRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';
import CusButton from '_cus_components/CusButton';

const prompt = 'spub.purchaseApiList';

export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
  }

  handleActiveLink = (record) => {
    const { APPROVAL_PROCESS } = process.env;
    const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`
    window.open(url, '_blank')
    // window.open(`/mylink/cooperation-category/Detail?formRecordId=${record.recordTypeId}`, '_blank')
  }


  handleDelete = (record) => {
    // const { dispatch } = this.props;
    // dispatch({
    //   type: 'CollaborationModeModal/queryList',
    //   payload: {
    //     id: record.id
    //   },
    // });
  }
  
  render() {
    const {
      rowSelection,
      dataSource = [],
      pagination = {},
      onChange = (e) => e,
      handleSend = (e) => e,
    } = this.props;
    const columns = [
      
      {
        title: intl.get(`spfmhk.mylink.field.apply.num`).d('申请单号'),
        width: 180,
        dataIndex: 'applyNum',
        key: 'applyNum',
        render: (_, record) => {
          return (
            <a onClick={() => this.handleActiveLink(record)}>
              {tooltipRender(record.applyNum)}
            </a>
          )
        }
      },
      {
        title: intl.get(`spfmhk.mylink.field.companyName`).d('公司名称'),
        width: 220,
        dataIndex: 'companyName',
        key: 'companyName',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.mylink.field.partner.code`).d('合作伙伴编码'),
        width: 140,
        dataIndex: 'partnerNum',
        key: 'partnerNum',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.mylink.field.cooperate.mode`).d('合作模式'),
        width: 300,
        dataIndex: 'partnerMode',
        key: 'partnerMode',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.mylink.field.company.productSer`).d('产品/服务'),
        width: 100,
        dataIndex: 'productMeaning',
        key: 'productMeaning',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.mylink.field.apply.status`).d('申请状态'),
        width: 120,
        dataIndex: 'applyStatusMeaning',
        key: 'applyStatusMeaning',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.mylink.field.application.date`).d('申请日期'),
        width: 130,
        dataIndex: 'applyDate',
        key: 'applyDate',
        render: dateRender,
      },
      {
        title: intl.get(`spfmhk.mylink.field.title.user`).d('业务员'),
        width: 220,
        dataIndex: 'applyMan',
        key: 'applyMan',
        render: tooltipRender,
      }
    ];
    return (
      <>
        <CusTable
          rowKey="recordTypeId"
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
