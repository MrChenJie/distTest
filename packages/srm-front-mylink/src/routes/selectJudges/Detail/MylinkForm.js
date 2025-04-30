/*
 * @Author: 陆海涛 <haitao.lu02@hand-china.com>
 * @Date: 2024-09
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import { Col, Input, Form, Checkbox } from 'antd';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import CusSelect from '_cus_components/CusSelect';
import { getLFormGridSpan } from '_cus_utils/utils';
import {
  getCurrentUser,
} from 'utils/utils';

const prompt = 'spub.interfaceErrors';
const gridSpan = getLFormGridSpan();
const { realName, loginName } = getCurrentUser();

export default class MylinkForm extends React.PureComponent {

  form = React.createRef();

  constructor(props) {
    super(props);
    props?.onRef(this);
  }

  render() {
    const {
      readyOnly = false,
      dispatch,
      idpValueMap,
      headerInfo,
      PartnerInformationModal,
    } = this.props;

    const { productDetailSource } = PartnerInformationModal;
    return (
      <div className="customize-form">
        <Col {...gridSpan}>
          <Form.Item
            label={intl.get(`spfmhk.trade`).d('背景是否良好')}
            name='actId'
          >
            <CusSelect disabled />
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item
            label={intl.get(`spfmhk.trade`).d('产品是否受欢迎')}
            name='statusMeaning'
          >
            <CusSelect disabled />
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item
            label={intl.get(`spfmhk.trade`).d('商户业务')}
            name='actName'
          >
            <CusSelect disabled />
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item
            label={intl.get(`spfmhk.trade`).d('优惠有竞争性')}
            name='actStatus'
          >
            <CusSelect disabled />
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item
            label={intl.get(`spfmhk.trade`).d('优惠是否独家')}
            name='isFullQuote'
          >
            <CusSelect disabled />
          </Form.Item>
        </Col>
        <Col {...gridSpan}>
          <Form.Item
            label={intl.get(`spfmhk.trade`).d('是否优惠力度更大')}
            name='isFullQuote'
          >
            <CusSelect disabled />
          </Form.Item>
        </Col>
      </div>
    );
  }
}
