/**
 * @Description: 基本信息
 * @date 2022-05-24
 * @author <jie.chen06@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
 import React, { Component } from 'react';
 import { Form } from 'hzero-ui';
 import { Row, Col, Input } from 'antd';
 import intl from 'utils/intl';
 import formatterCollections from 'utils/intl/formatterCollections';
 import { getDFormGridSpan } from '_cus_utils/utils';
 import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
 
 const FormItem = Form.Item;


 const gridSpan = getDFormGridSpan();

@formatterCollections({
  code: ['bid.bidcommon'],
})

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

    return (
      <>
        <Form className="customize-form">
          <Row>
            <GenerateFormGrid isPackUp={false}>
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
                <Form.Item
                  label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
                >
                  <Input value={poHeaderInfo.packageName} disabled />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get('bid.bidcommon.view.title.packageno').d('标包编号')}
                >
                  <Input value={poHeaderInfo.packageNo} disabled />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get('bid.bidcommon.view.title.purchaseschemeno').d('采购方案编号')}
                >
                  <Input value={poHeaderInfo.proCode} disabled />
                </Form.Item>
              </Col>
            </GenerateFormGrid>
          </Row>
        </Form>
      </>
    );
  }
} 