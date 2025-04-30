/**
 * index - 接口平台-应用配置
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Spin, Button, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';

import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import List from './List';
import Form from './Form';
import Editor from './Editor';

const listRowKey = 'interfaceAuthId';

@connect(({ loading, interfaces }) => ({
  queryListLoading: loading.effects['interfaces/queryAuthSelfList'],
  queryDetailLoading: loading.effects['interfaces/queryDetail'],
  queryListDetail: loading.effects['interfaces/queryAuthSelfListDetail'],
  updateAuthSelfLoading: loading.effects['interfaces/updateAuthSelf'],
  createAuthSelfLoading: loading.effects['interfaces/createAuthSelf'],
  testAuthLoading: loading.effects['interfaces/testAuth'],
  interfaces,
  currentTenantId: getCurrentOrganizationId(),
  tenantRoleLevel: isTenantRoleLevel(),
}))
@formatterCollections({ code: 'hitf.interfaces' })
export default class AuthConfig extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      pagination: {},
      formDataSource: {},
      activeRowData: {},
      editorVisible: false,
      selectedRows: [],
    };
  }

  componentDidMount() {
    this.fetchList();
    this.fetchDetail();
    this.fetchAuthTypeCode();
    this.fetchAuthLevelCode();
    this.fetchSOAPWSSPasswordTypeCode();
    this.fetchGrantTypeCode();
    this.fetchPasswordCode();
  }

  /**
   * fetchList - 获取列表数据
   * @param {Object} payload - 查询参数
   */
  @Bind()
  fetchList(params) {
    const { dispatch = () => {}, match = {} } = this.props;
    return dispatch({
      type: 'interfaces/queryAuthSelfList',
      interfaceId: (match.params || {}).interfaceId,
      params,
    }).then((res = {}) => {
      const { dataSource, pagination } = res;
      this.setState({
        dataSource,
        pagination,
        listSelectedRows: [],
      });
    });
  }

  /**
   * fetchList - 获取列表数据
   * @param {Object} payload - 查询参数
   */
  @Bind()
  fetchDetail() {
    const { dispatch = () => {}, match = {} } = this.props;
    const { params = {} } = match;
    return dispatch({ type: 'interfaces/queryDetail', interfaceId: params.interfaceId }).then(
      (res = {}) => {
        this.setState({
          formDataSource: res,
        });
      }
    );
  }

  /**
   * fetchList - 获取列表数据
   * @param {Object} payload - 查询参数
   */
  @Bind()
  fetchListDetail() {
    const { dispatch = () => {}, match = {} } = this.props;
    const { params = {} } = match;
    const { activeRowData } = this.state;
    return dispatch({
      type: 'interfaces/queryAuthSelfListDetail',
      interfaceId: params.interfaceId,
      [listRowKey]: activeRowData[listRowKey],
    });
  }

  /**
   * fetchStatisticsLevelCode - 查询授权模式<HITF.GRANT_TYPE>code
   * @return {Array}
   */
  @Bind()
  fetchAuthTypeCode() {
    const { dispatch = () => {} } = this.props;
    return dispatch({ type: 'interfaces/queryCode', payload: { lovCode: 'HITF.AUTH_TYPE' } });
  }

  /**
   * fetchStatisticsLevelCode - 查询授权模式<HITF.GRANT_TYPE>code
   * @return {Array}
   */
  @Bind()
  fetchAuthLevelCode() {
    const { dispatch = () => {} } = this.props;
    return dispatch({ type: 'interfaces/queryCode', payload: { lovCode: 'HITF.AUTH_LEVEL' } });
  }

  /**
   * fetchStatisticsLevelCode - 查询授权模式<HITF.GRANT_TYPE>code
   * @return {Array}
   */
  @Bind()
  fetchSOAPWSSPasswordTypeCode() {
    const { dispatch = () => {} } = this.props;
    return dispatch({
      type: 'interfaces/queryCode',
      payload: { lovCode: 'HITF.SOAP_WSS_PASSWORD_TYPE' },
    });
  }

  /**
   * fetchStatisticsLevelCode - 查询授权模式<HITF.GRANT_TYPE>code
   * @return {Array}
   */
  @Bind()
  fetchGrantTypeCode() {
    const { dispatch = () => {} } = this.props;
    dispatch({
      type: 'interfaces/queryCode',
      payload: { lovCode: 'HITF.GRANT_TYPE' },
    });
  }

  /**
   * fetchPasswordCode - 查询密码加密类型<HITF.PASSWORD_ENCODE_TYPE>code
   * @return {Array}
   */
  @Bind()
  fetchPasswordCode() {
    const { dispatch = () => {} } = this.props;
    return dispatch({
      type: 'interfaces/queryCode',
      payload: { lovCode: 'HITF.PASSWORD_ENCODE_TYPE' },
    });
  }

  /**
   * 查询接口详情
   * @param {Object} params
   */
  @Bind()
  createAuthSelf(data, cb = () => {}) {
    const { dispatch = () => {}, match = {} } = this.props;
    const { params = {} } = match;
    return dispatch({
      type: 'interfaces/createAuthSelf',
      interfaceId: params.interfaceId,
      data,
    }).then(res => {
      if (res && !res.failed) {
        cb();
        this.fetchList();
        notification.success();
      } else {
        notification.error({ description: res.message });
      }
    });
  }

  /**
   * 查询接口详情
   * @param {Object} params
   */
  @Bind()
  updateAuthSelf(data, cb = () => {}) {
    const { dispatch = () => {}, match = {} } = this.props;
    const { params } = match;
    return dispatch({
      type: 'interfaces/updateAuthSelf',
      interfaceId: params.interfaceId,
      data,
    }).then(res => {
      if (res && !res.failed) {
        cb();
        this.fetchList();
        notification.success();
      } else {
        notification.error({ description: res.message });
      }
    });
  }

  @Bind()
  deleteRows() {
    const { dispatch = () => {}, match = {} } = this.props;
    const { listSelectedRows = [] } = this.state;
    const { params = {} } = match;
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        dispatch({
          type: 'interfaces/deleteAuthSelf',
          interfaceId: params.interfaceId,
          data: listSelectedRows,
        }).then(res => {
          if (res && !res.failed) {
            this.fetchList();
            notification.success();
          } else {
            notification.error({ description: res.message });
          }
        });
      },
    });
  }

  @Bind()
  onTableChange(page) {
    this.fetchList({ page });
  }

  @Bind()
  openEditor(activeRowData = {}) {
    this.setState({
      editorVisible: true,
      activeRowData,
    });
  }

  @Bind()
  closeEditor() {
    this.setState({
      editorVisible: false,
      activeRowData: {},
    });
  }

  @Bind()
  add() {
    this.setState({
      editorVisible: true,
    });
  }

  @Bind()
  onRowSelectionChange(selectedRowKeys, listSelectedRows) {
    this.setState({
      listSelectedRows,
    });
  }

  /**
   * 测试配置是否通过
   */
  @Bind()
  handleTestUrl(data) {
    const { dispatch = () => {}, match = {} } = this.props;
    dispatch({
      type: 'interfaces/testAuth',
      interfaceId: (match.params || {}).interfaceId,
      data,
    }).then(res => {
      if (res) {
        notification.success({
          message: intl.get('hitf.interfaces.view.message.test.success').d('测试成功'),
        });
      }
    });
  }

  render() {
    const {
      interfaces = {},
      queryListLoading,
      tenantRoleLevel,
      queryDetailLoading,
      createAuthSelfLoading,
      updateAuthSelfLoading,
      testAuthLoading,
      queryListDetail,
      currentTenantId,
      match = {},
    } = this.props;
    const { code = {} } = interfaces;
    const {
      dataSource,
      pagination,
      formDataSource = {},
      activeRowData = {},
      editorVisible,
      listSelectedRows = [],
    } = this.state;

    const formProps = {
      dataSource: formDataSource,
    };

    const listProps = {
      loading: queryListLoading,
      onChange: this.onTableChange,
      dataSource,
      pagination,
      tenantRoleLevel,
      openEditor: this.openEditor,
      listRowKey,
      selectedRowKeys: listSelectedRows.map(o => o[listRowKey]),
      onRowSelectionChange: this.onRowSelectionChange,
      currentTenantId,
    };

    const editorProps = {
      visible: editorVisible,
      primaryKey: listRowKey,
      defaultDataSource: activeRowData,
      fetchDetail: this.fetchListDetail,
      onCancel: this.closeEditor,
      code,
      createAuthSelf: this.createAuthSelf,
      updateAuthSelf: this.updateAuthSelf,
      interfaceId: Number((match.params || {}).interfaceId),
      testAuthLoading,
      processing: {
        createLoading: createAuthSelfLoading,
        updateLoading: updateAuthSelfLoading,
        queryListDetail,
      },
      currentTenantId,
      onTestUrl: this.handleTestUrl,
    };

    return (
      <Fragment>
        <Header
          title={intl.get(`hitf.interfaces.view.message.title.authConfigHeader`).d('认证配置')}
          backPath="/hitf/interfaces/list"
        >
          {/* <Button
            type="primary"
            icon="plus"
            onClick={this.openEditor.bind(this, { interfacesId: 'create' })}
          >
            {intl.get(`${commonPrompt}.button.create`).d('新增')}
          </Button> */}
        </Header>
        <Content>
          <Spin spinning={queryDetailLoading}>
            <Form {...formProps} />
          </Spin>
          <div style={{ float: 'right', marginBottom: 16, clear: 'both' }}>
            <Button onClick={this.add}>{intl.get(`hzero.common.button.add`).d('新增')}</Button>
            <Button
              disabled={isEmpty(listSelectedRows)}
              onClick={this.deleteRows}
              style={{ marginLeft: 8 }}
            >
              {intl.get(`hzero.common.button.delete`).d('删除')}
            </Button>
          </div>
          <div style={{ clear: 'both' }} />
          <List {...listProps} />
          <Editor {...editorProps} />
        </Content>
      </Fragment>
    );
  }
}
