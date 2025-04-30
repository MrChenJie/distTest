import React from 'react';
import { Col, Input } from 'antd';
import intl from 'utils/intl';
import { getLFormGridSpan } from '_cus_utils/utils';
import { getCurrentOrganizationId } from 'utils/utils';
import CusSelect from '_cus_components/CusSelect';
import { Form } from 'hzero-ui';

const commonPrompt = 'spfmhk.dict';
const gridSpan = getLFormGridSpan();
const tenantId = getCurrentOrganizationId();
@Form.create()
export default class BasicData extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);
    this.state = {};
  }

  render() {
    const { idpValueMap, form, setMailModel, mailInfo = {}, isEdit } = this.props;

    const { getFieldDecorator } = form;
    return (
      <>
        <div className="customize-form">
          <Form>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.common.partnername`).d('合作伙伴名称')}
                name="cmpanyName"
              >
                {getFieldDecorator('cmpanyName', {
                  initialValue: mailInfo.cmpanyName,
                })(<Input disabled />)}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.back.emailtemplate`).d('邮件模板')}
                name="emailTemplate"
              >
                {getFieldDecorator('emailTemplate', {
                  initialValue: mailInfo.emailTemplate,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.view.back.emailtemplate`).d('邮件模板'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['DICT.REFUSE_PARTNER_EMAIL']}
                    onChange={(code) => {
                      setMailModel(code);
                    }}
                    disabled={!isEdit}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={intl.get(`${commonPrompt}.view.back.reasonofsendemail`).d('发送邮件原因')}
                name="sendReason"
              >
                {getFieldDecorator('sendReason', {
                  initialValue: mailInfo.sendReason,
                })(<Input       disabled={!isEdit} />)}
              </Form.Item>
            </Col>
          </Form>
        </div>
      </>
    );
  }
}
