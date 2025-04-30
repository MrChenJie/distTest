import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { Row, Col } from 'antd';
import { Form } from 'hzero-ui';
import CusInput from '_cus_components/CusInput';
import CusInputNumber from '_cus_components/CusInputNumber';
import CusSelect from 'srm-front-common/lib/components/CusSelect';
import { getGrade } from '@/common/utils';

const prompt = 'spfmhk.supplier';

@Form.create()
export default class PurchaseForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      others: false
    }
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, initialValue, disabled = false } = this.props;
    const { others } = this.state;
    const gridSpan = {
      xs: 12,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12,
      xxl: 12
    };
    return (
      <Form className="customize-form">
        <Row gutter={24}>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.inclusion.reason`).d('入围原因')}>
              {getFieldDecorator('reason', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.inclusion.reason`).d('入围原因'),
                  }),
                }],
                initialValue: initialValue?.reason
              })(<CusSelect allowClear disabled={disabled}
                            lovCode="HKSP.REASON.REGISTER"
                            onChange={e => this.setState({ others: e === 'Others' })}
              />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.inclusion.reasontext`).d('补充入围原因')}>
              {getFieldDecorator('repairReason', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.inclusion.reasontext`).d('补充入围原因'),
                    }),
                  },
                ],
                initialValue: initialValue?.repairReason
              })(<CusInput allowClear disabled={disabled}/>)}
            </Form.Item>
          </Col>
          {/*{
            getFieldValue('reason') === 'Others' && (

            )
          }*/}
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.remark`).d('备注信息')}>
              {getFieldDecorator('purchaseInfo', {
                initialValue: initialValue?.purchaseInfo
              })(<CusInput allowClear disabled={disabled}/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.directorsName`).d('董事姓名')}>
              {getFieldDecorator('directorName', {
                initialValue: initialValue?.directorName
              })(<CusInput
                disabled={disabled}
                allowClear tip={
                <div>
                  {intl.get(`${prompt}.field.supplier.directorsName.placeholder`).d('若为中国内地供应商，就填写法人代表。')}
                </div>
              }/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.partnersName`).d('合伙人姓名')}>
              {getFieldDecorator('partnerName', {
                initialValue: initialValue?.partnerName,
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.partnersName`).d('合伙人姓名'),
                  }),
                }],
              })(<CusInput disabled={disabled} allowClear/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.employees.num`).d('聘用职员总数')}>
              {getFieldDecorator('headcount', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.employees.num`).d('聘用职员总数'),
                    }),
                  },
                  // {
                  //   pattern: /^[0-9]*$/,
                  //   message: intl.get(`${prompt}.field.validation.digital`).d('只能输入数字'),
                  // },
                ],
                initialValue: initialValue?.headcount
              })(<CusInput disabled={disabled} allowClear/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.credit.ratescore`).d('信用评估分数')}>
              {getFieldDecorator('creditScore', {
                rules: [
                  {
                    required: false,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.credit.ratescore`).d('信用评估分数'),
                    }),
                  },
                ],
                initialValue: initialValue?.creditScore
              })(
                <CusInputNumber
                  min={0}
                  max={100}
                  precision={2}
                  step={0.1}
                  disabled={disabled}
                  allowClear
                  onChange={(val) => getGrade(val, this.props.form)}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.credit.rate`).d('供应商信用级别')}>
              {getFieldDecorator('creditRating', {
                rules: [
                  {
                    required: false,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.credit.rate`).d('供应商信用级别'),
                    }),
                  },
                ],
                initialValue: initialValue?.creditRating
              })(
                  <CusSelect
                    disabled
                    allowClear
                    lovCode="HKSP.CRDIT.RAGE"
                  />
                )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    )
  }
}
