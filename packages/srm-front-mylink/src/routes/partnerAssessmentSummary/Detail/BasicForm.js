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
            <Col span={12}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.sumorder.no`).d('汇总单')}
                value={headerInfo?.evalGatherNo}
              />
            </Col>
            <Col span={12}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.review.year`).d('评估年度')}
                value={headerInfo?.evalYear}
              />
            </Col>
            <Col span={12}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.review.period`).d('评估周期')}
                value={headerInfo?.evalPeriodMeaning}
              />
            </Col>
            <Col span={12}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.sumorder.date`).d('汇总日期')}
                value={headerInfo?.evalDate}
              />
            </Col>
          </GenerateFormGrid>
        </Form>
      </>
    );
  }
}
