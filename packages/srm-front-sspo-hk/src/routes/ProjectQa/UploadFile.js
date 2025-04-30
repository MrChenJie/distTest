/**
 * UploadFile - 用于上传文件的处理
 * @date: 2020-08-17
 * @author: CQX <qingxin.chen@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

 import React, { useState, useEffect, forwardRef } from 'react';
 import { API_HOST, HZERO_FILE } from 'utils/config';
 import { SRM_SPUC } from '_utils/config';
 import { SRM_BID } from '@/common/config';
 import { getCurrentOrganizationId, getAccessToken } from 'utils/utils';
 import request from 'utils/request';
 import { Modal, Table, Tag } from 'hzero-ui';
 import { Upload } from 'choerodon-ui/pro';
 import { downloadFile } from 'services/api';
 import notification from 'utils/notification';
 import uuidv4 from 'uuid/v4';
import moment from 'moment';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

 // import { getFiles, deleteFileByKey } from '@/services/spfmService';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { isArray } from 'lodash';
 const organizationId = getCurrentOrganizationId();
 formatterCollections({
  code: ['bid.bidcommon'],
})
 async function getFiles(params) {
   return request(`${SRM_BID}/v1/${organizationId}/bid-qas/getFilesByUrls`, {
     method: 'POST',
     body: params,
   });
 }

 async function deleteFileByKey(params) {
   const { fileUrl } = params;
   return request(`${SRM_SPUC}/v1/${organizationId}/po-con-filess/deleteByKey?fileKey=${fileUrl}`, {
     method: 'DELETE',
   });
 }
 
 const commonPrompt = 'hzero.common';
 function UploadFile(props) {
   // 文件列表需要得到fileURL用于下载的时候使用
   const [visible, setVisible] = useState(false); // 是否打开modal框
   const [showFileList, setShowFileList] = useState([]);
   const {
     disabled, // 不能做上传的操作
     tableName,
     parentId,
     isContract,
     isFalse,
     updataList = (e) => e,
   } = props;
   useEffect(() => {
     if(isArray(props.value)) {
      setShowFileList(props.value || []);
     } else {
      setShowFileList([]);
     }
   }, [props.value]);
   useEffect(() => {
     // 查询数据
    //  if (tableName && isInteger(parentId)) {
       getFiles({
        fileUrl: props.value
       }).then((res) => {
         if (res) {
           if(isArray(res)) {
            updateShowFileList(res || []);
           } else {
            updateShowFileList([]);
           }
         }
       });
    //  }
   }, [parentId]);
   const openModal = () => {
    //  console.log('list',showFileList)
     setVisible(true);
   };
   const closeModal = () => {
     setVisible(false);
     updataList(showFileList)
   };
   const updateShowFileList = (list) => {
     const { onChange } = props;
     if (onChange) {
       onChange(list);
     } else {
       setShowFileList(list);
     }
   };
   const handlePreview = (record) => {
    const { OOS_HOST } = process.env;
    const onlineApi = `${OOS_HOST}?file=`;
    const api = encodeURIComponent(`${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download?access_token=${getAccessToken()}&bucketName=bidding&url=`)
    const urlEncode = encodeURIComponent(record.fileUrl)
    const url = `${onlineApi}${api}${urlEncode}`
    window.open(url)
   };
   const handleDownload = (record) => {
     const api = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}
     /files/download?url=${record.fileUrl}`;
     downloadFile({
       requestUrl: api,
       queryParams: [
         { name: 'bucketName', value: 'bidding' },
         { name: 'url', value: record.fileUrl },
       ],
     });
     return false;
   };
   const handleDelete = (record) => {
     Modal.confirm({
       title: intl
         .get(`hzero.common.uploadFile.deleteConfirm`, {
           name: record.fileName,
         })
         .d(`确定需要删除 {name} ？`),
       okText: intl.get('hzero.common.button.ok').d('确定'),
       cancelText: intl.get('hzero.common.button.cancel').d('取消'),
       onOk() {
         const { onDeleteSuccess } = props;
         if (onDeleteSuccess) {
           onDeleteSuccess();
         }
         if (record.isLocal) {
           // 当记录仅仅是当前页面的数据，将其直接从本地删除即可
           cleanCurrentPage(record);
         } else {
           // 当前记录在后端数据库中有数据，需要调用接口进行删除。
           // 此处用dataset无法处理，待日后对该概念熟悉之后再进行处理。
           deleteFileByKey({ fileKey: record.fileUrl }).then((res) => {
             if (!res.failed) {
               cleanCurrentPage(record);
             }
           });
         }
       },
     });
   };
   const cleanCurrentPage = (record) => {
     const newFileList = showFileList.filter((item) => {
       return item.fileUrl !== record.fileUrl;
     });
     updateShowFileList(newFileList);
   };
 
   // 获取文件的信息生成调用接口数据
   const getData = (file) => {
     return {
      
         fileName: file.name,
        //  fileKey: 'test',
        //  storageCode:'BID.FILEUPLOAD',
         bucketName: 'bidding',
         uuid: uuidv4(),
         organizationId
      
     };
   };
 
   const uploadProps = {
     headers: {
       Authorization: `bearer ${getAccessToken()}`,
     },
     action: `${HZERO_FILE}/v1/0/files/multipart`,
     accept: isContract
       ? ['.pdf']
       : ['.jpeg', '.png', '.gif', '.bmp', '.jpg', '.pdf', '.txt', '.doc', 'docx', '.xlsx', '.zip', '.rar', '.7z'],
     data: getData,
     multiple: true,
     onUploadSuccess: (res, info) => {
      const newDate = new Date();
      updateShowFileList([
        ...showFileList,
        {
          ...info,
          fileName: info.name,
          creationDate: moment(newDate).format(DEFAULT_DATETIME_FORMAT),
          fileUrl: res,
        },
      ]);
     
    },
    onUploadError: (res) => {
      notification.error({ message: JSON.parse(res).message });
    },
    showUploadBtn: true,
    showUploadList: false,
   };
 
   const columns = [
     {
       title: intl.get(`${commonPrompt}.uploadFile.view.fileName`).d('文件名'),
       key: 'fileName',
       dataIndex: 'fileName',
     },
     {
       title: intl.get(`${commonPrompt}.uploadFile.view.uploadTime`).d('上传时间'),
       key: 'creationDate',
       dataIndex: 'creationDate',
     },
     {
       title: intl.get('hzero.common.button.action').d('操作'),
       key: 'operate',
       dataIndex: 'operate',
       render: (text, record) => (
         <div>
           <a onClick={() => handlePreview(record)} style={{ marginRight: '5px' }}>
             {intl.get('bid.bidcommon.bid.button.Preview').d('预览')}
           </a>
           <a onClick={() => handleDownload(record)} style={{ marginRight: '5px' }}>
             {intl.get('hzero.common.button.download').d('下载')}
           </a>
           <a onClick={() => handleDelete(record)} disabled={disabled}>
             {intl.get('hzero.common.button.delete').d('删除')}
           </a>
         </div>
       ),
     },
   ];
 
   return (
     <>
       {isFalse && <a onClick={openModal}>
         {intl.get(`bid.bidcommon.view.button.viewattachments`).d('查看附件')}
       </a>}
       {!isFalse && <a onClick={openModal}>
         {disabled
           ? intl.get(`bid.bidcommon.view.title.chakanqajiyao`).d('查看答疑纪要')
           : intl.get(`bid.bidcommon.view.button.shangchuandayi`).d('上传答疑纪要')}
       </a>}
       {showFileList.length !== 0 && (
         <Tag
           color="#108ee9"
           closable={false}
           prefixCls="ant-tag"
           style={{ height: 'auto', lineHeight: '15px', marginLeft: '4px' }}
         >
           {showFileList.length}
         </Tag>
       )}
       <Modal
         title={
           disabled
             ? intl.get(`${commonPrompt}.uploadFile.view.checkFile`).d('查看文件')
             : intl.get(`bid.bidcommon.view.title.uploadattachmentQA`).d('上传文件')
         }
         visible={visible}
         onCancel={closeModal}
         footer={null}
       >
         <div>
           {!disabled && <Upload {...uploadProps} />}
           <Table
             rowKey="conFileId"
             style={{ marginTop: '15px' }}
             columns={columns}
             dataSource={showFileList}
           />
         </div>
       </Modal>
     </>
   );
 }

 export default forwardRef(UploadFile);
 