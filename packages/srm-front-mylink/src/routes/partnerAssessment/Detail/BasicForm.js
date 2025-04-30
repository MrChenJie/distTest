/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-15 09:47:05
 * Copyright (c) 2024, All Rights Reserved.
 */
import React from 'react';
import { Col } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import CusInfoItem from '_cus_components/CusInfoItem';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import { getDFormGridSpan } from '_cus_utils/utils';

const gridSpan = getDFormGridSpan();

@Form.create()
export default class BasicForm extends React.PureComponent {
  constructor(props) {
    super(props);
    props?.onRef(this);
  }

  render() {
    const {
      headerInfo,
    } = this.props;

    return (
      <>
        <Form className="customize-form">
          <GenerateFormGrid isPackUp={false}>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.filed.review.no`).d('评估单号')}
                value={headerInfo?.evalNo}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.review.year`).d('评估年度')}
                value={headerInfo?.evalYear}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.review.period`).d('评估周期')}
                value={headerInfo?.evalPeriodMeaning}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.cooperate.mode`).d('合作模式')}
                value={headerInfo?.partnerMode}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.evaluate.status`).d('评估状态')}
                value={headerInfo?.evalStatusMeaning}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.review.date`).d('评估日期')}
                value={headerInfo?.evalDate}
              />
            </Col>
          </GenerateFormGrid>
        </Form>
      </>
    );
  }
}
