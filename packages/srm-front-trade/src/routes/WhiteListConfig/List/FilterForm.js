/**
 * @Description: 白名单配置列表页面 - 查询条件
 * @date 2023-02-16
 * @author <xinyi.he02@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Col, Form, Input, Row } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';
import ValueList from 'components/ValueList';
import Lov from 'components/Lov';

const commonPrompt = 'spub.whiteListConfig';

export default class FilterForm extends PureComponent {
  /**
  * 查询
  */
  @Bind()
  handleSearch() {
    const { search, form } = this.props;
    if (search) {
      form.validateFields((err) => {
        if (!err) {
          // 如果验证成功,则执行search
          search();
        }
      });
    }
  }

  /**
  * 重置
  */
  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const { idpValueMap, form } = this.props;
    const { getFieldDecorator = (e) => e } = form;

    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={24} style={{ marginBottom: '15px' }}>
          <Col span={24}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.query.configCode`).d('配置编码')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('configCode')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.query.description`).d('描述')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('description')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.query.openFlag`).d('是否开启过滤')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('openFlag')(
                    <ValueList
                      allowClear
                      lazyLoad={false}
                      options={idpValueMap['HPFM.FLAG']}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.query.interfaceType`).d('接口类型')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('interfaceType')(
                    <ValueList
                      allowClear
                      lazyLoad={false}
                      options={idpValueMap['SPUB.WHITE_INTERFACE_TYPE']}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.query.interfaceId`).d('接口编码')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('interfaceId')(
                    <Lov
                      code="HITF.INTERFACE"
                      lovOptions={{ displayField: 'interfaceCode' }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24} className="search-btn-more" style={{ textAlign: 'right' }}>
            <Form.Item>
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
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
 