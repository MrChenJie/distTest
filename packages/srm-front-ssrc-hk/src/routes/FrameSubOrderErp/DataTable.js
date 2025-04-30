import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { tableScrollWidth } from 'utils/utils';
import { dateRender, numberRender } from 'utils/renderer';
import { pullAllBy } from 'lodash';
import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import CusNotification from '_cus_components/CusNotification';
import { routerRedux } from 'dva/router';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'prNumber';
export default class DataTable extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
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
  openPurchaseApplyDetail(record) {
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    const { dispatch } = this.props;
    let related = '';
    if (record.projectNumber != null) {
      related = 'yes';
    } else {
      related = 'no';
    }
    let url = `${isPub ? '/pub' : ''}/ssrc-hk/frame-sub-order/edit/${related}/${record.prType}/${record.id}`;
    window.open(url, '_blank');
    // dispatch(
    //   routerRedux.push({
    //     pathname: `/ssrc-hk/frame-sub-order/edit/${related}/${record.prType}/${record.id}`,
    //   })
    // );
  }

  /**
   * @description 删除
   */
  @Bind()
  handleDelete() {
    const { onDetele = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    onDetele(selectedRows, this.clearState);
  }

  @Bind()
  onSelect(record, selected) {
    const { selectedRows = [] } = this.state;
    const { getSelectedRows = (e) => e } = this.props;
    const newSRows = selected
      ? selectedRows.concat(record)
      : selectedRows.filter((n) => n[ROW_KEY] !== record[ROW_KEY]);
    const newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item[ROW_KEY]);
    });
    let idList = [];
    newSRows.map((item) => {
      idList.push({
        id: item.id,
        prStatus: item.prStatus,
      });
    });
    getSelectedRows(idList);
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
    const { onChange = (e) => e, frameSubOrderModel, idpValueMap } = this.props;
    const { selectedRows, selectedRowKeys } = this.state;
    const { purchaseApplicationList = [], purchaseApplicationPagination = {} } = frameSubOrderModel;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.prnumber`).d('采购申请编号'),
        dataIndex: 'prNumber',
        width: 160,
        render: (val, record) => {
          return (
            <span className="action-link">
              <a style={{ color: '#3271FE' }} onClick={() => this.openPurchaseApplyDetail(record)}>
                {val}
              </a>
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.prname`).d('采购申请名称'),
        dataIndex: 'prName',
        width: 220,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.pprstatus`).d('采购申请状态'),
        dataIndex: 'prStatus',
        width: 120,
        render: (_, record) => {
          return (
            <span>
              {record.prStatus === 'PENDING_REFER'
                ? '草稿'
                : record.prStatus === 'In_Approval'
                ? '审批中'
                : record.prStatus === 'Approved'
                ? '已审批'
                : '已关闭'}
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.pprdate`).d('采购申请日期'),
        dataIndex: 'applyingDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.prapproveddate`).d('申请审批完成日期'),
        dataIndex: 'prApprovedDate',
        width: 160,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.applicant`).d('申请人'),
        dataIndex: 'applicantUserName',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.view.title.aapplyingdepartment`).d('申请部门'),
        dataIndex: 'applyingDepartmentName',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.view.title.prtype`).d('采购申请类型'),
        dataIndex: 'prType',
        width: 120,
        align: 'left',
        render: (_, record) => {
          return (
            <span>
              {idpValueMap['HKPC.PRTYPE']?.find((item) => item?.value === record.prType)?.meaning}
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.ettimatedbudgetamountO`).d('预估总金额(原币)'),
        dataIndex: 'estimatedBudgetAmount',
        width: 300,
        align: 'left',
        render: (_, record) => {
          return (
            <span style={{ display: 'block', textAlign: 'right' }}>
              {numberRender(record.estimatedBudgetAmount, 2)}
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.ettimatedbudgetamountH`).d('预估总金额(HKD)'),
        dataIndex: 'estimatedBudgetAmountHkd',
        width: 300,
        align: 'left',
        render: (_, record) => {
          return (
            <span style={{ display: 'block', textAlign: 'right' }}>
              {numberRender(record.estimatedBudgetAmountHkd, 2)}
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.prcurrency`).d('币种'),
        dataIndex: 'currency',
        width: 100,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.view.title.prrate`).d('申请汇率'),
        dataIndex: 'prRate',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.view.title.progressquery`).d('进度查询'),
        dataIndex: 'progressQuery',
        width: 120,
        align: 'left',
        render: (_, record) => {
          return (
            <span>
              {record.progressQuery === 'prStage'
                ? '采购申请阶段'
                : record.progressQuery === 'ppStage'
                ? '采购方案阶段'
                : record.progressQuery === 'piStage'
                ? '采购实施阶段'
                : record.progressQuery === 'prSatge'
                ? '采购结果阶段'
                : '采购订单阶段'}
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.prcategory`).d('采购类别'),
        dataIndex: 'purchasingCategory',
        width: 120,
        align: 'left',
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
          dataSource={purchaseApplicationList}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={purchaseApplicationPagination}
          onChange={onChange}
          rowSelection={rowSelection}
        />
      </>
    );
  }
}
