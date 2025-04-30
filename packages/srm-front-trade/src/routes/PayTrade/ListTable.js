/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-12 15:25:43
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { dateRender, numberRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';

const prompt = 'spub.purchaseApiList';

export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
  }

  handleActiveLink = (record) => {
    const { APPROVAL_PROCESS, CMHK_LOGIN } = process.env;
    if(record?.canEdit === 'Y') {
      if(record.caseId) {
        const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`
        window.open(url, '_blank')
      } else {
        const templateCode = 'BPM_SCM_MYSSCFKPZ'; // 致远templateCode
        const url = `${
          APPROVAL_PROCESS
        }/main/child-frame/app-approval/quick/process?templateCode=${templateCode}&pcThirdContentPageUrl=${encodeURIComponent(
          `${CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/platform/payTrade/Detail?activeId=${record.id}`
        )}`;
        window.open(url, '_blank');
      }
    } else {
      const url = `/pub/platform/payTrade/Detail?activeId=${record?.id}&formRecordId=null`
      window.open(url, '_blank');
    }
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
        title: intl.get(`spfmhk.trade.field.TradeName`).d('贸易商名称'),
        width: 300,
        dataIndex: 'refTradeName',
        key: 'refTradeName',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.field.PayStatus`).d('付款状态'),
        width: 100,
        dataIndex: 'statusMeaning',
        key: 'statusMeaning',
      },
      {
        title: intl.get(`spfmhk.trade.field.CreatDate`).d('创建日期'),
        width: 100,
        dataIndex: 'creationDate',
        key: 'creationDate',
        render: dateRender,
      },
      {
        title: intl.get(`spfmhk.trade.sumamount`).d('汇总金额'),
        width: 100,
        dataIndex: 'orderQuoteHkdTotal',
        key: 'orderQuoteHkdTotal',
        render: (_, record) => {
          return (
            <div style={{textAlign: 'right'}}>{numberRender(record.orderQuoteHkdTotal, 2)}</div>
          )
        },
      },
      {
        title: intl.get(`spfmhk.trade.quantityquantity`).d('数量'),
        width: 100,
        dataIndex: 'orderQuantityTotal',
        key: 'orderQuantityTotal',
        render: tooltipRender,
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
