/*
 * Detail - 接口监控详情
 * @date: 2018/09/17 15:40:00
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Card, Col, Form, Row } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  DETAIL_CARD_CLASSNAME,
  EDIT_FORM_ITEM_LAYOUT,
  EDIT_FORM_ITEM_LAYOUT_COL_2,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_2_LAYOUT,
  FORM_COL_3_LAYOUT,
} from 'utils/constants';
import jsonFormat from '@/components/JsonFormat';
import styles from '../index.less';

function buildMultiLine(arr, key) {
  const lineSepChar = `
`;
  return arr
    .map(r => {
      if (r[key]) {
        return r[key].split('\n').join(lineSepChar);
      } else {
        return lineSepChar;
      }
    })
    .join(lineSepChar);
}

@connect(({ loading, interfaceLogs }) => ({
  fetchLogsDetailLoading: loading.effects['interfaceLogs/fetchLogsDetail'],
  interfaceLogs,
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['hitf.interfaceLogs'] })
export default class Detail extends PureComponent {
  componentDidMount() {
    this.getData();
  }

  @Bind()
  getData() {
    const { dispatch, match } = this.props;
    const { interfaceLogId } = match.params;
    dispatch({
      type: 'interfaceLogs/fetchLogsDetail',
      payload: { interfaceLogId },
    });
  }

  @Bind()
  handleDetailedInfo(data) {
    const handledData = {
      reqBodyParam: data.reqBodyParam ? this.handleTransJson(data.reqBodyParam) : '',
      respContent: data.respContent ? this.handleTransJson(data.respContent) : '',
      interfaceReqBodyParam: data.interfaceReqBodyParam
        ? this.handleTransJson(data.interfaceReqBodyParam)
        : '',
      interfaceRespContent: data.interfaceRespContent
        ? this.handleTransJson(data.interfaceRespContent)
        : '',
    };
    return handledData;
  }

  /**
   * JSON字符串转换
   * @param {string} value - 需要处理的值
   */
  @Bind()
  handleTransJson(value) {
    const obj = this.handleTransObj(value);
    const handledValue = obj === null ? value : jsonFormat(obj);
    return handledValue;
  }

  /**
   * 将JSON字符串转换为格式化JSON
   * @param {string} - str JSON字符串
   */
  @Bind()
  handleTransObj(str) {
    let result = null;
    try {
      result = JSON.parse(str);
    } catch (err) {
      return null;
    }
    return result;
  }

  render() {
    const {
      interfaceLogs: { detail },
      fetchLogsDetailLoading,
    } = this.props;
    const basePath = '/hitf/interface-logs';
    let stacktraceList = '';
    let detailedInfo = {};
    if (detail.interfaceLogDtlList && detail.interfaceLogDtlList.length) {
      detailedInfo = this.handleDetailedInfo(detail.interfaceLogDtlList[0]);
      stacktraceList = buildMultiLine(detail.interfaceLogDtlList, 'stacktrace');
    }
    const longFormItemLayout = {
      labelCol: {
        span: 10,
      },
      wrapperCol: {
        span: 14,
      },
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`hitf.interfaceLogs.view.message.interfaceLogsDetail`).d('接口监控详情')}
          backPath={`${basePath}/list`}
        />
        <Content className={styles['interface-logs-detail']}>
          <Card
            key="interface-logs-basic"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={<h3>{intl.get(`hitf.interfaceLogs.view.message.baseMessage`).d('基本信息')}</h3>}
            loading={fetchLogsDetailLoading}
          >
            <Form className="more-fields-form">
              <Row {...EDIT_FORM_ROW_LAYOUT}>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get(`hitf.interfaceLogs.view.message.invokeKey`).d('请求ID')}
                  >
                    {detail.invokeKey}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get(`hitf.interfaceLogs.view.message.serverCode`).d('服务代码')}
                  >
                    {detail.serverCode}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get(`hitf.interfaceLogs.view.message.serverName`).d('服务名称')}
                  >
                    {detail.serverName}
                  </Form.Item>
                </Col>
              </Row>
              <Row {...EDIT_FORM_ROW_LAYOUT}>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get(`hitf.interfaceLogs.view.message.clientId`).d('客户端ID')}
                  >
                    {detail.clientId}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl
                      .get(`hitf.interfaceLogs.view.message.external.interfaceRequestTime`)
                      .d('第三方接口请求时间')}
                  >
                    {detail.interfaceRequestTime}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get(`hitf.interfaceLogs.view.message.ip`).d('请求IP')}
                  >
                    {detail.ip}
                  </Form.Item>
                </Col>
              </Row>
              <Row {...EDIT_FORM_ROW_LAYOUT}>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl
                      .get(`hitf.interfaceLogs.view.message.internal.requestMethod`)
                      .d('平台接口请求方式')}
                  >
                    {detail.requestMethod}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl
                      .get(`hitf.interfaceLogs.view.message.internal.responseTime`)
                      .d('平台接口响应时间(ms)')}
                  >
                    {detail.responseTime}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...longFormItemLayout}
                    label={intl
                      .get(`hitf.interfaceLogs.view.message.external.interfaceResponseTime`)
                      .d('第三方接口响应时间(ms)')}
                  >
                    {detail.interfaceResponseTime}
                  </Form.Item>
                </Col>
              </Row>
              <Row {...EDIT_FORM_ROW_LAYOUT}>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl
                      .get(`hitf.interfaceLogs.view.message.external.interfaceType`)
                      .d('第三方接口类型')}
                  >
                    {detail.interfaceType}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl
                      .get(`hitf.interfaceLogs.view.message.external.interfaceUrl`)
                      .d('第三方接口地址')}
                  >
                    {detail.interfaceUrl}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl
                      .get(`hitf.interfaceLogs.view.message.internal.responseStatus`)
                      .d('平台接口响应状态')}
                  >
                    {detail.responseStatus === 'success'
                      ? intl.get('hitf.interfaceLogs.view.message.success').d('成功')
                      : intl.get('hitf.interfaceLogs.view.message.failed').d('失败')}
                  </Form.Item>
                </Col>
              </Row>
              <Row {...EDIT_FORM_ROW_LAYOUT}>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get(`hitf.interfaceLogs.view.message.userAgent`).d('User-Agent')}
                  >
                    {detail.userAgent}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...EDIT_FORM_ITEM_LAYOUT}
                    label={intl.get(`hitf.interfaceLogs.view.message.referer`).d('Referer')}
                  >
                    {detail.referer}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
          <Card
            key="interface-logs-detail"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={
              <h3>{intl.get(`hitf.interfaceLogs.view.message.detailMessage`).d('详情信息')}</h3>
            }
            loading={fetchLogsDetailLoading}
          >
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_2_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT_COL_2}
                  label={intl
                    .get(`hitf.interfaceLogs.model.interfaceLogs.internal.reqBodyParam`)
                    .d('平台接口调用参数')}
                >
                  <pre className={styles['multi-line-information']}>
                    {detailedInfo.reqBodyParam}
                  </pre>
                </Form.Item>
              </Col>
              <Col {...FORM_COL_2_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT_COL_2}
                  label={intl
                    .get(`hitf.interfaceLogs.model.interfaceLogs.external.interfaceReqBodyParam`)
                    .d('第三方接口调用参数')}
                >
                  <pre className={styles['multi-line-information']}>
                    {detailedInfo.interfaceReqBodyParam}
                  </pre>
                </Form.Item>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_2_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT_COL_2}
                  label={intl
                    .get(`hitf.interfaceLogs.model.interfaceLogs.internal.respContent`)
                    .d('平台接口响应内容')}
                >
                  <pre className={styles['multi-line-information']}>{detailedInfo.respContent}</pre>
                </Form.Item>
              </Col>
              <Col {...FORM_COL_2_LAYOUT}>
                <Form.Item
                  {...EDIT_FORM_ITEM_LAYOUT_COL_2}
                  label={intl
                    .get(`hitf.interfaceLogs.model.interfaceLogs.external.interfaceRespContent`)
                    .d('第三方接口响应内容')}
                >
                  <pre className={styles['multi-line-information']}>
                    {detailedInfo.interfaceRespContent}
                  </pre>
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <Card
            key="interface-logs-error"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={
              <h3>{intl.get(`hitf.interfaceLogs.view.message.stacktraceMessage`).d('异常信息')}</h3>
            }
            loading={fetchLogsDetailLoading}
          >
            <Row {...EDIT_FORM_ROW_LAYOUT}>
              <Col>
                <Form.Item>
                  <pre className={styles['multi-line-information-exception']}>{stacktraceList}</pre>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Content>
      </React.Fragment>
    );
  }
}
