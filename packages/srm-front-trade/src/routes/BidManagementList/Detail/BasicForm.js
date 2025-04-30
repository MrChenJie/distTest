/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-15 09:47:05
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import { Col, Input } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import moment from 'moment';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusInput from '_cus_components/CusInput';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import { getDFormGridSpan } from '_cus_utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import {
  getCurrentUser,
} from 'utils/utils';

const gridSpan = getDFormGridSpan();
const { realName } = getCurrentUser();

@Form.create()
export default class BasicForm extends React.PureComponent {
  constructor(props) {
    super(props);
    props?.onRef(this);
  }

  render() {
    const {
      form,
      headerInfo,
      idpValueMap,
    } = this.props;
    const { getFieldDecorator } = form;
    return (
      <div className="customize-form">
        <Form>
          <GenerateFormGrid isPackUp={true} defaultPackUp={false}>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.ActivityID`).d('活动ID')}
              >
                {getFieldDecorator('actId', {
                  initialValue: headerInfo?.actId,
                })(
                  <Input disabled />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.ActivityName`).d('活动名称')}
              >
                {getFieldDecorator('actName', {
                  initialValue: headerInfo?.actName,
                })(
                  <Input disabled />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.ActivityStartD`).d('活动开启时间')}
              >
                {getFieldDecorator('actStartTime', {
                  initialValue: headerInfo?.actStartTime ? dayjs(moment(headerInfo?.actStartTime).format(DEFAULT_DATETIME_FORMAT)) : '',
                })(
                  <CusDatePicker
                    showTime={{ format: DEFAULT_DATETIME_FORMAT }}
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.ActivityEndD`).d('活动结束时间')}
              >
                {getFieldDecorator('actEndTime', {
                  initialValue: headerInfo?.actEndTime ? dayjs(moment(headerInfo?.actEndTime).format(DEFAULT_DATETIME_FORMAT)) : '',
                })(
                  <CusDatePicker
                    showTime={{ format: DEFAULT_DATETIME_FORMAT }}
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.QuotatDeadl`).d('报价截止时间')}
              >
                {getFieldDecorator('quoteEndTime', {
                  initialValue: headerInfo?.quoteEndTime ? dayjs(moment(headerInfo?.quoteEndTime).format(DEFAULT_DATETIME_FORMAT)) : '',
                })(
                  <CusDatePicker
                    showTime={{ format: DEFAULT_DATETIME_FORMAT }}
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.BidAll`).d('是否全量商品出价')}
              >
                {getFieldDecorator('isFullQuote', {
                  initialValue: headerInfo?.isFullQuote,
                })(
                  <CusSelect
                    options={idpValueMap['HKTB.HEAD_BIDALL']}
                    lazyLoad={false}
                    allowClear
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.ActivityRule`).d('活动规则')}
              >
                {getFieldDecorator('actRule', {
                  initialValue: headerInfo?.actRule,
                })(
                  <CusInput.TextArea
                    rows={6}
                    autoSize={{ minRows: 6, maxRows: 6 }}
                    maxLength={500}
                    showCharacter
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.ActivityNote`).d('备注')}
              >
                {getFieldDecorator('actRemark', {
                  initialValue: headerInfo?.actRemark,
                })(
                  <CusInput.TextArea
                    rows={3}
                    autoSize={{ minRows: 3, maxRows: 3 }}
                    maxLength={500}
                    showCharacter
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.ActivityCreator`).d('活动创建人')}
              >
                {getFieldDecorator('createrName', {
                  initialValue: headerInfo?.createrName || realName,
                })(
                  <Input disabled />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.trade.field.ActivityStat`).d('活动状态')}
              >
                {getFieldDecorator('actStatus', {
                  initialValue: headerInfo?.actStatus,
                })(
                  <CusSelect
                    options={idpValueMap['HKTB.ACTIVITY_STATUS']}
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
          </GenerateFormGrid>
        </Form>
      </div>
    );
  }
}
