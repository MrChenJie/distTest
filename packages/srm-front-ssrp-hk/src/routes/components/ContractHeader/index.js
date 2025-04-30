/*
 * ContractHeader - 采购协议头信息
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Input, Select, DatePicker, InputNumber } from 'hzero-ui';
import classnames from 'classnames';
import moment from 'moment';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_2_LAYOUT,
  FORM_COL_2_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import Switch from 'components/Switch';
import { dateRender, numberRender, yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'hzero-front-hcuz';
import styles from './index.less';

const { TextArea } = Input;
const FormItem = Form.Item;
const commonPrompt = 'spcm.purchaseRequisitionCreation.model';
const common = 'spcm.common.model';

/**
 * ContractHeader - 采购协议头信息
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Array} collapseKeys - 折叠面板数组
 * @reactProps {Boolean} editable - 编辑状态
 * @reactProps {Object} dataSource - 数据源
 * @return React.element
 */
@formatterCollections({
  code: [
    'spcm.purchaseRequisitionCreation',
    'spcm.common',
    'entity.supplier',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.roles',
    'hzero.common',
  ],
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL'],
})
export default class ContractHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      // unitIdVisible: false,
      signFlag: false,
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  componentDidMount() {
    this.getSelectedRows();
  }

  /**
   * 改变设置已编辑标识
   */
  @Bind()
  handleChangeFormItem() {
    const { onChangeState } = this.props;
    onChangeState({ headerEdited: true });
  }

  /**
   * 供应商Lov修改回调
   * @param {*} value
   * @param {*} record
   */
  @Bind()
  handleChangeSupplier(value, record) {
    const { dataSource, onChangeHeader } = this.props;
    const {
      supplierTenantId,
      supplierCompanyCode,
      supplierCompanyName,
      supplierCurrencyCode,
    } = record;
    this.handleChangeFormItem();
    onChangeHeader({
      ...dataSource,
      supplierTenantId,
      supplierCompanyName,
      supplierCompanyNum: supplierCompanyCode,
      supplierCurrencyCode,
    });
  }

  /**
   * 改变对应Lov提示文字显隐
   * @param {String} field 字段
   * @param {String} value 值
   */
  @Bind()
  handleToolTipVisible(field, value) {
    this.setState({
      [field]: !!value,
    });
  }

  /**
   * 公司改变回调
   */
  @Bind()
  handleChangeCompany() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields(['pcTypeId', 'pcTemplateId', 'ouId']);
    this.handleChangeFormItem();
  }

  /**
   * 协议类型改变回调
   */
  @Bind()
  handleChangePcTypeId() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields(['pcTemplateId']);
    this.handleChangeFormItem();
  }

  /**
   * 校验显示的默认值
   */
  @Bind()
  getSelectedRows() {
    const { sourceResultDTOs = [], templateDate = {}, isQuoteSource } = this.props;

    const supplierCompanyIds = Array.from(
      new Set(sourceResultDTOs.map(item => item.supplierCompanyId))
    );
    const supplierCompanyNames = Array.from(
      new Set(sourceResultDTOs.map(item => item.supplierCompanyName))
    );
    const supplierTenantIds = Array.from(
      new Set(sourceResultDTOs.map(item => item.supplierTenantId))
    );

    const ouIds = Array.from(new Set(sourceResultDTOs.map(item => item.ouId)));
    const ouNames = Array.from(new Set(sourceResultDTOs.map(item => item.ouName)));

    const purchaseOrganizatioIds = Array.from(
      new Set(sourceResultDTOs.map(item => item.purOrganizationId))
    );
    const purchaseOrganizatioNames = Array.from(
      new Set(sourceResultDTOs.map(item => item.purchaseOrganizatioName))
    );

    const purchaseAgentIds = Array.from(
      new Set(sourceResultDTOs.map(item => item.purchaseAgentId))
    );
    const purchaseAgentNames = Array.from(
      new Set(sourceResultDTOs.map(item => item.purchaseAgentName))
    );

    const companyIds = Array.from(new Set(sourceResultDTOs.map(item => item.companyId)));
    const companyNames = Array.from(new Set(sourceResultDTOs.map(item => item.companyName)));

    let mergeItems = {};
    const mergeList = [
      ['defaultSupplierCompanyId', supplierCompanyIds],
      ['defaultSupplierCompanyName', supplierCompanyNames],
      ['defaultSupplierTenantId', supplierTenantIds],
      ['defaultOuId', ouIds],
      ['defaultOuName', ouNames],
      ['defaultPurchaseOrgId', purchaseOrganizatioIds],
      ['defaultPurchaseOrgName', purchaseOrganizatioNames],
      ['defaultPurchaseAgentId', purchaseAgentIds],
      ['defaultPurchaseAgentName', purchaseAgentNames],
      ['defaultCompanyId', companyIds],
      ['defaultCompanyName', companyNames],
    ];

    mergeList.forEach(item => {
      const [key, value] = item;
      if (value.length === 1) {
        mergeItems = { ...mergeItems, [key]: value[0] };
      } else if (value.length === 2 && (!value[0] || !value[1])) {
        mergeItems = { ...mergeItems, [key]: value[0] || value[1] };
      } else {
        mergeItems = { ...mergeItems, [key]: null };
      }
    });
    const defaultValues = {
      ...templateDate,
      // defaultSupplierCompanyId: supplierCompanyIds.length === 1 ? supplierCompanyIds[0] : null,
      // defaultSupplierCompanyName:
      //   supplierCompanyNames.length === 1 ? supplierCompanyNames[0] : null,
      // defaultSupplierTenantId: supplierTenantIds.length === 1 ? supplierTenantIds[0] : null,

      // defaultOuId: ouIds.length === 1 ? ouIds[0] : null,
      // defaultOuName: ouNames.length === 1 ? ouNames[0] : null,

      // defaultPurchaseOrgId: purchaseOrganizatioIds.length === 1 ? purchaseOrganizatioIds[0] : null,
      // defaultPurchaseOrgName:
      //   purchaseOrganizatioNames.length === 1 ? purchaseOrganizatioNames[0] : null,

      // defaultPurchaseAgentId: purchaseAgentIds.length === 1 ? purchaseAgentIds[0] : null,
      // defaultPurchaseAgentName: purchaseAgentNames.length === 1 ? purchaseAgentNames[0] : null,

      // defaultCompanyId: companyIds.length === 1 ? companyIds[0] : null,
      // defaultCompanyName: companyNames.length === 1 ? companyNames[0] : null,

      ...mergeItems,
      defaultProtocolSource: isQuoteSource === '1' ? 'SEARCH_SOURCE_RESULT' : null,
      defaultProtocolSourceMeaning:
        isQuoteSource === '1'
          ? intl.get(`spcm.common.model.common.sourceResult`).d('寻源结果')
          : null,
    };
    this.setState({ defaultValues });
  }

  /**
   * 校验显示的默认值
   */
  @Bind()
  handleExpUnitChange(value, record) {
    const { handleExpenseUnitChange = e => e } = this.props;
    this.handleChangeFormItem();
    handleExpenseUnitChange(value, record);
  }

  render() {
    const { tenantId, defaultValues = {}, signFlag } = this.state;
    const {
      defaultCompanyName,
      defaultCompanyId,
      defaultOuId,
      defaultOuName,
      defaultPurchaseAgentId,
      defaultPurchaseAgentName,
      defaultPurchaseOrgId,
      defaultPurchaseOrgName,
      defaultSupplierCompanyId,
      defaultSupplierCompanyName,
      defaultProtocolSource,
      defaultProtocolSourceMeaning,
    } = defaultValues;
    const {
      editable = false,
      maintainEditable = false,
      alterationFlag = 0,
      form = {},
      dataSource = {},
      detailEnumMap = {},
      customizeForm,
      purchaseFlag,
      terminateReasonFlag,
      createPurchaseOrderInfo = {},
      quoteType,
      // handleExpenseUnitChange = e => e,
    } = this.props;
    const { kinds = [], contractPurposeList = [], acceptTypeList = [] } = detailEnumMap;
    const { getFieldDecorator = e => e, getFieldValue, validateFields, setFieldsValue } = form;
    const {
      pcName,
      taxIncludeAmount,
      pcNum,
      creationDate,
      createByRealName,
      pcKindCodeMeaning,
      pcKindCode,
      companyName,
      companyId,
      pcTypeId,
      pcTypeName,
      pcTemplateId,
      templateName,
      supplierCompanyId,
      supplierCompanyName,
      startDateActive,
      endDateActive,
      mainContractId,
      mainPcNum,
      acceptType,
      acceptTypeMeaning,
      archiveCode,
      pcSourceCode,
      pcSourceCodeMeaning,
      remark,
      pcHeaderId,
      internalPostil,
      ouId,
      ouName,
      effectiveTime,
      signEffectFlag,
      purchaseOrgId,
      purchaseOrgName,
      purchaseAgentId,
      purchaseAgentName,
      companyOrgId,
      companyOrgName,
      costAnchDepId,
      costAnchDepDesc,
      overseasProcurement,
      globalFlag,
      pcStatusCode,
      terminationReason,
      contractPurpose,
      contractPurposeMeaning,
      signDescription,
    } = dataSource;
    return customizeForm(
      {
        code: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL',
        form,
        dataSource,
      },
      <Form className={styles['header-form']}>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={editable || maintainEditable ? 'half-row' : 'read-half-row'}
        >
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem label={intl.get(`${commonPrompt}.pcName`).d('协议名称')}>
              {getFieldDecorator('pcName', {
                initialValue: pcName,
                rules: [
                  {
                    required: editable || maintainEditable,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.pcName`).d('协议名称'),
                    }),
                  },
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', { max: 120 }),
                  },
                ],
              })(
                editable || maintainEditable ? (
                  <Input onChange={this.handleChangeFormItem} />
                ) : (
                  <span>{pcName}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.pcNum`).d('协议编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('pcNum', {
                initialValue: pcNum,
              })(<span>{pcNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`hzero.common.date.creation`).d('创建日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('creationDate', {
                initialValue: creationDate,
              })(<span>{dateRender(creationDate)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.amount`).d('协议总额')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('taxIncludeAmount', {
                initialValue: taxIncludeAmount,
              })(<span>{numberRender(taxIncludeAmount, 2)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="inclusion-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`entity.roles.creator`).d('创建人')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('createByRealName', {
                initialValue: createByRealName,
              })(<span>{createByRealName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.pcKindCode`).d('协议性质')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('pcKindCode', {
                initialValue: pcKindCode, // TODO 默认为普通合同
                rules: [
                  {
                    required: editable,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.pcKindCode`).d('协议性质'),
                    }),
                  },
                ],
              })(
                editable ? (
                  <Select allowClear style={{ minWidth: 150 }} onChange={this.handleChangeFormItem}>
                    {kinds.map(n => (
                      <Select.Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  <span>{pcKindCodeMeaning}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`entity.company.tag`).d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyId', {
                initialValue: companyId || defaultCompanyId || createPurchaseOrderInfo.companyId,
                rules: [
                  {
                    required: editable,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`entity.company.tag`).d('公司'),
                    }),
                  },
                ],
              })(
                editable ? (
                  <Lov
                    code="SPCM.USER_AUTH.COMPANY"
                    disabled={quoteType === 'PO'}
                    textValue={
                      companyName || defaultCompanyName || createPurchaseOrderInfo.companyName
                    }
                    queryParams={{ enabledFlag: 1 }}
                    onChange={this.handleChangeCompany}
                  />
                ) : (
                  <span>{companyName}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('entity.business.tag').d('业务实体')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('ouId', {
                initialValue: ouId || defaultOuId || createPurchaseOrderInfo.ouId,
              })(
                editable ? (
                  <Lov
                    code="SPFM.USER_AUTH.OU"
                    textValue={ouName || defaultOuName || createPurchaseOrderInfo.ouName}
                    queryParams={{ tenantId, companyId: getFieldValue('companyId') }}
                    onChange={this.handleChangeFormItem}
                  />
                ) : (
                  <span>{ouName}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('entity.organization.class.purchase').d('采购组织')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purchaseOrgId', {
                initialValue:
                  purchaseOrgId || defaultPurchaseOrgId || createPurchaseOrderInfo.purchaseOrgId,
              })(
                editable ? (
                  <Lov
                    // code="HPFM.PURCHASE_ORGANIZATION"
                    code="SPFM.USER_AUTH.PURORG"
                    textValue={
                      purchaseOrgName ||
                      defaultPurchaseOrgName ||
                      createPurchaseOrderInfo.purOrganizationName
                    }
                    queryParams={{ tenantId }}
                    onChange={this.handleChangeFormItem}
                  />
                ) : (
                  <span>{purchaseOrgName}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('spcm.common.model.common.agentName').d('采购员')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purchaseAgentId', {
                initialValue:
                  purchaseAgentId ||
                  defaultPurchaseAgentId ||
                  createPurchaseOrderInfo.purchaseAgentId,
              })(
                editable || maintainEditable ? (
                  <Lov
                    code="SPFM.USER_AUTH.PURCHASE_AGENT"
                    textValue={
                      purchaseAgentName ||
                      defaultPurchaseAgentName ||
                      createPurchaseOrderInfo.purchaseAgentName
                    }
                    queryParams={{ tenantId }}
                    onChange={this.handleChangeFormItem}
                  />
                ) : (
                  <span>{purchaseAgentName}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.pcType`).d('协议类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('pcTypeId', {
                initialValue: pcTypeId,
                rules: [
                  {
                    required: editable && getFieldValue('companyId'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.pcType`).d('协议类型'),
                    }),
                  },
                ],
              })(
                editable ? (
                  <Lov
                    disabled={!getFieldValue('companyId')}
                    code="SPCM.PC_TYPE"
                    textValue={pcTypeName}
                    queryParams={{
                      enabledFlag: 1,
                      companyId: getFieldValue('companyId'),
                      tenantId,
                    }}
                    onChange={this.handleChangePcTypeId}
                  />
                ) : (
                  <span>{pcTypeName}</span>
                )
              )}
            </FormItem>
          </Col>
          {!((getFieldValue('pcKindCode') || pcKindCode) === 'ATTACHMENT') && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`${common}.pcTemplateId`).d('协议模板')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('pcTemplateId', {
                  initialValue: pcTemplateId,
                  rules: [
                    {
                      required: editable && getFieldValue('pcTypeId'),
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${common}.pcTemplateId`).d('协议模板'),
                      }),
                    },
                  ],
                })(
                  editable ? (
                    <Lov
                      disabled={!getFieldValue('pcTypeId')}
                      code="SPCM.PC_TEMPLATE"
                      textValue={templateName}
                      queryParams={{
                        enabledFlag: 1,
                        pcTypeId: getFieldValue('pcTypeId'),
                        companyId: getFieldValue('companyId'),
                      }}
                    />
                  ) : (
                    <span>{templateName}</span>
                  )
                )}
              </FormItem>
            </Col>
          )}
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`entity.supplier.tag`).d('供应商')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('supplierCompanyId', {
                initialValue:
                  supplierCompanyId ||
                  defaultSupplierCompanyId ||
                  createPurchaseOrderInfo.supplierCompanyId,
                rules: [
                  {
                    required: editable || maintainEditable,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`entity.supplier.tag`).d('供应商'),
                    }),
                  },
                ],
              })(
                editable || maintainEditable ? (
                  <Lov
                    code="SPCM.USER_AUTH.SUPPLIER"
                    disabled={createPurchaseOrderInfo.supplierCompanyId && quoteType === 'PO'}
                    onChange={this.handleChangeSupplier}
                    textValue={
                      supplierCompanyName ||
                      defaultSupplierCompanyName ||
                      createPurchaseOrderInfo.supplierCompanyName
                    }
                    queryParams={{ enabledFlag: 1 }}
                  />
                ) : (
                  <span>{supplierCompanyName}</span>
                )
              )}
            </FormItem>
          </Col>
          {/* {(getFieldValue('pcKindCode') || pcKindCode) === 'ATTACHMENT' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`${common}.startDateActive`).d('协议起始日期')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('startDateActive', {
                  initialValue: startDateActive ? moment(startDateActive) : null,
                  rules: [
                    {
                      required: editable || maintainEditable,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${common}.startDateActive`).d('协议起始日期'),
                      }),
                    },
                  ],
                })(
                  editable || maintainEditable ? (
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={currentDate =>
                        getFieldValue('endDateActive') &&
                        moment(getFieldValue('endDateActive')).isBefore(currentDate, 'day')
                      }
                      onChange={this.handleChangeFormItem}
                    />
                  ) : (
                    <span>{dateRender(startDateActive)}</span>
                  )
                )}
              </FormItem>
            </Col>
          )} */}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${common}.signedEffect`).d('签署即生效')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('signEffectFlag', {
                initialValue: signEffectFlag || 0,
              })(
                editable || maintainEditable ? (
                  <Switch
                    onChange={e => {
                      if (e === 1) {
                        this.setState({ signFlag: true }, () => {
                          setFieldsValue({ startDateActive: null, endDateActive: null });
                          validateFields(['startDateActive'], { force: true });
                          validateFields(['endDateActive'], { force: true });
                        });
                      } else {
                        this.setState({ signFlag: false }, () => {
                          setFieldsValue({ effectiveTime: null });
                          validateFields(['effectiveTime'], { force: true });
                        });
                      }
                    }}
                  />
                ) : (
                  <Switch defaultChecked={signEffectFlag} disabled />
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${common}.effectiveTime`).d('有效时长')}
              className={styles['effective-time']}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('effectiveTime', {
                initialValue: effectiveTime,
                rules: [
                  {
                    required: signFlag && (editable || maintainEditable),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${common}.effectiveTime`).d('有效时长'),
                    }),
                  },
                ],
              })(
                editable || maintainEditable ? (
                  <InputNumber
                    // style={{ width: '100px', marginRight: '8px' }}
                    disabled={getFieldValue('signEffectFlag') !== 1}
                    onChange={this.handleChangeFormItem}
                  />
                ) : (
                  <span>{effectiveTime}</span>
                )
              )}
              <span>{intl.get(`${common}.days`).d('天')}</span>
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`spcm.common.model.checkType`).d('验收类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('acceptType', {
                initialValue: acceptType,
              })(
                editable || maintainEditable ? (
                  <Select allowClear style={{ minWidth: 150 }} onChange={this.handleChangeFormItem}>
                    {acceptTypeList.map(n => (
                      <Select.Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  <span>{acceptTypeMeaning}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${common}.startDateActive`).d('协议起始日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('startDateActive', {
                initialValue: startDateActive ? moment(startDateActive) : null,
                rules: [
                  {
                    required: !signFlag && (editable || maintainEditable),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${common}.startDateActive`).d('协议起始日期'),
                    }),
                  },
                ],
              })(
                editable || maintainEditable ? (
                  <DatePicker
                    disabled={getFieldValue('signEffectFlag') === 1}
                    format={getDateFormat()}
                    placeholder={null}
                    disabledDate={currentDate =>
                      getFieldValue('endDateActive') &&
                      moment(getFieldValue('endDateActive')).isBefore(currentDate, 'day')
                    }
                    onChange={this.handleChangeFormItem}
                  />
                ) : (
                  <span>{dateRender(startDateActive)}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${common}.endDateActive`).d('协议终止日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('endDateActive', {
                initialValue: endDateActive ? moment(endDateActive) : null,
                rules: [
                  {
                    required: !signFlag && (editable || maintainEditable),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${common}.endDateActive`).d('协议终止日期'),
                    }),
                  },
                ],
              })(
                editable || maintainEditable ? (
                  <DatePicker
                    disabled={getFieldValue('signEffectFlag') === 1}
                    format={getDateFormat()}
                    placeholder={null}
                    disabledDate={currentDate =>
                      getFieldValue('startDateActive') &&
                      moment(getFieldValue('startDateActive')).isAfter(currentDate, 'day')
                    }
                    onChange={this.handleChangeFormItem}
                  />
                ) : (
                  <span>{dateRender(endDateActive)}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.mainContractId`).d('主协议')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('mainContractId', {
                initialValue: mainContractId,
              })(
                (editable || maintainEditable) && alterationFlag === 0 ? (
                  <Lov
                    code="SPCM.CONTRACT"
                    textValue={mainPcNum}
                    lovOptions={{ displayField: 'pcNum' }}
                    queryParams={{ enabledFlag: 1, pcHeaderIdSet: pcHeaderId }}
                    onChange={this.handleChangeFormItem}
                  />
                ) : (
                  <span>{mainPcNum}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('writable-row')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`spcm.common.model.companyOrgName`).d('公司组织')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('companyOrgId', {
                initialValue: companyOrgId,
              })(
                (editable || maintainEditable) && alterationFlag === 0 ? (
                  <Lov
                    code="SPFM.UNIT_G_C"
                    textValue={companyOrgName}
                    queryParams={{
                      organizationId: tenantId,
                      levelPathFrom: 0,
                      levelPathTo: 99999,
                      unitTypeCode: 'G,C',
                    }}
                    onChange={this.handleChangeFormItem}
                  />
                ) : (
                  <span>{companyOrgName}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`spcm.common.model.costAnchDepDesc`).d('费用挂靠部门')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('costAnchDepId', {
                initialValue: costAnchDepId,
              })(
                (editable || maintainEditable) && alterationFlag === 0 ? (
                  <Lov
                    code="SPFM.UNIT_G_C"
                    textValue={costAnchDepDesc}
                    queryParams={{
                      organizationId: tenantId,
                      levelPathFrom: 0,
                      levelPathTo: 1,
                      unitTypeCode: 'D',
                      unitCompanyId: getFieldValue('companyOrgId'),
                    }}
                    disabled={!getFieldValue('companyOrgId')}
                    onChange={(value, record) => this.handleExpUnitChange(value, record)}
                    onMouseEnter={() => this.handleToolTipVisible('unitIdVisible', true)}
                    onMouseLeave={() => this.handleToolTipVisible('unitIdVisible', false)}
                  />
                ) : (
                  <span>{costAnchDepDesc}</span>
                )
              )}
              {/* <Tooltip
                visible={unitIdVisible && !getFieldValue('companyOrgId')}
                title={intl
                  .get(`spcm.common.confim.model.pleaseChooseCompanyFirst`)
                  .d('请先选择公司组织')}
              /> */}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`spcm.common.model.overseasProcurement`).d('境外采购')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('overseasProcurement', {
                initialValue: overseasProcurement,
              })(
                (editable || maintainEditable) && alterationFlag === 0 ? (
                  <Switch onChange={this.handleChangeFormItem} />
                ) : (
                  <Switch defaultChecked={overseasProcurement} disabled />
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('writable-row')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`spcm.common.archiveCode`).d('归档码')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('archiveCode', {
                initialValue: archiveCode,
                rules: [
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', { max: 120 }),
                  },
                ],
              })(
                editable || maintainEditable ? (
                  <Input onChange={this.handleChangeFormItem} maxLength={30} />
                ) : (
                  <span>{archiveCode}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('spcm.common.model.pcSourceCode').d('协议来源')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('pcSourceCode', {
                initialValue: pcSourceCode || '' || defaultProtocolSource,
              })(<span>{pcSourceCodeMeaning || '' || defaultProtocolSourceMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('writable-row')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`spcm.common.pcFlag`).d('是否全局协议')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('globalFlag', {
                initialValue: globalFlag || 0,
              })(
                ((pcStatusCode === 'PENDING' || pcStatusCode === 'REJECTED') && editable) ||
                  maintainEditable ? (
                  // eslint-disable-next-line react/jsx-indent
                  <Switch />
                ) : (
                  yesOrNoRender(globalFlag)
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('writable-row')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`spcm.common.model.contractPurpose`).d('协议用途')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('contractPurpose', {
                initialValue: contractPurpose || 'COMMON_PURCHASE',
                rules: [
                  {
                    required: editable,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${commonPrompt}.contractPurpose`).d('协议用途'),
                    }),
                  },
                ],
              })(
                editable ? (
                  <Select allowClear style={{ minWidth: 150 }} onChange={this.handleChangeFormItem}>
                    {contractPurposeList.map(n => (
                      <Select.Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  <span>{contractPurposeMeaning}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`spcm.common.model.signDescription`).d('签订原因')}>
              {getFieldDecorator('signDescription', {
                initialValue: signDescription,
              })(
                editable || maintainEditable ? (
                  <Input onChange={this.handleChangeFormItem} />
                ) : (
                  <span className="ant-textarea" word-warp="break-word">
                    {signDescription}
                  </span>
                )
              )}
            </FormItem>
          </Col>
          {terminateReasonFlag && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem label={intl.get(`spcm.common.model.terminationReason`).d('终止原因')}>
                {getFieldDecorator('terminationReason', {
                  initialValue: terminationReason,
                })(
                  editable || maintainEditable ? (
                    <Input onChange={this.handleChangeFormItem} />
                  ) : (
                    <span className="ant-textarea" word-warp="break-word">
                      {terminationReason}
                    </span>
                  )
                )}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={classnames('last-form-item', 'writable-row')}>
          {purchaseFlag && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem label={intl.get(`spcm.common.innerRemark`).d('内部批注')}>
                {getFieldDecorator('internalPostil', {
                  initialValue: internalPostil,
                  rules: [
                    {
                      max: 480,
                      message: intl.get('hzero.common.validation.max', { max: 480 }),
                    },
                  ],
                })(
                  editable || maintainEditable ? (
                    <TextArea onChange={this.handleChangeFormItem} autoSize={{ minRows: 1 }} />
                  ) : (
                    <span className="ant-textarea" word-warp="break-word">
                      {internalPostil}
                    </span>
                  )
                )}
              </FormItem>
            </Col>
          )}
          <Col {...FORM_COL_2_3_LAYOUT}>
            <FormItem label={intl.get(`hzero.common.remark`).d('备注')}>
              {getFieldDecorator('remark', {
                initialValue: remark,
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', { max: 480 }),
                  },
                ],
              })(
                editable || maintainEditable ? (
                  <TextArea onChange={this.handleChangeFormItem} rows={2} />
                ) : (
                  <span className="ant-textarea" word-warp="break-word">
                    {remark}
                  </span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
