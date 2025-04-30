/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-12 15:25:43
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { dateRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';

const prompt = 'spub.purchaseApiList';

export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
  }

  handleActiveLink = (record) => {
    const { APPROVAL_PROCESS } = process.env;
    const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`
    window.open(url, '_blank')
    // window.open(`/pub/platform/activey-application/Detail?formRecordId=${record.id}`, '_blank')
  }

  render() {
    const {
      rowSelection,
      dataSource = [],
      pagination = {},
      onChange = (e) => e,
    } = this.props;
    const columns = [
      {
        title: intl.get(`spfmhk.trade.field.ActivityID`).d('活动ID'),
        width: 160,
        dataIndex: 'actId',
        key: 'actId',
        render: (_, record) => {
          return (
            <a onClick={() => this.handleActiveLink(record)}>
              {tooltipRender(record.actId)}
            </a>
          )
        }
      },
      {
        title: intl.get(`spfmhk.trade.field.ActivityName`).d('活动名称'),
        width: 300,
        dataIndex: 'actName',
        key: 'actName',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.field.ActivityCreator`).d('活动创建人'),
        width: 160,
        dataIndex: 'createrName',
        key: 'createrName',
      },
      {
        title: intl.get(`spfmhk.trade.field.ActivityAppStat`).d('申请状态'),
        width: 100,
        dataIndex: 'statusMeaning',
        key: 'statusMeaning',
      },
      {
        title: intl.get(`spfmhk.trade.field.QuotatDateEnd`).d('报价截止日期'),
        width: 100,
        dataIndex: 'quoteEndTime',
        key: 'quoteEndTime',
        render: dateRender,
      },
    ];
    return (
      <>
        <CusTable
          rowKey="rowKey"
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
