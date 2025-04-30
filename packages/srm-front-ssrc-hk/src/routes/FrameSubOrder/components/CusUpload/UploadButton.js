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
import { Upload } from 'hzero-ui';
import { isObject, isString, isUndefined, remove, uniqWith } from 'lodash';
import { Bind } from 'lodash-decorators';
import AbortController from 'abort-controller';
import intl from 'utils/intl';
import request from 'utils/request';
import {
  getAccessToken,
  getCurrentOrganizationId,
  getResponse,
  isTenantRoleLevel,
  getCurrentLanguage,
} from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import CusFileViewer from '_cus_components/CusFileViewer';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import './index.less';
// import zh_CN from 'hzero-ui/lib/locale-provider/zh_CN';
import { getAttachmentUrl, removeUploadFile } from './utils';

export default class UploadButton extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.state = {
      fileList: [],
    };
  }

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
      storageCode, // 存储配置编码
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
    return data;
  }

  @Bind()
  onChange({ file, fileList }) {
    const {
      single = false,
      tenantId,
      bucketName,
      bucketDirectory,
      filePreview = true,
      isEncrypt,
    } = this.props;
    let oldFileList = this.state.fileList;
    let list = [...fileList];
    if (file.status === 'done') {
      const { response } = file;
      if (response && response.failed === true) {
        this.onUploadError(file, fileList);
        list = fileList.filter((f) => {
          return f.uid !== file.uid;
        });
        oldFileList = oldFileList.filter((f) => {
          return f.uid !== file.uid;
        });
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
              })
            ).catch(() => {
              // 单文件 上传成功后 删除之前的问题，报错不用管
            });
          }
          list = [
            {
              uid: file.uid,
              name: file.name,
              status: 'done',
              url: getAttachmentUrl({
                url: file.response,
                bucketName,
                tenantId,
                bucketDirectory,
                isEncrypt,
              }),
              thumbUrl: getAttachmentUrl({
                url: file.response,
                bucketName,
                tenantId,
                bucketDirectory,
                isEncrypt,
              }),
            },
          ];
        } else {
          list = fileList.map((f) => {
            if (f.uid === file.uid) {
              return {
                ...f,
                url: getAttachmentUrl({
                  url: f.response,
                  bucketName,
                  tenantId,
                  bucketDirectory,
                  isEncrypt,
                }),
              };
            }
            return f;
          });
        }
        this.onUploadSuccess(file, list);
      }
    } else if (file.status === 'error') {
      this.onUploadError(file, fileList);
      list = fileList.filter((f) => {
        return f.status !== 'error' && f.uid;
      });
    }
    if (filePreview) {
      remove(oldFileList, (n) => n.status === 'removed');
      if (single) {
        if (oldFileList.length > 1) {
          const { onRemove } = this.props;
          Promise.all(
            oldFileList.slice(0, oldFileList.length - 1).map(async (fileItem) => {
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
            })
          ).catch(() => {
            // 单文件 上传成功后 删除之前的问题，报错不用管
          });
        }
        this.setState({
          fileList: uniqWith([...list], (r1, r2) => r1.uid === r2.uid),
        });
      } else {
        this.setState({
          fileList: uniqWith([...list, ...oldFileList], (r1, r2) => r1.uid === r2.uid),
        });
      }
    } else {
      this.setState({
        fileList: uniqWith(list, (r1, r2) => r1.uid === r2.uid),
      });
    }
  }

  @Bind()
  beforeUpload(file) {
    const { fileType, fileSize = 100 * 1024 * 1024 } = this.props;
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
    return true;
  }

  @Bind()
  onRemove(file) {
    const { onRemove, bucketName, onRemoveSuccess, single = false, tenantId } = this.props;
    const { fileList } = this.state;
    if (file.url) {
      if (onRemove) {
        return onRemove(file);
      } else {
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
            CusNotification.success();
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
    } else {
      this.setState({
        fileList: fileList.filter((list) => list.uid !== file.uid),
      });
    }
  }

  onUploadSuccess(file, fileList) {
    const { onUploadSuccess } = this.props;
    CusNotification.success({
      message: intl.get(`hzero.common.upload.status.success`).d('上传成功'),
    });
    if (onUploadSuccess) onUploadSuccess(file, fileList);
  }

  onUploadError(file, fileList) {
    const { onUploadError } = this.props;
    let showTip = true;
    if (onUploadError) {
      showTip = onUploadError(file, fileList) !== false;
    }
    if (showTip) {
      CusNotification.error({
        message: intl.get('hzero.common.upload.status.error').d('上传失败'),
        description: file.response && file.response.message,
      });
    }
  }

  @Bind()
  changeFileList(fileList) {
    const { bucketName, bucketDirectory, tenantId, isEncrypt } = this.props;
    if (fileList) {
      return fileList.map((res) => {
        return {
          ...res,
          url: getAttachmentUrl({ url: res.url, bucketName, tenantId, bucketDirectory, isEncrypt }),
        };
      });
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

    const { action: propAction, isEncrypt } = this.props;
    const actionPathname =
      propAction ||
      (isTenantRoleLevel()
        ? `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/${
            isEncrypt ? 'attachment/encrypt-multipart' : 'multipart'
          }`
        : `${HZERO_FILE}/v1/files/multipart`);
    const action = `${actionPathname}`;
    const data = this.uploadData(file);
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
      }
    ).then((res) => {
      if (isString(res)) {
        CusNotification.success();
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
  extname(url) {
    if (!url) {
      return '';
    }
    const temp = url.split('/');
    const filename = temp[temp.length - 1];
    const filenameWithoutSuffix = filename.split(/#|\?/)[0];
    return (/\.[^./\\]*$/.exec(filenameWithoutSuffix) || [''])[0];
  }

  @Bind()
  isImageUrl(file) {
    if (file.status === 'done' || !file.status) {
      const url = file.name || file.thumbUrl || file.url;
      const extension = this.extname(url);
      if (/^data:image\//.test(url) || /(webp|svg|png|gif|jpg|jpeg|bmp)$/i.test(extension)) {
        return true;
      } else if (/^data:/.test(url)) {
        // other file types of base64
        return false;
      } else if (extension) {
        // other file types which have extension
        return false;
      }
      return true;
    } else {
      return true;
    }
  }

  @Bind()
  allowPreview(item) {
    const fA = item.name.split('.');
    const fileExt = fA && fA[fA.length - 1];
    let allowPreview = false;
    switch (fileExt.toLowerCase()) {
      case 'docx':
        allowPreview = true;
        break;
      case 'pdf':
        allowPreview = true;
        break;
      case 'csv':
        allowPreview = true;
        break;
      case 'xlsx':
        allowPreview = true;
        break;
      default:
        break;
    }
    return allowPreview;
  }

  @Bind()
  async deleteFile(file) {
    const { onRemove } = this.props;
    const { fileList } = this.state;
    remove(fileList, (n) => n.uid === file.uid);
    if (file.url) {
      if (onRemove) {
        await onRemove(file);
        this.setState({
          fileList,
        });
      } else {
        this.onRemove(file);
      }
    }
  }

  // 新预览文件
  @Bind()
  handlePreviewFile = (item) => {
    const { bucketName } = this.props;
    const { OOS_HOST } = process.env;
    const onlineApi = `${OOS_HOST}?file=`;
    const api = encodeURIComponent(
      `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download?access_token=${getAccessToken()}&bucketName=${bucketName}&url=`
    );
    const urlEncode = encodeURIComponent(item.url);
    const url = `${onlineApi}${urlEncode}`;
    window.open(url);
  };

  // @Bind()
  // handlePreviewFile(item) {
  //   const fA = item.name.split('.');
  //   const fileExt = fA && fA[fA.length - 1];
  //   if (fileExt.toLowerCase() === 'docx') {
  //     request(item.url, {
  //       responseType: 'blob',
  //       method: 'GET',
  //     }).then((response) => {
  //       if (response.size === 0) {
  //         CusNotification.warning({
  //           message: intl.get('hzero.common.cannot.preview.empty.file').d('不能预览空白文件'),
  //         });
  //         return false;
  //       } else {
  //         this.setState({
  //           previewFileVisible: true,
  //           fileExt,
  //           previewUrl: item.url,
  //         });
  //       }
  //     });
  //   } else {
  //     this.setState({
  //       previewFileVisible: true,
  //       fileExt,
  //       previewUrl: item.url,
  //     });
  //   }
  // }

  render() {
    const {
      fileList,
      fileType,
      fileSize,
      single,
      text = intl.get('hzero.common.upload.txt').d('上传'),
      // listType = 'picture',
      bucketName,
      onUploadSuccess,
      onUploadError,
      viewOnly = false,
      // showRemoveIcon = true,
      docType,
      storageCode, // 存储配置编码
      // filePreview = true,
      onPreview,
      ...otherProps
    } = this.props;
    const { previewFileVisible, fileExt, previewUrl } = this.state;
    const accessToken = getAccessToken();
    const changedFileList = this.changeFileList(fileList);
    const finalFileList =
      this.state.fileList.length > 0
        ? this.state.fileList || changedFileList || []
        : changedFileList || [];
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const acceptFileType =
      fileType && fileType.indexOf(',') === -1 ? fileType.split(';').join(',') : fileType;

    const uploadButton = (
      <CusButton mini type="primary">
        {text}
      </CusButton>
    );
    const columns = [
      {
        title: intl.get(`HKPC.commom.view.title.filename`).d('附件名'),
        width: getCurrentLanguage() === 'zh_CN' ? (viewOnly ? 463 : 418) : viewOnly ? 398 : 330,
        dataIndex: 'name',
      },
      {
        title: intl.get(`HKPC.commom.view.title.operate`).d('操作'),
        width: getCurrentLanguage() === 'zh_CN' ? (viewOnly ? 105 : 150) : viewOnly ? 170 : 228,
        dataIndex: 'operation',
        render: (_, record) => {
          const allowPreview = this.allowPreview(record);
          const isImage = this.isImageUrl(record);
          return (
            <>
              <CusButton type="plain">
                <a href={record.url}>{intl.get(`hzero.common.button.download`).d('下载')}</a>
              </CusButton>
              {!viewOnly && (
                <CusButton
                  type="plain"
                  style={{ marginLeft: '16px' }}
                  onClick={() =>
                    CusModal.confirm({
                      content: intl
                        .get('hzero.common.message.confirm.delete')
                        .d('是否删除此条记录？'),
                      okType: 'normal',
                      onOk: () => this.deleteFile(record),
                    })
                  }
                >
                  {intl.get(`hzero.common.button.delete`).d('删除')}
                </CusButton>
              )}
                <CusButton
                  type="plain"
                  style={{ marginLeft: '16px' }}
                  onClick={() => {
                    // if (isImage) {
                    //   onPreview(record);
                    // } else if (this.props.handlePreviewFile) {
                    //   this.props.handlePreviewFile(record);
                    // } else {
                      this.handlePreviewFile(record);
                    // }
                  }}
                >
                  {intl.get(`hzero.common.button.preview`).d('预览')}
                </CusButton>
            </>
          );
        },
      },
    ];
    return (
      <>
        <div className="cus-upload-header">
          <span>{intl.get(`hzero.common.upload.modal.title`).d('附件')}</span>
          <div className="cus-upload">
            <Upload
              name="file"
              accept={acceptFileType}
              fileList={finalFileList}
              data={this.uploadData}
              customRequest={this.handleAction}
              headers={headers}
              onChange={this.onChange}
              // listType={listType}
              beforeUpload={this.beforeUpload}
              onRemove={this.onRemove}
              // showUploadList={{ showRemoveIcon: !viewOnly && showRemoveIcon }}
              {...otherProps}
            >
              {!viewOnly && uploadButton}
            </Upload>
          </div>
        </div>
        <CusTable columns={columns} dataSource={finalFileList} />
        <CusFileViewer
          visible={previewFileVisible}
          fileType={fileExt}
          filePath={previewUrl}
          onCancel={() => {
            this.setState({ previewFileVisible: false });
          }}
        />
      </>
    );
  }
}
