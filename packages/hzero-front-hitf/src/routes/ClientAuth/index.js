/**
 * index - 接口平台-客户端授权
 * @date: 2019-6-06
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
// import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';

import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import Search from './Search';
import List from './List';
import Editor from './Editor';

@connect(({ loading, clientAuth }) => ({
  queryListLoading: loading.effects['clientAuth/queryList'],
  queryDetailLoading: loading.effects['clientAuth/queryDetail'],
  saveLoading: loading.effects['clientAuth/save'],
  clientAuth,
  currentTenantId: getCurrentOrganizationId(),
  tenantRoleLevel: isTenantRoleLevel(),
}))
@formatterCollections({ code: ['hitf.clientAuth', 'hitf.application', 'hzero.common'] })
export default class ClientAuth extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      editorVisible: false,
      dataSource: [],
      pagination: {},
      activeRowData: {},
    };
  }

  componentDidMount() {
    this.fetchList();
    this.fetchStatisticsLevelCode();
  }

  /**
   * fetchList - 获取列表数据
   * @param {Object} payload - 查询参数
   */
  @Bind()
  fetchList(params) {
    const { dispatch } = this.props;
    return dispatch({ type: 'clientAuth/queryList', params }).then((res = {}) => {
      const { dataSource, pagination } = res;
      this.setState({
        dataSource,
        pagination,
      });
    });
  }

  /**
   * fetchStatisticsLevelCode - 查询授权模式<HITF.GRANT_TYPE>code
   * @return {Array}
   */
  @Bind()
  fetchStatisticsLevelCode() {
    const { dispatch = () => {} } = this.props;
    return dispatch({
      type: 'clientAuth/queryCode',
      payload: { lovCode: 'HITF.STATISTICS_LEVEL' },
    });
  }

  /**
   * 获取详情
   * @param {Object} payload - 查询参数
   */
  @Bind()
  fetchDetail() {
    const { dispatch } = this.props;
    const { activeRowData = {} } = this.state;
    const { id, organizationId } = activeRowData;
    return dispatch({
      type: 'clientAuth/queryDetail',
      payload: {
        clientOauthId: id,
        tenantId: organizationId,
      },
    });
  }

  @Bind()
  save(data, cb = () => {}) {
    const { dispatch } = this.props;
    return dispatch({ type: 'clientAuth/save', data }).then((res = {}) => {
      if (res && !res.failed) {
        notification.success();
        cb();
        this.fetchList();
      } else {
        notification.error({ description: res.message });
      }
    });
  }

  @Bind()
  deleteAuthRole(data, cb = () => {}) {
    const { dispatch } = this.props;
    const { activeRowData = {} } = this.state;
    const { id } = activeRowData;
    return dispatch({ type: 'clientAuth/deleteAuthRole', clientOauthId: id, data }).then(
      (res = {}) => {
        if (res && res.failed) {
          notification.error({ description: res.message });
        } else {
          notification.success();
          cb();
        }
      }
    );
  }

  @Bind()
  onTableChange(pagination) {
    const { getFieldsValue = e => e } = this.search;
    this.fetchList({ page: pagination, ...getFieldsValue() });
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

  render() {
    const {
      clientAuth = {},
      queryListLoading,
      currentTenantId,
      tenantRoleLevel,
      queryDetailLoading,
      saveLoading,
    } = this.props;
    const { code = {} } = clientAuth;
    const { editorVisible, dataSource, pagination, activeRowData } = this.state;

    const searchProps = {
      fetchList: this.fetchList,
      currentTenantId,
      tenantRoleLevel,
      pagination,
    };
    const listProps = {
      loading: queryListLoading,
      onChange: this.onTableChange,
      openEditor: this.openEditor,
      dataSource,
      pagination,
      tenantRoleLevel,
    };

    const editorProps = {
      currentTenantId,
      tenantRoleLevel,
      visible: editorVisible,
      onCancel: this.closeEditor,
      code,
      processing: {
        queryDetailLoading,
        saveLoading,
      },
      defaultDataSource: activeRowData,
      save: this.save,
      fetchDetail: this.fetchDetail,
      deleteAuthRole: this.deleteAuthRole,
    };

    return (
      <Fragment>
        <Header title={intl.get(`hitf.clientAuth.view.message.title.header`).d('客户端授权')}>
          {/* <Button
            type="primary"
            icon="plus"
            onClick={this.openEditor.bind(this, { clientAuthId: 'create' })}
          >
            {intl.get(`${commonPrompt}.button.create`).d('新建')}
          </Button> */}
        </Header>
        <Content>
          <Search
            ref={node => {
              this.search = node;
            }}
            {...searchProps}
          />
          <List {...listProps} />
        </Content>
        <Editor {...editorProps} />
      </Fragment>
    );
  }
}
