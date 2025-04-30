import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { Row, Col, Form, Input, Switch } from 'hzero-ui';
import {
  EDIT_FORM_ITEM_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_3_LAYOUT,
} from 'utils/constants';

const commonPrompt = 'spub.feiShuMsgConfig';

export default class FeiShuInformation extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      form,
      feiShuMsgConfigheader,
    } = this.props;
    const { getFieldDecorator = (e) => e } = form;
    const { msgConfigCode, description, title, titleCode, enabledFlag } = feiShuMsgConfigheader;

    return (
      <Fragment>
        <Form className='more-fields-search-form'>
          <Row {...EDIT_FORM_ROW_LAYOUT}>
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                label={intl.get(`${commonPrompt}.model.feiShuInformation.msgConfigCode`).d('配置编码')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('msgConfigCode', {
                  initialValue: msgConfigCode,
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                label={intl.get(`${commonPrompt}.model.feiShuInformation.description`).d('描述')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('description', {
                  initialValue: description,
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                label={intl.get(`${commonPrompt}.model.feiShuInformation.title`).d('标题')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('title', {
                  initialValue: title,
                })(
                  <Input />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row {...EDIT_FORM_ROW_LAYOUT}>
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                label={intl.get(`${commonPrompt}.model.feiShuInformation.titleCode`).d('标题编码')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('titleCode', {
                  initialValue: titleCode,
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                label={intl.get(`${commonPrompt}.model.feiShuInformation.enabledFlag`).d('是否有效')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('enabledFlag', {
                  initialValue: enabledFlag,
                })(<Switch  checkedValue='Y' unCheckedValue='N' />)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Fragment>
    )
  }
}
