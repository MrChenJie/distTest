import React, { PureComponent, Fragment } from 'react';
import { getLFormGridSpan } from 'srm-front-common/lib/utils/utils';
import intl from 'utils/intl';
import { Col, Row,  } from 'antd';
import { Form } from 'hzero-ui';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusLov from '_cus_components/CusLov';
import Checkbox from 'components/Checkbox';


import formatterCollections from 'utils/intl/formatterCollections';
import { getDateFormat } from 'utils/utils';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';
import dayjs from 'dayjs';

const prompt = 'spfmhk.supplier';
@Form.create()
@formatterCollections({ code: [prompt] })
export default class SupplierBasicInfoForm extends PureComponent {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  // 重置表单
  @Bind()
  handleResetBtnClick(e) {
    e.preventDefault();
    const { form } = this.props;
    form.resetFields();
  }

  // 查询
  @Bind()
  handleSearchBtnClick(e) {
    e.preventDefault();
    const { form, onSearch } = this.props;
    form.validateFields((error, values) => {
      if(!error){
        onSearch(values);
      }
    })
  }


  render() {
    const { form: { getFieldDecorator } } = this.props;
    const gridSpan = getLFormGridSpan();

    return (
      <Fragment>
        <div className="customize-form">
          <Form className="customize-form">
            <Row>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.company.name.en`).d('公司名称（英文）')}>
                  {getFieldDecorator('companyNameEn', {
                    required: true
                  })(<CusInput trimAll typeCase="lower" allowClear/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.company.name.cn`).d('公司名称（中文）')}>
                  {getFieldDecorator('companyNameCn', {
                    required: true
                  })(<CusInput trimAll typeCase="lower" allowClear/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.address.cn`).d('地址（中文）')}>
                  {getFieldDecorator('addressCn', {
                    required: true
                  })(<CusInput trimAll typeCase='lower' allowClear />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.address.en`).d('地址（英文）')}>
                  {getFieldDecorator('addressEn', {
                    required: true
                  })(<CusInput trimAll typeCase="lower" allowClear/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.telNo`).d('电话号码')}>
                  {getFieldDecorator('telNo', {
                    required: true
                  })(<CusInput trimAll typeCase="lower" allowClear/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.faxNo`).d('传真号码')}>
                  {getFieldDecorator('faxNo', {
                    required: true
                  })(<CusInput trimAll typeCase="lower" allowClear/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.email`).d('电邮')}>
                  {getFieldDecorator('email', {
                    required: true
                  })(<CusInput trimAll typeCase="lower" allowClear/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.web`).d('公司网址')}>
                  {getFieldDecorator('web', {
                    required: true
                  })(<CusInput trimAll typeCase="lower" allowClear/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.company.type`).d('公司类型')}>
                  {getFieldDecorator('companyType', {
                    required: true
                  })(<CusSelect style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.supplyOfGoodsServices`).d('供应货品/服务')}>
                  {getFieldDecorator('supplyOfGoodsServices', {
                    required: true
                  })(<CusInput trimAll typeCase='lower' allowClear />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.company.category`).d('公司类别')}>
                  {getFieldDecorator('companyCategory', {
                    required: true
                  })(<CusSelect style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.business.nature`).d('业务性质')}>
                  {getFieldDecorator('companyNature')(<CusSelect style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.supplier.category`).d('供应商类别')}>
                  {getFieldDecorator('supplierCategory')(<CusSelect style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.supplier.product.categories`).d('供应商产品类别')}>
                  {getFieldDecorator('supplierProductCategories', {
                    required: true
                  })(<CusSelect style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.establishment.date`).d('公司成立日期')}>
                  {getFieldDecorator('establishmentDate', {
                    required: true
                  })(<CusDatePicker format={getDateFormat()} style={{ width: '100%' }}
                                    disabledDate={(currentDate) => {
                                      return (currentDate && currentDate.isAfter(dayjs()))
                                    }}
                  />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.company.location`).d('公司成立地点')}>
                  {getFieldDecorator('companyLocation', {
                    required: true
                  })(<CusInput trimAll typeCase="lower" allowClear/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.commercial.registration.certificate.num`).d('商业登记证号码')}>
                  {getFieldDecorator('commercialRegistrationCertificateNum', {
                    required: true
                  })(<CusInput trimAll typeCase="lower" allowClear/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.country`).d('国家')}>
                  {getFieldDecorator('country', {
                    required: true
                  })(<CusLov style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.order.currency`).d('订单币种')}>
                  {getFieldDecorator('orderCurrency', {
                    required: true
                  })(<CusLov style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.credit.period`).d('付款期限')}>
                  {getFieldDecorator('creditPeriod', {
                    required: true
                  })(<CusSelect style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.payment.method`).d('付款办法')}>
                  {getFieldDecorator('paymentMethod', {
                    required: true
                  })(<CusSelect style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.international.regulation`).d('国贸条规')}>
                  {getFieldDecorator('internationalRegulation', {
                    required: true
                  })(<CusSelect style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.applicant`).d('业务员')}>
                  {getFieldDecorator('applicant', {
                    required: true
                  })(<CusInput trimAll typeCase="lower" allowClear/>)}
                </Form.Item>
              </Col>

              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.supplier.num`).d('供应商编号')}>
                  {getFieldDecorator('supplierNum')(<CusInput trimAll typeCase="lower" allowClear disabled/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.supplier.entry.date`).d('供应商准入日期')}>
                  {getFieldDecorator('supplierEntryDate')(<CusInput trimAll typeCase="lower" allowClear disabled/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.supplier.version`).d('供应商版本')}>
                  {getFieldDecorator('supplierVersion')(<CusInput trimAll typeCase="lower" allowClear disabled/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.version.update.date`).d('版本更新日期')}>
                  {getFieldDecorator('versionUpdateDate')(<CusInput trimAll typeCase="lower" allowClear disabled/>)}
                </Form.Item>
              </Col>
              <Col {...gridSpan}>
                <Form.Item label={intl.get(`${prompt}.basic.info.ebs.code`).d('EBS编码')}>
                  {getFieldDecorator('ebsCode')(<CusInput trimAll typeCase="lower" allowClear disabled/>)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Fragment>
    )
  }

}
