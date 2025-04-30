import React, { Component } from 'react';
import { Form, Row, Col, Input } from 'hzero-ui';

import ValueList from 'components/ValueList';
import Lov from 'components/Lov';
import intl from 'utils/intl';
// import TemplateSelect from './TemplateSelect';
import formatterCollections from 'utils/intl/formatterCollections'; 

const LABEL_WRAPPER_1_3 = {
  labelCol: {
    span: 9,
  },
  wrapperCol: {
    span: 15,
  },
};

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
        <Form>
          <Row gutter={24}>
            <Col md={8} sm={24}>
              <Form.Item
                {...LABEL_WRAPPER_1_3}
                label={intl.get(`bid.bidcommon.view.title.purchaseschemeno`).d('采购方案编号')}
              >
                {getFieldDecorator('proCode', {
                  initialValue: proCode,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col md={8} sm={24}>
              <Form.Item
                {...LABEL_WRAPPER_1_3}
                label={intl.get(`bid.bidcommon.view.title.purchaseschemename`).d('采购方案名称')}
              >
                {getFieldDecorator('proName', {
                  initialValue: proName,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </>
    );
  }
}
