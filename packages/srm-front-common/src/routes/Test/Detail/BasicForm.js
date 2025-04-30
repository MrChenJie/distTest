import React from 'react';
import { Form, Row, Col, Input } from 'antd';
import intl from 'utils/intl';
import CusDatePicker from '@/components/CusDatePicker';

export default class BasicForm extends React.PureComponent {
  constructor(props) {
    super(props);
    props?.onRef(this);
  }

  basicForm = React.createRef();

  render() {
    const { detailList } = this.props;
    console.log(detailList, detailList.invokeKey);
    return (
      <div className="customize-form">
        <Form
          name='basic'
          ref={this.basicForm}
          disabled
        >
          <Row>
            <Col span={8}>
              <Form.Item
                label={intl.get(`${prompt}.view.basic.invokeKey`).d('请求ID')}
                wrapperCol={{ span: 24 }}
                name="invokeKey"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get(`${prompt}.view.basic.serverCode`).d('服务代码')}
                wrapperCol={{ span: 24 }}
                name="serverCode"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get(`${prompt}.view.basic.serverName`).d('服务名称')}
                wrapperCol={{ span: 24 }}
                name="serverName"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <Form.Item
                label={intl.get(`${prompt}.view.basic.clientId`).d('客户端ID')}
                wrapperCol={{ span: 24 }}
                name="clientId"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get(`${prompt}.view.basic.interfaceRequestTime`).d('接口请求时间')}
                wrapperCol={{ span: 24 }}
                name="interfaceRequestTime"
              >
                <CusDatePicker
                  showTime
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get(`${prompt}.view.basic.ip`).d('请求IP')}
                wrapperCol={{ span: 24 }}
                name="ip"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={8}>
              <Form.Item
                label={intl.get(`${prompt}.view.basic.interfaceUrl`).d('接口地址')}
                wrapperCol={{ span: 24 }}
                name="interfaceUrl"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get(`${prompt}.view.basic.interfaceResponseStatus`).d('接口响应状态')}
                wrapperCol={{ span: 24 }}
                name="interfaceResponseStatus"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    )
  }
}
