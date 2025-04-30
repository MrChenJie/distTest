/**
 * index - 接口平台-应用配置
 * @date: 2018-7-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import Search from './Search';
import List from './List';
import BatchAddModal from './BatchAddModal';

const listRowKey = 'interfaceAuthId';

@connect(({ loading, interfaces }) => ({
  queryListLoading: loading.effects['interfaces/queryList'],
  queryDetailLoading: loading.effects['interfaces/queryDetail'],
  saveLoading: loading.effects['interfaces/save'],
  batchAddAuthLoading: loading.effects['interfaces/batchAddAuth'],
  interfaces,
  currentTenantId: getCurrentOrganizationId(),
  tenantRoleLevel: isTenantRoleLevel(),
}))
@formatterCollections({ code: ['hitf.interfaces', 'hitf.application'] })
export default class Interfaces extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      pagination: {},
      selectedRowKeys: [], // 选中行key集合
      selectedRows: [], // 选中行集合
      isShowModal: false, // 是否显示批量添加的弹窗
      // activeRowData: {},
    };
  }

  componentDidMount() {
    this.fetchList();
    this.fetchServiceTypeCode();
    this.fetchAuthTypeCode();
    this.fetchAuthLevelCode();
    this.fetchSOAPWSSPasswordTypeCode();
    this.fetchGrantTypeCode();
    this.fetchPasswordCode();
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
   * fetchList - 获取列表数据
   * @param {Object} payload - 查询参数
   */
  @Bind()
  fetchList(params) {
    const { dispatch } = this.props;
    return dispatch({ type: 'interfaces/queryList', params }).then((res = {}) => {
      const { dataSource = [], pagination = {} } = res;
      this.setState({
        dataSource: dataSource.map(n => ({ ...n, key: n[listRowKey] })),
        pagination,
      });
    });
  }

  /**
   * fetchStatisticsLevelCode - 查询授权模式<HITF.GRANT_TYPE>code
   * @return {Array}
   */
  @Bind()
  fetchServiceTypeCode() {
    const { dispatch = () => {} } = this.props;
    return dispatch({ type: 'interfaces/queryCode', payload: { lovCode: 'HITF.SERVICE_TYPE' } });
  }

  @Bind()
  onTableChange(pagination) {
    const { getFieldsValue = e => e } = this.search;
    this.fetchList({ page: pagination, ...getFieldsValue() });
  }

  /**
   * 新开文档预览窗口
   * @param {object} record - 表格行数据
   */
  @Bind()
  openDocument(record = {}) {
    const { interfaceId } = record;
    window.open(`/pub/hitf/document-view/${interfaceId}`);
  }

  @Bind()
  openAuthConfig(record = {}) {
    const { dispatch = () => {} } = this.props;
    const { interfaceId } = record;
    dispatch(
      routerRedux.push({
        pathname: `/hitf/interfaces/auth-config/${interfaceId}`,
      })
    );
  }

  /**
   * 获取选中行
   * @param {array} selectedRowKeys 选中行的key值集合
   * @param {object} selectedRows 选中行集合
   */
  @Bind()
  handleRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  /**
   * 开启批量新建弹窗
   */
  @Bind()
  handleOpenModal() {
    const { selectedRowKeys } = this.state;
    if (selectedRowKeys.length) {
      this.setState({
        isShowModal: true,
      });
    }
  }

  /**
   * 批量添加授权
   * @param {object} values - 表单值
   */
  @Bind()
  handleBatchAddAuth(values) {
    const { dispatch } = this.props;
    const { selectedRows, pagination } = this.state;
    const nextSelectedRows = selectedRows.map(item => {
      const { interfaceId, tenantId } = item;
      const nextItem = {
        interfaceId,
        tenantId,
        ...values,
      };
      return nextItem;
    });
    dispatch({
      type: 'interfaces/batchAddAuth',
      payload: nextSelectedRows,
    }).then(res => {
      if (res) {
        notification.success();
        this.handleCloseModal();
        this.setState(
          {
            selectedRowKeys: [],
            selectedRows: [],
          },
          () => {
            this.onTableChange(pagination);
          }
        );
      }
    });
  }

  /**
   * 关闭批量新建弹窗
   */
  @Bind()
  handleCloseModal() {
    this.setState({
      isShowModal: false,
    });
  }

  render() {
    const {
      interfaces = {},
      queryListLoading,
      currentTenantId,
      tenantRoleLevel,
      batchAddAuthLoading,
    } = this.props;
    const { code = {} } = interfaces;
    const {
      dataSource,
      pagination,
      selectedRowKeys,
      isShowModal,
      // activeRowData,
    } = this.state;
    const searchProps = {
      fetchList: this.fetchList,
      currentTenantId,
      tenantRoleLevel,
      pagination,
      serverTypeCode: code['HITF.SERVICE_TYPE'],
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
    };
    const listProps = {
      loading: queryListLoading,
      onChange: this.onTableChange,
      dataSource,
      pagination,
      tenantRoleLevel,
      openAuthConfig: this.openAuthConfig,
      openDocument: this.openDocument,
      rowSelection,
    };
    const modalProps = {
      visible: isShowModal,
      onCancel: this.handleCloseModal,
      onOk: this.handleBatchAddAuth,
      confirmLoading: batchAddAuthLoading,
      code,
    };

    return (
      <Fragment>
        <Header title={intl.get(`hitf.interfaces.view.message.title.header`).d('接口能力汇总')}>
          <Button
            type="primary"
            icon="plus"
            disabled={isEmpty(selectedRowKeys)}
            onClick={this.handleOpenModal}
          >
            {intl.get('hitf.interfaces.view.button.add').d('批量添加认证')}
          </Button>
        </Header>
        <Content>
          <Search
            ref={node => {
              this.search = node;
            }}
            {...searchProps}
          />
          <List {...listProps} />
          <BatchAddModal {...modalProps} />
        </Content>
      </Fragment>
    );
  }
}
