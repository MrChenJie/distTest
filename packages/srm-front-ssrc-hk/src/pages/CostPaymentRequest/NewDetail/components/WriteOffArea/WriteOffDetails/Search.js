import React from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Row, Col } from 'hzero-ui';
import intl from 'utils/intl';
import CusInput from '_cus_components/CusInput';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class Search extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      isShowMore: false,
    };
  }

  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  handleShowMore() {
    const { isShowMore } = this.state;
    this.setState({
      isShowMore: !isShowMore,
    });
  }

  render() {
    const { form, handleSearch = (e) => e, prompt } = this.props;
    const { isShowMore } = this.state;
    const { getFieldDecorator } = form;

    return (
      <Form className="customize-form">
        <Row>
          <Col span={12}>
            <FormItem label={intl.get(`${prompt}.view.prepayRequestNum`).d('预付款申请编号')}>
              {getFieldDecorator('requestNum')(<CusInput />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={intl.get(`${prompt}.view.invoiceNum`).d('预付款发票号码')}>
              {getFieldDecorator('invoiceNum')(<CusInput />)}
            </FormItem>
          </Col>
          <div style={{ display: isShowMore ? 'block' : 'none' }}>
            <Col span={12}>
              <FormItem label={intl.get(`${prompt}.view.circuitId`).d('客户电路编号')}>
                {getFieldDecorator('circuitId')(<CusInput />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label={intl.get(`${prompt}.view.poNumber`).d('采购订单编号')}>
                {getFieldDecorator('poNumber')(<CusInput />)}
              </FormItem>
            </Col>
          </div>
          <Col span={12} style={{ float: 'right' }}>
            <CusQueryButtons
              onQuery={handleSearch}
              onReset={this.handleReset}
              onShowMore={this.handleShowMore}
              isShowMore={isShowMore}
            />
          </Col>
        </Row>
      </Form>
    );
  }
}
