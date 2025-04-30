/*
 * index - 服务注册
 * @date: 2018/10/26 16:18:29
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Button, Modal, Input } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
// import { routerRedux } from 'dva/router';
import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import {
  getCurrentOrganizationId,
  getCurrentUser,
  filterNullValueObject,
  isTenantRoleLevel,
} from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import Search from './Search';
import List from './List';
import ServiceEditor from './Editor';
import styles from './index.less';

const { TextArea } = Input;

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
  fetchingInterfaceDetail: loading.effects['services/queryInterfaceDetail'],
  creating: loading.effects['services/create'],
  editing: loading.effects['services/edit'],
  queryMonitorLoading: loading.effects['services/queryMonitor'],
  createMonitorLoading: loading.effects['services/createMonitor'],
  updateMonitorLoading: loading.effects['services/updateMonitor'],
  services,
  currentTenantId: getCurrentOrganizationId(),
  tenantRoleLevel: isTenantRoleLevel(),
}))
@formatterCollections({ code: ['hitf.services'] })
export default class Services extends PureComponent {
  constructor(props) {
    super(props);
    this.fetchList = this.fetchList.bind(this);
  }

  componentDidMount() {
    const { dispatch, location = {}, services = {} } = this.props;
    dispatch({
      type: 'services/queryIdpValue',
    });
    this.fetchList((location.state || {})._back === -1 ? services.cacheQueryParams : {});
    this.fetchStatisticsPeriodCode();
    this.fetchExceedThresholdActionCode();
    this.fetchStatisticsLevelCode();
  }

  state = {
    editorVisible: false,
    editingRow: {},
    currentProcessedRow: null,
    importModalVisible: false,
    wsdl: null,
  };

  /**
   * fetchList - 获取列表数据
   * @param {Object} payload - 查询参数
   */
  fetchList(params = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    dispatch({
      type: 'services/queryList',
      payload: {
        ...params,
        ...filterValues,
      },
    });
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
  fetchInterfaceDetail(params) {
    const { dispatch } = this.props;
    return dispatch({ type: 'services/queryInterfaceDetail', payload: { ...params } });
  }

  /**
   * 创建服务
   * @param {Object} params
   * @param {Function} [cb=e => e]
   */
  @Bind()
  create(params, cb = e => e) {
    const {
      dispatch,
      services: { list },
    } = this.props;
    const { pagination } = list;
    dispatch({ type: 'services/create', params }).then(res => {
      if (res) {
        this.fetchList(pagination);
        notification.success();
        cb();
      }
    });
  }

  /**
   * 修改服务
   * @param {Object} params
   * @param {Function} [cb=e => e]
   */
  @Bind()
  edit(params, cb = e => e) {
    const {
      dispatch,
      services: { list },
    } = this.props;
    const { pagination } = list;
    dispatch({ type: 'services/edit', params }).then(res => {
      if (res) {
        this.fetchList(pagination);
        notification.success();
        cb();
      }
    });
  }

  /**
   * 删除服务
   * @param {Object} params
   * @param {Function} [cb=e => e]
   */
  deleteRow(record, cb = e => e) {
    const { dispatch = e => e } = this.props;
    this.setState({
      currentProcessedRow: record.interfaceServerId,
    });
    dispatch({ type: 'services/deleteHeader', payload: { deleteRecord: record } }).then(res => {
      this.setState({
        currentProcessedRow: null,
      });
      if (!isEmpty(res)) {
        notification.error({ description: res.message });
      } else {
        this.fetchList();
        notification.success();
        cb();
      }
    });
  }

  @Bind()
  openDetail(id) {
    const { dispatch = () => {} } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hitf/services/detail/${id}`,
      })
    );
  }

  @Bind()
  createService() {
    const { dispatch = () => {} } = this.props;
    dispatch(
      routerRedux.push({
        pathname: '/hitf/services/create',
      })
    );
  }

  /**
   * 打开编辑模态框
   * @param {Object} [editingRow={}]
   */
  @Bind()
  openEditor(editingRow = {}) {
    this.setState({
      editorVisible: true,
      editingRow,
    });
  }

  /**
   * 关闭编辑模态框
   */
  closeEditor() {
    this.setState({
      editorVisible: false,
      editingRow: {},
    });
  }

  /**
   * 删除行
   * @param {Array} interfaceIds
   */
  handleDeleteLines(interfaceIds) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'services/deleteLines',
      interfaceIds,
    });
  }

  /**
   * 导入服务模态框打开
   */
  @Bind()
  importService() {
    this.setState({ importModalVisible: true, wsdl: null });
  }

  /**
   * 关闭导入服务模态框
   */
  @Bind()
  handleCancel() {
    this.setState({ importModalVisible: false });
  }

  /**
   * 服务导入
   */
  @Bind()
  handleOk() {
    const { wsdl } = this.state;
    const {
      dispatch,
      services: { list },
    } = this.props;
    const { pagination } = list;
    if (wsdl) {
      dispatch({
        type: 'services/importService',
        payload: { importUrl: wsdl },
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchList(pagination);
          this.setState({ importModalVisible: false });
        }
      });
    } else {
      notification.warning({
        message: intl.get('hzero.common.validation.notNull', {
          name: intl.get('hitf.services.model.services.address').d('服务地址'),
        }),
      });
    }
  }

  /**
   * 修改导入服务的内容
   * @param {*} e
   */
  @Bind()
  handleTextChange(e) {
    this.setState({ wsdl: e.target.value });
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
  setCacheQueryParams(cacheQueryParams = {}) {
    const { dispatch = () => {} } = this.props;
    return dispatch({ type: 'services/updateState', payload: { cacheQueryParams } });
  }

  // HITF.STATISTICS_PERIOD
  // HITF.EXCEED_THRESHOLD_ACTION
  render() {
    const {
      services = {},
      importLoading,
      fetchingList,
      deletingService,
      fetchingInterface,
      fetchingInterfaceDetail,
      creating,
      editing,
      currentTenantId,
      tenantRoleLevel,
      queryMonitorLoading,
      updateMonitorLoading,
      createMonitorLoading,
    } = this.props;
    const { list = {}, enumMap, code = {}, cacheQueryParams } = services;
    const { editorVisible, editingRow, currentProcessedRow } = this.state;
    const {
      serviceTypes, // 服务类型值集、发布类型？
      soapVersionTypes, // SOAP版本值集
      requestTypes, // 请求方式值集
      authTypes, // 认证方式值集
      grantTypes, // 授权模式值集
      wssPasswordTypes, // 加密方式
      interfaceStatus, // 接口状态
      contentTypes, // 接口类型
      serviceCategory, // 服务类别
    } = enumMap;
    const searchProps = {
      tenantRoleLevel,
      serviceTypes,
      serviceCategoryTypes: serviceCategory,
      fetchList: this.fetchList,
      onRef: node => {
        this.filterForm = node.props.form;
      },
      dataSource: cacheQueryParams,
      setCacheQueryParams: this.setCacheQueryParams,
    };
    const listProps = {
      tenantRoleLevel,
      currentProcessedRow,
      onChange: this.fetchList,
      openDetail: this.openDetail,
      dataSource: list.dataSource,
      pagination: list.pagination,
      processing: {
        query: fetchingList,
        delete: deletingService,
      },
      deleteRow: this.deleteRow.bind(this),
      setCacheQueryParams: this.setCacheQueryParams,
      cacheQueryParams,
    };

    const editorProps = {
      currentTenantId,
      tenantRoleLevel,
      serviceTypes,
      wssPasswordTypes,
      authTypes,
      requestTypes,
      soapVersionTypes,
      interfaceStatus,
      contentTypes,
      grantTypes,
      deleteLines: this.handleDeleteLines.bind(this),
      visible: editorVisible,
      interfaceServerId: editingRow.interfaceServerId,
      onCancel: this.closeEditor.bind(this),
      processing: {
        fetchInterface: fetchingInterface,
        fetchInterfaceDetail: fetchingInterfaceDetail,
        create: creating,
        edit: editing,
        queryMonitorLoading,
        updateMonitorLoading,
        createMonitorLoading,
      },
      realName: getCurrentUser() && getCurrentUser().realName,
      edit: this.edit,
      create: this.create,
      fetchInterfaceDetail: this.fetchInterfaceDetail,
      fetchMonitor: this.fetchMonitor,
      createMonitor: this.createMonitor,
      updateMonitor: this.updateMonitor,
      code,
    };

    return (
      <div className={styles['hitf-services']}>
        <Header title={intl.get(`hitf.services.view.message.title.header`).d('服务注册')}>
          <Button type="primary" icon="plus" onClick={() => this.createService('new')}>
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
          <Button icon="to-top" onClick={this.importService}>
            {intl.get(`hzero.common.button.import`).d('导入')}
          </Button>
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
        <ServiceEditor {...editorProps} />
        <Modal
          title={intl.get(`hitf.services.view.message.detail`).d('详细信息')}
          visible={this.state.importModalVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okButtonProps={{ loading: importLoading }}
        >
          <TextArea
            placeHolder={intl
              .get(`hitf.services.view.message.importPlaceHolder`)
              .d('导入地址：支持导入WSDL或者Swagger服务地址描述地址')}
            value={this.state.wsdl}
            onChange={this.handleTextChange}
          />
        </Modal>
      </div>
    );
  }
}
