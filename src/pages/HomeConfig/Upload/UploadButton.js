/**
 * 上传按钮组件.
 * CHANGELOG: 2019-06-20: 过滤上传错误的文件时同时过滤掉 没有 uid 的文件, 文件 onChange 统一过滤掉 uid 重复的文件
 *
 * @date: 2018-7-13
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Button, Icon, notification, Upload } from 'hzero-ui';
import { isEmpty, isObject, isString, isUndefined, remove, uniqWith } from 'lodash';
import { Bind } from 'lodash-decorators';
import AbortController from 'abort-controller';

import intl from 'utils/intl';
import request from 'utils/request';
import {
  getAccessToken,
  getAttachmentUrl,
  getCurrentOrganizationId,
  getResponse,
  isTenantRoleLevel,
} from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import { removeUploadFile } from 'services/api';
// import { getEnvConfig } from './iocUtils';

notification.config({
  placement: 'bottomRight',
});

export default class UploadButton extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.state = {
      fileList: null,
    };
    // this.config = getEnvConfig();
  }

  // static getDerivedStateFromProps(props, state) {
  //   if (props.fileList.length > 0 && state.fileList == null) {
  //     return {
  //       fileList: props.fileList,
  //     };
  //   }
  //   return state;
  // }
  reUploadRef = React.createRef();

  setFileList(fileList) {
    if (fileList) {
      this.setState({
        fileList,
      });
    }
  }

  @Bind()
  uploadData(file) {
    const {
      attachmentUUID,
      bucketName,
      uploadData,
      bucketDirectory,
      docType,
      storageCode = 'SCM-PORTAL', // 存储配置编码
    } = this.props;
    let data = uploadData ? uploadData(file) : {};
    if (!(data instanceof FormData)) {
      const currentData = data;
      data = new FormData();
      if (isObject(data)) {
        Object.keys(currentData).forEach((paramKey) => {
          data.append(paramKey, currentData[paramKey]);
        });
      }
    }
    if (!isUndefined(attachmentUUID)) {
      data.append('attachmentUUID', attachmentUUID);
    }
    if (!isUndefined(bucketName)) {
      data.append('bucketName', bucketName);
    }
    if (!isUndefined(docType)) {
      data.append('docType', docType);
    }
    if (!isUndefined(storageCode)) {
      data.append('storageCode', storageCode);
    }
    if (!isUndefined(bucketDirectory)) {
      data.append('directory', bucketDirectory);
    }
    // data.append('fileName', file.name);
    return data;
  }

  @Bind()
  onChange({ file, fileList }) {
    const {
      single = false,
      tenantId,
      bucketName,
      bucketDirectory,
      storageCode = 'SCM-PORTAL',
    } = this.props;
    let list = [...fileList];
    if (file.status === 'done') {
      const { response } = file;
      if (response && response.failed === true) {
        this.onUploadError(file, fileList);
      } else {
        if (single) {
          if (fileList.length > 1) {
            const { onRemove } = this.props;
            Promise.all(
              fileList.slice(0, fileList.length - 1).map(async (fileItem) => {
                if (fileItem.url) {
                  if (onRemove) {
                    // onRemove 返回 undefined 或 Promise
                    try {
                      await onRemove(fileItem);
                    } catch (e) {
                      // 单文件 上传成功后 删除之前的问题，报错不用管
                    }
                  } else {
                    const splitDatas = (fileItem.url && fileItem.url.split('=')) || [];
                    const fileUrl = splitDatas[splitDatas.length - 1];
                    try {
                      await removeUploadFile({
                        tenantId,
                        bucketName,
                        urls: [fileUrl],
                      });
                    } catch (e) {
                      // 单文件 上传成功后 删除之前的问题，报错不用管
                    }
                  }
                }
              }),
            ).catch(() => {
              // 单文件 上传成功后 删除之前的问题，报错不用管
            });
          }
          list = [
            {
              uid: file.uid,
              name: file.name,
              url: getAttachmentUrl(
                file.response,
                bucketName,
                tenantId,
                bucketDirectory,
                storageCode,
              ),
              thumbUrl: getAttachmentUrl(
                file.response,
                bucketName,
                tenantId,
                bucketDirectory,
                storageCode,
              ),
            },
          ];
        } else {
          list = fileList.map((f) => {
            if (f.uid === file.uid) {
              // f.url = file.response;
              // eslint-disable-next-line
              f.url = getAttachmentUrl(
                f.response,
                bucketName,
                tenantId,
                bucketDirectory,
                storageCode,
              );
              // f.url = `${HZERO_FILE}/v1${
              //   !isUndefined(tenantId) ? `/${tenantId}/` : '/'
              // }files/redirect-url?access_token=${accessToken}&bucketName=${bucketName}${
              //   !isUndefined(bucketDirectory) ? `&directory=${bucketDirectory}&` : '&'
              // }url=${f.response}`;
            }
            return f;
          });
        }
        this.onUploadSuccess(file, list);
      }
    } else if (file.status === 'error') {
      this.onUploadError(file, fileList);
      list = fileList.filter((f) => f.status !== 'error' && f.uid);
    }
    this.setState({
      fileList: uniqWith(list, (r1, r2) => r1.uid === r2.uid),
    });
  }

  @Bind()
  beforeUpload(file) {
    const { maxSize } = this.props;
    const maxFileSize = maxSize || 30 * 1024 * 1024;
    const {
      fileType,
      fileSize = maxFileSize,
      single,
      onlyUpload = false,
      onRemove,
      bucketName,
      tenantId,
    } = this.props;
    const { fileList = [] } = this.state;

    if (fileType && fileType.indexOf(file.type) === -1) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get('hzero.common.upload.error.type', {
            fileType,
          })
          .d(`上传文件类型必须是：${fileType}`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    // TODO 去掉文件 mimeType 校验
    // if (!file.type) {
    //   file.status = 'error'; // eslint-disable-line
    //   const res = {
    //     message: intl.get('hzero.common.upload.error.type.null').d('上传文件类型缺失，请检查类型'),
    //   };
    //   file.response = res; // eslint-disable-line
    //   return false;
    // }
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get('hzero.common.upload.error.size', {
            fileSize: fileSize / (1024 * 1024),
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    if (!isEmpty(fileList) && single && !onlyUpload) {
      const [preFile = {}] = fileList;
      if (preFile.url) {
        if (onRemove) {
          return onRemove(preFile);
        }
        const splitDatas = (preFile.url && preFile.url.split('=')) || [];
        const fileUrl = splitDatas[splitDatas.length - 1];
        return removeUploadFile({
          tenantId,
          bucketName,
          urls: [fileUrl],
        }).then((res) => {
          if (getResponse(res)) {
            this.setState({
              fileList: [],
            });
            return true;
          }
          return false;
        });
      }
      this.setState({
        fileList: fileList.filter((list) => list.uid !== preFile.uid),
      });
    }
    return true;
  }

  @Bind()
  onRemove(file) {
    const { onRemove, bucketName, onRemoveSuccess, single = false, tenantId } = this.props;
    const { fileList } = this.state;
    if (file.url) {
      if (onRemove) {
        return onRemove(file);
      }
      const splitDatas = (file.url && file.url.split('=')) || [];
      const fileUrl = splitDatas[splitDatas.length - 1];
      return removeUploadFile({
        tenantId,
        bucketName,
        urls: [fileUrl],
      }).then((res) => {
        if (getResponse(res)) {
          if (onRemoveSuccess) {
            onRemoveSuccess();
          }

          if (single) {
            this.setState({
              fileList: [],
            });
          } else {
            remove(fileList, (n) => n.uid === file.uid);
            this.setState({
              fileList,
            });
          }
          return true;
        }
        return false;
      });
    }
    this.setState({
      fileList: fileList.filter((list) => list.uid !== file.uid),
    });
  }

  onUploadSuccess(file, fileList) {
    const { onUploadSuccess } = this.props;
    if (onUploadSuccess) onUploadSuccess(file, fileList);
  }

  onUploadError(file, fileList) {
    const { onUploadError } = this.props;
    let showTip = true;
    if (onUploadError) {
      showTip = onUploadError(file, fileList) !== false;
    }
    if (showTip) {
      notification.error({
        message: intl.get('hzero.common.upload.status.error').d('上传失败'),
        description: file.response && file.response.message,
      });
    }
  }

  @Bind()
  changeFileList(fileList) {
    const { bucketName, bucketDirectory, tenantId, storageCode = 'SCM-PORTAL' } = this.props;
    if (fileList) {
      return fileList.map((res) => ({
        ...res,
        url: getAttachmentUrl(res.url, bucketName, tenantId, bucketDirectory, storageCode),
      }));
    }
  }

  /**
   * 由于需要 将其他参数放到 formData 中, 所有 action 变成 方法
   * @returns {*}
   */
  @Bind()
  handleAction({ file, onProgress, onSuccess, onError }) {
    const controller = new AbortController();
    const { signal } = controller;
    // const { HZERO_FILE } = this.config;
    const { action: propAction } = this.props;
    const actionPathname =
      propAction ||
      (isTenantRoleLevel()
        ? `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/multipart`
        : `${HZERO_FILE}/v1/files/multipart`);
    const action = `${actionPathname}`;
    const data = this.uploadData(file);
    // data.set('file', file, file.name);
    data.append('file', file, file.name);
    request(
      action,
      {
        processData: false, // 不会将 data 参数序列化字符串
        method: 'POST',
        type: 'FORM',
        body: data,
        responseType: 'text',
        signal, // 用于控制 取消 请求
        onProgress: onProgress ? (e) => onProgress(e, file) : null,
      },
      {
        beforeCatch: (err) => {
          if (err.name === 'AbortError') {
            // 隐藏掉 取消上传的 fetch 报错
          } else {
            throw new Error(err);
          }
        },
      },
    ).then((res) => {
      if (isString(res)) {
        // 成功
        onSuccess(res);
      } else if (!getResponse(res)) {
        onError(res);
        // 失败
      }
    });
    return {
      abort: () => {
        controller.abort();
      },
    };
  }

  @Bind()
  onReUploadFile(file) {
    const { bucketName, tenantId, onReUpload, onRemove, single } = this.props;
    const { fileList } = this.state;
    if (onReUpload) {
      onReUpload(file);
      return;
    }
    const uploadRefFlag =
      this.reUploadRef &&
      this.reUploadRef.current &&
      this.reUploadRef.current.upload &&
      this.reUploadRef.current.upload.uploader;

    function reUpload(reUploadRef) {
      const { uploader } = reUploadRef.current.upload;
      if (uploader.fileInput) {
        uploader.fileInput.click();
      } else if (uploader.getFormInputNode) {
        const iframeInput = uploader.getFormInputNode();
        if (iframeInput) {
          iframeInput.click();
        }
      }
    }

    if (file.url) {
      if (onRemove) {
        onRemove(file);
        if (uploadRefFlag) {
          reUpload(this.reUploadRef);
        }
        return;
      }
      const splitDatas = (file.url && file.url.split('=')) || [];
      const fileUrl = splitDatas[splitDatas.length - 1];
      return removeUploadFile({
        tenantId,
        bucketName,
        urls: [fileUrl],
      }).then((res) => {
        if (getResponse(res)) {
          if (single) {
            this.setState({
              fileList: [],
            });
          } else {
            remove(fileList, (n) => n.uid === file.uid);
            this.setState({
              fileList,
            });
          }
          if (uploadRefFlag) {
            reUpload(this.reUploadRef);
          }
          return true;
        }
        return false;
      });
    }
    this.setState({
      fileList: fileList.filter((list) => list.uid !== file.uid),
    });
    if (uploadRefFlag) {
      reUpload(this.reUploadRef);
    }
  }

  render() {
    const {
      fileList,
      fileType,
      fileSize,
      single,
      text = intl.get('hzero.common.button.upload').d('上传'),
      listType = 'picture',
      bucketName,
      onUploadSuccess,
      onUploadError,
      viewOnly = false,
      showRemoveIcon = true,
      showReUploadIcon = true,
      docType,
      storageCode, // 存储配置编码
      children,
      ...otherProps
    } = this.props;
    const accessToken = getAccessToken();
    const changedFileList = this.changeFileList(fileList);
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const acceptFileType =
      fileType && fileType.indexOf(',') === -1 ? fileType.split(';').join(',') : fileType;

    let uploadButton;
    if (listType === 'picture-card') {
      uploadButton = (
        <div>
          <Icon style={{ fontSize: '32px', color: '#999' }} type='plus' />
        </div>
      );
    } else {
      uploadButton = (
        <Button>
          <Icon type='upload' /> {text}
        </Button>
      );
    }

    return (
      <Upload
        name='file'
        ref={this.reUploadRef}
        accept={acceptFileType}
        fileList={this.state.fileList || changedFileList}
        data={this.uploadData}
        customRequest={this.handleAction}
        headers={headers}
        onChange={this.onChange}
        listType={listType}
        beforeUpload={this.beforeUpload}
        onRemove={this.onRemove}
        showUploadList={{
          showRemoveIcon: !viewOnly && showRemoveIcon,
          reUploadPopConfirmTitle: intl
            .get('hzero.common.message.confirm.reUpload')
            .d('是否重新上传此条记录？'),
          removePopConfirmTitle: intl
            .get('hzero.common.message.confirm.delete')
            .d('是否删除此条记录？'),
          showReUploadIcon,
        }}
        onReUpload={this.onReUploadFile}
        {...otherProps}
      >
        {children || (!viewOnly && uploadButton)}
      </Upload>
    );
  }
}
