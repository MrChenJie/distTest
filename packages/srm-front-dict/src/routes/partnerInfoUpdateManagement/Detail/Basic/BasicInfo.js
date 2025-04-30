/**
 * 合作伙伴信息更新
 * @Author: qi.xue01@hand-china.com
 * @Date: 2024/11/3
 * @Copyright: Copyright (c), 2024, hand
 */
import React from 'react';
import { Row, Col } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusInput from '_cus_components/CusInput';
import { getDateFormat } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import dayjs from 'dayjs';

const prompt = 'spfmhk.dict';

@Form.create()
@formatterCollections({ code: [prompt] })
export default class BasicForm extends React.PureComponent {
  constructor(props) {
    super(props);
    props?.onRef(this);
  }

  render() {
    const {
      form,
      readOnly = false,
      idpValueMap,
      basicValues,
      isSupplier,
    } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form className="customize-form">
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.companynameen`).d('公司名称（英文）')}>
              {getFieldDecorator('cmpanyNameEn', {
                initialValue: basicValues?.cmpanyNameEn,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.field.companynameen`).d('公司名称（英文）'),
                    }),
                  },
                ],
              })(<CusInput disabled={readOnly || isSupplier} />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.companynamecn`).d('公司名称（中文）')}>
              {getFieldDecorator('cmpanyNameCh', {
                initialValue: basicValues?.cmpanyNameCh,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.field.companynamecn`).d('公司名称（中文）'),
                    }),
                  },
                ],
              })(<CusInput disabled={readOnly || isSupplier} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.adressen`).d('地址（英文）')}>
              {getFieldDecorator('addressEn', {
                initialValue: basicValues?.addressEn,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.field.adressen`).d('地址（英文）'),
                    }),
                  },
                ],
              })(<CusInput.TextArea
                autoSize={{ minRows: 2, maxRows: 6 }}
                disabled={readOnly || isSupplier} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.adresscn`).d('地址（中文）')}>
              {getFieldDecorator('addressCh', {
                initialValue: basicValues?.addressCh,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.field.adresscn`).d('地址（中文）'),
                    }),
                  },
                ],
              })(<CusInput.TextArea
                autoSize={{ minRows: 2, maxRows: 6 }}
                disabled={readOnly || isSupplier} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.portaltelno`).d('电话号码')}>
              {getFieldDecorator('phone', {
                initialValue: basicValues?.phone,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.field.portaltelno`).d('电话号码'),
                    }),
                  },
                ],
              })(<CusInput disabled={readOnly || isSupplier} />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.portalfaxno`).d('传真号码')}>
              {getFieldDecorator('fax', {
                initialValue: basicValues?.fax,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.field.portalfaxno`).d('传真号码'),
                    }),
                  },
                ],
              })(<CusInput disabled={readOnly || isSupplier} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.portalemail`).d('电邮')}>
              {getFieldDecorator('email', {
                initialValue: basicValues?.email,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.field.portalemail`).d('电邮'),
                    }),
                  },
                ],
              })(<CusInput disabled={readOnly || isSupplier} />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.portalweb`).d('公司网址')}>
              {getFieldDecorator('websiteUrl', {
                initialValue: basicValues?.websiteUrl,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.field.portalweb`).d('公司网址'),
                    }),
                  },
                ],
              })(<CusInput disabled={readOnly || isSupplier} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.common.companytype`).d('公司类型')}>
              {getFieldDecorator('companyType', {
                initialValue: basicValues?.companyType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.common.companytype`).d('公司类型'),
                    }),
                  },
                ],
              })(<CusSelect options={idpValueMap['HKSP.COMPANY_TYPE']} disabled={readOnly || isSupplier} />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={intl.get(`spfmhk.dict.view.field.partnerInfoUpdate.supplyFoodsOrServices`).d('供应货品/服务')}>
              {getFieldDecorator('supplyOf', {
                initialValue: basicValues?.supplyOf,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.field.partnerInfoUpdate.supplyFoodsOrServices`).d('供应货品/服务'),
                    }),
                  },
                ],
              })(<CusInput disabled={readOnly || isSupplier} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.portalcompanycategory`).d('公司类别')}>
              {getFieldDecorator('companyCategory', {
                initialValue: basicValues?.companyCategory,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.field.portalcompanycategory`).d('公司类别'),
                    }),
                  },
                ],
              })(<CusSelect options={idpValueMap['HKSP.COMPANY_CATEG']} disabled={readOnly || isSupplier} />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.portalbusinessnature`).d('业务性质')}>
              {getFieldDecorator('businessNature', {
                initialValue: basicValues?.businessNature,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.field.portalbusinessnature`).d('业务性质'),
                    }),
                  },
                ],
              })(<CusInput disabled={readOnly || isSupplier} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.portalestablishmentdate`).d('公司成立日期')}>
              {getFieldDecorator('establishmentDateStr', {
                initialValue: basicValues?.establishmentDateStr ? dayjs(basicValues?.establishmentDateStr) : dayjs(basicValues?.establishmentDate),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.field.portalestablishmentdate`).d('公司成立日期'),
                    }),
                  },
                ],
              })(<CusDatePicker
                format={getDateFormat()}
                style={{ width: '100%' }}
                disabledDate={(currentDate) => {
                  return (currentDate && currentDate.isAfter(dayjs()));
                }}
                disabled={readOnly || isSupplier} />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.portalcompanylocation`).d('公司注册地址')}>
              {getFieldDecorator('establishmentPlace', {
                initialValue: basicValues?.establishmentPlace,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.field.portalcompanylocation`).d('公司注册地址'),
                    }),
                  },
                ],
              })(<CusSelect disabled={readOnly || isSupplier}
                            lovCode="REGISTRATION_ADDRESS"
              />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.portalbr`).d('商业登记证号码')}>
              {getFieldDecorator('businessRegistration', {
                initialValue: basicValues?.businessRegistration,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.field.portalbr`).d('商业登记证号码'),
                    }),
                  },
                ],
              })(<CusInput disabled />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.portalpartnername`).d('合伙人姓名')}>
              {getFieldDecorator('companyParnter', {
                initialValue: basicValues?.companyParnter,
              })(<CusInput disabled={readOnly || isSupplier} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.portaldirectors`).d('董事姓名')}>
              {getFieldDecorator('directorName', {
                initialValue: basicValues?.directorName,
              })(<CusInput disabled={readOnly || isSupplier} />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.portalemployeeno`).d('聘用职员总数')}>
              {getFieldDecorator('employeesCount', {
                initialValue: basicValues?.employeesCount,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.dict.view.field.portalemployeeno`).d('聘用职员总数'),
                    }),
                  },
                ],
              })(<CusInput disabled={readOnly || isSupplier} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.partner.status`).d('合作伙伴状态')}>
              {getFieldDecorator('partnerStorageStatus', {
                initialValue: basicValues?.partnerStorageStatus,
              })(<CusSelect disabled
                            lovCode="DICT.PARTNER_STATUS"
              />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.common.partnercategory`).d('合作伙伴类别')}>
              {getFieldDecorator('partnerCategory', {
                initialValue: basicValues?.partnerCategory,
              })(<CusSelect disabled
                            lovCode="LINK.PARTNER_CATEGORY"
              />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.common.statusupdatedate`).d('状态更新日期')}>
              {getFieldDecorator('statusUpdateTime', {
                initialValue: basicValues?.statusUpdateTime,
              })(<CusInput disabled />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.common.supplieraccessdate`).d('供应商准入日期')}>
              {getFieldDecorator('supplierAccessTime', {
                initialValue: basicValues?.supplierAccessTime,
              })(<CusInput disabled />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.common.supplierversion`).d('供应商版本')}>
              {getFieldDecorator('supplierVersions', {
                initialValue: basicValues?.supplierVersions,
              })(<CusInput disabled />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={intl.get(`spfmhk.dict.view.field.common.versionupdatedate`).d('版本更新日期')}>
              {getFieldDecorator('versionsUpdateTime', {
                initialValue: basicValues?.versionsUpdateTime,
              })(<CusInput disabled />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
