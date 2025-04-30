import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Input } from 'antd';
import { Form } from 'hzero-ui';
import { getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusLov from '_cus_components/CusLov';
import { connect } from 'dva';

/**
 * 多语言前缀
 */
const promptCode = 'ssrc.resaleRfq';
const dateFormat = getDateFormat();
const screenWidth = window.screen.width;
const gridSpan = getDFormGridSpan();

@connect(({ purchaseInquirySheetModel, loading }) => ({
  purchaseInquirySheetModel,
}))

export default class FilterSearchRequ extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);

    this.state = {
      isShowMore: false,
      saleOrderVisible: false,
      deviceInfoList: []
    };
  }

  requForm = React.createRef();

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const { onSearch = (e) => e } = this.props;
    this.requForm.current?.resetFields();
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

  render() {
    const { isShowMore, saleOrderVisible, deviceInfoList } = this.state;
    const {
      idpValueMap = {},
      onSearch = (e) => e,
      cmhkIctPrSo,
      form
    } = this.props;
    const { getFieldDecorator } = form
    const formLayout = this.computeFormLayout();
    return (
      <div className='customize-form'>
        <Form ref={this.requForm}>
          {/*<GenerateFormGrid isPackUp={true}>*/}
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.model.label`).d('销售订单编号')}
              {...formLayout}
            >
              {
                getFieldDecorator('salesOrderNo',{
                  initialValue:cmhkIctPrSo?.salesOrderNo
                })(
                  <CusLov
                    textValue={cmhkIctPrSo?.salesOrderNo}
                    disabled
                    form={this.requForm.current}
                    code='HKICT.KBOSSORDERS'
                  />
                )
              }
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.model.label`).d('订单版本')}
              {...formLayout}
            >
              {
                getFieldDecorator('orderVersion',{
                  initialValue: cmhkIctPrSo?.orderVersion
                })( <Input disabled />)
              }
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('订单类型')}
              {...formLayout}
            >
              {
                getFieldDecorator('orderVersion',{
                  initialValue: cmhkIctPrSo?.orderType
                })( <Input disabled />)
              }
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('销售签约主体')}
              {...formLayout}
            >
              {
                getFieldDecorator('orderVersion',{
                  initialValue: cmhkIctPrSo?.salesContractSubject
                })( <Input disabled />)
              }
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('客户名称')}
              {...formLayout}
            >
              {
                getFieldDecorator('orderVersion',{
                  initialValue: cmhkIctPrSo?.customerName
                })( <Input disabled />)
              }
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('客户编码')}
              {...formLayout}
            >
              {
                getFieldDecorator('orderVersion',{
                  initialValue: cmhkIctPrSo?.customerCode
                })( <Input disabled />)
              }
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('销售订单申请人')}
              {...formLayout}
            >
              {
                getFieldDecorator('orderVersion',{
                  initialValue: cmhkIctPrSo?.salesOrderApplicant
                })( <Input disabled />)
              }
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('预估内部成本(HKD)')}
              {...formLayout}
            >
              {
                getFieldDecorator('orderVersion',{
                  initialValue: cmhkIctPrSo?.estimatedInternalCost
                })( <Input disabled />)
              }
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('预估外部成本')}
              {...formLayout}
            >
              {
                getFieldDecorator('orderVersion',{
                  initialValue: cmhkIctPrSo?.estimatedExternalCost
                })( <Input disabled />)
              }
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('报价币种')}
              {...formLayout}
            >
              {
                getFieldDecorator('orderVersion',{
                  initialValue: cmhkIctPrSo?.quotationCurrency
                })( <Input disabled />)
              }
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('投标经理')}
              {...formLayout}
            >
              {
                getFieldDecorator('orderVersion',{
                  initialValue: cmhkIctPrSo?.tenderManager
                })( <Input disabled />)
              }
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('预估利润')}
              {...formLayout}
            >
              {
                getFieldDecorator('orderVersion',{
                  initialValue: cmhkIctPrSo?.profitMargin
                })( <Input disabled />)
              }
            </Form.Item>
          </Col>
          {/*</GenerateFormGrid>*/}
        </Form>
      </div>
    );
  }
}
