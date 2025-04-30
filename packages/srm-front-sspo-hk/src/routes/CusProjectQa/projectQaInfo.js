/**
 * @Description: 项目答疑-基本信息
 * @date 2022-04-24
 * @author <jie.chen06@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
 import React, { Component } from 'react';
 import { Form } from 'hzero-ui';
 import { Row, Col, Input } from 'antd';
 import intl from 'utils/intl';
 import { getDFormGridSpan } from '_cus_utils/utils';
 
 const FormItem = Form.Item;

export default class projectQaInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    const {
      form: { getFieldDecorator },
      poHeaderInfo,
    } = this.props;

    const gridSpan = getDFormGridSpan();

    return (
      <>
        <Form className="customize-form">
          <Row>
            <Col {...gridSpan}>
              <FormItem
                label={intl.get(`bid.bidcommon.view.title.purchaseschemename`).d('采购方案名称')}
              >
                {getFieldDecorator('proName', {
                  initialValue: poHeaderInfo.proName,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col {...gridSpan}>
              <FormItem
                label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
              >
                {getFieldDecorator('packageName', {
                  initialValue: poHeaderInfo.packageName,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col {...gridSpan}>
              <FormItem
                label={intl.get('bid.bidcommon.view.title.packageno').d('标包编号')}
              >
                {getFieldDecorator('packageNo', {
                  initialValue: poHeaderInfo.packageNo,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col {...gridSpan}>
              <FormItem
                label={intl.get('bid.bidcommon.view.title.purchaseschemeno').d('采购方案编号')}
              >
                {getFieldDecorator('proCode', {
                  initialValue: poHeaderInfo.proCode,
                })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </>
    );
  }
}
 