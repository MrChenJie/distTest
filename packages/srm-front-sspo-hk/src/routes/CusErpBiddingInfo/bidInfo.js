import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Row, Col } from 'antd';
import CusInput from '_cus_components/CusInput';

import intl from 'utils/intl';
// import TemplateSelect from './TemplateSelect';
import formatterCollections from 'utils/intl/formatterCollections'; 


@formatterCollections({
    code: [
      'bid.bidcommon',
    ],
  })

export default class BidInfo extends Component {
  render() {
    const {
      form = {},
      proCode,
      proName,
    } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    return (
      <>
        <Form className="customize-form">
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label={intl.get(`bid.bidcommon.view.title.purchaseschemeno`).d('采购方案编号')}
              >
                {getFieldDecorator('proCode', {
                  initialValue: proCode,
                })(<CusInput disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get(`bid.bidcommon.view.title.purchaseschemename`).d('采购方案名称')}
              >
                {getFieldDecorator('proName', {
                  initialValue: proName,
                })(<CusInput disabled />)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </>
    );
  }
}
