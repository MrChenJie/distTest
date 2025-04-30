import React, { PureComponent } from 'react';
import { Button, Drawer, Spin } from 'hzero-ui';
import { isEmpty, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import EditorForm from './Form';

export default class Editor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: {},
      isOauth: false,
    };
  }

  getSnapshotBeforeUpdate(prevProps = {}) {
    const { visible, defaultDataSource = {}, primaryKey } = this.props;
    return (
      visible &&
      isNumber(defaultDataSource[primaryKey]) &&
      defaultDataSource[primaryKey] !== (prevProps.defaultDataSource || {})[primaryKey]
    );
  }

  // applicationId !== prevProps.applicationId
  componentDidUpdate(prevProps, prevState, snapshot) {
    // If we have a snapshot value, we've just added new items.
    // Adjust scroll so these new items don't push the old ones out of view.
    // (snapshot here is the value returned from getSnapshotBeforeUpdate)
    if (snapshot) {
      this.handleFetchDetail();
    }
  }

  // 查询详，将详情数据、接口列表、接口分页设置到state中
  @Bind()
  handleFetchDetail() {
    const { fetchDetail = e => e } = this.props;
    fetchDetail().then(res => {
      if (res) {
        this.setState({
          dataSource: { ...res },
        });
      }
    });
  }

  @Bind()
  cancel() {
    const { onCancel = e => e } = this.props;
    const { resetFields = e => e } = this.editorForm;
    onCancel();
    resetFields();
    this.setState({
      dataSource: {},
    });
  }

  @Bind()
  handleSave() {
    const {
      createAuthSelf = e => e,
      updateAuthSelf = () => {},
      primaryKey,
      interfaceId,
    } = this.props;
    const { dataSource } = this.state;
    const {
      validateFields = e => e,
      setFieldsValue = () => {},
      getFieldValue = () => {},
    } = this.editorForm;

    if (getFieldValue('authLevel') === 'INTERFACE') {
      setFieldsValue({ authLevelValue: interfaceId });
    }

    validateFields((err, values) => {
      if (isEmpty(err)) {
        const data = {
          ...dataSource,
          ...values,
        };

        if (isNumber(dataSource[primaryKey])) {
          updateAuthSelf(data, () => {
            this.handleFetchDetail();
            this.cancel();
          });
        } else {
          createAuthSelf(data, () => {
            this.cancel();
          });
        }
      }
    });
  }

  /**
   * 测试信息是否配置正确
   */
  @Bind()
  testUrl() {
    const { onTestUrl = () => {}, testAuthLoading } = this.props;
    const { validateFields = e => e } = this.editorForm;
    if (testAuthLoading) return;
    validateFields((err, values) => {
      if (isEmpty(err)) {
        onTestUrl(filterNullValueObject(values));
      }
    });
  }

  @Bind()
  handleAuthTypeChange(value) {
    this.setState({
      isOauth: value === 'OAUTH2',
    });
  }

  render() {
    const {
      visible,
      processing = {},
      currentTenantId,
      tenantRoleLevel,
      code = {},
      primaryKey,
      testAuthLoading,
    } = this.props;
    const { dataSource = {}, isOauth } = this.state;
    let isInitOauth = false;
    if (this.editorForm) {
      const { getFieldValue = () => {} } = this.editorForm;
      isInitOauth = dataSource.authType === 'OAUTH2' && getFieldValue('authType') === undefined;
    }
    const isOauthType = isOauth || isInitOauth;
    const editable = isNumber(dataSource[primaryKey]);
    const title = editable
      ? intl.get(`hitf.application.view.message.title.auth.edit`).d('编辑认证配置')
      : intl.get(`hitf.application.view.message.title.auth.create`).d('创建认证配置');
    const drawerProps = {
      title,
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel,
      width: 550,
    };

    const formProps = {
      dataSource: {
        ...dataSource,
        tenantId: tenantRoleLevel ? currentTenantId : dataSource.tenantId,
      },
      ref: node => {
        this.editorForm = node;
      },
      editable,
      tenantRoleLevel,
      code,
      onAuthTypeChange: this.handleAuthTypeChange,
    };

    return (
      <Drawer {...drawerProps}>
        <Spin
          spinning={
            processing.queryListDetail ||
            processing.createLoading ||
            processing.updateLoading ||
            false
          }
        >
          <EditorForm {...formProps} />
        </Spin>
        <br />
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
          {isOauthType && (
            <Button
              key="test"
              onClick={this.testUrl}
              style={{ marginRight: 8 }}
              loading={testAuthLoading}
            >
              {intl.get(`hitf.interfaces.view.message.button.auth.test`).d('测试')}
            </Button>
          )}
          <Button
            onClick={this.cancel}
            disabled={processing.createLoading || processing.updateLoading}
            style={{ marginRight: 8 }}
          >
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
          <Button
            type="primary"
            loading={
              processing.queryListDetail ||
              processing.createLoading ||
              processing.updateLoading ||
              false
            }
            onClick={this.handleSave}
          >
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
