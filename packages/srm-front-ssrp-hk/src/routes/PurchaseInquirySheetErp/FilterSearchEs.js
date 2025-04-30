import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Form, Input } from 'antd';
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
    console.log(this.esForm?.current?.getFieldsValue())
    this.props.getEsFormValue(this.esForm?.current?.getFieldsValue())
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
      idpValueMap = {},
      onSearch = (e) => e,
      form,
      equipmentAndServiceValue,
      totalAmount,
      esFormValue,
      ictPrDetailHeadsList,
      flag
    } = this.props;
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
              name='originalCurrency'
              initialValue={esFormValue.originalCurrency != undefined ? esFormValue.originalCurrency : ictPrDetailHeadsList?.originalCurrency}
              rules={[
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.label`).d('原币种'),
                  }),
                },
              ]}
            >
              <CusLov
                textValue={esFormValue.originalCurrency != undefined ? esFormValue.originalCurrency : ictPrDetailHeadsList?.originalCurrency}
                code="HKICT.RATE.EXCHANGE"
                form={this.esForm.current}
                lovOptions={{ displayField: 'fromCurrencyCode', valueField: 'exchangeRateId' }}
                onChange={(val, lovData) => {
                  this.esForm?.current?.setFieldsValue({ exchangeRate: lovData.rate })
                  this.props.getEsFormValue(this.esForm?.current?.getFieldsValue())
                  // this.props.dispatch({
                  //   type: 'purchaseInquirySheetModel/currencyPurchaseResultApplication',
                  //   payload
                  // }).then(res => {
                  //   console.log(res)
                  // })
                }}
              />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.model.label`).d('汇率')}
              {...formLayout}
              name='exchangeRate'
              initialValue={esFormValue.exchangeRate != undefined ? esFormValue.exchangeRate : ictPrDetailHeadsList?.exchangeRate}
              rules={[
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.label`).d('汇率'),
                  }),
                },
              ]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.model.label`).d('总金额(原币种)')}
              {...formLayout}
              name='totalAmountOc'
              initialValue={flag ? (esFormValue.totalAmountOc != undefined ? (this.esForm?.current?.setFieldsValue({ totalAmountOc: esFormValue.totalAmountOc })) : ictPrDetailHeadsList?.totalAmountOc) : (this.esForm?.current?.setFieldsValue({ totalAmountOc: totalAmount }))}
              rules={[
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.label`).d('总金额(原币种)'),
                  }),
                },
              ]}
            >
              <Input value={ictPrDetailHeadsList?.totalAmountOc} disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('总金额(HKD)')}
              {...formLayout}
              name='totalAmountHkd'
              initialValue={flag ? (esFormValue.totalAmountHkd != undefined ? this.esForm?.current?.setFieldsValue({ totalAmountHkd: esFormValue.totalAmountHkd }) : ictPrDetailHeadsList?.totalAmountHkd) : (totalAmount == 0 ? this.esForm?.current?.setFieldsValue({ totalAmountHkd: 0.00 }) : this.esForm?.current?.setFieldsValue({ totalAmountHkd: (this.esForm?.current.getFieldValue('totalAmountOc') * this.esForm?.current.getFieldValue('exchangeRate') * 1).toFixed(2) }))}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          {/*</GenerateFormGrid>*/}
        </Form>
      </div>
    );
  }
}
