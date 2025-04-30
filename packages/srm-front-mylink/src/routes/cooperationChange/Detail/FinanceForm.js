/*
 * @Author: 陈杰 <jie.chen06@hand-china.com>
 * @Date: 2025-04-07
 * Copyright (c) 2025, All Rights Reserved.
 */
import React from 'react';
import { Col, Input } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import { getDFormGridSpan } from '_cus_utils/utils';
import { getCurrentOrganizationId } from 'utils/utils';

const gridSpan = getDFormGridSpan();
const tenantId = getCurrentOrganizationId();
@Form.create({ fieldNameProp: null })
export default class FinanceForm extends React.PureComponent {
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
      activityCode,
      isType,
    } = this.props;

    const { partnerFinance } = PartnerInformationModal;
    console.log('partnerFinance', partnerFinance, isType);

    return (
      <>
        <Form className="customize-form">
          <GenerateFormGrid isPackUp={false}>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.mylink.field.companyName11`).d('订单币种')}>
                {this.props.form.getFieldDecorator('orderMoneyType', {
                  initialValue: partnerFinance?.orderMoneyType,
                  rules: [
                    {
                      required: readyOnly,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.companyName11`).d('订单币种'),
                      }),
                    },
                  ],
                })(
                  <CusLov
                    code="HPFM.CURRENCY"
                    textValue={partnerFinance?.orderMoneyType}
                    queryParams={{ tenantId }}
                    lovOptions={{ valueField: 'currencyCode', displayField: 'currencyCode' }}
                    disabled={!readyOnly}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.mylink.field.cooperate.mode11`).d('付款期限')}>
                {this.props.form.getFieldDecorator('prompt', {
                  initialValue: partnerFinance?.prompt,
                  rules: [
                    {
                      required: readyOnly,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.cooperate.mode11`).d('付款期限'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['HKSP.CREDIT_PERIOD']}
                    disabled={!readyOnly}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.mylink.field.company.phone11`).d('付款办法')}>
                {this.props.form.getFieldDecorator('paymentMethod', {
                  initialValue: partnerFinance?.paymentMethod,
                  rules: [
                    {
                      required: readyOnly,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.company.phone11`).d('付款办法'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['HKSP.PAYMENT_METHOD']}
                    disabled={!readyOnly}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.mylink.field.company.email11`).d('银行名称')}>
                {this.props.form.getFieldDecorator('bankName', {
                  initialValue: partnerFinance?.bankName,
                  rules: [
                    {
                      required: readyOnly,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.company.email11`).d('银行名称'),
                      }),
                    },
                  ],
                })(<Input disabled={!readyOnly} />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.mylink.field.company.productSer11`).d('银行账户')}>
                {this.props.form.getFieldDecorator('bankAccountName', {
                  initialValue: partnerFinance?.bankAccountName,
                  rules: [
                    {
                      required: readyOnly,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.company.productSer11`).d('银行账户'),
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
