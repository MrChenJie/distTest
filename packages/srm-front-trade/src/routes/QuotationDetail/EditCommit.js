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

export default class EditCommit extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      quotationDetailModal,
      onChange = (e) => e,
    } = this.props;
    const { editCommitDataSource = [], editCommitPagination = {} } = quotationDetailModal;
    const columns = [
      {
        title: intl.get(`spfmhk.trade.field.ChangeMode`).d('变更方式'),
        width: 120,
        dataIndex: 'orderSeq',
        key: 'orderSeq',
        render: (_, record) => {
          return (
            tooltipRender(record.actionStatusMeaning)
          )
        },
      },
      {
        title: intl.get(`spfmhk.trade.field.ChangeBefore`).d('变更前'),
        width: 300,
        dataIndex: 'before',
        key: 'before',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.field.ChangeAfter`).d('变更后'),
        width: 160,
        dataIndex: 'after',
        key: 'after',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.field.OperationPerson`).d('操作人员'),
        width: 150,
        dataIndex: 'operator',
        key: 'operator',
        render: (_, record) => {
          return (
            tooltipRender(record.operatorName)
          )
        },
      },
      {
        title: intl.get(`spfmhk.trade.field.RecordTime`).d('记录时间'),
        width: 150,
        dataIndex: 'operation',
        key: 'operation',
        render: (_, record) => {
          return (
            tooltipRender(record.creationDate)
          )
        },
      },
    ];
    return (
      <>
        <CusTable
          rowKey="rowKey"
          pagination={editCommitPagination}
          columns={columns}
          dataSource={editCommitDataSource}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
