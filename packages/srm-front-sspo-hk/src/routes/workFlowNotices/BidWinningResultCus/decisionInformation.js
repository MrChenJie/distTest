/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-06-14 10:09:46
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Col, Input } from 'antd';
import {
  getDateFormat,
} from 'utils/utils';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import UploadFile from '@/routes/CusMeeting/UploadFile';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';

const FormItem = Form.Item;

const gridSpan = getDFormGridSpan();

export default class decisionInformation extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      form: { getFieldDecorator },
      poHeaderInfo,
      decisionType,
    } = this.props;
  
    return (
      <>
        <Form className="customize-form">
          <GenerateFormGrid isPackUp={false}>
            <Col {...gridSpan}>
              <FormItem
                label={intl.get(`bid.bidcommon.view.title.juecejiyaotype`).d('决策类型')}
              >
                {getFieldDecorator('decisionType', {
                  initialValue: poHeaderInfo.decisionType,
                })(
                  <CusSelect
                    allowClear
                    style={{ width: '100%' }}
                    options={decisionType}
                    disabled
                  />
                )}
              </FormItem>
            </Col>
            <Col {...gridSpan}>
              <FormItem
                label={intl.get(`bid.bidcommon.view.title.decisionmeetingTime`).d('决策会议日期')}
              >
                {getFieldDecorator('decisionMeetingDate', {
                  initialValue: poHeaderInfo.decisionMeetingDate && dayjs(poHeaderInfo.decisionMeetingDate, getDateFormat()),
                })(
                  <CusDatePicker
                    disabled
                    format={getDateFormat()}
                    style={{ width: '100%' }}
                  />
                )}
              </FormItem>
            </Col>
            {/* <Col {...gridSpan}>
              <FormItem
                label={intl.get(`bid.bidcommon.view.title.decisiondate`).d('决策会议')}
              >
                {getFieldDecorator('decisionDate', {
                  initialValue: poHeaderInfo.decisionDate,
                })(
                  <Input disabled />
                )}
              </FormItem>
            </Col> */}
            <Col {...gridSpan}>
              <FormItem
                label={intl.get(`bid.bidcommon.view.title.juecejiyaoinfo`).d('决策纪要')}
              >
                {getFieldDecorator('decisionFileUrls', {
                  initialValue: poHeaderInfo.decisionFileUrls,
                })(
                  <UploadFile
                    tableName="SPUC_PO_CON_ATTACH"
                    parentId={poHeaderInfo.decisionFileUrls}
                    val={poHeaderInfo.decisionFileUrls}
                    type={true}
                  />
                )}
              </FormItem>
            </Col>
          </GenerateFormGrid>
        </Form>
      </>
    );
  }
}
