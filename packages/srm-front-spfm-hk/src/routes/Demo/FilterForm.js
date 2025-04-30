import React from 'react';
import dayjs from 'dayjs';
import { Row, Col, Form, Input } from 'antd';
import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';

import CusQueryButtons from '_cus_components/CusButton/CusQueryButtons';
import CusSelect from '_cus_components/CusSelect';
import CusLov from '_cus_components/CusLov';
import CusDatePicker from '_cus_components/CusDatePicker';
import { mediumScreenWidth } from '_cus_utils/constants';

const prompt = 'spfm.sanctionsList';
const dateTimeFormat = getDateTimeFormat();
const screenWidth = window.screen.width;

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
    const { onSearch = (e) => e, idpValueMap } = this.props;
    const { isShowMore } = this.state;

    return (
      <>
        <div className="customize-form">
          <Form ref={this.form}>
            <Row>
              <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.companyName`).d('参与方名称')}
                  wrapperCol={{ span: 24 }}
                  name="companyNum"
                >
                  <CusLov
                    code="SPFM.COMPANY_BASIC_NEW"
                    lovOptions={{ displayField: 'companyName', valueField: 'companyNum' }}
                  />
                </Form.Item>
              </Col>
              <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.similarityFrom`).d('相似度从')}
                  wrapperCol={{ span: 24 }}
                  name="similarityFrom"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                <Form.Item
                  label={intl.get(`${prompt}.view.query.similarityTo`).d('相似度至')}
                  wrapperCol={{ span: 24 }}
                  name="similarityTo"
                >
                  <Input />
                </Form.Item>
              </Col>
              <div style={{ display: isShowMore ? 'block': 'none' }}>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${prompt}.view.query.sanctionsType`).d('制裁类型')}
                    wrapperCol={{ span: 24 }}
                    name="sanctionsType"
                  >
                    <CusSelect
                      allowClear
                      options={idpValueMap['SPFM.SANCTIONS_TYPE']}
                      tip={
                        <>
                          <div>
                            {intl
                              .get(`${prompt}.view.list.sanctionsType.tips`)
                              .d('SDN List 限制事項：禁止与SDN 列表中的客户或供应商开展业务。')}
                          </div>
                          <div>
                            {intl
                              .get(`${prompt}.view.list.sanctionsType.tips1`)
                              .d('实体名单限制事項：不允许向实体名单下的客户出售任何具有美国技术硬件，软件或物品。')}
                          </div>
                        </>
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${prompt}.view.query.activeTimeFrom`).d('生效时间从')}
                    wrapperCol={{ span: 24 }}
                    name="activeTimeFrom"
                  >
                    <CusDatePicker
                      showTime
                      format={dateTimeFormat}
                      placeholder={intl
                        .get('hzero.common.view.message.selectDateTime')
                        .d('请选择时间')}
                      disabledDate={(currentDate) => {
                        return (
                          dayjs.isDayjs(this.form?.current?.getFieldValue('activeTimeTo')) &&
                          currentDate &&
                          currentDate.isAfter(this.form?.current?.getFieldValue('activeTimeTo'))
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${prompt}.view.query.activeTimeTo`).d('生效时间至')}
                    wrapperCol={{ span: 24 }}
                    name="activeTimeTo"
                  >
                    <CusDatePicker
                      showTime
                      format={dateTimeFormat}
                      placeholder={intl
                        .get('hzero.common.view.message.selectDateTime')
                        .d('请选择时间')}
                      disabledDate={(currentDate) => {
                        return (
                          dayjs.isDayjs(this.form?.current?.getFieldValue('activeTimeFrom')) &&
                          currentDate &&
                          currentDate.isBefore(this.form?.current?.getFieldValue('activeTimeFrom'))
                        );
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={screenWidth > mediumScreenWidth ? 8 : 12}>
                  <Form.Item
                    label={intl.get(`${prompt}.view.query.status`).d('状态')}
                    wrapperCol={{ span: 24 }}
                    name="status"
                  >
                    <CusSelect
                      allowClear
                      options={idpValueMap['SPFM.SANCTIONS_SIMILARITY_STATUS']}
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
