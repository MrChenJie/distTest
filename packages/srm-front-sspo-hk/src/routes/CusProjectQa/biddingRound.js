/**
 * @Description: 项目答疑-轮次
 * @date 2022-04-24
 * @author <jie.chen06@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
 import React, { Component } from 'react';
 import { Form } from 'hzero-ui';
 import { Row, Col, Input } from 'antd';
 import intl from 'utils/intl';
 import dayjs from 'dayjs';
 import { getDateTimeFormat } from 'utils/utils';
 import CusDatePicker from '_cus_components/CusDatePicker';
 import { Bind } from 'lodash-decorators';
 import { largeScreenWidth } from '_cus_utils/constants';
 import CusInput from '_cus_components/CusInput';

 const FormItem = Form.Item;

 export default class biddingRound extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screenWidth: window.innerWidth > largeScreenWidth,
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  @Bind()
  handleResize() {
    this.setState({
      screenWidth: window.innerWidth > largeScreenWidth
    })
  }

  render() {
    const {
      form: { getFieldDecorator },
      poHeaderMilestonesInfo,
    } = this.props;

    const { screenWidth } = this.state;

    return (
      <>
        <Form className="customize-form">
          <Row>
            <Col span={screenWidth ? 8 : 24}>
              <FormItem
                label={intl.get(`bid.bidcommon.view.title.round`).d('轮次')}
              >
                {getFieldDecorator('round', {
                  initialValue: poHeaderMilestonesInfo.round,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={screenWidth ? 8 : 12}>
              <FormItem
                label={intl.get(`bid.bidcommon.view.title.tendersubmissiontimeNew`).d('本阶段开始时间')}
              >
                {getFieldDecorator('deliveryTime', {
                  initialValue: dayjs(poHeaderMilestonesInfo.milestoneStartTime, getDateTimeFormat()),
                })(
                  <CusDatePicker
                    format={getDateTimeFormat()}
                    disabled
                  />)}
              </FormItem>
            </Col>
            <Col span={screenWidth ? 8 : 12}>
              <FormItem
                label={intl.get(`bid.bidcommon.view.title.leadtimeofqaNew`).d('本阶段截止时间')}
              >
                {getFieldDecorator('milestoneEndTime', {
                  initialValue: dayjs(poHeaderMilestonesInfo.milestoneEndTime, getDateTimeFormat()),
                })(
                  <CusDatePicker
                    format={getDateTimeFormat()}
                    disabled
                 />)}
              </FormItem>
            </Col>
            <Col span={24}>
              <FormItem
                label={intl.get(`HKPC.commom.view.title.Remark`).d('备注')}
              >
                {getFieldDecorator('nextRoundReason', {
                  initialValue: poHeaderMilestonesInfo.nextRoundReason,
                })(
                  <CusInput.TextArea
                    rows={2}
                    autoSize={{ minRows: 2, maxRows: 2 }}
                    disabled
                  />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </>
    );
  }
 }
 