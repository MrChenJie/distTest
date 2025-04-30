import React from 'react';
import { Dropdown, Form, Icon, Menu, notification } from 'hzero-ui';
import { isFunction, isEmpty } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import intl from 'utils/intl';
import { getResponse, isTenantRoleLevel, listenDownloadError, getAccessToken } from 'utils/utils';
import request from 'utils/request';
import { downloadFile, initiateAsyncExport, queryColumn } from 'hzero-front/lib/services/api';
import ExportPage from './ExportPage';
import HistoryData from './HistoryData';

// 监听导出错误时 postMessage 事件
listenDownloadError(
  'downloadError',
  intl.get('hzero.common.notification.export.error').d('导出异常')
);

// 监听导出错误时 postMessage 事件
listenDownloadError(
  'asyncRequestSuccess',
  intl.get('hzero.common.notification.export.async').d('异步导出任务已提交'),
  'success'
);

@Form.create({ fieldNameProp: null })
export default class ExcelExport extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      exportList: [],
      exportPending: false,
      fetchColumnLoading: true,
      enableAsync: false, // 允许异步
      // 异步数据
      historyModalVisible: false, // 异步数据模态框显示
      selectedRowKeys: [],
    };
  }

  /**
   * @function queryColumnData - 查询可以选择导出的列数据
   */
  @Bind()
  queryColumnData(config) {
    const { requestUrl, method = 'GET', defaultSelectAll = false, form } = this.props;
    this.setState({ fetchColumnLoading: true });
    if (!isEmpty(config)) {
      this.setState({ exportPending: true });
    }
    queryColumn({ requestUrl, method })
      .then((res) => {
        const response = getResponse(res);
        if (response) {
          const nextState = {};
          if (response && response.children) {
            const defaultList = [];
            if (defaultSelectAll) {
              const exTreeKey = (data) => {
                if (data) {
                  defaultList.push(data.id);
                  if (Array.isArray(data.children)) {
                    for (let i = 0; i < data.children.length; i++) {
                      exTreeKey(data.children[i]);
                    }
                  }
                }
              };
              exTreeKey(res);
            } else {
              const travelTree = (data) => {
                if (data) {
                  // 后端返回的是 boolean 值
                  if (data.checked) {
                    defaultList.push(data.id);
                  }
                  if (Array.isArray(data.children)) {
                    for (let i = 0; i < data.children.length; i++) {
                      travelTree(data.children[i]);
                    }
                  }
                }
              };
              travelTree(res);
            }
            nextState.exportList = [res];
            nextState.selectedRowKeys = defaultList;
            nextState.dataSource = res;
          }
          nextState.enableAsync = !!response.enableAsync; // 不为真 就为假
          this.setState(nextState);
          if (!nextState.enableAsync) {
            if (form.getFieldValue('async') === 'true') {
              form.setFieldsValue({ async: 'false' });
            }
          }
        }
      })
      .finally(() => {
        this.setState({ fetchColumnLoading: false });
        const { exportList } = this.state;
        if (!isEmpty(config)) {
          this.traversalTreeNodes(exportList);
          this.handleExport(config);
        }
      });
  }

  /**
   * @function showModal - 控制对话框是否可见
   * @param {boolean} flag - 对话框显示标识
   */
  showModal(flag) {
    const { defaultConfig = {} } = this.props;
    if (!isEmpty(defaultConfig)) {
      const { data, ...others } = defaultConfig;
      if (!isEmpty(data)) {
        this.traversalTreeNodes(defaultConfig.data);
        this.handleExport({ fillerType: 'single-sheet', ...others, async: 'false' });
      } else {
        this.queryColumnData({ fillerType: 'single-sheet', ...others, async: 'false' });
      }
    } else {
      this.setState({
        modalVisible: flag,
        selectedRowKeys: [],
      });
      if (flag) {
        this.queryColumnData();
      } else {
        this.setState({ selectedRowKeys: [] });
      }
    }
  }

  /**
   * @function handleExport - 导出，下载文件
   */
  @Bind()
  @Debounce(500)
  handleExport(config = {}) {
    const {
      requestUrl = '',
      queryParams = {},
      form,
      method = 'GET',
      fileName = 'exportData',
      downloadType,
    } = this.props;
    const { selectedRowKeys } = this.state;
    let queryData = queryParams;
    if (isFunction(queryParams)) {
      queryData = queryParams();
    }
    const newQueryParams = { ...queryData, ...form.getFieldsValue(), ...config };
    if (!selectedRowKeys || (Array.isArray(selectedRowKeys) && selectedRowKeys.length === 0)) {
      CusModal.warning({
        content: intl.get('hzero.common.message.validation.atLeast').d('请至少选择一条数据'),
      });
      this.setState({ exportPending: false });
    } else {
      this.setState({ exportPending: true });
      const params = selectedRowKeys.map((item) => ({ name: 'ids', value: item }));
      // 添加表单查询参数
      for (const key of Object.keys(newQueryParams)) {
        if (newQueryParams[key] !== undefined) {
          params.push({ name: key, value: newQueryParams[key] });
        }
      }
      // 添加导出Excel参数
      params.push({ name: 'exportType', value: 'DATA' });
      if (newQueryParams.async === 'true') {
        initiateAsyncExport({ requestUrl, queryParams: params }).then((res) => {
          if (res) {
            notification.success({
              message: intl
                .get('hzero.common.notification.export.asyncWithUid', { uuid: res.uuid })
                .d(`异步导出任务已提交${res.uuid}`),
            });
          }
          this.setState({ exportPending: false });
        });
      } else {
        if (downloadType === 'Blob') {
          const myParams = {
            ids: [...selectedRowKeys],
            ...newQueryParams,
            exportType: 'DATA',
            access_token: getAccessToken(),
          };
          request(`${requestUrl}`, {
            method,
            query: myParams,
            responseType: 'blob',
            body: method === 'POST' ? myParams : {},
          }).then((res) => {
            if (res) {
              const blob = new Blob([res], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              });
              if ('msSaveOrOpenBlob' in navigator) {
                // 使用ie下载
                navigator.msSaveOrOpenBlob(blob, `${fileName}.xls`);
                return false;
              }
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${fileName}.xlsx`;
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
              this.setState({ exportPending: false });
            }
          });
        } else {
          downloadFile({ requestUrl, queryParams: params, method }).then((res) => {
            if (res) {
              if (!isEmpty(config)) {
                this.setState({ selectedRowKeys: [] });
              }
            }
            this.setState({ exportPending: false });
          });
        }
      }
    }
  }

  /**
   * @function traversalTreeNodes - 遍历树的子节点
   * @param {object} data - 列数据
   */
  @Bind()
  traversalTreeNodes(data = [], arr = []) {
    const { selectedRowKeys } = this.state;
    const idList = arr;
    data.map((item) => {
      const temp = item;
      selectedRowKeys.push(temp.id);
      this.setState({ selectedRowKeys });
      if (temp.children) {
        this.traversalTreeNodes(temp.children, idList);
      }
      return temp;
    });
  }

  @Bind()
  renderQueryForm() {
    const { queryFormItem } = this.props;
    return <Form layout="inline">{queryFormItem}</Form>;
  }

  @Bind()
  handleMenuClick({ key }) {
    if (key === 'async-data') {
      this.showHistoryModal();
    } else if (key === 'export') {
      this.showModal(true);
    }
  }

  @Bind()
  showSyncExportModal() {
    this.showModal(true);
  }

  @Bind()
  showHistoryModal() {
    this.setState({
      historyModalVisible: true,
    });
  }

  @Bind()
  hideHistoryModal() {
    this.setState({
      historyModalVisible: false,
    });
  }

  @Bind
  onSelectChange(selectedRowKeys) {
    this.setState({
      selectedRowKeys,
    });
  }

  render() {
    const {
      code,
      queryFormItem,
      otherButtonProps,
      buttonText = intl.get('hzero.common.button.export').d('导出'),
      title = intl.get(`hzero.common.model.cusExcelExport.modalTitle`).d('选中要导出的列'),
      exportAsync = false,
      defaultConfig,
    } = this.props;
    const {
      dataSource,
      fetchColumnLoading,
      exportPending,
      modalVisible,
      historyModalVisible,
      queryHistoryLoading,
      selectedRowKeys,
    } = this.state;
    const modalProps = {
      width: '500px',
      title,
      destroyOnClose: true,
      bodyStyle: { height: 'auto', maxHeight: '460px', overflowY: 'auto' },
      open: modalVisible,
      onCancel: this.showModal.bind(this, false),
      onOk: () => {
        this.handleExport();
      },
      confirmLoading: exportPending,
      closable: false,
      closeIcon: undefined,
      mask: false,
    };
    const buttonProps = {
      code,
      type: 'normal',
      ...otherButtonProps,
      onClick: () => {},
    };
    const historyModalProps = {
      title: intl.get('hzero.common.excelExport.view.title.asyncData').d('异步数据'),
      open: historyModalVisible,
      destroyOnClose: true,
      width: '1000px',
      onCancel: this.hideHistoryModal,
      onOk: this.hideHistoryModal,
      confirmLoading: queryHistoryLoading,
      wrapClassName: 'ant-modal-sidebar-right',
      transitionName: 'move-right',
    };
    // 导出组件入口: 如果设置了 异步且为租户级, 那么显示异步数据(Dropdown),否则显示导出按钮
    const exportEntryElement =
      exportAsync && isTenantRoleLevel() && isEmpty(defaultConfig) ? (
        <Dropdown
          overlay={
            <Menu onClick={this.handleMenuClick}>
              <Menu.Item key="export">{intl.get('hzero.common.button.export').d('导出')}</Menu.Item>
              {isTenantRoleLevel() && (
                <Menu.Item key="async-data">
                  {intl.get('hzero.common.excelExport.asyncData').d('异步数据')}
                </Menu.Item>
              )}
            </Menu>
          }
        >
          <CusButton {...buttonProps}>
            {buttonText}
            <Icon type="down" />
          </CusButton>
        </Dropdown>
      ) : (
        <CusButton {...buttonProps} onClick={this.showSyncExportModal} loading={exportPending}>
          {buttonText}
        </CusButton>
      );
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <>
        {exportEntryElement}
        <CusModal {...modalProps}>
          <ExportPage
            queryFormItem={queryFormItem}
            fetchColumnLoading={fetchColumnLoading}
            renderQueryForm={this.renderQueryForm}
            dataSource={dataSource}
            rowSelection={rowSelection}
          />
        </CusModal>
        <CusModal {...historyModalProps}>
          <HistoryData />
        </CusModal>
      </>
    );
  }
}
