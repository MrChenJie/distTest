import React from 'react';
import { Form, Row, Col, Input } from 'antd';
import intl from 'utils/intl';

const { TextArea } = Input;

export default class DetailForm extends React.PureComponent {
  constructor(props) {
    super(props);
    props?.onRef(this);
  }
  detailForm = React.createRef();

  render() {
    return (
      <div className="customize-form">
        <Form
          name='detail'
          ref={this.detailForm}
          disabled
        >
          <Row>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${prompt}.view.detail.interfaceReqHeaderParam`).d('平台接口调用参数')}
                wrapperCol={{ span: 24 }}
                name="interfaceReqHeaderParam"
                className='ant-label-textArea'
              >
                <TextArea
                  autoSize={{ minRows: 3, maxRows: 3 }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${prompt}.view.detail.interfaceReqBodyParam`).d('第三方接口调用参数')}
                wrapperCol={{ span: 24 }}
                name="interfaceReqBodyParam"
                className='ant-label-textArea'
              >
                <TextArea
                  autoSize={{ minRows: 3, maxRows: 3 }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${prompt}.view.detail.respContent`).d('平台接口响应内容')}
                wrapperCol={{ span: 24 }}
                name="respContent"
                className='ant-label-textArea'
              >
                <TextArea
                  autoSize={{ minRows: 3, maxRows: 3 }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                label={intl.get(`${prompt}.view.detail.interfaceRespContent`).d('第三方接口响应内容')}
                wrapperCol={{ span: 24 }}
                name="interfaceRespContent"
                className='ant-label-textArea'
              >
                <TextArea
                  autoSize={{ minRows: 3, maxRows: 3 }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    )
  }
}
