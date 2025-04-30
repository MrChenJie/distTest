import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { tableScrollWidth } from 'utils/utils';
import { pullAllBy } from 'lodash';
import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import CusNotification from '_cus_components/CusNotification'
/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'id';
export default class DataTable extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
    };
  }

  @Bind()
  clearState() {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    });
  }

  /**
   * 跳转详情界面
   * @param {object} record
   */
  @Bind()
  openPriceEntryDetail(record) {
    if (record.caseId) {
      window.open(
        `${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`
      );
    }
    else {
      CusNotification.warning({
        message: '缺少caseId',
      })
    }
  }

  @Bind()
  onSelect(record, selected) {
    const { selectedRows = [] } = this.state;
    const newSRows = selected
      ? selectedRows.concat(record)
      : selectedRows.filter((n) => n[ROW_KEY] !== record[ROW_KEY]);
    const newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item[ROW_KEY]);
    });
    console.log('newSRows', newSRows);
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
    });
  }

  @Bind()
  onSelectAll(selected, _, changeRows) {
    const { selectedRows = [] } = this.state;
    const newSRows = selected
      ? selectedRows.concat(changeRows)
      : pullAllBy([...selectedRows], changeRows, ROW_KEY);
    const newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item[ROW_KEY]);
    });
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
    });
  }

  render() {
    const { onChange = (e) => e, purchaseResultModel } = this.props;
    const { selectedRows, selectedRowKeys } = this.state;
    const { draftList = [], draftPagination = {} } = purchaseResultModel;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.RQnumber`).d('询价单号'),
        dataIndex: 'thirdNum',
        width: 160,
        render: (val, record) => {
          return <a onClick={() => this.openPriceEntryDetail(record)}>{val}</a>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.RQname`).d('询价单名称'),
        dataIndex: 'thirdName',
        width: 220,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.PackageNo`).d('标包编号'),
        dataIndex: 'packageNum',
        width: 180,
        render: (val, record) => {
          return <a onClick={() => this.openPriceEntryDetail(record)}>{val}</a>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.PackageName`).d('标包名称'),
        dataIndex: 'packageName',
        width: 220,
        render: tooltipRender,
      },

      {
        title: intl.get(`${promptCode}.view.title.applicant`).d('申请人'),
        dataIndex: 'applyName',
        width: 150,
        render: tooltipRender,
      },

      {
        title: intl.get(`${promptCode}.view.title.aapplyingdepartment`).d('申请部门 '),
        dataIndex: 'applyDepName',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.requester`).d('需求人'),
        dataIndex: 'requireName',
        width: 150,
        render: tooltipRender,
      },

      {
        title: intl.get(`${promptCode}.view.title.requesterdepartment`).d('需求人部门'),
        dataIndex: 'requireDepName',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.prtype`).d('采购申请类型'),
        dataIndex: 'prTypeMeaning',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.prnumber`).d('采购申请编号'),
        dataIndex: 'prNum',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.prname`).d('采购申请名称'),
        dataIndex: 'prName',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.PPnumber`).d('采购方案编号'),
        dataIndex: 'planNum',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.ProcurementMethod`).d('采购方式'),
        dataIndex: 'purchaseTypeMean',
        width: 120,
        render: tooltipRender,
      },
    ];

    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onSelect: this.onSelect,
      onSelectAll: this.onSelectAll,
    };
    return (
      <>
        <CusTable
          rowKey={ROW_KEY}
          dataSource={draftList}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={draftPagination}
          onChange={onChange}
          rowSelection={rowSelection}
        />
      </>
    );
  }
}
