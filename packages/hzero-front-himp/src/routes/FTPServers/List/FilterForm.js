/**
 * @Description: FTP服务器信 - 查询条件
 * @date 2023-02-02
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Col, Form, Input, Row } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';

const commonPrompt = 'himp.ftpServers';
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
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={24} style={{ marginBottom: '15px' }}>
          <Col span={24}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.model.serverCode`).d('ftp服务器编码')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('serverCode')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.model.description`).d('描述')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('description')(<Input />)}
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
