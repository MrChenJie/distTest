import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
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
    const { rowSelection, dataSource, form, rowKey, readOnly = false } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.field.opening.bank`).d('供应商开户行银行'),
        dataIndex: 'bankName',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(readOnly) {
            return <>{record.bankName}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`bankName${record.id}`, {
                initialValue: record?.bankName,
              })(<CusLov style={{ width: '100%' }}
                         code="CMHK.API.BANKINFO"
                         lovOptions={{ displayField: 'bankName' }}
                         textValue={record?.bankName}
                         disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.bank.branch.name`).d('分行名称'),
        dataIndex: 'branchName',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(readOnly) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`branchName${record.id}`, {
                initialValue: record?.branchName,
              })(<CusInput style={{ width: '100%' }}
                           disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.bank.country`).d('国家'),
        dataIndex: 'country',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(readOnly) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`country${record.id}`, {
                initialValue: record?.country,
              })(<CusLov style={{ width: '100%' }}
                         code="HPFM.COUNTRY"
                         lovOptions={{ displayField: 'countryName', valueField: 'countryCode' }}
                         textValue={record?.country}
                         disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.international.remittance.number`).d('国际汇款编号'),
        dataIndex: 'interRemittanceNum',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(readOnly) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`interRemittanceNum${record.id}`, {
                initialValue: record?.interRemittanceNum,
              })(<CusInput style={{ width: '100%' }}
                           disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.account.name`).d('账户名称'),
        dataIndex: 'accountName',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(readOnly) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`accountName${record.id}`, {
                initialValue: record?.accountName,
              })(<CusInput style={{ width: '100%' }}
                           onChange={e => record.accountName = e}
                           disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.bank.account`).d('银行账户'),
        dataIndex: 'bankAccountName',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(readOnly) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`bankAccountName${record.id}`, {
                initialValue: record?.bankAccountName,
              })(<CusInput style={{ width: '100%' }}
                           disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.address.of.payment.recipient`).d('付款对象地址'),
        dataIndex: 'payerAddress',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(readOnly) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`payerAddress${record.id}`, {
                initialValue: record?.payerAddress,
              })(<CusInput style={{ width: '100%' }}
                           disabled
              />)}
            </Form.Item>
          )
        }
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
        dataIndex: 'addressStatus',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(readOnly) {
            return <>{record.addressStatusMeaning}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`addressStatus${record.id}`, {
                initialValue: record?.addressStatus,
              })(<CusSelect style={{ width: '100%' }}
                            lovCode="HKSP.SUP_ADDSTATUS"
                            disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.payment.object.code`).d('付款对象代码'),
        dataIndex: 'payerCode',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.master.account.or.not`).d('是否主账号'),
        dataIndex: 'isMain',
        width: 200,
        align: 'left',
        render: (value, record) => {
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
        dataIndex: 'bankStatus',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(readOnly) {
            return <>{record.bankStatusMeaning}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`bankStatus${record.id}`, {
                initialValue: record?.bankStatus,
              })(<CusSelect style={{ width: '100%' }}
                            lovCode="HKSP.BANK_STATUS"
                            disabled
              />)}
            </Form.Item>
          )
        }
      },
    ];
    return (
      <EditTable
        columns={columns}
        dataSource={dataSource}
        rowSelection={rowSelection}
        scroll={{ x: tableScrollWidth(columns) }}
        rowKey={rowKey}
      />
    )
  }
}
