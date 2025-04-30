import React, { PureComponent } from 'react';
import { Col, Row } from 'antd';
import { Form } from 'hzero-ui';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusLov from '_cus_components/CusLov';
import Checkbox from 'components/Checkbox';
import { getDateFormat } from 'utils/utils';
import intl from 'utils/intl';

const prompt = 'spfmhk.supplier';
@Form.create()
export default class BasicInfoForm extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    const { form: {getFieldDecorator} } = this.props;
    const gridSpan = {
      xs: 12,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12,
      xxl: 12
    };
    return (
      <Form className="customize-form">
        <Row>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.application.num`).d('申请单号')}>
              {getFieldDecorator('applicant')(<CusInput trimAll typeCase="lower" allowClear disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.request.status`).d('申请状态')}>
              {getFieldDecorator('applicant')(<CusSelect trimAll typeCase="lower" allowClear disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.request.date`).d('申请日期')}>
              {getFieldDecorator('applicant')(<CusInput trimAll typeCase="lower" allowClear disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.supplier.num`).d('供应商编号')}>
              {getFieldDecorator('applicant')(<CusLov trimAll typeCase="lower" allowClear disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.company.name.cn`).d('公司名称（中文）')}>
              {getFieldDecorator('applicant')(<CusInput trimAll typeCase="lower" allowClear disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.company.name.en`).d('公司名称（英文）')}>
              {getFieldDecorator('applicant')(<CusInput trimAll typeCase="lower" allowClear disabled/>)}
            </Form.Item>
          </Col>
          {/*<Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.basic.info.submit.date`).d('提交日期')}>
              {getFieldDecorator('applicant')(<CusDatePicker trimAll typeCase="lower" allowClear disabled/>)}
            </Form.Item>
          </Col>*/}
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.change.reason`).d('变更原因')}>
              {getFieldDecorator('applicant', {
                rules: [{
                  required: true
                }]
              })(<CusInput trimAll typeCase="lower" allowClear />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.applicant`).d('申请人')}>
              {getFieldDecorator('applicant')(<CusInput trimAll typeCase="lower" allowClear disabled/>)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    )
  }

}
