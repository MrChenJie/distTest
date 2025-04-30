import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { dateRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';

const prompt = 'spfmhk.mylink';

export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
  }

  handleApplicationLink = (record) => {
    const { APPROVAL_PROCESS } = process.env;
    if(record.caseId) {
      const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`
      window.open(url, '_blank')
    } else {
      const url = `/pub/mylink/partner-assessment/summary/Detail?formRecordId=${record.evalGatherId}`;
      window.open(url, '_blank')
    }
  };

  render() {
    const {
      rowSelection,
      dataSource = [],
      pagination = {},
      onChange = (e) => e,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.field.sumorder.no`).d('汇总单号'),
        width: 180,
        dataIndex: 'evalGatherNo',
        key: 'evalGatherNo',
        render: (_, record) => {
          return (
            <a onClick={() => this.handleApplicationLink(record)}>
              {tooltipRender(record?.evalGatherNo)}
            </a>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.review.year`).d('评估年度'),
        width: 150,
        dataIndex: 'evalYear',
        key: 'evalYear',
      },
      {
        title: intl.get(`${prompt}.field.review.period`).d('评估周期'),
        width: 160,
        dataIndex: 'evalPeriodMeaning',
        key: 'evalPeriodMeaning',
      },
      {
        title: intl.get(`${prompt}.field.review.date`).d('评估日期'),
        width: 160,
        dataIndex: 'evalDate',
        key: 'evalDate',
        render: dateRender,
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
