import React from 'react';
import { Col, Input } from 'antd';
import intl from 'utils/intl';
import { getLFormGridSpan } from '_cus_utils/utils';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import GenerateSearchFormGrid from '_cus_utils/generate/GenerateSearchFormGrid';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import CusDatePicker from '_cus_components/CusDatePicker';
import { Form } from 'hzero-ui';

const commonPrompt = 'spfmhk.dict';
const gridSpan = getLFormGridSpan();
const tenantId = getCurrentOrganizationId();
@Form.create()
export default class QaForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  handleReset = () => {
    this.form.current?.resetFields();
  };

  render() {
    const {
      idpValueMap,
      form,

      partnerInfo = {},
    } = this.props;

    const { getFieldDecorator } = form;
    return (
      <>
        <div className="customize-form">
          <Form ref={this.form}>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.common.partnername`).d('合作伙伴名称')}
                name="partnerName"
              >
                {getFieldDecorator('partnerName', {
                  initialValue: partnerInfo.partnerName,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.cooperationmode`).d('合作模式')}
                name="collaborationMode"
              >
                {getFieldDecorator('collaborationMode', {
                  initialValue: partnerInfo.collaborationMode,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.field.portalreplystatus`).d('回复状态')}
                name="replyStatus"
              >
                {getFieldDecorator('replyStatus', {
                  initialValue: partnerInfo.replyStatus,
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['DICT.QUESTION_REPLY_STATUS']}
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item  label={intl.get(`${commonPrompt}.view.field.common.salesperson`).d('业务员')} name="salesman">
                {getFieldDecorator('salesman', {
                  initialValue: partnerInfo.salesman,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
          </Form>
        </div>
      </>
    );
  }
}
