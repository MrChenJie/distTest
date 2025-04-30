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
    const isPub = location.pathname.includes('pub'); 
    if(record.caseId) {
    const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`
    window.open(url, '_blank')
    } else {
      const templateCode = match?.params?.type =='create' ? 'BPM_SCM_HZALXZ' : 'BPM_SCM_HZALGX'; // 致远templateCode
      const url = `${
        process.env.APPROVAL_PROCESS
      }/main/child-frame/app-approval/quick/process?templateCode=${templateCode}&pcThirdContentPageUrl=${match?.params?.type =='create' ? encodeURIComponent(
        `${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/mylink/collaboration-case/Detail/${match.params.type}?id=${record.partnerCaseId}`
      ) : encodeURIComponent(
        `${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/mylink/collaboration-case/Detail/${match.params.type}?id=${record.caseRecordId}`
      ) }`;
      window.open(url, '_blank');
    }
    
    // const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`
    // window.open(url, '_blank')
    // window.open(`/pub/platform/activey-application/Detail?formRecordId=${record.id}`, '_blank')
    // window.open(`${isPub ? '/pub' : ''}/mylink/collaboration-case/Detail/${match.params.type}?id=${ record.partnerCaseId || record.caseRecordId}`);
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
      {
        title: match.params.type == "create" ? intl.get(`spfmhk.mylink.field.cooperate.casecode`).d('合作案例编码') : intl.get(`spfmhk.mylink.field.apply.num`).d('合作案例编码'),
        width: 120,
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
      {
        title: intl.get(`spfmhk.mylink.field.cooperate.case.title`).d('案例标题'),
        width:240,
        dataIndex: 'caseTitle',
        key: 'caseTitle',
        render: (_, record) => {
          return (
            match.params.type != "create" ? tooltipRender(record.caseTitle) : 
            <a onClick={() => this.handleActiveLink(record)}>
              {tooltipRender(record.caseTitle)}
            </a>
          )
        }
      },
      {
        title: intl.get(`spfmhk.mylink.field.cooperate.mode`).d('合作方式'),
        width: 180,
        dataIndex: 'cooperationMode',
        key: 'cooperationMode',
        render: tooltipRender,

      },
      match.params.type == "create" &&{
        title: intl.get(`spfmhk.mylink.field.sort`).d('排序'),
        width: 100,
        dataIndex: 'sort',
        key: 'sort',
        render: tooltipRender,
      },
      match.params.type == "create" &&{
        title: intl.get(`spfmhk.mylink.field.effective.status`).d('生效状态'),
        width: 100,
        dataIndex: 'effectiveOrNotMeaning',
        key: 'effectiveOrNotMeaning',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.mylink.field.applicant`).d('创建人'),
        width: 300,
        dataIndex: 'applicant',
        key: 'applicant',
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.mylink.field.apply.status`).d('申请状态'),
        width: 140,
        dataIndex: 'applicationStatusMeaning',
        key: 'applicationStatusMeaning',
      },
      {
        title: intl.get(`spfmhk.mylink.field.apply.date`).d('创建日期'),
        width: 160,
        dataIndex: 'applicantDate',
        key: 'applicantDate',
        render: dateRender,
      },
      // {
      //   title: intl.get(`spfmhk.mylink`).d('操作'),
      //   width: 120,
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
          rowKey={match.params.type == 'create' ? "partnerCaseId": "caseRecordId"}
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
