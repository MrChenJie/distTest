import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import CusSelect from '_cus_components/CusSelect';
import { Bind } from 'lodash-decorators';
import CusInput from 'srm-front-common/lib/components/CusInput';
import { Col, Row } from 'antd';

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
    const { form } = this.props;
    return [
      {
        title: intl.get(`${prompt}.field.a2p.supplier.contact.type`).d('A2P业务联系人类型'),
        dataIndex: 'type',
        width: 200,
        render: (_, record) => {
          const { getFieldDecorator } = form;
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
        render: (_, record) => {
          const { getFieldDecorator } = form;
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
        render: (_, record) => {
          const { getFieldDecorator } = form;
          return (
            <Form.Item>
              {getFieldDecorator(`email${record.id}`, {
                initialValue: record.email
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
        render: (_, record) => {
          const { getFieldDecorator } = form;
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
        render: (_, record) => {
          const { getFieldDecorator } = form;
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
    const { form } = this.props;
    return [
      {
        title: intl.get(`${prompt}.field.a2p.access.account`).d('接入账号'),
        dataIndex: 'account',
        width: 200,
        render: (_, record) => {
          const { getFieldDecorator } = form;
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
        render: (_, record) => {
          const { getFieldDecorator } = form;
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
        render: (_, record) => {
          const { getFieldDecorator } = form;
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
        render: (_, record) => {
          const { getFieldDecorator } = form;
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
        render: (_, record) => {
          const { getFieldDecorator } = form;
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
        render: (_, record) => {
          const { getFieldDecorator } = form;
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
        render: (_, record) => {
          const { getFieldDecorator } = form;
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
        render: (_, record) => {
          const { getFieldDecorator } = form;
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
    const { form: { getFieldDecorator }, data, disabled = false } = this.props;
    const { a2p, account = {}, contacts = {} }  = data;
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

        </Form>
        <br/>
        <CusTable
          rowKey={contacts.rowKey}
          pagination={false}
          columns={contactTypeColumns}
          dataSource={contacts.dataSource}
          rowSelection={contacts.rowSelection}
          scroll={{ x: tableScrollWidth(contactTypeColumns) }}
        />
        <br/>
        <CusTable
          rowKey={account.rowKey}
          pagination={false}
          columns={accountColumns}
          dataSource={account.dataSource}
          rowSelection={account.rowSelection}
          scroll={{ x: tableScrollWidth(accountColumns) }}
        />
      </Fragment>
    )
  }
}
