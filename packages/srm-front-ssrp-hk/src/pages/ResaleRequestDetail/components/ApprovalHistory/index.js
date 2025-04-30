/*
 * @Description: 转售采购成品付款申请 - 审批历史
 * @LastEditors: 何智鹏 <he.zhipeng@hand-china.com>
 * @Date: 2023-08-17 16:29:48
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { Component } from 'react';
import intl from 'utils/intl';
import { connect } from 'dva';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import styles from '../../index.less';

@connect(({ resaleRequestDetail = {} }) => ({ resaleRequestDetail }))
export default class index extends Component {
  /**
   * @name: 定义 - Table列元素
   * @return {array} Table列数据集
   */
  get columns() {
    return [
      {
        title: intl.get('spcm.paymentRequest.approval-history.model.operator').d('处理人'),
        dataIndex: 'operator',
        width: 220,
      },
      {
        title: intl.get('spcm.paymentRequest.approval-history.model.operatorDept').d('审批部门'),
        dataIndex: 'operatorDept',
        width: 180,
      },
      {
        title: intl.get('spcm.paymentRequest.approval-history.model.currentNodeName').d('当前节点'),
        dataIndex: 'currentNodeName',
        width: 120,
      },
      {
        title: intl.get('spcm.paymentRequest.approval-history.model.lastNodeName').d('上一节点'),
        dataIndex: 'lastNodeName',
        width: 120,
      },
      {
        title: intl
          .get('spcm.paymentRequest.approval-history.model.approvingOpinion')
          .d('审批意见'),
        dataIndex: 'approvingOpinion',
        width: 220,
      },
      {
        title: intl.get('spcm.paymentRequest.approval-history.model.operateDate').d('操作时间'),
        dataIndex: 'operateDate',
        width: 171,
      },
      {
        title: intl.get('spcm.paymentRequest.approval-history.model.optionTypeName').d('审批结果'),
        dataIndex: 'optionTypeName',
        width: 120,
      },
    ];
  }

  render() {
    const { approvalReqRecVOList } = this.props.resaleRequestDetail;
    return (
      <CusTable
        rowClassName={styles['approval-list-row']}
        rowKey="recordId"
        columns={this.columns}
        dataSource={approvalReqRecVOList}
        scroll={{ x: tableScrollWidth(this.columns) }}
      />
    );
  }
}
