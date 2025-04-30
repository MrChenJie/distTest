import React, { Component } from 'react';
import { Row, Col } from 'antd';
import { Bind } from 'lodash-decorators';
import { dateRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';

import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import { tooltipRender } from '_cus_utils/render';
import styles from './index.less';

const ROW_KEY = 'subSoId';
export default class ListTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  @Bind()
  handleRow(record) {
    const rowKey = record[ROW_KEY];
    const { onSave = (e) => e } = this.props;
    return {
      onDoubleClick: () => {
        onSave([record]);
      },
      onClick: () => {
        this.setState({
          selectedRows: [record],
          selectedRowKeys: [rowKey],
        });
      },
    };
  }

  render() {
    const {
      dataSource,
      pagination,
      onSearch = (e) => e,
      onSave = (e) => e,
      onCancel = (e) => e,
    } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;

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
      type: 'radio',
      width: 48,
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
        <div>
          <CusTable
            rowKey={ROW_KEY}
            columns={columns}
            dataSource={dataSource}
            rowSelection={rowSelection}
            pagination={pagination}
            scroll={{ x: tableScrollWidth(columns) }}
            onChange={(page) => {
              onSearch(page);
            }}
            onRow={this.handleRow}
            locale={{
              emptyText: intl
                .get('ssrc.resaleRfq.view.noContent.soRequire')
                .d('请确认是否已到意向单确认节点'),
            }}
            paddingLeft={0}
          />
        </div>
        <Row>
          <Col span={24} className={styles.buttonOperations}>
            <CusButton onClick={onCancel}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </CusButton>
            <CusButton
              type="primary"
              onClick={() => {
                onSave(selectedRows);
              }}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </CusButton>
          </Col>
        </Row>
      </>
    );
  }
}
