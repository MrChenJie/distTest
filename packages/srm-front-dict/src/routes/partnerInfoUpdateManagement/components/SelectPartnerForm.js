import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { Row, Col } from 'antd';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';

const prompt = 'spfmhk.dict';
@Form.create()
@formatterCollections({ code: [prompt] })
@connect(() => ({}))
export default class SelectPartnerForm extends PureComponent {
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
                  label={intl.get(`${prompt}.view.common.partnername`).d('合作伙伴名称')}
                >
                  {getFieldDecorator('partnerId', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.view.common.partnername`).d('合作伙伴名称'),
                        }),
                      },
                    ],
                  })(<CusLov code="DICT.PARTNER_PASS_UNSUP"
                             lovOptions={{ displayField: 'cmpanyName', valueField: 'partnerId' }}
                  />)}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`${prompt}.view.field.info.update.type`).d('信息更新类别')}
                >
                  {getFieldDecorator('editType', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${prompt}.view.field.info.update.type`).d('信息更新类别'),
                        }),
                      },
                    ],
                  })(<CusSelect lovCode="DICT.EDIT_TYPE" />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </>
    );
  }
}
