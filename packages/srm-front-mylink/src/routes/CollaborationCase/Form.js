/*
 * @Author: 陆海涛 haitao.lu02@hand-china.com
 * @Date: 2024-09
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import { Col, Form, Input, InputNumber } from 'antd';
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
    const { onSearch = (e) => e, idpValueMap, match } = this.props;

    return (
      <>
        <div className="customize-form">
          <Form ref={this.form}>
            <GenerateSearchFormGrid
              onQuery={onSearch}
              onReset={this.handleReset}
            >
              {/* <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.cooperate.modecode`).d('合作模式编码')}
                  name='applicationNo'
                >
                  <Input
                  />
                </Form.Item>
              </Col> */}
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.cooperate.case.title`).d('案例标题')}
                  name='caseTitle'
                >
                  <Input
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.cooperate.mode`).d('合作方式')}
                  name='cooperationMode'
                >
                  <Input
                  />
                </Form.Item>
              </Col>
              {/* <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.sort`).d('排序')}
                  name='sort'
                >
                  <InputNumber min={0}
                  />
                </Form.Item>
              </Col> */}
              {match?.params?.type =='create' &&<Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.effective.status`).d('生效状态')}
                  name='effectiveOrNot'
                >
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['HKSM.EFFECTIVE.STATUS']}
                  />
                </Form.Item>
              </Col>}
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.applicant`).d('创建人')}
                  name='applicant'
                >
                  <CusLov
                    code="HKSM.CREATOR"
                    lovOptions={{ displayField: 'realName', valueField: 'userid' }}
                    queryParams={{ tenantId }}
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.apply.status`).d('申请状态')}
                  name='applicationStatus'
                >
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['HKSM.APPLICATION.STATUS']}
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.apply.date`).d('创建日期')}
                  name='applicantDate'
                >
                  <CusDatePicker.RangePicker
                    format={DEFAULT_DATE_FORMAT}
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
