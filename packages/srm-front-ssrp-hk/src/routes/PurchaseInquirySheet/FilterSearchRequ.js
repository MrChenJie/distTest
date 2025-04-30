import React from 'react';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Col, Input } from 'antd';
import { Form } from 'hzero-ui';
import { getDateFormat } from 'utils/utils';
import { getDFormGridSpan } from '_cus_utils/utils';
import CusLov from '_cus_components/CusLov';
import { connect } from 'dva';
import { numberRender } from 'utils/renderer';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
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
      // deviceInfoList: []
    };
  }

  // requForm = React.createRef();

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
    const { isShowMore, saleOrderVisible } = this.state;
    const {
      idpValueMap = {},
      onSearch = (e) => e,
      purchaseInquirySheetModel,
      form,
      requireDataObj,
      dispatch
    } = this.props;
    const { cmhkIctPrSo, prApplyStatus } = purchaseInquirySheetModel
    const { getFieldValue = (e) => e, setFieldsValue = (e) => e, getFieldDecorator } = form;
    const formLayout = this.computeFormLayout();

    return (
      <div className="customize-form">
        <Form>
          {/*<GenerateFormGrid isPackUp={true}>*/}
          <Col {...gridSpan}>
            <Form.Item
              required
              label={intl.get(`${promptCode}.view.title.sonumber`).d('销售订单编号')}
              {...formLayout}
            >
              {getFieldDecorator('salesOrderNo', {
                initialValue: cmhkIctPrSo?.salesOrderNo,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.sonumber`).d('销售订单编号'),
                    }),
                  },
                ],
              })(
                <CusLov
                  disabled={prApplyStatus == 'PENDING_REFER' ? false : true}
                  textValue={cmhkIctPrSo?.salesOrderNo}
                  // form={this.requForm.current}
                  code="HKICT.KBOSSORDERS"
                  onChange={(value, record) => {
                    setFieldsValue({
                      salesOrderNo: record.salesOrderNo,
                      orderVersion: record.orderVersion,
                      orderType: record.orderType,
                      salesContractSubject: record.salesContractSubject,
                      customerName: record.customerName,
                      customerCode: record.customerCode,
                      salesOrderApplicant: record.salesOrderApplicantName,
                      estimatedInternalCostHkd: numberRender(record.estimatedInternalCostHkd, 2),
                      estimatedExternalCostHkd: numberRender(record.estimatedExternalCostHkd, 2),
                      quotationCurrency: record.quotationCurrency,
                      tenderManager: record.tenderManagerName,
                      profitMargin: record.profitMargin,
                      // deviceInfoList: record.deviceInfoList
                    });
                    this.setState(
                      {
                        deviceInfoList: record.deviceInfoList,
                      },
                      () => {
                        this.props.getDeviceInfoList(
                          this.state.deviceInfoList,
                          record.salesOrderNo,
                          record
                        );
                      }
                    );
                    dispatch({
                      type: 'purchaseInquirySheetModel/commentUpdateState',
                      payload: {
                        cmhkIctPrSo: record, //销售订单数据
                        cmhkIctPrDeviceInfoList: record.deviceInfoList, //设备信息
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
              label={intl.get(`${promptCode}.view.title.orderversion`).d('订单版本')}
              {...formLayout}
            >
              {getFieldDecorator('orderVersion', {
                initialValue: cmhkIctPrSo?.objectVersionNumber,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${promptCode}`).d('订单类型')} {...formLayout}>
              {getFieldDecorator('orderType', {
                initialValue: cmhkIctPrSo?.orderType,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.socontractentity`).d('销售签约主体')}
              {...formLayout}
            >
              {getFieldDecorator('salesContractSubject', {
                initialValue: cmhkIctPrSo?.salesContractSubject,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.customername`).d('客户名称')}
              {...formLayout}
            >
              {getFieldDecorator('customerName', {
                initialValue: cmhkIctPrSo?.customerName,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.customercode`).d('客户编码')}
              {...formLayout}
            >
              {getFieldDecorator('customerCode', {
                initialValue: cmhkIctPrSo?.customerCode,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.soapplicant`).d('销售订单申请人')}
              {...formLayout}
            >
              {getFieldDecorator('salesOrderApplicant', {
                initialValue: cmhkIctPrSo?.salesOrderApplicantMeaning,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl
                .get(`${promptCode}.view.title.extimatedinternalcostsh`)
                .d('预估内部成本(HKD)')}
              {...formLayout}
            >
              {getFieldDecorator('estimatedInternalCostHkd', {
                initialValue: numberRender(cmhkIctPrSo?.estimatedInternalCostHkd, 2),
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.extimatedexternalcostsh`).d('预估外部成本')}
              {...formLayout}
            >
              {getFieldDecorator('estimatedExternalCostHkd', {
                initialValue: numberRender(cmhkIctPrSo?.estimatedExternalCostHkd, 2),
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.quotationcurrency`).d('报价币种')}
              {...formLayout}
            >
              {getFieldDecorator('quotationCurrency', {
                initialValue: cmhkIctPrSo?.quotationCurrency,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item
              label={intl.get(`${promptCode}.view.title.bidmanager`).d('投标经理')}
              {...formLayout}
            >
              {getFieldDecorator('tenderManager', {
                initialValue: cmhkIctPrSo?.tenderManagerMeaning,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          <Col {...gridSpan}>
            <Form.Item label={intl.get(`${promptCode}.view.titla.estimatedprofit`).d('预估利润')} {...formLayout}>
              {getFieldDecorator('profitMargin', {
                initialValue: cmhkIctPrSo?.profitMargin,
              })(<Input disabled />)}
            </Form.Item>
          </Col>
          {/*</GenerateFormGrid>*/}
        </Form>
      </div>
    );
  }
}
