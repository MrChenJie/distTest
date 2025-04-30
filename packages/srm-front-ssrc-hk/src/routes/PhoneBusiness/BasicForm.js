/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-15 09:47:05
 * Copyright (c) 2024, All Rights Reserved.
 */
import React from 'react';
import { Col, Input } from 'antd';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import dayjs from 'dayjs';
import { filter, isEmpty, map } from 'lodash';
import uuidv4 from 'uuid/v4';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusModal from '_cus_components/CusModal';
import CusInput from '_cus_components/CusInput';
import CusInputNumber from '_cus_components/CusInputNumber';
import CusNotification from '_cus_components/CusNotification';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import UploadList from '@/components/uploadList';
import { getDFormGridSpan } from '_cus_utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getCurrentUser, getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';
import searchIcon from '@/assets/searchIcon.svg';
import "./index.less";
import PlanList from './PlanList';

const promptCode = 'HKPC.commom';
const gridSpan = getDFormGridSpan();
const { id } = getCurrentUser();
const tenantId = getCurrentOrganizationId();
const language = getCurrentLanguage();
@Form.create()
export default class BasicForm extends React.PureComponent {
  constructor(props) {
    super(props);
    props?.onRef(this);
    this.state = {
      stateAttachmentUUID: uuidv4(),
      planModalVisible: false,
      planLoading: true,
    }
  }

  handleSearch = () => {
    const { dispatch, form } = this.props;
    const org_code = form.getFieldValue('unitCode');
    dispatch({
      type: 'phoneBusinessListModal/getPlanNameList',
      payload: {
        org_code,
      }
    }).then((res) => {
      if(res) {
        const { content = [] } = res;
        const newDataSource = content.map((item) => ({
          ...item,
          rowKey: uuidv4(),
          _status: 'update',
        }));
        this.setState({
          planLoading: false,
        })
        dispatch({
          type: 'phoneBusinessListModal/updateState',
          payload: {
            planDataSource: newDataSource,
          }
        })
      }
    })
  }

  searchButton = () => {
    return (
      <img
        src={searchIcon}
        alt="searchIcon"
        style={{ cursor: 'pointer', color: '#666' }}
        onClick={() => this.onSearchBtnClick()}
      />
    );
  }

  onSearchBtnClick = () => {
    this.handleSearch();
    this.setState({
      planModalVisible: true,
    })
  }

  onChangeRows = (item) => {
    this.setState({
      rowItem: item,
    })
  }

  handlePlanName = () => {
    const { form, dispatch } = this.props;
    const { rowItem } = this.state;
    const item = rowItem.pop();
    if (isEmpty(item)) {
      CusNotification.warning({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据')
      })
    } else {
      form.setFieldsValue({
        planName: item?.plan_header_name, // 计划名称
        planNumber: item?.plan_header_number, // 计划编号
        planRemainAmount: item?.availble_amount, // 计划剩余金额
      })
      this.setState({
        planModalVisible: false,
      })
      dispatch({
        type: 'phoneBusinessListModal/updateState',
        payload: {
          brandList: map(item?.line, 'product_code').join(','), // 品牌
        }
      })
    }
  }

  render() {
    const {
      form,
      readyOnly = false,
      dispatch,
      idpValueMap,
      headerInfo,
      phoneBusinessListModal,
    } = this.props;
    const { stateAttachmentUUID, planModalVisible, planLoading } = this.state;
    const {
      estimatedBudgetAmountHkd,
      applyUserDepName,
      applyUserPhone,
      employeeNum,
      purchaseInformationDetailSource,
    } = phoneBusinessListModal;
    console.log('this.props', this.props);

    const suffix = (
      <>
        <div
          className="cus-lov-clear"
        />
        {this.searchButton()}
      </>
    );

    const fileListProps = {
      ...this.props,
      bucketName: 'pr-apply',
      // attachmentUUID: uuid,
      tenantId: getCurrentOrganizationId(),
    };

    const planListProps = {
      ...this.props,
      planLoading,
      onChangeRows: this.onChangeRows,
    }
    const { getFieldDecorator } = form;

    console.log('headerInfo', headerInfo);
    

    return (
      <div className="customize-form">
        <Form>
          <GenerateFormGrid isPackUp={true} defaultPackUp={false}>
            {['salesbusinessproduct'].includes(headerInfo?.prType) && <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.associateframe`).d('是否关联框架')}>
                {getFieldDecorator('isAssociatedAgreement', {
                  initialValue: headerInfo?.isAssociatedAgreement,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.associateframe`)
                          .d('是否关联框架'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    options={idpValueMap['CMHK.Y_N']}
                    lazyLoad={false}
                    allowClear
                    disabled={readyOnly}
                    onChange={(value) => {
                      headerInfo.isAssociatedAgreement = value;
                      headerInfo.associatedAgreement = '';
                      dispatch({
                        type: 'phoneBusinessListModal/updateState',
                        payload: {
                          purchaseInformationDetailSource: [],
                          associatedAgreementEbs: '',
                          associatedAgreement: '',
                        }
                      })
                    }}
                  />
                )}
              </Form.Item>
            </Col>}
            {headerInfo?.isAssociatedAgreement === 'Y' && ['salesbusinessproduct'].includes(headerInfo?.prType) && (
              <Col {...gridSpan}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.view.title.Frameworkprotocolencoding`)
                    .d('框架协议编号')}
                >
                  {getFieldDecorator('associatedAgreement', {
                    initialValue: headerInfo?.associatedAgreement,
                    rules: [
                      {
                        required: headerInfo?.isAssociatedAgreement === 'Y',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`${promptCode}.view.title.Frameworkprotocolencoding`)
                            .d('框架协议编号'),
                        }),
                      },
                    ],
                  })(
                    <CusLov
                      code="CMHK.API.FRAME"
                      queryParams={{ tenantId }}
                      textValue={headerInfo?.associatedAgreement}
                      disabled={readyOnly}
                      lovOptions={{ displayField: 'frameworkCode', valueField: 'frameworkCode' }}
                      onChange={(_, lovData) => {
                        console.log(lovData, 'lovData');
                        dispatch({
                          type: 'phoneBusinessListModal/updateState',
                          payload: {
                            associatedAgreement: lovData.frameworkCode,
                            associatedAgreementEbs: lovData.ebs,
                            purchaseInformationDetailSource: [],
                          },
                        });
                        form.setFieldsValue({
                          unitPriceControl: lovData.unitPriceControl === 'Y' ? 'yes' : 'no',
                          ebs: lovData.ebs,
                        })
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
            )}
            {['salesbusinessproduct'].includes(headerInfo?.prType) && <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.contractno`).d('合同系统编号')}
              >
                {getFieldDecorator('contractNumber', {
                  initialValue: headerInfo?.contractNumber,
                  rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${promptCode}.view.title.contractno`).d('合同系统编号'),
                        }),
                      },
                    ],
                })(
                    <CusLov
                      code="CMHK.CONTRACT"
                      queryParams={{ tenantId }}
                      textValue={headerInfo?.contractNumber}
                      disabled={readyOnly}
                      lovOptions={{ displayField: 'contract_code', valueField: 'contract_code' }}
                      onChange={(_, lovData) => {
                        console.log(lovData, 'lovData');
                      }}
                    />
                  )}
              </Form.Item>
            </Col>}
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.prname`).d('采购申请名称')}
              >
                {getFieldDecorator('prName', {
                  initialValue: headerInfo?.prName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.prname`).d('采购申请名称'),
                      }),
                    },
                  ],
                })(<Input disabled={readyOnly} />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.applicant`).d('申请人')}
              >
                {getFieldDecorator('applicantUserName', {
                  initialValue: headerInfo?.applicantUserName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.applicant`).d('申请人'),
                      }),
                    },
                  ],
                })(<Input disabled />)}
              </Form.Item>
            </Col>

            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.prnumber`).d('采购申请编号')}>
                {getFieldDecorator('prNumber', {
                  initialValue: headerInfo?.prNumber,
                })(<Input disabled />)}
              </Form.Item>
            </Col>

            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.prstatus`).d('申请状态')}>
                {getFieldDecorator('prStatus', {
                  initialValue: headerInfo?.prStatus
                    ? headerInfo?.prStatus
                    : 'PENDING_REFER',
                })(
                  <CusSelect
                    options={idpValueMap['HKPC.PRRECORDSSTATUS']}
                    disabled
                  />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.applyingdepartment`).d('申请人部门')}
              >
                {getFieldDecorator('applyingDepartmentName', {
                  initialValue: headerInfo?.applyingDepartmentName,
                })(
                  <CusLov
                    textValue={headerInfo?.applyingDepartmentName}
                    allowClear={false}
                    disabled={readyOnly}
                    code="CMHK_USER_DEPT"
                    queryParams={{ tenantId, userId: id, lang: getCurrentLanguage() }}
                    onChange={(_, lovData) => {
                      form.setFieldsValue({
                        unitCode: lovData.unitCode, // 申请人部门编码
                      })
                    }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.requester`).d('需求人')}>
                {getFieldDecorator('applyUserName', {
                  initialValue: headerInfo?.applyUserName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.requester`).d('需求人'),
                      }),
                    },
                  ],
                })(
                  <CusLov
                    code="CMHK.EMPLOYEEUNIT"
                    disabled={readyOnly}
                    textValue={headerInfo?.applyUserName}
                    queryParams={{ tenantId, userId: id, lang: getCurrentLanguage() }}
                    lovOptions={{ displayField: 'realName', valueField: 'realName' }}
                    onChange={(_, lovData) => {
                      console.log(lovData, 'lovData');
                      this.setState(
                        {
                          userId: lovData.userId,
                          applyUserId: lovData.userId,
                        },
                        () => {
                          dispatch({
                            type: 'phoneBusinessListModal/updateState',
                            payload: {
                              applyUserName: lovData.realName, // 需求人名称
                              applyUserId: lovData.userId, // 需求人ID
                              applyUserDepName: lovData.unitName, // 需求人部门名称
                              applyUserDepId: lovData.unitId, // 需求人部门Id
                              applyUserPhone: lovData.phone, // 需求人电话
                              employeeNum: lovData.employeeNum, // 需求人工号
                            },
                          });
                        }
                      );
                    }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.prdate`).d('申请日期')}>
                {getFieldDecorator('applyingDate', {
                  initialValue: dayjs(headerInfo?.applyingDate).format(DEFAULT_DATE_FORMAT) || dayjs().format(DEFAULT_DATE_FORMAT)
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.requesterdepartment`).d('需求人部门')}
              >
                {getFieldDecorator('applyUserDepName', {
                  initialValue: applyUserDepName || headerInfo?.applyUserDepName,
                })(
                  <CusLov
                    textValue={applyUserDepName || headerInfo?.applyUserDepName}
                    disabled={readyOnly}
                    allowClear={false}
                    code="CMHK.EMPLOYEEUNITDEPT"
                    queryParams={{
                      tenantId,
                      lang: getCurrentLanguage(),
                      employeeNum,
                    }}
                    lovOptions={{ displayField: 'unitName', valueField: 'unitName' }}
                    onChange={(_, lovData) => {
                      console.log('lovData', lovData);
                      this.setState(
                        {
                          applyUserDepId: lovData.unitId,
                        },
                        () => {
                          dispatch({
                            type: 'phoneBusinessListModal/updateState',
                            payload: {
                              applyUserDepId: lovData.unitId,
                            },
                          });
                        }
                      );
                    }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.requestertel`).d('需求人电话')}>
                {getFieldDecorator('applyUserPhone', {
                  initialValue: applyUserPhone || headerInfo?.applyUserPhone || getCurrentUser().phone,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.prtype`).d('采购申请类型')}>
                {getFieldDecorator('prType', {
                  initialValue: headerInfo?.prType,
                })(<CusSelect options={idpValueMap['HKPC.PRTYPE']} disabled />)}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                label={intl
                  .get(`${promptCode}.view.title.ettimatedbudgetamountH`)
                  .d('预估总金额(HKD)')}
              >
                {getFieldDecorator('estimatedBudgetAmountHkd', {
                  initialValue: (estimatedBudgetAmountHkd || estimatedBudgetAmountHkd === 0) ? estimatedBudgetAmountHkd : headerInfo?.estimatedBudgetAmountHkd,
                })(
                  <CusInputNumber
                    disabled
                    min={0}
                    step={0.01}
                    precision={4}
                    allowThousandth
                  />
                )}
              </Form.Item>
            </Col>
            {['salesbusinessproduct'].includes(headerInfo?.prType) && <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.ppname`).d('采购计划单名称')}
              >
                {getFieldDecorator('planName', {
                  initialValue: headerInfo?.planName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.ppname`)
                          .d('采购计划单名称'),
                      }),
                    },
                  ],
                })(
                  <Input
                    readOnly
                    suffix={suffix}
                    className={'lov-input'}
                    value={headerInfo?.planName}
                    style={{ cursor: 'pointer', color: '#666' }}
                    onClick={() => {
                      this.onSearchBtnClick();
                    }}
                    disabled={readyOnly || !(form.getFieldValue('applyingDepartmentName'))}
                  />
                )}
              </Form.Item>
            </Col>}
            {['salesbusinessproduct'].includes(headerInfo?.prType) && <Col {...gridSpan}>
              <Form.Item
                label={intl
                  .get(`${promptCode}.view.title.rbpp`)
                  .d('采购计划可用余额')}
              >
                {getFieldDecorator('planRemainAmount', {
                  initialValue: headerInfo?.planRemainAmount,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.rbpp`)
                          .d('采购计划可用余额'),
                      }),
                    },
                    {
                      type: 'number',
                      min: estimatedBudgetAmountHkd,
                      message: intl
                        .get(`${promptCode}.view.title.amountprompt`)
                        .d('采购计划可用余额需大于预估总金额'),
                    },
                  ],
                })(
                  <CusInputNumber
                    min={0}
                    step={0.01}
                    precision={4}
                    allowThousandth
                    disabled
                  />
                )}
              </Form.Item>
            </Col>}
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`${promptCode}.view.title.purchaseagent`).d('采购员')}>
                {getFieldDecorator('purchaserCodeVal', {
                  initialValue: headerInfo?.purchaserName,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.view.title.purchaseagent`).d('采购员'),
                      }),
                    },
                  ],
                })(
                  <CusLov
                    code="HKSP.PORTAL_PURCHASERR"
                    textValue={headerInfo?.purchaserName}
                    queryParams={{ tenantId }}
                    lovOptions={{ displayField: 'employeeName', valueField: 'employeeNum' }}
                    disabled={readyOnly}
                    onChange={(_, lovData) => {
                      form.setFieldsValue({
                        purchaserName: lovData.employeeName,
                        purchaserCode: lovData.employeeNum,
                      })
                    }}
                  />)}
              </Form.Item>
            </Col>
            {['salesbusinessproduct'].includes(headerInfo?.prType) && <Col {...gridSpan}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.annualpp`).d('年度采购计划')}
              >
                {getFieldDecorator('isYearPlan', {
                  initialValue: headerInfo?.isYearPlan || 'Y',
                })(
                  <CusSelect
                    options={idpValueMap['CMHK.Y_N']}
                    lazyLoad={false}
                    disabled={readyOnly}
                    allowClear
                    // onChange={(value) => {
                    //   const newDataSource = (productDetailSource || []).map((item) => ({
                    //     ...item,
                    //     rowKey: uuidv4(),
                    //     quoteRule: value === 'Y' ? 'Bundled' : 'Singleton',
                    //   }));
                    //   dispatch({
                    //     type: 'phoneBusinessListModal/updateState',
                    //     payload: {
                    //       productDetailSource: newDataSource,
                    //     },
                    //   });
                    // }}
                  />
                )}
              </Form.Item>
            </Col>}
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.venorcategory`).d('采购业务类别')}
              >
                {getFieldDecorator('erpPrType', {
                  initialValue: headerInfo?.erpPrType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.venorcategory`)
                          .d('采购业务类别'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    options={idpValueMap['HKPC.VENDOR_CATEGORY']}
                    disabled={readyOnly}
                    allowClear
                  />
                  )}
              </Form.Item>
            </Col>
            <Col {...gridSpan}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.prcategory`).d('采购类别')}
              >
                {getFieldDecorator('purchasingCategory', {
                  initialValue: headerInfo?.purchasingCategory,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.view.title.prcategory`)
                          .d('采购类别'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    options={filter(idpValueMap['HKPC.PURCHASINGCATEGORY'], (item) =>
                      ['INV', 'INVS_ICTS', 'INVS_COUP', ...(headerInfo?.prType === 'freeofcharge' ? ['INV_DEMO'] : [])].includes(item.value)
                    )}
                    disabled={readyOnly}
                    allowClear
                    onChange={(value, itemData) => {
                      dispatch({
                        type: 'phoneBusinessListModal/updateState',
                        payload: {
                          purchaseInformationDetailSource: purchaseInformationDetailSource?.map((item) => ({
                            ...item,
                            purchasingCategory: value,
                            contentBudgetType: itemData?.tag,
                          })),
                        },
                      });
                      form.setFieldsValue({
                        purchaseCategoryTag: itemData?.tag, // 采购类别对应的预算类型
                      })
                    }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl
                  .get(`${promptCode}.view.title.requestremark`)
                  .d('需求部门备注')}
              >
                {getFieldDecorator('prBakup', {
                  initialValue: headerInfo?.prBakup,
                })(
                  <CusInput.TextArea
                    rows={3}
                    autoSize={{ minRows: 3, maxRows: 3 }}
                    maxLength={500}
                    showCharacter
                    disabled={readyOnly}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${promptCode}.view.title.poremrks`).d('采购订单备注')}
              >
                {getFieldDecorator('supBakup', {
                  initialValue: headerInfo?.supBakup,
                })(
                  <CusInput.TextArea
                    rows={3}
                    autoSize={{ minRows: 3, maxRows: 3 }}
                    maxLength={500}
                    showCharacter
                    disabled={readyOnly}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                required
                label={intl.get(`${promptCode}.view.title.Attachment`).d('附件')}
              >
                {getFieldDecorator('attachUuid', {
                  initialValue: headerInfo?.attachUuid || stateAttachmentUUID,
                })(
                  <UploadList
                    viewOnly={readyOnly}
                    multiple={true}
                    bucketName="spfm-comp"
                    tenantId={getCurrentOrganizationId()}
                    showUploadList={{
                      removePopConfirmTitle: intl
                        .get('hzero.common.message.confirm.delete')
                        .d('是否删除此条记录？'),
                      showRemoveIcon: !(
                        headerInfo?.prStatus && headerInfo?.prStatus != 'PENDING_REFER'
                      ),
                    }}
                    filePreview
                    onUploadSuccess={(file, fileList, attachmentUUID) => {
                      console.log('上传成功', attachmentUUID);
                      this.props.headerInfo.attachUuid = attachmentUUID;
                    }}
                    attachmentUUID={headerInfo?.attachUuid || stateAttachmentUUID}
                    setLoading={(uploading = false) => {
                      this.setState({
                        uploading,
                      });
                    }}
                    isTitle={intl.get(`${promptCode}.view.title.attachmentremark`).d('附件说明')}
                  />
                )}
              </Form.Item>
            </Col>
            <Col style={{display: 'none'}}>
              <Form.Item label={intl.get(`${promptCode}.view.title.purchaseagent`).d('采购员名称')}>
                {getFieldDecorator('purchaserName', {
                  initialValue: headerInfo?.purchaserName,
                })(
                  <Input disabled/>
                )}
              </Form.Item>
            </Col>
            <Col style={{display: 'none'}}>
              <Form.Item label={intl.get(`${promptCode}.view.title.purchaseagent`).d('采购员Code')}>
                {getFieldDecorator('purchaserCode', {
                  initialValue: headerInfo?.purchaserCode,
                })(
                  <Input disabled/>
                )}
              </Form.Item>
            </Col>
            <Col style={{display: 'none'}}>
              <Form.Item label={intl.get(`${promptCode}.view.title.UnitPriceControlOrNot`).d('是否单价限制')}>
                {getFieldDecorator('unitPriceControl', {
                  initialValue: headerInfo?.unitPriceControl,
                })(
                  <Input disabled/>
                )}
              </Form.Item>
            </Col>
            <Col style={{display: 'none'}}>
              <Form.Item label={intl.get(`${promptCode}.view.title.UnitPriceControlOrNot`).d('ebs')}>
                {getFieldDecorator('ebs', {
                  initialValue: headerInfo?.ebs,
                })(
                  <Input disabled/>
                )}
              </Form.Item>
            </Col>
            <Col style={{display: 'none'}}>
              <Form.Item label={intl.get(`${promptCode}.demo`).d('采购计划单编号')}>
                {getFieldDecorator('planNumber', {
                  initialValue: headerInfo?.planNumber,
                })(
                  <Input disabled/>
                )}
              </Form.Item>
            </Col>
            <Col style={{display: 'none'}}>
              <Form.Item label={intl.get(`${promptCode}.demo`).d('申请人部门code')}>
                {getFieldDecorator('unitCode', {
                  initialValue: headerInfo?.unitCode,
                })(
                  <Input disabled/>
                )}
              </Form.Item>
            </Col>
            <Col style={{display: 'none'}}>
              <Form.Item label={intl.get(`${promptCode}.demo`).d('采购类别对应的预算类型')}>
                {getFieldDecorator('purchaseCategoryTag', {
                  initialValue: headerInfo?.purchaseCategoryTag,
                })(
                  <Input disabled/>
                )}
              </Form.Item>
            </Col>
          </GenerateFormGrid>
        </Form>

        <CusModal
          title={intl.get(`${promptCode}.view.title.ppname`).d('采购计划单名称')}
          visible={planModalVisible}
          width={600}
          onOk={this.handlePlanName}
          onCancel={() => {
            this.setState({
              planModalVisible: false,
            });
          }}
        >
          <PlanList {...planListProps} />
        </CusModal>
      </div>
    );
  }
}
