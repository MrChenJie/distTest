import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import { Form } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import { tooltipRender } from '_cus_utils/render';
import CusLov from '_cus_components/CusLov';
import CusMultiLov from '_cus_components/CusMultiLov';

const prompt = 'spfmhk.dict';
@Form.create()
@formatterCollections({ code: [prompt] })
export default class FinanceListTable extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    const {
      rowSelection,
      readOnly = false,
      idpValueMap,
      tenantId,
      dataSource,
      isSupplier,
    } = this.props;
    const columns = [
      {
        title: intl.get('spfmhk.dict.view.field.portalordercurrency').d('订单币种'),
        dataIndex: 'orderCurrency',
        width: 160,
        render: (value, record, index) => {
          return (readOnly || isSupplier) ? (
            tooltipRender(record?.orderCurrency)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('orderCurrency', {
                initialValue: Array.isArray(record?.orderCurrency)
                ? record?.orderCurrency
                : record?.orderCurrency?.split(','),
              })(
                <CusMultiLov
                  code="HPFM.CURRENCY"
                  textValue={record?.orderCurrency}
                  onChange={(value) => {
                    record.orderCurrency=value;
                  }}
                  lovOptions={{ displayField: 'currencyCode', valueField: 'currencyCode' }}
                  mode="multiple"
                />,
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.view.field.portalpaymentterm`).d('付款期限'),
        dataIndex: 'paymentProvision',
        width: 160,
        render: (value, record, index) => {
          return (
            (readOnly || isSupplier) ? tooltipRender(record?.paymentProvision) :
              <Form.Item>
                {record.$form.getFieldDecorator('paymentProvision', {
                  initialValue: record?.paymentProvision,
                })(
                  <CusSelect
                    options={idpValueMap['HKSP.CREDIT_PERIOD']}
                    lazyload={false}
                    allowClear
                    disabled={readOnly}
                    onChange={(value) => {
                      record.paymentProvision = value;
                    }}
                  />,
                )}
              </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.view.field.portaldepositbank`).d('开户银行'),
        dataIndex: 'depositBank',
        width: 280,
        render: (value, record, index) => {
          return (readOnly || isSupplier) ? tooltipRender(record?.depositBank) : <Form.Item>
            {record.$form.getFieldDecorator('depositBank', {
              initialValue: record?.depositBank,
            })(
              <CusLov
                code="CMHK.API.BANKINFO"
                allowClear
                lovOptions={{ displayField: 'bank', valueField: 'id' }}
                textValue={record.depositBank}
                onChange={(value, row) => {
                  record.depositBank = row.bankName;
                  record.country = row.bankCountryCode;
                  record.ibanCode = row.swiftCode;
                }}
              />,
            )}
          </Form.Item>;
        },
      },
      {
        title: intl.get(`${prompt}.view.field.portalcountry`).d('国家'),
        dataIndex: 'country',
        width: 160,
        // render: (value, record, index) => {
        //   return (readOnly || isSupplier) ? (
        //     tooltipRender(record?.countryCode)
        //   ) : (
        //     <Form.Item>
        //       {record.$form.getFieldDecorator('countryCode', {
        //         initialValue: record?.countryCode,
        //       })(
        //         <CusLov
        //           code="HPFM.COUNTRY"
        //           allowClear
        //           queryParams={{ tenantId: tenantId }}
        //           lovOptions={{ displayField: 'countryName', valueField: 'countryCode' }}
        //           textValue={record?.countryCode}
        //           disabled
        //         />,
        //       )}
        //     </Form.Item>
        //   );
        // },
      },
      {
        title: intl.get('spfmhk.dict.view.field.portalswiftcode').d('国际汇款编号'),
        dataIndex: 'ibanCode',
        width: 160,
        // render: (value, record) => {
        //   return (readOnly || isSupplier) ? (
        //     tooltipRender(record.ibanCode)
        //   ) : (
        //     <Form.Item>
        //       {record.$form.getFieldDecorator('ibanCode', {
        //         initialValue: record?.ibanCode,
        //       })(
        //         <CusInput
        //           onChange={(value) => {
        //             record.ibanCode = value;
        //           }}
        //           disabled={readOnly}
        //         />,
        //       )}
        //     </Form.Item>
        //   );
        // },
      },
      {
        title: intl.get('spfmhk.dict.view.field.portalbankname').d('账户名称'),
        dataIndex: 'accountName',
        width: 160,
        render: (value, record) => {
          return (readOnly || isSupplier) ? (
            tooltipRender(record.accountName)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('accountName', {
                initialValue: record?.accountName,
              })(
                <CusInput
                  onChange={(value) => {
                    record.accountName = value;
                  }}
                  disabled={readOnly}
                />,
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('spfmhk.dict.view.field.portalbankaccount').d('银行账户'),
        dataIndex: 'account',
        width: 160,
        render: (value, record) => {
          return (readOnly || isSupplier) ? (
            tooltipRender(record.account)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('account', {
                initialValue: record?.account,
              })(
                <CusInput
                  onChange={(value) => {
                    record.account = value;
                  }}
                  disabled={readOnly}
                />,
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.view.field.portalinternationalreg`).d('国贸条规'),
        dataIndex: 'tradeTerms',
        width: 160,
        render: (value, record) => {
          return (
            (readOnly || isSupplier) ? tooltipRender(record.tradeTerms) :
              <Form.Item>
                {record.$form.getFieldDecorator('tradeTerms', {
                  initialValue: record?.tradeTerms,
                })(
                  <CusSelect
                    lovCode="HKSP.DELI_TERMS"
                    lazyload={false}
                    allowClear
                    disabled={readOnly}
                    onChange={(value) => {
                      record.tradeTerms = value;
                    }}
                  />,
                )}
              </Form.Item>
          );
        },
      },
    ];
    return (
      <Fragment>
        <EditTable
          rowKey="rowKey"
          pagination={false}
          columns={columns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </Fragment>
    );
  }
}
