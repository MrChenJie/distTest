/**
 * @Description: 应付发票导入记录列表页面 - 查询条件
 * @date 2023-02-22
 * @author <xinyi.he02@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { Button, Col, Form, Input, Row, DatePicker } from 'hzero-ui';
import intl from 'utils/intl';
import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';

const commonPrompt = 'spub.invoiceImport';

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
    const { form } = this.props;
    const { getFieldDecorator = (e) => e } = form;

    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={24} style={{ marginBottom: '15px' }}>
          <Col span={24}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.query.requestNum`).d('付款申请编号')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('requestNum')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.query.creationDateFrom`).d('导入时间从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder=""
                      disabledDate={(currentDate) => {
                        return (
                          moment.isMoment(form.getFieldValue('creationDateTo')) &&
                          currentDate &&
                          currentDate.isAfter(form.getFieldValue('creationDateTo'))
                        );
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.query.creationDateTo`).d('导入时间至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder=""
                      disabledDate={(currentDate) => {
                        return (
                          moment.isMoment(form.getFieldValue('creationDateFrom')) &&
                          currentDate &&
                          currentDate.isBefore(form.getFieldValue('creationDateFrom'))
                        );
                      }}
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
 