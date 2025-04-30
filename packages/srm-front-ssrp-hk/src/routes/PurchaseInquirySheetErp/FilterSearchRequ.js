import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Form, Input } from 'antd';
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
    } = this.props;
    const { getFieldValue = (e) => e, setFieldsValue = (e) => e } = this.requForm?.current || {};
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
              name='salesOrderNo'
            >
              <CusLov
                form={this.requForm.current}
                code='HKICT.KBOSSORDERS'
                textField='salesOrderNo'
                onChange={(value, record) => {
                  setFieldsValue({
                    salesOrderNo: record.salesOrderNo,
                    orderVersion: record.orderVersion,
                    orderType: record.orderType,
                    salesContractSubject: record.salesContractSubject,
                    customerName: record.customerName,
                    customerCode: record.customerCode,
                    salesOrderApplicant: record.salesOrderApplicantName,
                    estimatedInternalCost: record.estimatedInternalCost,
                    estimatedExternalCost: record.estimatedExternalCost,
                    quotationCurrency: record.quotationCurrency,
                    tenderManager: record.tenderManagerName,
                    profitMargin: record.profitMargin
                    // deviceInfoList: record.deviceInfoList
                  });
                  this.setState({
                    deviceInfoList: record.deviceInfoList
                  }, () => {
                    this.props.getDeviceInfoList(this.state.deviceInfoList, record.salesOrderNo)
                  })
                }}
              />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.model.label`).d('订单版本')}
              {...formLayout}
              name='orderVersion'
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('订单类型')}
              {...formLayout}
              name='orderType'
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('销售签约主体')}
              {...formLayout}
              name='salesContractSubject'
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('客户名称')}
              {...formLayout}
              name='customerName'
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('客户编码')}
              {...formLayout}
              name='customerCode'
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('销售订单申请人')}
              {...formLayout}
              name='salesOrderApplicant'
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('预估内部成本(HKD)')}
              {...formLayout}
              name='estimatedInternalCost'
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('预估外部成本')}
              {...formLayout}
              name='estimatedExternalCost'
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('报价币种')}
              {...formLayout}
              name='quotationCurrency'
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('投标经理')}
              {...formLayout}
              name='tenderManager'
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.model.label`).d('预估利润')}
              {...formLayout}
              name='profitMargin'
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
