/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-08-23 16:56:45
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import { Col } from 'antd';
import { Form } from 'hzero-ui';
import { connect } from 'dva';
import intl from 'utils/intl';
import CusInfoItem from '_cus_components/CusInfoItem';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import { getDFormGridSpan } from '_cus_utils/utils';

const promptCode = 'HKPC.commom';
const gridSpan = getDFormGridSpan();

export default class HeaderInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { enterQuotationModel } = this.props;
    const { headerInfo } = enterQuotationModel;

    return (
      <div className="customize-form">
        <Form>
          <GenerateFormGrid isPackUp={false} defaultPackUp={false}>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`${promptCode}.view.title.projectname`).d('项目名称')}
                value={headerInfo?.projectName}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`${promptCode}.view.title.CompanyName`).d('公司名称')}
                value={headerInfo?.companyName}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`${promptCode}.view.title.Contacty`).d('应答联系人')}
                value={headerInfo?.contact}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`${promptCode}.view.title.applicantremarksportal`).d('需求部门备注')}
                value={headerInfo?.prBakup}
              />
            </Col>
          </GenerateFormGrid>
        </Form>
      </div>
    )
  }
}
