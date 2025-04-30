import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import { tableScrollWidth } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import { Bind } from 'lodash-decorators';
import { getLFormGridSpan } from 'srm-front-common/lib/utils/utils';
import CusInput from 'srm-front-common/lib/components/CusInput';
import { Col, Row } from 'antd';

const prompt = 'spfmhk.supplier';

@Form.create()
export default class A2PTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
    }
  }

  componentDidMount() {
  }

  // 联系人表格
  @Bind()
  contactTypeColumns() {
    return [
      {
        title: intl.get(`${prompt}.a2p.supplier.contact.type`).d('A2P业务联系人类型')
      },
      {
        title: intl.get(`${prompt}.a2p.contact.person.name`).d('A2P业务联系人姓名')
      },
      {
        title: intl.get(`${prompt}.a2p.contact.mailbox`).d('A2P业务联系人邮箱')
      },
      {
        title: intl.get(`${prompt}.a2p.contact.position`).d('A2P业务联系人职位')
      },
      {
        title: intl.get(`${prompt}.a2p.contact.phone.number`).d('A2P业务联系人电话')
      },
    ]
  }
  // 账号表格
  @Bind()
  accountColumns() {
    return [
      {
        title: intl.get(`${prompt}.a2p.access.account`).d('接入账号'),
      },
      {
        title: intl.get(`${prompt}.a2p.access.method`).d('接入方式'),
      },
      {
        title: intl.get(`${prompt}.a2p.protocol`).d('Protocol'),
      },
      {
        title: intl.get(`${prompt}.a2p.settlement.mode`).d('结算模式'),
      },
      {
        title: intl.get(`${prompt}.a2p.tps`).d('TPS'),
      },
      {
        title: intl.get(`${prompt}.a2p.ip`).d('IP'),
      },
      {
        title: intl.get(`${prompt}.a2p.session`).d('Session'),
      },
      {
        title: intl.get(`${prompt}.a2p.special.configuration.instructions`).d('特殊配置说明'),
      },
    ]
  }

  render() {
    const { rowSelection, onChange, form: { getFieldDecorator } } = this.props;
    const { dataSource } = this.state;
    const contactTypeColumns = this.contactTypeColumns();
    const accountColumns = this.accountColumns();
    const gridSpan = getLFormGridSpan();
    return (
      <Fragment>
        <Form className="customize-form">
          <Row gutter={24}>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.a2p.info.quotation.mail`).d('供应商报价邮件')}>
                {getFieldDecorator('supplier')(<CusInput style={{width: '100%'}} disabled/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.a2p.info.advance.in.price`).d('涨价通知期')}>
                {getFieldDecorator('supplier')(<CusInput style={{width: '100%'}} disabled/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.a2p.info.credit.limit`).d('Credit Limit')}>
                {getFieldDecorator('supplier')(<CusInput style={{width: '100%'}} disabled/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.a2p.info.settlement.term`).d('结算条件')}>
                {getFieldDecorator('supplier')(<CusInput style={{width: '100%'}} disabled/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.a2p.info.settlement.account.email`).d('结算账户邮箱')}>
                {getFieldDecorator('supplier')(<CusInput style={{width: '100%'}} disabled/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.a2p.info.payment.period`).d('缴费期限')}>
                {getFieldDecorator('supplier')(<CusInput style={{width: '100%'}} disabled/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.a2p.info.sla`).d('SLA')}>
                {getFieldDecorator('supplier')(<CusInput style={{width: '100%'}} disabled/>)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <CusTable
          rowKey="resultId"
          pagination={false}
          columns={accountColumns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(accountColumns) }}
          onChange={onChange}
        />
        <CusTable
          rowKey="resultId"
          pagination={false}
          columns={contactTypeColumns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(contactTypeColumns) }}
          onChange={onChange}
        />
      </Fragment>
    )
  }
}
