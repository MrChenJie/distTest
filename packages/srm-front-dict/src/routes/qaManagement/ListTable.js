import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { dateRender, operatorRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';
import { Button as ButtonPermission } from 'components/Permission';

const commonPrompt = 'spfmhk.dict';

export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    const {
      history,
      rowSelection,
      dataSource = [],
      pagination = {},
      onChange = (e) => e,
      idpValueMap,
    } = this.props;

    const columns = [
      {
        title: intl.get(`${commonPrompt}.view.common.partnername`).d('合作伙伴名称'),
        width: 180,
        dataIndex: 'partnerName',
        key: 'partnerName',
        render: tooltipRender,
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portalquestiontype`).d('问题类型'),
        width: 180,
        dataIndex: 'caseTypeLov',
        key: 'caseTypeLov',
        render: tooltipRender,
      },
      {
        title: intl.get(`${commonPrompt}.view.field.qadetails`).d('问题详情'),
        width: 180,
        dataIndex: 'qaContent',
        key: 'qaContent',
        render: tooltipRender,
      },
      {
        title: intl.get(`${commonPrompt}.view.field.qaaskdate`).d('提问日期'),
        width: 160,
        dataIndex: 'submitTime',
        key: 'submitTime',
        render: dateRender,
      },
      {
        title: intl.get(`${commonPrompt}.view.field.portalreplystatus`).d('回复状态'),
        width: 160,
        dataIndex: 'replyStatusLov',
        key: 'replyStatusLov',
        render: tooltipRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        key: 'action',
        width: 180,
        fixed: 'right',
        render: (_, record) => {
          const operators = [
            {
              key: 'view',
              ele: (
                <ButtonPermission
                  type="text"
                  onClick={() => {
                    window.open(
                      `/pub/dict/QA-management/detail?type=view&qaId=${record.qaId}`,
                      '_blank'
                    );
        
                  }}
                >
                  {intl.get('hzero.common.button.view').d('查看')}
                </ButtonPermission>
              ),
              len: 3,
              title: intl.get('hzero.common.button.view').d('查看'),
            },
            {
              key: 'answer',
              ele: (
                <ButtonPermission
                  disabled={record.replyStatus !== 'PROCESSING'}
                  type="text"
                  onClick={() => {
                    window.open(
                      `/pub/dict/QA-management/detail?type=answer&qaId=${record.qaId}`,
                      '_blank'
                    );
           
                  }}
                >
                 {intl.get(`${commonPrompt}.view.field.common.answer`).d('回答')} 
                </ButtonPermission>
              ),
              len: 3,
              title: intl.get(`${commonPrompt}.view.field.common.answer`).d('回答'),
            },
          ];
          return operatorRender(operators);
        },
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
