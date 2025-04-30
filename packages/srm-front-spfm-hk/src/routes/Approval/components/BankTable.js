import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { Checkbox, Form } from 'hzero-ui';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';

const prompt = 'spfmhk.supplier';
export default class BankTable extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    const { rowSelection, dataSource, form, rowKey } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.field.opening.bank`).d('供应商开户行银行'),
        dataIndex: 'bankName',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.bank.branch.name`).d('分行名称'),
        dataIndex: 'branchName',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.bank.country`).d('国家'),
        dataIndex: 'country',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.international.remittance.number`).d('国际汇款编号'),
        dataIndex: 'interRemittanceNum',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.account.name`).d('账户名称'),
        dataIndex: 'accountName',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.bank.account`).d('银行账户'),
        dataIndex: 'bankAccountName',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.view.bank.payment.address`).d('付款对象地址'),
        dataIndex: 'payerAddress',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.bank.primaryaddress`).d('是否主地址'),
        dataIndex: 'isMainAddress',
        width: 200,
        align: 'left',
        render: (values, record) => {
          const { getFieldDecorator } = form;
          return (
            <Form.Item>
              {getFieldDecorator(`isMainAddress${record.id}`, {
                initialValue: record?.isMainAddress,
              })(<Checkbox checked={record.isMainAddress === 'Y'}
                           checkedValue="Y"
                           unCheckedValue="N"
                           disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.bank.addresstatus`).d('地址状态'),
        dataIndex: 'addressStatusMeaning',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.payment.object.code`).d('付款对象代码'),
        dataIndex: 'payerCode',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.contact.is.primary.account`).d('是否主账号'),
        dataIndex: 'isMain',
        align: 'left',
        width: 200,
        render: (_, record) => {
          const { getFieldDecorator } = form;
          return (
            <Form.Item>
              {getFieldDecorator(`isMain${record.id}`, {
                initialValue: record?.isMain,
              })(<Checkbox checked={record.isMain === 'Y'}
                           checkedValue="Y"
                           unCheckedValue="N"
                           disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.bank.status`).d('银行状态'),
        dataIndex: 'bankStatusMeaning',
        width: 200,
      },
    ];
    return (
      <CusTable
        columns={columns}
        dataSource={dataSource}
        rowSelection={rowSelection}
        scroll={{ x: tableScrollWidth(columns) }}
        rowKey={rowKey}
      />
    )
  }
}
