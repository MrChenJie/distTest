/**
 * @Description: FTP服务器信息 - 明细
 * @date 2023-02-02
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Card, Col, Form, Input, Row } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import { Content, Header } from 'components/Page';
import ValueList from 'components/ValueList';
import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getEditTableData } from 'utils/utils';
import {
  DETAIL_CARD_CLASSNAME,
  DETAIL_CARD_TABLE_CLASSNAME,
  EDIT_FORM_ITEM_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_3_LAYOUT,
} from 'utils/constants';

import styles from './index.less';
import ServerLine from './ServerLine';
import { fastCodeLoader } from '../../../utils/decorators';

const commonPrompt = 'himp.ftpServers';

@connect(({ ftpServers, loading }) => ({
  ftpServers,
  detailLoading: loading.effects['ftpServers/queryDetail'],
  saveLoading: loading.effects['ftpServers/save'],
}))
@fastCodeLoader(['HPFM.PROTOCOL_TYPE', 'HFLE.FTP_ACTION_TYPE'])
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['himp.ftpServers'] })
export default class Detail extends PureComponent {
  componentDidMount() {
    this.queryDetail();
  }

  @Bind
  queryDetail() {
    const { dispatch, match } = this.props;
    const { id } = match.params;
    if (id !== 'create') {
      dispatch({
        type: 'ftpServers/queryDetail',
        payload: {
          serverId: id,
        },
      });
    }
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'ftpServers/updateState',
      payload: {
        ftpServer: {},
        ftpServerLineList: [],
      },
    });
  }

  @Bind()
  save() {
    const { form, ftpServers } = this.props;
    const { ftpServer = {}, ftpServerLineList = [] } = ftpServers;
    const editList = ftpServerLineList.filter(
      (item) => item._status === 'create' || item._status === 'update'
    );
    const params = getEditTableData(ftpServerLineList, ['serverLineId', 'serverId']);
    form.validateFields((err, values) => {
      this.sendRequest(err, values, params, editList, ftpServer);
    });
  }

  @Bind()
  sendRequest(err, values, params, editList, ftpServer) {
    const { dispatch, history, match } = this.props;
    const {
      params: { id },
    } = match;
    if (!err) {
      if (!(editList.length > 0 && params.length === 0)) {
        dispatch({
          type: `ftpServers/save`,
          payload: {
            ftpServer: { ...ftpServer, ...values },
            ftpServerLineList: params,
          },
        }).then((res) => {
          if (res) {
            notification.success();
            if (id === 'create') {
              history.push(`/himp/ftp-servers/detail/${res.ftpServer?.serverId}`);
              this.queryDetail();
            } else {
              this.queryDetail();
            }
          }
        });
      }
    }
  }

  render() {
    const {
      detailLoading = false,
      saveLoading = false,
      form: { getFieldDecorator },
      ftpServers,
      match,
      idpValueMap = {},
    } = this.props;
    const {
      params: { id },
    } = match;
    const { ftpServer } = ftpServers;
    const { serverCode, description, ftpType, host, userName, password, port } = ftpServer;
    return (
      <>
        <Header backPath="/himp/ftp-servers/list">
          <Button onClick={this.save} type="primary" icon="save" loading={saveLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Card
            key="import-template-header"
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            loading={detailLoading}
            title={
              <h3>
                {intl.get(`${commonPrompt}.view.message.title.serversInfo`).d('ftp服务器信息')}
              </h3>
            }
          >
            <Form className={classNames('more-fields-search-form', styles['template-form'])}>
              <Row {...EDIT_FORM_ROW_LAYOUT}>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.model.serverCode`).d('ftp服务器编码')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('serverCode', {
                      initialValue: serverCode,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${commonPrompt}.model.serverCode`).d('ftp服务器编码'),
                          }),
                        },
                      ],
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.model.description`).d('描述')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('description', {
                      initialValue: description,
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.model.ftpType`).d('ftp类型')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('ftpType', {
                      initialValue: ftpType,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${commonPrompt}.model.ftpType`).d('ftp类型'),
                          }),
                        },
                      ],
                    })(
                      <ValueList
                        allowClear
                        lazyLoad={false}
                        style={{ width: '100%' }}
                        options={idpValueMap['HPFM.PROTOCOL_TYPE']}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row {...EDIT_FORM_ROW_LAYOUT}>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.model.host`).d('host')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('host', {
                      initialValue: host,
                      rules: [
                        {
                          required: true,
                          message: intl.get(`hzero.common.validation.notNull`, {
                            name: intl.get(`${commonPrompt}.model.host`).d('host'),
                          }),
                        },
                      ],
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.model.userName`).d('用户名')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('userName', {
                      initialValue: userName,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${commonPrompt}.model.userName`).d('用户名'),
                          }),
                        },
                      ],
                    })(<Input />)}
                  </Form.Item>
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.model.password`).d('密码')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('password', {
                      initialValue: password,
                      rules: [
                        {
                          required: true,
                          message: intl.get(`hzero.common.validation.notNull`, {
                            name: intl.get(`${commonPrompt}.model.password`).d('密码'),
                          }),
                        },
                      ],
                    })(<Input />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row {...EDIT_FORM_ROW_LAYOUT}>
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    label={intl.get(`${commonPrompt}.model.port`).d('端口')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('port', {
                      initialValue: port,
                      rules: [
                        {
                          required: true,
                          message: intl.get(`hzero.common.validation.notNull`, {
                            name: intl.get(`${commonPrompt}.model.port`).d('端口'),
                          }),
                        },
                      ],
                    })(<Input />)}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
          <Card
            key="import-template-line"
            bordered={false}
            className={DETAIL_CARD_TABLE_CLASSNAME}
            loading={detailLoading}
            title={
              <h3>
                {intl.get(`${commonPrompt}.view.message.title.lineInfo`).d('ftp服务器行信息')}
              </h3>
            }
          >
            <ServerLine detailId={id} idpValueMap={idpValueMap} queryDetail={this.queryDetail} />
          </Card>
        </Content>
      </>
    );
  }
}
