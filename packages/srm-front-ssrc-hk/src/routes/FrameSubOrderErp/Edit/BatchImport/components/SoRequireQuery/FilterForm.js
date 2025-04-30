import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Input, Row, Col } from 'antd';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import dayjs from 'dayjs';

const FormItem = Form.Item;

export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      display: true,
    };
  }

  /**
   * 提交查询表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleSearch() {
    const { onSearch = (e) => e } = this.props;
    onSearch();
  }

  /**
   * 重置表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  render() {
    const {
      idpValueMap,
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const { display } = this.state;
    return (
      <>
        <Form className="customize-form">
          <Row>
            <Col span={12}>
              <FormItem label={intl.get('ssrc.resaleRfq.srq.intentionNum').d('意向单号')}>
                {getFieldDecorator('handleCode')(<Input />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label={intl.get('ssrc.resaleRfq.srq.demandNum').d('需求单号')}>
                {getFieldDecorator('requireCode')(<Input />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label={intl.get('ssrc.resaleRfq.srq.salesUnit').d('销售单元')}>
                {getFieldDecorator('orderOwnerCode')(
                  <CusLov
                    code="SPUC.ENTITY_SALESREGION"
                    queryParams={{ tenantId: getCurrentOrganizationId() }}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label={intl.get('ssrc.resaleRfq.srq.sigsedCustomer').d('签约客户')}>
                {getFieldDecorator('signCustomer')(<Input />)}
              </FormItem>
            </Col>
            <div style={{ display: !display ? 'block' : 'none' }}>
              <Col span={12}>
                <FormItem label={intl.get('ssrc.resaleRfq.srq.createDateFrom').d('创建时间从')}>
                  {getFieldDecorator('createDateFrom')(
                    <CusDatePicker
                      disabledDate={(currentDate) => {
                        const endDate = getFieldValue(`createDateTo`);
                        if (endDate && dayjs(endDate).isValid()) {
                          return currentDate.isAfter(endDate);
                        }
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label={intl.get('ssrc.resaleRfq.srq.createDateTo').d('创建时间至')}>
                  {getFieldDecorator('createDateTo')(
                    <CusDatePicker
                      disabledDate={(currentDate) => {
                        const startDate = getFieldValue(`createDateFrom`);
                        if (startDate && dayjs(startDate).isValid()) {
                          return currentDate.isBefore(startDate);
                        }
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label={intl.get('ssrc.resaleRfq.srq.productType').d('产品类型')}>
                  {getFieldDecorator('productType', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('ssrc.resaleRfq.srq.productType').d('产品类型'),
                        }),
                      },
                    ],
                  })(
                    <CusSelect
                      options={idpValueMap['RS_IBOSS_SO_PRODUCT_TYPE']}
                      showSearch
                      filterOption={(inputValue, option) => {
                        return option.meaning.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
                      }}
                    />
                  )}
                </FormItem>
              </Col>
            </div>
            <Col span={12} style={{ float: 'right' }}>
              <CusQueryButtons
                onQuery={this.handleSearch}
                onReset={this.handleFormReset}
                onShowMore={this.toggleForm}
                isShowMore={!display}
              />
            </Col>
          </Row>
        </Form>
      </>
    );
  }
}
