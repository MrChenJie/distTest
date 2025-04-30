import React from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Row, Col, Button, Input } from 'hzero-ui';
import intl from 'utils/intl';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({})
export default class Search extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const { form, handleSearch = (e) => e, prompt } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={24} style={{ marginBottom: '15px' }}>
          <Col span={24}>
            <Row>
              <Col span={12}>
                <FormItem
                  label={intl.get(`${prompt}.view.prepayRequestNum`).d('预付款申请编号')}
                  {...formLayout}
                >
                  {getFieldDecorator('requestNum')(
                    <Input />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label={intl
                    .get(`${prompt}.view.invoiceNum`)
                    .d('预付款发票号码')}
                  {...formLayout}
                >
                  {getFieldDecorator('invoiceNum')(
                    <Input />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <FormItem
                  label={intl.get(`${prompt}.view.circuitId`).d('客户电路编号')}
                  {...formLayout}
                >
                  {getFieldDecorator('circuitId')(<Input />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  label={intl.get(`${prompt}.view.poNumber`).d('采购订单编号')}
                  {...formLayout}
                >
                  {getFieldDecorator('poNumber')(<Input />)}
                </FormItem>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24} className="search-btn-more" style={{ textAlign: 'right' }}>
            <FormItem>
              <Button data-code="reset" onClick={this.handleReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button data-code="search" type="primary" htmlType="submit" onClick={handleSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
