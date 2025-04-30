import React, { PureComponent } from 'react';
import { Col, Row } from 'antd';
import { Form } from 'hzero-ui';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusLov from '_cus_components/CusLov';
import CusInputNumber from '_cus_components/CusInputNumber';
import { getDateFormat } from 'utils/utils';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import formatterCollections from 'utils/intl/formatterCollections';

const prompt = 'spfmhk.supplier';
@Form.create()
@formatterCollections({ code: [prompt] })
export default class PreviewPurchaseApprovalForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  componentDidMount() {
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, initialValues } = this.props;
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
            <Form.Item label={intl.get(`${prompt}.field.company.name.en`).d('公司名称（英文）')}>
              {getFieldDecorator('companyNameEn', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.company.name.en`).d('公司名称（英文）'),
                  }),
                }],
                initialValue: initialValues?.companyNameEn,
              })(<CusInput disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.company.name.cn`).d('公司名称（中文）')}>
              {getFieldDecorator('companyNameCh', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.company.name.cn`).d('公司名称（中文）'),
                  }),
                }],
                initialValue: initialValues?.companyNameCh,
              })(<CusInput disabled/>)}
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label={intl.get(`${prompt}.field.address.en`).d('地址（英文）')}>
              {getFieldDecorator('addressEn', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.address.en`).d('地址（英文）'),
                  }),
                }],
                initialValue: initialValues?.addressEn,
              })(<CusInput.TextArea
                disabled
                autoSize={{ minRows: 2, maxRows: 6 }}/>)}
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label={intl.get(`${prompt}.field.address.cn`).d('地址（中文）')}>
              {getFieldDecorator('addressCh', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.address.cn`).d('地址（中文）'),
                  }),
                }],
                initialValue: initialValues?.addressCh,
              })(<CusInput.TextArea
                disabled
                autoSize={{ minRows: 2, maxRows: 6 }}/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.telNo`).d('电话号码')}>
              {getFieldDecorator('phoneNumber', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.telNo`).d('电话号码'),
                  }),
                }],
                initialValue: initialValues?.phoneNumber,
              })(<CusInput disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.faxNo`).d('传真号码')}>
              {getFieldDecorator('fax', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.faxNo`).d('传真号码'),
                  }),
                }],
                initialValue: initialValues?.fax,
              })(<CusInput disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.email`).d('电邮')}>
              {getFieldDecorator('email', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.email`).d('电邮'),
                  }),
                }],
                initialValue: initialValues?.email,
              })(<CusInput disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.web`).d('公司网址')}>
              {getFieldDecorator('companyWebsite', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.web`).d('公司网址'),
                  }),
                }],
                initialValue: initialValues?.companyWebsite,
              })(<CusInput disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.company.type`).d('公司类型')}>
              {getFieldDecorator('companyType', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.company.type`).d('公司类型'),
                  }),
                }],
                initialValue: initialValues?.companyType,
              })(<CusSelect disabled
                            lovCode="HKSP.COMPANY_TYPE"
              />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.supply.of.goods.services`).d('供应货品/服务')}>
              {getFieldDecorator('product', {
                rules: [{
                  required: getFieldValue('supplierCategory') !== 'FINANCIALPAYMENT',
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.supply.of.goods.services`).d('供应货品/服务'),
                  }),
                }],
                initialValue: initialValues?.product,
              })(<CusInput disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.company.category`).d('公司类别')}>
              {getFieldDecorator('companyClasses', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.company.category`).d('公司类别'),
                  }),
                }],
                initialValue: initialValues?.companyClasses,
              })(<CusSelect style={{ width: '100%' }}
                            disabled
                            lovCode="HKSP.COMPANY_CATEG"
              />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.business.nature`).d('业务性质')}>
              {getFieldDecorator('professional', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.business.nature`).d('业务性质'),
                  }),
                }],
                initialValue: initialValues?.professional,
              })(<CusInput style={{ width: '100%' }}
                            disabled
              />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.supplier.category`).d('供应商类别')}>
              {getFieldDecorator('supplierCategory', {
                initialValue: initialValues?.supplierCategory,
              })(<CusSelect style={{ width: '100%' }}
                            disabled
                            lovCode="HKSP.SUP_CATEGORY"
              />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.supplier.product.categories`).d('供应商产品类别')}>
              {getFieldDecorator('supplierProductClass', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.supplier.product.categories`).d('供应商产品类别'),
                  }),
                }],
                initialValue: initialValues?.supplierProductClass,
              })(<CusSelect style={{ width: '100%' }}
                            disabled
                            lovCode="HKSP.SUP_PROD_CATEGORY"
              />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.company.establishment.date`).d('公司成立日期')}>
              {getFieldDecorator('foundDate', {
                initialValue: initialValues?.foundDate ? dayjs(initialValues?.foundDate) : undefined,
              })(<CusDatePicker format={getDateFormat()}
                                style={{ width: '100%' }}
                                disabled
              />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.company.location`).d('公司成立地点')}>
              {getFieldDecorator('foundAddress', {
                rules: [{
                  required: getFieldValue('supplierCategory') !== 'FINANCIALPAYMENT',
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.company.location`).d('公司成立地点'),
                  }),
                }],
                initialValue: initialValues?.foundAddress,
              })(<CusInput disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.commercial.registration.certificate.num`).d('商业登记证号码')}>
              {getFieldDecorator('registrationNumber', {
                rules: [{
                  required: getFieldValue('supplierCategory') !== 'FINANCIALPAYMENT',
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.commercial.registration.certificate.num`).d('商业登记证号码'),
                  }),
                }],
                initialValue: initialValues?.registrationNumber,
              })(<CusInput disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.partnersName`).d('合伙人姓名')}>
              {getFieldDecorator('partnerName', {
                initialValue: initialValues?.partnerName
              })(<CusInput disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.directorsName`).d('董事姓名')}>
              {getFieldDecorator('directorName', {
                initialValue: initialValues?.directorName
              })(<CusInput disabled tip={
                <div>
                  {intl.get(`${prompt}.field.supplier.directorsName.placeholder`).d('若为中国内地供应商，就填写法人代表。')}
                </div>
              }/>)}
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
                initialValue: initialValues?.headcount
              })(<CusInput disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.country`).d('国家')}>
              {getFieldDecorator('country', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.country`).d('国家'),
                  }),
                }],
                initialValue: initialValues?.country,
              })(<CusLov style={{ width: '100%' }}
                         disabled
                         code="HPFM.COUNTRY"
                         lovOptions={{ displayField: 'countryName', valueField: 'countryCode' }}
                         textField="country"
              />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.order.currency`).d('订单币种')}>
              {getFieldDecorator('orderMoneyType', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.order.currency`).d('订单币种'),
                  }),
                }],
                initialValue: initialValues?.orderMoneyType,
              })(<CusLov style={{ width: '100%' }}
                         disabled
                         code="HPFM.CURRENCY"
                         textField="orderMoneyType"
              />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.credit.period`).d('付款期限')}>
              {getFieldDecorator('prompt', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.credit.period`).d('付款期限'),
                  }),
                }],
                initialValue: initialValues?.prompt,
              })(<CusSelect style={{ width: '100%' }}
                            disabled
                            lovCode="HKSP.CREDIT_PERIOD"
              />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.payment.method`).d('付款办法')}>
              {getFieldDecorator('paymentMethod', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.payment.method`).d('付款办法'),
                  }),
                }],
                initialValue: initialValues?.paymentMethod,
              })(<CusSelect style={{ width: '100%' }}
                            disabled
                            lovCode="HKSP.PAYMENT_METHOD"
              />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.international.regulation`).d('国贸条规')}>
              {getFieldDecorator('deliveryClause', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.international.regulation`).d('国贸条规'),
                  }),
                }],
                initialValue: initialValues?.deliveryClause,
              })(<CusSelect style={{ width: '100%' }}
                            disabled
                            lovCode="HKSP.DELI_TERMS"
              />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.inclusion.reason`).d('入围原因')}>
              {getFieldDecorator('reason', {
                rules: [{
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${prompt}.field.inclusion.reason`).d('入围原因'),
                  }),
                }],
                initialValue: initialValues?.reason,
              })(<CusSelect lovCode="HKSP.REASON.REGISTER" disabled/>)}
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
                initialValue: initialValues?.repairReason
              })(<CusInput disabled/>)}
            </Form.Item>
          </Col>
          {/*{
            getFieldValue('reason') === 'Others' && (

            )
          }*/}
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.remark`).d('备注')}>
              {getFieldDecorator('purchaseInfo', {
                initialValue: initialValues?.purchaseInfo,
              })(<CusInput disabled/>)}
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
                initialValue: initialValues?.creditScore
              })(
                <CusInputNumber
                  min={0}
                  max={100}
                  precision={2}
                  step={0.1}
                  disabled
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
                initialValue: initialValues?.creditRating
              })(
                  <CusSelect
                    disabled
                    allowClear
                    lovCode="HKSP.CRDIT.RAGE"
                  />
                )}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.supmodifystatus`).d('供应商修改状态')}>
              {getFieldDecorator('supModifyState', {
                initialValue: initialValues?.supModifyState || 'Draft'
              })(<CusSelect disabled lovCode="HKSP.SUP_MOD_STATUS" />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.supplier.enableportal`).d('是否启用供应商门户')}>
              {getFieldDecorator('enableSupPortal', {
                initialValue: initialValues?.enableSupPortal || 'N'
              })(<CusSelect disabled lovCode="HKSP.SUP_PORTAL_ENABLE"/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.Invaildsupplier`).d('是否失效')}>
              {getFieldDecorator('enableValid', {
                initialValue: initialValues?.enableValid || 'N'
              })(<CusSelect disabled lovCode="HKSP.SUP_INVALID"/>)}
            </Form.Item>
          </Col>
          {getFieldValue('enableValid') === 'Y' && (
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${prompt}.field.supplier.Invaildate`).d('失效日期')}>
                {getFieldDecorator('expireDate', {
                  initialValue: initialValues?.expireDate ? dayjs(initialValues?.expireDate) : undefined,
                })(<CusDatePicker format={getDateFormat()}
                                  style={{ width: '100%' }}
                                  disabled/>)}
              </Form.Item>
            </Col>
          )}
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.supplier.num`).d('供应商编号')}>
              {getFieldDecorator('supplierNumber', {
                initialValue: initialValues?.supplierNumber,
              })(<CusInput disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.supplier.entry.date`).d('供应商准入日期')}>
              {getFieldDecorator('supplierAccessTime', {
                initialValue: initialValues?.supplierAccessTime ? dayjs(initialValues?.supplierAccessTime) : undefined,
              })(<CusDatePicker format={getDateFormat()} style={{ width: '100%' }} disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.supplier.status`).d('供应商状态')}>
              {getFieldDecorator('supplierStatus', {
                initialValue: initialValues?.supplierStatus,
              })(<CusSelect lovCode="HKSP.SUP_STATUS" disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.status.update.date`).d('状态更新日期')}>
              {getFieldDecorator('statusUpdateTime', {
                initialValue: initialValues?.statusUpdateTime ? dayjs(initialValues?.statusUpdateTime) : undefined,
              })(<CusDatePicker format={getDateFormat()} style={{ width: '100%' }} disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.supplier.version`).d('供应商版本')}>
              {getFieldDecorator('supplierVersions', {
                initialValue: initialValues?.supplierVersions,
              })(<CusInput disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.version.update.date`).d('版本更新日期')}>
              {getFieldDecorator('versionsUpdateTime', {
                initialValue: initialValues?.versionsUpdateTime ? dayjs(initialValues?.versionsUpdateTime) : undefined,
              })(<CusDatePicker format={getDateFormat()} style={{ width: '100%' }} disabled/>)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${prompt}.field.applicant`).d('业务员')}>
              {getFieldDecorator('salesman', {
                initialValue: initialValues?.salesman,
              })(<CusInput disabled/>)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    )
  }

}
