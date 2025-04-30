import React from 'react';
import { Bind } from 'lodash-decorators';
import { Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import uuidv4 from 'uuid/v4';
import { numberRender } from 'utils/renderer';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import CusSpin from '_cus_components/CusSpin';

export default class DataTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  @Bind()
  handleAdd() {
    const { onOk = (e) => e, onCancel = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    onOk(selectedRows.map((item) => ({ ...item, _status: 'create', writeOffId: uuidv4() })));
    onCancel();
  }

  render() {
    const {
      dataSource = [],
      pagination = [],
      prompt,
      loading = false,
      onCancel = (e) => e,
      onChange = (e) => e,
    } = this.props;
    const { selectedRowKeys } = this.state;
    const columns = [
      {
        title: intl.get(`${prompt}.requestNum`).d('预付款申请编号'),
        dataIndex: 'requestNum',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.invoiceNum`).d('预付款发票号码'),
        dataIndex: 'invoiceNum',
        width: 160,
      },
      {
        title: intl.get(`${prompt}.lineNum`).d('预付款发票行号'),
        dataIndex: 'lineNum',
        width: 160,
      },
      {
        title: intl.get(`${prompt}.circuitId`).d('客户电路编号'),
        dataIndex: 'circuitId',
        width: 160,
      },
      {
        title: intl.get(`${prompt}.poNumber`).d('采购订单编号'),
        dataIndex: 'poNumber',
        width: 160,
      },
      {
        title: intl.get(`${prompt}.businessCode`).d('Business code'),
        dataIndex: 'businessCode',
        width: 160,
      },
      {
        title: intl.get(`${prompt}.lineAmount`).d('发票行金额（原币含税）'),
        dataIndex: 'lineAmount',
        width: 200,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>;
        },
      },
      {
        title: intl.get(`${prompt}.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 90,
      },
      {
        title: intl.get(`${prompt}.applyAmountTotal`).d('已核销原币金额'),
        dataIndex: 'applyAmountTotal',
        width: 140,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>;
        },
      },
      {
        title: intl.get(`${prompt}.canApplyAmount`).d('可核销原币金额'),
        dataIndex: 'canApplyAmount',
        width: 140,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>;
        },
      },
      {
        title: intl.get(`${prompt}.appliedAmount`).d('本次核销原币金额'),
        dataIndex: 'appliedAmount',
        width: 160,
        render: (val) => {
          return <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>;
        },
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
    };

    return (
      <>
        <CusSpin spinning={loading}>
          <CusTable
            bordered
            rowKey="prepaymentLineId"
            dataSource={dataSource}
            pagination={pagination}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            rowSelection={rowSelection}
            onChange={onChange}
          />
        </CusSpin>
        <div className="cus-modal-body-buttons">
          <CusButton onClick={onCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </CusButton>
          <CusButton type="primary" onClick={this.handleAdd}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </CusButton>
        </div>
      </>
    );
  }
}
