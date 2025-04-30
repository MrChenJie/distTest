/**
 * UploadFile - 用于上传文件的处理
 * @date: 2020-08-17
 * @author: CQX <qingxin.chen@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useState, useEffect, forwardRef } from 'react';
import { HZERO_FILE } from 'utils/config';
import moment from 'moment';
import { SRM_BID } from '@/common/config';
import { getCurrentOrganizationId, getAccessToken } from 'utils/utils';
import request from 'utils/request';
import { Modal, Table, Button, Tag } from 'hzero-ui';
import { Upload } from 'choerodon-ui/pro';
import { downloadFile } from 'services/api';
import notification from 'utils/notification';
import { isArray } from 'lodash';
import uuidv4 from 'uuid/v4';
// import { getFiles, deleteFileByKey } from '@/services/spfmService';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
const organizationId = getCurrentOrganizationId();

async function getFiles(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/getFilesByUrls`, {
    method: 'POST',
    body: params,
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
    val,
    uploadFile = (e) => e,
    state,
    type
  } = props;
  useEffect(() => {
    if(isArray(props.value)) {
      setShowFileList(props.value);
    }
  }, [props.value]);
  useEffect(() => {
    // 查询数据
    //  if (tableName && isInteger(parentId)) {
    if (parentId) {
      getFiles({
        fileUrl: val
      }).then((res) => {
        if (res) {
          updateShowFileList(res || []);
        }
      });
    }
  }, [val]);
  const openModal = () => {
    setVisible(true);
  };
  const closeModal = () => {
    setVisible(false);
    uploadFile(showFileList)
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
        cleanCurrentPage(record);
      },
    });
  };
  const cleanCurrentPage = (record) => {
    const newFileList = showFileList.filter((item) => {
      return item !== record;
    });
    updateShowFileList(newFileList);
    setShowFileList(newFileList)
    uploadFile(newFileList)
  };

  // 获取文件的信息生成调用接口数据
  const getData = (file) => {
    return {
      fileName: file.name,
      // fileKey: 'test',
      //  storageCode:'BID.FILEUPLOAD',
      bucketName: 'bidding',
      uuid: uuidv4(),
    };
  };

  const uploadProps = {
    headers: {
      Authorization: `bearer ${getAccessToken()}`,
    },
    action: `${HZERO_FILE}/v1/0/files/multipart`,
    accept: ['.jpeg', '.png', '.gif', '.bmp', '.jpg', '.pdf', '.txt', '.doc', '.docx', '.xlsx', '.ppt', '.pptx'],
    data: getData,
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
            {intl.get('bid.bidcommon.view.title.uploading').d('下载')}
          </a>
          <a onClick={() => handleDelete(record)} disabled={(state && state === 'published') || type}>
            {intl.get('bid.bidcommon.view.button.delete').d('删除')}
          </a>
        </div>
      ),
    },
  ];

  return (
    <>
      <a onClick={openModal}>
        {((state && state === 'published') || type)
          ? intl.get(`${commonPrompt}.uploadFile.view.checkFile`).d('查看文件')
          : intl.get(`${commonPrompt}.uploadFile.view.uploadFile`).d('上传文件')}
      </a>
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
          ((state && state === 'published') || type)
            ? intl.get(`${commonPrompt}.uploadFile.view.checkFile`).d('查看文件')
            : intl.get(`${commonPrompt}.uploadFile.view.uploadFile`).d('上传文件')
        }
        visible={visible}
        onCancel={closeModal}
        footer={null}
      >
        <div>
          {!((state && state === 'published') || type) && <Upload {...uploadProps} />}
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
