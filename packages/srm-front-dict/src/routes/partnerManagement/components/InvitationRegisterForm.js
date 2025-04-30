import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { Row, Col } from 'antd';
import CusInput from '_cus_components/CusInput';
import { EMAIL } from 'utils/regExp';

const prompt = 'spfmhk.dict';
@Form.create()
@formatterCollections({ code: [prompt] })
@connect(() => ({}))
export default class InvitationRegisterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <>
        <div className="customize-form">
          <Form>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`${prompt}.field.inviter`).d('邀请方')}
                >
                  {getFieldDecorator('inviter', {
                    initialValue: 'China Mobile Hong Kong Company Limited',
                  })(<CusInput disabled />)}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`${prompt}.view.common.partnername`).d('合作伙伴名称')}
                >
                  {getFieldDecorator('cmpanyName', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.view.common.partnername`).d('合作伙伴名称'),
                        }),
                      },
                    ],
                  })(<CusInput />)}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`${prompt}.view.field.commonemail`).d('合作伙伴邮箱')}
                >
                  {getFieldDecorator('email', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.view.field.commonemail`).d('合作伙伴邮箱'),
                        }),
                      },
                      {
                        pattern: EMAIL,
                        message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                      },
                    ],
                  })(<CusInput />)}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`${prompt}.view.field.certificationno`).d('统一社会信用代码/商业登记证编号')}
                >
                  {getFieldDecorator('businessRegistration', {})(<CusInput />)}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`${prompt}.view.field.invitioninstruction`).d('邀请说明')}
                >
                  {getFieldDecorator('inviteExplain', {})(<CusInput />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </>
    );
  }
}
