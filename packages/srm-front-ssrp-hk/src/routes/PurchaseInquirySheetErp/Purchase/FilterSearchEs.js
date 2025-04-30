import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Input } from 'antd';
import { Form } from 'hzero-ui';
import { getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';

/**
 * 多语言前缀
 */
const promptCode = 'ssrc.resaleRfq';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getDFormGridSpan();

export default class FilterSearchEs extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);
    this.state = {
      isShowMore: false,
      esFormValueState: {},
    };
  }

  esForm = React.createRef();

  componentDidMount() {
    // console.log(this.esForm?.current?.getFieldsValue())
    // this.props.getEsFormValue(this.esForm?.current?.getFieldsValue())
  }

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const { onSearch = (e) => e } = this.props;
    this.esForm.current?.resetFields();
    onSearch();
  }

  /**
   * 展开高级查询
   * @function handleShowMore
   */
  handleShowMore = () => {
    const { isShowMore } = this.state;
    this.setState({
      isShowMore: !isShowMore,
    });
  };

  computeFormLayout() {
    const formLayout = {
      wrapperCol: { span: 24 },
    };
    return formLayout;
  }
  @Bind()
  getTotalAmount() {
    this.props.equipmentAndServiceValue.map(item => {
      console.log(item)
    })
  }

  render() {
    const { isShowMore, esFormValueState } = this.state;
    const {
      form,
      equipmentAndServiceValue,
      totalAmount,
      esFormValue,
      flag,
      purchaseInquirySheetModelErp
    } = this.props;
    const { ictPrDetailHeadsList, rate, totalAmountHkd, originalCurrencyStr, prApplyStatus } = purchaseInquirySheetModelErp
    const { getFieldDecorator } = form
    const formLayout = this.computeFormLayout();
    return (
      <div className='customize-form'>
        <Form ref={this.esForm}>
          {/*<GenerateFormGrid isPackUp={true}>*/}
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.model.label`).d('原币种')}
              {...formLayout}

            >
              {getFieldDecorator('originalCurrency', {
                initialValue: ictPrDetailHeadsList?.originalCurrencyHkd,
              })(<CusLov
                disabled
                textValue={ictPrDetailHeadsList?.originalCurrencyHkd}
                code='HKICT.RATE.EXCHANGE'
                // form={this.esForm}
                lovOptions={{ displayField: 'fromCurrencyCode', valueField: 'exchangeRateId' }}
                onChange={(val, lovData) => {
                  dispatch({
                    type: 'purchaseInquirySheetModel/commentUpdateState',
                    payload: {
                      rate: lovData.rate,
                      originalCurrency: lovData.exchangeRateId
                    },
                  });
                }}
              />)}

            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.model.label`).d('汇率')}
              {...formLayout}
            >
              {
                getFieldDecorator('exchangeRate', {
                  initialValue: rate ? rate : ictPrDetailHeadsList?.exchangeRate,
                })(<Input disabled />)
              }

            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.model.label`).d('总金额(原币种)')}
              {...formLayout}

            >
              {getFieldDecorator('totalAmountOc', {
                initialValue: totalAmountHkd ? numberRender(divide(totalAmountHkd, rate), 2) : ictPrDetailHeadsList?.totalAmountOc,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('总金额(HKD)')}
              {...formLayout}
            >
              {getFieldDecorator('totalAmountHkd', {
                initialValue: totalAmountHkd ? totalAmountHkd : ictPrDetailHeadsList?.totalAmountHkd,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          {/*</GenerateFormGrid>*/}
        </Form>
      </div>
    );
  }
}
