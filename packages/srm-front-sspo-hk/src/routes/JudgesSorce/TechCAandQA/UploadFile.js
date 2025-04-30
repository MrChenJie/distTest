/**
 * UploadFile - 用于查看文件的处理
 * @date: 2022-05-14
 * @author: CQX <qingxin.chen@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

 import React, { useState, useEffect, forwardRef } from 'react';
 import { HZERO_FILE } from 'utils/config';
 // import { SRM_BID } from '@/common/config';
 // import { getAccessToken } from 'utils/utils';
 import { Modal, Table, Tag } from 'hzero-ui';
 import { downloadFile } from 'services/api';
 // import notification from 'utils/notification';
// import { isInteger } from 'lodash';
// import { getFiles, deleteFileByKey } from '@/services/spfmService';
import intl from 'utils/intl';
 
//  async function getFiles(params) {
//   return request(`${SRM_BID}/v1/bid-ten-busi-filess/look`, {
//     method: 'GET',
//     query: params,
//   });
// }
 
 const commonPrompt = 'hzero.common';
 function UploadFile(props) {
   // 文件列表需要得到fileURL用于下载的时候使用
   const [visible, setVisible] = useState(false); // 是否打开modal框
   const [fileSource, setShowFileList] = useState(props.value || []);
   const {
     parentId,
   } = props;
   useEffect(() => {
     setShowFileList(props.value || []);
   }, [props.value]);
   useEffect(() => {
     updateShowFileList(props.value || [])
   }, [parentId]);
   const openModal = () => {
     setVisible(true);
   };
   const closeModal = () => {
     setVisible(false);
   };
   const updateShowFileList = (list) => {
    //  console.log('list',list)
     const { onChange } = props;
     if (onChange) {
       onChange(list);
     } else {
       setShowFileList(list);
     }
   };
 
   const handleDownload = (record) => {
     const api = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}
      /files/download?url=${record.fileUrl}`;
     downloadFile({
       requestUrl: api,
       queryParams: [
         { name: 'bucketName', value: record.bucketName },
         { name: 'url', value: record.fileUrl },
       ],
     });
     return false;
   };
 
   const columns = [
     {
       title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyNum`).d('文件'),
       key: 'fileName',
       dataIndex: 'fileName',
       width: 110,
       render: (text, record) => (
         <div>{record.fileName}</div>
       ),
     },
     {
       title: intl.get('view.title.operation').d('操作'),
       width: 110,
       render: (text, record) => (
         <div>
           <a onClick={() => handleDownload(record)} style={{ marginRight: '5px' }}>
             {intl.get('view.button.download').d('下载')}
           </a>
         </div>
       ),
     }
   ];
 
   return (
     <>
       <a onClick={openModal}>{ intl.get(`${commonPrompt}.uploadFile.view.checkFile`).d('查看文件') }</a>
       {fileSource.length !== 0 && (
         <Tag
           color="#108ee9"
           closable={false}
           prefixCls="ant-tag"
           style={{ height: 'auto', lineHeight: '15px', marginLeft: '4px' }}
         >
           {fileSource.length}
         </Tag>
       )}
       <Modal
         title={ intl.get(`${commonPrompt}.uploadFile.view.checkFile`).d('查看文件') }
         visible={visible}
         onCancel={closeModal}
         width="30%"
         footer={null}
       >
         <Table
           // rowKey="parentId"
           style={{ marginTop: '15px' }}
           columns={columns}
           dataSource={fileSource}
         />
       </Modal>
     </>
   );
 }
 
 export default forwardRef(UploadFile);
 
