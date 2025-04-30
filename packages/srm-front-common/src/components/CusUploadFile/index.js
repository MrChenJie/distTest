/**
 * UploadFile - 用于上传文件的处理
 * @date: 2023-07-03
 * @author: CQX <qingxin.chen@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2023, Hand
 */

import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';
import { isInteger, isEqual } from 'lodash';
import { Tag } from 'hzero-ui';
import { Tooltip, Upload } from 'antd';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { getCurrentOrganizationId, getAccessToken, getCurrentLanguage } from 'utils/utils';
import { downloadFile } from 'services/api';
import CusModal from '_cus_components/CusModal';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import './index.less';
import tipIcon from '@/assets/tips.svg';

const commonPrompt = 'hzero.common';
export default class Index extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
    this.state = {
      visible: false,
      showFileList: props.value,
      parentId: undefined,
    };
  }

  componentDidMount() {
    const { parentId, tableName } = this.props;
    if (tableName && isInteger(parentId)) {
      this.getFileListFromNetwork(tableName, parentId);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { parentId } = prevState;
    const { tableName } = prevProps;
    const { value } = this.props;
    if (parentId !== prevProps.parentId) {
      if (tableName && isInteger(parentId)) {
        this.getFileListFromNetwork(tableName, parentId);
      };
    }
    if (!isEqual(prevProps.value, value)) {
      this.updateShowFileList([ ...(value || []) ])
    };
  }

  @Bind
  getFileListFromNetwork(tableName, parentId) {
    const { getFileAsyncFn } = this.props;
    if (getFileAsyncFn) {
      getFileAsyncFn({
        tableName,
        parentId,
      }).then((res) => {
        this.updateShowFileList([...res] || []);
      });
    }
  }

  @Bind
  getFileList() {
    return this.state.showFileList;
  }

  @Bind
  openModal() {
    this.setState({
      visible: true,
    });
  }

  @Bind
  closeModal() {
    this.setState({
      visible: false,
    });
  }

  @Bind
  updateShowFileList(list) {
    const { onChange, form } = this.props;
    if (form && onChange) {
      onChange(list);
    }
    this.setState({
      showFileList: list,
    });
  }

  @Bind
  handleDownload(record) {
    const { bucketName = 'supplier-files', isEncrypt } = this.props;
    const api = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}
    /files/${isEncrypt ? 'decrypt-download-ext' : 'download'}?bucketName=${bucketName}&url=${
      record.fileUrl
    }`;
    downloadFile({
      requestUrl: api,
      queryParams: [
        { name: 'bucketName', value: bucketName },
        { name: 'url', value: record.fileUrl },
      ],
    });
    return false;
  }

  @Bind
  handleDelete(record) {
    const { onDeleteSuccess, deleteFileAsyncFn, isSendRecord = false } = this.props;
    const { cleanCurrentPage } = this;
    CusModal.confirm({
      content: intl
        .get(`hzero.common.uploadFile.deleteConfirm`, {
          name: record.fileName,
        })
        .d(`确定需要删除 {name} ？`),
      okText: intl.get('hzero.common.button.ok').d('确定'),
      okType: 'normal',
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk() {
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
        if (record.isLocal) {
          // 当记录仅仅是当前页面的数据，将其直接从本地删除即可
          cleanCurrentPage(record);
        } else {
          // 当前记录在后端数据库中有数据，需要调用接口进行删除。
          // 此处用dataset无法处理，待日后对该概念熟悉之后再进行处理。
          const paylaod = isSendRecord ? { ...record } : { fileKey: record.fileKey };
          deleteFileAsyncFn({ ...paylaod }).then((res) => {
            if (!res.failed) {
              cleanCurrentPage(record);
            }
          });
        }
      },
    });
  }

  @Bind
  cleanCurrentPage(record) {
    const { showFileList } = this.state;
    const newFileList = [...showFileList].filter((item) => {
      return item.fileKey !== record.fileKey;
    });
    this.updateShowFileList(newFileList);
  }

  // 获取文件的信息生成调用接口数据
  @Bind
  getData(file) {
    const { uploadCarryData } = this.props;
    return {
      paramsJsonStr: JSON.stringify({
        fileName: file.name,
        fileKey: 'test',
        uuid: uuidv4(),
        ...uploadCarryData,
      }),
    };
  }

  render() {
    const {
      tip,
      disabled, // 不能做上传的操作
      tableName,
      action,
      accept = ['.jpeg', '.png', '.gif', '.bmp', '.jpg', '.pdf', '.txt', '.doc', 'docx', '.xlsx'],
      uploadCarryData,
    } = this.props;
    const { visible, showFileList = [] } = this.state;
    const uploadProps = {
      headers: {
        Authorization: `bearer ${getAccessToken()}`,
      },
      action,
      accept,
      data: this.getData,
      onSuccess: (res) => {
        const dto = res;
        if (dto.failed) {
          CusNotification.error({ message: dto.message });
        } else {
          this.updateShowFileList([
            ...showFileList,
            { ...dto, isLocal: true, tableName, ...uploadCarryData },
          ]);
          const { onUploadSuccess } = this.props;
          if (onUploadSuccess) {
            onUploadSuccess(res);
          }
          CusNotification.success({
            message: intl.get(`${commonPrompt}.uploadFile.view.uploadSuccess`).d('上传成功'),
          });
        }
      },
      onError: (res) => {
        CusNotification.error({ message: res.message });
      },
      showUploadBtn: true,
      showUploadList: false,
    };
    const columns = [
      {
        title: intl.get(`${commonPrompt}.uploadFile.view.fileName`).d('文件名'),
        key: 'fileName',
        width: getCurrentLanguage() === 'zh_CN' ? 190 : 136,
        dataIndex: 'fileName',
      },
      {
        title: intl.get(`${commonPrompt}.uploadFile.view.uploadTime`).d('上传时间'),
        key: 'uploadDate',
        width: 172,
        dataIndex: 'uploadDate',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        key: 'operate',
        width: getCurrentLanguage() === 'zh_CN' ? 108 : 162,
        dataIndex: 'operate',
        render: (_, record) => (
          <>
            <CusButton
              type="plain"
              onClick={() => this.handleDownload(record)}
              style={{ marginRight: '16px' }}
            >
              {intl.get('hzero.common.button.download').d('下载')}
            </CusButton>
            <CusButton type="plain" onClick={() => this.handleDelete(record)} disabled={disabled}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </CusButton>
          </>
        ),
      },
    ];
    return (
      <>
        <div className="cus-upload-file-tag">
          <CusButton type="plain" onClick={this.openModal}>
            {disabled
              ? intl.get(`${commonPrompt}.uploadFile.view.checkFile`).d('查看文件')
              : intl.get(`${commonPrompt}.uploadFile.view.uploadFile`).d('上传文件')}
          </CusButton>
          {showFileList.length !== 0 && <Tag>{showFileList.length}</Tag>}
          {tip && (
            <Tooltip title={tip} overlayClassName="customize-tooltip">
              <img src={tipIcon} style={{ width: '16px', marginLeft: '8px' }} alt="tip" />
            </Tooltip>
          )}
        </div>
        <CusModal
          visible={visible}
          onCancel={this.closeModal}
          bodyStyle={{
            marginTop: '0px',
          }}
          footer={
            <>
              <CusButton onClick={this.closeModal}>
                {intl.get('hzero.common.button.close').d('关闭')}
              </CusButton>
            </>
          }
        >
          <div>
            <div className="cus-upload-header">
              <span>
                {disabled
                  ? intl.get(`${commonPrompt}.uploadFile.view.checkFile`).d('查看文件')
                  : intl.get(`${commonPrompt}.uploadFile.view.uploadFile`).d('上传文件')}
              </span>
              {!disabled && (
                <div className="cus-upload">
                  <Upload {...uploadProps}>
                    <CusButton mini type="primary">
                      {intl.get(`${commonPrompt}.uploadFile.selectFile`).d('上传')}
                    </CusButton>
                  </Upload>
                </div>
              )}
            </div>
            <CusTable columns={columns} dataSource={showFileList} />
          </div>
        </CusModal>
      </>
    );
  }
}
