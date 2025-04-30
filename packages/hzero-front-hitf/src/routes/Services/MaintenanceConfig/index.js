import React, { PureComponent } from 'react';
import { Button, Spin, Drawer } from 'hzero-ui';
// import { routerRedux } from 'dva/router';
import { isEmpty, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import intl from 'utils/intl';
// import notification from 'utils/notification';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import Form from './Form';

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
export default class Services extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activeinvokeStatisticsFlag: 0,
      dataSource: {},
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { visible, interfaceListActionRow = {} } = this.props;
    const { interfaceId } = interfaceListActionRow;

    return (
      visible &&
      isNumber(interfaceId) &&
      interfaceId !== (prevProps.interfaceListActionRow || {}).interfaceId
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // If we have a snapshot value, we've just added new items.
    // Adjust scroll so these new items don't push the old ones out of view.
    // (snapshot here is the value returned from getSnapshotBeforeUpdate)
    if (snapshot) {
      this.handleFetchDetail();
    }
  }

  /**
   * fetchList - 获取列表数据
   * @param {Object} payload - 查询参数
   */
  @Bind()
  handleFetchDetail() {
    const { fetchMonitor = () => {}, interfaceListActionRow = {} } = this.props;
    fetchMonitor(interfaceListActionRow.interfaceId).then((res = {}) => {
      this.setState({
        dataSource: res || {},
        activeinvokeStatisticsFlag: res.invokeStatisticsFlag,
        activeHealthCheckFlag: res.healthCheckFlag,
      });
    });
    // const filterValues = isUndefined(this.filterForm)
    //   ? {}
    //   : filterNullValueObject(this.filterForm.getFieldsValue());
    // dispatch({
    //   type: 'services/queryList',
    //   payload: {
    //     page: params,
    //     ...filterValues,
    //   },
    // });
  }

  @Bind()
  save() {
    const {
      createMonitor = () => {},
      updateMonitor = () => {},
      interfaceListActionRow = {},
      serverCode,
    } = this.props;
    const { validateFields = () => {} } = this.editorForm;
    const { dataSource = {} } = this.state;
    const { interfaceCode } = interfaceListActionRow;
    validateFields((err, values) => {
      if (isEmpty(err)) {
        const data = { ...dataSource, ...values, serverCode, interfaceCode };
        if (isNumber(data.interfaceMonitorId)) {
          updateMonitor(interfaceListActionRow.interfaceId, data.interfaceMonitorId, data).then(
            res => {
              if (res && res.failed) {
                notification.error({ description: res.message });
              } else {
                notification.success();
                this.handleFetchDetail();
              }
            }
          );
        } else {
          createMonitor(interfaceListActionRow.interfaceId, data).then(res => {
            if (res && res.failed) {
              notification.error({ description: res.message });
            } else {
              notification.success();
              this.handleFetchDetail();
            }
          });
        }
      }
    });
  }

  // updateMonitor,

  @Bind()
  cancel() {
    const { onCancel = () => {} } = this.props;
    const { resetFields = e => e } = this.editorForm;
    resetFields();
    // this.setState({
    //   // formDataSource: {},
    // });
    onCancel();
  }

  @Bind()
  onInvokeStatisticsFlagChange(activeinvokeStatisticsFlag) {
    this.setState({
      activeinvokeStatisticsFlag,
    });
  }

  @Bind()
  onHealthCheckFlagChange(activeHealthCheckFlag) {
    this.setState({
      activeHealthCheckFlag,
    });
  }

  render() {
    const { visible, code = {}, interfaceListActionRow = {}, processing = {} } = this.props;
    const { dataSource = {}, activeinvokeStatisticsFlag, activeHealthCheckFlag } = this.state;
    const title = intl.get(`hitf.maintenanceConfig.view.title.maintenanceConfig`).d('运维配置');
    const { interfaceId, tenantId } = interfaceListActionRow;
    const drawerProps = {
      title,
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel,
      width: activeinvokeStatisticsFlag === 1 || activeHealthCheckFlag === 1 ? 750 : 450,
    };

    const formProps = {
      ref: node => {
        this.editorForm = node;
      },
      tenantId,
      dataSource,
      code,
      interfaceId,
      onInvokeStatisticsFlagChange: this.onInvokeStatisticsFlagChange,
      activeinvokeStatisticsFlag,
      activeHealthCheckFlag,
      onHealthCheckFlagChange: this.onHealthCheckFlagChange,
    };

    return (
      <Drawer {...drawerProps}>
        <Spin
          spinning={processing.query || processing.update || processing.create || false}
          wrapperClassName={DETAIL_DEFAULT_CLASSNAME}
        >
          <Form {...formProps} />
        </Spin>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
            zIndex: 1,
          }}
        >
          <Button onClick={this.cancel} style={{ marginRight: 8 }}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>

          <Button
            type="primary"
            onClick={this.save}
            disabled={processing.query}
            loading={processing.update || processing.create || false}
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
