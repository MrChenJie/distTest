/**
 * @Description: 基本信息
 * @date 2022-05-24
 * @author <jie.chen06@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
 import React, { Component } from 'react';
 import { Form, Row, Col, Input } from 'hzero-ui';
 import intl from 'utils/intl';
 import styles from './index.less';
 import formatterCollections from 'utils/intl/formatterCollections';
 
 const FormItem = Form.Item;
const formlayout = {
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
    } = this.props;

    return (
      <div className={styles['spo-basic-style']}>
        <Form>
          <Row>
            <Col span={24}>
              <FormItem className={styles['labelStyle']}
                {...formlayout}
                label={intl.get(`bid.bidcommon.view.title.purchaseschemename`).d('采购方案名称')}
              >
                {getFieldDecorator('proName', {
                  initialValue: poHeaderInfo.proName,
                })(<Input style={{ width: '88vw' }} disabled />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
                {...formlayout}
              >
                <Input value={poHeaderInfo.packageName} disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                label={intl.get('bid.bidcommon.view.title.packageno').d('标包编号')}
                {...formlayout}
              >
                <Input value={poHeaderInfo.packageNo} disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item style={{ display: 'flex' }} className={styles['labelStyle']}
                label={intl.get('bid.bidcommon.view.title.purchaseschemeno').d('采购方案编号')}
                {...formlayout}
              >
            <Input value={poHeaderInfo.proCode} disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
} 