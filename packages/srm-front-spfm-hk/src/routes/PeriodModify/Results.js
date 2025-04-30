/**
 * index.js - 期间修改查询
 * @date: 2023-1-26
 * @author:  <jinkai.lu@hand-china.com>
 */

import React, { PureComponent } from 'react';
// import { Bind } from 'lodash-decorators';
// import { Tooltip } from 'antd';
import { tableScrollWidth } from 'utils/utils';
import { pullAllBy } from 'lodash';
// import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
import querystring from 'querystring';
import { numberRender, dateRender } from 'utils/renderer';
// import formatterCollections from 'utils/intl/formatterCollections';
import CusTable from '_cus_components/CusTable';
import { tooltipRender, labelTip } from '_cus_utils/render';
import { Bind } from 'lodash-decorators';
import { Tooltip } from 'antd';


// 从菜单页面跳转至详细页面，携带参数true
// 跟从待办页跳转至详细页面做区分
const listIntoFlag = true
const ROW_KEY = 'id'

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
      : selectedRows.filter((n) => n.id  !== record.id );
    // 选择的行key
    let newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item.id );
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
      newSelectedRowKeys.push(item.id );
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

    // history.push({pathname:url,state:{aaa:"aaaa"}});
  }

  render() {
    const {
      modifyDataSource = [],
      modifyPagination = {},
      onPageChange 
    } = this.props;
    console.log(modifyDataSource);
    const { selectedRowKeys = [] } = this.state;
    // const { supperlierSouce = [], supperlierPagination = {} } = evaluationList
    const columns = [
      {
        dataIndex: 'lineNum',
        key: 'lineNum',
        ellipsis: true,
        title: tooltipRender(
          intl.get(`spfmhk.supplier.view.table.supplier.num`).d('供应商编号')
        ),
        width: 150,
        render: (_, record) => {
          return (
            <span>{tooltipRender(record.supplierNumber)}</span>
          )
        },
      },
      {
        dataIndex: 'companyNameEn',
        key: 'companyNameEn',
        ellipsis: true,
        title: tooltipRender(
          intl.get(`spfmhk.supplier.view.table.company.name.en`).d('公司名称（英文）')
        ),
        width: 200,
        render: tooltipRender,
      },
      {
        dataIndex: 'companyNameCh',
        key: 'companyNameCh',
        ellipsis: true,
        title: tooltipRender(
          intl.get(`spfmhk.supplier.view.table.company.name.cn`).d('公司名称（中文）')
        ),
        width: 180,
        render: tooltipRender,
      },
      {
        dataIndex: 'supplierVersions',
        key: 'supplierVersions',
        ellipsis: true,
        title: tooltipRender(
          intl.get(`spfmhk.supplier.view.table.SupVerson.After`).d('供应商版本（变更后）')
        ),
        width: 120,
        render: (_, record) => {
          const isPrefixSC = record?.applyNumber?.startsWith("SC");
          return (
            isPrefixSC ?
            <a href={record?.templateCode === 'BPM_SCM_CWGYSXXBG' ? `/pub/spfm-hk/supplier/finance-comparison?applyNumber=${record?.applyNumber}` : `/pub/spfm-hk/supplier/supplier-comparison?applyNumber=${record?.applyNumber}`} target="_blank">{tooltipRender(record.supplierVersions)}</a>
            :
            <span>{tooltipRender(record.supplierVersions)}</span>
          )
        },
      },
      {
        dataIndex: 'versionsUpdateTime',
        key: 'versionsUpdateTime',
        ellipsis: true,
        title: tooltipRender(
          intl.get(`spfmhk.supplier.field.version.update.date`).d('版本更新日期')
        ),
        width: 120,
        render: tooltipRender,
      },
      {
        dataIndex: 'applyNumber',
        key: 'applyNumber',
        ellipsis: true,
        title: tooltipRender(
          intl.get(`spfmhk.supplier.view.table.changeOrderNumber`).d('变更单号')
        ),
        width: 120,
        render: tooltipRender,
      },
      {
        dataIndex: 'editReason',
        key: 'editReason',
        ellipsis: true,
        title: tooltipRender(
          intl.get(`spfmhk.supplier.view.table.modifyReason`).d('修改原因')
        ),
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
      dataSource: modifyDataSource,
      columns,
      pagination: modifyPagination,
      rowKey: ROW_KEY,
      rowSelection: rowSelection,
      scroll: { x: tableScrollWidth(columns) }, // y: 480
      onChange:onPageChange
    };
    return <CusTable {...tableProps}/>;
  }
}