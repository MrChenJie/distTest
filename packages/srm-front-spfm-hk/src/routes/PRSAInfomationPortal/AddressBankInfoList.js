import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import { Checkbox, Form } from 'hzero-ui';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import CusButton from '_cus_components/CusButton';
import { tooltipRender } from '_cus_utils/render';

const prompt = 'spfmhk.supplier';
export default class AddressBankInfoList extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  setDefaultVal = (e, record) => {
    const { prsaInfomationPortal, dispatch } = this.props;
    console.log('this.props', this.props);
    
    const {
      addressBankInfoDataSource = [],
    } = prsaInfomationPortal;
    const { checked } = e.target;
    
    // 创建新数组副本
    const newData = addressBankInfoDataSource.map((item, index) => {
      if (index === record.index) { // 需要记录每个项的索引
        return { ...item, isMainAddress: checked ? "Y" : "N" };
      } else {
        return { ...item, isMainAddress: "N" }; // 其他项设为 N
      }
    });

    // 更新组件状态
    dispatch({
      type: 'prsaInfomationPortal/updateState',
      payload: {
        addressBankInfoDataSource: newData,
      },
    })
  }

  render() {
    const {
      addressBankInfoColumnsRowSelection,
      prsaInfomationPortal,
      readOnly = false,
      handleBankInfoList = (e) => e,
      disabled = false,
    } = this.props;
    const {
      addressBankInfoDataSource = [],
    } = prsaInfomationPortal;
    const columns = [
      {
        title: intl.get(`${prompt}.field.address.of.payment.recipient`).d('付款对象地址'),
        dataIndex: 'payerAddress',
        width: 200,
        required: true,
        render: (value, record) => {
          if(disabled) {
            return <>{tooltipRender(value)}</>
          }
          return (
            <Form.Item>
              {record.$form.getFieldDecorator(`payerAddress`, {
                initialValue: record?.payerAddress,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.address.of.payment.recipient`).d('付款对象地址'),
                    }),
                  }
                ]
              })(
                <CusInput
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.payment.object.code`).d('付款对象代码'),
        dataIndex: 'payerCode',
        width: 200,
        render: tooltipRender
      },
      {
        title: intl.get(`${prompt}.field.payment.object.name`).d('付款对象名称'),
        dataIndex: 'payerAccountName',
        width: 200,
        required: true,
        render: (value, record) => {
          if(disabled) {
            return <>{tooltipRender(value)}</>
          }
          return (
            <Form.Item>
              {record.$form.getFieldDecorator(`payerAccountName`, {
                initialValue: record?.payerAccountName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.payment.object.name`).d('付款对象名称'),
                    }),
                  }
                ]
              })(
                <CusInput
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.bank.primaryaddress`).d('是否主地址'),
        dataIndex: 'isMainAddress',
        width: 200,
        required: true,
        render: (_, record, index) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator(`isMainAddress`, {
                initialValue: record?.isMainAddress,
              })(
                <Checkbox
                  checked={record.isMainAddress === 'Y'}
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
        title: intl.get(`${prompt}.field.bank.addresstatus`).d('地址状态'),
        dataIndex: 'addressStatus',
        width: 200,
        required: true,
        render: (_, record) => {
          if(disabled) {
            return <>{record.addressStatusMeaning}</>
          }
          return (
            <Form.Item>
              {record.$form.getFieldDecorator(`addressStatus`, {
                initialValue: record?.addressStatus,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.bank.addresstatus`).d('地址状态'),
                    }),
                  }
                ]
              })(
                <CusSelect
                  style={{ width: '100%' }}
                  lovCode="HKSP.SUP_ADDSTATUS"
                />
              )}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.table.operation`).d('操作'),
        dataIndex: 'operation',
        width: 200,
        fixed: 'right',
        render: (_, record) => {
          return (
            <CusButton
              type="plain"
              onClick={() => handleBankInfoList(record)}
            >
              {disabled ? intl.get(`${prompt}.button.viewbankinfo`).d('查看银行信息') : intl.get(`${prompt}.button.editbankinfo`).d('编辑银行信息')}
            </CusButton>
          )
        }
      }
    ];
    return (
      <EditTable
        rowKey="rowKey"
        columns={columns}
        dataSource={addressBankInfoDataSource}
        rowSelection={addressBankInfoColumnsRowSelection}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    )
  }
}
