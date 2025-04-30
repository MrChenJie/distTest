import React from 'react';
import { Input, Row, Col, Form } from 'antd';
import intl from 'utils/intl';
import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import { getDateTimeFormat } from 'utils/utils';
import CusDatePicker from '_cus_components/CusDatePicker';
import { mediumScreenWidth } from '_cus_utils/constants';

const screenWidth = window.screen.width;
const prompt = 'spub.interfaceErrors';
const dateTimeFormat = getDateTimeFormat();

export default class FilterForm extends React.Component {
  constructor(props) {
    super(props);
    props?.onRef(this);

    this.state = {
      isShowMore: false,
    };
  }

  form = React.createRef();

  handleShowMore = () => {
    const { isShowMore } = this.state;
    this.setState({
      isShowMore: !isShowMore,
    });
  };

  handleReset = () => {
    this.form.current?.resetFields();
  };

  render() {
    const { onSearch = (e) => e } = this.props;
    const { isShowMore } = this.state;

    return (
      <>
        <div className="customize-form">
          <Form ref={this.form}>
            <Row>
              <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.clientId`).d('客户端ID')}
                  wrapperCol={{ span: 24 }}
                  name="clientId"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.invokeKey`).d('请求ID')}
                  wrapperCol={{ span: 24 }}
                  name="invokeKey"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.serverCode`).d('服务代码')}
                  wrapperCol={{ span: 24 }}
                  name="serverCode"
                >
                  <Input />
                </Form.Item>
              </Col>
              <div style={{ display: isShowMore ? 'block' : 'none' }}>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${prompt}.view.query.serverName`).d('服务名称')}
                    wrapperCol={{ span: 24 }}
                    name="serverName"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${prompt}.view.query.interfaceUrl`).d('第三方接口地址')}
                    wrapperCol={{ span: 24 }}
                    name="interfaceUrl"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${prompt}.view.query.interfaceCode`).d('接口编码')}
                    wrapperCol={{ span: 24 }}
                    name="interfaceCode"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${prompt}.view.query.interfaceName`).d('接口名称')}
                    wrapperCol={{ span: 24 }}
                    name="interfaceName"
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${prompt}.view.query.dateFromStr`).d('请求时间从')}
                    wrapperCol={{ span: 24 }}
                    name="dateFromStr"
                  >
                    <CusDatePicker
                      showTime
                      format={dateTimeFormat}
                      placeholder={intl
                        .get('hzero.common.view.message.selectDateTime')
                        .d('请选择时间')}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${prompt}.view.query.dateToStr`).d('请求时间至')}
                    wrapperCol={{ span: 24 }}
                    name="dateToStr"
                  >
                    <CusDatePicker
                      showTime
                      format={dateTimeFormat}
                      placeholder={intl
                        .get('hzero.common.view.message.selectDateTime')
                        .d('请选择时间')}
                    />
                  </Form.Item>
                </Col>
              </div>
              <Col span={screenWidth > mediumScreenWidth ? 8 : 12} style={{ float: 'right' }}>
                <CusQueryButtons
                  onQuery={onSearch}
                  onReset={this.handleReset}
                  onShowMore={this.handleShowMore}
                  isShowMore={isShowMore}
                />
              </Col>
            </Row>
          </Form>
        </div>
      </>
    );
  }
}
