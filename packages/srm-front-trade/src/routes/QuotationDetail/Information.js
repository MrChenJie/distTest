/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-26 17:13:28
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import { Form } from 'hzero-ui';
import { Col } from 'antd';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import CusDatePicker from '_cus_components/CusDatePicker';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import intl from 'utils/intl';

@Form.create()
export default class FilterForm extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this)
    this.state = {};
  }

  render() {
    const { form = {}, quotationDetailModal, idpValueMap, dispatch } = this.props;
    const { AssessFormSource = {} } = quotationDetailModal;

    const { getFieldDecorator } = form;
    const gridSpan = getDFormGridSpan();
    return (
      <Form className="customize-form">
        <GenerateFormGrid isPackUp={false}>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`spfmhk.trade.field.ActivityID`).d('活动ID')}
            >
              {getFieldDecorator('actId', {
                initialValue: AssessFormSource.actId,
              })(
                <CusInput disabled />
              )}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`spfmhk.trade.field.ActivityName`).d('活动名称')} >
              {getFieldDecorator('actName', {
                initialValue: AssessFormSource.actName,
              })(
                <CusInput disabled />
              )}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`spfmhk.trade.field.ActivityStat`).d('活动状态')} >
              {getFieldDecorator('actStatusMeaning', {
                initialValue: AssessFormSource.actStatusMeaning,
              })(
                <CusInput disabled />
              )}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`spfmhk.trade.field.failBid`).d('活动流标')} >
              {getFieldDecorator('isFailWin', {
                initialValue: AssessFormSource?.isFailWin || 'N',
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('spfmhk.trade.field.failBid').d('活动流标'),
                    }),
                  },
                ],
              })(
                <CusSelect
                  allowClear
                  disabled={AssessFormSource?.winStatus !== 'Draft'}
                  style={{ width: '100%' }}
                  options={idpValueMap['HKTB.ACTIVITY_YN']}
                  onChange={(val) => {
                    dispatch({
                      type: 'quotationDetailModal/updateState',
                      payload: {
                        isFailWinValue: val
                      }
                    })
                  }}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`spfmhk.trade.field.BidResult.Ap`).d('结果审批')} >
              {getFieldDecorator('winStatusMeaning', {
                initialValue: AssessFormSource?.winStatusMeaning,
              })(
                <CusInput disabled/>
              )}
            </Form.Item>
          </Col>
        </GenerateFormGrid>
      </Form>
    );
  }
}