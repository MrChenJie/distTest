import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { Row, Col, Form, Input, Switch } from 'hzero-ui';
import {
  EDIT_FORM_ITEM_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_3_LAYOUT,
} from 'utils/constants';
import ValueList from 'components/ValueList';
import Lov from 'components/Lov';

const commonPrompt = 'spub.whiteListConfig';

export default class WhiteListInformation extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      form,
      idpValueMap,
      whiteListConfigheader,
    } = this.props;
    const { getFieldDecorator = (e) => e, getFieldValue = (e) => e, setFieldsValue = (e) => e } = form;
    const { configCode, description, openFlag, interfaceType, interfaceId, interfaceCode } = whiteListConfigheader;

    return (
      <Fragment>
        <Form className='more-fields-search-form'>
          <Row {...EDIT_FORM_ROW_LAYOUT}>
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                label={intl.get(`${commonPrompt}.model.whiteListInformation.configCode`).d('配置编码')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('configCode', {
                  initialValue: configCode,
                  rules: [
                    {
                      required: getFieldValue('interfaceType') === 'NORMAL_IFACE',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.model.whiteListInformation.configCode`).d('配置编码'),
                      }),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                label={intl.get(`${commonPrompt}.model.whiteListInformation.description`).d('描述')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('description', {
                  initialValue: description,
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                label={intl.get(`${commonPrompt}.model.whiteListInformation.openFlag`).d('是否开启过滤')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('openFlag', {
                  initialValue: openFlag,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.model.whiteListInformation.openFlag`).d('是否开启过滤'),
                      }),
                    },
                  ],
                })(
                  <ValueList
                    allowClear
                    lazyLoad={false}
                    options={idpValueMap['HPFM.FLAG']}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row {...EDIT_FORM_ROW_LAYOUT}>
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                label={intl.get(`${commonPrompt}.model.whiteListInformation.interfaceType`).d('接口类型')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('interfaceType', {
                  initialValue: interfaceType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.model.whiteListInformation.interfaceType`).d('接口类型'),
                      }),
                    },
                  ],
                })(
                  <ValueList
                    allowClear
                    lazyLoad={false}
                    options={idpValueMap['SPUB.WHITE_INTERFACE_TYPE']}
                    onChange={() => {
                      setFieldsValue({
                        interfaceId: getFieldValue('interfaceId'),
                        interfaceCode: getFieldValue('interfaceCode'),
                        configCode: getFieldValue('configCode'),
                      });
                    }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <Form.Item
                label={intl.get(`${commonPrompt}.model.whiteListInformation.interfaceId`).d('接口编码')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('interfaceId', {
                  initialValue: interfaceId,
                  rules: [
                    {
                      required: getFieldValue('interfaceType') === 'PUBLISH_IFACE',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.model.whiteListInformation.interfaceId`).d('接口编码'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="HITF.INTERFACE"
                    textField='interfaceCode'
                    lovOptions={{ displayField: 'interfaceCode' }}
                  />
                )}
                {getFieldDecorator('interfaceCode', {
                  initialValue: interfaceCode,
                })}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Fragment>
    )
  }
}
