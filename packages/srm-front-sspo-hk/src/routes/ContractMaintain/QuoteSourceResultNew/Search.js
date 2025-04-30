/**
 * index.js - 协议拟制-搜索
 * @date: 2019-05-15
 * @author: geekrainy <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import moment from 'moment';

import { DEFAULT_DATE_FORMAT, SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';

const FormItem = Form.Item;
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
    const {
      form: { getFieldDecorator, getFieldValue },
    } = this.props;
    const { tenantId, expandForm } = this.state;

    // const { no } = dataSource;
    return (
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  // label={intl.get(`spcm.common.model.common.sourceNum`).d('寻源单号')}
                  label={intl.get(`ssrc.bidHall.model.bidHall.projectName`).d('项目名称:：')}
                >
                  {getFieldDecorator('projectName')(<p />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                {/* <Form.Item {...formItemLayout} label={intl.get(`entity.company.tag`).d('公司')}> */}
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`ssrc.bidHall.view.message.tab.baseInfos`).d('采购方式')}
                >
                  {getFieldDecorator('invOrganizationId')(
                    <Lov code="BID.YES_OR_NO" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`model.resultsQuery.currencyCode`).d('预算Capex（原币）')}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov code="SMDM.CURRENCY" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`model.resultsQuery.currencyType`).d('币种')}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov code="SMDM.CURRENCY" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`spcm.common.model.common.stockOrg`).d('库存组织')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('invOrganizationId')(
                    <Lov code="SPRM.INV_ORG" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.common.purchaser`).d('采购员')}
                >
                  {getFieldDecorator('purchaseAgentId')(
                    <Lov code="SPFM.USER_AUTH.PURCHASE_AGENT" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`entity.roles.creator`).d('创建人')}>
                  {getFieldDecorator('realName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.creation.from').d('创建日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('createDateFrom')(
                    <DatePicker
                      placeholder={null}
                      format={DEFAULT_DATE_FORMAT}
                      disabledDate={(current) =>
                        getFieldValue('createDateTo') &&
                        moment(getFieldValue('createDateTo')).isBefore(current, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.creation.to').d('创建日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('createDateTo')(
                    <DatePicker
                      placeholder={null}
                      format={DEFAULT_DATE_FORMAT}
                      disabledDate={(current) =>
                        getFieldValue('createDateFrom') &&
                        moment(getFieldValue('createDateFrom')).isAfter(current, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.common.goods`).d('物品')}
                >
                  {getFieldDecorator('itemName')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          {/* <Col span={6} className="search-btn-more">
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
          </Col> */}
        </Row>
      </Form>
    );
  }
}
