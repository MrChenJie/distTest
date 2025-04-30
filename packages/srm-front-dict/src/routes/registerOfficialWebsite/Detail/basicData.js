import React from 'react';
import { Col, Input } from 'antd';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';

const commonPrompt = 'spfmhk.dict';

@Form.create()
export default class BasicData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { form, basicInfo = {} } = this.props;
    const { getFieldDecorator } = form;
    return (
      <>
        <div className="customize-form">
          <Form ref={this.form}>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.common.partnername`).d('合作伙伴名称')}
                name="cmpanyName"
              >
                {getFieldDecorator('cmpanyName', {
                  initialValue: basicInfo.cmpanyName,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.cooperationmode`).d('合作模式')}
                name="collaborationMode"
              >
                {getFieldDecorator('collaborationMode', {
                  initialValue: basicInfo.collaborationMode,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.contactperson`).d('应答联系人')}
                name="contactsName"
              >
                {getFieldDecorator('contactsName', {
                  initialValue: basicInfo.contactsName,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.telno`).d('电话')}
                name="phone"
              >
                {getFieldDecorator('phone', {
                  initialValue: basicInfo.phone,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.email`).d('邮箱')}
                name="email"
              >
                {getFieldDecorator('email', {
                  initialValue: basicInfo.email,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl
                  .get(`${commonPrompt}.view.field.portalcompanylocation`)
                  .d('公司注册地址')}
                name="establishmentPlaceMeaning"
              >
                {getFieldDecorator('establishmentPlaceMeaning', {
                  initialValue: basicInfo.establishmentPlaceMeaning,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.contactaddress`).d('联络地址')}
                name="addressCh"
              >
                {getFieldDecorator('addressCh', {
                  initialValue: basicInfo.addressCh,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl
                  .get(`${commonPrompt}.view.field.businessregistrationcertificate`)
                  .d('商业登记证')}
                name="businessRegistration"
              >
                {getFieldDecorator('businessRegistration', {
                  initialValue: basicInfo.businessRegistration,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
          </Form>
        </div>
      </>
    );
  }
}
