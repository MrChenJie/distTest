import React from 'react';
import { Bind } from 'lodash-decorators';
import { Row, Col, Button, Modal, Form, InputNumber } from 'hzero-ui';
import intl from 'utils/intl';
import { tableScrollWidth, getEditTableData } from 'utils/utils';
import EditTable from 'components/EditTable';
import { numberRender } from 'utils/renderer';
import deleteIcon from '@/assets/buttonIcons/删除.png';
import addIcon from '@/assets/buttonIcons/新建.png';

import WriteOffDetails from './WriteOffDetails';
import styles from './index.less';

export default class DataTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      addWriteOffVisible: false,
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  @Bind()
  openAddModal() {
    this.setState({
      addWriteOffVisible: true,
    })
  }

  @Bind()
  handleAdd(data = []) {
    const { onAdd = (e) => e } = this.props;
    onAdd(data);
  }

  @Bind()
  handleDelete() {
    const { onDelete = (e) => e } = this.props;
    const { selectedRowKeys = [] } = this.state;
    onDelete(selectedRowKeys);
  }

  @Bind()
  handleSave() {
    const { onOk = (e) => e, dataSource } = this.props;
    const value = getEditTableData(dataSource, ['writeOffId', '_status']);
    onOk(value);
  }

  @Bind()
  handleDataChange(record, changeDatas) {
    Object.assign(record, changeDatas);
    this.setState({});
  }

  render() {
    const {
      dataSource = [],
      pagination = [],
      prompt,
      writeOffData = {},
      headerData = {},
      onCancel = (e) => e,
      onChange = (e) => e,
      defaultFlag,
    } = this.props;
    const {
      addWriteOffVisible,
      selectedRowKeys,
    } = this.state;
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
        width: 160,
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
        render: (val, record) => {
          if (['create', 'update'].includes(record._status) && defaultFlag) {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('appliedAmount', {
                  initialValue: val,
                })(
                  <InputNumber
                    allowThousandth
                    precision={2}
                    step={0.01}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    className={styles['input-money']}
                  />
                )}
              </Form.Item>
            )
          } else {
            return <div style={{ textAlign: 'right' }}>{numberRender(val, 2)}</div>;
          }
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
      <React.Fragment>
        {defaultFlag && (
          <Row style={{ marginTop: '15px', marginBottom: '15px' }}>
            <Col span={24} className="customize-buttons">
              <Button onClick={this.openAddModal}>
                <img src={addIcon} alt="" />
                {intl.get('hzero.common.button.add').d('新增')}
              </Button>
              <Button onClick={this.handleDelete} disabled={selectedRowKeys.length === 0}>
                <img src={deleteIcon} alt="" />
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
            </Col>
          </Row>
        )}
        <EditTable
          bordered
          rowKey={'writeOffId'}
          dataSource={dataSource}
          pagination={pagination}
          columns={columns}
          scroll={{x: tableScrollWidth(columns)}}
          rowSelection={rowSelection}
          onChange={onChange}
          onDataChange={this.handleDataChange}
        />
        {defaultFlag && (
          <Row gutter={24} style={{ marginTop: '10px' }}>
            <Col span={24} style={{ textAlign: 'right'}}>
              <Button style={{ marginRight: '10px' }} onClick={onCancel}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.handleSave}>
                {intl.get('hzero.common.button.ok').d('确定')}
              </Button>
            </Col>
          </Row>
        )}

        {/* 新增可核销明细Modal */}
        {addWriteOffVisible && (
          <Modal
            title={intl.get('spcm.costPayment.view.writeOffDetails').d('可核销明细')}
            visible={addWriteOffVisible}
            onCancel={() => this.setState({ addWriteOffVisible: false })}
            // onOk={() => }
            footer={null}
            width={800}
            destroyOnClose
          >
            <WriteOffDetails
              writeOffData={writeOffData}
              headerData={headerData}
              prompt={prompt}
              onCancel={() => this.setState({ addWriteOffVisible: false })}
              onOk={this.handleAdd}
            />
          </Modal>
        )}
      </React.Fragment>
    )
  }
}
