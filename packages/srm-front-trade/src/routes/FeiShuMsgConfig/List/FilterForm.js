/**
 * @Description: 飞书消息配置列表页面 - 查询条件
 * @date 2023-02-09
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

const commonPrompt = 'spub.feiShuMsgConfig';

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
                  label={intl.get(`${commonPrompt}.view.query.msgConfigCode`).d('配置编码')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('msgConfigCode')(<Input />)}
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
                  label={intl.get(`${commonPrompt}.view.query.title`).d('标题')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('title')(<Input />)}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.query.enabledFlag`).d('是否有效')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('enabledFlag')(
                    <ValueList
                      allowClear
                      lazyLoad={false}
                      options={idpValueMap['SPFM.YES_NO']}
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
 