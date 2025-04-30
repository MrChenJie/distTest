/*
 * @Author: 陆海涛 <haitao.lu02@hand-china.com>
 * @Date: 2024-09-24 
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import { Col, Form, Input } from 'antd';
import intl from 'utils/intl';
import { getLFormGridSpan } from '_cus_utils/utils';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import GenerateSearchFormGrid from '_cus_utils/generate/GenerateSearchFormGrid';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
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
                  label={intl.get(`spfmhk.trade.`).d('公司名称')}
                  name='actId'
                >
                  <Input
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.trade.`).d('合作方式')}
                  name='actId'
                >
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['HKTB.ACTIVITY_PROSTATUS']}
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.trade.`).d('邀请人')}
                  name='createrCode'
                >
                  <CusLov
                    code="HKTB.SQL.DEPUSER.LIST"
                    queryParams={{ tenantId }}
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.trade`).d('申请日期')}
                  name='quoteEndTimeStart'
                >
                  <CusDatePicker
                    format={DEFAULT_DATE_FORMAT}
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.trade`).d('合作伙伴类别')}
                  name='status'
                >
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['HKTB.ACTIVITY_PROSTATUS']}
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
