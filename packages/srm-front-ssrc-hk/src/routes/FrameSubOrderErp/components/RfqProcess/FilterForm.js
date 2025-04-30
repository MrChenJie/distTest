import React from 'react';
import { Form } from 'hzero-ui';
import Lov from 'components/Lov';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

export default class FilterForm extends React.Component {
  render() {
    const {
      form,
      onSearch = (e) => e,
    } = this.props;
    const { getFieldDecorator, resetFields } = form;
    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={8}>
              <FormItem
                label={intl.get(`${promptCode}.model.label.quotationNo`).d('Service Type')}
                {...formLayout}
              >
                {getFieldDecorator('priceEntryNum')(
                  <Lov />
                )}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                label={intl.get(`${promptCode}.model.label.quotationTitle`).d('供应商')}
                {...formLayout}
              >
                {getFieldDecorator('priceEntryDesc')(
                  <Lov
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24} className="search-btn-more" style={{ textAlign: 'right' }}>
              <Button data-code="reset" onClick={resetFields}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={onSearch}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    )
  }
}
