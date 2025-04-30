import React, { PureComponent, Fragment } from 'react';
import { Col, Row } from 'antd';
import { Form } from 'hzero-ui';
import { getLFormGridSpan } from 'srm-front-common/lib/utils/utils';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusLov from '_cus_components/CusLov';
import Checkbox from 'components/Checkbox';
import { getDateFormat, tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import CusButton from 'srm-front-common/lib/components/CusButton';
import { Bind } from 'lodash-decorators';
import EditTable from '_cus_components/EditTable';

const prompt = 'spfmhk.supplier';
@Form.create()
export default class BankTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
    };
  }

  componentDidMount() {}

  /**
   * 选中Lov时设置分行名称
   * @param value
   * @param lovRecord
   * @param record
   */
  @Bind()
  bankFirmOnChange(value, lovRecord, record) {
    // console.log('value', value);
    // console.log('lovRecord', lovRecord);
    // console.log('record', record);
    const { dispatch, bankList = [] } = this.props;
    const { $form } = record;
    // $form.setFieldsValue({
    //   bankName: lovRecord.bank,
    //   branchName: lovRecord.bankBranchName,
    //   country: lovRecord.bankCountryCode,
    //   interRemittanceNum: lovRecord.swiftCode,
    // });
    bankList.map((item) => {
      if (item.bankId === record.bankId) {
        item.bankName = lovRecord.bankName;
        item.branchName = lovRecord.bankBranchName;
        item.country = lovRecord.bankCountryCode;
        item.interRemittanceNum = lovRecord.swiftCode;
        item.ebsBankId = lovRecord.ebsBankId;
        item.ebsBranchId = lovRecord.ebsBranchId;
      }
      return item;
    });

    dispatch({
      type: `enterpriseBank/updateState`,
      payload: {
        bankList,
      },
    });
  }

  @Bind()
  getColumns(form) {
    const { registerState, disabled = true } = this.props;
    // const disabled = registerState === 'manager' ? true : false; 现在默认都不能编辑；
    // const disabled = true;
    return [
      {
        title: intl.get(`${prompt}.field.opening.bank`).d('供应商开户行银行'),
        dataIndex: 'bankName',
        width: 320,
        render: (_, record) => {
          const { getFieldDecorator } = form;
          return !disabled ? (
            <Form.Item>
              {getFieldDecorator(`bankName${record.bankId}`, {
                initialValue: record?.bankName,
              })(
                <CusLov
                  style={{ width: '100%' }}
                  code="CMHK.API.BANKINFO"
                  onChange={(value, lovRecord) => this.bankFirmOnChange(value, lovRecord, record)}
                  textValue={record.bankName}
                  disabled={disabled}
                />
              )}
            </Form.Item>
          ) : (
            _
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.bank.branch.name`).d('分行名称'),
        dataIndex: 'branchName',
        width: 280,
        render: (_, record) => {
          return record?.branchName;
        },
      },
      {
        title: intl.get(`${prompt}.field.bank.country`).d('国家'),
        dataIndex: 'country',
        width: 180,
        render: (_, record) => {
          return record?.country;
        },
      },
      {
        title: intl.get(`${prompt}.field.international.remittance.number`).d('国际汇款编号'),
        width: 280,
        dataIndex: 'interRemittanceNum',
        render: (_, record) => {
          return record?.interRemittanceNum;
        },
      },
      {
        title: intl.get(`${prompt}.field.account.name`).d('账户名称'),
        width: 280,
        dataIndex: 'accountName',
        render: (_, record) => {
          const { getFieldDecorator } = form;
          return !disabled ? (
            <Form.Item>
              {getFieldDecorator(`accountName${record.bankId}`, {
                initialValue: record?.accountName,
              })(
                <CusInput
                  style={{ width: '100%' }}
                  onChange={(e) => (record.accountName = e)}
                  disabled={disabled}
                />
              )}
            </Form.Item>
          ) : (
            _
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.bank.account`).d('银行账户'),
        width: 280,
        dataIndex: 'bankAccountName',
        render: (_, record) => {
          const { getFieldDecorator } = form;
          return !disabled ? (
            <Form.Item>
              {getFieldDecorator(`bankAccountName${record.bankId}`, {
                initialValue: record?.bankAccountName,
              })(
                <CusInput
                  style={{ width: '100%' }}
                  onChange={(e) => (record.bankAccountName = e)}
                  disabled={disabled}
                />
              )}
            </Form.Item>
          ) : (
            _
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.address.of.payment.recipient`).d('付款对象地址'),
        dataIndex: 'payerAddress',
        width: 280,
        render: (_, record) => {
          const { getFieldDecorator } = form;
          return !disabled ? (
            <Form.Item>
              {getFieldDecorator(`payerAddress${record.bankId}`, {
                initialValue: record?.payerAddress,
              })(
                <CusInput
                  style={{ width: '100%' }}
                  onChange={(e) => (record.payerAddress = e)}
                  disabled={disabled}
                />
              )}
            </Form.Item>
          ) : (
            _
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.bank.primaryaddress`).d('是否主地址'),
        width: 180,
        dataIndex: 'isMainAddress',
        render: (values, record) => {
          const { getFieldDecorator } = form;
          return (
            <Form.Item>
              {getFieldDecorator(`isMainAddress${record.bankId}`, {
                initialValue: record?.isMainAddress,
              })(
                <Checkbox
                  checked={record.isMainAddress === 'Y'}
                  checkedValue="Y"
                  unCheckedValue="N"
                  disabled={disabled}
                  onChange={(e) => {
                    // 设置唯一主地址
                    this.handleSetMainAddress(e,record);
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.bank.addresstatus`).d('地址状态'),
        width: 180,
        dataIndex: 'addressStatus',
        render: (_, record) => {
          const { getFieldDecorator } = form;
          return !disabled ? (
            <Form.Item>
              {getFieldDecorator(`addressStatus${record.bankId}`, {
                initialValue: record?.addressStatus,
              })(
                <CusSelect
                  style={{ width: '100%' }}
                  lovCode="HKSP.SUP_ADDSTATUS"
                  disabled={disabled}
                  onChange={(e) => {
                    record.addressStatus = e;
                  }}
                />
              )}
            </Form.Item>
          ) : (
            record.addressStatusMeaning
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.payment.object.code`).d('付款对象代码'),
        dataIndex: 'payerCode',
        width: 280,
        render: (_, record) => {
          return record?.payerCode;
        },
      },
      {
        title: intl.get(`${prompt}.field.master.account.or.not`).d('是否主账号'),
        dataIndex: 'isMain',
        width: 180,
        render: (_, record) => {
          const { getFieldDecorator } = form;
          return (
            <Form.Item>
              {getFieldDecorator(`isMain${record.bankId}`, {
                initialValue: record?.isMain,
              })(
                <Checkbox
                  checked={record.isMain === 'Y'}
                  checkedValue="Y"
                  unCheckedValue="N"
                  disabled={disabled}
                  onChange={(e) => (record.isMain = e.target.checked === 1 ? 'Y' : 'N')}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.bank.status`).d('银行状态'),
        dataIndex: 'bankStatus',
        width: 160,
        render: (_, record) => {
          const { getFieldDecorator } = form;
          return !disabled ? (
            <Form.Item>
              {getFieldDecorator(`bankStatus${record.bankId}`, {
                initialValue: record?.bankStatus,
              })(
                <CusSelect
                  style={{ width: '100%' }}
                  lovCode="HKSP.BANK_STATUS"
                  disabled={disabled}
                  onChange={(e) => {
                    record.bankStatus = e;
                  }}
                />
              )}
            </Form.Item>
          ) : (
            record.bankStatusMeaning
          );
        },
      },
    ];
  }

  // 设置主地址
  handleSetMainAddress = (e, record) => { 
    record.isMainAddress = e.target.checked === 1 ? 'Y' : 'N';
    const { bankList,dispatch } = this.props;
    const newDataSource = bankList.filter((i) => i.isDel !== '1').map(item => { 
      if (record.bankId === item.bankId) {
        item.isMainAddress = 'Y'
      } else { 
        item.isMainAddress = 'N'
      }
      return item
    });
    dispatch({
      type: 'prsaInfomationPortal/updateState',
      payload: {
        bankList: newDataSource,
      },
    });
  }

  render() {
    const { rowSelection, onChange, form, bankList = [], loading = false } = this.props;
    const gridSpan = getLFormGridSpan();
    const columns = this.getColumns(form);
    return (
      <Fragment>
        <EditTable
          rowKey="bankId"
          pagination={false}
          columns={columns}
          loading={loading}
          dataSource={bankList.filter((i) => i.isDel !== '1')}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </Fragment>
    );
  }
}
