/**
 * @Description: 项目答疑-基本信息
 * @date 2022-04-24
 * @author <jie.chen06@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
 import React, { Component } from 'react';
 import { Form, Row, Col, Input, Spin } from 'hzero-ui';
 import intl from 'utils/intl';
 import styles from './index.less';
 import { FORM_COL_3_LAYOUT } from 'utils/constants';
 import formatterCollections from 'utils/intl/formatterCollections';
 
 const FormItem = Form.Item;
 const formlayout1 = {
  labelCol: { span: 2 },
  wrapperCol: { span: 22 },
};
const formlayout2 = {
 labelCol: { span: 6 },
 wrapperCol: { span: 18 },
};

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
      initLoading = false
    } = this.props;

    return (
      <div className={styles['spo-basic-style']}>
        <Spin spinning={initLoading}>
          <Form>
            <Row gutter={24}>
              <Col>
                <FormItem className={styles['labelStyle']}
                  {...formlayout1}
                  label={intl.get(`bid.bidcommon.view.title.purchaseschemename`).d('采购方案名称')}
              >
                  {getFieldDecorator('proName', {
                    initialValue: poHeaderInfo.proName,
                  })(<Input disabled style={{ width: '87.9vw'}} />)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                  label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
                  {...formlayout2}
                >
                  <Input value={poHeaderInfo.packageName} disabled />
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                  label={intl.get('bid.bidcommon.view.title.packageno').d('标包编号')}
                  {...formlayout2}
                >
                  <Input value={poHeaderInfo.packageNo} disabled />
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                  label={intl.get('bid.bidcommon.view.title.purchaseschemeno').d('采购方案编号')}
                  {...formlayout2}
                >
                  <Input value={poHeaderInfo.proCode} disabled />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Spin>
      </div>
    );
  }
}
 