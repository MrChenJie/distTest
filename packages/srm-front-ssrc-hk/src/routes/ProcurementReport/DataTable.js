import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { tableScrollWidth } from 'utils/utils';
import { dateRender, numberRender } from 'utils/renderer';
import { pullAllBy } from 'lodash';
import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import CusNotification from '_cus_components/CusNotification';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'prNo';
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
  openPurchaseApplyDetail(record) {
    console.log(record, 'record');
    const { dispatch, isPub } = this.props;
    let related = '';
    if (record.projectNumber != null) {
      related = '1';
    } else {
      related = '0';
    }
    // 跳转框架子订单页面
    if (record.prType === 'frameworkSubOrder') {
      if (record.prStatus == 'PENDING_REFER') {
        const url = `${process.env.APPROVAL_PROCESS
          }/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_KJZDDCGSQ&pcThirdContentPageUrl=${encodeURIComponent(
            `${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/ssrc-hk/frame-sub-order/edit?related=${related}&prType=${record.prType}`,
          )}`;
        window.open(url, '_blank');
      } else {
        window.open(
          `${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`,
        );
      }
    } else {
      dispatch({
        type: 'purchaseApplicationModel/commentUpdateState',
        payload: {
          projectName: record.projectName,
          prStatus: record.prStatus,
        },
      });
      if (record.prStatus == 'PENDING_REFER') {
        window.open(
          `${process.env.APPROVAL_PROCESS
          }/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_jianyixunjiacaigoushenqing&pcThirdContentPageUrl=${encodeURIComponent(
            `${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/ssrc-hk/purchaseApplication/edit?id=${record.id}&related=${related}&prType=${record.prType}`,
          )}`,
        );
      } else {
        window.open(
          `${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`,
        );
      }
    }
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
    const newSRows = selected
      ? selectedRows.concat(record)
      : selectedRows.filter((n) => n[ROW_KEY] !== record[ROW_KEY]);
    const newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item[ROW_KEY]);
    });
    let idList = [];
    console.log('newSRows', newSRows);
    newSRows.map((item) => {
      idList.push({
        id: item.id,
        prStatus: item.prStatus,
      });
    });
    this.props.getSelectedRows(idList);
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
    const {
      onChange = (e) => e,
      getQueryParams = (e) => e,
      purchaseApplicationModel,
      idpValueMap,
    } = this.props;
    const {
      selectedRows,
      selectedRowKeys,
      rfqResponseVisible,
      nowRecord,
      exportModalVisible = false,
    } = this.state;
    const { procurementReportList = [], procurementReportPagination = [] } =
      purchaseApplicationModel;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.PackageNo`).d('标包编号'),
        dataIndex: 'proNo',
        width: 150,
        // render: (val, record) => {
        //   return (
        //     <span className="action-link">
        //       <a style={{ color: '#3271FE' }} onClick={() => this.openPurchaseApplyDetail(record)}>
        //         {val}
        //       </a>
        //     </span>
        //   );
        // },
      },
      {
        title: intl.get(`${promptCode}.view.title.projectname`).d('项目名称'),
        dataIndex: 'projectName',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.requesterdepartment`).d('需求部门'),
        dataIndex: 'userDepartment',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.view.title.requester`).d('需求人'),
        dataIndex: 'requester',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.view.title.budgettype`).d('预算类别'),
        dataIndex: 'budgetType',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.tenderNo`).d('大型项目编号'),
        dataIndex: 'tenderNo',
        width: 160,
      },
      {
        title: intl.get(`${promptCode}.view.title.PPnumber`).d('采购方案编号'),
        dataIndex: 'proPlanNo',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.view.title.procurementhandler`).d('采购负责人'),
        dataIndex: 'picManager',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.view.title.PPApprovedDate`).d('采购方案审批日期'),
        dataIndex: 'ppApprovalDate',
        width: 200,
        align: 'left',
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.tenderissuedate`).d('流程开始日期招标发出日期'),
        dataIndex: 'tenderIssueDate',
        width: 250,
        align: 'left',
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.tenderclosingdate`).d('投标截止日期'),
        dataIndex: 'tenderClosingDate',
        width: 200,
        align: 'left',
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.evaluationfinishdate`).d('评估报告完成日期'),
        dataIndex: 'erfDate',
        width: 200,
        align: 'left',
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.awarddate`).d('采购结果审批日期(PC/EC会议)'),
        dataIndex: ' awardDate',
        width: 250,
        align: 'left',
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.participatedsup`).d('参与供货商'),
        dataIndex: 'partSup',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.view.title.selectedsup`).d('中选供货商'),
        dataIndex: 'selectedSup',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`${promptCode}.view.title.InitialTotalTenderAmountOriginalCurrency`).d('最初价格(原币)'),
        dataIndex: 'firstPrice',
        width: 100,
        align: 'left',
        render: (_, record) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {numberRender(record.firstPrice, 2)}
            </div>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.InitialTotalTenderAmountH`).d('最初价格(HKD)'),
        dataIndex: ' firstPriceHkd',
        width: 100,
        align: 'left',
        render: (_, record) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {numberRender(record.firstPriceHkd, 2)}
            </div>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.FinalTotalTenderAmountOriginalCurrency`).d('最终价格(原币)'),
        dataIndex: 'finalPrice',
        width: 100,
        align: 'left',
        render: (_, record) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {numberRender(record.finalPrice, 2)}
            </div>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.FinalTotalTenderAmountH`).d('最终价格(HKD)'),
        dataIndex: 'finalPriceHkd',
        width: 100,
        align: 'left',
        render: (_, record) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {numberRender(record.finalPriceHkd, 2)}
            </div>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.savingAmountOriginalCurrency`).d('节省金额(原币)'),
        dataIndex: 'saving',
        width: 100,
        align: 'left',
        render: (_, record) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {numberRender(record.saving, 2)}
            </div>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.savingAmountH`).d('节省金额(HKD)'),
        dataIndex: 'savingHkd',
        width: 100,
        align: 'left',
        render: (_, record) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {numberRender(record.savingHkd, 2)}
            </div>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.savingrate`).d('节省比例'),
        dataIndex: 'savingPercent',
        width: 100,
        align: 'left',
      }, {
        title: intl.get(`${promptCode}.view.title.completedays`).d('完成天数'),
        dataIndex: 'days',
        width: 100,
        align: 'left',
      }, {
        title: intl.get(`${promptCode}.view.title.ProcurementMethod`).d('采购方式'),
        dataIndex: 'purchaseMethod',
        width: 120,
        align: 'left',
      }, {
        title: intl.get(`${promptCode}.view.title.podate`).d('采购订单日期'),
        dataIndex: 'poDate',
        width: 200,
        align: 'left',
        render: dateRender,
      }, {
        title: intl.get(`${promptCode}.view.title.Status`).d('状态'),
        dataIndex: 'status',
        width: 100,
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
      <React.Fragment>
        <CusTable
          rowKey={ROW_KEY}
          dataSource={procurementReportList}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={procurementReportPagination}
          onChange={onChange}
          // rowSelection={rowSelection}
        />
      </React.Fragment>
    );
  }
}
