/*
 * @Descripttion:
 * @version: 1.0.0
 * @Author: songceng
 * @Email: cengceng.song@hand-china.com
 * @Date: 2020-08-31 16:25:56
 * @LastEditors: songceng
 * @LastEditTime: 2020-09-10 10:39:08
 */
import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Table } from 'hzero-ui';

import styles from './index.less';

const prompt = 'spcm.costPayment';
@formatterCollections({ code: [prompt] })
export default class ApprovalList extends PureComponent {
  render() {
    const { dataSource } = this.props;
    const pagination = {
      page: 0,
      pageSize: 999,
      hideOnSinglePage: true,
    };
    // 处理人、审批部门、流程环节、状态、审批意见、审批时间
    const columns = [
      {
        title: intl.get(`${prompt}.view.detail.operator`).d('处理人'),
        dataIndex: 'operator',
        width: 120,
      },
      {
        title: intl.get(`${prompt}.view.detail.operatorDept`).d('审批部门'),
        dataIndex: 'operatorDept',
        width: 120,
      },
      {
        title: intl.get(`${prompt}.view.detail.currentNode`).d('当前节点'),
        dataIndex: 'currentNodeName',
        width: 80,
      },
      {
        title: intl.get(`${prompt}.view.detail.lastNode`).d('上一节点'),
        dataIndex: 'lastNodeName',
        width: 80,
      },
      {
        title: intl.get(`${prompt}.view.detail.approvingOpinion`).d('审批意见'),
        dataIndex: 'approvingOpinion',
        width: 160,
        tooltip: 'overflow',
      },
      {
        title: intl.get(`${prompt}.view.detail.operateDate`).d('审批时间'),
        dataIndex: 'operateDate',
        width: 80,
      },
      {
        title: intl.get(`${prompt}.view.detail.optionTypeName`).d('审批结果'),
        dataIndex: 'optionTypeName',
        width: 80,
      },
    ];
    return (
      <Table
        rowClassName={styles['approval-list-row']}
        rowKey="recordId"
        bordered
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
      />
    );
  }
}
