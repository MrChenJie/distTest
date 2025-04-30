/**
 * SimpleInquireResult - 简易询价
 * @date: 2023-10-19
 * @author: jinkai.lu
 * @version: 0.0.1
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { tableScrollWidth } from 'utils/utils';
import { pullAllBy } from 'lodash';
import intl from 'utils/intl';
import { numberRender, dateRender } from 'utils/renderer';
import CusTable from '_cus_components/CusTable';
import { tooltipRender } from '_cus_utils/render';

const promptCode = 'HKPC.commom';
export default class SimpleInquireResult extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    };
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

   // 选中行
   @Bind()
   handleSelect(record, selected) {
     console.log(record,'record');
     const { selectedRows = [] } = this.state;
     const newSRows = selected
       ? selectedRows.concat(record)
       : selectedRows.filter((n) => n.id !== record.id);
     // 选择的行key
     let newSelectedRowKeys = [];
     newSRows.forEach((item) => {
       newSelectedRowKeys.push(item.id);
     });
     this.setState({
       selectedRows: newSRows,
       selectedRowKeys: newSelectedRowKeys,
     });
   }
 
   // 全选/全不选
   @Bind()
   handleSelectAll(selected, newSelectedRows, changeRows) {
     const { selectedRows = [] } = this.state;
     const newSRows = selected
       ? selectedRows.concat(changeRows)
       : pullAllBy([...selectedRows], changeRows, 'id');
     let newSelectedRowKeys = [];
     newSRows.forEach((item) => {
       newSelectedRowKeys.push(item.id);
     });
     this.setState({
       selectedRows: newSRows,
       selectedRowKeys: newSelectedRowKeys,
     });
   }

  /**
   * 跳转详情界面
   * @param {object} record
   */
  @Bind()
  openDetail(record) {
    const { isPub } = this.props;
    const { rqNumber } = record;
    const url = `${isPub ? '/pub' : ''}/ssrc-hk/purchase-implement-page-detail?enter=list&createBy=${rqNumber}`;
    window.open(url);
  }

  render() {
    const {
      evaluationList,
      evaluationListPagination,
      onPageChange = (e) => e,
    } = this.props;
    const { selectedRowKeys = [] } = this.state;
    const columns = [
      {
        dataIndex: 'rqNumber',
        key: 'rqNumber',
        title: intl.get(`${promptCode}.view.title.RQnumber`).d('询价单号'),
        width: 180,
        render: (_, record) => {
          return (
            <a
              onClick={() => this.openDetail(record)}
            >
              {tooltipRender(record.rqNumber)}
            </a>
          );
        },
      },
      {
        dataIndex: 'rqName',
        key: 'rqName',
        title: intl.get(`${promptCode}.view.title.RQname`).d('询价单名称'),
        width: 180,
        render: tooltipRender,
      },
      // {
      //   dataIndex: 'rqStatusMeaning',
      //   key: 'rqStatusMeaning',
      //   title: intl.get(`${promptCode}.view.title.RQstatus`).d('询价单状态'),
      //   width: 120,
      //   render: tooltipRender,
      // },
      {
        dataIndex: 'prDate',
        key: 'prDate',
        title: intl.get(`${promptCode}.view.title.pprdate`).d('采购申请日期'),
        width: 140,
        render: dateRender,
      },
      {
        dataIndex: 'prApprovedDate',
        key: 'prApprovedDate',
        title: intl.get(`${promptCode}.view.title.prapproveddate`).d('申请审批完成日期'),
        width: 160,
        render: dateRender,
      },
      {
        dataIndex: 'applicant',
        key: 'applicant',
        title: intl.get(`${promptCode}.view.title.applicant`).d('申请人'),
        width: 230,
        render: tooltipRender,
      },
      {
        dataIndex: 'applyingDepartment',
        key: 'applyingDepartment',
        title: intl.get(`${promptCode}.view.title.aapplyingdepartment`).d('申请部门'),
        width: 160,
        render: tooltipRender,
      },
      {
        dataIndex: 'prTypeMeaning',
        key: 'prTypeMeaning',
        title: intl.get(`${promptCode}.view.title.prtype`).d('采购申请类型'),
        width: 200,
        render: tooltipRender,
      },
      {
        dataIndex: 'prNumber',
        key: 'prNumber',
        title: intl.get(`${promptCode}.view.title.prnumber`).d('采购申请编号'),
        width: 180,
        render: tooltipRender,
      },
      {
        dataIndex: 'prName',
        key: 'prName',
        title: intl.get(`${promptCode}.view.title.prname`).d('采购申请名称'),
        width: 180,
        render: tooltipRender,
      },
      {
        dataIndex: 'estimatedBudgetAmount',
        key: 'estimatedBudgetAmount',
        title: intl.get(`${promptCode}.view.title.ettimatedbudgetamountO`).d('预估总金额（原币）'),
        width: 180,
        render: (_, record) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {tooltipRender(numberRender(record.estimatedBudgetAmount, 2))}
            </div>
          )
        },
      },
      {
        dataIndex: 'estimatedBudgetAmountHkd',
        key: 'estimatedBudgetAmountHkd',
        title: intl.get(`${promptCode}.view.title.ettimatedbudgetamountH`).d('预估总金额（HKD）'),
        width: 180,
        render: (_, record) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {tooltipRender(numberRender(record.estimatedBudgetAmountHkd, 2))}
            </div>
          )
        },
      },
      {
        dataIndex: 'prCurrency',
        key: 'prCurrency',
        title: intl.get(`${promptCode}.view.title.pprcurrency`).d('申请币种'),
        width: 110,
        render: tooltipRender,
      },
      {
        dataIndex: 'prRate',
        key: 'prRate',
        title: intl.get(`${promptCode}.view.title.prrate`).d('申请汇率'),
        width: 110,
        render: tooltipRender,
      },
      // {
      //   dataIndex: 'purchasingCategoryMeaning',
      //   key: 'purchasingCategoryMeaning',
      //   title: intl.get(`${promptCode}.view.title.prcategory`).d('采购类别'),
      //   width: 180,
      //   render: tooltipRender,
      // },
      {
        dataIndex: 'agent',
        key: 'agent',
        title: intl.get(`${promptCode}.view.title.procurementhandler`).d('采购经办人'),
        width: 180,
        render: tooltipRender,
      },
    ]

    const rowSelection = {
      columnWidth: 50,
      selectedRowKeys,
      onSelect: this.handleSelect,
      onSelectAll: this.handleSelectAll,
    };
    const tableProps = {
      dataSource: evaluationList,
      columns,
      pagination: evaluationListPagination,
      rowKey: 'id',
      rowSelection: rowSelection,
      scroll: { x: tableScrollWidth(columns) }, // y: 480
      onChange: onPageChange,
    };
    return (
      <>
        <CusTable {...tableProps} />
      </>
    )
  }
}