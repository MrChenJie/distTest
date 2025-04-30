/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2025-01-10 14:50:23
 * Copyright (c) 2025, All Rights Reserved. 
 */
import React from 'react';
import { Col, Form, Input } from 'antd';
import intl from 'utils/intl';
import { getLFormGridSpan } from '_cus_utils/utils';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import GenerateSearchFormGrid from '_cus_utils/generate/GenerateSearchFormGrid';
import CusDatePicker from '_cus_components/CusDatePicker';

const gridSpan = getLFormGridSpan();
const tenantId = getCurrentOrganizationId();

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
    const { onSearch = (e) => e } = this.props;

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
                  label={intl.get(`hzero.common.title.companyname`).d('公司名称')}
                  name='companyName'
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`hzero.common.title.submit.date`).d('提交日期')}
                  name='submitDate'
                >
                  <CusDatePicker.RangePicker
                    format={getDateFormat()}
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
