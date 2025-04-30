/**
 * @Description: 接口监控 -邮件提醒
 * @date 2023-02-17
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Col, Form, Input, Row } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';
import ValueList from 'components/ValueList';
import Lov from 'components/Lov';

const commonPrompt = 'spub.emailReminder';

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
                  label={intl.get(`${commonPrompt}.view.query.serverCode`).d('服务代码')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('interfaceCode')(
                    <Lov code="SPUB_INTERFACE_MONITOR"

                         queryParams={{
                      tenantId: getCurrentOrganizationId(),

                    }}
                         lovOptions={{ displayField: 'serverCode' }}
                         onChange={(lovValue, lovData) => {
                           form.setFieldsValue({
                             serverCode: lovData.serverCode,
                           })
                         }}
                    />
                  )}
                </Form.Item>
                <Form.Item style={{ display: 'none' }}>
                  {getFieldDecorator('serverCode')(
                    <div />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.query.interfaceName`).d('接口名称')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('interfaceName')(
                    <Input />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.query.serviceCategory`).d('服务类别')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('serviceCategory')(
                    <ValueList
                      allowClear
                      lazyLoad={false}
                      style={{ width: '100%'}}
                      options={idpValueMap['HITF.SERVICE_CATEGORY']}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.query.enabledFlag`).d('启用标识')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('enabledFlag')(
                    <ValueList
                      allowClear
                      lazyLoad={false}
                      style={{ width: '100%'}}
                      options={idpValueMap['HPFM.ENABLED_FLAG']}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${commonPrompt}.view.query.module`).d('模块')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('moduleList')(
                    <ValueList
                      allowClear
                      mode="multiple"
                      lazyLoad={false}
                      style={{ width: '100%'}}
                      options={idpValueMap['SPUB.SCM_MODULE']}
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
