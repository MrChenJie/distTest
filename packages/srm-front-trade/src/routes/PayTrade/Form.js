/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-12 15:25:42
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import { Col, Form, Input } from 'antd';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import { getLFormGridSpan } from '_cus_utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import GenerateSearchFormGrid from '_cus_utils/generate/GenerateSearchFormGrid';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';

const gridSpan = getLFormGridSpan();

export default class FilterForm extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);

    this.state = {};
  }

  form = React.createRef();

  handleReset = () => {
    this.form.current?.resetFields();
  };

  render() {
    const { onSearch = (e) => e, idpValueMap } = this.props;

    return (
      <>
        <div className="customize-form">
          <Form ref={this.form}>
            <GenerateSearchFormGrid
              onQuery={onSearch}
              onReset={this.handleReset}
            >
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.trade.field.ActivityID`).d('活动ID')}
                  name='actId'
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.trade.field.ActivityName`).d('活动名称')}
                  name='actName'
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.trade.field.TradeName`).d('贸易商名称')}
                  name='refTradeName'
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.trade.field.ActivityAppStat`).d('付款状态')}
                  name='status'
                >
                  <CusSelect
                    options={idpValueMap['HKTB.PAYSTATUS']}
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.trade.field.QuotatDateStart`).d('报价日期从')}
                  name='payStartTime'
                >
                  <CusDatePicker
                    format={DEFAULT_DATE_FORMAT}
                    disabledDate={(currentDate) => {
                      return (
                        dayjs.isDayjs(this.form?.current?.getFieldValue('payEndTime')) &&
                        currentDate &&
                        currentDate.isAfter(this.form?.current?.getFieldValue('payEndTime'))
                      );
                    }}
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.trade.field.QuotatDateEnd`).d('报价日期至')}
                  name='payEndTime'
                >
                  <CusDatePicker
                    format={DEFAULT_DATE_FORMAT}
                    disabledDate={(currentDate) => {
                      return (
                        dayjs.isDayjs(this.form?.current?.getFieldValue('payStartTime')) &&
                        currentDate &&
                        currentDate.isBefore(
                          this.form?.current?.getFieldValue('payStartTime')
                        )
                      );
                    }}
                  />
                </Form.Item>
              </Col>
            </GenerateSearchFormGrid>
          </Form>
        </div>
      </>
    );
  }
}
