/*
 * @Author: 陆海涛 <haitao.lu02@hand-china.com>
 * @Date: 2024-09
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import { Col, InputNumber } from 'antd';
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

export default class ScoreForm extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      readyOnly = false,
      dispatch,
      idpValueMap,
      headerInfo,
      cooperationCategoryModal,
    } = this.props;

    const { partnerSupplement } = cooperationCategoryModal;
    return (
      <>
        <Form className="customize-form">
          <GenerateFormGrid isPackUp={false}>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.average.merchant.strength`).d('商户实力平均分')}
                value={partnerSupplement?.merchantAverageScore}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.average.commodity.value`).d('商品价值平均分')}
                value={partnerSupplement?.commodityAverageScore}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.average.service.experience`).d('服务体验平均分')}
                value={partnerSupplement?.serviceAverageScore}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.average.product.scene`).d('商品场景匹配度平均分')}
                value={partnerSupplement?.sceneMatchAverageScore}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.average.cooperative.effort`).d('协作力度平均分')}
                value={partnerSupplement?.collaborationAverageScore}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.average.overall`).d('总平均分')}
                value={partnerSupplement?.sumAverageScore}
              />
            </Col>
            {/* <Col {...gridSpan}>
            <Form.Item
                label={intl.get(`view.poSigning.offlineEntitySealFlag`).d('ceshi')}
              >
                {this.props.form.getFieldDecorator('demo', {
                  initialValue: partnerSupplement?.demo,
                })(
                  <InputNumber
                    min={0}
                    step={0.01}
                    precision={2}
                    formatter={(value) => value?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
                  />
                )}
              </Form.Item>
            </Col> */}
          </GenerateFormGrid>
        </Form>
      </>
    );
  }
}
