import React from 'react';
import { Col, Input } from 'antd';
import intl from 'utils/intl';
import { getLFormGridSpan } from '_cus_utils/utils';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import GenerateSearchFormGrid from '_cus_utils/generate/GenerateSearchFormGrid';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import CusDatePicker from '_cus_components/CusDatePicker';
import moment from 'moment';
import { Form } from 'hzero-ui';

const gridSpan = getLFormGridSpan();
const tenantId = getCurrentOrganizationId();
const commonPrompt = 'spfmhk.dict';
@Form.create()
export default class LegalData extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  handleReset = () => {
    this.form.current?.resetFields();
  };

  render() {
    const {
      idpValueMap,
      form,

      partnerInfo = {},
    } = this.props;

    const { getFieldDecorator } = form;
    return (
      <>
        <div className="customize-form">
          <Form ref={this.form}>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.companynameen`).d('公司名称(英文)')}
                name="cmpanyNameEn"
              >
                {getFieldDecorator('cmpanyNameEn', {
                  initialValue: partnerInfo.cmpanyNameEn,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.requireInput', {
                        name: intl
                          .get(`${commonPrompt}.view.field.companynameen`)
                          .d('公司名称(英文)'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.companynamecn`).d('公司名称(中文)')}
                name="cmpanyNameCh"
              >
                {getFieldDecorator('cmpanyNameCh', {
                  initialValue: partnerInfo.cmpanyNameCh,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.requireInput', {
                        name: intl
                          .get(`${commonPrompt}.view.field.cmpanyNameCh`)
                          .d('公司名称(中文)'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.adressen`).d('公司地址(英文)')}
                name="addressEn"
              >
                {getFieldDecorator('addressEn', {
                  initialValue: partnerInfo.addressEn,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.requireInput', {
                        name: intl.get(`${commonPrompt}.view.field.adressen`).d('公司地址(英文)'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.adresscn`).d('公司地址(中文)')}
                name="addressCh"
              >
                {getFieldDecorator('addressCh', {
                  initialValue: partnerInfo.addressCh,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.requireInput', {
                        name: intl.get(`${commonPrompt}.view.field.adresscn`).d('公司地址(中文)'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.portaltelno`).d('电话号码')}
                name="phone"
              >
                {getFieldDecorator('phone', {
                  initialValue: partnerInfo.phone,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.requireInput', {
                        name: intl.get(`${commonPrompt}.view.field.portaltelno`).d('电话号码'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.portalfaxno`).d('传真号码')}
                name="fax"
              >
                {getFieldDecorator('fax', {
                  initialValue: partnerInfo.fax,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.requireInput', {
                        name: intl.get(`${commonPrompt}.view.field.portalfaxno`).d('传真号码'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.portalemail`).d('电邮')}
                name="email"
              >
                {getFieldDecorator('email', {
                  initialValue: partnerInfo.email,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.requireInput', {
                        name: intl.get(`${commonPrompt}.view.field.portalemail`).d('电邮'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.portalweb`).d('公司网址')}
                name="websiteUrl"
              >
                {getFieldDecorator('websiteUrl', {
                  initialValue: partnerInfo.websiteUrl,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.requireInput', {
                        name: intl.get(`${commonPrompt}.view.field.portalweb`).d('公司网址'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.common.companytype`).d('公司类型')}
                name="companyType"
              >
                {getFieldDecorator('companyType', {
                  initialValue: partnerInfo.companyType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.requireInput', {
                        name: intl.get(`${commonPrompt}.view.common.companytype`).d('公司类型'),
                      }),
                    },
                  ],
                })(
                  <CusSelect options={idpValueMap['HKSP.COMPANY_TYPE']} lazyLoad={false} disabled />
                )}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="supplyOf"
                label={intl.get(`${commonPrompt}.view.common.suppliedgoods`).d('供应商品/服务')}
              >
                {getFieldDecorator('supplyOf', {
                  initialValue: partnerInfo.supplyOf,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.requireInput', {
                        name: intl
                          .get(`${commonPrompt}.view.common.suppliedgoods`)
                          .d('供应商品/服务'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="companyCategory"
                label={intl.get(`${commonPrompt}.view.field.portalcompanycategory`).d('公司类别')}
              >
                {getFieldDecorator('companyCategory', {
                  initialValue: partnerInfo.companyCategory,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.requireSelect', {
                        name: intl
                          .get(`${commonPrompt}.view.field.portalcompanycategory`)
                          .d('公司类别'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    options={idpValueMap['HKSP.COMPANY_CATEG']}
                    lazyLoad={false}
                    disabled
                    style={{ width: '100%' }}
                  />
                )}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="businessNature"
                label={intl.get(`${commonPrompt}.view.field.portalbusinessnature`).d('业务性质')}
              >
                {getFieldDecorator('businessNature', {
                  initialValue: partnerInfo.businessNature,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.requireSelect', {
                        name: intl
                          .get(`${commonPrompt}.view.field.portalbusinessnature`)
                          .d('业务性质'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="establishmentDate"
                label={intl
                  .get(`${commonPrompt}.view.field.portalestablishmentdate`)
                  .d('公司成立日期')}
              >
                {getFieldDecorator('establishmentDate', {
                  initialValue: partnerInfo.establishmentDate
                    ? moment(partnerInfo.establishmentDate)
                    : undefined,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.requireSelect', {
                        name: intl
                          .get(`${commonPrompt}.view.field.portalestablishmentdate`)
                          .d('公司成立日期'),
                      }),
                    },
                  ],
                })(<CusDatePicker disabled />)}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="establishmentPlaceMeaning"
                label={intl
                  .get(`${commonPrompt}.view.field.portalcompanylocation`)
                  .d('公司注册地址')}
              >
                {getFieldDecorator('establishmentPlaceMeaning', {
                  initialValue: partnerInfo.establishmentPlaceMeaning,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.requireInput', {
                        name: intl
                          .get(`${commonPrompt}.view.field.portalcompanylocation`)
                          .d('公司注册地址'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="businessRegistration"
                label={intl.get(`${commonPrompt}.view.field.portalbr`).d('商业登记证号码')}
              >
                {getFieldDecorator('businessRegistration', {
                  initialValue: partnerInfo.businessRegistration,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.requireInput', {
                        name: intl.get(`${commonPrompt}.view.field.portalbr`).d('商业登记证号码'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="companyParnter"
                label={intl.get(`${commonPrompt}.view.field.portalpartnername`).d('合伙人姓名')}
              >
                {getFieldDecorator('companyParnter', {
                  initialValue: partnerInfo.companyParnter,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.requireInput', {
                        name: intl
                          .get(`${commonPrompt}.view.field.portalpartnername`)
                          .d('合伙人姓名'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="directorName"
                label={intl.get(`${commonPrompt}.view.field.portaldirectors`).d('董事姓名')}
              >
                {getFieldDecorator('directorName', {
                  initialValue: partnerInfo.directorName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.requireInput', {
                        name: intl.get(`${commonPrompt}.view.field.portaldirectors`).d('董事姓名'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="employeesCount"
                label={intl.get(`${commonPrompt}.view.field.portalemployeeno`).d('聘用职员总数')}
              >
                {getFieldDecorator('employeesCount', {
                  initialValue: partnerInfo.employeesCount,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.requireInput', {
                        name: intl
                          .get(`${commonPrompt}.view.field.portalemployeeno`)
                          .d('聘用职员总数'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item  label={intl.get(`${commonPrompt}.view.field.partner.code`).d('合作伙伴编号')} name="partnerNum">
                {getFieldDecorator('partnerNum', {
                  initialValue: partnerInfo.partnerNum,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.cooperationmode`).d('合作模式')}
                name="collaborationMode"
              >
                {getFieldDecorator('startAppraisalWay', {
                  initialValue: partnerInfo.collaborationMode,
                })(
                  <Input disabled />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item  label={intl.get(`${commonPrompt}.view.field.supplier.code`).d('供应商编号')} name="supplierNumber">
                {getFieldDecorator('supplierNumber', {
                  initialValue: partnerInfo.supplierNumber,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get(`${commonPrompt}.view.field.common.supplieraccessdate`).d('供应商准入日期')} name="supplierAccessTime">
                {getFieldDecorator('psupplierAccessTime', {
                  initialValue: partnerInfo.supplierAccessTime?.slice(0,10),
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get(`${commonPrompt}.view.field.common.supplierversion`).d('供应商版本')} name="supplierVersions">
                {getFieldDecorator('supplierVersions', {
                  initialValue: partnerInfo.supplierVersions,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get(`${commonPrompt}.view.field.common.versionupdatedate`).d('版本更新日期')} name="versionsUpdateTime">
                {getFieldDecorator('versionsUpdateTime', {
                  initialValue: partnerInfo.versionsUpdateTime?.slice(0,10),
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get(`${commonPrompt}.view.field.common.statusupdatedate`).d('状态更新日期')}  name="statusUpdateTime">
                {getFieldDecorator('statusUpdateTime', {
                  initialValue: partnerInfo.statusUpdateTime?.slice(0,10),
                })(<Input disabled />)}
              </Form.Item>
            </Col>
          </Form>
        </div>
      </>
    );
  }
}
