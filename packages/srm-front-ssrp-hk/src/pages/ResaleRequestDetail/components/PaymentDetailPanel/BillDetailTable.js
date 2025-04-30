/*
 * @Description: 转售采购成品付款申请 - 面板 - 付款明细 - 账单明细Table
 * @LastEditors: 何智鹏 <he.zhipeng@hand-china.com>
 * @Date: 2023-07-28 18:05:49
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { Component } from 'react';
import intl from 'utils/intl';
import { connect } from 'dva';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import { tableScrollWidth, getCurrentUser } from 'utils/utils';
import CusTable from '_cus_components/CusTable';

const currentUser = getCurrentUser();
// const financeNodeName = [
//   '05 财务第一复核人审批',
//   '06 财务第二复核人审批',
//   '11 财务第一复核人审批',
//   '12 财务第二复核人审批',
// ];

@connect(({ resaleRequestDetail = {} }) => ({ resaleRequestDetail }))
export default class index extends Component {
  /**
   * @name: 定义 - Table列元素
   * @return {array} Table列数据集
   */
  get columns() {
    return [
      {
        title: intl.get(`spcm.paymentRequest.model.circuitNumber`).d('客户电路编号'),
        dataIndex: 'circuitNumber',
        width: 160,
        fixed: 'left',
        render: (_, record) => {
          const { lovData } = this.props.resaleRequestDetail;
          if (record._status !== 'create') {
            const { poType, subSoId, circuitNumber } = record.poHeaders;
            const soUrl = (lovData['SPUC.IBOSS_SO_URL'] || []).find(
              (item) => item.value === 'IBOSS_SO_URL'
            )?.tag;
            let key;
            if (['ICTS', 'DATA_APP', 'CO_SD_WAN'].includes(poType)) {
              key = `/mks/cmi-to-approval-details?workflowtype=ZSHZCPLC&uuid=${subSoId}&requestid=&loginid=${currentUser.loginName}`;
            } else {
              key = `/mks/cmi-to-handle-detail?handleId=${subSoId}&src_center=mks&from=uip`;
            }
            return (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={soUrl + Base64.stringify(Utf8.parse(key))}
              >
                {circuitNumber}
              </a>
            );
          }
        },
      },
      {
        title: intl.get(`spcm.paymentRequest.model.circuitRoleType`).d('P/A'),
        dataIndex: 'circuitRoleTypeMeaning',
        width: 60,
        fixed: 'left',
        // hidden: !financeNodeName.includes(currentNodeName) && !['PAID', 'PAYING', 'PROCESSED'].includes(status),
      },
      {
        title: intl.get(`spcm.paymentRequest.model.coaCombination`).d('COA'),
        dataIndex: 'coaCombination',
        width: 70,
        fixed: 'left',
        // hidden:
        // !financeNodeName.includes(currentNodeName) &&
        // !['PAID', 'PAYING', 'PROCESSED', 'TRANSPORTING'].includes(status),
      },
      {
        title: intl.get(`spcm.paymentRequest.view.detail.coaModifyRecord`).d('COA操作记录'),
        dataIndex: 'coaModifyRecord',
        width: 120,
        // hidden:
        // !financeNodeName.includes(currentNodeName) &&
        // !['PAID', 'PAYING', 'PROCESSED', 'TRANSPORTING'].includes(status),
      },
      {
        title: intl.get(`spcm.paymentRequest.view.detail.modifyDateRecord`).d('操作记录'),
        dataIndex: 'modifyDateRecord',
        width: 120,
        // hidden:
        // !financeNodeName.includes(currentNodeName) &&
        // !['PAID', 'PAYING', 'PROCESSED', 'TRANSPORTING'].includes(status),
      },
      {
        title: intl.get(`spcm.costPayment.view.detail.pendingApportion.preview`).d('待摊预览'),
        dataIndex: 'preview',
        width: 120,
        // hidden:
        // !financeNodeName.includes(currentNodeName) &&
        // !['PAID', 'PAYING', 'PROCESSED', 'TRANSPORTING'].includes(status),
      },
      {
        title: intl
          .get(`spcm.paymentRequest.view.detail.circuitNumberARInformation`)
          .d('电路编号AR信息'),
        dataIndex: 'circuitNumberARInformation',
        width: 140,
      },
      {
        title: intl
          .get(`spcm.paymentRequest.model.circuitRemainingHkd`)
          .d('客户电路编号收款逾期提醒'),
        dataIndex: 'circuitRemainingHkd',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.paymentArrange`).d('项目付款安排'),
        dataIndex: 'paymentArrange',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.paymentArrangeExplain`).d('项目付款安排说明'),
        dataIndex: 'paymentArrangeExplain',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.lineStatus`).d('订单行状态'),
        dataIndex: 'lineStatus',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.poNumber`).d('采购订单编号'),
        dataIndex: 'poNumber',
        width: 160,
      },
      {
        title: intl
          .get(`spcm.paymentRequest.model.oneTimeExcludingAmount`)
          .d('NRC订单里程碑金额(原币不含税)'),
        dataIndex: 'oneTimeExcludingAmount',
        width: 240,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{val}</div>;
        },
      },
      {
        title: intl.get(`spcm.paymentRequest.model.oneTimeAmount`).d('NRC发票金额(原币不含税)'),
        dataIndex: 'oneTimeAmount',
        width: 200,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{val}</div>;
        },
      },
      {
        title: intl
          .get(`spcm.paymentRequest.model.periodicExcludingAmount`)
          .d('周期性订单金额（原币不含税）'),
        dataIndex: 'periodicExcludingAmount',
        width: 230,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{val}</div>;
        },
      },
      {
        title: intl.get(`spcm.paymentRequest.model.periodicAmount`).d('周期性发票金额(原币不含税)'),
        dataIndex: 'periodicAmount',
        width: 220,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{val}</div>;
        },
      },
      {
        title: intl.get(`spcm.paymentRequest.model.overweightAmount`).d('超量金额（原币不含税）'),
        dataIndex: 'overweightAmount',
        width: 190,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{val}</div>;
        },
      },
      {
        title: intl.get(`spcm.paymentRequest.model.overweightAmount`).d('超量金额（原币不含税）'),
        dataIndex: 'overweightReason',
        width: 190,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{val}</div>;
        },
      },
      {
        title: intl.get(`spcm.paymentRequest.model.poLineTaxAmount`).d('订单行税额'),
        dataIndex: 'poLineTaxAmount',
        width: 160,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{val}</div>;
        },
      },
      {
        title: intl.get(`spcm.paymentRequest.model.lineTaxAmount`).d('发票行税额'),
        dataIndex: 'lineTaxAmount',
        width: 160,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{val}</div>;
        },
      },
      {
        title: intl.get(`spcm.paymentRequest.model.serviceType`).d('Service Type'),
        dataIndex: 'serviceTypeMeaning',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.poStatus`).d('采购订单状态'),
        dataIndex: 'poStatusMeaning',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.contractName`).d('合同名称'),
        dataIndex: 'contractName',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.salesContractNum`).d('销售合同编号'),
        dataIndex: 'salesContractNum',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.poLineNum`).d('订单行'),
        dataIndex: 'poLineNum',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.itemAttributes`).d('属性描述'),
        dataIndex: 'itemAttributes',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.deductFlag`).d('增值税是否可抵扣'),
        dataIndex: 'deductFlag',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.milestoneLineNum`).d('阶段行号'),
        dataIndex: 'milestoneLineNum',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.milestoneName`).d('里程碑名称'),
        dataIndex: 'milestoneName',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.poLineAmount`).d('订单行NRC金额(原币不含税)'),
        dataIndex: 'poLineAmount',
        width: 220,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{val}</div>;
        },
      },
      {
        title: intl
          .get(`spcm.paymentRequest.model.oneTimeApplyAmount`)
          .d('NRC已申请金额(原币不含税)'),
        dataIndex: 'oneTimeApplyAmount',
        width: 220,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{val}</div>;
        },
      },
      {
        title: intl.get(`spcm.paymentRequest.model.otherFeeAmount`).d('其他费用金额'),
        dataIndex: 'otherFeeAmount',
        width: 160,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{val}</div>;
        },
      },
      {
        title: intl.get(`spcm.paymentRequest.model.otherFeeReason`).d('其他费用产生原因'),
        dataIndex: 'otherFeeReason',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.taxApplyAmount`).d('已申请税额'),
        dataIndex: 'taxApplyAmount',
        width: 160,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{val}</div>;
        },
      },
      {
        title: intl.get(`spcm.paymentRequest.model.lineAmount`).d('发票行金额(原币含税)'),
        dataIndex: 'lineAmount',
        width: 170,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{val}</div>;
        },
      },
      {
        title: intl.get(`spcm.paymentRequest.model.lineHkAmount`).d('发票行港币金额'),
        dataIndex: 'lineHkAmount',
        width: 160,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{val}</div>;
        },
      },
      {
        title: intl.get(`spcm.paymentRequest.model.isFlowFlag`).d('是否按使用量'),
        dataIndex: 'isFlowFlag',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.usageNote`).d('使用量备注'),
        dataIndex: 'usageNote',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.cycleMethod`).d('周期结算方式'),
        dataIndex: 'cycleMethod',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.terms`).d('期数'),
        dataIndex: 'terms',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.orderServiceStartDate`).d('订单服务开始日期'),
        dataIndex: 'orderServiceStartDate',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.orderServiceEndDate`).d('订单服务结束日期'),
        dataIndex: 'orderServiceEndDate',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.lastServiceEndDate`).d('最近服务结束日期'),
        dataIndex: 'lastServiceEndDate',
        width: 160,
      },
      {
        title: intl
          .get(`spcm.paymentRequest.model.periodicApplyAmount`)
          .d('周期性已申请金额（原币不含税）'),
        dataIndex: 'periodicApplyAmount',
        width: 160,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{val}</div>;
        },
      },
      {
        title: intl.get(`spcm.paymentRequest.model.currentUsage`).d('本次使用量'),
        dataIndex: 'currentUsage',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.invoiceServiceStartDate`).d('发票服务开始日期'),
        dataIndex: 'serviceStartDate',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.invoiceServiceEndDate`).d('发票服务结束日期'),
        dataIndex: 'serviceEndDate',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.pendingApportionFlag`).d('是否待摊'),
        dataIndex: 'pendingApportionFlag',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.apportionStartDate`).d('待摊开始日期'),
        dataIndex: 'apportionStartDate',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.apportionEndDate`).d('待摊结束日期'),
        dataIndex: 'apportionEndDate',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.pendingApportionAmount`).d('待摊金额'),
        dataIndex: 'pendingApportionAmount',
        width: 160,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{val}</div>;
        },
      },
      {
        title: intl.get(`spcm.paymentRequest.model.currency`).d('原币种'),
        dataIndex: 'currencyCode',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.supplierCode`).d('供应商编号'),
        dataIndex: 'supplierCode',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.supplierName`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.cmiContractSigningEntity`).d('CMI签约主体'),
        dataIndex: 'cmiEntityMeaning',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.contractEntity`).d('销售签约主体'),
        dataIndex: 'contractEntity',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.supplierCircuitNumber`).d('供应商电路编号'),
        dataIndex: 'supplierCircuitNumber',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.requiredAttachment`).d('必要附件'),
        dataIndex: 'requiredAttachment',
        width: 160,
      },
    ];
  }

  /**
   * @name: 操作 - 换页查询
   * @param {object} page 分页数据
   */
  handleSearch = (page = {}) => {
    const { resaleRequestDetail, dispatch } = this.props;
    const { bdDataForm, blListIndexId } = resaleRequestDetail;
    dispatch({
      type: 'resaleRequestDetail/fetchBillLineDetail',
      payload: {
        page: page.current - 1,
        size: page.pageSize,
        costInvoiceId: blListIndexId,
        circuitNumber: bdDataForm.current.getFieldValue('circuitNumber'),
      },
    });
  };

  render() {
    const { resaleRequestDetail, dispatch } = this.props;
    const { bdDataSelectedRowKeys, bdDataSource, bdDataPagination } = resaleRequestDetail;
    const rowSelection = {
      fixed: true,
      selectedRowKeys: bdDataSelectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) =>
        dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: { bdDataSelectedRowKeys: selectedRowKeys, bdDataSelectedRows: selectedRows },
        }),
    };
    return (
      <CusTable
        rowKey="resaleLineId"
        columns={this.columns}
        dataSource={bdDataSource}
        pagination={bdDataPagination}
        rowSelection={rowSelection}
        scroll={{ x: tableScrollWidth(this.columns) }}
        onChange={this.handleSearch}
      />
    );
  }
}
