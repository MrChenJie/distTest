/*
 * @Description: 查看产品类型 - 弹框
 * @LastEditors: 何智鹏 <he.zhipeng@hand-china.com>
 * @Date: 2023-08-24 11:47:57
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { Component } from 'react';
import { Row, Col, Checkbox } from 'hzero-ui';
import { connect } from 'dva';

@connect(({ resaleRequestDetail = {} }) => ({ resaleRequestDetail }))
export default class index extends Component {
  render() {
    const { headerData, productTypeCodes } = this.props.resaleRequestDetail;
    const { productType } = headerData?.costPaymentRequest || {};
    const defaultProductValue = typeof productType === 'string' ? productType.split(',') : [];

    return (
      <Checkbox.Group value={defaultProductValue}>
        <Row gutter={48}>
          {productTypeCodes.map((item) => (
            <Col span={8} key={item.value} style={{ paddingTop: '4px', paddingBottom: '4px' }}>
              <Checkbox value={item.value}>
                <span title={item.label}>{item.label}</span>
              </Checkbox>
            </Col>
          ))}
        </Row>
      </Checkbox.Group>
    );
  }
}
