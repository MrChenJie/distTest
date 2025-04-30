import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import CusSelect from '_cus_components/CusSelect';
import { Bind } from 'lodash-decorators';
import CusInput from '_cus_components/CusInput';
import { Col, Row } from 'antd';
import { TRIM, EMAIL, PHONE } from 'utils/regExp';

const prompt = 'spfmhk.supplier';

@Form.create()
export default class A2PTable extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  // 联系人表格
  @Bind()
  contactTypeColumns() {
    const { form, disabled } = this.props;
    return [
      {
        title: intl.get(`${prompt}.field.a2p.supplier.contact.type`).d('A2P业务联系人类型'),
        dataIndex: 'type',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{record.typeMeaning}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`type${record.id}`, {
                initialValue: record.type
              })(<CusSelect style={{ width: '100%' }}
                            lovCode="HKSP.A2P_CONTACT_TYPE"
                            disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.contact.person.name`).d('A2P业务联系人姓名'),
        dataIndex: 'name',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`name${record.id}`, {
                initialValue: record.name
              })(<CusInput style={{ width: '100%' }}
                           disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.contact.mailbox`).d('A2P业务联系人邮箱'),
        dataIndex: 'email',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`email${record.id}`, {
                initialValue: record.email,
                rules: [
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ],
              })(<CusInput style={{ width: '100%' }}
                           disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.contact.position`).d('A2P业务联系人职位'),
        dataIndex: 'position',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`position${record.id}`, {
                initialValue: record.position
              })(<CusInput style={{ width: '100%' }}
                           disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.contact.phone.number`).d('A2P业务联系人电话'),
        dataIndex: 'phone',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`phone${record.id}`, {
                initialValue: record.phone
              })(<CusInput style={{ width: '100%' }}
                           disabled
              />)}
            </Form.Item>
          )
        }
      },
    ]
  }
  // 账号表格
  @Bind()
  accountColumns() {
    const { form, disabled } = this.props;
    return [
      {
        title: intl.get(`${prompt}.field.a2p.access.account`).d('接入账号'),
        dataIndex: 'account',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`account${record.id}`, {
                initialValue: record.account
              })(<CusInput style={{ width: '100%' }}
                           disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.access.method`).d('接入方式'),
        dataIndex: 'method',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`method${record.id}`, {
                initialValue: record.method
              })(<CusSelect style={{ width: '100%' }}
                            lovCode="HKSP.ACCESS_METHOD"
                            disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.protocol`).d('Protocol'),
        dataIndex: 'protocol',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`protocol${record.id}`, {
                initialValue: record.protocol
              })(<CusSelect style={{ width: '100%' }}
                            lovCode="HKSP.PROTOCOL"
                            disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.settlement.mode`).d('结算模式'),
        dataIndex: 'captiveModel',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{record.captiveModelMeaning}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`captiveModel${record.id}`, {
                initialValue: record.captiveModel
              })(<CusSelect style={{ width: '100%' }}
                            lovCode="HKSP.SETTLE_MODE"
                            disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.tps`).d('TPS'),
        dataIndex: 'tps',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`tps${record.id}`, {
                initialValue: record.tps
              })(<CusInput style={{ width: '100%' }}
                           disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.ip`).d('IP'),
        dataIndex: 'ip',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`ip${record.id}`, {
                initialValue: record.ip
              })(<CusInput style={{ width: '100%' }}
                           disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.session`).d('Session'),
        dataIndex: 'accountSession',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`accountSession${record.id}`, {
                initialValue: record.accountSession
              })(<CusInput style={{ width: '100%' }}
                           disabled
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.special.configuration.instructions`).d('特殊配置说明'),
        dataIndex: 'specialConfiguration',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`specialConfiguration${record.id}`, {
                initialValue: record.specialConfiguration
              })(<CusInput style={{ width: '100%' }}
                           disabled
              />)}
            </Form.Item>
          )
        }
      },
    ]
  }

  render() {
    const { rowSelection, form: { getFieldDecorator }, rowKey, data, disabled = false } = this.props;
    const { a2p, account = [], contacts = [] }  = data;
    const contactTypeColumns = this.contactTypeColumns();
    const accountColumns = this.accountColumns();
    const gridSpan = {
      xs: 12,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12,
      xxl: 12
    };
    return (
      <Fragment>
        <Form className="customize-form">
          <Row gutter={24}>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.a2p.info.quotation.mail`).d('供应商报价邮件')}>
                {getFieldDecorator('quoteEmail', {
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.a2p.info.quotation.mail`).d('供应商报价邮件'),
                    }),
                  }],
                  initialValue: a2p?.quoteEmail
                })(<CusInput allowClear disabled={disabled}/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.a2p.info.advance.in.price`).d('涨价通知期')}>
                {getFieldDecorator('priceIncreaseNotice', {
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.a2p.info.advance.in.price`).d('涨价通知期'),
                    }),
                  }],
                  initialValue: a2p?.priceIncreaseNotice
                })(<CusInput allowClear disabled={disabled}/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.a2p.info.credit.limit`).d('Credit Limit')}>
                {getFieldDecorator('creditLimit', {
                  initialValue: a2p?.creditLimit
                })(<CusInput allowClear disabled={disabled}/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.a2p.info.settlement.term`).d('结算条件')}>
                {getFieldDecorator('settlementCondition',  {
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.a2p.info.settlement.term`).d('结算条件'),
                    }),
                  }],
                  initialValue: a2p?.settlementCondition
                })(<CusInput allowClear disabled={disabled}/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.a2p.info.settlement.account.email`).d('结算账号邮箱')}>
                {getFieldDecorator('settlementEmail',  {
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.a2p.info.settlement.account.email`).d('结算账号邮箱'),
                    }),
                  }],
                  initialValue: a2p?.settlementEmail
                })(<CusInput allowClear disabled={disabled}/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.a2p.info.payment.period`).d('缴费期限')}>
                {getFieldDecorator('paymentDeadline',  {
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.a2p.info.payment.period`).d('缴费期限'),
                    }),
                  }],
                  initialValue: a2p?.paymentDeadline
                })(<CusInput allowClear disabled={disabled}/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.a2p.info.sla`).d('SLA')}>
                {getFieldDecorator('sla', {
                  initialValue: a2p?.sla
                })(<CusInput allowClear disabled={disabled}/>)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <br/>
        <CusTable
          rowKey={rowKey}
          pagination={false}
          columns={contactTypeColumns}
          dataSource={contacts}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(contactTypeColumns) }}
        />
        <br/>
        <CusTable
          rowKey={rowKey}
          pagination={false}
          columns={accountColumns}
          dataSource={account}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(accountColumns) }}
        />
      </Fragment>
    )
  }
}
