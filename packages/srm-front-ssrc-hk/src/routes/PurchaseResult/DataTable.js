import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { tableScrollWidth } from 'utils/utils';
import { dateRender, numberRender } from 'utils/renderer';
import { pullAllBy } from 'lodash';
import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import RfqResponse from './components/RfqResponse';
import querystring from 'querystring';

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
      rfqResponseVisible: false,
      exportModalVisible: false,
      nowRecord: {},
    };
  }

  @Bind()
  clearState() {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    });
  }

  @Bind()
  openEnquiryResponseModal(record) {
    this.setState({
      rfqResponseVisible: true,
      nowRecord: record,
    });
  }

  /**
   * 跳转详情界面
   * @param {object} record
   */
  @Bind()
  openPriceEntryDetail(record) {
    window.open(
      `${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`,
    );
  }

  /**
   * @description 提交生成采购审批
   */
  @Bind()
  handleSubmitToApproval() {
    const { onSubmitToApproval = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    onSubmitToApproval(selectedRows);
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

  /**
   * @description 发布询价
   */
  @Bind()
  handlePublish() {
    const { onPublish = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    onPublish(selectedRows);
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

  renderButtons = ({ parent }) => {
    const {
      publishLoading = false,
      submitLoading = false,
      deleteLoading = false,
      exportLoading = false,
    } = parent.props;
    const { onMassCreate = (e) => e, onOpenModal = (e) => e, onExport = (e) => e } = this.props;

    return (
      <>
        <CusButton mini onClick={onExport} loading={exportLoading}>
          {intl.get('hzero.common.button.export').d('导出')}
        </CusButton>
        <CusButton mini onClick={this.handleSubmitToApproval} loading={submitLoading}>
          {intl.get(`${promptCode}.button.submitToApproval`).d('提交')}
        </CusButton>
        <CusButton mini onClick={this.handleDelete} loading={deleteLoading}>
          {intl.get('hzero.common.button.delete').d('删除')}
        </CusButton>
        <CusButton mini onClick={this.handlePublish} loading={publishLoading}>
          {intl.get(`${promptCode}.button.publish`).d('发布询价')}
        </CusButton>
        <CusButton mini onClick={onMassCreate}>
          {intl.get(`${promptCode}.button.massCreate`).d('批量创建')}
        </CusButton>
        <CusButton mini onClick={onOpenModal} type="primary">
          {intl.get('hzero.common.button.create').d('新建')}
        </CusButton>
      </>
    );
  };

  render() {
    const { onChange = (e) => e, getQueryParams = (e) => e, purchaseResultModel, idpValueMap } = this.props;
    const {
      selectedRows,
      selectedRowKeys,
      rfqResponseVisible,
      nowRecord,
      exportModalVisible = false,
    } = this.state;
    const { purchaseResultList = [], purchaseResultPagination = {} } = purchaseResultModel;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.PAnumber`).d('采购结果编号'),
        dataIndex: 'paNumber',
        width: 160,
        render: (val, record) => {
          return (
            <span className="action-link">
              <a style={{ color: '#3271FE' }} onClick={() => this.openPriceEntryDetail(record)}>
                {val}
              </a>
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.PAName`).d('采购结果名称'),
        dataIndex: 'paName',
        width: 220,
        render: tooltipRender,
      },
      // {
      //   title: intl.get(`${promptCode}.view.title.PAStatus`).d('采购结果状态'),
      //   dataIndex: 'paStatusMeaning',
      //   width: 120,
      //   render: (_, record) => tooltipRender(record.paStatusMeaning),
      // },
      {
        title: intl.get(`${promptCode}.view.title.PAApplicationDate`).d('结果申请日期'),
        dataIndex: 'creationDate',
        width: 120,
        render: dateRender,
      },
      // {
      //   title: intl.get(`${promptCode}.view.title.PaApprovedDate`).d('结果审批完成日期'),
      //   dataIndex: 'paApprovedDate',
      //   width: 160,
      //   render: dateRender,
      // },
      {
        title: intl.get(`${promptCode}.view.title.applicant`).d('申请人'),
        dataIndex: 'applicantUserName',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.procurementhandler`).d('采购经办人'),
        dataIndex: 'procurementHandler',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.aapplyingdepartment`).d('申请部门 '),
        dataIndex: 'applyingDepartmentName',
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
        dataIndex: 'prNumber',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.PPnumber`).d('采购方案编号'),
        dataIndex: 'ppNumber',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.ProcurementMethod`).d('采购方式'),
        dataIndex: 'procurementMethod',
        width: 120,
        render: (_, record) => {
          return (
            <span>{(idpValueMap['HKPC.PPPROCUREMENTMETHOD']?.find(item => item?.value === record.procurementMethod))?.meaning}</span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.ettimatedbudgetamountH`).d('预估总金额(HKD)'),
        dataIndex: 'estimatedBudgetAmountHkd',
        width: 180,
        render: (_, record) => {
          return (
            <span style={{ display: 'block', textAlign: 'right' }}>
              {numberRender(record.estimatedBudgetAmountHkd, 2)}
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.PAAmountH`).d('采购结果金额(HKD)'),
        dataIndex: 'paAmountHKD',
        width: 180,
        render: (_, record) => {
          return <span style={{ display: 'block', textAlign: 'right' }}>{numberRender(record.paAmountHKD, 2)}</span>;
        },
      },
      // {
      //   title: intl.get(`${promptCode}.view.title.MeetingType`).d('会议类型'),
      //   dataIndex: 'meetingType',
      //   width: 100,
      //   align: 'left',
      // },
      // {
      //   title: intl.get(`${promptCode}.view.title.MeetingDate`).d('会议日期'),
      //   dataIndex: 'meetingDate',
      //   width: 120,
      //   align: 'left',
      //   render: dateRender,
      // },
      {
        title: intl.get(`${promptCode}.view.title.WinningSupplier`).d('中选供应商'),
        dataIndex: 'winningSupplier',
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
      <React.Fragment>
        <CusTable
          rowKey={ROW_KEY}
          dataSource={purchaseResultList}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={purchaseResultPagination}
          onChange={onChange}
          rowSelection={rowSelection}
        />
      </React.Fragment>
    );
  }
}
