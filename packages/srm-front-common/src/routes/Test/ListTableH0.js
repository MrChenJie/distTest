import React from 'react';
import { Col, Input, InputNumber } from 'antd';
import { Button, Form } from 'hzero-ui';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import Table from '@/components/CusTable';
import { tooltipRender, labelTip } from '@/utils/render';
import EditTable from '@/components/EditTable';
import CusInput from '@/components/CusInput';
import CusDatePicker from '@/components/CusDatePicker';
import CusSelect from '@/components/CusSelect';
import CusLov from '@/components/CusLov';

const prompt = 'spfm.interfaceErrors';

export default class ListTable extends React.Component {

  state = {
    hidden: false,
  }

  handleDetail = (record = {}) => {
    const { history, isPub } = this.props;
    const { interfaceLogId } = record;
    history.push({
      pathname: `${isPub ? '/pub' : ''}/spub/interface-errors/detail/${interfaceLogId}`,
    });
  };

  render() {
    const { dataSource = [], pagination = {}, onChange = (e) => e } = this.props;
    const { hidden = false } = this.state;
    const columns = [
        {
          title: 'Date',
          dataIndex: 'date',
          width: 200,
          ellipsis: true,
          sorter: true,
          required: true,
          render: (val, record) => {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('Date', {
                  rules: [{
                    required: true,
                  }],
                })(
                  <CusInput />
                )}
              </Form.Item>
            )
          },
        },
        {
          title: labelTip({
            label: 'Amount Amount Amount Amount',
            tip: '111111',
          }),
          required: true,
          dataIndex: 'amount',
          width: 300,
          hidden: hidden,
          // sorter: (a, b) => a.amount - b.amount,
          render: (val, record) => {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('clientId', {
                  rules: [{
                    required: true,
                  }],
                })(
                  <CusInput.TextArea autoChangeSize={true} />
                )}
              </Form.Item>
            )
          },
        },
        {
          title: 'Type',
          dataIndex: 'type',
          width: 100,
          required: true,
          render: (val, record) => {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('Type', {
                  rules: [{
                    required: true,
                  }],
                })(
                  <CusSelect
                    allowClear
                    lovCode='SPFM.SANCTIONS_TYPE'
                    tip={
                      <>
                        <div>
                          {intl
                            .get(`${prompt}.view.list.sanctionsType.tips`)
                            .d('SDN List 限制事項：禁止与SDN 列表中的客户或供应商开展业务。')}
                        </div>
                        <div>
                          {intl
                            .get(`${prompt}.view.list.sanctionsType.tips1`)
                            .d('实体名单限制事項：不允许向实体名单下的客户出售任何具有美国技术硬件，软件或物品。')}
                        </div>
                      </>
                    }
                  />
                  )}
              </Form.Item>
            )
          },
        },
        {
          title: 'Note',
          dataIndex: 'note',
          width: 200,
          fixed: 'right',
          required: true,
          render: (val, record) => {
            return (
              <Form.Item>
                {record.$form.getFieldDecorator('Note', {
                  rules: [{
                    required: true,
                  }],
                })(
                  <CusLov
                    code="SSLM.COST_SUPPLIER_INFO"
                    form={this.form?.current}
                    textField="interfaceLov"
                  />
                )}
              </Form.Item>
            )
          },
        },
      ];
    const rowSelection = {
      // type: 'radio',
      fixed: 'left',
    };

    return (
      <>
        <Button onClick={() => {
          this.setState({
            hidden: true,
          })
        }}>hidden</Button>
        <EditTable
          rowKey="key"
          pagination={{ current: 1, total: 1000 }}
          columns={columns}
          dataSource={dataSource}
          scroll={{ x: tableScrollWidth(columns) }}
          rowSelection={rowSelection}
          showSorterTooltip={false}
          onChange={(a,b,c) => {
            console.log(a,b,c);}}
        />
      </>
    );
  }
}
