/**
 * @Description: 需求人答疑-基本信息
 * @date 2022-06-24
 * @author <jie.chen06@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Input, Checkbox, InputNumber, Tooltip } from 'hzero-ui';
import ValueList from 'components/ValueList';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import styles from './index.less';
import { queryMapIdpValue } from 'services/api';
import Lov from 'components/Lov';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  // FORM_COL_2_LAYOUT,
  FORM_COL_2_3_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT,
} from 'utils/constants';

const tenantId = getCurrentOrganizationId();
const FormItem = Form.Item;
const formlayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
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
    };
  }

  @Debounce(300)
  componentDidMount() {
    this.getFastCode();
  }

  getFastCode() {
    const codes = {
      'BID.PROCUREMENT_METHOD': 'BID.PROCUREMENT_METHOD',
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

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      poHeader,
    } = this.props;

    const { fastCodes = {} } = this.state;
    const isShow = poHeader.purchaseType === 'public_bidding' || poHeader.purchaseType === 'invited_bidding';

    return (
      <div className={styles['spo-basic-style']}>
        <Form>
          <Row gutter={24}>
            <Col span={8}>
              <FormItem
                {...formlayout2}
                key={poHeader.proCode}
                label={intl.get(`bid.bidcommon.view.title.purchaseschemeno`).d('采购方案编号')}
              >
                {getFieldDecorator('proCode', {
                  initialValue: poHeader.proCode,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={16}>
              <FormItem
                {...formlayout}
                key={poHeader.proName}
                label={intl.get(`bid.bidcommon.view.title.purchaseschemename`).d('采购方案名称')}
              >
              <Tooltip title={poHeader.proName} placement="topLeft">
                {getFieldDecorator('proName', {
                  initialValue: poHeader.proName,
                })(<Input disabled />)}
              </Tooltip>
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <FormItem
                {...formlayout2}
                key={poHeader.packageNo}
                label={intl.get(`bid.bidcommon.view.title.packageno`).d('标包编号')}
              >
                {getFieldDecorator('packageNo', {
                  initialValue: poHeader.packageNo,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formlayout2}
                key={poHeader.packageName}
                label={intl.get(`bid.bidcommon.view.title.packagename`).d('标包名称')}
              >
              <Tooltip title={poHeader.packageName} placement="topLeft">
                {getFieldDecorator('packageName', {
                  initialValue: poHeader.packageName,
                })(<Input disabled />)}
              </Tooltip>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formlayout2}
                key={poHeader.purchaseType}
                label={intl.get(`bid.bidcommon.view.title.procurement`).d('采购方式')}
              >
                {getFieldDecorator('purchaseType', {
                  initialValue: poHeader.purchaseType,
                })(
                  <ValueList
                    style={{ width: '100%' }}
                    options={fastCodes['BID.PROCUREMENT_METHOD']}
                    lazyLoad={false}
                    allowClear
                    disabled
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          {/* 暂时不删除 */}
          {/* <Row gutter={24}>
            <Col span={8}>
              <FormItem
                {...formlayout2}
                key={poHeader.budgetOriginalAmountCapex}
                label={intl
                  .get(`bid.bidcommon.view.title.budgetcapex-originalcurrency`)
                  .d('预算Capex(原币)')}
              >
                <span className="ant-input-group-wrapper">
                  <span className="ant-input-wrapper ant-input-group">
                    {getFieldDecorator('budgetOriginalAmountCapex', {
                      initialValue: poHeader.budgetOriginalAmountCapex,
                    })(
                      <InputNumber
                        disabled
                        precision={2}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    )}
                    <span style={{ width: '17%' }} className="ant-input-group-addon">
                      {poHeader.currencyTotal}
                    </span>
                  </span>
                </span>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formlayout2}
                key={poHeader.budgetOriginalAmountOpex}
                label={intl
                  .get(`bid.bidcommon.view.title.budgetopex-originalcurrency`)
                  .d('预算Opex(原币)')}
              >
                <span className="ant-input-group-wrapper">
                  <span className="ant-input-wrapper ant-input-group">
                    {getFieldDecorator('budgetOriginalAmountOpex', {
                      initialValue: poHeader.budgetOriginalAmountOpex,
                    })(
                      <InputNumber
                        disabled
                        precision={2}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    )}
                    <span style={{ width: '17%' }} className="ant-input-group-addon">
                      {poHeader.currencyTotal}
                    </span>
                  </span>
                </span>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formlayout2}
                key={poHeader.budgetOriginalAmountMpex}
                label={intl
                  .get(`bid.bidcommon.view.title.budgetmpex-originalcurrency`)
                  .d('预算Mpex(原币)')}
              >
                <span className="ant-input-group-wrapper">
                  <span className="ant-input-wrapper ant-input-group">
                    {getFieldDecorator('budgetOriginalAmountMpex', {
                      initialValue: poHeader.budgetOriginalAmountMpex,
                    })(
                      <InputNumber
                        disabled
                        precision={2}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    )}
                    <span style={{ width: '17%' }} className="ant-input-group-addon">
                      {poHeader.currencyTotal}
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
                key={poHeader.budgetLocalAmountCapex}
                label={intl.get(`bid.bidcommon.view.title.budgetcapex-hkd`).d('预算Capex(港币)')}
              >
                    {getFieldDecorator('budgetLocalAmountCapex', {
                      initialValue: poHeader.budgetLocalAmountCapex,
                    })(
                      <InputNumber
                        disabled
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
                key={poHeader.budgetLocalAmountOpex}
                label={intl.get(`bid.bidcommon.view.title.budgetopex-hkd`).d('预算Opex(港币)')}
              >
                {getFieldDecorator('budgetLocalAmountOpex', {
                  initialValue: poHeader.budgetLocalAmountOpex,
                })(
                  <InputNumber
                    disabled
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
                key={poHeader.budgetLocalAmountMpex}
                label={intl.get(`bid.bidcommon.view.title.budgetmpex-hkd`).d('预算Mpex(港币)')}
              >
                {getFieldDecorator('budgetLocalAmountMpex', {
                  initialValue: poHeader.budgetLocalAmountMpex,
                })(
                  <InputNumber
                    disabled
                    precision={2}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <FormItem
                {...formlayout2}
                key={poHeader.budgetOriginalAmountCos}
                label={intl
                  .get(`bid.bidcommon.bid.title.BudgetCosoriginalcurrency`)
                  .d('预算Cos(原币)')}
              >
                <span className="ant-input-group-wrapper">
                  <span className="ant-input-wrapper ant-input-group">
                    {getFieldDecorator('budgetOriginalAmountCos', {
                      initialValue: poHeader.budgetOriginalAmountCos,
                    })(
                      <InputNumber
                        disabled
                        precision={2}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    )}
                    <span style={{ width: '17%' }} className="ant-input-group-addon">
                      {poHeader.currencyTotal}
                    </span>
                  </span>
                </span>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formlayout2}
                key={poHeader.budgetOriginalAmountTotal}
                label={intl
                  .get(`bid.bidcommon.view.title.Currentpackageamountoriginalcurrency`)
                  .d('当前标包金额(原币)')}
              >
                <span className="ant-input-group-wrapper">
                  <span className="ant-input-wrapper ant-input-group">
                    {getFieldDecorator('budgetOriginalAmountTotal', {
                      initialValue: poHeader.budgetOriginalAmountTotal,
                    })(
                      <InputNumber
                        disabled
                        precision={2}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    )}
                    <span style={{ width: '17%' }} className="ant-input-group-addon">
                      {poHeader.currencyTotal}
                    </span>
                  </span>
                </span>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formlayout2}
                key={poHeader.budgetOriginalAmountTotal}
                label={intl
                  .get(`bid.bidcommon.view.title.Totalbudgetofpurchaseschemeoriginalcurrency`)
                  .d('采购方案总预算(原币)')}
              >
                <span className="ant-input-group-wrapper">
                  <span className="ant-input-wrapper ant-input-group">
                    {getFieldDecorator('talOriginalCurrencyZero', {
                      initialValue: poHeader.talOriginalCurrencyZero,
                    })(
                      <InputNumber
                        disabled
                        precision={2}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    )}
                    <span style={{ width: '17%' }} className="ant-input-group-addon">
                      {poHeader.currencyTotal}
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
                key={poHeader.budgetLocalAmountCos}
                label={intl.get(`bid.bidcommon.bid.title.BudgetCosHK`).d('预算Cos(港币)')}
              >
                {getFieldDecorator('budgetLocalAmountCos', {
                  initialValue: poHeader.budgetLocalAmountCos,
                })(
                  <InputNumber
                    disabled
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
                key={poHeader.budgetLocalAmountTotal}
                label={intl.get(`bid.bidcommon.view.title.CurrentpackageamountHK`).d('当前标包金额(港币)')}
              >
                {getFieldDecorator('budgetLocalAmountTotal', {
                  initialValue: poHeader.budgetLocalAmountTotal,
                })(
                  <InputNumber
                    disabled
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
                key={poHeader.budgetLocalAmountTotal}
                label={intl.get(`bid.bidcommon.view.title.TotalbudgetofprocurementschemeHK`).d('采购方案总预算(港币)')}
              >
                {getFieldDecorator('talCurrencyZero', {
                  initialValue: poHeader.talCurrencyZero,
                })(
                  <InputNumber
                    disabled
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
                key={poHeader.exchangeRate}
                label={intl.get(`bid.bidcommon.view.title.exchangerate`).d('汇率')}
              >
                {getFieldDecorator('exchangeRate', {
                  initialValue: poHeader.exchangeRate,
                })(<Input disabled />)}
              </FormItem>
            </Col> */}
            <Col span={8}>
              <FormItem
                {...formlayout2}
                key={poHeader.specialPrice}
                label={intl.get(`bid.bidcommon.view.title.specialquotation`).d('特殊报价')}
              >
                {getFieldDecorator('specialPrice', {
                  initialValue: poHeader.specialPrice,
                })(
                  <div>
                    <Checkbox
                      disabled
                      checked={poHeader.specialPrice === 'YES'}
                      checkedValue="YES"
                      unCheckedValue=""
                    >
                      {intl.get(`bid.bidcommon.view.title.yes`).d('是')}
                    </Checkbox>
                    <Checkbox
                      disabled
                      checked={poHeader.specialPrice === 'NO'}
                      checkedValue="NO"
                      unCheckedValue=""
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
                key={poHeader.priceSecret}
                label={intl.get(`bid.bidcommon.view.title.offerconfidential`).d('报价保密')}
              >
                {getFieldDecorator('priceSecret', {
                  initialValue: poHeader.priceSecret,
                })(
                  <div>
                    <Checkbox
                      disabled
                      checked={poHeader.priceSecret === 'YES'}
                      checkedValue="YES"
                      unCheckedValue=""
                    >
                      {intl.get(`bid.bidcommon.view.title.yes`).d('是')}
                    </Checkbox>
                    <Checkbox
                      disabled
                      checked={poHeader.priceSecret === 'NO'}
                      checkedValue="NO"
                      unCheckedValue=""
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
                key={poHeader.productName}
                label={intl.get(`bid.bidcommon.view.title.productname`).d('产品名称')}
              >
                {getFieldDecorator('productName', {
                  initialValue: poHeader.productNameMeaning,
                })(
                  <Lov
                  code="SMDM.TREE_ITEM_CATEGORY"
                  textValue={poHeader.productNameMeaning}
                  disabled
                  textField="concurrentName"
                  queryParams={{
                    enabledFlag: 1,
                    companyId: getFieldValue('productType'),
                    tenantId,
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
                key={poHeader.bidNum}
                label={intl.get('bid.bidcommon.bid.title.Numberofsuccessfulbidders').d('中标人数')}
              >
                {getFieldDecorator('bidNum', {
                  initialValue: poHeader.bidNum,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem
                {...formlayout2}
                key={poHeader.purchaser}
                label={intl.get('bid.bidcommon.bid.button.SigningSubject').d('采购方')}
              >
              <Tooltip title={poHeader.buyerMeaning} placement="topLeft">
                {getFieldDecorator('purchaser', {
                  initialValue: poHeader.buyerMeaning,
                })(
                  <Lov
                    code="VP.CONTRACT_SIGN_ENTITY_NAME"
                    textValue={poHeader.buyerMeaning}
                    disabled
                    queryParams={{
                      enabledFlag: 1,
                      companyId: getFieldValue('purchaser'),
                      tenantId,
                    }}
                  />
                )}
                </Tooltip>
              </FormItem>
            </Col>
            {isShow && <Col span={8}>
              <FormItem
                {...formlayout2}
                key={poHeader.tenRate}
                label={intl.get('bid.bidcommon.view.title.technicalproportion').d('技术比例')}
              >
                <span className="ant-input-group-wrapper">
                  <span className="ant-input-wrapper ant-input-group">
                    {getFieldDecorator('tenRate', {
                      initialValue: poHeader.tenRate,
                    })(<InputNumber min={0} max={100} disabled />)}
                    <span style={{ width: '17%' }} className="ant-input-group-addon">
                      %
                    </span>
                  </span>
                </span>
              </FormItem>
            </Col>}
          </Row>
          {isShow && <Row gutter={24}>
            <Col span={8}>
              <FormItem
                {...formlayout2}
                key={poHeader.priceRate}
                label={intl.get('bid.bidcommon.view.title.priceproportion').d('价格比例')}
              >
                <span className="ant-input-group-wrapper">
                  <span className="ant-input-wrapper ant-input-group">
                    {getFieldDecorator('priceRate', {
                      initialValue: poHeader.priceRate,
                    })(<InputNumber min={0} max={100} disabled />)}
                    <span style={{ width: '17%' }} className="ant-input-group-addon">
                      %
                    </span>
                  </span>
                </span>
              </FormItem>
            </Col>
          </Row>}
        </Form>
      </div>
    );
  }
}
