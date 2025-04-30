/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2025-01-10 14:55:22
 * Copyright (c) 2025, All Rights Reserved. 
 */
import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { dateRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';

export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      questionSurvey,
      onChange = (e) => e,
    } = this.props;

    const {
      questionSurveySource = [],
      questionSurveyPagination = {},
    } = questionSurvey;
    const columns = [
      {
        title: intl.get(`hzero.common.title.companyname`).d('公司名称'),
        width: 180,
        dataIndex: 'companyName',
        key: 'companyName',
        render: tooltipRender,
      },
      {
        title: intl.get(`hzero.common.title.overallsatisfy`).d('整体满意度'),
        width: 160,
        dataIndex: 'overallSatisfaction',
        key: 'overallSatisfaction',
      },
      {
        title: intl.get(`hzero.common.title.information.inqury`).d('信息查询'),
        width: 160,
        dataIndex: 'informationService',
        key: 'informationService',
      },
      {
        title: intl.get(`hzero.common.title.docupload`).d('文件上传'),
        width: 160,
        dataIndex: 'uploadFile',
        key: 'uploadFile',
      },
      {
        title: intl.get(`hzero.common.title.data.entry`).d('资料填写'),
        width: 160,
        dataIndex: 'dataFill',
        key: 'dataFill',
      },
      {
        title: intl.get(`hzero.common.title.issue.encounter`).d('遇到问题'),
        width: 160,
        dataIndex: 'useProblem',
        key: 'useProblem',
        render: tooltipRender,
      },
      {
        title: intl.get(`hzero.common.title.other.suggestion`).d('其他建议'),
        width: 180,
        dataIndex: 'otherSuggestion',
        key: 'otherSuggestion',
        render: tooltipRender,
      },
      {
        title: intl.get(`hzero.common.title.submit.date`).d('提交日期'),
        width: 130,
        dataIndex: 'submitDate',
        key: 'submitDate',
        render: dateRender,
      },
    ];
    return (
      <>
        <CusTable
          rowKey="rowKey"
          pagination={questionSurveyPagination}
          columns={columns}
          dataSource={questionSurveySource}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    );
  }
}
