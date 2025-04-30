import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { dateRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';
import { Checkbox } from 'antd';
import dayjs from 'dayjs';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import './index.less';


export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
  }

  handleApplicationLink = (record) => {
    // const { APPROVAL_PROCESS } = process.env;
    // const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`
    // window.open(url, '_blank')
    // window.open(`/pub/dict/judges-management/detail?formRecordId=${record.applyNum}`, '_blank');
    if(record?.applyCaseId){
      window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.applyCaseId}`);
    }else{
      window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_PWRKLC&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/dict/judges-management/detail?groupId=${record.groupId}`)}`);
    }
  };

  render() {
    const {
      rowSelection,
      dataSource = [],
      pagination = {},
      onChange = (e) => e,
      idpValueMap,
      setEdit,
      handleIsEffective,
    } = this.props;
    const columns = [
      {
        title: intl.get(`spfmhk.dict.view.field.applicationno`).d('申请单号'),
        width: 160,
        dataIndex: 'applyNum',
        key: 'applyNum',
        render: (_, record) => {
          return (
            <a onClick={() => this.handleApplicationLink(record)}>
              {tooltipRender(record?.applyNum)}
            </a>
          );
        },
      },
      {
        title: intl.get(`spfmhk.dict.view.field.judge.name`).d('评委名称'),
        width: 250,
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: intl.get(`spfmhk.dict.view.field.judge.department`).d('评委部门'),
        width: 160,
        dataIndex: 'unitName',
        key: 'unitName',
      },
      {
        title: intl.get(`spfmhk.dict.view.field.applicantion.date`).d('申请日期'),
        width: 160,
        dataIndex: 'applyDate',
        key: 'applyDate',
        render: dateRender,
      },
      // {
      //   title: intl.get(`spfmhk.dict.view.field.applicantionstatus`).d('申请状态'),
      //   width: 160,
      //   dataIndex: 'applyStatus',
      //   key: 'applyStatus',
      //   render: (_, record) => {
      //     const meaning = idpValueMap['DICT.JUDGE_APPLY_STATUS']?.filter(i => i?.value === record.applyStatus)[0]?.meaning;
      //     return <>{meaning}</>;
      //   },
      // },
      {
        title: intl.get(`spfmhk.dict.view.field.applicantionstatus`).d('申请状态'),
        width: 160,
        dataIndex: 'applyStatusMeaning',
        key: 'applyStatusMeaning',
      },
      {
        title: intl
          .get(`spfmhk.dict.view.field.judge.approvalcompletiondate`)
          .d('申请审批完成日期'),
        width: 160,
        dataIndex: 'approveDate',
        key: 'approveDate',
        render: (_, record) => {
          const date = (record.approveDate) ? dayjs(record.approveDate).format(DEFAULT_DATE_FORMAT) : null;
          return <>{date}</>;
        },
      },
      {
        title: intl.get(`spfmhk.dict.view.field.judge.enable`).d('是否启用'),
        width: 100,
        dataIndex: 'isEffective',
        key: 'isEffective',
        render: (_, record, index) => {
          return record.applyStatus === 'FINISHED' ? (
            <Checkbox
              checkedValue="Y"
              unCheckedValue="N"
              checked={record.isEffective === 'Y'}
              disabled={
                !(
                  setEdit &&
                  rowSelection.selectedRowKeys?.filter((item) => item === record.rowKey)?.length > 0
                )
              }
              onChange={(e) => {
                handleIsEffective(index, e.target.checked ? 'Y' : 'N');
              }}
            />
          ) : (
            <></>
          );
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
