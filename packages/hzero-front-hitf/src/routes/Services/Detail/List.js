/**
 * Table - 修改服务配置-接口列表表格
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { isEmpty } from 'lodash';
import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import { Button, Modal, Table } from 'hzero-ui';
import { connect } from 'dva';

import notification from 'utils/notification';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { operatorRender } from 'utils/renderer';

import InterfaceDrawer from '../Interface';
import DocumentDrawer from '../Document';
import MaintenanceConfigDrawer from '../MaintenanceConfig';
import AddDataModal from '@/components/AddDataModal';

@connect(({ services }) => ({ services }))
export default class InterfaceList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      interfaceDrawerVisible: false,
      interfaceListActionRow: {},
      documentDrawerVisible: false,
      currentInterface: null, // 当前接口
      maintenanceConfigDrawerVisible: false,
      addModalVisible: false,
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  // static getDerivedStateFromProps(nextProps, prevState) {
  //   const { dataSource } = nextProps;
  //   const { prevDataSource } = prevState;
  //   if (dataSource !== prevDataSource) {
  //     return {
  //       dataSource,
  //       prevDataSource: dataSource,
  //     };
  //   }
  //   return null;
  // }
  defaultTableRowKey = 'interfaceId';

  /**
   * 先设置当前接口信息然后打开接口编辑弹窗
   * @param {*} [interfaceListActionRow={}]
   */
  @Bind()
  openInterfaceDrawer(interfaceListActionRow = {}) {
    this.setState({
      interfaceListActionRow,
      interfaceDrawerVisible: true,
    });
  }

  closeInterfaceDrawer() {
    this.setState({
      interfaceDrawerVisible: false,
      interfaceListActionRow: {},
    });
  }

  /**
   * 打开接口文档弹窗
   * @param {object} record 接口表格行数据
   */
  @Bind()
  openDocumentDrawer(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'services/queryDocument',
      payload: record.interfaceId,
    }).then(res => {
      if (res) {
        dispatch({
          type: 'services/queryParams',
          payload: res.documentId,
        });
        this.setState({ documentDrawerVisible: true, currentInterface: record });
      }
    });
  }

  /**
   * 关闭接口文档弹窗
   */
  @Bind()
  closeDocumentDrawer() {
    this.setState({
      documentDrawerVisible: false,
    });
  }

  handleSaveInterface(item, cb) {
    const { onChangeState, dataSource } = this.props;
    let newDataSource = [];
    if (item.interfaceId) {
      newDataSource = dataSource.map(_item => {
        if (_item.interfaceId === item.interfaceId) {
          return {
            ..._item,
            ...item,
          };
        }
        return _item;
      });
    } else {
      newDataSource = [{ ...item, interfaceId: uuid(), isNew: true }, ...dataSource];
    }
    onChangeState('interfaceListDataSource', newDataSource);
    // this.setState({
    //   dataSource: newDataSource,
    // });
    cb();
  }

  @Bind()
  handleDeleteService() {
    const {
      selectedRowKeys,
      dataSource,
      onRowSelectionChange,
      deleteLines,
      onChangeState,
    } = this.props;
    if (selectedRowKeys.length > 0) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        content: intl.get(`hitf.services.view.message.title.deleteContent`).d('确定删除吗？'),
        onOk() {
          const ids = [];
          const newDataSource = [];
          dataSource.forEach(item => {
            if (!item.isNew && selectedRowKeys.indexOf(item.interfaceId) >= 0) {
              ids.push(item);
            }
            if (selectedRowKeys.indexOf(item.interfaceId) < 0) {
              newDataSource.push(item);
            }
          });
          if (ids.length > 0) {
            deleteLines(ids).then(res => {
              if (res) {
                onRowSelectionChange([], []);
                notification.success();
                onChangeState('interfaceListDataSource', newDataSource);
              }
            });
          } else {
            onRowSelectionChange([], []);
            notification.success();
            onChangeState('interfaceListDataSource', newDataSource);
          }
        },
      });
    }
  }

  @Bind()
  openMaintenanceConfigDrawer(interfaceListActionRow) {
    this.setState({
      interfaceListActionRow,
      maintenanceConfigDrawerVisible: true,
    });
  }

  @Bind()
  closeMaintenanceConfigDrawer() {
    this.setState({
      interfaceListActionRow: {},
      maintenanceConfigDrawerVisible: false,
    });
  }

  /**
   * 打开新建内部接口弹窗
   */
  @Bind()
  openInnerFaceModal() {
    this.fetchModalData();
    this.setState({
      addModalVisible: true,
    });
  }

  /**
   * 隐藏新建内部接口弹窗
   */
  @Bind()
  handleCloseModal() {
    this.internalRef.state.addRows = [];
    this.setState({
      addModalVisible: false,
    });
  }

  /**
   * 查询弹窗数据
   * @param {Object} queryData - 查询数据
   */
  @Bind()
  fetchModalData(queryData = {}) {
    const { fetchInternalInterface = () => {} } = this.props;
    fetchInternalInterface(queryData);
  }

  @Bind()
  handleBindRef(ref = {}) {
    this.internalRef = ref;
  }

  /**
   * 批量创建内部接口
   * @param {Aarray} addRows 选择的数据
   */
  @Bind()
  handleCreateLine(addRows) {
    const { saveBatchInterfaces = () => {} } = this.props;
    saveBatchInterfaces(addRows, this.handleCloseModal);
  }

  render() {
    const {
      pagination,
      selectedRowKeys = [],
      onChange = e => e,
      onRowSelectionChange = e => e,
      type,
      processing = {},
      serviceTypes,
      requestTypes,
      soapVersionTypes,
      interfaceStatus,
      contentTypes,
      editorHeaderForm,
      dataSource,
      fetchMonitor = () => {},
      createMonitor = () => {},
      updateMonitor = () => {},
      code = {},
      authenticationData = {},
      serverCode,
      editable,
      saveInterfaces = () => {},
      fetchInterfacesDetail = () => {},
      currentInterfaceType,
      fetchModalLoading,
      saveBatchInterfacesLoading,
      internalList = [],
      internalPagination = {},
      fetchMappingClass = () => {},
      testMappingClass = () => {},
      fetchMappingClassLoading,
      testMappingClassLoading,
    } = this.props;

    const {
      interfaceDrawerVisible,
      interfaceListActionRow,
      documentDrawerVisible,
      currentInterface,
      maintenanceConfigDrawerVisible,
      addModalVisible,
    } = this.state;
    // const organizationRoleLevel = isTenantRoleLevel();
    const interfaceDrawerProps = {
      type,
      processing,
      serviceTypes,
      requestTypes,
      soapVersionTypes,
      interfaceStatus,
      currentInterfaceType,
      contentTypes,
      editorHeaderForm,
      visible: interfaceDrawerVisible,
      interfaceListActionRow,
      onCancel: this.closeInterfaceDrawer.bind(this),
      save: saveInterfaces,
      fetchInterfacesDetail,
      onFetchMappingClass: fetchMappingClass,
      onTestMappingClass: testMappingClass,
      fetchMappingClassLoading,
      testMappingClassLoading,
    };
    const documentDrawerProps = {
      currentInterface,
      authenticationData,
      visible: documentDrawerVisible,
      currentInterfaceType,
      onCancel: this.closeDocumentDrawer,
    };
    const columns = [
      {
        title: intl.get('hitf.services.model.services.interfaceCode').d('接口编码'),
        dataIndex: 'interfaceCode',
        width: 250,
      },
      {
        title: intl.get('hitf.services.model.services.interfaceName').d('接口名称'),
        dataIndex: 'interfaceName',
        width: 250,
      },
      {
        title: intl.get('hitf.services.model.services.requestMethod').d('请求方式'),
        dataIndex: 'requestMethod',
        width: 100,
      },
      {
        title: intl.get('hitf.services.model.services.interfaceAddress').d('接口地址'),
        dataIndex: 'path',
        width: 300,
      },
    ];
    const addModalOptions = {
      columns,
      confirmLoading: saveBatchInterfacesLoading,
      loading: fetchModalLoading,
      title: intl.get('hitf.services.view.title.internal.interface').d('选择内部接口'),
      rowKey: 'id',
      queryName: 'interfaceName',
      queryCode: 'interfaceCode',
      queryNameDesc: intl.get('hitf.services.model.services.interfaceName').d('接口名称'),
      queryCodeDesc: intl.get('hitf.services.model.services.interfaceCode').d('接口编码'),
      dataSource: internalList,
      pagination: internalPagination,
      modalVisible: addModalVisible,
      addData: this.handleCreateLine,
      onHideAddModal: this.handleCloseModal,
      fetchModalData: this.fetchModalData,
      onRef: this.handleBindRef,
    };
    const tableColumns = [
      {
        title: intl.get(`hzero.common.interfaceCode`).d('接口编码'),
        dataIndex: 'interfaceCode',
        width: 160,
      },
      {
        title: intl.get(`hzero.common.interfaceName`).d('接口名称'),
        dataIndex: 'interfaceName',
        width: 180,
      },
      {
        title: intl.get(`hzero.common.interfaceUrl`).d('接口地址'),
        dataIndex: 'interfaceUrl',
        width: 180,
      },
      {
        title: intl.get(`hzero.common.releaseType`).d('发布类型'),
        dataIndex: 'publishType',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.publishUrl`).d('发布地址'),
        dataIndex: 'publishUrl',
      },
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'statusMeaning',
      },
      {
        title: intl.get(`hitf.services.model.services.table.column.option`).d('操作'),
        width: 240,
        fixed: 'right',
        render: (text, record) => {
          const operators = [
            {
              key: 'edit',
              ele: (
                <a className="edit" onClick={() => this.openInterfaceDrawer(record)}>
                  {intl.get(`hzero.common.button.edit`).d('编辑')}
                </a>
              ),
              len: 2,
              title: intl.get(`hzero.common.button.edit`).d('编辑'),
            },
          ];
          if (record._token) {
            operators.push(
              {
                key: 'editDocument',
                ele: (
                  <a className="edit" onClick={() => this.openDocumentDrawer(record)}>
                    {intl.get(`hitf.services.view.button.document`).d('编辑接口文档')}
                  </a>
                ),
                len: 6,
                title: intl.get(`hitf.services.view.button.document`).d('编辑接口文档'),
              },
              {
                key: 'maintenanceConfig',
                ele: (
                  <a onClick={() => this.openMaintenanceConfigDrawer(record)}>
                    {intl.get(`hitf.services.view.button.maintenanceConfig`).d('配置维护')}
                  </a>
                ),
                len: 4,
                title: intl.get(`hitf.services.view.button.maintenanceConfig`).d('配置维护'),
              }
            );
          }
          return operatorRender(operators, record);
        },
      },
    ];
    const tableProps = {
      dataSource,
      pagination,
      onChange,
      bordered: true,
      rowKey: this.defaultTableRowKey,
      loading: processing.fetchInterfaceList,
      columns: tableColumns,
      scroll: { x: tableScrollWidth(tableColumns) },
      rowSelection: {
        selectedRowKeys,
        onChange: onRowSelectionChange,
      },
    };

    const maintenanceConfigProps = {
      visible: maintenanceConfigDrawerVisible,
      onCancel: this.closeMaintenanceConfigDrawer,
      interfaceListActionRow,
      fetchMonitor,
      createMonitor,
      updateMonitor,
      code,
      serverCode,
      processing: {
        query: processing.queryMonitorLoading,
        update: processing.updateMonitorLoading,
        create: processing.createMonitorLoading,
      },
    };

    return (
      <Fragment>
        <div style={{ textAlign: 'right' }}>
          <Button
            disabled={isEmpty(selectedRowKeys)}
            onClick={this.handleDeleteService}
            style={{ marginRight: 8 }}
            loading={processing.deleteLinesLoading}
          >
            {intl.get(`hzero.common.button.delete`).d('删除')}
          </Button>
          <Button
            type="primary"
            onClick={
              currentInterfaceType === 'INTERNAL'
                ? this.openInnerFaceModal
                : () => this.openInterfaceDrawer({})
            }
            disabled={!editable}
          >
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
        </div>
        <br />
        <Table {...tableProps} />
        {/* 新增接口抽屉 */}
        <InterfaceDrawer {...interfaceDrawerProps} />
        <DocumentDrawer {...documentDrawerProps} />
        <MaintenanceConfigDrawer {...maintenanceConfigProps} />
        <AddDataModal {...addModalOptions} />
      </Fragment>
    );
  }
}
