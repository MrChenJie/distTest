/*
 * @Description: 转售采购成品付款申请 - 面板 - 付款明细 - 账单列表
 * @LastEditors: 何智鹏 <he.zhipeng@hand-china.com>
 * @Date: 2023-07-28 18:05:49
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { Component } from 'react';
import { sum } from 'lodash';
import { connect } from 'dva';
import intl from 'utils/intl';
import { Tag } from 'hzero-ui';
import { labelTip, yesOrNoRender } from '_cus_utils/render';
import { tableScrollWidth } from 'utils/utils';
import { dateRender, numberRender } from 'utils/renderer';
import CusTable from '_cus_components/CusTable';
import CusModal from '_cus_components/CusModal';
import InvoiceAttachmentModal from '../../modals/InvoiceAttachmentModal';

@connect(({ resaleRequestDetail = {} }) => ({ resaleRequestDetail }))
export default class index extends Component {
  state = {
    invoiceAttachmentModalVisible: false, // 发票附件 - 弹框显示标识
  };

  /**
   * @name: 定义 - Table列元素
   * @return {array} Table列数据集
   */
  get columns() {
    const { editFlag, dispatch } = this.props;
    const rightRender = (val) => <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>;
    return [
      {
        title: labelTip({
          label: intl.get(`spcm.paymentRequest.view.detail.invoice.invoiceNum`).d('发票编码'),
          tip: intl
            .get(`spcm.paymentRequest.view.detail.line.invoiceNum.help`)
            .d(
              '发票号码可以包含的字符：数字 字母(大小写) 汉字(简体 繁体) 空格 罗马数字 / , ‘” _ - # . ( ) & 〔 〕:  % +()'
            ),
        }),
        dataIndex: 'invoiceNum',
        width: 160,
      },
      {
        title: labelTip({
          label: intl.get(`spcm.paymentRequest.view.detail.invoice.invoiceDate`).d('发票日期'),
          tip: intl
            .get(`spcm.paymentRequest.view.detail.line.invoiceDate.help`)
            .d('请输入发票的开具日期'),
        }),
        dataIndex: 'invoiceDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.paymentRequest.view.detail.invoice.termsDate`).d('发票到期日'),
        dataIndex: 'termsDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.currency`).d('原币种'),
        dataIndex: 'currencyCode',
        width: 120,
      },
      {
        title: intl
          .get(`spcm.paymentRequest.view.detail.invoice.invoiceAmount`)
          .d('发票金额(原币含税)'),
        dataIndex: 'invoiceAmount',
        width: 180,
        render: rightRender,
      },
      {
        title: intl
          .get(`spcm.paymentRequest.view.detail.invoice.excludingTaxAmount`)
          .d('发票金额(原币不含税)'),
        dataIndex: 'excludingTaxAmount',
        width: 180,
        render: rightRender,
      },
      {
        title: intl
          .get(`spcm.paymentRequest.view.detail.invoice.invoiceTaxAmount`)
          .d('发票税额(原币)'),
        dataIndex: 'invoiceTaxAmount',
        width: 160,
        render: rightRender,
      },
      {
        title: intl.get(`spcm.paymentRequest.view.detail.invoice.writeOffAmount`).d('核销原币金额'),
        dataIndex: 'writeOffAmount',
        width: 160,
        render: rightRender,
      },
      {
        title: intl
          .get(`spcm.paymentRequest.view.detail.invoice.paymentAmount`)
          .d('本次净支付原币金额'),
        dataIndex: 'paymentAmount',
        width: 160,
        render: rightRender,
      },
      {
        title: intl
          .get(`spcm.paymentRequest.view.detail.invoice.bankFreesAmount`)
          .d('银行手续费(原币)'),
        dataIndex: 'bankFreesAmount',
        width: 160,
        render: rightRender,
      },
      {
        title: intl
          .get(`spcm.paymentRequest.view.detail.invoice.supplierInvoiceAmount`)
          .d('供应商发票总额'),
        dataIndex: 'supplierInvoiceAmount',
        width: 160,
        render: rightRender,
      },
      {
        title: intl.get(`spcm.paymentRequest.view.detail.invoice.description`).d('发票描述'),
        dataIndex: 'description',
        width: 160,
      },
      {
        title: labelTip({
          label: intl
            .get(`spcm.paymentRequest.view.detail.invoice.instalmentFlag`)
            .d('是否非全额支付'),
          tip: intl
            .get(`spcm.paymentRequest.view.detail.line.instalmentFlag.help`)
            .d('當賬單並非全額支付時﹐請勾選並填上賬單所顯示的總金額'),
        }),
        dataIndex: 'instalmentFlag',
        width: 160,
        render: (val) => yesOrNoRender(val === '1' ? 1 : 0),
      },
      {
        title: intl.get(`spcm.paymentRequest.view.detail.invoice.paymentCount`).d('第几次付款'),
        dataIndex: 'paymentCount',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.view.detail.invoice.billTotalAmount`).d('账单总额'),
        dataIndex: 'billTotalAmount',
        width: 160,
        render: rightRender,
      },
      {
        title: intl.get(`spcm.paymentRequest.view.detail.invoice.ebsInvoiceNum`).d('EBS发票编号'),
        dataIndex: 'ebsInvoiceNum',
        width: 160,
      },
      {
        title: intl
          .get(`spcm.paymentRequest.view.detail.invoice.exchangeRate`)
          .d('（税务）发票汇率'),
        dataIndex: 'exchangeRate',
        width: 160,
        render: (val) => <div style={{ textAlign: 'right' }}>{val}</div>,
      },
      {
        title: intl
          .get(`spcm.paymentRequest.view.detail.invoice.writeOffInformation`)
          .d('核销信息'),
        dataIndex: 'writeOffInformation',
        fixed: 'right',
        width: 132,
        render: () => (
          <a>
            {intl
              .get(`spcm.paymentRequest.view.detail.invoice.selectWriteOffInformation`)
              .d('选择可核销明细')}
          </a>
        ),
      },
      {
        title: intl.get(`spcm.paymentRequest.model.invoiceAttachment`).d('发票附件'),
        dataIndex: 'invoiceAttachment',
        width: 120,
        fixed: 'right',
        render: (_, record) => (
          <div style={{ display: 'flex', alignItems: 'center' }} className="cus-upload-tag">
            <a
              onClick={() => {
                this.setState({ invoiceAttachmentModalVisible: true });
                dispatch({
                  type: 'resaleRequestDetail/handleSetState',
                  payload: {
                    blListAttachment: record?.costInvoiceFilesList?.map((list) => ({
                      ...list,
                      _status: 'update',
                    })),
                    blListNewAttachment: [],
                    blListIndexId: record.costInvoiceId,
                  },
                });
              }}
            >
              {editFlag
                ? intl.get('hzero.common.upload.text').d('上传附件')
                : intl.get('hzero.common.upload.view').d('查看附件')}
            </a>
            <Tag>{sum(record.costInvoiceFilesList?.map((item) => item.fileQuantity || 0))}</Tag>
          </div>
        ),
      },
    ];
  }

  /**
   * @name: 操作 - 焦点行变更
   */
  handleChangeRow = async (id) => {
    const { dispatch, resaleRequestDetail } = this.props;
    const { bdDataForm, blListIndexId } = resaleRequestDetail;
    if (id !== blListIndexId) {
      bdDataForm.current.resetFields();
      if (id.toString().indexOf('create') === -1) {
        dispatch({
          type: 'resaleRequestDetail/fetchBillLineDetail',
          payload: { page: 0, size: 10, costInvoiceId: id },
        });
      } else {
        dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: {
            blListIndexId: id,
            bdDataSource: [],
            bdDataPagination: {},
          },
        });
      }
    }
  };

  render() {
    const { editFlag, resaleRequestDetail, dispatch } = this.props;
    const { blListAttachment, blListSelectedRowKeys, blDataSource } = resaleRequestDetail;
    const { invoiceAttachmentModalVisible } = this.state;
    const rowSelection = {
      fixed: true,
      selectedRowKeys: blListSelectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) =>
        dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: { blListSelectedRowKeys: selectedRowKeys, blListSelectedRows: selectedRows },
        }),
    };
    return (
      <>
        <CusTable
          rowKey="costInvoiceId"
          columns={this.columns}
          dataSource={blDataSource}
          rowSelection={rowSelection}
          onRow={(record) => ({ onClick: () => this.handleChangeRow(record.costInvoiceId) })}
          scroll={{ x: tableScrollWidth(this.columns) }}
        />

        <CusModal
          title={intl.get(`spcm.paymentRequest.model.invoiceAttachment`).d('发票附件')}
          visible={invoiceAttachmentModalVisible}
          width={1000}
          destroyOnClose
          cancelText={
            editFlag
              ? intl.get('hzero.common.button.cancel').d('取消')
              : intl.get('hzero.common.button.close').d('关闭')
          }
          onCancel={() => this.setState({ invoiceAttachmentModalVisible: false })}
          {...(editFlag ? { onOk: () => console.log(123) } : {})}
        >
          <InvoiceAttachmentModal editFlag={editFlag} dataSource={blListAttachment} />
        </CusModal>
      </>
    );
  }
}
