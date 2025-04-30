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
 import dayjs from 'dayjs';
 import {
   getAccessToken,
   getCurrentLanguage,
   getDateTimeFormat,
   getCurrentOrganizationId,
 } from 'utils/utils';
 import { HZERO_FILE } from 'utils/config';
 import request from '@/utils/request';
 import { getResponse } from '_cus_utils/utils';
 import CusTable from '_cus_components/CusTable';
 import CusButton from '_cus_components/CusButton';
 import CusModal from '_cus_components/CusModal';
 import CusNotification from '_cus_components/CusNotification';
 import { getAttachmentUrl, removeUploadFile, queryFileList, removeFile } from './utils';
 import './index.less';
 
 export default class UploadList extends React.Component {
   constructor(props) {
     super(props);
     const { onRef } = this.props;
     if (onRef) onRef(this);
 
     this.state = {
       fileList: [],
     };
   }

   componentDidMount() {
    const { bucketName, attachmentUUID, tenantId } = this.props;
    if (attachmentUUID) {
      queryFileList({
        tenantId,
        bucketName,
        attachmentUUID,
      }).then((fileList) => {
        if (getResponse(fileList)) {
          this.setState({
            fileList: this.changeFileList(fileList || []),
          });
        }
      });
    }
  }

  /**
   * 如果attachmentUUID变化 请求新UUID中的文件列表
   * @param {Object} nextProps 下个状态的props
   */
  //  eslint-disable-next-line
  async UNSAFE_componentWillReceiveProps(nextProps) {
    const { bucketName = DEFAULT_BUCKET_NAME, tenantId } = this.props;
    if (this.props.attachmentUUID !== nextProps.attachmentUUID) {
      let uuid = nextProps.attachmentUUID;
      if (!uuid) {
        const response = await queryUUID({ tenantId });
        if (response) {
          uuid = response.content;
        }
      }
      queryFileList({ tenantId, bucketName, attachmentUUID: uuid }).then((fileList) => {
        if (getResponse(fileList)) {
          this.setState({
            fileList: this.changeFileList(fileList),
            attachmentUUID: uuid,
          });
        }
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
       this.setState({
         saveAttachmentUUID: attachmentUUID
       })
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
                 creationDate: dayjs().format(getDateTimeFormat()),
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
     const { fileType, fileSize = 100 * 1024 * 1024, fileTypeErrorMessage } = this.props;
     if (fileType && fileType.indexOf(file.type) === -1) {
       file.status = 'error'; // eslint-disable-line
       const res = {
         message:
           fileTypeErrorMessage ||
           intl
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
     const { saveAttachmentUUID } = this.state;
     CusNotification.success({
       message: intl.get(`hzero.common.upload.status.success`).d('上传成功'),
     });
     if (onUploadSuccess) onUploadSuccess(file, fileList, saveAttachmentUUID);
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
       return fileList.map((res, index) => {
         return {
           uid: index + 1,
           name: res.fileName,
           creationDate: res.creationDate,
           url: getAttachmentUrl({url: res.fileUrl, bucketName, tenantId, bucketDirectory}),
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
 
     const { action: propAction, isEncrypt, setLoading = (e) => e } = this.props;
     const action = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/attachment/multipart`;
     const data = this.uploadData(file);
     data.append('file', file, file.name);
     setLoading(true);
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
     )
       .then((res) => {
         if (isString(res)) {
           // 成功
           onSuccess(res);
         } else if (!getResponse(res)) {
           onError(res);
           // 失败
         }
       })
       .finally(() => {
         setLoading();
       });
 
     return {
       abort: () => {
         controller.abort();
       },
     };
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

   @Bind()
   deleteFileList(file) {
    const {
      removeCallback,
      bucketName = 'spfm-comp',
      tenantId,
      attachmentUUID,
    } = this.props;
    const { fileList } = this.state;
    this.setState({
      modalLoading: true,
    });
    if (file.url) {
      const splitDatas = (file.url && file.url.split('=')) || [];
      const fileUrl = splitDatas[splitDatas.length - 1];
      return removeFile({
        tenantId,
        bucketName,
        attachmentUUID: attachmentUUID || stateAttachmentUUID,
        urls: [fileUrl],
      }).then((res) => {
        if (getResponse(res)) {
          CusNotification.success();
          this.setState({
            modalLoading: false,
            fileList: fileList.filter((list) => list.url !== file.url),
          });
          if (this.upload) {
            this.upload.setFileList(fileList.filter((list) => list.url !== file.url));
          }
          if (removeCallback) {
            removeCallback();
          }
          return true;
        } else {
          this.setState({
            modalLoading: false,
          });
          return false;
        }
      });
    } else {
      this.setState({
        modalLoading: false,
        fileList: fileList.filter((list) => list.uid !== file.uid),
      });
    }
   }

  // 新预览文件
  @Bind()
  handlePreviewFile = (item) => {
    const { bucketName } = this.props;
    const { OOS_HOST } = process.env;
    const onlineApi = `${OOS_HOST}?file=`;
    const urlEncode = encodeURIComponent(item.url);
    const url = `${onlineApi}${urlEncode}`;
    window.open(url);
  };
 
   render() {
     const {
       fileType,
       fileSize,
       single,
       text = intl.get('hzero.common.upload.txt').d('上传'),
       bucketName,
       onUploadSuccess,
       onUploadError,
       viewOnly = false,
       docType,
       storageCode, // 存储配置编码
       ...otherProps
     } = this.props;
     const { previewFileVisible, fileExt, previewUrl } = this.state;
     const accessToken = getAccessToken();
     const finalFileList = this.state.fileList || [];
     console.log('finalFileList', finalFileList);
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
         title: intl.get(`hzero.common.table.column.fileName`).d('附件名'),
         width: getCurrentLanguage() === 'zh_CN' ? (viewOnly ? 463 : 418) : viewOnly ? 398 : 330,
         dataIndex: 'name',
       },
       {
        title: intl.get(`hzero.common.uploadFile.view.uploadTime`).d('上传时间'),
        width: getCurrentLanguage() === 'zh_CN' ? (viewOnly ? 174 : 172) : viewOnly ? 175 : 233,
        dataIndex: 'creationDate',
      },
       {
         title: intl.get(`hzero.common.table.column.option`).d('操作'),
         width: getCurrentLanguage() === 'zh_CN' ? (viewOnly ? 105 : 150) : viewOnly ? 170 : 228,
         dataIndex: 'operation',
         render: (_, record) => {
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
                      //  onOk: () => this.deleteFile(record),
                       onOk: () => this.deleteFileList(record),
                     })
                   }
                 >
                   {intl.get(`hzero.common.button.delete`).d('删除')}
                 </CusButton>
               )}
               <CusButton
                 type="plain"
                 style={{ marginLeft: '16px' }}
                 onClick={() =>
                   this.handlePreviewFile(record)
                 }
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
           {/* <span>{intl.get(`hzero.common.upload.modal.title`).d('附件')}</span> */}
           <div className="cus-upload">
             <Upload
               name="file"
               accept={acceptFileType}
               fileList={finalFileList}
               data={this.uploadData}
               customRequest={this.handleAction}
               headers={headers}
               onChange={this.onChange}
               beforeUpload={this.beforeUpload}
               onRemove={this.onRemove}
              //  showUploadList={false}
              //  {...otherProps}
             >
               {!viewOnly && uploadButton}
             </Upload>
           </div>
         </div>
         <CusTable columns={columns} dataSource={finalFileList} />
       </>
     );
   }
 }
 