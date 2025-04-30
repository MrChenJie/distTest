/*
 * @Author: 陆海涛 <haitao.lu02@hand-china.com>
 * @Date: 2024-09
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import { Col, Input, Checkbox } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import CusSelect from '_cus_components/CusSelect';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusInfoItem from '_cus_components/CusInfoItem';
import {
  getCurrentUser,
} from 'utils/utils';

const gridSpan = getDFormGridSpan();
const { realName, loginName } = getCurrentUser();
@Form.create({ fieldNameProp: null })

export default class BasicForm extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      readyOnly = false,
      dispatch,
      idpValueMap,
      headerInfo,
      PartnerInformationModal,
    } = this.props;

    const { partnerBase } = PartnerInformationModal;
    console.log('partnerBase', partnerBase);
    
    return (
      <>
        <Form className="customize-form">
          <GenerateFormGrid isPackUp={false}>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.review.num`).d('评审单号')}
                value={partnerBase?.revNum}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.initia.mode`).d('发起方式')}
                value={partnerBase?.revTypeMeaning}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.initiator`).d('发起人')}
                value={partnerBase?.revStartMan}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.initiate.appdate`).d('发起评审日期')}
                value={partnerBase?.beginRevDate}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.review.status`).d('评审状态')}
                value={partnerBase?.revStatusMeaning}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.parnercate`).d('合作伙伴类别')}
                value={partnerBase?.partnerCategoryMeaning}
              />
            </Col>
          </GenerateFormGrid>
        </Form>
      </>
    );
  }
}
