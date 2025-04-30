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
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import Switch from 'components/Switch';
import { dateRender, numberRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import DisplayFormItem from '../../components/DisplayFormItem';
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
    'entity.roles',
    'hzero.common',
  ],
})
@Form.create({ fieldNameProp: null })
export default class ContractHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      signFlag: false,
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
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
    const { supplierTenantId, supplierCompanyCode, supplierCompanyName } = record;
    this.handleChangeFormItem();
    onChangeHeader({
      ...dataSource,
      supplierTenantId,
      supplierCompanyName,
      supplierCompanyNum: supplierCompanyCode,
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

  render() {
    const { tenantId, signFlag } = this.state;
    const {
      editable = false,
      maintainEditable = false,
      form = {},
      dataSource = {},
      detailEnumMap = {},
    } = this.props;
    const { kinds = [], acceptTypeList = [] } = detailEnumMap;
    const { getFieldDecorator = e => e, getFieldValue, setFieldsValue, validateFields } = form;
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
      mainPcNum,
      archiveCode,
      paidAmount, // 新增字段
      remark,
      ouId,
      ouName,
      acceptType,
      acceptTypeMeaning,
      effectiveTime,
      signEffectFlag,
      purchaseOrgId,
      purchaseOrgName,
      purchaseAgentId,
      purchaseAgentName,
    } = dataSource;
    return (
      <Form className={styles['header-form']}>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={editable || maintainEditable ? 'half-row' : 'read-half-row'}
        >
          <Col {...FORM_COL_2_LAYOUT}>
            {editable || maintainEditable ? (
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
                })(<Input onChange={this.handleChangeFormItem} />)}
              </FormItem>
            ) : (
              <DisplayFormItem
                label={intl.get(`${commonPrompt}.pcName`).d('协议名称')}
                value={pcName}
              />
            )}
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.pcNum`).d('协议编号')}
              value={pcNum}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`hzero.common.date.creation`).d('创建日期')}
              value={dateRender(creationDate)}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`${commonPrompt}.amount`).d('协议总额')}
              value={numberRender(taxIncludeAmount, 2)}
            />
          </Col>
        </Row>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={classnames(editable ? 'inclusion-row' : 'read-row')}
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <DisplayFormItem
              label={intl.get(`entity.roles.creator`).d('创建人')}
              value={createByRealName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            {editable ? (
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
                  <Select allowClear style={{ minWidth: 150 }} onChange={this.handleChangeFormItem}>
                    {kinds.map(n => (
                      <Select.Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            ) : (
              <DisplayFormItem
                label={intl.get(`${commonPrompt}.pcKindCode`).d('协议性质')}
                value={pcKindCodeMeaning}
              />
            )}
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`entity.company.tag`).d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {editable
                ? getFieldDecorator('companyId', {
                    initialValue: companyId,
                    rules: [
                      {
                        required: editable,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`entity.company.tag`).d('公司'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SPCM.USER_AUTH.COMPANY"
                      textValue={companyName}
                      queryParams={{ enabledFlag: 1 }}
                      onChange={this.handleChangeCompany}
                    />
                  )
                : companyName}
            </FormItem>
          </Col>
        </Row>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={classnames(editable || maintainEditable ? 'writable-row' : 'read-row')}
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('entity.business.tag').d('业务实体')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {editable
                ? getFieldDecorator('ouId', {
                    initialValue: ouId,
                  })(
                    <Lov
                      code="SPFM.USER_AUTH.OU"
                      textValue={ouName}
                      queryParams={{ tenantId, companyId: getFieldValue('companyId') }}
                      onChange={this.handleChangeFormItem}
                    />
                  )
                : ouName}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('entity.organization.class.purchase').d('采购组织')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {editable
                ? getFieldDecorator('purchaseOrgId', {
                    initialValue: purchaseOrgId,
                  })(
                    <Lov
                      code="SPFM.USER_AUTH.PURORG"
                      textValue={purchaseOrgName}
                      queryParams={{ tenantId }}
                      onChange={this.handleChangeFormItem}
                    />
                  )
                : purchaseOrgName}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('spcm.common.model.common.agentName').d('采购员')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {editable
                ? getFieldDecorator('purchaseAgentId', {
                    initialValue: purchaseAgentId,
                  })(
                    <Lov
                      code="SPFM.USER_AUTH.PURCHASE_AGENT"
                      textValue={purchaseAgentName}
                      queryParams={{ tenantId }}
                      onChange={this.handleChangeFormItem}
                    />
                  )
                : purchaseAgentName}
            </FormItem>
          </Col>
        </Row>
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={classnames(editable || maintainEditable ? 'writable-row' : 'read-row')}
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.pcType`).d('协议类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {editable
                ? getFieldDecorator('pcTypeId', {
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
                  )
                : pcTypeName}
            </FormItem>
          </Col>
          {!((getFieldValue('pcKindCode') || pcKindCode) === 'ATTACHMENT') && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`${common}.pcTemplateId`).d('协议模板')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {editable
                  ? getFieldDecorator('pcTemplateId', {
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
                      <Lov
                        disabled={!getFieldValue('pcTypeId')}
                        code="SPCM.PC_TEMPLATE"
                        textValue={templateName}
                        queryParams={{ enabledFlag: 1, pcTypeId: getFieldValue('pcTypeId') }}
                      />
                    )
                  : templateName}
              </FormItem>
            </Col>
          )}
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`entity.supplier.tag`).d('供应商')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {editable || maintainEditable
                ? getFieldDecorator('supplierCompanyId', {
                    initialValue: supplierCompanyId,
                    rules: [
                      {
                        required: editable || maintainEditable,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`entity.supplier.tag`).d('供应商'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      onChange={this.handleChangeSupplier}
                      code="SPCM.USER_AUTH.SUPPLIER"
                      textValue={supplierCompanyName}
                      queryParams={{ enabledFlag: 1 }}
                    />
                  )
                : supplierCompanyName}
            </FormItem>
          </Col>
          {/* {(getFieldValue('pcKindCode') || pcKindCode) === 'ATTACHMENT' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`${common}.startDateActive`).d('协议起始日期')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {editable || maintainEditable
                  ? getFieldDecorator('startDateActive', {
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
                      <DatePicker
                        format={getDateFormat()}
                        placeholder={null}
                        disabledDate={currentDate =>
                          getFieldValue('endDateActive') &&
                          moment(getFieldValue('endDateActive')).isBefore(currentDate, 'day')
                        }
                        onChange={this.handleChangeFormItem}
                      />
                    )
                  : dateRender(startDateActive)}
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
                    style={{ width: '150px', marginRight: '8px' }}
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
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={classnames(editable || maintainEditable ? 'writable-row' : 'read-row')}
        >
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${common}.startDateActive`).d('协议起始日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {editable || maintainEditable
                ? getFieldDecorator('startDateActive', {
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
                  )
                : dateRender(startDateActive)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${common}.endDateActive`).d('协议终止日期')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {editable || maintainEditable
                ? getFieldDecorator('endDateActive', {
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
                  )
                : dateRender(endDateActive)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${commonPrompt}.mainContractId`).d('主协议')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {mainPcNum}
            </FormItem>
          </Col>
          {(getFieldValue('pcKindCode') || pcKindCode) === 'ATTACHMENT' && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`spcm.common.archiveCode`).d('归档码')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {editable || maintainEditable
                  ? getFieldDecorator('archiveCode', {
                      initialValue: archiveCode,
                      rules: [
                        {
                          max: 120,
                          message: intl.get('hzero.common.validation.max', { max: 120 }),
                        },
                      ],
                    })(<Input onChange={this.handleChangeFormItem} />)
                  : archiveCode}
              </FormItem>
            </Col>
          )}
        </Row>
        {!((getFieldValue('pcKindCode') || pcKindCode) === 'ATTACHMENT') && (
          <Row
            {...EDIT_FORM_ROW_LAYOUT}
            className={classnames(editable || maintainEditable ? 'writable-row' : 'read-row')}
          >
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`spcm.common.archiveCode`).d('归档码')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {editable || maintainEditable
                  ? getFieldDecorator('archiveCode', {
                      initialValue: archiveCode,
                      rules: [
                        {
                          max: 120,
                          message: intl.get('hzero.common.validation.max', { max: 120 }),
                        },
                      ],
                    })(<Input onChange={this.handleChangeFormItem} />)
                  : archiveCode}
              </FormItem>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`spcm.common.model.common.paidAmount`).d('已付款金额')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {editable || maintainEditable
                  ? getFieldDecorator('paidAmount', {
                      initialValue: paidAmount || '',
                    })(<Input disabled />)
                  : paidAmount}
              </FormItem>
            </Col>
          </Row>
        )}
        <Row
          {...EDIT_FORM_ROW_LAYOUT}
          className={classnames(
            'last-form-item',
            editable || maintainEditable ? 'half-row' : 'read-half-row'
          )}
        >
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem label={intl.get(`hzero.common.remark`).d('备注')}>
              {editable || maintainEditable
                ? getFieldDecorator('remark', {
                    initialValue: remark,
                    rules: [
                      {
                        max: 480,
                        message: intl.get('hzero.common.validation.max', { max: 480 }),
                      },
                    ],
                  })(<TextArea onChange={this.handleChangeFormItem} rows={2} />)
                : remark}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
