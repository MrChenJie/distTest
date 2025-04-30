/*
 * ContractHeader - ui修改
 * @date: 2023-08-04
 * @author: <haitao.lu02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Col, InputNumber, Checkbox, Input } from 'antd';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import { getCurrentOrganizationId } from 'utils/utils';
import CusButton from '_cus_components/CusButton';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'hzero-front-hcuz';
import styles from './index.less';
import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';
import CusInputNumber from '_cus_components/CusInputNumber';

const screenWidth = window.screen.width;
const promptCode = 'HKPC.commom';

const FormItem = Form.Item;

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
    promptCode,
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
      signFlag: false,
      showMore: false,
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  componentDidMount() {
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
   * 供应商Lov修改回调
   * @param {*} value
   * @param {*} record
   */
  @Bind()
  handleChangeSupplier(value, record) {
    const { dataSource, onChangeHeader } = this.props;
    const { supplierTenantId, supplierCompanyCode, supplierCompanyName, supplierCurrencyCode } =
      record;
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
    const gridSpan = getDFormGridSpan();
    const { tenantId, showMore } = this.state;
    const {
      editable = false,
      maintainEditable = false,
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
      packageName = '',
      packageNo = '',
      priceRate = '',
      proCode = '',
      proName = '',
      productType = '',
      purchaseType = '',
      tenRate = '',
      priceSecret = '',
      specialPrice = '',
      bidNum = '',
      productNameMeaning = '',
      buyerMeaning = '',
      proInfoWording,
      budgetLocalAmountCapex,
      budgetLocalAmountOpex,
      purchasingEmpName,
      budgetAmount,
      talCurrencyZero,
    } = getDetailList;
    // 总预算港币：50万 ~ 100万的金额判断
    const isTalZero = Number(talCurrencyZero) > 500000 && Number(talCurrencyZero) <= 1000000;
    // console.log('flag',bidNum,getDetailList.bidNum)
    let purchaseTypeCN = '';
    (isTalZero ? listTypeNew : listType).map((item) => {
      if (purchaseType === item.value) {
        purchaseTypeCN = item.meaning
      }
    })
    return customizeForm(
      {
        form,
        dataSource,
      },
      <Form className="customize-form">
        <GenerateFormGrid isPackUp={true} defaultPackUp={false}>
          <Col {...gridSpan}>
            <FormItem
              label={intl.get('bid.bidcommon.view.title.purchaseschemeno').d('采购方案编号')}
            >
              {getFieldDecorator('proCode', {
                initialValue: proCode,
              })(<CusInput disabled />)}
            </FormItem>
          </Col>
          <Col {...gridSpan}>
            <FormItem
              label={intl.get(`bid.bidcommon.view.title.purchaseschemename`).d('采购方案名称')}
              key={proName}
            >
              {getFieldDecorator('proName', {
                initialValue: proName,
              })(<CusInput disabled />)}
            </FormItem>
          </Col>
          <Col {...gridSpan}>
            <FormItem
              label={intl.get('bid.bidcommon.view.title.packageno').d('标包编号')}
            >
              {getFieldDecorator('packageNo', {
                initialValue: packageNo,
              })(<CusInput disabled />)}
            </FormItem>
          </Col>
          <Col {...gridSpan}>
            <FormItem
              label={intl.get('bid.bidcommon.view.title.packagename').d('标包名称')}
            >
              {getFieldDecorator('packageName', {
                initialValue: packageName,
              })(<CusInput disabled />)}
            </FormItem>
          </Col>
          <Col {...gridSpan}>
            <FormItem
              label={intl.get(`bid.bidcommon.view.title.procurement`).d('采购方式')}
            >
              {getFieldDecorator('purchaseType', {
                initialValue: purchaseType,
              })(
                <CusSelect
                  allowClear
                  disabled
                  options={isTalZero ? listTypeNew : listType}
                >
                </CusSelect>
              )}
            </FormItem>
          </Col>
          {/* <Col {...gridSpan}>
            <FormItem
              label={intl.get(`bid.bidcommon.view.title.specialquotation`).d('特殊报价')}
            >
              {getFieldDecorator('specialPrice', {
                initialValue: specialPrice,
              })(
                <div className={styles['checkbox-form']}>
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
              )}
            </FormItem>
          </Col> */}
          {/* <Col {...gridSpan}>
            <FormItem
              label={intl.get(`bid.bidcommon.view.title.offerconfidential`).d('报价保密')}
            >
              {getFieldDecorator('priceSecret', {
                initialValue: priceSecret,
              })(
                <div className={styles['checkbox-form']}>
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
          </Col> */}
          {/* <Col {...gridSpan}>
            <FormItem
              label={intl.get('bid.bidcommon.view.title.productname').d('产品名称')}
            >
              {getFieldDecorator('productType', {
                initialValue: productNameMeaning,
              })(
                <CusLov
                  code="SMDM.TREE_ITEM_CATEGORY"
                  textValue={productNameMeaning}
                  disabled
                  textField="concurrentName"
                  queryParams={{
                    enabledFlag: 1,
                    companyId: getFieldValue('productType'),
                    tenantId,
                  }}
                  onChange={this.changeLovPro}
                />
              )}
            </FormItem>
          </Col> */}
          {/* <Col {...gridSpan}>
            <FormItem
              label={intl.get('bid.bidcommon.bid.button.SigningSubject').d('采购方')}
            >
              {getFieldDecorator('purchaser', {
                initialValue: buyerMeaning,
              })(
                editable || maintainEditable ? (
                  <CusLov
                    code="VP.CONTRACT_SIGN_ENTITY_NAME"
                    textValue={buyerMeaning}
                    disabled
                    queryParams={{
                      enabledFlag: 1,
                      companyId: getFieldValue('purchaser'),
                      tenantId,
                    }}
                    onChange={this.changeLovPurchaser}
                  />
                ) : (
                  <span>{productType}</span>
                )
              )}
            </FormItem>
          </Col> */}
          <Col {...gridSpan}>
            <FormItem
              label={intl
                .get(`${promptCode}.view.title.eettimatedbudgetamountH`)
                .d('预算总金额(HKD)')}
            >
              {getFieldDecorator('budgetAmount', {
                initialValue: budgetAmount,
              })(
                <CusInputNumber
                  min={0}
                  precision={2}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  disabled
                />
              )}
            </FormItem>
          </Col>
          <Col {...gridSpan}>
            <FormItem
              label={intl.get(`${promptCode}.view.title.CapexBudgetAmountHKD`).d('Capex预算金额(HKD)')}
            >
              {getFieldDecorator('budgetLocalAmountCapex', {
                initialValue: budgetLocalAmountCapex,
              })(
                <CusInputNumber
                  min={0}
                  precision={2}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  disabled
                />
              )}
            </FormItem>
          </Col>
          <Col {...gridSpan}>
            <FormItem
              label={intl.get(`${promptCode}.view.title.OpexBudgetAmountHKD`).d('Opex预算金额(HKD)')}
            >
              {getFieldDecorator('budgetLocalAmountOpex', {
                initialValue: budgetLocalAmountOpex,
              })(
                <CusInputNumber
                  min={0}
                  precision={2}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  disabled
                />
              )}
            </FormItem>
          </Col>
          {isShow && <Col {...gridSpan}>
            <FormItem
              label={intl.get('bid.bidcommon.view.title.technicalproportion').d('技术比例')}
            >
              {getFieldDecorator('tenRate', {
                  initialValue: tenRate,
                })(
                  <InputNumber min={0} max={100} disabled/>
                )
              }
            </FormItem>
          </Col>
          }
          {isShow && <Col {...gridSpan}>
            <FormItem
              label={intl.get('bid.bidcommon.view.title.priceproportion').d('价格比例')}
            >
              {getFieldDecorator('priceRate', {
                  initialValue: priceRate,
                })(
                  <InputNumber min={0} max={100} disabled/>
                )
              }
            </FormItem>
          </Col>
          }
          <Col {...gridSpan}>
            <FormItem
              label={intl
                .get(`${promptCode}.view.title.procurementhandler`)
                .d('采购经办人')}
            >
              {getFieldDecorator('purchasingEmpName', {
                initialValue: purchasingEmpName,

              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col {...gridSpan} style={{ display: 'none' }}>
            <FormItem
              label={intl.get('bid.bidcommon.bid.title.Numberofsuccessfulbidders').d('中标人数')}
            >
              {getFieldDecorator('bidNum', {
                initialValue: bidNum,
              })(<InputNumber disabled />)}
            </FormItem>
          </Col>
        </GenerateFormGrid>
      </Form>
    );
  }
}
