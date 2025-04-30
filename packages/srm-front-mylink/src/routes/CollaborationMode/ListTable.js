/*
 * @Author: 陆海涛 haitao.lu02@hand-china.com
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
    const {
      match,
      location
    } = this.props
    if (record.caseId) {
      const isPub = location.pathname.includes('pub');
      const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`
      window.open(url, '_blank')
    } else {
      const templateCode = match.params.type == 'create' ? 'BPM_SCM_HZXZ' : 'BPM_SCM_HZGX'; // 致远templateCode
      const url = `${process.env.APPROVAL_PROCESS
        }/main/child-frame/app-approval/quick/process?templateCode=${templateCode}&pcThirdContentPageUrl=${encodeURIComponent(
          `${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/mylink/collaboration-mode/Detail/${match.params.type}?id=${record.modeId || record.modeRecordId}`
        )}`;
      console.log(url)
      window.open(url, '_blank');
    }
  }

  handleCopy = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'CollaborationModeModal/queryList',
      payload: {
        id: record.id
      },
    });
  }

  handleDelete = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'CollaborationModeModal/queryList',
      payload: {
        id: record.id
      },
    });
  }

  render() {
    const {
      rowSelection,
      dataSource = [],
      pagination = {},
      onChange = (e) => e,
      match
    } = this.props;
    const columns = [
      match.params.type != "create" && {
        title: intl.get(`spfmhk.mylink.field.apply.num`).d('申请单号'),
        width: 160,
        dataIndex: 'applicationNo',
        key: 'applicationNo',
        render: (_, record) => {
          return (
            <a onClick={() => this.handleActiveLink(record)}>
              {tooltipRender(record.applicationNo)}
            </a>
          )
        }
      },
      match.params.type == "create" && {
        title: intl.get(`spfmhk.mylink.field.cooperate.modecode`).d('合作模式编码'),
        width: 160,
        dataIndex: 'applicationNo',
        key: 'applicationNo',
        render: (_, record) => {
          return (
            match.params.type != "create" ? tooltipRender(record.applicationNo) :
              <a onClick={() => this.handleActiveLink(record)}>
                {tooltipRender(record.applicationNo)}
              </a>
          )
        }
      },
      {
        title: intl.get(`spfmhk.mylink.field.cooperate.mode`).d('合作方式'),
        width: 160,
        dataIndex: 'cooperationMode',
        key: 'cooperationMode',
        render: (_, record) => {
          return (
            match.params.type != "create" ? tooltipRender(record.cooperationMode) :
              <a onClick={() => this.handleActiveLink(record)}>
                {tooltipRender(record.cooperationMode)}
              </a>
          )
        }
      },
      match.params.type == "create" && {
        title: intl.get(`spfmhk.mylink.field.sort`).d('排序'),
        width: 60,
        dataIndex: 'sort',
        key: 'sort',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.mylink.field.applicant`).d('创建人'),
        width: 200,
        dataIndex: 'applicant',
        key: 'applicant',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.mylink.field.apply.status`).d('申请状态'),
        width: 150,
        dataIndex: 'applicationStatusMeaning',
        key: 'applicationStatusMeaning',
      },
      {
        title: intl.get(`spfmhk.mylink.field.apply.date`).d('创建日期'),
        width: 100,
        dataIndex: 'applicantDate',
        key: 'applicantDate',
        render: dateRender,
      },
      match.params.type == "create" && {
        title: intl.get(`spfmhk.mylink.field.effective.status`).d('状态'),
        width: 80,
        key: 'effectiveOrNotMeaning',
        dataIndex: 'effectiveOrNotMeaning',
        render: tooltipRender,
      }
      // {
      //   title: intl.get(`spfmhk.mylink`).d('操作'),
      //   width: 80,
      //   key: 'operator',
      //   render: (_, record) => {
      //     return (
      //       <>
      //         {!record.isDisable &&(<CusButton style={record.isDisable? { marginRight: '16px' } : {}} type="plain" onClick={() => handleCopy(record)}>
      //           {intl.get('hzero.common').d('生效')}
      //         </CusButton>)}
      //         {record.isDisable && (
      //           <CusButton type="plain" onClick={() => handleDelete(record)}>
      //             {intl.get('hzero.common').d('失效')}
      //           </CusButton>
      //         )
      //         }
      //       </>
      //     )
      //   },
      // }
    ].filter(Boolean);
    return (
      <>
        <CusTable
          rowKey={match.params.type == 'create' ? "modeId" : "modeRecordId"}
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
