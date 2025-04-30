/**
 * RoleManagement - 角色管理
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment } from 'react';
// import {Button, Spin} from 'hzero-ui';
import { connect } from 'dva';
// import {
//   isEmpty,
//   isNumber,
// } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';

import notification from 'utils/notification';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import Search from './Search';
import List from './List';
import AuthEditor from './Editor';

const listRowDataKey = 'id';

/**
 * index - 角色管理
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} roleManagement - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading = {}, clientRole }) => ({
  queryListLoading: loading.effects['clientRole/queryList'],
  queryDetailListLoading: loading.effects['clientRole/queryDetailList'],
  queryDetailLoading: loading.effects['clientRole/queryDetail'],
  queryInterfaceLoading: loading.effects['clientRole/fetchInterfaceData'],
  addAuthLoading: loading.effects['clientRole/save'],
  clientRole,
  tenantRoleLevel: isTenantRoleLevel(),
}))
@formatterCollections({ code: ['hitf.application', 'hitf.clientRole'] })
export default class ClientRole extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // tenantsLoaded: false, // 表明已经加载了当前用户的租户
      tenantsMulti: false, // 表明是否是 多租户
      authEditorVisible: false,
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    this.fetchList();
    this.fetchAssignLevelCode();
    this.fetchRoleSourceCode();
  }

  /**
   * fetchList - 查询列表数据
   * @param {object} [params = {}] - 查询参数
   * @param {string} params.name - 目录/菜单名
   * @param {string} params.parentName - 上级目录
   */
  @Bind()
  fetchList(params) {
    const { dispatch } = this.props;
    dispatch({ type: 'clientRole/queryList', params }).then((res = {}) => {
      // const { name, tenantId, roleSource } = params || {};
      const { dataSource = [], pagination = {} } = res;
      this.setState({
        dataSource,
        pagination,
      });
    });
  }

  @Bind()
  fetchDetail() {
    const { dispatch } = this.props;
    const { activeRowData } = this.state;
    return dispatch({ type: 'clientRole/queryDetail', roleId: activeRowData[listRowDataKey] });
  }

  /**
   * fetchList - 查询列表数据
   * @param {object} [params = {}] - 查询参数
   * @param {string} params.name - 目录/菜单名
   * @param {string} params.parentName - 上级目录
   */
  @Bind()
  fetchDetailList(params) {
    const { dispatch } = this.props;
    const { activeRowData } = this.state;
    return dispatch({
      type: 'clientRole/queryDetailList',
      roleId: activeRowData[listRowDataKey],
      params,
    });
  }

  /**
   * 查询弹窗数据
   * @param {object} [payload = {}] - 查询参数
   */
  @Bind()
  fetchInterfaceData(payload) {
    const { dispatch } = this.props;
    dispatch({
      type: 'clientRole/fetchInterfaceData',
      payload,
    });
  }

  /**
   * fetchRoleSourceCode - 查询角色来源值集
   */
  @Bind()
  fetchRoleSourceCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'clientRole/queryCode',
      payload: { lovCode: 'HIAM.ROLE_SOURCE' },
    });
  }

  /**
   * fetchRoleSourceCode - 查询层级值集
   */
  @Bind()
  fetchAssignLevelCode() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'clientRole/queryCode',
      payload: { lovCode: 'HIAM.RESOURCE_LEVEL' },
    });
  }

  @Bind()
  deleteRows(data, cb = () => {}) {
    const { dispatch } = this.props;
    const { activeRowData } = this.state;
    return dispatch({
      type: 'clientRole/recycle',
      roleId: activeRowData[listRowDataKey],
      data,
    }).then((res = {}) => {
      if (res && !res.failed) {
        cb();
        notification.success();
      } else {
        notification.error({ description: res.message });
      }
    });
  }

  @Bind()
  save(data, cb = () => {}) {
    const { dispatch } = this.props;
    const { activeRowData } = this.state;
    return dispatch({ type: 'clientRole/save', roleId: activeRowData[listRowDataKey], data }).then(
      (res = {}) => {
        if (res && !res.failed) {
          cb();
          notification.success();
        } else {
          notification.error({ description: res.message });
        }
      }
    );
  }

  @Bind()
  onListChange(page) {
    const { getFieldsValue = () => {} } = this.search || {};
    this.fetchList({ page, ...(getFieldsValue() || {}) });
  }

  @Bind()
  openAuthEditor(record) {
    this.setState({
      authEditorVisible: true,
      activeRowData: record,
    });
  }

  @Bind()
  closeEditor() {
    this.setState({
      authEditorVisible: false,
      activeRowData: {},
    });
  }

  /**
   * render
   * @return React.element
   */
  render() {
    const {
      clientRole = {},
      tenantRoleLevel,
      queryListLoading = false,
      queryDetailListLoading,
      queryDetailLoading,
      queryInterfaceLoading,
      addAuthLoading,
    } = this.props;
    const {
      currentRole,
      expandedRowKeys,
      tenantsMulti,
      dataSource,
      pagination,
      authEditorVisible,
      activeRowData,
    } = this.state;
    const { code, interfaceList = {} } = clientRole;
    const organizationId = getCurrentOrganizationId();

    const searchProps = {
      ref: node => {
        this.search = node;
      },
      handleQueryList: this.fetchList,
      loading: queryListLoading,
      tenantRoleLevel,
      code,
    };

    const listProps = {
      dataSource,
      pagination,
      loading: queryListLoading,
      // code: code['HIAM.ROLE_SOURCE'],
      expandedRowKeys,
      currentRole,
      organizationId,
      tenantRoleLevel,
      onListChange: this.onListChange,
      openAuthEditor: this.openAuthEditor,
      tenantsMulti,
      listRowDataKey,
    };

    const autheEditorProps = {
      visible: authEditorVisible,
      activeRowData,
      onCancel: this.closeEditor,
      fetchDetail: this.fetchDetail,
      fetchDetailList: this.fetchDetailList,
      detailPrimaryKey: listRowDataKey,
      deleteRows: this.deleteRows,
      save: this.save,
      fetchInterfaceData: this.fetchInterfaceData,
      processing: {
        queryDetailListLoading,
        queryDetailLoading,
      },
      organizationId,
      queryInterfaceLoading,
      addAuthLoading,
      interfaceList,
    };

    return (
      <Fragment>
        <Header title={intl.get(`hitf.clientRole.view.title.header`).d('角色授权')} />
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
        <AuthEditor {...autheEditorProps} />
      </Fragment>
    );
  }
}
