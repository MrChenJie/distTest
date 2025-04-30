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

export default class BusBackGround extends React.PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  render() {
    const {
      readyOnly = false,
      dispatch,
      idpValueMap,
      headerInfo,
      PartnerInformationModal,
    } = this.props;

    const { partnerBusiness } = PartnerInformationModal;
    return (
      <>
        <Form className="customize-form">
          <GenerateFormGrid isPackUp={false}>
            <Col {...gridSpan}>
              <Form.Item
                  label={intl.get(`spfmhk.mylink.field.merchant.name`).d('商户名称')}
                >
                  {this.props.form.getFieldDecorator('businessName', {
                    initialValue: partnerBusiness?.businessName,
                    rules: [
                      {
                        required: readyOnly,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`spfmhk.mylink.field.merchant.name`).d('商户名称'),
                        }),
                      },
                    ],
                  })(
                    <Input disabled={!readyOnly} />
                  )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                  label={intl.get(`spfmhk.mylink.field.establish.date`).d('成立年份')}
                >
                  {this.props.form.getFieldDecorator('foundDate', {
                    initialValue: partnerBusiness?.foundDate,
                    rules: [
                      {
                        required: readyOnly,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`spfmhk.mylink.field.establish.date`).d('成立年份'),
                        }),
                      },
                    ],
                  })(
                    <Input disabled={!readyOnly} />
                  )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                  label={intl.get(`spfmhk.mylink.field.merchant.business`).d('商户业务')}
                >
                  {this.props.form.getFieldDecorator('businessService', {
                    initialValue: partnerBusiness?.businessService,
                    rules: [
                      {
                        required: readyOnly,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`spfmhk.mylink.field.merchant.business`).d('商户业务'),
                        }),
                      },
                    ],
                  })(
                    <Input disabled={!readyOnly} />
                  )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                  label={intl.get(`spfmhk.mylink.field.userSize`).d('用户规模')}
                >
                  {this.props.form.getFieldDecorator('userScale', {
                    initialValue: partnerBusiness?.userScale,
                    rules: [
                      {
                        required: readyOnly,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`spfmhk.mylink.field.userSize`).d('用户规模'),
                        }),
                      },
                    ],
                  })(
                    <Input disabled={!readyOnly} />
                  )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                  label={intl.get(`spfmhk.mylink.field.branches.num`).d('实体分店数目')}
                >
                  {this.props.form.getFieldDecorator('branchNumber', {
                    initialValue: partnerBusiness?.branchNumber,
                    rules: [
                      {
                        required: readyOnly,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`spfmhk.mylink.field.branches.num`).d('实体分店数目'),
                        }),
                      },
                    ],
                  })(
                    <Input disabled={!readyOnly} />
                  )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                  label={intl.get(`spfmhk.mylink.field.company.web`).d('公司网页')}
                >
                  {this.props.form.getFieldDecorator('website', {
                    initialValue: partnerBusiness?.website,
                    rules: [
                      {
                        required: readyOnly,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`spfmhk.mylink.field.company.web`).d('公司网页'),
                        }),
                      },
                    ],
                  })(
                    <Input disabled={!readyOnly} />
                  )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                  label={intl.get(`spfmhk.mylink.field.competitor`).d('主要竞争对手')}
                >
                  {this.props.form.getFieldDecorator('majorCompetition', {
                    initialValue: partnerBusiness?.majorCompetition,
                    rules: [
                      {
                        required: readyOnly,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`spfmhk.mylink.field.competitor`).d('主要竞争对手'),
                        }),
                      },
                    ],
                  })(
                    <Input disabled={!readyOnly} />
                  )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                  label={intl.get(`spfmhk.mylink.field.product.info`).d('产品信息')}
                >
                  {this.props.form.getFieldDecorator('productInfo', {
                    initialValue: partnerBusiness?.productInfo,
                    rules: [
                      {
                        required: readyOnly,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`spfmhk.mylink.field.product.info`).d('产品信息'),
                        }),
                      },
                    ],
                  })(
                    <Input disabled={!readyOnly} />
                  )}
              </Form.Item>
            </Col>
          </GenerateFormGrid>
        </Form>
      </>
    );
  }
}
