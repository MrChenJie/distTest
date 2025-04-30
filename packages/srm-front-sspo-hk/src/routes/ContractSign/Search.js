/**
 * index.js - 协议签署-搜索
 * @date: 2019-05-22
 * @author: geekrainy <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { DEFAULT_DATE_FORMAT, SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { isFunction } from 'lodash';
import { getUserOrganizationId } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';
import moment from 'moment';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const commonPrompt = 'spcm.contractSign.model';
const common = 'spcm.common.model';

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/spcm/contract-sign/list' })
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
      organizationId: getUserOrganizationId(),
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
    const {
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const { organizationId, expandForm } = this.state;
    return (
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get(`spcm.common.model.common.purchaseAgreementNum`)
                    .d('采购协议编号')}
                >
                  {getFieldDecorator('pcNum')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${common}.purchaseAgreementName`).d('采购协议名称')}
                >
                  {getFieldDecorator('pcName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`${commonPrompt}.customer`).d('客户')}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPCM.USER_AUTH.CUSTOMER"
                      textField="companyName"
                      queryParams={{ organizationId }}
                      onChange={this.cascadingEventCompany}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.release.from').d('发布日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('approvedDateFrom')(
                    <DatePicker
                      placeholder=""
                      format={DEFAULT_DATE_FORMAT}
                      disabledDate={currentDate =>
                        getFieldValue('approvedDateTo') &&
                        moment(getFieldValue('approvedDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.release.to').d('发布日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('approvedDateTo')(
                    <DatePicker
                      format={DEFAULT_DATE_FORMAT}
                      placeholder=""
                      disabledDate={currentDate =>
                        getFieldValue('approvedDateFrom') &&
                        moment(getFieldValue('approvedDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.onReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button data-code="search" type="primary" htmlType="submit" onClick={this.onClick}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
