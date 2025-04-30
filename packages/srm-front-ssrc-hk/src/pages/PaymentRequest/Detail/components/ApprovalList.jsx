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
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { tableScrollWidth } from 'hzero-front/lib/utils/utils';

import styles from './index.less';

export default class ApprovalList extends PureComponent {
  render() {
    const { dataSource } = this.props;
    const columns = [
      {
        title: intl.get('spcm.paymentRequest.approval-history.model.operator').d('处理人'),
        dataIndex: 'operator',
        width: 120,
      },
      {
        title: intl.get('spcm.paymentRequest.approval-history.model.operatorDept').d('审批部门'),
        dataIndex: 'operatorDept',
        width: 120,
      },
      {
        title: intl.get('spcm.paymentRequest.approval-history.model.currentNodeName').d('当前节点'),
        dataIndex: 'currentNodeName',
        width: 80,
      },
      {
        title: intl.get('spcm.paymentRequest.approval-history.model.lastNodeName').d('上一节点'),
        dataIndex: 'lastNodeName',
        width: 80,
      },
      {
        title: intl
          .get('spcm.paymentRequest.approval-history.model.approvingOpinion')
          .d('审批意见'),
        dataIndex: 'approvingOpinion',
        width: 80,
      },
      {
        title: intl.get('spcm.paymentRequest.approval-history.model.operateDate').d('操作时间'),
        dataIndex: 'operateDate',
        width: 80,
      },
      // {
      //   title: '紧急程度',
      //   dataIndex: 'urgency',
      //   width: 80,
      // },

      {
        title: intl.get('spcm.paymentRequest.approval-history.model.optionTypeName').d('审批结果'),
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
        pagination={false}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    );
  }
}
