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
import CusLov from '_cus_components/CusLov';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusInfoItem from '_cus_components/CusInfoItem';
import { getCurrentUser, getCurrentOrganizationId } from 'utils/utils';
import CusInput from '_cus_components/CusInput';

const gridSpan = getDFormGridSpan();
const { realName, loginName } = getCurrentUser();
const tenantId = getCurrentOrganizationId();
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
      PartnerInformationModal,
      activityCode,
      isType,
    } = this.props;

    const { partnerBase } = PartnerInformationModal;
    console.log('partnerBase', partnerBase, isType);

    // 修改供应商编码逻辑：节点5 || 节点6 && 无供应商编码 && 商盟采购类别包含寄售类
    const isShowSupplierNum =
      partnerBase?.revStatus === 'Approved'
        ? false
        : activityCode === '09' ||
          (activityCode === '10' &&
            !(partnerBase?.supplierModify === 'Y') &&
            partnerBase?.businessCategory?.includes('ConsignmentPart'));
    // 修改客户编码逻辑：节点6 && 商盟采购类别包含客户类
    const isShowCustomerNum =
      partnerBase?.revStatus === 'Approved'
        ? false
        : activityCode === '10' && partnerBase?.businessCategory?.includes('CustomerPart');
    // 修改引入原因逻辑：节点7
    const isShowInviteReason =
      partnerBase?.revStatus === 'Approved' ? false : activityCode === '11';
    // 修改退回后展示字段
    const isReturnFlag =
      partnerBase?.revStatus === 'Approved' || isType == 'companyName'
        ? false
        : partnerBase?.returnMerchantStatus == 'Y';
    return (
      <>
        <Form className="customize-form">
          <GenerateFormGrid isPackUp={false}>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.mylink.field.companyName`).d('公司名称')}>
                {this.props.form.getFieldDecorator('companyName', {
                  initialValue: partnerBase?.companyName,
                  rules: [
                    {
                      required: readyOnly,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.companyName`).d('公司名称'),
                      }),
                    },
                  ],
                })(<Input disabled={!readyOnly} />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.mylink.field.cooperate.mode`).d('合作模式')}>
                {this.props.form.getFieldDecorator('partnerModeValue', {
                  initialValue: partnerBase?.partnerMode,
                  rules: [
                    {
                      required: readyOnly,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.cooperate.mode`).d('合作模式'),
                      }),
                    },
                  ],
                })(
                  <CusLov
                    code="LINK.PART_MODE"
                    textValue={partnerBase?.partnerMode}
                    queryParams={{ tenantId }}
                    lovOptions={{ displayField: 'cooperationMode', valueField: 'modeId' }}
                    disabled={!readyOnly}
                    onChange={(_, item) => {
                      this.props.form.setFieldsValue({
                        partnerModeId: item?.modeId, // 合作模式ID
                        partnerMode: item?.cooperationMode, // 合作模式ID
                      });
                    }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.mylink.field.company.phone`).d('电话号码')}>
                {this.props.form.getFieldDecorator('phoneNumber', {
                  initialValue: partnerBase?.phoneNumber,
                  rules: [
                    {
                      required: readyOnly,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.company.phone`).d('电话号码'),
                      }),
                    },
                  ],
                })(<Input disabled={!readyOnly} />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.mylink.field.company.email`).d('电邮')}>
                {this.props.form.getFieldDecorator('email', {
                  initialValue: partnerBase?.email,
                  rules: [
                    {
                      required: readyOnly,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.company.email`).d('电邮'),
                      }),
                    },
                  ],
                })(<Input disabled={!readyOnly} />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.mylink.field.company.productSer`).d('产品/服务')}>
                {this.props.form.getFieldDecorator('product', {
                  initialValue: partnerBase?.product,
                  rules: [
                    {
                      required: readyOnly,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.company.productSer`).d('产品/服务'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['HKSM.PRODCUT_SERVICE']}
                    disabled={!readyOnly}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.mylink.field.company.br`).d('商业登记证')}>
                {this.props.form.getFieldDecorator('registrationNumber', {
                  initialValue: partnerBase?.registrationNumber,
                  rules: [
                    {
                      required: readyOnly,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.company.br`).d('商业登记证'),
                      }),
                    },
                  ],
                })(<Input disabled={!readyOnly} />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.businessPar.category`).d('商盟伙伴类别')}
                value={partnerBase?.businessCategoryMeaning}
              />
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`spfmhk.mylink.field.company.Registadd`).d('公司注册地址')}
              >
                {this.props.form.getFieldDecorator('registrationAddress', {
                  initialValue: partnerBase?.registrationAddress,
                  rules: [
                    {
                      required: readyOnly,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.company.Registadd`).d('公司注册地址'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['REGISTRATION_ADDRESS']}
                    disabled={!readyOnly}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.mylink.field.access.reason`).d('引入原因')}>
                {this.props.form.getFieldDecorator('inviteReason', {
                  initialValue: partnerBase?.inviteReason,
                  rules: [
                    {
                      required: isShowInviteReason,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.access.reason`).d('引入原因'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['LINK_INVITE.REASON']}
                    disabled={!isShowInviteReason}
                  />
                )}
              </Form.Item>
            </Col>
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
                })(<Input disabled={!isShowSupplierNum} />)}
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
                })(<Input disabled={!isShowCustomerNum} />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <CusInfoItem
                label={intl.get(`spfmhk.mylink.field.partner.code`).d('合作伙伴编码')}
                value={partnerBase?.partnerNum}
              />
            </Col>
            {partnerBase?.ecommerceServiceOrNot === 'Y' && (
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.detail.companyaddress`).d('公司地址')}
                >
                  {this.props.form.getFieldDecorator('companyAddress', {
                    initialValue: partnerBase?.companyAddress,
                    rules: [
                      {
                        required: readyOnly,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`spfmhk.mylink.field.detail.companyaddress`).d('公司地址'),
                        }),
                      },
                    ],
                  })(<Input disabled={!readyOnly} />)}
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
                    rules: [
                      {
                        required: readyOnly,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`spfmhk.mylink.field.detail.businesscategory`)
                            .d('经营品类'),
                        }),
                      },
                    ],
                  })(
                    <CusSelect
                      style={{ width: '100%' }}
                      mode="multiple"
                      allowClear
                      options={idpValueMap['LINK.BUSINESS_CATEGORIES']}
                      disabled={!readyOnly}
                    />
                  )}
                </Form.Item>
              </Col>
            )}
            {partnerBase?.ecommerceServiceOrNot === 'Y' && (
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.portal.suppliertype`).d('供应商类型')}
                >
                  {this.props.form.getFieldDecorator('supplierType', {
                    initialValue: partnerBase?.supplierType,
                    rules: [
                      {
                        required: readyOnly,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`spfmhk.mylink.field.portal.suppliertype`).d('供应商类型'),
                        }),
                      },
                    ],
                  })(
                    <CusSelect
                      style={{ width: '100%' }}
                      allowClear
                      options={idpValueMap['LINK.PARTNER_SUPPLIER_TYPE']}
                      disabled={!readyOnly}
                    />
                  )}
                </Form.Item>
              </Col>
            )}
            {isReturnFlag && (
              <Col span={24}>
                <Form.Item label={intl.get(`spfmhk.mylink.field.merchant.supply`).d('商户补充')}>
                  {this.props.form.getFieldDecorator('merchantRemark', {
                    initialValue: partnerBase?.merchantRemark,
                    rules: [
                      {
                        required: readyOnly,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`spfmhk.mylink.field.merchant.supply`).d('商户补充'),
                        }),
                      },
                    ],
                  })(
                    <CusInput.TextArea
                      autoSize={{ minRows: 3, maxRows: 3 }}
                      maxLength={2000}
                      disabled={!readyOnly}
                      showCharacter
                    />
                  )}
                </Form.Item>
              </Col>
            )}
            {partnerBase?.revStatus === 'Approved' && (
              <Col {...gridSpan}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.detail.terminateNot`).d('是否终止合作')}
                >
                  {this.props.form.getFieldDecorator('terminateOrNot', {
                    initialValue: partnerBase?.terminateOrNot,
                    rules: [
                      {
                        required: readyOnly,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`spfmhk.mylink.field.detail.terminateNot`)
                            .d('是否终止合作'),
                        }),
                      },
                    ],
                  })(
                    <CusSelect
                      style={{ width: '100%' }}
                      allowClear
                      options={idpValueMap['LINK.PARTNER.TERMINATE_OR_NOT']}
                      disabled={!readyOnly}
                    />
                  )}
                </Form.Item>
              </Col>
            )}
            {partnerBase?.revStatus === 'Approved' && (
              <Col span={24}>
                <Form.Item
                  label={intl.get(`spfmhk.mylink.field.detail.terminationreason`).d('终止原因')}
                >
                  {this.props.form.getFieldDecorator('terminationReason', {
                    initialValue: partnerBase?.terminationReason,
                    rules: [
                      {
                        required: readyOnly,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`spfmhk.mylink.field.detail.terminationreason`)
                            .d('终止原因'),
                        }),
                      },
                    ],
                  })(
                    <CusInput.TextArea
                      autoSize={{ minRows: 2, maxRows: 6 }}
                      disabled={!readyOnly}
                    />
                  )}
                </Form.Item>
              </Col>
            )}
            <Col span={24}>
              <Form.Item
                label={intl.get(`spfmhk.mylink.field.product.details`).d('产品/服务详情')}
              >
                {this.props.form.getFieldDecorator('productIntroduction', {
                  initialValue: partnerBase?.productIntroduction,
                  rules: [
                    {
                      required: readyOnly,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfmhk.mylink.field.product.details`)
                          .d('产品/服务详情'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    disabled={!readyOnly}
                    maxLength={500}
                    showCharacter
                  />
                )}
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
                      required: isShowInviteReason,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfmhk.mylink.field.introduce.supply`)
                          .d('引入原因补充'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    disabled={!isShowInviteReason}
                    maxLength={500}
                    showCharacter
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan} style={{ display: 'none' }}>
              <Form.Item label={intl.get(`id`).d('合作模式Id')}>
                {this.props.form.getFieldDecorator('partnerModeId', {
                  initialValue: partnerBase?.partnerModeId,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan} style={{ display: 'none' }}>
              <Form.Item label={intl.get(`name`).d('合作模式name')}>
                {this.props.form.getFieldDecorator('partnerMode', {
                  initialValue: partnerBase?.partnerMode,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
          </GenerateFormGrid>
        </Form>
      </>
    );
  }
}
