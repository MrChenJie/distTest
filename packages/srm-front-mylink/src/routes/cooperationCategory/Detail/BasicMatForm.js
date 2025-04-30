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
import { getCurrentUser } from 'utils/utils';
import CusInput from '_cus_components/CusInput';

const gridSpan = getDFormGridSpan();
const { realName, loginName } = getCurrentUser();
@Form.create({ fieldNameProp: null })
export default class BasicMatForm extends React.PureComponent {
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
      cooperationCategoryModal,
      activityCode,
      state,
    } = this.props;

    const { partnerBase } = cooperationCategoryModal;
    console.log('partnerBase', partnerBase);

    // 修改供应商编码逻辑：节点5 || 节点6 && 无供应商编码 && 商盟采购类别包含寄售类
    const isShowSupplierNum =
      activityCode === '09' ||
      (activityCode === '10' &&
        !(partnerBase?.supplierModify === 'Y') &&
        partnerBase?.businessCategory?.includes('ConsignmentPart'));
    // 修改客户编码逻辑：节点6 && 商盟采购类别包含客户类
    const isShowCustomerNum =
      activityCode === '10' && partnerBase?.businessCategory?.includes('CustomerPart');

    const flag =
      (partnerBase?.applyStatus && partnerBase?.applyStatus == 'Approved') || state == 'DONE';

    return (
      <>
        <Form className="customize-form">
          <GenerateFormGrid isPackUp={false}>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.companyName`).d('公司名称')}
                value={partnerBase?.companyName}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.company.phone`).d('电话号码')}
                value={partnerBase?.phoneNumber}
              />
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.mylink.field.businessPar.categorybefore`).d('变更前商盟伙伴类别')}
              >
                {this.props.form.getFieldDecorator('sourceBusinessCategory', {
                  initialValue: partnerBase?.sourceBusinessCategory?.split(','),
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    disabled
                    mode="multiple"
                    options={idpValueMap['HKSM.BENEFIT_PARTNER.CATEGORY']}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.mylink.field.businessPar.categoryafter`).d('变更后商盟伙伴类别')}
              >
                {this.props.form.getFieldDecorator('businessCategory', {
                  initialValue: partnerBase?.businessCategory?.split(','),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.businessPar.categoryafter`).d('变更后商盟伙伴类别'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    disabled={readyOnly || flag}
                    mode="multiple"
                    options={idpValueMap['HKSM.BENEFIT_PARTNER.CATEGORY']}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.company.email`).d('电邮')}
                value={partnerBase?.email}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.company.br`).d('商业登记证')}
                value={partnerBase?.registrationNumber}
              />
            </Col>
            {/* <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.businessPar.category`).d('商盟伙伴类别')}
                value={partnerBase?.businessCategoryMeaning}
              />
            </Col> */}
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.company.Registadd`).d('公司注册地址')}
                value={partnerBase?.registrationAddressMeaning}
              />
            </Col>
            {partnerBase?.ecommerceServiceOrNot === 'Y' && (
              <Col {...gridSpan}>
                <CusInfoItem
                  label={intl.get(`spfmhk.mylink.field.detail.companyaddress`).d('公司地址')}
                  value={partnerBase?.companyAddress}
                />
              </Col>
            )}
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.cooperate.mode`).d('合作模式')}
                value={partnerBase?.partnerMode}
              />
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.company.productSer`).d('产品/服务')}
                value={partnerBase?.productMeaning}
              />
            </Col>
            {partnerBase?.ecommerceServiceOrNot === 'Y' && (
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.portal.suppliertype`).d('供应商类型')}
                >
                  {this.props.form.getFieldDecorator('supplierType', {
                    initialValue: partnerBase?.supplierType,
                  })(
                    <CusSelect
                      style={{ width: '100%' }}
                      allowClear
                      options={idpValueMap['LINK.PARTNER_SUPPLIER_TYPE']}
                      disabled
                    />
                  )}
                </Form.Item>
              </Col>
            )}
            {partnerBase?.ecommerceServiceOrNot === 'Y' && (
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.detail.businesscategory`).d('经营品类')}
                >
                  {this.props.form.getFieldDecorator('businessCategories', {
                    initialValue: partnerBase?.businessCategories
                      ? partnerBase?.businessCategories?.split(',')
                      : [],
                  })(
                    <CusSelect
                      style={{ width: '100%' }}
                      mode="multiple"
                      allowClear
                      options={idpValueMap['LINK.BUSINESS_CATEGORIES']}
                      disabled
                    />
                  )}
                </Form.Item>
              </Col>
            )}
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.mylink.field.supplier.code`).d('供应商编码')}>
                {this.props.form.getFieldDecorator('supplierNum', {
                  initialValue: partnerBase?.supplierNum,
                  rules: [
                    {
                      required: isShowSupplierNum,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.supplier.code`).d('供应商编码'),
                      }),
                    },
                  ],
                })(<Input disabled={!isShowSupplierNum || flag} />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.mylink.field.custom.code`).d('客户编码')}>
                {this.props.form.getFieldDecorator('customerNum', {
                  initialValue: partnerBase?.customerNum,
                  rules: [
                    {
                      required: isShowCustomerNum,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.custom.code`).d('客户编码'),
                      }),
                    },
                  ],
                })(<Input disabled={!isShowCustomerNum || flag} />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.mylink.field.access.reason`).d('引入原因')}>
                {this.props.form.getFieldDecorator('inviteReason', {
                  initialValue: partnerBase?.inviteReason,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.access.reason`).d('引入原因'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    disabled={readyOnly || flag}
                    options={idpValueMap['LINK_INVITE.REASON']}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.partner.code`).d('合作伙伴编码')}
                value={partnerBase?.partnerNum}
              />
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.mylink.field.detail.terminateNot`).d('是否终止合作')}
              >
                {this.props.form.getFieldDecorator('terminateOrNot', {
                  initialValue: partnerBase?.terminateOrNot,
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['LINK.PARTNER.TERMINATE_OR_NOT']}
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl.get(`spfmhk.mylink.field.detail.terminationreason`).d('终止原因')}
              >
                {this.props.form.getFieldDecorator('terminationReason', {
                  initialValue: partnerBase?.terminationReason,
                })(<CusInput.TextArea autoSize={{ minRows: 2, maxRows: 6 }} disabled />)}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl.get(`spfmhk.mylink.field.product.details`).d('产品/服务详情')}
              >
                {this.props.form.getFieldDecorator('productIntroduction', {
                  initialValue: partnerBase?.productIntroduction,
                })(<CusInput.TextArea autoSize={{ minRows: 2, maxRows: 6 }} disabled />)}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl.get(`spfmhk.mylink.field.introduce.supply`).d('引入原因补充')}
              >
                {this.props.form.getFieldDecorator('inviteReasonSup', {
                  initialValue: partnerBase?.inviteReasonSup,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.introduce.supply`).d('引入原因补充'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    maxLength={500}
                    showCharacter
                    disabled={readyOnly || flag}
                  />
                )}
              </Form.Item>
            </Col>
          </GenerateFormGrid>
        </Form>
      </>
    );
  }
}
