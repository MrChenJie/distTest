import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { dateTimeRender, dateRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';
import { Checkbox } from 'antd';
import dayjs from 'dayjs';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

export default class ListTable extends React.Component {
  constructor(props) {
    super(props);
  }

  handleApplicationLink = (record) => {
    const { APPROVAL_PROCESS } = process.env;
    const url = `${APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`
    window.open(url, '_blank')
    // window.open(`/pub/dict/judges-management/detail?formRecordId=${record.applyNum}`, '_blank');
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
        dataIndex: 'applyNumber',
        key: 'applyNumber',
        render: (_, record) => {
          return (
            <a onClick={() => this.handleApplicationLink(record)}>
              {tooltipRender(record?.applyNumber)}
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
        dataIndex: 'judgeUnitCodeMeaning',
        key: 'judgeUnitCodeMeaning',
      },
      {
        title: intl.get(`spfmhk.dict.view.field.applicantion.date`).d('申请日期'),
        width: 160,
        dataIndex: 'creationDate',
        key: 'creationDate',
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
        dataIndex: 'headApplyStatusMeaning',
        key: 'headApplyStatusMeaning',
        // render: (_, record) => {
        //  let newObj = idpValueMap['HKTB.ACTIVITY_PROSTATUS']?.find(item=> item.value == record.applyStatus)
        //  console.log(newObj, idpValueMap['HKTB.ACTIVITY_PROSTATUS'])
        //  return newObj?.meaning
        // }
      },
      {
        title: intl.get(`spfmhk.dict.view.field.judge.approvalcompletiondate`).d('申请审批完成日期'),
        width: 160,
        dataIndex: 'approveDate',
        key: 'approveDate',
        render: (_, record) => {
          const date = dayjs(record.approveDate).format(DEFAULT_DATE_FORMAT);
          return <>{date}</>;
        },
      },
      {
        title: intl.get(`spfmhk.dict.view.field.judge.enable`).d('是否启用'),
        width: 100,
        dataIndex: 'isEffective',
        key: 'isEffective',
        render: (_, record, index) => {
          return (
            record.applyStatus === 'Approved' ?
              <Checkbox checkedValue="Y" unCheckedValue="N" checked={record.isEffective === 'Y'}
                        disabled={!(setEdit && (rowSelection.selectedRowKeys?.filter(item => item === record.judgeId))?.length > 0)}
                        onChange={(e) => {
                          handleIsEffective(index, e.target.checked ? 'Y' : 'N');
                        }}
              /> : <></>
          );
        },
      },
    ];
    return (
      <>
        <CusTable
          rowKey="judgeId"
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
