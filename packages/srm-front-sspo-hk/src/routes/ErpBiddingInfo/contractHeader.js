/**
 * @Description: erp-基本信息
 * @date 2020-11-24
 * @author <jie.chen06@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Input, InputNumber, Select, Checkbox, Spin, Tooltip } from 'hzero-ui';
import ValueList from 'components/ValueList';
import Lov from 'components/Lov';

import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import styles from './index.less';
import { queryMapIdpValue } from 'services/api';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import tipIcon from '@/assets/tips.svg';
import './index.less';

const organizationId = getCurrentOrganizationId();
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
const formlayout2 = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@formatterCollections({
  code: ['bid.bidcommon'],
})
export default class headerDataProjectQaInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fastCodes: {},
      talCurrencyZeroVal: 0,
      talOriginalCurrencyZeroVal: 0,
      isShow: false,
    };
  }

  componentDidMount() {
    const { erpInfo, dispatch } = this.props;
    dispatch({
      type: 'erpBiddingInfo/updateState',
      payload: {
        erpInfo: erpInfo,
      },
    });
    this.getFastCode();
    if (
      erpInfo.procurementType === 'public_bidding' ||
      erpInfo.procurementType === 'invited_bidding'
    ) {
      this.setState({
        isShow: true,
      });
    }
    if (erpInfo.talOriginalCurrencyZero) {
      erpInfo.exchangeRate = erpInfo.talOriginalCurrencyZero / erpInfo.talCurrencyZero;
    }
  }

  getFastCode() {
    const codes = {
      'BID.PROCUREMENT_METHOD': 'BID.PROCUREMENT_METHOD',
      'BID.PROCUREMENT_METHODNEW': 'BID.PROCUREMENT_METHODNEW',
    };
    queryMapIdpValue(codes).then((res) => {
      const response = getResponse(res);
      if (response) {
        this.setState({
          fastCodes: response,
        });
      }
    });
  }

  @Bind
  handleSpecialQuotation(e) {
    const { erpInfo, onSpecialQuotation = (e) => e } = this.props;
    erpInfo.specialQuotationProject = e.target.checked;
    onSpecialQuotation(e.target.checked);
  }

  @Bind
  handleConfidentialItems(e) {
    const { erpInfo, onFidentialItems = (e) => e } = this.props;
    erpInfo.confidentialItems = e.target.checked;
    onFidentialItems(e.target.checked);
  }

  @Bind
  buyerChange(_, record) {
    const {
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
    } = this.props;
  }

  // 采购方案总预算(原币)改变值
  @Bind
  talOriginalCurrencyZeroChange(val) {
    const { erpInfo } = this.props;
    const { talCurrencyZeroVal } = this.state;
    this.setState({
      talOriginalCurrencyZeroVal: val,
    });
    erpInfo.exchangeRate = val / talCurrencyZeroVal || 0;
  }

  // 采购方案总预算(港币)改变值
  @Bind
  talCurrencyZeroChange(val) {
    const { erpInfo } = this.props;
    const { talOriginalCurrencyZeroVal } = this.state;
    this.setState({
      talCurrencyZeroVal: val,
    });
    erpInfo.exchangeRate = talOriginalCurrencyZeroVal / val || 0;
  }

  // 计算原币or港币总合
  @Bind
  changeOriginalOrAmount(value, name) {
    const val = value ? value : 0;
    const { form } = this.props;
    // 原币计算值
    if (name === 'capexO') {
      form.validateFields((err, value) => {
        console.log('val',value)
        const newVal =
          val +
            value.budgetOriginalAmountOpex +
            value.budgetOriginalAmountMpex +
            value.budgetOriginalAmountCos || 0;
        form.setFieldsValue({ budgetOriginalAmountTotal: newVal,budgetLocalAmountTotal: newVal/value.exchangeRate, budgetLocalAmountCapex:val/value.exchangeRate });
      });
    }
    if (name === 'opexO') {
      form.validateFields((err, value) => {
        const newVal =
          val +
            value.budgetOriginalAmountCapex +
            value.budgetOriginalAmountMpex +
            value.budgetOriginalAmountCos || 0;
        form.setFieldsValue({ budgetOriginalAmountTotal: newVal, budgetLocalAmountTotal: newVal/value.exchangeRate, budgetLocalAmountOpex:val/value.exchangeRate });
      });
    }
    if (name === 'mpexO') {
      form.validateFields((err, value) => {
        const newVal =
          val +
            value.budgetOriginalAmountCapex +
            value.budgetOriginalAmountOpex +
            value.budgetOriginalAmountCos || 0;
        form.setFieldsValue({ budgetOriginalAmountTotal: newVal, budgetLocalAmountTotal: newVal/value.exchangeRate, budgetLocalAmountMpex:val/value.exchangeRate });
      });
    }
    if (name === 'cosO') {
      form.validateFields((err, value) => {
        const newVal =
          val +
            value.budgetOriginalAmountCapex +
            value.budgetOriginalAmountOpex +
            value.budgetOriginalAmountMpex || 0;
        form.setFieldsValue({ budgetOriginalAmountTotal: newVal, budgetLocalAmountTotal: newVal/value.exchangeRate, budgetLocalAmountCos:val/value.exchangeRate });
      });
    }

    // 港币计算值
    if (name === 'capexL') {
      form.validateFields((err, value) => {
        const newVal =
          val +
            value.budgetLocalAmountOpex +
            value.budgetLocalAmountMpex +
            value.budgetLocalAmountCos || 0;
        form.setFieldsValue({ budgetLocalAmountTotal: newVal });
      });
    }
    if (name === 'opexL') {
      form.validateFields((err, value) => {
        const newVal =
          val +
            value.budgetLocalAmountCapex +
            value.budgetLocalAmountMpex +
            value.budgetLocalAmountCos || 0;
        form.setFieldsValue({ budgetLocalAmountTotal: newVal });
      });
    }
    if (name === 'mpexL') {
      form.validateFields((err, value) => {
        const newVal =
          val +
            value.budgetLocalAmountCapex +
            value.budgetLocalAmountOpex +
            value.budgetLocalAmountCos || 0;
        form.setFieldsValue({ budgetLocalAmountTotal: newVal });
      });
    }
    if (name === 'cosL') {
      form.validateFields((err, value) => {
        const newVal =
          val +
            value.budgetLocalAmountCapex +
            value.budgetLocalAmountOpex +
            value.budgetLocalAmountMpex || 0;
        form.setFieldsValue({ budgetLocalAmountTotal: newVal });
      });
    }
  }

  @Bind
  onInput(e, value) {
    const { form } = this.props;
    value = form.setFieldsValue({ packageName: e });
  //   const maxLength = 10;
  //   var len = 0;
  //   var result = "";
  //   for(var i = 0; i<e.length; i++ ) {
  //     if(e.charCodeAt(i) > 127 || e.charCodeAt(i) == 94) {
  //       len += 2;
  //       result += e.charAt(i);
  //     } else {
  //       len++;
  //       result += e.charAt(i);
  //     }
  //     if(len > maxLength -1) {
  //       var L = len - maxLength;
  //       if(L > 0) {
  //         return result.substring(0, result.length - L)
  //       }
  //       // return result;
  //       console.log('result', result)
  //       // form.setFieldsValue({packageName: result})
  //       debugger
  //       return form.setFieldsValue({packageName: result})
  //     }
  //   }
  //   // erpInfo.packageName
  //   // value = form.setFieldsValue({ packageName: e });
  //   console.log('result', result)
  //   // form.setFieldsValue({packageName: result});
  //   debugger
  //   return form.setFieldsValue({packageName: result})
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      fetchLoading,
      erpInfo,
      detailEnumMap: { yesNo = [] },
    } = this.props;
    const { fastCodes = {}, isShow = false } = this.state;
    console.log('erp', erpInfo);
    return (
      <Spin spinning={fetchLoading}>
        <div className={styles['spo-basic-style']}>
          <Form>
            <Row gutter={24}>
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl.get(`bid.bidcommon.view.title.packageno`).d('标包编号')}
                >
                  {getFieldDecorator('packageNo', {
                    initialValue: erpInfo.packageNo,
                  })(<Input disabled />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl.get(`bid.bidcommon.view.title.packagename`).d('标包名称')}
                >
                  {getFieldDecorator('packageName', {
                    initialValue: erpInfo.packageName,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`bid.bidcommon.view.title.packagename`).d('标包名称'),
                        }),
                      },
                    ],
                  })(<Input onInput={(e) => this.onInput(e.target.value, erpInfo.packageName)} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl.get(`bid.bidcommon.view.title.procurement`).d('采购方式')}
                >
                  {getFieldDecorator('purchaseType', {
                    initialValue: erpInfo.procurementType || erpInfo.purchaseType,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`bid.bidcommon.view.title.procurement`).d('采购方式'),
                        }),
                      },
                    ],
                  })(
                    <ValueList
                      style={{ width: '100%' }}
                      options={erpInfo.proInfoSetWording ? fastCodes['BID.PROCUREMENT_METHOD'] : fastCodes['BID.PROCUREMENT_METHODNEW']}
                      lazyLoad={false}
                      allowClear
                      onChange={(value) => {
                        erpInfo.procurementType = value;
                        if (value === 'public_bidding' || value === 'invited_bidding') {
                          this.setState({
                            isShow: true,
                          });
                        } else {
                          this.setState({
                            isShow: false,
                          });
                        }
                      }}
                    />
                  )}
                  <Tooltip
                    title={intl.get(`bid.bidcommon.view.message.prompts`).d('根据采购政策要求，招标更改未比选，投标更改为应答')}
                    trigger="hover"
                    placement="top"
                    arrowPointAtCenter
                    autoAdjustOverflow
                  >
                    <img src={tipIcon} alt="tip" className="_cus_tooltip_img" />
                  </Tooltip>
                </FormItem>
              </Col>
            </Row>
            {/* 暂不删除，勿动 */}
            {/* <Row gutter={24}>
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl
                    .get(`bid.bidcommon.view.title.budgetcapex-originalcurrency`)
                    .d('预算Capex(原币)')}
                >
                  <span className="ant-input-group-wrapper">
                    <span className="ant-input-wrapper ant-input-group">
                      {getFieldDecorator('budgetOriginalAmountCapex', {
                        initialValue:
                          erpInfo.capexOriginalCurrency || erpInfo.budgetOriginalAmountCapex || 0,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`bid.bidcommon.view.title.budgetcapex-originalcurrency`)
                                .d('预算Capex(原币)'),
                            }),
                          },
                        ],
                      })(
                        <InputNumber
                          min={0}
                          precision={2}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                          onChange={(val) => this.changeOriginalOrAmount(val, 'capexO')}
                        />
                      )}
                      <span style={{ width: '17%' }} className="ant-input-group-addon">
                        {erpInfo.talCurrencyType || erpInfo.currencyTotal}
                      </span>
                    </span>
                  </span>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl
                    .get(`bid.bidcommon.view.title.budgetopex-originalcurrency`)
                    .d('预算Opex(原币)')}
                >
                  <span className="ant-input-group-wrapper">
                    <span className="ant-input-wrapper ant-input-group">
                      {getFieldDecorator('budgetOriginalAmountOpex', {
                        initialValue:
                          erpInfo.opexOriginalCurrency || erpInfo.budgetOriginalAmountOpex || 0,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`bid.bidcommon.view.title.budgetopex-originalcurrency`)
                                .d('预算Opex(原币)'),
                            }),
                          },
                        ],
                      })(
                        <InputNumber
                          min={0}
                          precision={2}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                          onChange={(val) => this.changeOriginalOrAmount(val, 'opexO')}
                        />
                      )}
                      <span style={{ width: '17%' }} className="ant-input-group-addon">
                        {erpInfo.talCurrencyType || erpInfo.currencyTotal}
                      </span>
                    </span>
                  </span>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl
                    .get(`bid.bidcommon.view.title.budgetmpex-originalcurrency`)
                    .d('预算Mpex(原币)')}
                >
                  <span className="ant-input-group-wrapper">
                    <span className="ant-input-wrapper ant-input-group">
                      {getFieldDecorator('budgetOriginalAmountMpex', {
                        initialValue:
                          erpInfo.mpexOriginalCurrency || erpInfo.budgetOriginalAmountMpex || 0,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`bid.bidcommon.view.title.budgetmpex-originalcurrency`)
                                .d('预算Mpex(原币)'),
                            }),
                          },
                        ],
                      })(
                        <InputNumber
                          min={0}
                          precision={2}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                          onChange={(val) => this.changeOriginalOrAmount(val, 'mpexO')}
                        />
                      )}
                      <span style={{ width: '17%' }} className="ant-input-group-addon">
                        {erpInfo.talCurrencyType || erpInfo.currencyTotal}
                      </span>
                    </span>
                  </span>
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl.get(`bid.bidcommon.view.title.budgetcapex-hkd`).d('预算Capex(港币)')}
                >
                  {getFieldDecorator('budgetLocalAmountCapex', {
                    initialValue: erpInfo.capexCurrency || erpInfo.budgetLocalAmountCapex || 0,
                    // rules: [
                    //   {
                    //     required: true,
                    //     message: intl.get('hzero.common.validation.notNull', {
                    //       name: intl
                    //         .get(`bid.bidcommon.view.title.budgetcapex-hkd`)
                    //         .d('预算Capex(港币)'),
                    //     }),
                    //   },
                    // ],
                  })(
                    <InputNumber
                      min={0}
                      disabled
                      precision={2}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      onChange={(val) => this.changeOriginalOrAmount(val, 'capexL')}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl.get(`bid.bidcommon.view.title.budgetopex-hkd`).d('预算Opex(港币)')}
                >
                  {getFieldDecorator('budgetLocalAmountOpex', {
                    initialValue: erpInfo.opexCurrency || erpInfo.budgetLocalAmountOpex || 0,
                    // rules: [
                    //   {
                    //     required: true,
                    //     message: intl.get('hzero.common.validation.notNull', {
                    //       name: intl
                    //         .get(`bid.bidcommon.view.title.budgetopex-hkd`)
                    //         .d('预算Opex(港币)'),
                    //     }),
                    //   },
                    // ],
                  })(
                    <InputNumber
                      min={0}
                      precision={2}
                      disabled
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      onChange={(val) => this.changeOriginalOrAmount(val, 'opexL')}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl.get(`bid.bidcommon.view.title.budgetmpex-hkd`).d('预算Mpex(港币)')}
                >
                  {getFieldDecorator('budgetLocalAmountMpex', {
                    initialValue: erpInfo.mpexCurrency || erpInfo.budgetLocalAmountMpex || 0,
                    // rules: [
                    //   {
                    //     required: true,
                    //     message: intl.get('hzero.common.validation.notNull', {
                    //       name: intl
                    //         .get(`bid.bidcommon.view.title.budgetmpex-hkd`)
                    //         .d('预算Mpex(港币)'),
                    //     }),
                    //   },
                    // ],
                  })(
                    <InputNumber
                      min={0}
                      precision={2}
                      disabled
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      onChange={(val) => this.changeOriginalOrAmount(val, 'mpexL')}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl
                    .get(`bid.bidcommon.bid.title.BudgetCosoriginalcurrency`)
                    .d('预算Cos(原币)')}
                >
                  <span className="ant-input-group-wrapper">
                    <span className="ant-input-wrapper ant-input-group">
                      {getFieldDecorator('budgetOriginalAmountCos', {
                        initialValue:
                          erpInfo.cosOriginalCurrency || erpInfo.budgetOriginalAmountCos || 0,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`bid.bidcommon.bid.title.BudgetCosoriginalcurrency`)
                                .d('预算Cos(原币)'),
                            }),
                          },
                        ],
                      })(
                        <InputNumber
                          min={0}
                          precision={2}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                          onChange={(val) => this.changeOriginalOrAmount(val, 'cosO')}
                        />
                      )}
                      <span style={{ width: '17%' }} className="ant-input-group-addon">
                        {erpInfo.talCurrencyType || erpInfo.currencyTotal}
                      </span>
                    </span>
                  </span>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl
                    .get(`bid.bidcommon.view.title.Currentpackageamountoriginalcurrency`)
                    .d('当前标包金额(原币)')}
                >
                  <span className="ant-input-group-wrapper">
                    <span className="ant-input-wrapper ant-input-group">
                      {getFieldDecorator('budgetOriginalAmountTotal', {
                        initialValue:
                          erpInfo.talOriginalCurrency || erpInfo.budgetOriginalAmountTotal || 0,
                      })(
                        <InputNumber
                          disabled
                          min={0}
                          precision={2}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        />
                      )}
                      <span style={{ width: '17%' }} className="ant-input-group-addon">
                        {erpInfo.talCurrencyType || erpInfo.currencyTotal}
                      </span>
                    </span>
                  </span>
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl
                    .get(`bid.bidcommon.view.title.Totalbudgetofpurchaseschemeoriginalcurrency`)
                    .d('采购方案总预算(原币)')}
                >
                  <span className="ant-input-group-wrapper">
                    <span className="ant-input-wrapper ant-input-group">
                      {getFieldDecorator('talOriginalCurrencyZero', {
                        initialValue: erpInfo.talOriginalCurrencyZero,
                      })(
                        <InputNumber
                          onChange={this.talOriginalCurrencyZeroChange}
                          disabled
                          min={0}
                          precision={2}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        />
                      )}
                      <span style={{ width: '17%' }} className="ant-input-group-addon">
                        {erpInfo.talCurrencyType || erpInfo.currencyTotal}
                      </span>
                    </span>
                  </span>
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl.get(`bid.bidcommon.bid.title.BudgetCosHK`).d('预算Cos(港币)')}
                >
                  {getFieldDecorator('budgetLocalAmountCos', {
                    initialValue: erpInfo.cosCurrency || erpInfo.budgetLocalAmountCos || 0,
                    // rules: [
                    //   {
                    //     required: true,
                    //     message: intl.get('hzero.common.validation.notNull', {
                    //       name: intl.get(`bid.bidcommon.bid.title.BudgetCosHK`).d('预算Cos(港币)'),
                    //     }),
                    //   },
                    // ],
                  })(
                    <InputNumber
                      min={0}
                      disabled
                      precision={2}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      onChange={(val) => this.changeOriginalOrAmount(val, 'cosL')}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl
                    .get(`bid.bidcommon.view.title.CurrentpackageamountHK`)
                    .d('当前标包金额(港币)')}
                >
                  {getFieldDecorator('budgetLocalAmountTotal', {
                    initialValue: erpInfo.talCurrency || erpInfo.budgetLocalAmountTotal || 0,
                  })(
                    <InputNumber
                      disabled
                      min={0}
                      precision={2}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl
                    .get(`bid.bidcommon.view.title.TotalbudgetofprocurementschemeHK`)
                    .d('采购方案总预算(港币)')}
                >
                  {getFieldDecorator('talCurrencyZero', {
                    initialValue: erpInfo.talCurrencyZero,
                  })(
                    <InputNumber
                      onChange={this.talCurrencyZeroChange}
                      disabled
                      min={0}
                      precision={2}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  )}
                </FormItem>
              </Col>
            </Row> */}
            <Row gutter={24}>
              {/* <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl.get(`bid.bidcommon.view.title.exchangerate`).d('汇率')}
                >
                  {getFieldDecorator('exchangeRate', {
                    initialValue: erpInfo.exchangeRate,
                  })(<InputNumber precision={4} disabled />)}
                </FormItem>
              </Col> */}
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl.get(`bid.bidcommon.view.title.specialquotation`).d('特殊报价')}
                >
                  {getFieldDecorator('specialPrice', {
                    initialValue: erpInfo.specialQuotationProject || erpInfo.specialPrice,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hze1ro.common.validation.notNull').d('请选择'),
                      },
                    ],
                  })(
                    <div>
                      <Checkbox
                        checked={
                          erpInfo.specialQuotationProject === 'YES' ||
                          erpInfo.specialPrice === 'YES'
                        }
                        checkedValue="YES"
                        unCheckedValue=""
                        onChange={this.handleSpecialQuotation}
                      >
                        {intl.get(`bid.bidcommon.view.title.yes`).d('是')}
                      </Checkbox>
                      <Checkbox
                        checked={
                          erpInfo.specialQuotationProject === 'NO' || erpInfo.specialPrice === 'NO'
                        }
                        checkedValue="NO"
                        unCheckedValue=""
                        onChange={this.handleSpecialQuotation}
                      >
                        {intl.get(`bid.bidcommon.view.title.no`).d('否')}
                      </Checkbox>
                    </div>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl.get(`bid.bidcommon.view.title.offerconfidential`).d('报价保密')}
                >
                  {getFieldDecorator('priceSecret', {
                    initialValue: erpInfo.confidentialItems || erpInfo.priceSecret,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hze1ro.common.validation.notNull').d('请选择'),
                      },
                    ],
                  })(
                    <div>
                      <Checkbox
                        checked={
                          erpInfo.confidentialItems === 'YES' || erpInfo.priceSecret === 'YES'
                        }
                        checkedValue="YES"
                        unCheckedValue=""
                        onChange={this.handleConfidentialItems}
                      >
                        {intl.get(`bid.bidcommon.view.title.yes`).d('是')}
                      </Checkbox>
                      <Checkbox
                        checked={erpInfo.confidentialItems === 'NO' || erpInfo.priceSecret === 'NO'}
                        checkedValue="NO"
                        unCheckedValue=""
                        onChange={this.handleConfidentialItems}
                      >
                        {intl.get(`bid.bidcommon.view.title.no`).d('否')}
                      </Checkbox>
                    </div>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl.get('bid.bidcommon.view.title.productname').d('产品名称')}
                >
                  {getFieldDecorator('productType', {
                    initialValue: erpInfo.productName || erpInfo.productType,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`bid.bidcommon.view.title.productname`).d('产品名称'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SMDM.TREE_ITEM_CATEGORY"
                      textValue={erpInfo.productNameMeaning}
                      queryParams={{
                        tenantId: organizationId,
                      }}
                      onChange={(text, item) => {
                        erpInfo.productName = item.productNameMeaning;
                        erpInfo.productType = item.productNameMeaning;
                        getFieldDecorator('productNameMeaning', {
                          initialValue: item.categoryName,
                        });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl
                    .get('bid.bidcommon.bid.title.Numberofsuccessfulbidders')
                    .d('中标人数')}
                >
                  {getFieldDecorator('bidNum', {
                    initialValue: erpInfo.bidWinningAmount || erpInfo.bidNum,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`bid.bidcommon.bid.title.Numberofsuccessfulbidders`)
                            .d('中标人数'),
                        }),
                      },
                    ],
                  })(<InputNumber min={0} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl.get('bid.bidcommon.bid.button.SigningSubject').d('采购方')}
                >
                  {getFieldDecorator('purchaser', {
                    initialValue: erpInfo.buyer || erpInfo.purchaser,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`bid.bidcommon.bid.button.SigningSubject`).d('采购方'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="VP.CONTRACT_SIGN_ENTITY_NAME"
                      textValue={erpInfo.buyerMeaning}
                      queryParams={{
                        tenantId: organizationId,
                      }}
                      onChange={(text, item) => {
                        erpInfo.buyer = item.buyerMeaning;
                        erpInfo.purchaser = item.buyerMeaning;
                        getFieldDecorator('buyerMeaning', {
                          initialValue: item.meaning,
                        });
                      }}
                    />
                  )}
                </FormItem>
                <FormItem
                  style={{ display: 'none' }}
                  {...formlayout2}
                  label={intl.get('spcm.common.model.common.agentName1').d('proId')}
                >
                  {getFieldDecorator('proId', {
                    initialValue: erpInfo.proId,
                  })(<Input />)}
                </FormItem>
                <FormItem
                  style={{ display: 'none' }}
                  {...formlayout2}
                  label={intl.get('spcm.common.model.common.agentName1').d('proId')}
                >
                  {getFieldDecorator('_token', {
                    initialValue: erpInfo._token,
                  })(<Input />)}
                </FormItem>
                <FormItem
                  style={{ display: 'none' }}
                  {...formlayout2}
                  label={intl.get('spcm.common.model.common.agentName1').d('priceType')}
                >
                  {getFieldDecorator('priceType', {
                    initialValue: erpInfo.priceType,
                  })(<Input />)}
                </FormItem>
                <FormItem
                  style={{ display: 'none' }}
                  {...formlayout2}
                  label={intl.get('spcm.common.model.common.agentName1').d('talCurrencyType')}
                >
                  {getFieldDecorator('talCurrencyType', {
                    initialValue: erpInfo.talCurrencyType || erpInfo.currencyTotal,
                  })(<Input />)}
                </FormItem>
                <FormItem
                  style={{ display: 'none' }}
                  {...formlayout2}
                  label={intl.get('spcm.common.model.common.agentName1').d('parentId')}
                >
                  {getFieldDecorator('parentId', {
                    initialValue: erpInfo.parentId,
                  })(<Input />)}
                </FormItem>
              </Col>
              {/* 2023/07/04 配合ERP侧，技术比例和价格比例不在SCM设置，保留SCM的，如ERP设置了，使用ERP的。没有的话使用SCM的 */}
              {isShow && <Col span={8}>
                <FormItem
                  {...formlayout2}
                  label={intl.get('bid.bidcommon.view.title.technicalproportion').d('技术比例')}
                >
                  <span className="ant-input-group-wrapper">
                    <span className="ant-input-wrapper ant-input-group">
                      {getFieldDecorator('tenRate', {
                        initialValue: erpInfo.technicalProportion || erpInfo.tenRate || 0,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`bid.bidcommon.view.title.technicalproportion`)
                                .d('技术比例'),
                            }),
                          },
                        ],
                      })(
                        <InputNumber
                          min={0}
                          max={100}
                          // onChange={this.handleChangeFormItem()}
                        />
                      )}
                      <span style={{ width: '17%' }} className="ant-input-group-addon">
                        %
                      </span>
                    </span>
                  </span>
                </FormItem>
              </Col>}
              { isShow && <Col span={8}>
                  <FormItem
                    {...formlayout2}
                    label={intl.get('bid.bidcommon.view.title.priceproportion').d('价格比例')}
                  >
                    <span className="ant-input-group-wrapper">
                      <span className="ant-input-wrapper ant-input-group">
                        {getFieldDecorator('priceRate', {
                          initialValue: erpInfo.priceProportion || erpInfo.priceRate || 0,
                          rules: [
                            {
                              required: true,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get(`bid.bidcommon.view.title.priceproportion`)
                                  .d('价格比例'),
                              }),
                            },
                          ],
                        })(
                          <InputNumber
                            min={0}
                            max={100}
                            // onChange={this.handleChangeFormItem()}
                          />
                        )}
                        <span style={{ width: '17%' }} className="ant-input-group-addon">
                          %
                        </span>
                      </span>
                    </span>
                  </FormItem>
                </Col>}
            </Row>
          </Form>
        </div>
      </Spin>
    );
  }
}
