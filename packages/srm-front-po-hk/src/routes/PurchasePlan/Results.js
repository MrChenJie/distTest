/**
 * PurchasePlanResults - 采购方案结果
 * @date: 2023-10-25
 * @author: jinkai.lu
 * @version: 0.0.1
 */
import React, { PureComponent } from 'react';
import { tableScrollWidth } from 'utils/utils';
import { pullAllBy } from 'lodash';
import intl from 'utils/intl';
import querystring from 'querystring';
import { numberRender, dateRender } from 'utils/renderer';
import CusTable from '_cus_components/CusTable';
import { tooltipRender } from '_cus_utils/render';
import { Bind } from 'lodash-decorators';

// 从菜单页面跳转至详细页面，携带参数true
// 跟从待办页跳转至详细页面做区分
const listIntoFlag = true
const ROW_KEY = 'id';

export default class PurchasePlanResults extends PureComponent {
  constructor(props) {
    super(props);
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

  // 去详细页
  @Bind()
  goDispatchPac(record) {
    const {history} = this.props
    const params = {
      prPlanNum:record.id,
      listIntoFlag
    }
    const query = new URLSearchParams(params.prPlanNum).toString().slice(0, -1); 
    console.log(query,'query');
    const isPub = location.pathname.includes('pub'); // 判断是否为pub页面
    let url = `${isPub ? '/pub' : ''}/ssrc-hk/purchase-plan-list/detail/?${query}`;
    // window.open(url, '_blank');
    // 当为草稿
    console.log(params.prPlanNum,'传递的id');
    if(record.prPlanStatus == 'PP_Draft'){
      window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/quick/process?templateCode=BPM_SCM_YBCGFA&pcThirdContentPageUrl=${encodeURIComponent(`${process.env.CMHK_LOGIN}/oauth/public/cmi/sso/login?redirect_uri=/pub/ssrc-hk/purchase-plan-list/detail?${querystring.stringify({ id: params.prPlanNum })}`)}`);
      window.close();
    }else {
      window.open(`${process.env.APPROVAL_PROCESS}/main/child-frame/app-approval/detail/share?detailType=SHARE&caseId=${record.caseId}`);
      window.close();
    }
  }

  render() {
    const {
      dataSource = [],
      pagination = {},
      onPageChange 
    } = this.props
    const { selectedRowKeys = [] } = this.state;
    const columns = [
      {
        dataIndex: 'prPlanNum',
        key: 'prPlanNum',
        title: intl.get(`HKPC.commom.view.title.PPnumber`).d('采购方案编号'),
        width: 170,
        render: (_, record) => {
          return (
            <a
              className="customize-tooltip-text"
              onClick={() => this.goDispatchPac(record)}
            >
              {tooltipRender(record.prPlanNum)}
            </a>
          );
        },
      },
      {
        dataIndex: 'prPlanName',
        key: 'prPlanName',
        title: intl.get(`HKPC.commom.view.title.PPname`).d('采购方案名称'),
        width: 180,
        render: tooltipRender,
      },
      {
        dataIndex: 'prPlanStatusMeaning',
        key: 'prPlanStatusMeaning',
        title: intl.get(`HKPC.commom.view.title.PPStatus`).d('采购方案状态'),
        width: 120,
        render: tooltipRender,
      },
      {
        dataIndex: 'prReqDate',
        key: 'prReqDate',
        title: intl.get(`HKPC.commom.view.title.PPDate`).d('方案申请日期'),
        width: 140,
        render: dateRender,
      },
      {
        dataIndex: 'applicantUserName',
        key: 'applicantUserName',
        title: intl.get(`HKPC.commom.view.title.applicant`).d('申请人'),
        width: 160,
        render: tooltipRender,
      },
      {
        dataIndex: 'applyingDepartmentName',
        key: 'applyingDepartmentName',
        title: intl.get(`HKPC.commom.view.title.aapplyingdepartment`).d('申请部门'),
        width: 120,
        render: tooltipRender,
      },
      {
        dataIndex: 'prTypeMeaning',
        key: 'prTypeMeaning',
        title: intl.get(`HKPC.commom.view.title.prtype`).d('采购申请类型'),
        width: 230,
        render: tooltipRender,
      },
      {
        dataIndex: 'prNumber',
        key: 'prNumber',
        title: intl.get(`HKPC.commom.view.title.prnumber`).d('采购申请编号'),
        width: 180,
        render: tooltipRender,
      },
      {
        dataIndex: 'estimatedBudgetAmount',
        key: 'estimatedBudgetAmount',
        title: intl.get(`HKPC.commom.view.title.ettimatedbudgetamountO`).d('预估总金额(原币)'),
        width: 180,
        render: (_, record) => {
          return (
            <div style={{textAlign: 'right'}}>
              {tooltipRender(numberRender(record.estimatedBudgetAmount, 2))}
            </div>
          )
        },
      },
      {
        dataIndex: 'estimatedBudgetAmountHkd',
        key: 'estimatedBudgetAmountHkd',
        title: intl.get(`HKPC.commom.view.title.ettimatedbudgetamountH`).d('预估总金额(HKD)'),
        width: 180,
        render: (_, record) => {
          return (
            <div style={{textAlign: 'right'}}>
              {tooltipRender(numberRender(record.estimatedBudgetAmountHkd, 2))}
            </div>
          )
        },
      },
      {
        dataIndex: 'currency',
        key: 'currency ',
        title: intl.get(`HKPC.commom.view.title.pprcurrency`).d('申请币种'),
        width: 110,
        render: tooltipRender,
      },
      {
        dataIndex: 'prRate',
        key: 'prRate',
        title: intl.get(`HKPC.commom.view.title.prrate`).d('申请汇率'),
        width: 110,
        render: tooltipRender,
      },
      {
        dataIndex: 'prDealMan',
        key: 'prDealMan',
        title: intl.get(`HKPC.commom.view.title.procurementhandler`).d('采购经办人'),
        width: 200,
        render: tooltipRender,
      },
    ]

    // console.log('evaluationList', evaluationList);
    const rowSelection = {
      columnWidth: 50,
      selectedRowKeys,
      onSelect: this.handleSelect,
      onSelectAll: this.handleSelectAll,
    };
    const tableProps = {
      dataSource: dataSource,
      columns,
      pagination: pagination,
      rowKey: ROW_KEY,
      rowSelection: rowSelection,
      scroll: { x: tableScrollWidth(columns) }, // y: 480
      onChange:onPageChange
    };
    return <CusTable {...tableProps}/>;
  }
}