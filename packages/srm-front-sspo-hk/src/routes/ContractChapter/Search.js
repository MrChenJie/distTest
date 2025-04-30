/**
 * index.js - 协议用章-搜索
 * @date: 2019-08-13
 * @author: MJQ <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import moment from 'moment';

import Lov from 'components/Lov';
import {
  DEFAULT_DATE_FORMAT,
  SEARCH_FORM_ROW_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
} from 'utils/constants';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/spcm/contract-chapter/list' })
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
      tenantId: getCurrentOrganizationId(),
      // organizationId: getUserOrganizationId(),
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  /**
   * onClick - 查询按钮事件
   */
  @Bind()
  handlequery() {
    const { onFetchList } = this.props;
    if (isFunction(onFetchList)) {
      onFetchList();
    }
  }

  // 查询条件展开/收起
  @Bind
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({ expandForm: !expandForm });
  }

  /**
   * onReset - 重置按钮事件
   */
  @Bind
  onReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  render() {
    const { expandForm, tenantId } = this.state;
    const {
      form: { getFieldDecorator, getFieldValue },
    } = this.props;

    return (
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl
                    .get(`spcm.common.model.common.purchaseAgreementNum`)
                    .d('采购协议编号')}
                >
                  {getFieldDecorator('pcNum')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`spcm.contractChapter.model.pcName`).d('采购协议名称')}
                >
                  {getFieldDecorator('pcName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`spcm.contractChapter.model.supplierCompanyId`).d('协议对象')}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SPCM.USER_AUTH.SUPPLIER"
                      textField="supplierCompanyName"
                      queryParams={{ tenantId }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.creation.from').d('创建日期从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      placeholder=""
                      format={DEFAULT_DATE_FORMAT}
                      disabledDate={currentDate =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hzero.common.date.creation.to').d('创建日期至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      placeholder=""
                      format={DEFAULT_DATE_FORMAT}
                      disabledDate={currentDate =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button onClick={this.onReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.handlequery}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
