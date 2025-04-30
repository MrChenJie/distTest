import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import { Checkbox, Form } from 'hzero-ui';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import { tooltipRender } from '_cus_utils/render';

const prompt = 'spfmhk.supplier';
export default class BankInfoList extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  setDefaultVal = (e, record) => {
    const { supplierHK, dispatch } = this.props;
    
    const {
      bankInfoListDataSource = [],
    } = supplierHK;
    const { checked } = e.target;
    
    // 创建新数组副本
    const newData = bankInfoListDataSource.map((item, index) => {
      if (index === record.index) { // 需要记录每个项的索引
        return { ...item, isMain: checked ? "Y" : "N" };
      } else {
        return { ...item, isMain: "N" }; // 其他项设为 N
      }
    });

    // 更新组件状态
    dispatch({
      type: 'supplierHK/updateState',
      payload: {
        bankInfoListDataSource: newData,
      },
    })
  }

  handleLeaveCode = (record, lovData) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierHK/getLeaveCode',
      payload: {
        ruleCode: 'BANK_CODE',
      },
    }).then((res) => {
      if(res) {
        record.$form.setFieldsValue({
          bankAccountName: `${lovData.bankName}${res?.BANK_CODE}`
        });
      }
    })
  }

  render() {
    const { bankInfoColumnsRowSelection, supplierHK, disabled = false } = this.props;
    const {
      bankInfoListDataSource = [],
    } = supplierHK;

    console.log('bankInfoListDataSource', bankInfoListDataSource);
    
    const columns = [
      {
        title: intl.get(`${prompt}.field.opening.bank`).d('供应商开户行银行'),
        dataIndex: 'bankName',
        width: 200,
        required: true,
        render: (_, record) => {
          if(disabled) {
            return <>{tooltipRender(record?.bankName)}</>
          }
          return (
            <Form.Item>
              {record?.$form?.getFieldDecorator(`bankNameForm`, {
                initialValue: record?.bankName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.opening.bank`).d('供应商开户行银行'),
                    }),
                  }
                ]
              })(
                <CusLov
                  style={{ width: '100%' }}
                  code="CMHK.API.BANKINFO"
                  lovOptions={{ displayField: 'bankName', valueField: 'id' }}
                  textValue={record?.bankName}
                  onChange={(e, lovData) => {
                    record.bankName = lovData.bankName;
                    record.branchName = lovData.bankBranchName;
                    record.country = lovData.bankCountryCode;
                    record.interRemittanceNum = lovData.swiftCode;
                    record.ebsBankId = lovData.ebsBankId; // ebs银行ID(handleSave也需要加)
                    record.ebsBranchId = lovData.ebsBranchId; // ebs分行ID(handleSave也需要加)
                    record.$form.setFieldsValue({
                      bankAccountName: ''
                    })
                    if(lovData.bankName === 'Dummy') {
                      this.handleLeaveCode(record, lovData);
                    }
                  }}
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.bank.branch.name`).d('分行名称'),
        dataIndex: 'branchName',
        width: 200,
        render: (_, record) => {
          return (
            <Form.Item>
              {record?.$form.getFieldDecorator(`branchName`, {
                initialValue: record?.branchName,
              })(
                  <span>{tooltipRender(record?.branchName)}</span>
                )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.country`).d('国家'),
        dataIndex: 'country',
        width: 200,
        render: (_, record) => {
          return (
            <Form.Item>
              {record?.$form.getFieldDecorator(`country`, {
                initialValue: record?.country,
              })(
                <span>{record?.country}</span>
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.international.remittance.number`).d('国际汇款编号'),
        dataIndex: 'interRemittanceNum',
        width: 200,
        render: (_, record) => {
          return (
            <Form.Item>
              {record?.$form.getFieldDecorator(`interRemittanceNum`, {
                initialValue: record?.interRemittanceNum,
              })(
                <span>{tooltipRender(record?.interRemittanceNum)}</span>
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
        render: (_, record) => {
          if(disabled) {
            return <>{tooltipRender(record?.accountName)}</>
          }
          return (
            <Form.Item>
              {record?.$form.getFieldDecorator(`accountName`, {
                initialValue: record?.accountName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.account.name`).d('账户名称'),
                    }),
                  }
                ]
              })(
                  <CusInput
                    style={{ width: '100%' }}
                    onChange={(val) => {
                      record.accountName = val;
                    }}
                  />
                )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.bank.account`).d('银行账户'),
        dataIndex: 'bankAccountName',
        width: 200,
        required: true,
        render: (_, record) => {
          if(disabled) {
            return <>{tooltipRender(record?.bankAccountName)}</>
          }
          return (
            <Form.Item>
              {record?.$form.getFieldDecorator(`bankAccountName`, {
                initialValue: record?.bankAccountName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.bank.account`).d('银行账户'),
                    }),
                  }
                ]
              })(
                  <CusInput
                    style={{ width: '100%' }}
                    onChange={(val) => {
                      record.bankAccountName = val;
                    }}
                  />
                )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.master.account.or.not`).d('是否主账号'),
        dataIndex: 'isMain',
        width: 200,
        render: (_, record, index) => {
          return (
            <Form.Item>
              {record?.$form.getFieldDecorator(`isMain`, {
                initialValue: record?.isMain,
              })(
                <Checkbox
                  checked={record.isMain === 'Y'}
                  checkedValue="Y"
                  unCheckedValue="N"
                  onChange={(e) => {
                    this.setDefaultVal(e, { ...record, index })
                  }}
                  disabled={disabled}
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.bank.status`).d('银行状态'),
        dataIndex: 'bankStatus',
        width: 200,
        required: true,
        render: (_, record) => {
          if(disabled) {
            return <>{record.bankStatusMeaning}</>
          }
          return (
            <Form.Item>
              {record?.$form.getFieldDecorator(`bankStatus`, {
                initialValue: record?.bankStatus,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.bank.status`).d('银行状态'),
                    }),
                  }
                ]
              })(
                <CusSelect
                  style={{ width: '100%' }}
                  lovCode="HKSP.BANK_STATUS"
                  onChange={(val) => {
                    record.bankStatus = val;
                  }}
                />
              )}
            </Form.Item>
          )
        }
      },
    ];
    return (
      <EditTable
        rowKey="rowKey"
        columns={columns}
        dataSource={bankInfoListDataSource}
        rowSelection={bankInfoColumnsRowSelection}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    )
  }
}
