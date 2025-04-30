import React, { PureComponent } from 'react';
import { Col, Row } from 'antd';
import { Form } from 'hzero-ui';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusLov from '_cus_components/CusLov';
import { Bind } from 'lodash-decorators';
import Checkbox from 'components/Checkbox';
import { getDateFormat } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import CusSpin from '_cus_components/CusSpin';
import CusInputNumber from '_cus_components/CusInputNumber';
import { getGrade } from '@/common/utils';
import CusButton from 'srm-front-common/lib/components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusTable from '_cus_components/CusTable';
import { tableScrollWidth } from 'utils/utils';

const prompt = 'spfmhk.supplier';
const LAYOUT = {
  lg: 12,
  md: 12,
  sm: 12,
  xl: 12,
  xs: 12,
  xxl: 12,
};
const ROW_LAYOUT = {
  lg: 24,
  md: 24,
  sm: 24,
  xl: 24,
  xs: 24,
  xxl: 24,
}

@Form.create()
export default class CompanyInfoForm extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);
    this.state = {
      backInfoFlag: false,
    }
  }

  componentDidMount() {
  }

  /**
   * 供应商名称查重
   */
  @Bind()
  checkSupplierName(e) {
    const { dispatch, data = {} } = this.props;
    const { id } = data;
    if (e.target.value) {
      dispatch({
        type: `prsaInfomationPortal/checkSupplierName`,
        payload: {
          supplierName: e.target.value,
          supplierId: id,
        },
      }).then((res) => {
        if (res && res.type === 'error') {
          notification.info({
            message: res?.message,
          });
        }
      });
    }
  }

  /**
   * 商业登记证号码查重
   */
  @Bind()
  checkRegistrationNumber(e) {
    const { dispatch, data = {} } = this.props;
    const { id } = data;
    if (e.target.value) {
      dispatch({
        type: `prsaInfomationPortal/checkRegistrationNumber`,
        payload: {
          registrationNumber: e.target.value,
          supplierId: id,
        },
      }).then((res) => {
        if (res && res.type === 'error') {
          notification.info({
            message: res?.message,
          });
        }
      });
    }
  }


  render() {
    const { data = {}, form, registerState, loading = false, disabledFlag = false, pagination = {}, onChange = e => e, readOnly = false } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { backInfoFlag = false } = this.state
    const disabled = registerState === 'recheck' ? false : true;
    const dataSource = data?.cmhkSupplierReturnHisList;
    const columns = [
      {
        title: intl.get(`spfmhk.supplier.field.returndate`).d('退回日期'),
        dataIndex: 'returnDate',
        width: 280,
      },
      {
        title: intl.get(`spfmhk.supplier.field.returnremark`).d('退回意见'),
        dataIndex: 'returnRemark',
        width: 280,
      }
    ]
    return (
      <CusSpin spinning={loading}>
        <Form className="customize-form">
          <Row>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.company.name.en`).d('公司名称（英文）')}>
                {getFieldDecorator('companyNameEn', {
                  initialValue: data.companyNameEn,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.requireInput', {
                      name: intl.get(`${prompt}.field.company.name.en`).d('公司名称(英文)'),
                    }),
                  }]
                })(<CusInput onBlur={this.checkSupplierName} allowClear disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.company.name.cn`).d('公司名称（中文）')}>
                {getFieldDecorator('companyNameCh', {
                  initialValue: data.companyNameCh,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.requireInput', {
                      name: intl.get(`${prompt}.field.company.name.cn`).d('公司名称(中文)'),
                    }),
                  }]
                })(<CusInput onBlur={this.checkSupplierName} allowClear disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...ROW_LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.address.en`).d('地址（英文）')}>
                {getFieldDecorator('addressEn', {
                  initialValue: data.addressEn,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.requireInput', {
                      name: intl.get(`${prompt}.field.address.en`).d('公司地址(英文)'),
                    }),
                  }],
                })(<CusInput.TextArea
                  rows={3}
                  autoSize={{ minRows: 2 }}
                  disabled={(disabled || disabledFlag) && !readOnly}
                />)}
              </Form.Item>
            </Col>
            <Col {...ROW_LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.address.cn`).d('地址（中文）')}>
                {getFieldDecorator('addressCh', {
                  initialValue: data.addressCh,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.requireInput', {
                      name: intl.get(`${prompt}.field.address.cn`).d('公司地址(中文)'),
                    }),
                  }],
                })(<CusInput.TextArea
                  rows={3}
                  autoSize={{ minRows: 2 }}
                  disabled={(disabled || disabledFlag) && !readOnly}
                />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.telNo`).d('电话号码')}>
                {getFieldDecorator('phoneNumber', {
                  initialValue: data.phoneNumber,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.requireInput', {
                      name: intl.get(`${prompt}.field.telNo`).d('电话号码'),
                    }),
                  }],
                })(<CusInput allowClear disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.faxNo`).d('传真号码')}>
                {getFieldDecorator('fax', {
                  initialValue: data.fax,
                  rules: [{
                    required: true,
                  }],
                })(<CusInput allowClear disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.email`).d('电邮')}>
                {getFieldDecorator('email', {
                  initialValue: data.email,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.requireInput', {
                      name: intl.get(`${prompt}.field.email`).d('电邮'),
                    }),
                  }],
                })(<CusInput trimAll typeCase="lower" allowClear disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.web`).d('公司网址')}>
                {getFieldDecorator('companyWebsite', {
                  initialValue: data.companyWebsite,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.requireInput', {
                      name: intl.get(`${prompt}.field.web`).d('公司网址'),
                    }),
                  }],
                })(<CusInput allowClear disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.company.type`).d('公司类型')}>
                {getFieldDecorator('companyType', {
                  initialValue: data.companyType,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.requireSelect', {
                      name: intl.get(`${prompt}.field.company.type`).d('公司类型'),
                    }),
                  }],
                })(<CusSelect lovCode="HKSP.COMPANY_TYPE" style={{ width: '100%' }} disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.supply.of.goods.services`).d('供应货品/服务')}>
                {getFieldDecorator('product', {
                  initialValue: data.product,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.requireInput', {
                      name: intl
                        .get(`${prompt}.field.supply.of.goods.services`)
                        .d('供应商品/服务'),
                    }),
                  }],
                })(<CusInput allowClear disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.company.category`).d('公司类别')}>
                {getFieldDecorator('companyClasses', {
                  initialValue: data.companyClasses,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.requireSelect', {
                      name: intl.get(`${prompt}.field.company.category`).d('公司类别'),
                    }),
                  }],
                })(<CusSelect lovCode="HKSP.COMPANY_CATEG" style={{ width: '100%' }} disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.business.nature`).d('业务性质')}>
                {getFieldDecorator('professional', {
                  initialValue: data.professional,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.requireSelect', {
                      name: intl.get(`${prompt}.field.business.nature`).d('业务性质'),
                    }),
                  }],
                })(<CusInput allowClear disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.supplier.category`).d('供应商类别')}>
                {getFieldDecorator('supplierCategory', {
                  initialValue: data.supplierCategory,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.requireInput', {
                        name: intl.get(`${prompt}.field.supplier.category`).d('供应商类别'),
                      }),
                    },
                  ],
                })(<CusSelect lovCode="HKSP.SUP_CATEGORY" style={{ width: '100%' }} disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.supplier.product.categories`).d('供应商产品类别')}>
                {getFieldDecorator('supplierProductClass', {
                  initialValue: data.supplierProductClass,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.requireInput', {
                      name: intl
                        .get(`${prompt}.field.supplier.product.categories`)
                        .d('供应商产品类别'),
                    }),
                  }],
                })(<CusSelect lovCode="HKSP.SUP_PROD_CATEGORY" style={{ width: '100%' }} disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.company.establishment.date`).d('公司成立日期')}>
                {getFieldDecorator('foundDate', {
                  initialValue: data?.foundDate ? dayjs(data?.foundDate) : null,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.requireSelect', {
                      name: intl
                        .get(`${prompt}.field.company.establishment.date`)
                        .d('公司成立日期'),
                    }),
                  }],
                })(<CusDatePicker
                  onChange={e => data.foundDate = dayjs(e).format(getDateFormat())}
                  format={getDateFormat()}
                  disabled={(disabled || disabledFlag) && !readOnly}
                  style={{ width: '100%' }} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.company.location`).d('公司成立地点')}>
                {getFieldDecorator('foundAddress', {
                  initialValue: data.foundAddress,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.requireInput', {
                      name: intl.get(`${prompt}.field.company.location`).d('公司成立地点'),
                    }),
                  }],
                })(<CusInput allowClear disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.commercial.registration.certificate.num`).d('商业登记证号码')}>
                {getFieldDecorator('registrationNumber', {
                  initialValue: data.registrationNumber,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.requireInput', {
                      name: intl
                        .get(`${prompt}.field.commercial.registration.certificate.num`)
                        .d('商业登记证号码'),
                    }),
                  }],
                })(<CusInput onBlur={this.checkRegistrationNumber} allowClear disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.partnersName`).d('合伙人姓名')}>
                {getFieldDecorator('partnerName', {
                  initialValue: data.partnerName,
                })(<CusInput allowClear disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.directorsName`).d('董事姓名')}>
                {getFieldDecorator('directorName', {
                  initialValue: data.directorName,
                })(<CusInput allowClear disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.employees.num`).d('聘用职员总数')}>
                {getFieldDecorator('headcount', {
                  initialValue: data.headcount,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prompt}.field.employees.num`).d('聘用职员总数'),
                      }),
                    },
                    {
                      pattern: /^[0-9]*$/,
                      message: intl.get(`${prompt}.field.validation.digital`).d('只能输入数字'),
                    },
                  ],
                })(<CusInput trimAll typeCase="lower" allowClear disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.country`).d('国家')}>
                {getFieldDecorator('country', {
                  initialValue: data.country,
                  rules: [{
                    required: true,
                  }],
                })(<CusLov
                  code={`HPFM.COUNTRY`}
                  style={{ width: '100%' }}
                  textValue={data?.countryMeaning} lovOptions={{ displayField: 'countryName', valueField: 'countryCode' }}
                  disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.order.currency`).d('订单币种')}>
                {getFieldDecorator('orderMoneyType', {
                  initialValue: data.orderMoneyType,
                  rules: [{
                    required: true,
                  }],
                })(<CusLov
                  textValue={data.orderMoneyType}
                  code={`HPFM.CURRENCY`}
                  style={{ width: '100%' }}
                  disabled={(disabled || disabledFlag) && !readOnly}
                />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.credit.period`).d('付款期限')}>
                {getFieldDecorator('prompt', {
                  initialValue: data.prompt,
                  rules: [{
                    required: true,
                  }],
                })(<CusSelect lovCode="HKSP.CREDIT_PERIOD" style={{ width: '100%' }} disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.payment.method`).d('付款办法')}>
                {getFieldDecorator('paymentMethod', {
                  initialValue: data.paymentMethod,
                  rules: [{
                    required: true,
                  }],
                })(<CusSelect lovCode="HKSP.PAYMENT_METHOD" style={{ width: '100%' }} disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.international.regulation`).d('国贸条规')}>
                {getFieldDecorator('deliveryClause', {
                  initialValue: data.deliveryClause,
                  rules: [{
                    required: true,
                  }],
                })(<CusSelect lovCode="HKSP.DELI_TERMS" style={{ width: '100%' }} disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.inclusion.reason`).d('入围原因')}>
                {getFieldDecorator('reason', {
                  initialValue: data.reason,
                  rules: [{
                    required: true,
                    message: intl.get('hzero.common.validation.requireInput', {
                      name: intl.get(`${prompt}.field.inclusion.reason`).d('入围原因'),
                    }),
                  }],
                })(<CusSelect
                  lovCode="HKSP.REASON.REGISTER"
                  style={{ width: '100%' }}
                  disabled={(disabled || disabledFlag) && !readOnly}
                  onChange={e => {
                    data.reason = e;
                  }}
                />
                )}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.inclusion.reasontext`).d('补充入围原因')}>
                {getFieldDecorator('repairReason', {
                  initialValue: data.repairReason,
                })(<CusInput style={{ width: '100%' }} disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            {/*{data.reason === 'Others' && }*/}
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.remark`).d('备注')}>
                {getFieldDecorator('purchaseInfo', {
                  initialValue: data.purchaseInfo,
                })(<CusInput style={{ width: '100%' }} disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
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
                    initialValue: data?.creditScore
                  })(
                      <CusInputNumber
                        min={0}
                        max={100}
                        precision={2}
                        step={0.1}
                        disabled={disabled || disabledFlag}
                        allowClear
                        onChange={(val) => getGrade(val, this.props.form)}
                      />
                    )}
                </Form.Item>
            </Col>
            <Col {...LAYOUT}>
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
                  initialValue: data?.creditRating
                })(
                    <CusSelect
                      allowClear
                      lovCode="HKSP.CRDIT.RAGE"
                      disabled
                    />
                  )}
              </Form.Item>
            </Col>
            {data.isRelatedTrader && <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.relatedtranstparty`).d('是否为关联交易方')}>
                {getFieldDecorator('isRelatedTrader', {
                  initialValue: data.isRelatedTrader,
                })(<CusSelect lovCode="HKSP.SUP_ASSOCIATED_PARTY" style={{ width: '100%' }} disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>}

            {data.liabilityAccount && <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.liabilityaccount`).d('负债账户')}>
                {getFieldDecorator('liabilityAccount', {
                  initialValue: data.liabilityAccount,
                })(<CusInput allowClear disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>}
            {data.dealings && <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.communicatsection`).d('往来段')}>
                {getFieldDecorator('dealings', {
                  initialValue: data.dealings,
                })(<CusInput allowClear disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>}
            {data.isRelatedBudget && <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.controlledbudget`).d('是否关联预算控制')}>
                {getFieldDecorator('isRelatedBudget', {
                  initialValue: data.isRelatedBudget,
                })(<CusSelect lovCode="HKSP.SUP_ASSOBUDG_CON" style={{ width: '100%' }} disabled={(disabled || disabledFlag) && !readOnly} />)}
              </Form.Item>
            </Col>}
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.supmodifystatus`).d('供应商修改状态')}>
                {getFieldDecorator('supModifyState', {
                  initialValue: data.supModifyState,
                })(<CusSelect lovCode="HKSP.SUP_MOD_STATUS" style={{ width: '100%' }} disabled />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.supplier.enableportal`).d('是否启用供应商门户')}>
                {getFieldDecorator('enableSupPortal', {
                  initialValue: data.enableSupPortal,
                })(<CusSelect lovCode="HKSP.SUP_PORTAL_ENABLE" style={{ width: '100%' }} disabled />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.Invaildsupplier`).d('是否失效')}>
                {getFieldDecorator('enableValid', {
                  initialValue: data.enableValid,
                })(<CusSelect lovCode="HKSP.SUP_INVALID" style={{ width: '100%' }} disabled />)}
              </Form.Item>
            </Col>
            {
              data.enableValid === 'Y' &&
              <Col {...LAYOUT}>
                <Form.Item label={intl.get(`${prompt}.field.supplier.Invaildate`).d('失效日期')}>
                  {getFieldDecorator('expireDate', {
                    initialValue: data.expireDate,
                  })(<CusInput allowClear disabled />)}
                </Form.Item>
              </Col>
            }
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.supplier.num`).d('供应商编号')}>
                {getFieldDecorator('supplierNumber', {
                  initialValue: data.supplierNumber,
                })(<CusInput
                  placeholder={intl.get(`${prompt}.field.placeholder.to.be.generated`).d('待系统生成')} allowClear disabled />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.supplier.entry.date`).d('供应商准入日期')}>
                {getFieldDecorator('supplierAccessTime', {
                  initialValue: data.supplierAccessTime,
                })(
                  <CusInput
                    placeholder={intl.get(`${prompt}.field.placeholder.to.be.generated`).d('待系统生成')}
                    allowClear
                    disabled
                  />
                 )}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.supplier.status`).d('供应商状态')}>
                {getFieldDecorator('supplierStatus', {
                  initialValue: data.supplierStatus,
                })(<CusSelect lovCode="HKSP.SUP_STATUS" placeholder={intl.get(`${prompt}.field.placeholder.to.be.generated`).d('待系统生成')} style={{ width: '100%' }} disabled />)}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.status.update.date`).d('状态更新日期')}>
                {getFieldDecorator('statusUpdateTime', {
                  initialValue: data.statusUpdateTime,
                })(
                    <CusInput
                      placeholder={intl.get(`${prompt}.field.placeholder.to.be.generated`).d('待系统生成')}
                      allowClear
                      disabled
                    />
                  )}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.supplier.version`).d('供应商版本')}>
                {getFieldDecorator('supplierVersions', {
                  initialValue: data.supplierVersions,
                })(
                    <CusInput
                      placeholder={intl.get(`${prompt}.field.placeholder.to.be.generated`).d('待系统生成')}
                      allowClear
                      disabled
                    />
                  )}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.version.update.date`).d('版本更新日期')}>
                {getFieldDecorator('versionsUpdateTime', {
                  initialValue: data.versionsUpdateTime,
                })(
                  <CusInput
                    placeholder={intl.get(`${prompt}.field.placeholder.to.be.generated`).d('待系统生成')}
                    allowClear
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.applicant`).d('业务员')}>
                {getFieldDecorator('salesman', {
                  initialValue: data.salesman,
                })(<CusInput allowClear disabled />)}
              </Form.Item>
            </Col>
            {data?.returnDate && (registerState === 'recheck' || registerState === 'manager') && <Col {...LAYOUT}>
              <Form.Item label={intl.get(`${prompt}.field.returnsup.remark`).d('退回供应商意见')}>
                {getFieldDecorator('supplierAccessTime', {
                  initialValue: data.supplierAccessTime,
                })(
                  <CusButton type='plain' onClick={() => this.setState({
                    backInfoFlag: true,
                  })}>
                    {intl.get(`${prompt}.field.returnsup.remark`).d('退回供应商意见')}
                  </CusButton>
                 )}
              </Form.Item>
            </Col>}
          </Row>
        </Form>
        <CusModal
          title={intl.get(`spfmhk.supplier.field.returnremark`).d('退回商户')}
          width={800}
          visible={backInfoFlag}
          destroyOnClose
          onCancel={() => {
            this.setState({
              backInfoFlag: false,
            })
          }}
          // onOk={() => { this.returnPortal() }}
        >
          <CusTable 
            rowKey="returnDate"
            pagination={pagination}
            columns={columns}
            dataSource={dataSource}
            scroll={{ x: tableScrollWidth(columns) }}
            onChange={onChange}
          />
        </CusModal>
      </CusSpin>
    )
  }
}
