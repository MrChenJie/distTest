import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { pullAllBy } from 'lodash';
import { dateRender } from 'utils/renderer';
import intl from 'utils/intl';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import { tooltipRender } from '_cus_utils/render';

const ROW_KEY = 'subSoId';
export default class ListTable extends Component {
  constructor(props) {
    super(props);
    const { onRef = (e) => e } = props;
    onRef(this);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      isShowFlag: false,
    };
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

  @Bind()
  handleExport() {
    const { onExport = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    onExport(selectedRows);
  }

  @Bind()
  handleShowAllSelect() {
    const { onShowAllSelect = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    onShowAllSelect(selectedRows, () => {
      this.setState({
        isShowFlag: true,
      });
    });
  }

  @Bind()
  pageChange(page) {
    const { onShowPage = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    const result = {
      content: selectedRows,
      empty: false,
      number: page.current - 1,
      numberOfElements: 10,
      size: page.pageSize,
      totalElements: selectedRows.length,
      totalPages: Math.ceil(selectedRows.length / page.pageSize),
    };
    onShowPage(result);
  }

  render() {
    const {
      dataSource,
      exportLoading = false,
      pagination,
      onSearch = (e) => e,
      onCancel = (e) => e,
    } = this.props;
    const { selectedRowKeys, isShowFlag } = this.state;

    const columns = [
      {
        title: intl.get('ssrc.resaleRfq.srq.intentionNum').d('意向单号'),
        dataIndex: 'handleCode',
        width: 220,
      },
      {
        title: intl.get('ssrc.resaleRfq.srq.demandNum').d('需求单号'),
        dataIndex: 'requireCode',
        width: 220,
      },
      {
        title: intl.get('ssrc.resaleRfq.srq.salesUnit').d('销售单元'),
        dataIndex: 'orderOwnerName',
        width: 220,
        render: tooltipRender,
      },
      {
        title: intl.get('ssrc.resaleRfq.srq.sigsedCustomer').d('签约客户'),
        dataIndex: 'custName',
        width: 220,
        render: tooltipRender,
      },
      {
        title: intl.get('ssrc.resaleRfq.srq.productType').d('产品类型'),
        dataIndex: 'productName',
      },
      {
        title: intl.get('ssrc.resaleRfq.srq.createDate').d('创建日期'),
        dataIndex: 'createDate',
        render: dateRender,
      },
    ];
    const rowSelection = {
      width: 60,
      selectedRowKeys,
      onSelect: this.onSelect,
      onSelectAll: this.onSelectAll,
    };
    return (
      <>
        <hr
          style={{ border: 'none', borderBottom: '1px solid #DEE0E3', margin: '24px 0px 16px' }}
        />
        <div style={{ textAlign: 'right', marginBottom: '16px' }}>
          <CusButton
            mini
            onClick={() => {
              this.setState({
                selectedRowKeys: [],
                selectedRows: [],
                isShowFlag: false,
              });
              onSearch();
            }}
          >
            {intl.get(`ssrc.resaleRfq.button.clearChecked`).d('清除已勾选')}
          </CusButton>
          <CusButton
            mini
            type="primary"
            onClick={() => {
              this.handleShowAllSelect();
            }}
          >
            {intl.get('ssrc.resaleRfq.button.showChecked').d('显示已勾选')}
          </CusButton>
        </div>
        <div>
          <CusTable
            rowKey={ROW_KEY}
            bordered
            columns={columns}
            dataSource={dataSource}
            rowSelection={rowSelection}
            pagination={pagination}
            onChange={(page) => {
              if (isShowFlag) {
                this.pageChange(page);
                return 0;
              }
              onSearch(page);
            }}
          />
        </div>
        <div style={{ textAlign: 'right', marginTop: '16px' }}>
          <CusButton onClick={onCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </CusButton>
          <CusButton
            type="primary"
            onClick={() => {
              this.handleExport();
            }}
            loading={exportLoading}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </CusButton>
        </div>
      </>
    );
  }
}
