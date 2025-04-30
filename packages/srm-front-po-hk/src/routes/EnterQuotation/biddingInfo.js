/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-08-23 18:09:28
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import { Col } from 'antd';
import { Form } from 'hzero-ui';
import { connect } from 'dva';
import intl from 'utils/intl';
import {
  getCurrentUser,
} from 'utils/utils';
import CusInfoItem from '_cus_components/CusInfoItem';
import CusInput from '_cus_components/CusInput';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import { getDFormGridSpan } from '_cus_utils/utils';

const promptCode = 'HKPC.commom';
const gridSpan = getDFormGridSpan();
const { realName } = getCurrentUser();

export default class BiddingInfo extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  render() {
    const { enterQuotationModel, form } = this.props;
    const { bidRoundInfo, bakup } = enterQuotationModel;
    const { getFieldDecorator } = form;

    return (
      <div className="customize-form">
        <Form ref={this.form}>
          <GenerateFormGrid isPackUp={false} defaultPackUp={false}>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`${promptCode}.view.title.Round`).d('轮次')}
                value={bidRoundInfo?.rounds}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`${promptCode}.view.title.StageDealine`).d('本阶段截止时间')}
                value={bidRoundInfo?.deadline}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`${promptCode}.view.title.StageStarttime`).d('本阶段开始时间')}
                value={bidRoundInfo?.startTime}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`${promptCode}.view.title.Inputer`).d('填写人')}
                value={realName}
              />
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.Remark`).d('备注')}
              >
                {getFieldDecorator('bakup', {
                  initialValue: bakup,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.Remark`).d('备注'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    style={{height: 'auto'}}
                    showCharacter
                    rows={3}
                    autosize={{ minRows: 3, maxRows: 3 }}
                    maxLength={500}
                  />
                )}
              </Form.Item>
            </Col>
          </GenerateFormGrid>
        </Form>
      </div>
    )
  }
}
