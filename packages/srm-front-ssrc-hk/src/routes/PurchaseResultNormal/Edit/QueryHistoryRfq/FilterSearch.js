/**
 * FilterSearch-查询表单
 * @since 2022-02-14
 * @author jxinyi.he02@hand-china.com
 * @version 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import { Bind } from 'lodash-decorators';
import dayjs from 'dayjs';
import intl from 'utils/intl';
import { Row, Col, Form, Input } from 'antd';
import { getDateFormat } from 'utils/utils';

import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import CusDatePicker from '_cus_components/CusDatePicker';
import { mediumScreenWidth } from '_cus_utils/constants';

/**
 * 多语言前缀
 */
 const promptCode = 'ssrc.resaleRfqHistory';
 const dateFormat = getDateFormat();
 const screenWidth = window.screen.width;

export default class FilterSearch extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);

    this.state = {
      isShowMore: false,
    };
  }
  form = React.createRef();

  /**
  * 重置
  */
  @Bind()
  handleReset() {
    const { onSearch = (e) => e } = this.props;
    this.form.current?.resetFields();
    onSearch();
  }

  computeFormLayout() {
    const formLayout = {
      wrapperCol: { span: 24 },
    };
    return formLayout;
  }

  handleShowMore = () => {
    const { isShowMore } = this.state;
    this.setState({
      isShowMore: !isShowMore,
    });
  };

  render() {
    const {
      idpValueMap = {},
      onSearch = (e) => e,
    } = this.props;
    const { isShowMore } = this.state;
    const { getFieldValue = (e) => e } = this.form?.current || {};
    const formLayout = this.computeFormLayout();

    return (
      <>
        <div className="customize-form">
          <Form ref={this.form}>
            <Row>
              <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.label.enquiryPriceNum`).d('询价单号')}
                  {...formLayout}
                  name="enquiryPriceNum"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.label.enquiryPriceStatus`).d('询价状态')}
                  {...formLayout}
                  name="enquiryPriceStatus"
                >
                  <CusSelect
                    allowClear
                    options={(idpValueMap['ISP.RFP_HEADER_STATUS'] || []).filter(item => item.tag !== 'ISP')}
                  />
                </Form.Item>
              </Col>
              <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.label.enquiryPriceTitle`).d('询价单标题')}
                  {...formLayout}
                  name="enquiryPriceTitle"
                >
                  <Input />
                </Form.Item>
              </Col>
              <div style={{ display: isShowMore ? 'block' : 'none' }}>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.label.soEnquiryCodeSoRequireCode`).d('销售意向单号/需求单号')}
                    {...formLayout}
                    name="soEnquiryCodeSoRequireCode"
                  >
                    <Input type="text" />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.label.enquiryStartDateFrom`).d('询价开始日期从')}
                    {...formLayout}
                    name="enquiryStartDateFrom"
                  >
                    <CusDatePicker
                      format={dateFormat}
                      placeholder={intl
                        .get('hzero.common.view.message.selectDate')
                        .d('请选择日期')}
                      disabledDate={(currentDate) => {
                        return (
                          dayjs.isDayjs(getFieldValue('enquiryStartDateTo')) &&
                          currentDate &&
                          currentDate.isAfter(getFieldValue('enquiryStartDateTo'))
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.label.enquiryStartDateTo`).d('询价开始日期至')}
                    {...formLayout}
                    name="enquiryStartDateTo"
                  >
                    <CusDatePicker
                      format={dateFormat}
                      placeholder={intl
                        .get('hzero.common.view.message.selectDate')
                        .d('请选择日期')}
                      disabledDate={(currentDate) => {
                        return (
                          dayjs.isDayjs(getFieldValue('enquiryStartDateFrom')) &&
                          currentDate &&
                          currentDate.isBefore(getFieldValue('enquiryStartDateFrom'))
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.label.createdBy`)
                      .d('录入员')}
                    {...formLayout}
                    name="createdBy"
                  >
                    <CusLov
                      code="HIAM.USER_ORG_QUERY"
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.label.enquiryEndDateFrom`).d('询价截止日期从')}
                    {...formLayout}
                    name="enquiryEndDateFrom"
                  >
                    <CusDatePicker
                      format={dateFormat}
                      placeholder={intl
                        .get('hzero.common.view.message.selectDate')
                        .d('请选择日期')}
                      disabledDate={(currentDate) => {
                        return (
                          dayjs.isDayjs(getFieldValue('enquiryEndDateTo')) &&
                          currentDate &&
                          currentDate.isAfter(getFieldValue('enquiryEndDateTo'))
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.label.enquiryEndDateTo`).d('询价截止日期至')}
                    {...formLayout}
                    name="enquiryEndDateTo"
                  >
                    <CusDatePicker
                      format={dateFormat}
                      placeholder={intl
                        .get('hzero.common.view.message.selectDate')
                        .d('请选择日期')}
                      disabledDate={(currentDate) => {
                        return (
                          dayjs.isDayjs(getFieldValue('enquiryEndDateFrom')) &&
                          currentDate &&
                          currentDate.isBefore(getFieldValue('enquiryEndDateFrom'))
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.label.creationDateFrom`).d('创建时间从')}
                    {...formLayout}
                    name="creationDateFrom"
                  >
                    <CusDatePicker
                      format={dateFormat}
                      placeholder={intl
                        .get('hzero.common.view.message.selectDate')
                        .d('请选择日期')}
                      disabledDate={(currentDate) => {
                        return (
                          dayjs.isDayjs(getFieldValue('creationDateTo')) &&
                          currentDate &&
                          currentDate.isAfter(getFieldValue('creationDateTo'))
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.label.creationDateTo`).d('创建时间至')}
                    {...formLayout}
                    name="creationDateTo"
                  >
                    <CusDatePicker
                      format={dateFormat}
                      placeholder={intl
                        .get('hzero.common.view.message.selectDate')
                        .d('请选择日期')}
                      disabledDate={(currentDate) => {
                        return (
                          dayjs.isDayjs(getFieldValue('creationDateFrom')) &&
                          currentDate &&
                          currentDate.isBefore(getFieldValue('creationDateFrom'))
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${promptCode}.model.label.enquiryDetailNum`).d('报价单号')}
                    {...formLayout}
                    name="enquiryDetailNum"
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </div>
              <Col span={screenWidth > mediumScreenWidth ? 8 : 12} style={{ float: 'right' }}>
                <CusQueryButtons
                  onQuery={onSearch}
                  onReset={this.handleReset}
                  onShowMore={this.handleShowMore}
                  isShowMore={isShowMore}
                />
              </Col>
            </Row>
          </Form>
        </div>
      </>
    );
  }
}
