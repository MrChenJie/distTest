/**
 * @Description: 审批历史
 * @date 2023-08-07
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import CusTable from '_cus_components/CusTable';
import { tooltipRender } from '_cus_utils/render';

const prompt = 'spcm.costPayment';
export default class ApprovalList extends PureComponent {
  render() {
    const { dataSource } = this.props;

    // 处理人、审批部门、流程环节、状态、审批意见、审批时间
    const columns = [
      {
        title: intl.get(`${prompt}.view.detail.operator`).d('处理人'),
        dataIndex: 'operator',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.detail.operatorDept`).d('审批部门'),
        dataIndex: 'operatorDept',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.detail.currentNode`).d('当前节点'),
        dataIndex: 'currentNodeName',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.detail.lastNode`).d('上一节点'),
        dataIndex: 'lastNodeName',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.detail.approvingOpinion`).d('审批意见'),
        dataIndex: 'approvingOpinion',
        width: 250,
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.detail.operateDate`).d('审批时间'),
        dataIndex: 'operateDate',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.detail.optionTypeName`).d('审批结果'),
        dataIndex: 'optionTypeName',
        width: 150,
        render: tooltipRender,
      },
    ];
    return <CusTable
      rowKey="recordId"
      bordered
      columns={columns}
      dataSource={dataSource}
      pagination={{ current: 1, pageSize: 10, total: dataSource.length }} />;
  }
}
