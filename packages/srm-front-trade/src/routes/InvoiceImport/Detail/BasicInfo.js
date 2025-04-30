import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { Row, Col, Form } from 'hzero-ui';
import {
  EDIT_FORM_ITEM_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_3_LAYOUT,
} from 'utils/constants';

const commonPrompt = 'spub.invoiceImport';

export default class BasicInfo extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      invoiceImportBasic,
    } = this.props;
    const {
      invoiceImportId,
      requestNum,
      ebsRequestId,
      creationDate,
      processStatusMeaning,
    } = invoiceImportBasic;

    return (
      <Fragment>
        <Form className='more-fields-search-form'>
          <Row {...EDIT_FORM_ROW_LAYOUT}>
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                label={intl.get(`${commonPrompt}.model.basicInfo.invoiceImportId`).d('导入标识')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {invoiceImportId}
              </Form.Item>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                label={intl.get(`${commonPrompt}.model.basicInfo.requestNum`).d('付款申请编号')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {requestNum}
              </Form.Item>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                label={intl.get(`${commonPrompt}.model.basicInfo.ebsRequestId`).d('Ebs请求标识')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {ebsRequestId}
              </Form.Item>
            </Col>
          </Row>
          <Row {...EDIT_FORM_ROW_LAYOUT}>
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                label={intl.get(`${commonPrompt}.model.basicInfo.creationDate`).d('导入时间')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {creationDate}
              </Form.Item>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                label={intl.get(`${commonPrompt}.model.basicInfo.processStatusMeaning`).d('导入状态')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {processStatusMeaning}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Fragment>
    )
  }
}
