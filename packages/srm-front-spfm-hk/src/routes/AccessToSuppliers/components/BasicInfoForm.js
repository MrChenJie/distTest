import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { Col, Row } from 'antd';
import { Form } from 'hzero-ui';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusLov from '_cus_components/CusLov';
import formatterCollections from 'utils/intl/formatterCollections';
import { getDateFormat, getCurrentUser } from 'utils/utils';
import { TRIM, EMAIL, PHONE } from 'utils/regExp';
import dayjs from 'dayjs';

const prompt = 'spfmhk.supplier';
@Form.create()
@formatterCollections({ code: [prompt] })
export default class BasicInfoForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  componentDidMount() {}

  render() {
    const {
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      disabled,
      head,
      status,
      checkSupplierName,
      checkRegistrationNumber,
      supplierCategory,
      financeDisabled,
      companyName,
      BRNum,
    } = this.props;
    const gridSpan = {
      xs: 12,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12,
      xxl: 12,
    };
    return (
      <Fragment>
        <div className="customize-form">
          <Form>
            <Row gutter={24}>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.applicant`).d('业务员')}>
                  {getFieldDecorator('salesman', {
                    initialValue: getCurrentUser() && getCurrentUser().realName,
                  })(<CusInput allowClear disabled />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.field.company.name.en`).d('公司名称（英文）')}
                >
                  {getFieldDecorator('companyNameEn', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.company.name.en`).d('公司名称（英文）'),
                        }),
                      },
                    ],
                    initialValue: head?.companyNameEn || companyName,
                  })(
                    <CusInput
                      allowClear
                      disabled={disabled}
                      placeholder={intl
                        .get(`${prompt}.field.company.name.en.placeholder`)
                        .d('请输入公司英文名称，若没有，录入N/A')}
                      onBlur={checkSupplierName}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.field.company.name.cn`).d('公司名称（中文）')}
                >
                  {getFieldDecorator('companyNameCh', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.company.name.cn`).d('公司名称（中文）'),
                        }),
                      },
                    ],
                    initialValue: head?.companyNameCh || companyName,
                  })(
                    <CusInput
                      allowClear
                      disabled={disabled}
                      placeholder={intl
                        .get(`${prompt}.field.company.name.cn.placeholder`)
                        .d('请输入公司中文名称')}
                      onBlur={checkSupplierName}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item label={intl.get(`${prompt}.field.address.en`).d('地址（英文）')}>
                  {getFieldDecorator('addressEn', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.address.en`).d('地址（英文）'),
                        }),
                      },
                    ],
                    initialValue: head?.addressEn,
                  })(
                    <CusInput.TextArea
                      allowClear
                      disabled={disabled}
                      placeholder={intl
                        .get(`${prompt}.field.address.en.placeholder`)
                        .d('请输入地址英文名称，若没有，录入N/A')}
                      autoSize={{ minRows: 2, maxRows: 6 }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item label={intl.get(`${prompt}.field.address.cn`).d('地址（中文）')}>
                  {getFieldDecorator('addressCh', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.address.cn`).d('地址（中文）'),
                        }),
                      },
                    ],
                    initialValue: head?.addressCh,
                  })(
                    <CusInput.TextArea
                      allowClear
                      disabled={disabled}
                      placeholder={intl
                        .get(`${prompt}.field.address.cn.placeholder`)
                        .d('请输入地址中文名称')}
                      autoSize={{ minRows: 2, maxRows: 6 }}
                    />
                  )}
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
                    initialValue: head?.phoneNumber,
                  })(
                    <CusInput
                      allowClear
                      disabled={disabled}
                      placeholder={intl
                        .get(`${prompt}.field.telNo.placeholder`)
                        .d('请输入公司联系电话')}
                    />
                  )}
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
                    initialValue: head?.fax,
                  })(<CusInput allowClear disabled={disabled} />)}
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
                    initialValue: head?.email,
                  })(<CusInput allowClear disabled={disabled} />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.supplier.category`).d('供应商类别')}>
                  {getFieldDecorator('supplierCategory', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.supplier.category`).d('供应商类别'),
                        }),
                      },
                    ],
                    initialValue: head?.supplierCategory || supplierCategory,
                  })(
                    <CusSelect
                      lovCode="HKSP.SUP_CATEGORY"
                      disabled={disabled || financeDisabled}
                      style={{ width: '100%' }}
                      tip={
                        <div>
                          {intl
                            .get(`${prompt}.field.supplier.category.placeholder`)
                            .d('财务选择“财务付款”，A2P选"ICT"')}
                        </div>
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.web`).d('公司网址')}>
                  {getFieldDecorator('companyWebsite', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.web`).d('公司网址'),
                        }),
                      },
                    ],
                    initialValue: head?.companyWebsite,
                  })(
                    <CusInput
                      allowClear
                      disabled={disabled}
                      placeholder={intl.get(`${prompt}.field.web.placeHolder`).d('请输入公司网址')}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.company.type`).d('公司类型')}>
                  {getFieldDecorator('companyType', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.company.type`).d('公司类型'),
                        }),
                      },
                    ],
                    initialValue: head?.companyType,
                  })(
                    <CusSelect
                      style={{ width: '100%' }}
                      disabled={disabled}
                      placeholder={intl
                        .get(`${prompt}.field.company.type.placeholder`)
                        .d('请选择公司类型')}
                      lovCode="HKSP.COMPANY_TYPE"
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.field.supply.of.goods.services`).d('供应货品/服务')}
                >
                  {getFieldDecorator('product', {
                    rules: [
                      {
                        required: getFieldValue('supplierCategory') !== 'FINANCIALPAYMENT',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`${prompt}.field.supply.of.goods.services`)
                            .d('供应货品/服务'),
                        }),
                      },
                    ],
                    initialValue: head?.product,
                  })(
                    <CusInput
                      allowClear
                      disabled={disabled}
                      placeholder={intl
                        .get(`${prompt}.field.supplier.product.placeholder`)
                        .d('请输入供应品牌类型')}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.company.category`).d('公司类别')}>
                  {getFieldDecorator('companyClasses', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.company.category`).d('公司类别'),
                        }),
                      },
                    ],
                    initialValue: head?.companyClasses,
                  })(
                    <CusSelect
                      style={{ width: '100%' }}
                      disabled={disabled}
                      placeholder={intl
                        .get(`${prompt}.field.company.category.placeholder`)
                        .d('请选择公司类别')}
                      lovCode="HKSP.COMPANY_CATEG"
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.business.nature`).d('业务性质')}>
                  {getFieldDecorator('professional', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.business.nature`).d('业务性质'),
                        }),
                      },
                    ],
                    initialValue: head?.professional,
                  })(
                    <CusInput
                      disabled={disabled}
                      placeholder={intl
                        .get(`${prompt}.field.business.nature.placeholder`)
                        .d('请选择业务性质')}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl
                    .get(`${prompt}.field.supplier.product.categories`)
                    .d('供应商产品类别')}
                >
                  {getFieldDecorator('supplierProductClass', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`${prompt}.field.supplier.product.categories`)
                            .d('供应商产品类别'),
                        }),
                      },
                    ],
                    initialValue: head?.supplierProductClass,
                  })(
                    <CusSelect
                      style={{ width: '100%' }}
                      disabled={disabled}
                      placeholder={intl
                        .get(`${prompt}.field.product.categories.placeholder`)
                        .d('请选择产品类别')}
                      lovCode="HKSP.SUP_PROD_CATEGORY"
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.company.location`).d('公司成立地点')}>
                  {getFieldDecorator('foundAddress', {
                    rules: [
                      {
                        required: getFieldValue('supplierCategory') !== 'FINANCIALPAYMENT',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.company.location`).d('公司成立地点'),
                        }),
                      },
                    ],
                    initialValue: head?.foundAddress,
                  })(
                    <CusInput
                      allowClear
                      disabled={disabled}
                      placeholder={intl
                        .get(`${prompt}.field.company.location.placeholder`)
                        .d('请输入公司注册地址')}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.field.company.establishment.date`).d('公司成立日期')}
                >
                  {getFieldDecorator('foundDate', {
                    initialValue: head?.foundDate,
                  })(
                    <CusDatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      disabled={disabled}
                      placeholder={intl
                        .get(`${prompt}.field.company.establishment.date.placeholder`)
                        .d('请选择公司成立日期')}
                      disabledDate={(currentDate) => {
                        return currentDate && currentDate.isAfter(dayjs());
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl
                    .get(`${prompt}.field.commercial.registration.certificate.num`)
                    .d('商业登记证号码')}
                >
                  {getFieldDecorator('registrationNumber', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`${prompt}.field.commercial.registration.certificate.num`)
                            .d('商业登记证号码'),
                        }),
                      },
                    ],
                    initialValue: head?.registrationNumber || BRNum,
                  })(
                    <CusInput
                      allowClear
                      disabled={disabled}
                      placeholder={intl
                        .get(`${prompt}.field.registration.certificate.num.placeholder`)
                        .d('请输入商业登记证号码')}
                      tip={
                        <div>
                          {intl
                            .get(`${prompt}.field.registration.certificate.num.placeholder2`)
                            .d('若为中国内地供应商，此处填写统一社会信用代码')}
                        </div>
                      }
                      onBlur={checkRegistrationNumber}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.country`).d('国家')}>
                  {getFieldDecorator('country', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.country`).d('国家'),
                        }),
                      },
                    ],
                    initialValue: head?.country,
                  })(
                    <CusLov
                      textValue={head?.countryMeaning}
                      lovOptions={{ displayField: 'countryName', valueField: 'countryCode' }}
                      style={{ width: '100%' }}
                      disabled={disabled}
                      placeholder={intl.get(`${prompt}.field.country.placeholder`).d('请选择国家')}
                      code="HPFM.COUNTRY"
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.order.currency`).d('订单币种')}>
                  {getFieldDecorator('orderMoneyType', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.order.currency`).d('订单币种'),
                        }),
                      },
                    ],
                    initialValue: head?.orderMoneyType,
                  })(
                    <CusLov
                      textValue={head?.orderMoneyType}
                      style={{ width: '100%' }}
                      disabled={disabled}
                      placeholder={intl
                        .get(`${prompt}.field.order.currency.placeholder`)
                        .d('请选择订单币种')}
                      code="HPFM.CURRENCY"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.credit.period`).d('付款期限')}>
                  {getFieldDecorator('prompt', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.credit.period`).d('付款期限'),
                        }),
                      },
                    ],
                    initialValue: head?.prompt,
                  })(
                    <CusSelect
                      style={{ width: '100%' }}
                      disabled={disabled}
                      placeholder={intl
                        .get(`${prompt}.field.credit.period.placeholder`)
                        .d('请选择付款期限')}
                      lovCode="HKSP.CREDIT_PERIOD"
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.payment.method`).d('付款办法')}>
                  {getFieldDecorator('paymentMethod', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.payment.method`).d('付款办法'),
                        }),
                      },
                    ],
                    initialValue: head?.paymentMethod,
                  })(
                    <CusSelect
                      style={{ width: '100%' }}
                      disabled={disabled}
                      placeholder={intl
                        .get(`${prompt}.field.payment.method.placeholder`)
                        .d('请选择付款办法')}
                      lovCode="HKSP.PAYMENT_METHOD"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.field.international.regulation`).d('国贸条规')}
                >
                  {getFieldDecorator('deliveryClause', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.field.international.regulation`).d('国贸条规'),
                        }),
                      },
                    ],
                    initialValue: head?.deliveryClause,
                  })(
                    <CusSelect
                      style={{ width: '100%' }}
                      disabled={disabled}
                      placeholder={intl
                        .get(`${prompt}.field.international.regulation.placeHolder`)
                        .d('请选择国贸条规')}
                      lovCode="HKSP.DELI_TERMS"
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.supmodifystatus`).d('供应商修改状态')}>
                  {getFieldDecorator('supModifyState', {
                    initialValue: head?.supModifyState || 'Draft',
                  })(<CusSelect disabled lovCode="HKSP.SUP_MOD_STATUS" />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.field.supplier.enableportal`).d('是否启用供应商门户')}
                >
                  {getFieldDecorator('enableSupPortal', {
                    initialValue: head?.enableSupPortal || 'N',
                  })(<CusSelect disabled lovCode="HKSP.SUP_PORTAL_ENABLE" />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.Invaildsupplier`).d('是否失效')}>
                  {getFieldDecorator('enableValid', {
                    initialValue: 'N',
                  })(<CusSelect disabled lovCode="HKSP.SUP_INVALID" />)}
                </Form.Item>
              </Col>
              {getFieldValue('enableValid') === 'Y' && (
                <Col {...gridSpan}>
                  <Form.Item label={intl.get(`${prompt}.field.supplier.Invaildate`).d('失效日期')}>
                    {getFieldDecorator('expireDate', {
                      initialValue: initialValues?.expireDate
                        ? dayjs(initialValues?.expireDate)
                        : undefined,
                    })(
                      <CusDatePicker format={getDateFormat()} style={{ width: '100%' }} disabled />
                    )}
                  </Form.Item>
                </Col>
              )}
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.supplier.num`).d('供应商编号')}>
                  {getFieldDecorator('supplierNumber', {
                    initialValue: head?.supplierNumber,
                  })(
                    <CusInput
                      allowClear
                      disabled
                      placeholder={intl
                        .get(`${prompt}.field.placeholder.to.be.generated`)
                        .d('待系统生成')}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.field.supplier.entry.date`).d('供应商准入日期')}
                >
                  {getFieldDecorator('supplierAccessTime', {
                    initialValue: head?.supplierAccessTime,
                  })(
                    <CusInput
                      allowClear
                      disabled
                      placeholder={intl
                        .get(`${prompt}.field.placeholder.to.be.generated`)
                        .d('待系统生成')}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.supplier.status`).d('供应商状态')}>
                  {getFieldDecorator('supplierStatus', {
                    initialValue: head?.supplierStatus,
                  })(
                    <CusInput
                      allowClear
                      disabled
                      placeholder={intl
                        .get(`${prompt}.field.placeholder.to.be.generated`)
                        .d('待系统生成')}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.status.update.date`).d('状态更新日期')}>
                  {getFieldDecorator('statusUpdateTime', {
                    initialValue: head?.statusUpdateTime,
                  })(
                    <CusInput
                      allowClear
                      disabled
                      placeholder={intl
                        .get(`${prompt}.field.placeholder.to.be.generated`)
                        .d('待系统生成')}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.field.supplier.version`).d('供应商版本')}>
                  {getFieldDecorator('supplierVersions', {
                    initialValue: head?.supplierVersions,
                  })(
                    <CusInput
                      allowClear
                      disabled
                      placeholder={intl
                        .get(`${prompt}.field.placeholder.to.be.generated`)
                        .d('待系统生成')}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`${prompt}.field.version.update.date`).d('版本更新日期')}
                >
                  {getFieldDecorator('versionsUpdateTime', {
                    initialValue: head?.versionsUpdateTime,
                  })(
                    <CusInput
                      allowClear
                      disabled
                      placeholder={intl
                        .get(`${prompt}.field.placeholder.to.be.generated`)
                        .d('待系统生成')}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Fragment>
    );
  }
}
