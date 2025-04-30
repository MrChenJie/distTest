/*
 * @Description:
 * @Author: 谭治鹏
 * @email: ZHIPENG.TAN01@HAND-CHINA.COM
 * @Date: 2025-03-11 10:25:34
 */
import React from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import { Row, Col } from 'antd';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import { getDFormGridSpan } from '_cus_utils/utils';
import StaticTextEditor from '../StaticTextEditor';

const gridSpan = getDFormGridSpan();
@Form.create({ fieldNameProp: null })
export default class Logistics extends React.PureComponent {
  constructor(props) {
    super(props);
    const { onRef = (e) => e } = props;
    this.staticTextEditor = React.createRef();
    onRef(this);
    this.state = {};
  }

  // 编辑邮件内容
  onEditEmail = (val) => {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({ afterSalesPolicy: val });
  };

  render() {
    const { form, idpValueMap, PartnerInformationModal, readyOnly = false } = this.props;

    const { partnerStore = {} } = PartnerInformationModal;

    return (
      <>
        <Form className="customize-form">
          <Row>
            <Col {...gridSpan}>
              <Form.Item label={intl.get(`spfmhk.mylink.field.portal.delivery`).d('物流')}>
                {this.props.form.getFieldDecorator('deliveryMethod', {
                  initialValue: partnerStore?.deliveryMethod,
                  rules: [
                    {
                      required: readyOnly,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.portal.delivery`).d('物流'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    style={{ width: '100%' }}
                    allowClear
                    options={idpValueMap['LINK.PARTNER.DELIVERY_METHOD']}
                    disabled={!readyOnly}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item label={intl.get(`spfmhk.mylink.field.portal.policy`).d('售后政策')}>
                {this.props.form.getFieldDecorator('afterSalesPolicy', {
                  initialValue: partnerStore?.afterSalesPolicy,
                  rules: [
                    {
                      required: readyOnly,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.portal.policy`).d('售后政策'),
                      }),
                    },
                  ],
                })(
                  <StaticTextEditor
                    key="afterSalesPolicy"
                    isDisabled={!readyOnly}
                    content={partnerStore?.afterSalesPolicy || {}}
                    config={{ height: 150 }}
                    onRef={(staticTextEditor) => {
                      this.staticTextEditor = staticTextEditor;
                    }}
                    onEditChange={this.onEditEmail}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </>
    );
  }
}
