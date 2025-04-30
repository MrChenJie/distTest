/*
 * Search - 订单按明细查找表单
 * @date: 2018-11-26 16:04:49
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';

import SearchDrawer from './SearchDrawer';

/**
 * 订单查找表单
 * @extends {Component} - React.Component
 * @reactProps {Function} handleSearch  搜索
 * @reactProps {Function} handleFormReset  重置表单
 * @reactProps {Function} toggleForm  展开查询条件
 * @reactProps {Function} renderAdvancedForm 渲染所有查询条件
 * @reactProps {Function} renderSimpleForm 渲染缩略查询条件
 * @return React.element
 */
const modelPrompt = 'sodr.sendOrder.model.common';
const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/spcm/contract-maintain/quotePurchaseOrder' })
export default class Search extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      moreSearchParams: false,
    };
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch();
    }
  }

  /**
   * 打开滑窗搜索
   */
  @Bind()
  handleSearchMore() {
    this.setState({ moreSearchParams: false }, this.handleSearch());
  }

  /**
   * 改变滑窗Visible
   * @param {String} field
   * @param {Boolean} flag
   */
  @Bind()
  handleMoreParamsVisible(field, flag) {
    this.setState({ [field]: !!flag });
  }

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const { form, handleReset } = this.props;
    form.resetFields();
    if (handleReset) {
      handleReset();
    }
  }

  /**
   * 改变Lov时清空供应商地点
   * @param {Number} rowKey
   */
  @Bind()
  onChangeSupplierId(rowKey) {
    const { form } = this.props;
    if (!rowKey || form.getFieldsValue(['supplierId']) !== rowKey) {
      form.resetFields(['supplierSiteCode', 'supplierSiteName']);
    }
  }

  /**
   * 关闭滑窗搜索
   */
  @Bind()
  handleHideDrawer() {
    this.handleMoreParamsVisible('moreSearchParams', false);
  }

  render() {
    const { form, code = {} } = this.props;
    const { moreSearchParams } = this.state;
    const { getFieldDecorator } = form;
    const searchDrawerProps = {
      form,
      code,
      visible: moreSearchParams,
      onHideDrawer: this.handleHideDrawer,
      onSearch: this.handleSearchMore,
      onReset: this.handleFormReset,
    };
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={6}>
              <FormItem {...formItemLayout} label={intl.get(`${modelPrompt}.orderNum`).d('订单号')}>
                {getFieldDecorator('displayPoNum')(<Input inputChinese={false} />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem {...formItemLayout} label={intl.get(`${modelPrompt}.lineNum`).d('行号')}>
                {getFieldDecorator('displayLineNum')(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                {...formItemLayout}
                label={intl.get(`${modelPrompt}.shipmentNum`).d('发运号')}
              >
                {getFieldDecorator('displayLineLocationNum')(<Input />)}
              </FormItem>
            </Col>
            <Col span={6} className="search-btn-more">
              <FormItem>
                <Button
                  data-code="reset"
                  onClick={() => this.handleMoreParamsVisible('moreSearchParams', true)}
                >
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
                </Button>
                <Button data-code="reset" onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <SearchDrawer {...searchDrawerProps} />
      </div>
    );
  }
}
