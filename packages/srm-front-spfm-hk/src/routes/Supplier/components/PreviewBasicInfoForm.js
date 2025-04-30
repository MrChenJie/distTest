import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { Col, Row } from 'antd';
import { Form } from 'hzero-ui';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusLov from '_cus_components/CusLov';
import formatterCollections from 'utils/intl/formatterCollections';
import { getDateFormat } from 'utils/utils';
import dayjs from 'dayjs';
import { TRIM, EMAIL, PHONE } from 'utils/regExp';

const prompt = 'spfmhk.supplier';
@Form.create()
@formatterCollections({ code: [prompt] })
export default class PreviewBasicInfoForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  componentDidMount() {
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, initialValues, checkRegistrationNumber, checkSupplierName, financeDisabled, disabledEdit } = this.props;
    const gridSpan = {
      xs: 12,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12,
      xxl: 12
    };

    return (
      <Fragment>
        <div className="customize-form">
          <Form>
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
                  })(<CusInput allowClear
                      placeholder={intl.get(`${prompt}.field.company.name.en.placeholder`).d('请输入公司英文名称，若没有，录入N/A')}
                      onBlur={checkSupplierName}
                      disabled={disabledEdit}
                  />)}
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
                  })(<CusInput allowClear
                      placeholder={intl.get(`${prompt}.field.company.name.cn.placeholder`).d('请输入公司中文名称')}
                      onBlur={checkSupplierName}
                      disabled={disabledEdit}
                  />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
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
                    allowClear
                    placeholder={intl.get(`${prompt}.field.address.en.placeholder`).d('请输入地址英文名称，若没有，录入N/A')}
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    disabled={disabledEdit}
                  />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item label={intl.get(`${prompt}.field.address.cn`).d('地址（中文）')} >
                  {getFieldDecorator('addressCh', {
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prompt}.field.address.cn`).d('地址（中文）'),
                      }),
                    }],
                    initialValue: initialValues?.addressCh,
                  })(<CusInput.TextArea
                    allowClear
                    placeholder={intl.get(`${prompt}.field.address.cn.placeholder`).d('请输入地址中文名称')}
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    disabled={disabledEdit}
                  />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.telNo`).d('电话号码')}>
                  {getFieldDecorator('phoneNumber', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.telNo`).d('电话号码'),
                        }),
                      },
                      // {
                      //   pattern: /^[0-9]*$/,
                      //   message: intl.get(`${prompt}.field.validation.digital`).d('只能输入数字'),
                      // },
                    ],
                    initialValue: initialValues?.phoneNumber,
                  })(<CusInput allowClear placeholder={intl.get(`${prompt}.field.telNo.placeholder`).d('请输入公司联系电话')} disabled={disabledEdit}/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.faxNo`).d('传真号码')}>
                  {getFieldDecorator('fax', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.faxNo`).d('传真号码'),
                        }),
                      },
                      // {
                      //   pattern: /^[0-9]*$/,
                      //   message: intl.get(`${prompt}.field.validation.digital`).d('只能输入数字'),
                      // },
                    ],
                    initialValue: initialValues?.fax,
                  })(<CusInput allowClear disabled={disabledEdit}/>)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.email`).d('电邮')}>
                  {getFieldDecorator('email', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.email`).d('电邮'),
                        }),
                      },
                      {
                        pattern: EMAIL,
                        message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                      },
                    ],
                    initialValue: initialValues?.email,
                  })(<CusInput allowClear disabled={disabledEdit}/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.supplier.category`).d('供应商类别')}>
                  {getFieldDecorator('supplierCategory', {
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prompt}.field.supplier.category`).d('供应商类别'),
                      }),
                    }],
                    initialValue: initialValues?.supplierCategory,
                  })(<CusSelect
                    lovCode="HKSP.SUP_CATEGORY"
                    style={{ width: '100%' }}
                    disabled={financeDisabled || disabledEdit}
                    tip={
                      <div>
                        {intl
                          .get(`${prompt}.field.supplier.category.placeholder`)
                          .d('财务选择“财务付款”，A2P选"ICT"')}
                      </div>
                    }/>)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
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
                  })(<CusInput allowClear placeholder={intl.get(`${prompt}.field.web.placeHolder`).d('请输入公司网址')} disabled={disabledEdit}/>)}
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
                  })(<CusSelect style={{ width: '100%' }}  placeholder={intl.get(`${prompt}.field.company.type.placeholder`).d('请选择公司类型')}
                      lovCode="HKSP.COMPANY_TYPE"
                      disabled={disabledEdit}
                  />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
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
                  })(<CusInput allowClear placeholder={intl.get(`${prompt}.field.supplier.product.placeholder`).d('请输入供应品牌类型')} disabled={disabledEdit}/>)}
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
                  })(<CusSelect style={{ width: '100%' }}  placeholder={intl.get(`${prompt}.field.company.category.placeholder`).d('请选择公司类别')}
                      lovCode="HKSP.COMPANY_CATEG"
                      disabled={disabledEdit}
                  />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
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
                  })(<CusInput placeholder={intl.get(`${prompt}.field.business.nature.placeholder`).d('请选择业务性质')} disabled={disabledEdit}/>)}
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
                  })(<CusSelect style={{ width: '100%' }}  placeholder={intl.get(`${prompt}.field.product.categories.placeholder`).d('请选择产品类别')}
                      lovCode="HKSP.SUP_PROD_CATEGORY"
                      disabled={disabledEdit}
                  />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.company.establishment.date`).d('公司成立日期')}>
                  {getFieldDecorator('foundDate', {
                    initialValue: initialValues?.foundDate ? dayjs(initialValues?.foundDate) : null,
                  })(<CusDatePicker format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={intl.get(`${prompt}.field.company.establishment.date.placeholder`).d('请选择公司成立日期')}
                      disabledDate={(currentDate) => {
                        return (currentDate && currentDate.isAfter(dayjs()))
                      }}
                      disabled={disabledEdit}
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
                  })(<CusInput allowClear placeholder={intl.get(`${prompt}.field.company.location.placeholder`).d('请输入公司注册地址')} disabled={disabledEdit}/>)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.commercial.registration.certificate.num`).d('商业登记证号码')}>
                  {getFieldDecorator('registrationNumber', {
                    rules: [{
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prompt}.field.commercial.registration.certificate.num`).d('商业登记证号码'),
                      }),
                    }],
                    initialValue: initialValues?.registrationNumber,
                  })(<CusInput allowClear
                      placeholder={intl.get(`${prompt}.field.registration.certificate.num.placeholder`).d('请输入商业登记证号码')}
                      tip={<div>
                        {intl.get(`${prompt}.field.registration.certificate.num.placeholder2`).d('若为中国内地供应商，此处填写统一社会信用代码')}
                      </div>}
                      onBlur={checkRegistrationNumber}
                      disabled={disabledEdit}
                  />)}
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
                      placeholder={intl.get(`${prompt}.field.country.placeholder`).d('请选择国家')}
                      code="HPFM.COUNTRY"
                      lovOptions={{ displayField: 'countryName', valueField: 'countryCode' }}
                      textValue={initialValues?.countryName}
                      disabled={disabledEdit}
                  />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
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
                      placeholder={intl.get(`${prompt}.field.order.currency.placeholder`).d('请选择订单币种')}
                      code="HPFM.CURRENCY"
                      textField="orderMoneyType"
                      disabled={disabledEdit}
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
                  })(<CusSelect style={{ width: '100%' }}  placeholder={intl.get(`${prompt}.field.credit.period.placeholder`).d('请选择付款期限')}
                      lovCode="HKSP.CREDIT_PERIOD"
                      disabled={disabledEdit}
                  />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
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
                  })(<CusSelect style={{ width: '100%' }}  placeholder={intl.get(`${prompt}.field.payment.method.placeholder`).d('请选择付款办法')}
                      lovCode="HKSP.PAYMENT_METHOD"
                      disabled={disabledEdit}
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
                  })(<CusSelect style={{ width: '100%' }}  placeholder={intl.get(`${prompt}.field.international.regulation.placeHolder`).d('请选择国贸条规')}
                      lovCode="HKSP.DELI_TERMS"
                      disabled={disabledEdit}
                  />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
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
            </Row>
            <Row gutter={24}>
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
                    })(<CusDatePicker format={getDateFormat()} style={{ width: '100%' }} disabled placeholder={intl.get(`${prompt}.field.placeholder.to.be.generated`).d('待系统生成')}/>)}
                  </Form.Item>
                </Col>
              )}
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.supplier.num`).d('供应商编号')}>
                  {getFieldDecorator('supplierNumber', {
                    initialValue: initialValues?.supplierNumber,
                  })(<CusInput  allowClear disabled placeholder={intl.get(`${prompt}.field.placeholder.to.be.generated`).d('待系统生成')}/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.supplier.entry.date`).d('供应商准入日期')}>
                  {getFieldDecorator('supplierAccessTime', {
                    initialValue: initialValues?.supplierAccessTime ? dayjs(initialValues?.supplierAccessTime) : null,
                  })(<CusDatePicker format={getDateFormat()} style={{ width: '100%' }} disabled placeholder={intl.get(`${prompt}.field.placeholder.to.be.generated`).d('待系统生成')}/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.supplier.version`).d('供应商版本')}>
                  {getFieldDecorator('supplierVersions', {
                    initialValue: initialValues?.supplierVersions,
                  })(<CusInput  allowClear disabled placeholder={intl.get(`${prompt}.field.placeholder.to.be.generated`).d('待系统生成')}/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.supplier.status`).d('供应商状态')}>
                  {getFieldDecorator('supplierStatus', {
                    initialValue: initialValues?.supplierStatus,
                  })(<CusSelect allowClear
                      disabled
                      placeholder={intl.get(`${prompt}.field.placeholder.to.be.generated`).d('待系统生成')}
                      lovCode="HKSP.SUP_STATUS"
                  />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.status.update.date`).d('状态更新日期')}>
                  {getFieldDecorator('statusUpdateTime', {
                    initialValue: initialValues?.statusUpdateTime ? dayjs(initialValues?.statusUpdateTime) : undefined,
                  })(<CusDatePicker format={getDateFormat()} style={{ width: '100%' }} disabled placeholder={intl.get(`${prompt}.field.placeholder.to.be.generated`).d('待系统生成')}/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.version.update.date`).d('版本更新日期')}>
                  {getFieldDecorator('versionsUpdateTime', {
                    initialValue: initialValues?.versionsUpdateTime ? dayjs(initialValues?.versionsUpdateTime) : undefined,
                  })(<CusDatePicker format={getDateFormat()} style={{ width: '100%' }} disabled placeholder={intl.get(`${prompt}.field.placeholder.to.be.generated`).d('待系统生成')}/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.applicant`).d('业务员')}>
                  {getFieldDecorator('salesman', {
                    initialValue: initialValues?.salesman,
                  })(<CusInput  allowClear disabled/>)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Fragment>
    )
  }

}
