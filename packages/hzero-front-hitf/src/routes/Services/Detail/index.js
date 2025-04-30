/*
 * index - 服务注册编辑页
 * @date: 2018-10-25
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment, PureComponent } from 'react';
import { Button, Card, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isEmpty, isNumber, isNull } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Content, Header } from 'components/Page';
import notification from 'utils/notification';
import {
  createPagination,
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getCurrentTenant,
  filterNullValueObject,
} from 'utils/utils';
import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import EditorForm from './Form';
import InterfaceList from './List';
import AuthenticationServiceModal from './AuthenticationServiceModal';

/**
 * 服务注册
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} services - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading, services }) => ({
  fetchingList: loading.effects['services/queryList'],
  importLoading: loading.effects['services/importService'],
  deletingService: loading.effects['services/delete'],
  fetchingInterface: loading.effects['services/queryInterface'],
  queryInterfaceDetailLoading: loading.effects['services/queryInterfaceDetail'],
  queryInterfacesListDetailLoading: loading.effects['services/queryInterfacesListDetail'],
  creating: loading.effects['services/create'],
  editing: loading.effects['services/edit'],
  queryMonitorLoading: loading.effects['services/queryMonitor'],
  createMonitorLoading: loading.effects['services/createMonitor'],
  updateMonitorLoading: loading.effects['services/updateMonitor'],
  saveInterfacesLoading: loading.effects['services/saveInterfaces'],
  deleteLinesLoading: loading.effects['services/deleteLines'],
  fetchModalLoading: loading.effects['services/queryInternal'],
  saveBatchInterfacesLoading: loading.effects['services/saveBatchInterfaces'],
  testAuthLoading: loading.effects['services/testAuth'],
  fetchMappingClassLoading: loading.effects['services/queryMappingClass'],
  testMappingClassLoading: loading.effects['services/testMappingClass'],
  services,
  currentTenantId: getCurrentOrganizationId(),
  tenantRoleLevel: isTenantRoleLevel(),
}))
@formatterCollections({
  code: ['hitf.services', 'hitf.document', 'hitf.maintenanceConfig', 'hitf.common'],
})
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      formDataSource: {}, // 表单数据
      interfaceListSelectedRows: [],
      listDataSource: [], // 接口数据列表
      listPagination: createPagination({ number: 0, size: 10, totalElements: 0 }), // 接口分页信息
      authenticationServiceModalVisible: false,
      currentInterfaceType: 'EXTERNAL',
      namespace: '',
    };
  }

  componentDidMount() {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'services/queryIdpValue',
    });
    this.fetchStatisticsPeriodCode();
    this.fetchExceedThresholdActionCode();
    this.fetchStatisticsLevelCode();
    if (match.params.id) {
      this.fetchDetail();
    }
  }

  /**
   * fetchStatisticsPeriodCode - 查询授权模式<HITF.GRANT_TYPE>code
   * @return {Array}
   */
  @Bind()
  fetchStatisticsPeriodCode() {
    const { dispatch = () => {} } = this.props;
    return dispatch({ type: 'services/queryCode', payload: { lovCode: 'HITF.STATISTICS_PERIOD' } });
  }

  /**
   * fetchStatisticsPeriodCode - 查询授权模式<HITF.GRANT_TYPE>code
   * @return {Array}
   */
  @Bind()
  fetchExceedThresholdActionCode() {
    const { dispatch = () => {} } = this.props;
    return dispatch({
      type: 'services/queryCode',
      payload: { lovCode: 'HITF.EXCEED_THRESHOLD_ACTION' },
    });
  }

  /**
   * fetchStatisticsLevelCode - 查询授权模式<HITF.GRANT_TYPE>code
   * @return {Array}
   */
  @Bind()
  fetchStatisticsLevelCode() {
    const { dispatch = () => {} } = this.props;
    return dispatch({ type: 'services/queryCode', payload: { lovCode: 'HITF.STATISTICS_LEVEL' } });
  }

  /**
   * 查询接口详情
   * @param {Object} params
   */
  @Bind()
  fetchDetail(params) {
    const { dispatch = () => {}, match = {} } = this.props;
    return dispatch({
      type: 'services/queryInterfaceDetail',
      payload: { ...params, ...(match.params.id ? { interfaceServerId: match.params.id } : {}) },
    }).then(res => {
      if (res) {
        const { pageInterfaces } = res;
        this.setState({
          formDataSource: res,
          listDataSource: pageInterfaces.content || [],
          listPagination: createPagination(pageInterfaces),
          currentInterfaceType: res.serviceCategory || 'EXTERNAL',
        });
      }
    });
  }

  /**
   * 查询接口详情
   * @param {Object} params
   */
  @Bind()
  fetchMonitor(interfaceId) {
    const { dispatch = () => {} } = this.props;
    return dispatch({ type: 'services/queryMonitor', interfaceId });
  }

  /**
   * 查询接口详情
   * @param {Object} params
   */
  @Bind()
  fetchInterfacesListDetail(interfaceId) {
    const { dispatch = () => {} } = this.props;
    return dispatch({ type: 'services/queryInterfacesListDetail', interfaceId });
  }

  /**
   * 查询内部接口
   * @param {Object} queryData
   */
  @Bind()
  fetchInternalInterface(queryData = {}) {
    const { dispatch = () => {}, match = {} } = this.props;
    return dispatch({
      type: 'services/queryInternal',
      payload: {
        ...queryData,
        interfaceServerId: match.params.id,
      },
    });
  }

  /**
   * 查询接口详情
   * @param {Object} params
   */
  @Bind()
  createMonitor(interfaceId, data) {
    const { dispatch = () => {} } = this.props;
    return dispatch({ type: 'services/createMonitor', interfaceId, data });
  }

  /**
   * 查询接口详情
   * @param {Object} params
   */
  @Bind()
  updateMonitor(interfaceId, interfaceMonitorId, data) {
    const { dispatch = () => {} } = this.props;
    return dispatch({ type: 'services/updateMonitor', interfaceId, interfaceMonitorId, data });
  }

  @Bind()
  saveInterfaces(data, cb = () => {}) {
    const { dispatch, match = {} } = this.props;
    dispatch({ type: 'services/saveInterfaces', interfaceServerId: match.params.id, data }).then(
      res => {
        if (res) {
          notification.success();
          cb();
          this.fetchDetail();
        }
      }
    );
  }

  /**
   * 批量创建内部接口
   * @param {object} data - 选择的接口
   */
  @Bind()
  saveBatchInterfaces(data, cb = () => {}) {
    const { dispatch = () => {}, match = {} } = this.props;
    dispatch({
      type: 'services/saveBatchInterfaces',
      interfaceServerId: match.params.id,
      data,
    }).then(res => {
      if (res) {
        notification.success();
        cb();
        this.fetchDetail();
      }
    });
  }

  /**
   * 创建服务
   * @param {Object} params
   * @param {Function} [cb=e => e]
   */
  @Bind()
  create(params) {
    const { dispatch } = this.props;
    dispatch({ type: 'services/create', params }).then(res => {
      if (res) {
        notification.success();
        // this.fetchDetail(res.interfaceServerId);
        dispatch(
          routerRedux.push({
            pathname: `/hitf/services/detail/${res.interfaceServerId}`,
          })
        );
      }
    });
  }

  /**
   * 修改服务
   * @param {Object} params
   * @param {Function} [cb= e => e]
   */
  @Bind()
  edit(params) {
    const { dispatch } = this.props;
    dispatch({ type: 'services/edit', params }).then(res => {
      if (res) {
        notification.success();
        this.fetchDetail();
      }
    });
  }

  @Bind()
  cancel() {
    const { onCancel = e => e } = this.props;
    const { resetFields = e => e } = this.editorForm;
    resetFields();
    this.setState({
      formDataSource: {},
      interfaceListSelectedRows: [],
      listDataSource: [],
      listPagination: createPagination({ number: 0, size: 10, totalElements: 0 }),
    });
    onCancel();
  }

  @Bind()
  handleSave() {
    const { currentTenantId, tenantRoleLevel } = this.props;
    const { formDataSource, listDataSource } = this.state;
    const { validateFields = e => e } = this.editorForm.props.form; // 上面接口定义DOM节点
    const interfaces = listDataSource.map(item => {
      if (item.isNew) {
        const { interfaceId, ...otherParams } = item;
        return { ...otherParams };
      } else {
        return item;
      }
    });
    validateFields((err, values) => {
      const { pageInterfaces, ...otherFormDataSource } = formDataSource;
      const tenantId = !tenantRoleLevel ? values.tenantId : currentTenantId;
      const { protocol, domainUrl, ...rest } = values;
      const nextValues = filterNullValueObject(rest);
      if (values.serviceCategory === 'EXTERNAL' && (domainUrl && protocol)) {
        nextValues.domainUrl = `${protocol}${domainUrl}`;
      } else {
        nextValues.domainUrl = domainUrl;
      }
      if (isEmpty(err)) {
        const interfaceServerList = {
          ...otherFormDataSource,
          ...nextValues,
          tenantId,
          interfaces,
        };
        this.edit(interfaceServerList);
      }
    });
  }

  @Bind()
  handleCreate() {
    const { currentTenantId, tenantRoleLevel } = this.props;
    const { formDataSource, listDataSource, namespace } = this.state;
    const { validateFields = e => e } = this.editorForm.props.form;
    const { tenantNum } = getCurrentTenant();
    validateFields((err, values) => {
      const tenantId = !tenantRoleLevel ? values.tenantId : currentTenantId;
      const { protocol, domainUrl, ...rest } = values;
      const nextValues = rest;
      if (values.serviceCategory === 'EXTERNAL' && (domainUrl && protocol)) {
        nextValues.domainUrl = `${protocol}${domainUrl}`;
      } else {
        nextValues.domainUrl = domainUrl;
      }
      if (isEmpty(err)) {
        const interfaces = listDataSource.map(item => {
          if (item.isNew) {
            const { interfaceId, ...otherParams } = item;
            return { ...otherParams };
          } else {
            return item;
          }
        });
        const interfaceServerList = {
          authType: 'NONE',
          namespace: tenantRoleLevel ? tenantNum : namespace,
          ...formDataSource,
          ...nextValues,
          tenantId,
          interfaces,
        };
        this.create(interfaceServerList);
      }
    });
  }

  /**
   * 删除行
   * @param {Array} interfaceIds
   */
  @Bind()
  handleDeleteLines(interfaceIds) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'services/deleteLines',
      interfaceIds,
    }).then(res => {
      if (res && !res.failed) {
        notification.success();
        this.fetchDetail();
      } else {
        notification.error({ description: res.message });
      }
    });
  }

  @Bind()
  onInterfaceListChange(params = {}) {
    const { interfaceServerId } = this.props;
    const { current = 1, pageSize = 10 } = params;
    this.fetchDetail({ interfaceServerId, page: current - 1, size: pageSize });
  }

  @Bind()
  onInterfaceListRowSelectionChange(selectedRowKeys, selectedRows) {
    this.setState({
      interfaceListSelectedRows: selectedRows,
    });
  }

  @Bind()
  onTypeChange(value) {
    const { formDataSource = {} } = this.state;
    this.setState({
      formDataSource: { ...formDataSource, serviceType: value },
    });
  }

  @Bind()
  onEncryptionTypeChange(value) {
    const { formDataSource = {} } = this.state;
    this.setState({
      formDataSource: { ...formDataSource, encryptionType: value },
    });
  }

  @Bind()
  openAuthenticationServiceModal() {
    this.setState({
      authenticationServiceModalVisible: true,
    });
    this.authForm.renderFooter();
  }

  @Bind()
  closeAuthenticationServiceModal() {
    this.setState({
      authenticationServiceModalVisible: false,
    });
  }

  @Bind()
  handleAuthData(res) {
    const { formDataSource } = this.state;
    this.setState({
      formDataSource: {
        ...formDataSource,
        ...res,
      },
    });
  }

  @Bind()
  handleChangeListTenant(value, record) {
    const { listDataSource } = this.state;
    const newDataSource = listDataSource.map(item => {
      return { ...item, tenantId: value };
    });
    this.setState({
      listDataSource: newDataSource,
      namespace: record.tenantNum,
    });
  }

  @Bind()
  handleChangeState(key, value) {
    this.setState({ [key]: value });
  }

  @Bind()
  checkFormChanged(data = {}) {
    const { dispatch = () => {}, services = {} } = this.props;
    const { cacheFormData = {} } = services;
    const { formDataSource = {} } = this.state;
    const keys = Object.keys(data);
    const formChangeFlag =
      keys.some(o => data[o] !== (isEmpty(cacheFormData) ? formDataSource[o] : cacheFormData[o])) &&
      !isEmpty(data) &&
      !isEmpty(formDataSource);
    let _formChangeFlag = false;
    if (!isEmpty(cacheFormData)) {
      _formChangeFlag =
        keys.some(o => data[o] !== cacheFormData[o]) &&
        keys.some(o => data[o] === formDataSource[o]);
    }
    if (formChangeFlag) {
      dispatch({
        type: 'services/updateState',
        payload: { cacheFormData: data, formChangeFlag: !_formChangeFlag },
      });
    }
  }

  /**
   * 测试配置是否通过
   */
  @Bind()
  handleTestUrl(values) {
    const { dispatch = () => {} } = this.props;
    dispatch({
      type: 'services/testAuth',
      payload: values,
    }).then(res => {
      if (res) {
        notification.success({
          message: intl.get('hitf.services.view.message.test.success').d('测试成功'),
        });
      }
    });
  }

  /**
   * 切换服务类别
   * @param {string} value - 服务类别
   */
  @Bind()
  handleChangeType(value) {
    this.setState({
      currentInterfaceType: value,
    });
  }

  /**
   * 查询映射类
   */
  @Bind()
  fetchMappingClass() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'services/queryMappingClass',
    });
  }

  /**
   * 测试映射类
   * @param {number} interfaceId - 接口id
   * @param {string} template - 映射类代码
   */
  @Bind()
  testMappingClass(interfaceId, template) {
    const { dispatch } = this.props;
    const payload = { template };
    if (!isNull(interfaceId)) {
      payload.interfaceId = interfaceId;
    }
    return dispatch({
      type: 'services/testMappingClass',
      payload,
    });
  }

  render() {
    const {
      realName,
      resetClientKey = e => e,
      currentTenantId,
      tenantRoleLevel,
      queryInterfaceDetailLoading,
      queryInterfacesListDetailLoading,
      services = {},
      queryMonitorLoading,
      updateMonitorLoading,
      createMonitorLoading,
      saveInterfacesLoading,
      creating,
      editing,
      deleteLinesLoading = false,
      fetchModalLoading,
      saveBatchInterfacesLoading,
      testAuthLoading,
      fetchMappingClassLoading = false,
      testMappingClassLoading = false,
    } = this.props;
    const { enumMap, formChangeFlag, code = {}, internalList, internalPagination } = services;
    const {
      formDataSource = {},
      listDataSource = [],
      listPagination,
      interfaceListSelectedRows = {},
      authenticationServiceModalVisible,
      currentInterfaceType,
    } = this.state;
    const {
      serviceTypes = [], // 服务类型值集、发布类型？
      soapVersionTypes = [], // SOAP版本值集
      requestTypes = [], // 请求方式值集
      authTypes = [], // 认证方式值集
      grantTypes = [], // 授权模式值集
      wssPasswordTypes = [], // 加密方式
      interfaceStatus = [], // 接口状态
      contentTypes = [], // 接口类型
      serviceCategory = [], // 服务类型
      passwordTypes = [], // 密码加密类型
    } = enumMap;
    const { interfaceServerId } = formDataSource;
    const editable = isNumber(interfaceServerId);
    const title = intl.get(`hitf.services.view.message.title.detail`).d('服务注册详情');

    const formProps = {
      currentInterfaceType,
      serviceCategory,
      serviceTypes,
      wssPasswordTypes,
      editable,
      resetClientKey,
      changeListTenant: this.handleChangeListTenant,
      dataSource: {
        ...formDataSource,
        tenantId: !tenantRoleLevel ? formDataSource.tenantId : currentTenantId,
        realName: !tenantRoleLevel ? formDataSource.tenantName : realName,
      },
      onRef: node => {
        this.editorForm = node;
      },
      tenantRoleLevel,
      onTypeChange: this.onTypeChange,
      onEncryptionTypeChange: this.onEncryptionTypeChange,
      checkFormChanged: this.checkFormChanged,
      onChangeType: this.handleChangeType,
    };

    const listProps = {
      fetchModalLoading,
      saveBatchInterfacesLoading,
      currentInterfaceType,
      currentTenantId,
      tenantRoleLevel,
      serviceTypes,
      requestTypes,
      soapVersionTypes,
      interfaceStatus,
      contentTypes,
      processing: {
        // fetchInterface: fetchingInterface,
        fetchInterfaceDetail: queryInterfaceDetailLoading,
        queryInterfacesListDetailLoading,
        // create: creating,
        // edit: editing,
        queryMonitorLoading,
        updateMonitorLoading,
        createMonitorLoading,
        saveInterfacesLoading,
        deleteLinesLoading,
      },
      onChangeState: this.handleChangeState,
      dataSource: listDataSource,
      pagination: listPagination,
      selectedRowKeys: interfaceListSelectedRows.map(n => n.interfaceId),
      onChange: this.onInterfaceListChange,
      onRowSelectionChange: this.onInterfaceListRowSelectionChange,
      deleteLines: this.handleDeleteLines,
      fetchInformation: this.fetchDetail,
      type: formDataSource.serviceType,
      serverCode: formDataSource.serverCode,
      authenticationData: {
        accessTokenUrl: formDataSource.accessTokenUrl,
        authType: formDataSource.authType,
        clientId: formDataSource.clientId,
        clientSecret: formDataSource.clientSecret,
        grantType: formDataSource.grantType,
      },
      onRef: node => {
        this.interfaceForm = node;
      },
      editorHeaderForm: this.editorForm,
      fetchMonitor: this.fetchMonitor,
      createMonitor: this.createMonitor,
      updateMonitor: this.updateMonitor,
      editable,
      code,
      saveInterfaces: this.saveInterfaces,
      fetchInterfacesDetail: this.fetchInterfacesListDetail,
      fetchInternalInterface: this.fetchInternalInterface,
      internalList,
      internalPagination,
      saveBatchInterfaces: this.saveBatchInterfaces,
      fetchMappingClass: this.fetchMappingClass,
      testMappingClass: this.testMappingClass,
      fetchMappingClassLoading,
      testMappingClassLoading,
    };

    const authenticationServiceModalProps = {
      authTypes,
      grantTypes,
      passwordTypes,
      testLoading: testAuthLoading,
      visible: authenticationServiceModalVisible,
      dataSource: formDataSource,
      onCancel: this.closeAuthenticationServiceModal,
      onTestUrl: this.handleTestUrl,
      onRef: node => {
        this.authForm = node;
      },
      onOk: this.handleAuthData,
    };

    return (
      <Fragment>
        <Header title={title} backPath="/hitf/services/list" isChange={formChangeFlag}>
          {editable ? (
            <Button
              type="primary"
              disabled={queryInterfaceDetailLoading}
              loading={editing}
              onClick={this.handleSave.bind(this)}
            >
              {intl.get(`hzero.common.button.save`).d('保存')}
            </Button>
          ) : (
            <Button type="primary" loading={creating} onClick={this.handleCreate}>
              {intl.get(`hitf.services.view.button.create`).d('注册')}
            </Button>
          )}
          {currentInterfaceType === 'EXTERNAL' && (
            <Button onClick={this.openAuthenticationServiceModal}>
              {intl.get(`hitf.services.view.button.authConfig`).d('服务认证配置')}
            </Button>
          )}
        </Header>
        <Content>
          <Spin spinning={queryInterfaceDetailLoading || false}>
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={
                <h3>{intl.get('hitf.services.view.title.detailHeader').d('服务注册基本信息')}</h3>
              }
            >
              <EditorForm {...formProps} />
            </Card>
            <br />
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={<h3>{intl.get('hitf.services.view.title.detailInterfaces').d('接口配置')}</h3>}
            >
              <InterfaceList {...listProps} />
            </Card>
          </Spin>
        </Content>
        <AuthenticationServiceModal {...authenticationServiceModalProps} />
      </Fragment>
    );
  }
}
