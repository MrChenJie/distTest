/*
 * ContractHeader - 采购协议头信息
 * @date: 2019-05-14
 * @author: <haitao.lu02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Input, Select, InputNumber, Radio, Checkbox, Tooltip } from 'hzero-ui';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_2_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'hzero-front-hcuz';
import styles from './index.less';

const FormItem = Form.Item;
const EDIT_FORM_ITEM_LAYOUT_2 = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 20,
  },
};

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
    'bid.bidcommon',
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
    // this.getSelectedRows();
    // this.handleChangeFormItem();
    // this.sum()
  }

  @Bind
  changeLovPro(_, record) {
    this.props.getDetailList.productType = record.categoryName;
  }

  @Bind
  changeLovPurchaser(_, record) {
    this.props.getDetailList.purchaser = record.meaning;
  }

  @Bind
  onchangeValue(e) {
    this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
      console.log('values', values);
    });
    this.props.getDetailList.priceSecret = e.target.checked;
    console.log(
      'props',
      this.props.getDetailList.priceSecret,
      this.props.getDetailList.specialPrice,
      e
    );
  }

  @Bind
  onchangeValue1(e) {
    this.props.form.validateFieldsAndScroll({ force: true }, (err, values) => {
      console.log('values', values);
    });
    this.props.getDetailList.specialPrice = e.target.checked;
    console.log(
      'props',
      this.props.getDetailList.priceSecret,
      this.props.getDetailList.specialPrice,
      e
    );
  }

  /**
   * 改变设置已编辑标识
   */
  // @Bind()
  // handleChangeFormItem() {
  //   const {
  //     form,
  //     // getDetailList,
  //   } = this.props;

  //   form.validateFieldsAndScroll({ force: true }, (err, values) => {

  //     if (this.props.getDetailList) {
  //       this.props.getDetailList.budgetLocalAmountCapex = values.budgetLocalAmountCapex
  //       this.props.getDetailList.budgetLocalAmountMpex = values.budgetLocalAmountMpex,
  //         this.props.getDetailList.budgetLocalAmountOpex = values.budgetLocalAmountOpex
  //       this.props.getDetailList.budgetLocalAmountTotal = values.budgetLocalAmountTotal
  //       this.props.getDetailList.budgetOriginalAmountCapex = values.budgetOriginalAmountCapex
  //       this.props.getDetailList.budgetOriginalAmountMpex = values.budgetOriginalAmountMpex
  //       this.props.getDetailList.budgetOriginalAmountOpex = values.budgetOriginalAmountOpex
  //       this.props.getDetailList.budgetOriginalAmountTotal = values.budgetOriginalAmountTotal
  //       this.props.getDetailList.budgetOriginalAmountCos = values.budgetOriginalAmountCos
  //       this.props.getDetailList.budgetLocalAmountCos = values.budgetLocalAmountCos
  //       this.props.getDetailList.packageName = values.packageName
  //       this.props.getDetailList.packageNo = values.packageNo
  //       this.props.getDetailList.priceRate = values.priceRate
  //       this.props.getDetailList.proCode = values.proCode
  //       this.props.getDetailList.proName = values.proName
  //       // this.props.getDetailList.productType = values.productType
  //       this.props.getDetailList.purchaseType = values.purchaseType
  //       this.props.getDetailList.tenRate = values.tenRate
  //       // this.props.getDetailList.priceSecret = values.priceSecret
  //       // this.props.getDetailList.specialPrice = values.specialPrice
  //       // this.props.getDetailList.bidNum = values.bidNum
  //       // this.props.getDetailList.purchaser = values.purchaser

  //     }

  //   })
  //   // this.sum()
  //   // console.log('123',getEditTableData(templateTargetList, ['id']))
  // }

  // sum() {
  //   if (this.props.getDetailList.budgetOriginalAmountTotal != '' && this.props.getDetailList.budgetLocalAmountTotal != '') {
  //     if (this.props.getDetailList.budgetOriginalAmountTotal == 0 || this.props.getDetailList.budgetLocalAmountTotal == 0) {
  //       this.props.getDetailList.exchangeRate = 0
  //     } else {
  //       this.props.getDetailList.exchangeRate = this.props.getDetailList.budgetOriginalAmountTotal / this.props.getDetailList.budgetLocalAmountTotal
  //     }
  //   } else {
  //     this.props.getDetailList.exchangeRate = 0
  //   }
  //   this.handleChangeFormItem()
  // }
  /**
   * 供应商Lov修改回调
   * @param {*} value
   * @param {*} record
   */
  @Bind()
  handleChangeSupplier(value, record) {
    const { dataSource, onChangeHeader } = this.props;
    const { supplierTenantId, supplierCompanyCode, supplierCompanyName, supplierCurrencyCode } =
      record;
    // this.handleChangeFormItem();
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
    // this.handleChangeFormItem();
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
    // this.handleChangeFormItem();
  }

  /**
   * 校验显示的默认值
   */
  @Bind()
  getSelectedRows() {
    const { sourceResultDTOs = [], templateDate = {}, isQuoteSource } = this.props;

    const supplierCompanyIds = Array.from(
      new Set(sourceResultDTOs.map((item) => item.supplierCompanyId))
    );
    const supplierCompanyNames = Array.from(
      new Set(sourceResultDTOs.map((item) => item.supplierCompanyName))
    );
    const supplierTenantIds = Array.from(
      new Set(sourceResultDTOs.map((item) => item.supplierTenantId))
    );

    const ouIds = Array.from(new Set(sourceResultDTOs.map((item) => item.ouId)));
    const ouNames = Array.from(new Set(sourceResultDTOs.map((item) => item.ouName)));

    const purchaseOrganizatioIds = Array.from(
      new Set(sourceResultDTOs.map((item) => item.purOrganizationId))
    );
    const purchaseOrganizatioNames = Array.from(
      new Set(sourceResultDTOs.map((item) => item.purchaseOrganizatioName))
    );

    const purchaseAgentIds = Array.from(
      new Set(sourceResultDTOs.map((item) => item.purchaseAgentId))
    );
    const purchaseAgentNames = Array.from(
      new Set(sourceResultDTOs.map((item) => item.purchaseAgentName))
    );

    const companyIds = Array.from(new Set(sourceResultDTOs.map((item) => item.companyId)));
    const companyNames = Array.from(new Set(sourceResultDTOs.map((item) => item.companyName)));

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

    mergeList.forEach((item) => {
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
    const { handleExpenseUnitChange = (e) => e } = this.props;
    // this.handleChangeFormItem();
    handleExpenseUnitChange(value, record);
  }

  render() {
    const { tenantId } = this.state;
    const {
      editable = false,
      maintainEditable = false,
      // alterationFlag = 0,
      form = {},
      dataSource = {},
      detailEnumMap = {},
      customizeForm,
      getDetailList = {},
      matchs,
      isShow,
    } = this.props;
    const { listType = [], yesNo = [], listTypeNew = [] } = detailEnumMap;
    const { getFieldDecorator = (e) => e, getFieldValue } = form;
    const {
      budgetLocalAmountCapex = '',
      budgetLocalAmountMpex = '',
      budgetLocalAmountOpex = '',
      budgetLocalAmountTotal = '',
      budgetOriginalAmountCapex = '',
      budgetOriginalAmountMpex = '',
      budgetOriginalAmountOpex = '',
      budgetOriginalAmountTotal = '',
      // exchangeRate,
      budgetLocalAmountCos = '',
      budgetOriginalAmountCos = '',
      talOriginalCurrencyZero = '',
      talCurrencyZero = '',
      packageName = '',
      packageNo = '',
      priceRate = '',
      proCode = '',
      proName = '',
      proState = '',
      productName = '',
      productType = '',
      purchaseType = '',
      tenRate = '',
      currencyTotal = '',
      purchaser = '',
      priceSecret = '',
      specialPrice = '',
      bidNum = '',
      productNameMeaning = '',
      buyerMeaning = '',
      proInfoWording,
    } = getDetailList;
    // console.log('flag',bidNum,getDetailList.bidNum)
    let purchaseTypeCN = '';
    (proInfoWording ? listTypeNew : listType).map((item) => {
      if (purchaseType === item.value) {
        purchaseTypeCN = item.meaning
      }
    })
    return customizeForm(
      {
        // code: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL',
        form,
        dataSource,
      },
      <Form className={styles['header-form']}>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row" style={{ 'display': 'flex', 'marginBottom': '11px' }}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl.get('bid.bidcommon.view.title.purchaseschemeno').d('采购方案编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Tooltip placement="top" title={proCode}>
              {getFieldDecorator('proCode', {
                initialValue: proCode,
              })(<Input disabled />)}
              </Tooltip>
            </FormItem>
          </Col>
          <Col {...FORM_COL_2_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl.get(`bid.bidcommon.view.title.purchaseschemename`).d('采购方案名称')}
              key={proName}
              {...EDIT_FORM_ITEM_LAYOUT_2}
            >
              <Tooltip placement="top" title={proName}>
              {getFieldDecorator('proName', {
                initialValue: proName,
              })(<Input style={{ 'width': '98.5%' }} disabled />)}
              </Tooltip>
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl.get('bid.bidcommon.view.title.packageno').d('标包编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Tooltip placement="top" title={packageNo}>
              {getFieldDecorator('packageNo', {
                initialValue: packageNo,
              })(<Input disabled />)}
              </Tooltip>
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Tooltip placement="top" title={packageName}>
              {getFieldDecorator('packageName', {
                initialValue: packageName,
              })(<Input disabled />)}
              </Tooltip>
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl.get(`bid.bidcommon.view.title.procurement`).d('采购方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Tooltip placement="top" title={purchaseTypeCN}>
              {getFieldDecorator('purchaseType', {
                initialValue: purchaseType || '请选择',
              })(
                <Select
                  allowClear
                  style={{ minWidth: 150 }}
                  disabled
                  placeholder="请选择"
                  // onChange={this.handleChangeFormItem()}
                >
                  {(proInfoWording ? listType : listTypeNew).map((n) => (
                    <Select.Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
              </Tooltip>
            </FormItem>
          </Col>
        </Row>
        {/* <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl
                .get('bid.bidcommon.view.title.budgetcapex-originalcurrency')
                .d('预算Capex(原币）')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Tooltip placement="top" title={budgetOriginalAmountCapex}>
              <span className="ant-input-group-wrapper">
                <span className="ant-input-wrapper ant-input-group">
                  {getFieldDecorator('budgetOriginalAmountCapex', {
                    initialValue: budgetOriginalAmountCapex,
                  })(
                    <InputNumber
                      className="input-money"
                      precision={2}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      disabled
                    />
                  )}
                  <span style={{ width: '17%' }} className="ant-input-group-addon">
                    {currencyTotal}
                  </span>
                </span>
              </span>
              </Tooltip>
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl
                .get('bid.bidcommon.view.title.budgetopex-originalcurrency')
                .d('预算Opex(原币)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Tooltip placement="top" title={budgetOriginalAmountOpex}>
              <span className="ant-input-group-wrapper">
                <span className="ant-input-wrapper ant-input-group">
                  {getFieldDecorator('budgetOriginalAmountOpex', {
                    initialValue: budgetOriginalAmountOpex,
                  })(
                    <InputNumber
                      className="input-money"
                      disabled
                      precision={2}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      addonAfter="美元"
                    />
                    //  (
                    //   <Input
                    //   disabled
                    //   placeholder={currencyTotal}
                    //   />
                    // )
                  )}
                  <span style={{ width: '17%' }} className="ant-input-group-addon">
                    {currencyTotal}
                  </span>
                </span>
              </span>
              </Tooltip>
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl
                .get('bid.bidcommon.view.title.budgetmpex-originalcurrency')
                .d('预算Mpex(原币)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Tooltip placement="top" title={budgetOriginalAmountMpex}>
              <span className="ant-input-group-wrapper">
                <span className="ant-input-wrapper ant-input-group">
                  {getFieldDecorator('budgetOriginalAmountMpex', {
                    initialValue: budgetOriginalAmountMpex,
                  })(
                    editable || maintainEditable ? (
                      <InputNumber
                        className="input-money"
                        precision={2}
                        disabled
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        addonAfter="美元"
                      />
                    ) : (
                      <span>{budgetOriginalAmountMpex}</span>
                    )
                  )}
                  <span style={{ width: '17%' }} className="ant-input-group-addon">
                    {currencyTotal}
                  </span>
                </span>
              </span>
              </Tooltip>
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl.get('bid.bidcommon.view.title.budgetcapex-hkd').d('预算Capex(港币)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Tooltip placement="top" title={budgetLocalAmountCapex}>

              {getFieldDecorator('budgetLocalAmountCapex', {
                initialValue: budgetLocalAmountCapex,
              })(
                editable ? (
                  <InputNumber
                    className="input-money"
                    precision={2}
                    disabled
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  />
                ) : (
                  <span>{budgetLocalAmountCapex}</span>
                )
              )}
              </Tooltip>
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl.get('bid.bidcommon.view.title.budgetopex-hkd').d('预算Opex(港币)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
               <Tooltip placement="top" title={budgetLocalAmountOpex}>
              {getFieldDecorator('budgetLocalAmountOpex', {
                initialValue: budgetLocalAmountOpex,
              })(
                editable ? (
                  <InputNumber
                    className="input-money"
                    precision={2}
                    disabled
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  />
                ) : (
                  <span>{budgetLocalAmountOpex}</span>
                )
              )}
              </Tooltip>
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl.get('bid.bidcommon.view.title.budgetmpex-hkd').d('预算Mpex(港币)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Tooltip placement="top" title={budgetLocalAmountMpex}>
              {getFieldDecorator('budgetLocalAmountMpex', {
                initialValue: budgetLocalAmountMpex,
              })(
                editable || maintainEditable ? (
                  <InputNumber
                    className="input-money"
                    precision={2}
                    disabled
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  />
                ) : (
                  <span>{budgetLocalAmountMpex}</span>
                )
              )}
              </Tooltip>
            </FormItem>
          </Col>
        </Row> */}
        {/* <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl
                .get('bid.bidcommon.bid.title.BudgetCosoriginalcurrency')
                .d('预算Cos(原币)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Tooltip placement="top" title={budgetOriginalAmountCos}>
              <span className="ant-input-group-wrapper">
                <span className="ant-input-wrapper ant-input-group">
                  {getFieldDecorator('budgetOriginalAmountCos', {
                    initialValue: budgetOriginalAmountCos,
                  })(
                    <InputNumber
                      className="input-money"
                      precision={2}
                      disabled
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      addonAfter="美元"
                    />
                  )}
                  <span style={{ width: '17%' }} className="ant-input-group-addon">
                    {currencyTotal}
                  </span>
                </span>
              </span>
              </Tooltip>
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl
                .get('bid.bidcommon.view.title.Currentpackageamountoriginalcurrency')
                .d('当前标包金额(原币)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Tooltip placement="top" title={budgetOriginalAmountTotal}>
              <span className="ant-input-group-wrapper">
                <span className="ant-input-wrapper ant-input-group">
                  {getFieldDecorator('budgetOriginalAmountTotal', {
                    initialValue: budgetOriginalAmountTotal,
                  })(
                    <InputNumber
                      className="input-money"
                      precision={2}
                      disabled
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  )}
                  <span style={{ width: '17%' }} className="ant-input-group-addon">
                    {currencyTotal}
                  </span>
                </span>
              </span>
              </Tooltip>
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl
                .get('bid.bidcommon.view.title.Totalbudgetofpurchaseschemeoriginalcurrency')
                .d('采购方案总预算(原币)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Tooltip placement="top" title={talOriginalCurrencyZero}>
              <span className="ant-input-group-wrapper">
                <span className="ant-input-wrapper ant-input-group">
                  {getFieldDecorator('talOriginalCurrencyZero', {
                    initialValue: talOriginalCurrencyZero,
                  })(
                    <InputNumber
                      className="input-money"
                      precision={2}
                      disabled
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  )}
                  <span style={{ width: '17%' }} className="ant-input-group-addon">
                    {currencyTotal}
                  </span>
                </span>
              </span>
              </Tooltip>
            </FormItem>
          </Col>
        </Row> */}
        {/* <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl.get('bid.bidcommon.bid.title.BudgetCosHK').d('预算Cos(港币)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Tooltip placement="top" title={budgetLocalAmountCos}>
              <span className="ant-input-group-wrapper">
                <span className="ant-input-wrapper ant-input-group">
                  {getFieldDecorator('budgetLocalAmountCos', {
                    initialValue: budgetLocalAmountCos,
                  })(
                    <InputNumber
                      className="input-money"
                      precision={2}
                      disabled
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  )}
                  
                </span>
              </span>
              </Tooltip>
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl
                .get('bid.bidcommon.view.title.CurrentpackageamountHK')
                .d('当前标包金额(港币)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Tooltip placement="top" title={budgetLocalAmountTotal}>
              {getFieldDecorator('budgetLocalAmountTotal', {
                initialValue: budgetLocalAmountTotal,
              })(
                <InputNumber
                  className="input-money"
                  precision={2}
                  disabled
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              )}
              </Tooltip>
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl
                .get('bid.bidcommon.view.title.TotalbudgetofprocurementschemeHK')
                .d('采购方案总预算(港币)')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Tooltip placement="top" title={talCurrencyZero}>
              {getFieldDecorator('talCurrencyZero', {
                initialValue: talCurrencyZero,
              })(
                <InputNumber
                  className="input-money"
                  precision={2}
                  disabled
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              )}
              </Tooltip>
            </FormItem>
          </Col>
        </Row> */}

        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl.get('bid.bidcommon.view.title.exchangerate').d('汇率')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Tooltip placement="top" title={this.props.getDetailList.exchangeRate}>
              {getFieldDecorator('exchangeRate', {
                initialValue: this.props.getDetailList.exchangeRate,
              })(<Input disabled />)}
              </Tooltip>
            </FormItem>
          </Col> */}
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl.get(`bid.bidcommon.view.title.specialquotation`).d('特殊报价')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('specialPrice', {
                initialValue: specialPrice,
              })(
                <div>
                  <Checkbox
                    checked={specialPrice === 'YES'}
                    checkedValue="YES"
                    unCheckedValue=""
                    onChange={this.onchangeValue1}
                    disabled
                  >
                    {intl.get('bid.bidcommon.view.title.yes')}
                  </Checkbox>{' '}
                  <Checkbox
                    checked={specialPrice === 'NO'}
                    checkedValue="NO"
                    unCheckedValue=""
                    onChange={this.onchangeValue1}
                    disabled
                  >
                    {intl.get('bid.bidcommon.view.title.no')}
                  </Checkbox>
                </div>
                // (
                // <RadioGroup onChange={this.handleChangeFormItem()} value={specialPrice}>
                //   <Radio value={'YES'}>是</Radio>
                //   <Radio value={'NO'}>否</Radio>
                // </RadioGroup>
                // <Select allowClear style={{ minWidth: 150 }}
                //   placeholder="请选择"
                //   onChange={this.handleChangeFormItem()}>
                //   {yesNo.map((n) => (
                //     <Select.Option key={n.value} value={n.value}>
                //       {n.meaning}
                //     </Select.Option>
                //   ))}
                // </Select>
                // )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl.get(`bid.bidcommon.view.title.offerconfidential`).d('报价保密')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('priceSecret', {
                initialValue: priceSecret,
              })(
                <div>
                  <Checkbox
                    checked={priceSecret === 'YES'}
                    disabled
                    checkedValue="YES"
                    unCheckedValue=""
                    onChange={this.onchangeValue}
                  >
                    {intl.get('bid.bidcommon.view.title.yes')}
                  </Checkbox>{' '}
                  <Checkbox
                    checked={priceSecret === 'NO'}
                    disabled
                    checkedValue="NO"
                    unCheckedValue=""
                    onChange={this.onchangeValue}
                  >
                    {intl.get('bid.bidcommon.view.title.no')}
                  </Checkbox>
                </div>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl.get('bid.bidcommon.view.title.productname').d('产品名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Tooltip placement="top" title={productNameMeaning}>
              {getFieldDecorator('productType', {
                initialValue: productNameMeaning,
              })(
                <Lov
                  code="SMDM.TREE_ITEM_CATEGORY"
                  textValue={productNameMeaning}
                  disabled
                  // lovOptions={
                  //   valueField:'tenantName',
                  //   displayField:'tenantId'
                  // }
                  textField="concurrentName"
                  queryParams={{
                    enabledFlag: 1,
                    companyId: getFieldValue('productType'),
                    tenantId,
                  }}
                  onChange={this.changeLovPro}
                  // onChange={this.handleChangePcTypeId}
                />
              )}
              </Tooltip>
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
        
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl.get('bid.bidcommon.bid.title.Numberofsuccessfulbidders').d('中标人数')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Tooltip placement="top" title={bidNum}>
              {getFieldDecorator('bidNum', {
                initialValue: bidNum,
              })(<InputNumber disabled />)}
              </Tooltip>
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem className={styles['labelStyle']}
              label={intl.get('bid.bidcommon.bid.button.SigningSubject').d('采购方')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <Tooltip placement="top" title={buyerMeaning}>
              {getFieldDecorator('purchaser', {
                initialValue: buyerMeaning,
              })(
                editable || maintainEditable ? (
                  <Lov
                    code="VP.CONTRACT_SIGN_ENTITY_NAME"
                    textValue={buyerMeaning}
                    disabled
                    queryParams={{
                      enabledFlag: 1,
                      companyId: getFieldValue('purchaser'),
                      tenantId,
                    }}
                    onChange={this.changeLovPurchaser}
                    // onChange={this.handleChangePcTypeId}
                  />
                ) : (
                  <span>{productType}</span>
                )
              )}
              </Tooltip>
            </FormItem>
          </Col>
          {isShow&&  <Col {...FORM_COL_3_LAYOUT}>
              <FormItem className={styles['labelStyle']}
                label={intl.get('bid.bidcommon.view.title.technicalproportion').d('技术比例')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                <Tooltip placement="top" title={tenRate}>
                <span className="ant-input-group-wrapper">
                  <span className="ant-input-wrapper ant-input-group">
                    {getFieldDecorator('tenRate', {
                      initialValue: tenRate,
                    })(
                      editable || maintainEditable ? (
                        <InputNumber min={0} max={100} disabled />
                      ) : (
                        <span>{tenRate}</span>
                      )
                    )}
                    <span style={{ width: '17%' }} className="ant-input-group-addon">
                      %
                    </span>
                  </span>
                </span>
                </Tooltip>
              </FormItem>
            </Col>

          }
        </Row>
        {isShow && <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem className={styles['labelStyle']}
                label={intl.get('bid.bidcommon.view.title.priceproportion').d('价格比例')}
                key={priceRate}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                <Tooltip placement="top" title={priceRate}>
                <span className="ant-input-group-wrapper">
                  <span className="ant-input-wrapper ant-input-group">
                    {getFieldDecorator('priceRate', {
                      initialValue: priceRate,
                    })(
                      editable || maintainEditable ? (
                        <InputNumber min={0} max={100} disabled />
                      ) : (
                        <span>{priceRate}</span>
                      )
                    )}
                    <span style={{ width: '17%' }} className="ant-input-group-addon">
                      %
                    </span>
                  </span>
                </span>
                </Tooltip>
              </FormItem>
            </Col>
        </Row>}
      </Form>
    );
  }
}
