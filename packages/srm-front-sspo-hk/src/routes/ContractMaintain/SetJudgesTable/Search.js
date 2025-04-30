/**
 * index.js - 协议拟制-搜索
 * @date: 2019-05-15
 * @author: geekrainy <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';

import { getCurrentOrganizationId } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/spcm/contract-maintain/quoteSource' })
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
      tenantId: getCurrentOrganizationId(),
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * onClick - 查询按钮事件
   */
  @Bind()
  onClick() {
    const { onFetchList } = this.props;
    if (isFunction(onFetchList)) {
      onFetchList();
    }
  }

  /**
   * onReset - 重置按钮事件
   */
  @Bind()
  onReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  render() {
    const {} = this.props;
    const {} = this.state;
    return (
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="项目评委人数">
                  <Select
                    placeholder="请选择"
                    onChange={this.handleCurrencyChange}
                    style={{ width: '70%' }}
                  >
                    <Option value="num1">3</Option>
                    <Option value="num2">5</Option>
                    <Option value="num3">7</Option>
                    <Option value="num4">9</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    );
  }
}
