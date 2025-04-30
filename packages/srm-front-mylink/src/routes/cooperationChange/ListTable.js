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
    const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.id}`
    // window.open(url, '_blank')
    window.open(`/pub/platform/activey-application/Detail?formRecordId=${record.id}`, '_blank')
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
        title: intl.get(`spfmhk.trade`).d('公司名称'),
        width: 300,
        dataIndex: 'createrName',
        key: 'createrName',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.`).d('合作意向'),
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
        title: intl.get(`spfmhk.trade`).d('邀请人'),
        width: 300,
        dataIndex: 'createrName',
        key: 'createrName',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade`).d('申请日期'),
        width: 100,
        dataIndex: 'quoteEndTime',
        key: 'quoteEndTime',
        render: dateRender,
      },
      {
        title: intl.get(`spfmhk.trade`).d('合作伙伴类别'),
        width: 100,
        dataIndex: 'statusMeaning',
        key: 'statusMeaning',
      },
      {
        title: intl.get(`spfmhk.trade`).d('操作'),
        width: 120,
        key: 'operator',
        render: (_, record) => {
          return (
            <>
              <CusButton style={record.isDisable ? { marginRight: '16px' } : {}} type="plain" onClick={() => handleSend(record)}>
                {intl.get('hzero.common').d('采购类')}
              </CusButton>

              <CusButton type="plain" onClick={() => this.handleDelete(record)}>
                {intl.get('hzero.common').d('寄售类')}
              </CusButton>

            </>
          )
        },
      }
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
