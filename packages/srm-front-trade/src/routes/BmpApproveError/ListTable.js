import React from 'react';
import intl from 'utils/intl';
import CusTable from '_cus_components/CusTable';
import { tooltipRender } from '_cus_utils/render';
import { dateRender } from 'utils/renderer';
import JsonModal from '@/routes/BmpApprove/JsonModal';

const prompt = 'spfm.bmpApproveError';

export default class ListTable extends React.PureComponent {
  render() {
    const {
      dataSource = [],
      pagination = {},
      onChange = (e) => e,
      viewJson = (e) => e,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.view.list.formRecordId`).d('单据数据ID'),
        width: 200,
        dataIndex: 'formRecordId',
        render: tooltipRender,
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
        title: intl.get(`${prompt}.view.list.errorPayload`).d('失败请求报文'),
        width: 120,
        dataIndex: 'errorPayload',
        render: (val) => val ? <JsonModal jsonData={val} /> : null,
      },
      {
        title: intl.get(`${prompt}.view.list.processDate`).d('处理日期'),
        width: 140,
        dataIndex: 'processDate',
        render: dateRender,
      },
      {
        title: intl.get(`${prompt}.view.list.processStatus`).d('处理状态'),
        width: 100,
        dataIndex: 'processStatusMeaning',
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.list.processMessage`).d('处理信息'),
        width: 200,
        dataIndex: 'processMessage',
        render: tooltipRender,
      },
    ];

    return (
      <CusTable
        rowKey="approveErrorId"
        pagination={pagination}
        columns={columns}
        dataSource={dataSource}
        onChange={onChange}
      />
    );
  }
}
