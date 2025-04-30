import React, { Component } from 'react';
import CusTable from '_cus_components/CusTable';
import intl from 'utils/intl';
import { tooltipRender } from '_cus_utils/render';
import JsonModal from '../JsonModal';
import { dateTimeRender } from 'utils/renderer';

const prompt = 'spfm.bmpApprove';

class ApproveLine extends Component {
  render() {
    const { dataSource } = this.props;

    const columns = [
      {
        title: intl.get(`${prompt}.view.list.currentActivityName`).d('当前节点名称'),
        width: 120,
        dataIndex: 'currentActivityName',
        render: (val) => val ? <JsonModal jsonData={val} /> : null,
      },
      {
        title: intl.get(`${prompt}.view.list.currentUserCode`).d('当前处理人'),
        width: 200,
        dataIndex: 'currentUserCode',
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.list.opinion`).d('审批意见'),
        width: 180,
        dataIndex: 'opinion',
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.list.content`).d('审批意见内容'),
        width: 150,
        dataIndex: 'content',
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.list.toActivity`).d('下一节点信息'),
        width: 140,
        dataIndex: 'toActivity',
        render: (val) => val ? <JsonModal jsonData={val} /> : null,
      },
      {
        title: intl.get(`${prompt}.view.list.stepBackToActivitys`).d('回退到的节点信息'),
        width: 180,
        dataIndex: 'stepBackToActivitys',
        render: (val) => val ? <JsonModal jsonData={val} /> : null,
      },
      {
        title: intl.get(`${prompt}.view.list.creationDate`).d('创建时间'),
        width: 180,
        dataIndex: 'creationDate',
        render: dateTimeRender,
      },
    ];

    return (
      <CusTable
        rowKey="approveLineId"
        pagination={{ current: 1, pageSize: 10, total: dataSource.length }}
        columns={columns}
        dataSource={dataSource}
      />
    );
  }
}

export default ApproveLine;
