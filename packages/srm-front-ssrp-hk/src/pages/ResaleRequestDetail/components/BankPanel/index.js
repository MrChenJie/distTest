/*
 * @Description: 转售采购成品付款申请 - 面板 - 银行信息
 * @LastEditors: 何智鹏 <he.zhipeng@hand-china.com>
 * @Date: 2023-07-31 18:28:12
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { Component } from 'react';
import intl from 'utils/intl';
import { connect } from 'dva';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import BankRecordChangeModal from '../../modals/BankRecordChangeModal';
import SupplierBankModal from '../../modals/SupplierBankModal';

@connect(({ resaleRequestDetail = {} }) => ({ resaleRequestDetail }))
export default class index extends Component {
  state = {
    bankChangeRecordModalVisible: false, // 变更记录 - 弹框显示标识
    supplierBankModalVisible: false, // 供应商银行信息 - 弹框显示标识
  };

  /**
   * @name: 定义 - Table列元素
   * @return {array} Table列数据集
   */
  get columns() {
    return [
      {
        title: intl.get(`spcm.paymentRequest.model.bankInfo.bankApprovalStatus`).d('审批状态'),
        dataIndex: 'bankApprovalStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.button.detail`).d('详情'),
        dataIndex: 'changeReqNum',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.bankInfo.bankAccountName`).d('银行账户名称'),
        dataIndex: 'bankAccountName',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.bankInfo.bankName`).d('收款银行'),
        dataIndex: 'bankName',
        width: 300,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.bankInfo.bankAccountNum`).d('收款银行账号'),
        dataIndex: 'bankAccountNum',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.bankInfo.iban`).d('IBAN'),
        dataIndex: 'iban',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.bankInfo.bankFirm`).d('SWIFT Code'),
        dataIndex: 'bankFirm',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.bankInfo.poNumber`).d('采购订单编号'),
        dataIndex: 'poNumber',
        width: 160,
      },
    ];
  }

  render() {
    const { createFlag, resaleRequestDetail } = this.props;
    const { bankDataSource } = resaleRequestDetail;
    const { bankChangeRecordModalVisible, supplierBankModalVisible } = this.state;
    return (
      <>
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <CusButton
            mini
            onClick={() => this.setState({ bankChangeRecordModalVisible: true })}
            disabled={createFlag}
          >
            {intl.get('spcm.costPayment.view.button.changeRecord').d('变更记录')}
          </CusButton>
          <CusButton mini>
            {intl.get('spcm.paymentRequest.view.button.seeBank').d('查看银行信息')}
          </CusButton>
        </div>

        <CusTable
          rowKey="bankId"
          columns={this.columns}
          dataSource={bankDataSource}
          scroll={{ x: tableScrollWidth(this.columns) }}
        />

        <CusModal
          title={intl.get('spcm.costPayment.view.title.bankChangeRecord').d('付款申请银行变更记录')}
          visible={bankChangeRecordModalVisible}
          width={1000}
          destroyOnClose
          onCancel={() => this.setState({ bankChangeRecordModalVisible: false })}
          cancelText={intl.get('hzero.common.button.close').d('关闭')}
        >
          <BankRecordChangeModal />
        </CusModal>
        <CusModal
          title={intl.get('spcm.paymentRequest.view.seeSupplierBank').d('查看供应商银行')}
          visible={supplierBankModalVisible}
          width={1000}
          destroyOnClose
          onCancel={() => this.setState({ supplierBankModalVisible: false })}
          cancelText={intl.get('hzero.common.button.close').d('关闭')}
        >
          <SupplierBankModal />
        </CusModal>
      </>
    );
  }
}
