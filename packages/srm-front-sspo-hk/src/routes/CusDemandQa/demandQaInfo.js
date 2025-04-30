/**
 * @Description: 需求人答疑-基本信息
 * @date 2022-06-24
 * @author <jie.chen06@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Row, Col, Input, Checkbox,Radio } from 'antd';
import ValueList from 'components/ValueList';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import { queryMapIdpValue } from 'services/api';
import { largeScreenWidth } from '_cus_utils/constants';
import CusLov from '_cus_components/CusLov';
import CusButton from '_cus_components/CusButton';
import styles from './index.less';

import { getDFormGridSpan } from '_cus_utils/utils';
import GenerateFormGrid from '_cus_utils/generate/GenerateFormGrid';

const tenantId = getCurrentOrganizationId();
const FormItem = Form.Item;

const screenWidth = window.screen.width;

export default class headerDataProjectQaInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fastCodes: {},
      showMore: false,
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
    const colSpan = screenWidth > largeScreenWidth ? 8 : 12;
    const gridSpan = getDFormGridSpan();
    const {
      form: { getFieldDecorator, getFieldValue },
      poHeader,
    } = this.props;

    const { fastCodes = {} } = this.state;
    const isShow = poHeader.purchaseType === 'public_bidding' || poHeader.purchaseType === 'invited_bidding';

    return (
      <>
        <Form className="customize-form">
          <GenerateFormGrid isPackUp={true}>
            <Col {...gridSpan}>
              <FormItem
                key={poHeader.proCode}
                label={intl.get(`bid.bidcommon.view.title.purchaseschemeno`).d('采购方案编号')}
              >
                {getFieldDecorator('proCode', {
                  initialValue: poHeader.proCode,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col { ...gridSpan }>
              <FormItem
                key={poHeader.proName}
                label={intl.get(`bid.bidcommon.view.title.purchaseschemename`).d('采购方案名称')}
              >
                {getFieldDecorator('proName', {
                  initialValue: poHeader.proName,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col { ...gridSpan }>
              <FormItem
                key={poHeader.packageNo}
                label={intl.get(`bid.bidcommon.view.title.packageno`).d('标包编号')}
              >
                {getFieldDecorator('packageNo', {
                  initialValue: poHeader.packageNo,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col { ...gridSpan }>
              <FormItem
                key={poHeader.packageName}
                label={intl.get(`bid.bidcommon.view.title.packagename`).d('标包名称')}
              >
                {getFieldDecorator('packageName', {
                  initialValue: poHeader.packageName,
                })(<Input disabled />)}
              </FormItem>
            </Col>
            <Col { ...gridSpan }>
              <FormItem
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
            {/* <Col { ...gridSpan }>
            <FormItem
              key={poHeader.specialPrice}
              label={intl.get(`bid.bidcommon.view.title.specialquotation`).d('特殊报价')}
            >
              {getFieldDecorator('specialPrice', {
                initialValue: poHeader.specialPrice,
              })(
                <div className={styles['checkbox-disabled']}>
                  <Radio.Group value={poHeader.specialPrice}>
                      <Radio
                        checked={
                          poHeader.specialPrice === 'YES'
                        }
                        value="YES"
                        disabled
                      >
                        {intl.get(`bid.bidcommon.view.title.yes`).d('是')}
                      </Radio>
                      <Radio
                        checked={
                          poHeader.specialPrice === 'NO'
                        }
                        value="NO"
                        disabled
                      >
                        {intl.get(`bid.bidcommon.view.title.no`).d('否')}
                      </Radio>
                  </Radio.Group>
                </div>
              )}
            </FormItem>
            </Col>
            <Col { ...gridSpan }>
              <FormItem
                key={poHeader.priceSecret}
                label={intl.get(`bid.bidcommon.view.title.offerconfidential`).d('报价保密')}
              >
                {getFieldDecorator('priceSecret', {
                  initialValue: poHeader.priceSecret,
                })(
                  <div className={styles['checkbox-disabled']}>
                    <Radio.Group value={poHeader.priceSecret}>
                      <Radio
                        checked={
                          poHeader.priceSecret === 'YES'
                        }
                        value="YES"
                        disabled
                      >
                        {intl.get(`bid.bidcommon.view.title.yes`).d('是')}
                      </Radio>
                      <Radio
                        checked={
                          poHeader.priceSecret === 'NO'
                        }
                        value="NO"
                        disabled
                      >
                        {intl.get(`bid.bidcommon.view.title.no`).d('否')}
                      </Radio>
                  </Radio.Group>
                  </div>
                )}
              </FormItem>
            </Col> */}
            {/* <Col { ...gridSpan }>
              <FormItem
                key={poHeader.productName}
                label={intl.get(`bid.bidcommon.view.title.productname`).d('产品名称')}
              >
                {getFieldDecorator('productName', {
                  initialValue: poHeader.productNameMeaning,
                })(
                  <CusLov
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
            </Col> */}
            <Col { ...gridSpan }>
            <FormItem
              key={poHeader.bidNum}
              label={intl.get('bid.bidcommon.bid.title.Numberofsuccessfulbidders').d('中标人数')}
            >
              {getFieldDecorator('bidNum', {
                initialValue: poHeader.bidNum,
              })(<Input disabled />)}
            </FormItem>
            </Col>
            {/* <Col { ...gridSpan }>
              <FormItem
                key={poHeader.purchaser}
                label={intl.get('bid.bidcommon.bid.button.SigningSubject').d('采购方')}
              >
                {getFieldDecorator('purchaser', {
                  initialValue: poHeader.buyerMeaning,
                })(
                  <CusLov
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
              </FormItem>
            </Col> */}
            {isShow && <Col { ...gridSpan }>
              <FormItem
                key={poHeader.tenRate}
                label={intl.get('bid.bidcommon.view.title.technicalproportion').d('技术比例')}
              >
                {getFieldDecorator('tenRate', {
                  initialValue: poHeader.tenRate,
                })(
                  <Input
                    disabled
                    suffix={
                      <>
                        <span>%</span>
                      </>
                    }
                  />
                )}
              </FormItem>
            </Col>}
            {isShow && <Col { ...gridSpan }>
              <FormItem
                key={poHeader.priceRate}
                label={intl.get('bid.bidcommon.view.title.priceproportion').d('价格比例')}
              >
                {getFieldDecorator('priceRate', {
                  initialValue: poHeader.priceRate,
                })(
                  <Input
                    disabled
                    suffix={
                      <>
                        <span>%</span>
                      </>
                    }
                  />
                )}
              </FormItem>
            </Col>}
          </GenerateFormGrid>
        </Form>
      </>
    );
  }
}
