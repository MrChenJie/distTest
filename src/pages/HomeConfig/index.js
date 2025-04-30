import React, { Component } from 'react';
import { Button, Card, Form, Modal, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { Content, Header } from 'components/Page';
import notification from 'utils/notification';
import { removeUploadFile } from 'services/api';
import { getCurrentOrganizationId } from 'utils/utils';
import { BKT_PUBLIC } from 'utils/config';

import SystemConfig from './SystemConfig';
import AnnouncementConfigTable from './AnnouncementConfigTable';
import MainMessageForm from './MainMessageForm';
import MessageConfigTable from './MessageConfigTable';
import styles from './index.less';

@formatterCollections({
  code: ['ptal.homeConfig'],
})
@connect(({ home, loading }) => ({
  home,
  organizationId: getCurrentOrganizationId(),
  saveLoading: loading.effects['home/saveConfig'],
  queryLoading: loading.effects['home/qurryConfigAll'],
}))
@Form.create()
export default class HomeConfigPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      announcementConfigDataSource: [],
      messageConfigDataSource: [],
      systemConfigData: [],
      removeFileList: [], // 存储删除的文件保存时批量删除
    };
    this.sysConfigForm = null; // 系统配信息表单
    this.mainMessageForm = null; // 主消息表单
  }

  componentDidMount() {
    this.handleQuery();
  }

  /**
   * 查询配置信息
   *
   * @memberof HomeConfigPage
   */
  @Bind
  handleQuery() {
    const { dispatch } = this.props;
    dispatch({
      type: 'home/queryConfigAll',
    }).then((res) => {
      if (res) {
        this.setState({
          announcementConfigDataSource: res
            .filter((item) => item.configCategory === 'announcement')
            .map((item) => ({ ...item, _status: 'update' }))
            .sort((a, b) => a.configSequence - b.configSequence),
          systemConfigData: res.filter((item) =>
            ['system', 'contact'].includes(item.configCategory),
          ),
          mainMessageData: res.find((item) => item.configCategory === 'mian_message'),
          messageConfigDataSource: res
            .filter((item) => item.configCategory === 'message')
            .map((item) => ({ ...item, _status: 'update' }))
            .sort((a, b) => a.configSequence - b.configSequence),
        });
      }
    });
  }

  /**
   * 校验表单
   *
   * @param {*} form
   * @returns
   * @memberof HomeConfigPage
   */
  validateForm(form) {
    return new Promise((resolve, reject) => {
      if (form) {
        form.validateFieldsAndScroll((errs) => {
          if (errs) {
            reject(errs);
          } else {
            resolve();
          }
        });
      } else {
        reject();
      }
    });
  }

  @Bind
  handleDeleteRemovedFiles(removeFileList = []) {
    const { organizationId } = this.props;
    removeUploadFile({
      tenantId: organizationId,
      bucketName: BKT_PUBLIC,
      urls: removeFileList,
    });
  }

  /**
   * 保存
   *
   * @memberof HomeConfigPage
   */
  @Bind
  @Debounce(500, { leading: true })
  handleSave() {
    Promise.all([
      this.validateForm(this.sysConfigForm),
      this.validateForm(this.mainMessageForm),
    ]).then(() => {
      const { dispatch } = this.props;
      const data = [...this.handleSystemConfigData(), this.handleMainMessageData()];
      dispatch({
        type: 'home/saveConfig',
        payload: data,
      }).then((res) => {
        if (res) {
          const { removeFileList } = this.state;
          this.handleDeleteRemovedFiles(removeFileList);
          this.handleQuery();
          notification.success();
        }
      });
    });
  }

  /**
   * 添加公告配置信息
   *
   * @param {*} data
   * @memberof HomeConfigPage
   */
  @Bind
  handleAnnouncementConfigAdd(data) {
    const { announcementConfigDataSource = [] } = this.state;
    this.setState({
      announcementConfigDataSource: [data, ...announcementConfigDataSource],
    });
  }

  /**
   * 保存公告配置信息
   *
   * @param {*} record
   * @param {*} rowKey
   * @param {*} [onSuccess=e => e]
   * @memberof HomeConfigPage
   */
  @Bind
  handleAnnouncementConfigSave(record, rowKey, onSuccess = (e) => e) {
    if (record.$form) {
      record.$form.validateFields((errs, values) => {
        if (errs) {
          return false;
        }
        const data = {
          ...record,
          ...values,
          configId: record._status === 'create' ? undefined : record.configId,
        };
        // 调用保存接口

        const { dispatch } = this.props;
        dispatch({
          type: 'home/saveConfig',
          payload: [data],
        }).then((res) => {
          if (res) {
            // 替换原来的数据
            const { announcementConfigDataSource = [] } = this.state;
            const newDataSource = announcementConfigDataSource
              .map((item) =>
                item[rowKey] === record[rowKey] ? { ...res[0], _status: 'update' } : item,
              )
              .sort((a, b) => a.configSequence - b.configSequence);
            this.setState({
              announcementConfigDataSource: newDataSource,
            });
            onSuccess();
            notification.success();
          }
        });
      });
    }
  }

  /**
   * 删除公告配置信息
   *
   * @param {*} keys
   * @param {*} keyName
   * @param {*} [onDeleteSuccess=(e) => e]
   * @memberof HomeConfigPage
   */
  @Bind
  handleAnnouncementConfigDelete(keys, keyName, onDeleteSuccess = (e) => e) {
    const { announcementConfigDataSource = [] } = this.state;
    const deleteData = announcementConfigDataSource.filter(
      (item) => keys.includes(item[keyName]) && item._status === 'update',
    );
    const newDataSource = announcementConfigDataSource.filter(
      (item) => !keys.includes(item[keyName]),
    );
    if (deleteData.length > 0) {
      // TODO 调用删除接口
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.delete').d('是否确认删除?'),
        onOk: () => {
          const { dispatch } = this.props;
          dispatch({
            type: 'home/deleteConfig',
            payload: deleteData[0],
          }).then((res) => {
            if (res) {
              this.setState(
                {
                  announcementConfigDataSource: newDataSource,
                },
                onDeleteSuccess,
              );
              notification.success();
            }
          });
        },
      });
    } else {
      this.setState(
        {
          announcementConfigDataSource: newDataSource,
        },
        onDeleteSuccess,
      );
    }
  }

  /**
   * 添加消息配置信息
   *
   * @param {*} data
   * @memberof HomeConfigPage
   */
  @Bind
  handleMessageConfigAdd(data) {
    const { messageConfigDataSource = [] } = this.state;
    this.setState({
      messageConfigDataSource: [data, ...messageConfigDataSource],
    });
  }

  /**
   * 保存消息配置信息
   *
   * @param {*} record
   * @param {*} rowKey
   * @param {*} [onSuccess=e => e]
   * @memberof HomeConfigPage
   */
  @Bind
  handleMessageConfigSave(record, rowKey, onSuccess = (e) => e) {
    if (record.$form) {
      record.$form.validateFields((errs, values) => {
        if (errs) {
          return false;
        } else {
          const data = {
            ...record,
            ...values,
            configId: record._status === 'create' ? undefined : record.configId,
          };
          // 调用保存接口

          const { dispatch } = this.props;
          dispatch({
            type: 'home/saveConfig',
            payload: [data],
          }).then((res) => {
            if (res) {
              const { messageConfigDataSource = [] } = this.state;
              const newDataSource = messageConfigDataSource
                .map((item) =>
                  item[rowKey] === record[rowKey] ? { ...res[0], _status: 'update' } : item,
                )
                .sort((a, b) => a.configSequence - b.configSequence);
              this.setState({
                messageConfigDataSource: newDataSource,
              });
              onSuccess();
              notification.success();
              const { removeFileList = [] } = record;
              this.handleDeleteRemovedFiles(removeFileList);
            }
          });
        }
      });
    }
  }

  /**
   * 删除消息配置信息
   *
   * @param {*} keys
   * @param {*} keyName
   * @param {*} [onDeleteSuccess=(e) => e]
   * @memberof HomeConfigPage
   */
  @Bind
  handleMessageConfigDelete(keys, keyName, onDeleteSuccess = (e) => e) {
    const { messageConfigDataSource = [] } = this.state;
    const deleteData = messageConfigDataSource.filter(
      (item) => keys.includes(item[keyName]) && item._status === 'update',
    );
    const newDataSource = messageConfigDataSource.filter((item) => !keys.includes(item[keyName]));
    if (deleteData.length > 0) {
      // 调用删除接口
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.delete').d('是否确认删除?'),
        onOk: () => {
          const { dispatch } = this.props;
          dispatch({
            type: 'home/deleteConfig',
            payload: deleteData[0],
          }).then((res) => {
            if (res) {
              this.setState(
                {
                  messageConfigDataSource: newDataSource,
                },
                onDeleteSuccess,
              );
              notification.success();
            }
          });
        },
      });
    } else {
      this.setState(
        {
          messageConfigDataSource: newDataSource,
        },
        onDeleteSuccess,
      );
    }
  }

  /**
   * 处理系统配置数据
   *
   * @returns
   * @memberof HomeConfigPage
   */
  @Bind
  handleSystemConfigData() {
    let newSystemConfigData = [];
    if (this.sysConfigForm) {
      const fieldsValue = this.sysConfigForm.getFieldsValue();
      const { _tls = {} } = fieldsValue;
      const { systemConfigData = [] } = this.state;
      const initData = {};
      systemConfigData.forEach((item) => {
        initData[item.configCode] = item;
      });
      newSystemConfigData = [
        {
          ...initData.HOME_CONFIG_SYSTEM_TITLE,
          configCode: 'HOME_CONFIG_SYSTEM_TITLE',
          configCategory: 'system',
          configContent: fieldsValue.HOME_CONFIG_SYSTEM_TITLE,
          _tls,
        },
        {
          ...initData.HOME_CONFIG_COPYRIGHT,
          configCode: 'HOME_CONFIG_COPYRIGHT',
          configCategory: 'system',
          configContent: fieldsValue.HOME_CONFIG_COPYRIGHT,
        },
        {
          ...initData.HOME_CONFIG_SYSTEM_LOGO,
          configCode: 'HOME_CONFIG_SYSTEM_LOGO',
          configCategory: 'system',
          configBackground: fieldsValue.HOME_CONFIG_SYSTEM_LOGO,
        },
        {
          ...initData.HOME_CONFIG_CONTACT_EMAIL,
          configCode: 'HOME_CONFIG_CONTACT_EMAIL',
          configCategory: 'contact',
          configContent: fieldsValue.HOME_CONFIG_CONTACT_EMAIL,
        },
      ];
    }
    return newSystemConfigData;
  }

  /**
   * 处理主消息数据
   *
   * @returns
   * @memberof HomeConfigPage
   */
  @Bind
  handleMainMessageData() {
    if (this.mainMessageForm) {
      const fieldsValue = this.mainMessageForm.getFieldsValue();
      const { mainMessageData = {} } = this.state;
      return {
        ...mainMessageData,
        ...fieldsValue,
        configCode: 'HOME_CONFIG_MAIN_MESSAGE',
        configCategory: 'mian_message',
      };
    }
  }

  @Bind
  handleRemove(file) {
    const { removeFileList = [] } = this.state;
    this.setState({
      removeFileList: [...removeFileList, file.url],
    });
  }

  render() {
    const { saveLoading = false, queryLoading = false } = this.props;
    const {
      systemConfigData = [],
      announcementConfigDataSource = [],
      mainMessageData = {},
      messageConfigDataSource = [],
    } = this.state;

    const systemConfigProps = {
      data: systemConfigData,
      onRef: (node) => {
        this.sysConfigForm = node.props.form;
      },
      onRemove: this.handleRemove,
    };

    const announcementConfigPorps = {
      dataSource: announcementConfigDataSource,
      onAdd: this.handleAnnouncementConfigAdd,
      onDelete: this.handleAnnouncementConfigDelete,
      onSave: this.handleAnnouncementConfigSave,
    };

    const mainMessageFormProps = {
      data: mainMessageData,
      onRef: (node) => {
        this.mainMessageForm = node.props.form;
      },
      onRemove: this.handleRemove,
    };

    const messageConfigTableProps = {
      dataSource: messageConfigDataSource,
      onAdd: this.handleMessageConfigAdd,
      onDelete: this.handleMessageConfigDelete,
      onSave: this.handleMessageConfigSave,
      onRemove: this.handleRemove,
    };

    return (
      <>
        <Header title={intl.get('ptal.homeConfig.title.homeConfig').d('首页配置')}>
          <Button icon='save' type='primary' onClick={this.handleSave} disabled={saveLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={saveLoading || queryLoading}>
            <div className={styles['home-config']}>
              <Card
                key='systemConfig'
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                title={<h3>{intl.get('ptal.homeConfig.title.systemConfig').d('系统配置')}</h3>}
              >
                <SystemConfig {...systemConfigProps} />
              </Card>
              <Card
                key='announcementConfig'
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                title={
                  <h3>{intl.get('ptal.homeConfig.title.announcementConfig').d('系统公告')}</h3>
                }
              >
                <AnnouncementConfigTable {...announcementConfigPorps} />
              </Card>
              <Card
                key='messageConfig'
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                title={<h3>{intl.get('ptal.homeConfig.title.messageConfig').d('消息配置')}</h3>}
              >
                <MainMessageForm {...mainMessageFormProps} />
                <MessageConfigTable {...messageConfigTableProps} />
              </Card>
            </div>
          </Spin>
        </Content>
      </>
    );
  }
}
