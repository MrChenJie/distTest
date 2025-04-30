/**
 * @Description: 项目答疑-轮次
 * @date 2022-04-24
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

 export default class biddingRound extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    const {
      form: { getFieldDecorator },
      poHeaderMilestonesInfo,
    } = this.props;

    return (
      <div className={styles['spo-basic-style']}>
        <Form>
          <Row gutter={24}>
            <Col span={8}>
              <FormItem className={styles['labelStyle']}
                {...formlayout}
                label={intl.get(`bid.bidcommon.view.title.round`).d('轮次')}
              >
                {getFieldDecorator('round', {
                  initialValue: poHeaderMilestonesInfo.round,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem className={styles['labelStyle']}
                {...formlayout}
                label={intl.get(`bid.bidcommon.view.title.leadtimeofqa`).d('答疑截止时间')}
              >
                {getFieldDecorator('milestoneEndTime', {
                  initialValue: poHeaderMilestonesInfo.milestoneEndTime,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem className={styles['labelStyle']}
                {...formlayout}
                label={intl.get(`bid.bidcommon.view.title.tendersubmissiontime`).d('递交投标时间')}
              >
                {getFieldDecorator('deliveryTime', {
                  initialValue: poHeaderMilestonesInfo.milestoneStartTime,
                })(<Input disabled />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
 }
 