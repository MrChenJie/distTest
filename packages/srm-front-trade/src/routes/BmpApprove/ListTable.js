import React from 'react';
import intl from 'utils/intl';
import CusTable from '_cus_components/CusTable';
import { tooltipRender } from '_cus_utils/render';
import JsonModal from './JsonModal';

const prompt = 'spfm.bmpApprove';

export default class ListTable extends React.PureComponent {
  render() {
    const { dataSource = [], pagination = {}, onChange = (e) => e, isPub } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.view.list.formRecordId`).d('单据数据ID'),
        width: 120,
        dataIndex: 'formRecordId',
        render: (val, record) => {
          return (
            <a
              href="#"
              onClick={() => {
                window.open(
                  `${isPub ? '/pub' : ''}/spub/bpm-approve/detail/${record.approveHeaderId}`
                );
              }}
            >
              {val}
            </a>
          );
        },
      },
      {
        title: intl.get(`${prompt}.view.list.dataType`).d('通知事件类型'),
        width: 120,
        dataIndex: 'dataTypeMeaning',
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.list.caseId`).d('流程实例ID'),
        width: 200,
        dataIndex: 'caseId',
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.list.templateCode`).d('流程模板'),
        width: 180,
        dataIndex: 'templateCodeMeaning',
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.list.currentActivityCode`).d('当前节点CODE'),
        width: 150,
        dataIndex: 'currentActivityCode',
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.list.currentActivityName`).d('当前节点名称'),
        width: 140,
        dataIndex: 'currentActivityName',
        render: (val) => val ? <JsonModal jsonData={val} /> : null,
      },
      {
        title: intl.get(`${prompt}.view.list.startUserName`).d('流程发起人'),
        width: 180,
        dataIndex: 'startUserName',
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.list.caseState`).d('流程实例状态'),
        width: 150,
        dataIndex: 'caseStateMeaning',
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.list.currentUserName`).d('当前处理人'),
        width: 180,
        dataIndex: 'currentUserName',
        render: tooltipRender,
      },
    ];

    return (
      <CusTable
        rowKey="approveHeaderId"
        pagination={pagination}
        columns={columns}
        dataSource={dataSource}
        onChange={onChange}
      />
    );
  }
}
