import React, { PureComponent } from 'react';
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

const prompt = 'spfmhk.supplier';
@Form.create()
export default class AccountsPayableBasicForm extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    const { form: {getFieldDecorator} } = this.props;
    const gridSpan = getLFormGridSpan();
    return (
      <Form className="customize-form">
        <Row>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.basic.info.supplier.num`).d('供应商编号')}>
              {getFieldDecorator('applicant')(<CusLov trimAll typeCase="lower" allowClear disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.basic.info.company.name.en`).d('公司名称（英文）')}>
              {getFieldDecorator('applicant')(<CusInput trimAll typeCase="lower" allowClear disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.basic.info.company.name.cn`).d('公司名称（中文）')}>
              {getFieldDecorator('applicant')(<CusInput trimAll typeCase="lower" allowClear disabled/>)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    )
  }

}
