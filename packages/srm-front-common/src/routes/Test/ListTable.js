import React from 'react';
import { Form, Input, InputNumber } from 'antd';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import Table from '@/components/CusTable';
import { tooltipRender, labelTip } from '@/utils/render';
import EditTable from '@/components/EditTable';
import CusInput from '@/components/CusInput';
import CusDatePicker from '@/components/CusDatePicker';
import CusSelect from '@/components/CusSelect';
import CusTable from '@/components/CusTable';
import CusLov from '@/components/CusLov';
import CusUploadFile from '@/components/CusUploadFile';
import CusButton from '@/components/CusButton';
import { deleteExistSrmPlatformFileByKey, getSrmPlatformFiles } from '@/services/spfmService';
import { API_HOST } from 'utils/config';
import { SRM_PLATFORM } from '_utils/config';

const prompt = 'spfm.interfaceErrors';

const data = [
  {
    key: 0,
    date: '2018-02-11',
    amount: 120,
    type: 'income',
    note: 'transfer',
  },
  {
    key: 1,
    date: '2018-03-11',
    amount: 243,
    type: 'income',
    note: 'transfer',
  },
  {
    key: 2,
    date: '2018-04-11',
    amount: 98,
    type: 'income',
    note: 'transfer',
  },
];

export default class ListTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      columns: [
        {
          title: 'input',
          dataIndex: 'input',
          width: 200,
          ellipsis: true,
          sorter: true,
          required: true,
          render: (val) => {
            return (
              <Form.Item
                name="input"
                rules={[{
                  required: true,
                }]}
              >
                <CusInput allowClear />
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
          dataIndex: 'inputnumber',
          width: 300,
          // sorter: (a, b) => a.amount - b.amount,
          render: (val) => {
            return (
              <Form.Item
                name="inputnumber"
                rules={[{
                  required: true,
                }]}
              >
                <InputNumber  />
              </Form.Item>
            )
          },
        },
        {
          title: 'select',
          dataIndex: 'select',
          width: 100,
          required: true,
          render: (val) => {
            return (
              <Form.Item
                name="inputnumber"
                rules={[{
                  required: true,
                }]}
              >
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
              </Form.Item>
            )
          },
        },
        {
          title: 'date',
          dataIndex: 'date',
          width: 200,
          required: true,
          render: (val) => {
            return (
              <Form.Item
                name="date"
                rules={[{
                  required: true,
                }]}
              >
                <CusDatePicker  />
              </Form.Item>
            )
          },
        },
        {
          title: 'lov',
          dataIndex: 'lov',
          width: 200,
          required: true,
          render: (val) => {
            return (
              <Form.Item
                name="lov"
                rules={[{
                  required: true,
                }]}
              >
                <CusLov
                  code="SSLM.COST_SUPPLIER_INFO"
                />
              </Form.Item>
            )
          },
        },
        {
          title: 'Note',
          dataIndex: 'note',
          width: 200,
          required: true,
          render: (val) => {
            return (
              <Form.Item>
                <CusUploadFile
                  isEncrypt
                  tableName="SPFM_COMPANY_RS_LINE"
                  action={`${API_HOST}${SRM_PLATFORM}/v1/company-filess/upload`}
                  getFileAsyncFn={getSrmPlatformFiles}
                  deleteFileAsyncFn={deleteExistSrmPlatformFileByKey}
                  tip={"test"}
                />
              </Form.Item>
            )
          },
        },
        {
          title: 'Action',
          key: 'action',
          render: () => {
            return (
              <div>
                <CusButton type="plain">测试</CusButton>
                <CusButton type="plain" style={{ marginLeft: '16px' }}>测试</CusButton>
              </div>
            )
          },
        },
      ],
    };
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
    const { columns } = this.state;
    const rowSelection = {
      // type: 'radio',
      fixed: 'left',
    };

    return (
      <div className="customize-table-from">
        <Form>
          <CusTable
            rowKey="key"
            pagination={{ current: 1, total: 1000 }}
            columns={columns}
            dataSource={[{}]}
            scroll={{ x: tableScrollWidth(columns) }}
            rowSelection={rowSelection}
            showSorterTooltip={false}
            onChange={(a,b,c) => {
              console.log(a,b,c);}}
          />
        </Form>
      </div>
    );
  }
}
