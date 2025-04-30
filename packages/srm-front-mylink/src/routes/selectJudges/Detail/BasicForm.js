/*
 * @Author: 陆海涛 <haitao.lu02@hand-china.com>
 * @Date: 2024-09
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React, { Component } from 'react';
import { Col, Input } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import { getDFormGridSpan } from '_cus_utils/utils';

const gridSpan = getDFormGridSpan();

@Form.create({ fieldNameProp: null })

export default class BasicForm extends Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
  }

  render() {
    const {
      form,
      headerInfo,
    } = this.props;

    console.log('headerInfo', headerInfo);
    

    const { getFieldDecorator } = form;

    return (
      <Form className="customize-form">
        <GenerateFormGrid isPackUp={false}>
          <Col span={12}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.parnercate`).d('合作伙伴类别')}
            >
              {getFieldDecorator('partnerCategoryMeaning', {
                initialValue: headerInfo?.partnerCategoryMeaning,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={intl.get(`spfmhk.mylink.field.title.user`).d('业务员')}
            >
              {getFieldDecorator('revStartMan', {
                initialValue: headerInfo?.revStartMan,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
        </GenerateFormGrid>
      </Form>
    );
  }
}
