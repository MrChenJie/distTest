/*
 * index - 服务注册接口页面
 * @date: 2018-10-25
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Button, Drawer, Spin } from 'hzero-ui';
import { isEmpty, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import EditorForm from './Form';

import styles from '../Editor/index.less';

const commonPrompt = 'hzero.common';

export default class Editor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: props.dataSource || {},
      tenantId: getCurrentOrganizationId(),
    };
  }

  // static getDerivedStateFromProps(nextProps, prevState) {
  //   const { dataSource } = nextProps;
  //   const { dataSource: prevDataSource } = prevState;
  //   if (dataSource !== prevDataSource) {
  //     return {
  //       dataSource,
  //     };
  //   }
  //   return null;
  // }

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

  @Bind()
  handleFetchDetail() {
    const { fetchInterfacesDetail = () => {}, interfaceListActionRow = {} } = this.props;
    const { interfaceId } = interfaceListActionRow;
    fetchInterfacesDetail(interfaceId).then(res => {
      if (res) {
        this.setState({
          dataSource: res,
        });
      }
    });
  }

  cancel() {
    const { onCancel = e => e } = this.props;
    const { resetFields = e => e } = this.editorForm.props.form;
    resetFields();
    this.setState({
      dataSource: {},
    });
    onCancel();
  }

  handleOk() {
    const { save = e => e } = this.props;
    const { dataSource, tenantId } = this.state;
    const { validateFields = e => e } = this.editorForm.props.form;
    const mappingClass = this.editorForm.getCurrentCode();
    validateFields((err, values) => {
      const { interfaceId } = dataSource;
      const targetItem = interfaceId
        ? { ...dataSource, ...values, tenantId, mappingClass }
        : { ...dataSource, ...values, tenantId };
      if (isEmpty(err)) {
        save(targetItem, () => {
          this.cancel();
        });
      }
    });
  }

  render() {
    const {
      visible,
      editorHeaderForm,
      processing = {},
      resetClientKey = e => e,
      type,
      serviceTypes,
      requestTypes,
      soapVersionTypes,
      interfaceStatus,
      contentTypes,
      currentInterfaceType,
      interfaceListActionRow = {},
      onFetchMappingClass = () => {},
      onTestMappingClass = () => {},
      fetchMappingClassLoading,
      testMappingClassLoading,
    } = this.props;
    const { dataSource = {} } = this.state;

    const editable = isNumber(interfaceListActionRow.interfaceId);
    const title = editable
      ? intl.get(`hitf.services.view.message.title.interface.edit`).d('编辑接口')
      : intl.get(`hitf.services.view.message.title.interface.create`).d('创建接口');
    const drawerProps = {
      title,
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel.bind(this),
      width: 1000,
      style: {
        height: 'calc(100% - 55px)',
        overflow: 'auto',
        padding: 12,
      },
    };

    const formProps = {
      editorHeaderForm,
      dataSource,
      editable,
      resetClientKey,
      type,
      serviceTypes,
      requestTypes,
      soapVersionTypes,
      interfaceStatus,
      contentTypes,
      currentInterfaceType,
      onFetchMappingClass,
      onTestMappingClass,
      fetchMappingClassLoading,
      testMappingClassLoading,
      wrappedComponentRef: form => {
        this.editorForm = form;
      },
    };

    return (
      <Drawer {...drawerProps}>
        <Spin
          spinning={
            processing.queryInterfacesListDetailLoading || processing.saveInterfacesLoading || false
          }
        >
          {/* 抽屉编辑表单 */}
          <EditorForm {...formProps} />
        </Spin>
        <div className={styles['hiam-interface-model-btns']}>
          {/* 新增服务的确定和取消 */}
          <Button
            onClick={this.cancel.bind(this)}
            disabled={processing.saveInterfacesLoading}
            style={{ marginRight: 8 }}
          >
            {intl.get(`${commonPrompt}.button.cancel`).d('取消')}
          </Button>

          <Button
            type="primary"
            loading={processing.saveInterfacesLoading}
            onClick={this.handleOk.bind(this)}
          >
            {intl.get(`${commonPrompt}.button.save`).d('保存')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
