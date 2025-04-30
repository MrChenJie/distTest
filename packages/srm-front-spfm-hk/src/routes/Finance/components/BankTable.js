import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import { Checkbox, Form } from 'hzero-ui';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';

const prompt = 'spfmhk.supplier';
@formatterCollections({ code: [prompt] })
export default class BankTable extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  /**
   * 设置唯一
   */
  @Bind()
  setDefaultVal(val, record, field) {
    const { handleChange, dataSource } = this.props;
    record[field] = val.target.checked;
    const arr = dataSource.map(i => {
      if(i.uuid !== record.uuid) {
        return {
          ...i,
          [field]: 'N'
        }
      } else {
        return i
      }
    });
    handleChange(arr);
  }

  render() {
    const { rowSelection, dataSource, form, rowKey, readOnly = false } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.field.opening.bank`).d('供应商开户行银行'),
        dataIndex: 'bankName',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator, setFieldsValue } = form;
          if(readOnly) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`bankName${record.uuid}`, {
                initialValue: record?.bankName,
              })(<CusLov style={{ width: '100%' }}
                         code="CMHK.API.BANKINFO"
                         lovOptions={{ displayField: 'bankName', valueField: 'id' }}
                         textValue={record?.bankName}
                         onChange={(e, lovData) => {
                           record.bankName = lovData.bankName;
                           record.branchName = lovData.bankBranchName;
                           record.country = lovData.bankCountryCode;
                           record.interRemittanceNum = lovData.swiftCode;
                           record.ebsBankId = lovData.ebsBankId;
                           record.ebsBranchId = lovData.ebsBranchId;
                           // setFieldsValue({
                           //   [`branchName${record.uuid}`]: lovData.bankBranchName,
                           //   [`country${record.uuid}`]: lovData.bankCountryCode,
                           //   [`interRemittanceNum${record.uuid}`]: lovData.swiftCode,
                           // });
                         }}
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
              {getFieldDecorator(`branchName${record.uuid}`, {
                initialValue: record?.branchName,
              })(
                <>{record?.branchName}</>
                )}
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
              {getFieldDecorator(`country${record.uuid}`, {
                initialValue: record?.country,
              })(
              <>{record?.country}</>
              )}
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
              {getFieldDecorator(`interRemittanceNum${record.uuid}`, {
                initialValue: record?.interRemittanceNum,
              })(
                <>{record?.interRemittanceNum}</>
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.account.name`).d('账户名称'),
        dataIndex: 'accountName',
        width: 200,
        required: true,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(readOnly) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`accountName${record.uuid}`, {
                initialValue: record?.accountName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.account.name`).d('账户名称'),
                    }),
                  }
                ]
              })(<CusInput style={{ width: '100%' }}
                           onChange={e => record.accountName = e}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.bank.account`).d('银行账户'),
        dataIndex: 'bankAccountName',
        width: 200,
        required: true,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(readOnly) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`bankAccountName${record.uuid}`, {
                initialValue: record?.bankAccountName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.bank.account`).d('银行账户'),
                    }),
                  }
                ]
              })(<CusInput style={{ width: '100%' }}
                           onChange={e => record.bankAccountName = e}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.address.of.payment.recipient`).d('付款对象地址'),
        dataIndex: 'payerAddress',
        width: 200,
        required: true,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(readOnly) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`payerAddress${record.uuid}`, {
                initialValue: record?.payerAddress,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.address.of.payment.recipient`).d('付款对象地址'),
                    }),
                  }
                ]
              })(<CusInput style={{ width: '100%' }}
                           onChange={e => record.payerAddress = e}
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
        render: (value, record) => {
          const { getFieldDecorator } = form;
          return (
            <Form.Item>
              {getFieldDecorator(`isMainAddress${record.uuid}`, {
              })(<Checkbox checked={record.isMainAddress === 'Y'}
                           checkedValue="Y"
                           unCheckedValue="N"
                           disabled={readOnly}
                           onChange={(e) => this.setDefaultVal(e, record, 'isMainAddress')}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.bank.addresstatus`).d('地址状态'),
        dataIndex: 'addressStatus',
        width: 200,
        required: true,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(readOnly) {
            return <>{record.addressStatusMeaning}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`addressStatus${record.uuid}`, {
                initialValue: record?.addressStatus,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.bank.addresstatus`).d('地址状态'),
                    }),
                  }
                ]
              })(<CusSelect style={{ width: '100%' }}
                            lovCode="HKSP.SUP_ADDSTATUS"
                            disabled={readOnly}
                            onChange={e => record.addressStatus = e}
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
        render: (_, record) => {
          const { getFieldDecorator } = form;
          return (
            <Form.Item>
              {getFieldDecorator(`isMain${record.uuid}`)(<Checkbox checked={record.isMain === 'Y'}
                                                                 checkedValue="Y"
                                                                 unCheckedValue="N"
                                                                 disabled={readOnly}
                                                                 onChange={(e) => record.isMain = e.target.checked}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.bank.status`).d('银行状态'),
        dataIndex: 'bankStatus',
        width: 200,
        required: true,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(readOnly) {
            return <>{record.bankStatusMeaning}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`bankStatus${record.uuid}`, {
                initialValue: record?.bankStatus,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.bank.status`).d('银行状态'),
                    }),
                  }
                ]
              })(<CusSelect style={{ width: '100%' }}
                            lovCode="HKSP.BANK_STATUS"
                            onChange={e => record.bankStatus = e}

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
