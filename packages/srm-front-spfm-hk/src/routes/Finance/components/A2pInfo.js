import React, { PureComponent, Fragment } from 'react';
import { Col, Row } from 'antd';
import { Form } from 'hzero-ui';
import { getLFormGridSpan } from 'srm-front-common/lib/utils/utils';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusLov from '_cus_components/CusLov';
import Checkbox from 'components/Checkbox';
import { getDateFormat } from 'utils/utils';
import intl from 'utils/intl';
import CusButton from 'srm-front-common/lib/components/CusButton';
import { Bind } from 'lodash-decorators';
import EditTable from '_cus_components/EditTable';

const prompt = 'spfmhk.supplier';
@Form.create()
export default class A2pInfo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      a2pDataSource: [],
      accountDataSource: [],
    }
  }

  componentDidMount() {
  }

  // 银行附件表格
  @Bind()
  getA2pColumns() {
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

  // 银行附件表格
  @Bind()
  getAccountColumns() {
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
    const { form: {getFieldDecorator} } = this.props;
    const { a2pDataSource, accountDataSource } = this.state;
    const gridSpan = {
      xs: 12,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12,
      xxl: 12
    };
    const a2pColumns = this.getA2pColumns();
    const accountColumns = this.getAccountColumns();
    return (
      <Fragment>
        <Form className="customize-form">
          <Row gutter={24}>
            <Col {...gridSpan}>
              <Form.Item label="供应商报价邮件">
                {getFieldDecorator('reason', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: '必填',
                      }),
                    }
                  ]
                })(<CusInput trimAll allowClear/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label="涨价通知期">
                {getFieldDecorator('reason', {
                  required: true
                })(<CusInput trimAll allowClear/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label="Credit Limit">
                {getFieldDecorator('reason')(<CusInput trimAll allowClear/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label="结算条件">
                {getFieldDecorator('reason', {
                  required: true
                })(<CusInput trimAll allowClear/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label="结算账号邮箱">
                {getFieldDecorator('reason', {
                  required: true
                })(<CusInput trimAll allowClear/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label="缴费期限">
                {getFieldDecorator('reason', {
                  required: true
                })(<CusInput trimAll allowClear/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label="SLA">
                {getFieldDecorator('sla')(<CusInput trimAll allowClear/>)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <div className="table-operator">
          <CusButton>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>
          <CusButton>{intl.get('hzero.common.button.edit').d('编辑')}</CusButton>
          <CusButton type="primary">{intl.get('hzero.common.button.add').d('新增')}</CusButton>
        </div>
        <EditTable
          bordered
          pagination={false}
          dataSource={a2pDataSource}
          columns={a2pColumns}
        />
        <EditTable
          bordered
          pagination={false}
          dataSource={accountDataSource}
          columns={accountColumns}
        />
      </Fragment>
    )
  }

}
