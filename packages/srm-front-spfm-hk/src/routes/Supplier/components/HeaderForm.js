import React, { PureComponent } from 'react';
import { Col, Row } from 'antd';
import { Form } from 'hzero-ui';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import formatterCollections from 'utils/intl/formatterCollections';

const prompt = 'spfmhk.supplier';
@Form.create()
@formatterCollections({ code: [prompt] })
export default class HeaderForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  componentDidMount() {
  }

  render() {
    const { form: {getFieldDecorator}, initialValues, disabled = false } = this.props;
    const gridSpan = {
      xs: 12,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12,
      xxl: 12
    };
    return (
      <div className="customize-form">
        <Form>
          <Row gutter={24}>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.field.application.num`).d('申请单号')}>
                {getFieldDecorator('applyNumber', {
                  initialValue: initialValues?.applyNumber
                })(<CusInput disabled/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.field.request.status`).d('申请状态')}>
                {getFieldDecorator('applyStatus', {
                  initialValue: initialValues?.applyStatus
                })(<CusSelect style={{ width: '100%' }} disabled lovCode="HKSP.APPLICATION_STATUS"/>)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.field.request.date`).d('申请日期')}>
                {getFieldDecorator('applyDate', {
                  initialValue: initialValues?.applyDate ? dayjs(initialValues?.applyDate) : undefined
                })(<CusDatePicker style={{ width: '100%' }} disabled/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.field.supplier.num`).d('供应商编号')}>
                {getFieldDecorator('supplierNumber', {
                  initialValue: initialValues?.supplierNumber
                })(<CusInput disabled/>)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.field.company.name.en`).d('公司名称（英文）')}>
                {getFieldDecorator('companyNameEn', {
                  initialValue: initialValues?.companyNameEn
                })(<CusInput disabled/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.field.company.name.cn`).d('公司名称（中文）')}>
                {getFieldDecorator('companyNameCh', {
                  initialValue: initialValues?.companyNameCh
                })(<CusInput disabled/>)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.view.table.applicant`).d('申请人')}>
                {getFieldDecorator('applyUser', {
                  initialValue: initialValues?.applyUser
                })(<CusInput disabled/>)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.field.change.reason`).d('变更原因')}>
                {getFieldDecorator('editReason', {
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.change.reason`).d('变更原因'),
                    }),
                  }],
                  initialValue: initialValues?.editReason
                })(<CusInput allowClear disabled={disabled}/>)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    )
  }
}
