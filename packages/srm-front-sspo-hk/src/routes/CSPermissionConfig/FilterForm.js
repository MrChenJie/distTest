import React, { PureComponent } from 'react';
import { Form, Row, Col, Button, DatePicker, Input } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import moment from 'moment';

import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';
import ValueList from 'components/ValueList';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import Lov from './Lov';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandFlag: false,
    };
  }

  @Bind
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind
  @Debounce(300, { leading: true })
  handleSearch() {
    const { onSearch = (e) => e } = this.props;
    onSearch();
  }

  @Bind
  toggleForm() {
    const { expandFlag } = this.state;
    this.setState({
      expandFlag: !expandFlag,
    });
  }

  render() {
    const { form, idpValueMap } = this.props;
    const { expandFlag } = this.state;
    const { getFieldDecorator } = form;
    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get('spcm.csPermissionConfig.model.userName').d('用户名称')}
            >
              {getFieldDecorator('userName')(<Input maxLength={30} />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get('spcm.csPermissionConfig.model.businessType').d('业务类型')}
            >
              {getFieldDecorator('businessType')(
                <ValueList
                  options={idpValueMap['SPUC.BUSINESS_TYPE']}
                  allowClear
                  lazyLoad={false}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get('spcm.csPermissionConfig.model.salesUnit').d('采购部门')}
            >
              {getFieldDecorator('salesUnitCode')(
                <Lov
                  code="SPRM.USER_UNIT"
                  queryParams={{ tenantId: getCurrentOrganizationId() }}
                  lovOptions={{ valueField: 'unitCode' }}
                  selectFlag={false}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get('spcm.csPermissionConfig.model.createDateFrom').d('创建日期从')}
            >
              {getFieldDecorator('createDateFrom')(
                <DatePicker
                  disabledDate={(currentDate) => {
                    return (
                      moment.isMoment(form.getFieldValue('createDateTo')) &&
                      currentDate &&
                      currentDate.isAfter(form.getFieldValue('createDateTo'))
                    );
                  }}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get('spcm.csPermissionConfig.model.createDateTo').d('创建日期至')}
            >
              {getFieldDecorator('createDateTo')(
                <DatePicker
                  disabledDate={(currentDate) => {
                    return (
                      moment.isMoment(form.getFieldValue('createDateFrom')) &&
                      currentDate &&
                      currentDate.isBefore(form.getFieldValue('createDateFrom'))
                    );
                  }}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get('spcm.csPermissionConfig.model.creator').d('创建人')}
            >
              {getFieldDecorator('creator')(<Input maxLength={30} />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24} style={{ display: expandFlag ? 'block' : 'none' }}>
          <Col span={8}>
            <Form.Item
              {...SEARCH_FORM_ITEM_LAYOUT}
              label={intl.get('spcm.csPermissionConfig.model.userUnitName').d('用户部门')}
            >
              {getFieldDecorator('userUnitCode')(
                <Lov
                  code="SPRM.USER_UNIT"
                  queryParams={{ tenantId: getCurrentOrganizationId() }}
                  lovOptions={{ valueField: 'unitCode' }}
                  selectFlag={false}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24} className="custmize-querybar-buttons">
            <Button onClick={this.handleReset}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
            <Button type="primary" onClick={this.handleSearch} htmlType="submit">
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
            <Button
              style={{ display: expandFlag ? 'none' : 'inline-block' }}
              onClick={this.toggleForm}
            >
              {intl.get('hzero.common.button.viewMore').d('更多查询')}
            </Button>
            <Button
              style={{ display: expandFlag ? 'inline-block' : 'none' }}
              onClick={this.toggleForm}
            >
              {intl.get('hzero.common.button.collected').d('收起查询')}
            </Button>
          </Col>
        </Row>
      </Form>
    );
  }
}
