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
                  label={intl.get(`spfmhk.mylink.field.companyName`).d('公司名称')}
                  name='companyName'
                >
                  <Input
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.apply.num`).d('申请单号')}
                  name='applyNum'
                >
                  <Input
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.apply.status`).d('申请状态')}
                  name='applyStatus'
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
                  label={intl.get(`spfmhk.mylink.field.cooperate.mode`).d('合作模式')}
                  name='partnerModeId'
                >
                  <CusLov
                    code="LINK.ALL_PART_MODE"
                    queryParams={{ tenantId }}
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.company.productSer`).d('产品/服务')}
                  name='product'
                >
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['HKSM.PRODCUT_SERVICE']}
                  />
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.title.user`).d('业务员')}
                  name='applyMan'
                >
                  <CusLov
                    code="LINK.BUSINESS_MAN"
                    queryParams={{ tenantId }}
                  />
                </Form.Item>
              </Col>
              
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.application.date`).d('申请日期')}
                  name='applyDate'
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
