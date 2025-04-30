import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Input } from 'antd';
import { Form } from 'hzero-ui';
import { getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import { numberRender } from 'utils/renderer';
import { pullAllBy, multiply, divide } from 'lodash';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getDFormGridSpan();
@Form.create()
export default class FilterSearchEs extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
    this.state = {
      isShowMore: false,
      esFormValueState: {},
    };
  }

  // esForm = React.createRef();

  componentDidMount() {
    this.props.getEsFormValue(this.form?.getFieldsValue());
  }

  computeFormLayout() {
    const formLayout = {
      wrapperCol: { span: 24 },
    };
    return formLayout;
  }

  render() {
    const { isShowMore, esFormValueState } = this.state;
    const {
      idpValueMap = {},
      onSearch = (e) => e,
      form,
      equipmentAndServiceValue,
      esFormValue,
      ictPrDetailHeadsList,
      flag,
      dispatch,
      purchaseInquirySheetModel,
    } = this.props;
    const { rate, totalAmount, originalCurrencyStr, prApplyStatus, totalAmountHkd } =
      purchaseInquirySheetModel;
    const { getFieldDecorator } = form;
    const formLayout = this.computeFormLayout();
    return (
      <div className="customize-form">
        <Form ref={this.esForm}>
          {/*<GenerateFormGrid isPackUp={true}>*/}
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.view.title.origincurrency`).d('原币种')}
              {...formLayout}
            >
              {getFieldDecorator('originalCurrency', {
                initialValue: ictPrDetailHeadsList?.originalCurrencyHkd,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.origincurrency`).d('原币种'),
                    }),
                  },
                ],
              })(
                <CusLov
                  disabled={prApplyStatus == 'PENDING_REFER' ? false : true}
                  textValue={ictPrDetailHeadsList?.originalCurrencyHkd}
                  code="HKICT.RATE.EXCHANGE"
                  // form={this.esForm}
                  lovOptions={{ displayField: 'fromCurrencyCode', valueField: 'exchangeRateId' }}
                  onChange={(val, lovData) => {
                    dispatch({
                      type: 'purchaseInquirySheetModel/commentUpdateState',
                      payload: {
                        rate: lovData.rate,
                        originalCurrency: lovData.exchangeRateId,
                        currency: lovData.fromCurrencyCode,
                      },
                    });
                  }}
                />
              )}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.view.title.rate`).d('汇率')}
              {...formLayout}
            >
              {getFieldDecorator('exchangeRate', {
                initialValue: rate ? rate : ictPrDetailHeadsList?.exchangeRate,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.view.title.totalammount`).d('总金额(原币种)')}
              {...formLayout}
            >
              {getFieldDecorator('totalAmountOc', {
                //numberRender(multiply(totalAmountHkd, rate), 2)
                initialValue: totalAmount ? totalAmount : ictPrDetailHeadsList?.totalAmountOc,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.totalammounthkd`).d('总金额(HKD)')}
              {...formLayout}
            >
              {getFieldDecorator('totalAmountHkd', {
                initialValue:
                  totalAmountHkd != ''
                    ? totalAmountHkd
                    : numberRender(multiply(totalAmount, rate), 2) ||
                      numberRender(ictPrDetailHeadsList?.totalAmountHkd, 2),
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          {/*</GenerateFormGrid>*/}
        </Form>
      </div>
    );
  }
}
