import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Form, DatePicker, Row, Col, Modal } from 'hzero-ui';
import moment from 'moment';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@Form.create({})
export default class ServiceDate extends React.Component {
  constructor(props) {
    super(props);
  }

  @Bind()
  handleOk() {
    const { onOk = e => e, form } = this.props;
    const values = form.getFieldsValue();
    const { serviceStartDate, serviceEndDate } = values;
    onOk({
      ...values,
      serviceStartDate: moment.isMoment(serviceStartDate) ? serviceStartDate.format("YYYY-MM-DD 00:00:00") : undefined,
      serviceEndDate: moment.isMoment(serviceEndDate) ? serviceEndDate.format("YYYY-MM-DD 23:59:59") : undefined,
    });
  }

  render() {
    const {
      form,
      prompt,
      visible = false,
      confirmLoading = false,
      onCancel = e => e,
    } = this.props;
    const { getFieldDecorator = (e) => e } = form;

    return (
      <Modal
        title={intl.get('spcm.costPayment.view.serviceDate').d('服务日期')}
        visible={visible}
        onCancel={onCancel}
        onOk={this.handleOk}
        width={400}
        confirmLoading={confirmLoading}
        destroyOnClose
      >
        <Form layout="inline" className="more-fields-search-form">
          <Row gutter={24}>
            <Col span={24}>
              <FormItem
                label={intl.get(`${prompt}.view.serviceDate.serviceStartDate`).d('服务开始日期')}
                {...formLayout}
              >
                {getFieldDecorator('serviceStartDate')(
                  <DatePicker
                    disabledDate={(currentDate) => {
                      return (
                        moment.isMoment(form.getFieldValue('serviceEndDate')) &&
                        currentDate &&
                        currentDate.isAfter(form.getFieldValue('serviceEndDate'))
                      );
                    }}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <FormItem
                label={intl.get(`${prompt}.view.serviceDate.serviceEndDate`).d('服务结束日期')}
                {...formLayout}
              >
                {getFieldDecorator('serviceEndDate')(
                  <DatePicker
                    disabledDate={(currentDate) => {
                      return (
                        moment.isMoment(form.getFieldValue('serviceStartDate')) &&
                        currentDate &&
                        currentDate.isBefore(form.getFieldValue('serviceStartDate'))
                      );
                    }}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}
