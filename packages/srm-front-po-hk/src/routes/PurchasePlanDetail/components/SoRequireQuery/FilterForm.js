import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import dayjs from 'dayjs';
import { Form, Input, Row, Col } from 'antd';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';

import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import CusLov from '_cus_components/CusLov';
import CusDatePicker from '_cus_components/CusDatePicker';

const FormItem = Form.Item;
const dateFormat = getDateFormat();

/**
 * 查询表单
 * @extends {Component} - React.Component
 * @reactProps {Function} onSearch - 查询
 * @reactProps {Object} statusList - 状态
 * @return React.element
 */
const formLayout = {
  wrapperCol: { span: 24 },
};

export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    onRef(this);

    this.state = {
      isShowMore: false,
    };
  }
  form = React.createRef();

  /**
   * 提交查询表单
   * @memberof QueryForm
   */
  @Bind()
  handleSearch() {
    const { onSearch = (e) => e } = this.props;
    onSearch();
  }

  /**
   * 重置表单
   * @memberof QueryForm
   */
  @Bind()
  handleReset() {
    this.form?.current?.resetFields();
  }

  handleShowMore = () => {
    const { isShowMore } = this.state;
    this.setState({
      isShowMore: !isShowMore,
    });
  };

  render() {
    const { isShowMore } = this.state;
    const { getFieldValue = e => e } = this.form?.current || {};

    return (
      <div className="customize-form" style={{ marginBottom: '24px' }}>
        <Form ref={this.form}>
          <Row>
            <Col span={24}>
              <Row>
                <Col span={8}>
                  <FormItem
                    label={intl.get('ssrc.resaleRfq.srq.intentionNum').d('意向单号')}
                    {...formLayout}
                    name="handleCode"
                  >
                    <Input />
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('ssrc.resaleRfq.srq.demandNum').d('需求单号')}
                    {...formLayout}
                    name="requireCode"
                  >
                    <Input />
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('ssrc.resaleRfq.srq.salesUnit').d('销售单元')}
                    {...formLayout}
                    name="orderOwnerCode"
                  >
                    <CusLov
                      code="SPUC.ENTITY_SALESREGION"
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                    />
                  </FormItem>
                </Col>
              </Row>
              <Row style={{ display: isShowMore ? 'block' : 'none' }}>
                <Col span={8}>
                  <FormItem
                    label={intl.get('ssrc.resaleRfq.srq.sigsedCustomer').d('签约客户')}
                    {...formLayout}
                    name="signCustomer"
                  >
                    <Input />
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('ssrc.resaleRfq.srq.createDateFrom').d('创建时间从')}
                    {...formLayout}
                    name="createDateFrom"
                  >
                    <CusDatePicker
                      format={dateFormat}
                      placeholder={intl
                        .get('hzero.common.view.message.selectDate')
                        .d('请选择日期')}
                      disabledDate={(currentDate) => {
                        return (
                          dayjs.isDayjs(getFieldValue('createDateTo')) &&
                          currentDate &&
                          currentDate.isAfter(getFieldValue('createDateTo'))
                        );
                      }}
                    />
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('ssrc.resaleRfq.srq.createDateTo').d('创建时间至')}
                    {...formLayout}
                    name="createDateTo"
                  >
                    <CusDatePicker
                      format={dateFormat}
                      placeholder={intl
                        .get('hzero.common.view.message.selectDate')
                        .d('请选择日期')}
                      disabledDate={(currentDate) => {
                        return (
                          dayjs.isDayjs(getFieldValue('createDateFrom')) &&
                          currentDate &&
                          currentDate.isBefore(getFieldValue('createDateFrom'))
                        );
                      }}
                    />
                  </FormItem>
                </Col>
              </Row>
              <Row style={{ display: isShowMore ? 'block' : 'none' }}>
                <Col span={8}>
                  <FormItem
                    label={intl.get('ssrc.resaleRfq.srq.productType').d('产品类型')}
                    {...formLayout}
                    name="productType"
                  >
                    <CusLov code="RS_IBOSS_SO_PRODUCT_TYPE_QUERY" />
                  </FormItem>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
        <CusQueryButtons
          onQuery={this.handleSearch}
          onReset={this.handleReset}
          onShowMore={this.handleShowMore}
          isShowMore={isShowMore}
        />
      </div>
    );
  }
}
