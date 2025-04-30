import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import CusSelect from '_cus_components/CusSelect';
import { Form, Checkbox } from 'hzero-ui';
import EditTable from '_cus_components/EditTable';
import CusInput from '_cus_components/CusInput';

const prompt = 'spfmhk.supplier';

@Form.create()
export default class ContactTable extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    const { rowSelection, onChange, dataSource = [], rowKey, form } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.contact.info.type`).d('联系人类型'),
        dataIndex: 'type',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <Form.Item>
              {getFieldDecorator(`type${record.id}`, {
                initialValue: record.type,
              })(<CusSelect style={{ width: '100%' }} />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.contact.info.name`).d('姓名'),
        dataIndex: 'name',
        width: 200
      },
      {
        title: intl.get(`${prompt}.field.phoneNumber`).d('电话'),
        dataIndex: 'phone',
        width: 200
      },
      {
        title: intl.get(`${prompt}.contact.info.email`).d('电邮'),
        dataIndex: 'email',
        width: 200
      },
      {
        title: intl.get(`${prompt}.contact.info.default`).d('默认联系人'),
        dataIndex: 'isDefault',
        align: 'left',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = record.$form;
          return (
            <Form.Item>
              {getFieldDecorator(`isDefault${record.id}`)(<Checkbox checked={record.isDefault === 'Y'} onChange={(e) => {record.isDefault = e.target.checked ? 'Y' : 'N'}}/>)}
            </Form.Item>
          )
        }
      },
    ].filter(Boolean);

    return (
      <EditTable
        rowKey={rowKey}
        pagination={false}
        columns={columns}
        dataSource={dataSource}
        rowSelection={rowSelection}
        scroll={{ x: tableScrollWidth(columns) }}
        onChange={onChange}
      />
    )
  }
}
