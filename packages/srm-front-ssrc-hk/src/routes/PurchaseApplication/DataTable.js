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
const ROW_KEY = 'prNumber';
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
    if (record.projectType == '0') {
      related = '0';
    } else if(record.projectType == '1') {
      related = '1';
    } else {
      related = '2';
    }
    // 跳转框架子订单页面
    if(record?.caseId) {
      window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`,);

    } else {
      if (record.prType === 'frameworkSubOrder') {
        if (record.prStatus == 'PENDING_REFER') {
          const url = `${
            process.env.APPROVAL_PROCESS
          }/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_KJZDDCGSQ&pcThirdContentPageUrl=${encodeURIComponent(
            `${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/ssrc-hk/frame-sub-order/edit?related=${related}&prType=${record.prType}`,
          )}`;
          window.open(url, '_blank');
        } else {
          window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`,);
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
          if(['salesbusinessproduct'].includes(record.prType)) {
            const templateCode = 'BPM_SCM_SJJYWYPSP';
            // 预算类型是手机及业务用品
            window.open(
              `${
                process.env.APPROVAL_PROCESS
              }/main/child-frame/app-approval/quick/process?templateCode=${templateCode}&pcThirdContentPageUrl=${encodeURIComponent(
                `${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/ssrc-hk/phoneBusiness/Detail?activeId=${record?.id}&related=2&prType=${this.state.prType}`
              )}`,
              '_blank'
            );
          } else if(['consignment', 'freeofcharge'].includes(record.prType)) {
            const templateCode = 'BPM_SCM_MFPJJS';
            // 预算类型是寄售品&免费品
            window.open(
              `${
                process.env.APPROVAL_PROCESS
              }/main/child-frame/app-approval/quick/process?templateCode=${templateCode}&pcThirdContentPageUrl=${encodeURIComponent(
                `${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/ssrc-hk/phoneBusiness/Detail?activeId=${record?.id}&related=2&prType=${this.state.prType}`
              )}`,
              '_blank'
            );
          } else {
            window.open(
              `${
                process.env.APPROVAL_PROCESS
              }/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_jianyixunjiacaigoushenqing&pcThirdContentPageUrl=${encodeURIComponent(
                `${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/ssrc-hk/purchaseApplication/edit?id=${record.id}&related=${related}&prType=${record.prType}`,
              )}`,
            );
          }
        } else {
          window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`,);
        }
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
      purchaseApplicationModel,
      idpValueMap,
      rowSelection,
    } = this.props;
    const { purchaseApplicationList = [], purchaseApplicationPagination = [] } =
      purchaseApplicationModel;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.prnumber`).d('采购申请编号'),
        dataIndex: 'prNumber',
        width: 180,
        render: (_, record) => {
          return (
            <a onClick={() => this.openPurchaseApplyDetail(record)}>
              {tooltipRender(record.prNumber)}
            </a>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.prname`).d('采购申请名称'),
        dataIndex: 'prName',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.pprstatus`).d('采购申请状态'),
        dataIndex: 'prStatus',
        width: 120,
        render: (_, record) => {
          return (
            <span>
              {
                idpValueMap['HKPC.PRRECORDSSTATUS']?.find((item) => item?.value === record.prStatus)
                  ?.meaning
              }
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
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.aapplyingdepartment`).d('申请部门'),
        dataIndex: 'applyingDepartmentName',
        width: 110,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.prtype`).d('采购申请类型'),
        dataIndex: 'prType',
        width: 180,
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
        width: 180,
        render: (_, record) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {tooltipRender(numberRender(record.estimatedBudgetAmount, 2))}
            </div>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.ettimatedbudgetamountH`).d('预估总金额(HKD)'),
        dataIndex: 'estimatedBudgetAmountHkd',
        width: 180,
        render: (_, record) => {
          return (
            <div style={{ textAlign: 'right' }}>
              {tooltipRender(numberRender(record.estimatedBudgetAmountHkd, 2))}
            </div>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.prcurrency`).d('币种'),
        dataIndex: 'currency',
        width: 110,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.prrate`).d('申请汇率'),
        dataIndex: 'prRate',
        width: 110,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.progressquery`).d('进度查询'),
        dataIndex: 'progressQuery',
        width: 120,
        render: (_, record) => {
          return (
            <span>
              {
                idpValueMap['HKPC.PROGRESSQUERY']?.find(
                  (item) => item?.value === record.progressQuery,
                )?.meaning
              }
            </span>
          );
        },
      },
      // {
      //   title: intl.get(`${promptCode}.view.title.prcategory`).d('采购类别'),
      //   dataIndex: 'purchasingCategory',
      //   width: 120,
      //   align: 'left',
      //   render: (_, record) => {
      //     return (
      //       <span>{(idpValueMap['HKPC.PURCHASINGCATEGORY']?.find(item => item?.value === record.purchasingCategory))?.meaning}</span>
      //     );
      //   },
      // },
    ];

    return (
      <React.Fragment>
        <CusTable
          rowKey={ROW_KEY}
          dataSource={purchaseApplicationList}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={purchaseApplicationPagination}
          onChange={onChange}
          rowSelection={rowSelection}
        />
      </React.Fragment>
    );
  }
}
