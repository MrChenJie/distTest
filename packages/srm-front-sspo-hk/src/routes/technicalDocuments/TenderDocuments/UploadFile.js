/**
 * UploadFile - 用于上传文件的处理
 * @date: 2020-08-17
 * @author: CQX <qingxin.chen@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useState, useEffect, forwardRef } from 'react';
import { HZERO_FILE } from 'utils/config';
import { SRM_BID } from '@/common/config';
import { getCurrentOrganizationId, getAccessToken } from 'utils/utils';
import request from 'utils/request';
import { Modal, Table, Tag } from 'hzero-ui';
import { Upload } from 'choerodon-ui/pro';
import { downloadFile } from 'services/api';
import notification from 'utils/notification';
import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

const organizationId = getCurrentOrganizationId();
formatterCollections({
  code: ['bid.bidcommon', 'bid.milestonecommon']
})
async function getFiles(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/getFilesByUrls`, {
    method: 'POST',
    body: params,
  });
}

//  async function deleteFileByKey(params) {
//    const { fileKey } = params;
//    return request(`${SRM_SPUC}/v1/${organizationId}/po-con-filess/deleteByKey?fileKey=${fileKey}`, {
//      method: 'DELETE',
//    });
//  }

const commonPrompt = 'hzero.common';
function UploadFile(props) {
  // 文件列表需要得到fileURL用于下载的时候使用
  const [visible, setVisible] = useState(false); // 是否打开modal框
  const [obj, setObj] = useState([props.parentId])
  const [length, setLength] = useState(0);
  
  const [showFileList, setShowFileList] = useState([]);
  // debugger;
  const {
    disabled, // 不能做上传的操作
    tableName,
    index,
    isContract,
    dataSource,
    parentId
  } = props;
  // let dataSource =  props.dataSource
  // let newList = []
  useEffect(() => {
    setShowFileList(showFileList || []);
  }, [props.value]);
  useEffect(() => {
  if (index === 0) {
  let newTenFileUrls= ''
  let newData = []
  dataSource.map(item => {
    if (item.tenFileUrls) {
      newTenFileUrls = newTenFileUrls+','+item.tenFileUrls
    }
  })
  getFiles({
    fileUrl: newTenFileUrls,
  }).then((res) => {

    if (res) {
      
      
      newData.push(...res)

      setLength(newData.length || 0)
      
    }
  });
  updateShowFileList(newData);

}
 if (index === 1) {
  let newTenFileUrls= ''
  let newData = []
    dataSource.map(item => {
      if (item.busiFileUrls) {
        newTenFileUrls = newTenFileUrls+','+item.busiFileUrls
      }
      
    })
    getFiles({
      fileUrl: newTenFileUrls,
    }).then((res) => {
  
      if (res) {
        
        
        newData.push(...res)
  
        setLength(newData.length || 0)
        
      }
    });
    updateShowFileList(newData);

  } 

  if (index === 2) {
    let newTenFileUrls= ''
    let newData = []
    dataSource.map(item => {
      if (item.answerFileUrls) {
        newTenFileUrls = newTenFileUrls+','+item.answerFileUrls
      }
     
    }) 
    getFiles({
      fileUrl: newTenFileUrls,
    }).then((res) => {
  
      if (res) {
        
        
        newData.push(...res)
  
        setLength(newData.length || 0)
        
      }
    });
    updateShowFileList(newData);
         

    }
  }, [obj]);
  //  useEffect(() => {

  //    setShowFileList(props.value || []);
  //  }, [index]);
//   useEffect(() => {
//     // debugger
//     //  查询数据
//     // console.log(index,index === 0)d
//     //  if (tableName && isInteger(parentId)) {
//   //  if (index === 0) {
   
//       dataSource.map(item => {
//         console.log(item.tenFileUrls)
//         if (item.tenFileUrls) {
//           getFiles({
//             fileUrl: item.tenFileUrls,
//             // organizationId: organizationId
//           }).then((res) => {
//             if (res) {
              
//               res.map(i=>{
//                 newList.push({...i, name:item.supplierName})
//               })
//             }
//           });
//         }
//       })
//       updateShowFileList(newList);
//       // console.log('length',newList.length)
//     setLength(newList.length || 0)
//     // const newLength = newList.length || 0

//   // }
// //  if (index === 1) {
// //     dataSource.map(item => {
// //       if (item.busiFileUrls) {
// //         getFiles({
// //           fileUrl: item.busiFileUrls,
// //           organizationId: organizationId
// //         }).then((res) => {
// //           if (res) {
// //             res.map(i=>{
// //               newList.push({...i, name:item.supplierName})
// //             })
// //           }
// //         });
// //       }
// //     })
// //     updateShowFileList(newList);
// //     setLength(newList.length || 0)


// //   } 
//   // if (index === 2) {
//   //   dataSource.map(item => {
//   //     if (item.answerFileUrls) {
//   //       getFiles({
//   //         fileUrl: item.answerFileUrls,
//   //         organizationId: organizationId
//   //       }).then((res) => {
//   //         if (res) {
//   //           res.map(i=>{
//   //             newList.push({...i, name:item.supplierName})
//   //           })
//   //         }
//   //       });
//   //     }
//   //   })
//   // // }
//   // updateShowFileList(newList);
//   // setLength(newList.length || 0)



//   //    }
//    }, [index]);
   console.log('new',showFileList)
  const openModal = () => {
    setVisible(true);
    // setObj([parentId])
    // onShowList();
  };
  const closeModal = () => {
    setVisible(false);
  };
  const updateShowFileList = (list) => {
    const { onChange } = props;
    if (onChange) {
      onChange(list);
    } else {
      setShowFileList(list);
    }
  };
  const handleDownload = (record) => {
    const api = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download?url=${record.fileUrl}`;
    downloadFile({
      requestUrl: api,
      queryParams: [
        { name: 'bucketName', value: 'bidding' },
        { name: 'url', value: record.fileUrl },
      ],
    });
    return false;
  };

 
   const openShowUpload=(record)=> {
    const { OOS_HOST } = process.env;
    const onlineApi = `${OOS_HOST}?file=`;
    const api = encodeURIComponent(`${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download?access_token=${getAccessToken()}&bucketName=bidding&url=`)
    const urlEncode = encodeURIComponent(record.fileUrl)
    const url = `${onlineApi}${api}${urlEncode}`
    console.log(api)
    window.open(url)
  }
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
          deleteFileByKey({ fileKey: record.fileKey }).then((res) => {
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
      return item.fileKey !== record.fileKey;
    });
    updateShowFileList(newFileList);
  };

  // 获取文件的信息生成调用接口数据
  const getData = (file) => {
    return {
      paramsJsonStr: JSON.stringify({
        fileName: file.name,
        fileKey: 'test',
        uuid: uuidv4(),
      }),
    };
  };

  const uploadProps = {
    headers: {
      Authorization: `bearer ${getAccessToken()}`,
    },
    action: `/v1/${getCurrentOrganizationId()}/po-con-filess/upload`,
    accept: isContract
      ? ['.pdf']
      : ['.jpeg', '.png', '.gif', '.bmp', '.jpg', '.pdf', '.txt', '.doc', 'docx', '.xlsx'],
    data: getData,
    onUploadSuccess: (res) => {
      const dto = JSON.parse(res);
      if (dto.failed) {
        notification.error({ message: dto.message });
      } else {
        updateShowFileList([...showFileList, { ...dto, isLocal: true, tableName }]);
        const { onUploadSuccess } = props;
        if (onUploadSuccess) {
          onUploadSuccess(dto);
        }
        notification.success({
          message: intl.get(`${commonPrompt}.uploadFile.view.uploadSuccess`).d('上传成功'),
        });
      }
    },
    onUploadError: (res) => {
      notification.error({ message: JSON.parse(res).message });
    },
    showUploadBtn: true,
    showUploadList: false,
  };

  const columns = [
    {
      title: intl.get(`bid.bidcommon.view.title.suppliername`).d('供应商名称'),
      key: 'realName',
      dataIndex: 'realName',
    },
    {
      title: intl.get(`${commonPrompt}.uploadFile.view.fileName`).d('文件名称'),
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
      render: (_, record) => (
        <div>
          <a onClick={() => openShowUpload(record)} style={{ marginRight: '5px' }}>
            {intl.get('bid.bidcommon.bid.button.Preview').d('预览')}
          </a>
          <a onClick={() => handleDownload(record)} style={{ marginRight: '5px' }}>
            {intl.get('hzero.common.button.download').d('下载')}
          </a>
        </div>
      ),
    },
  ];
  return (
    <>
      <a onClick={openModal}>
        {disabled
          ? intl.get(`${commonPrompt}.uploadFile.view.checkFile`).d('查看文件')
          : intl.get(`${commonPrompt}.uploadFile.view.uploadFile`).d('上传文件')}
      </a>
      {length !== 0 && (
        <Tag
          color="#108ee9"
          closable={false}
          prefixCls="ant-tag"
          style={{ height: 'auto', lineHeight: '15px', marginLeft: '4px' }}
        >
          {length}
        </Tag>
      )}
      <Modal
        title={
          disabled
            ? intl.get(`${commonPrompt}.uploadFile.view.checkFile`).d('查看文件')
            : intl.get(`${commonPrompt}.uploadFile.view.uploadFile`).d('上传文件')
        }
        visible={visible}
        onCancel={closeModal}
        width="60%"
        footer={null}
      >
        <div>
          {/* {!disabled && <Upload {...uploadProps} />} */}
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
