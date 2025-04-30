/**
 * UploadFile - 用于查看文件的处理
 * @date: 2022-05-14
 * @author: CQX <qingxin.chen@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useState, useEffect, forwardRef } from 'react';
import { API_HOST, HZERO_FILE } from 'utils/config';
import { SRM_BID } from '@/common/config';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId, getAccessToken } from 'utils/utils';
import { Modal, Table, Tag } from 'hzero-ui';
import { downloadFile } from 'services/api';
import { Upload } from 'choerodon-ui/pro';
// import notification from 'utils/notification';
import { isInteger, isArray } from 'lodash';
import request from 'utils/request';
// import { getFiles, deleteFileByKey } from '@/services/spfmService';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

formatterCollections({
    code: ['bid.bidcommon', 'bid.milestonecommon']
})
 
async function getFiles(params) {
  return request(`${SRM_BID}/v1/${getCurrentOrganizationId()}/bid-qas/getFilesByUrls`, {
    method: 'POST',
    body: params,
  });
}

function UploadFile(props) {
  // 文件列表需要得到fileURL用于下载的时候使用
  const [visible, setVisible] = useState(false); // 是否打开modal框
  const [fileSource, setShowFileList] = useState(props.value || []);
  const {
    parentId,
    tableName,
    isEdit,
    disabled
  } = props;
  useEffect(() => {
    setShowFileList(props.value || []);
  }, [props.value]);
  useEffect(() => {
    // 查询数据
    if (parentId) {
      getFiles({
        fileUrl: props.value,
      }).then((res) => {
        if (isArray(res)) {
          updateShowFileList(res || []);
        } else {
          updateShowFileList([]);
        }
      });
    }
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
  
  const handlePreview = (record) => {
    const { OOS_HOST } = process.env;
    const onlineApi = `${OOS_HOST}?file=`;
    const api = encodeURIComponent(
      `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download?access_token=${getAccessToken()}&bucketName=bidding&url=`
    );
    const urlEncode = encodeURIComponent(record.fileUrl);
    const url = `${onlineApi}${api}${urlEncode}`;
    window.open(url);
  };

  // 获取文件的信息生成调用接口数据
  const getData = (file) => {
    return {
      tenantId,
      bucketName: 'bidding',
      fileName: file.name,
      // storageCode:'BID.FILEUPLOAD',
    };
  };

  const uploadProps = {
    headers: {
      Authorization: getAccessToken(), // 'Bearer 67f89715-2143-4019-b54e-e988f553c561'
    },
    action: `${API_HOST}${HZERO_FILE}/v1/0/files/multipart`,
    accept: ['.jpeg', '.png', '.gif', '.bmp', '.jpg', '.pdf', '.txt', '.doc', 'docx', '.xlsx'],
    data: getData,
    onUploadSuccess: (res, info) => {
      updateShowFileList([
        ...showFileList,
        {
          ...info,
          fileName: info.name,
          isLocal: true,
          uploadDate: moment(info.lastModifiedDate).format(DEFAULT_DATETIME_FORMAT),
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
      title: intl.get(`bid.bidcommon.view.title.document`).d('文件'),
      key: 'fileName',
      dataIndex: 'fileName',
      width: 110,
      render: (text, record) => (
        <div>{record.fileName}</div>
      ),
    },
    {
      title: intl.get('bid.milestonecommon.view.title.operation').d('操作'),
      width: 110,
      render: (text, record) => (
        <div>
          <a onClick={() => handlePreview(record)} style={{ marginRight: '5px' }}>
            {intl.get('bid.bidcommon.bid.button.Preview').d('预览')}
          </a>
          <a onClick={() => handleDownload(record)} style={{ marginRight: '5px' }}>
            {intl.get('bid.bidcommon.view.title.uploading').d('下载')}
          </a>
          {/* <a onClick={() => handleDelete(record)} disabled={disabled}>
             {intl.get('hzero.common.button.delete').d('删除')}
           </a> */}
        </div>
      ),
    }
  ];

  return (
    <>
      <a onClick={openModal}>
        {disabled
          ? intl.get(`bid.bidcommon.view.title.viewdocument`).d('查看文件')
          : intl.get(`bid.bidcommon.view.title.uploaddocx`).d('上传文件')}
      </a>
      {fileSource.length !== 0 && (
        <Tag
          color="#108ee9"
          // closable={false}
          prefixCls="ant-tag"
          style={{ height: 'auto', lineHeight: '15px', marginLeft: '4px' }}
        >
          {fileSource.length}
        </Tag>
      )}
      <Modal
        title={
          disabled
            ? intl.get(`bid.bidcommon.view.title.viewdocument`).d('查看文件')
            : intl.get(`bid.bidcommon.view.title.uploaddocx`).d('上传文件')
        }
        visible={visible}
        onCancel={closeModal}
        width="60%"
        footer={null}
      >
        <div>
          {isEdit && <Upload {...uploadProps} />}
          <Table
            // rowKey="parentId"
            style={{ marginTop: '15px' }}
            columns={columns}
            dataSource={fileSource}
          />
        </div>
      </Modal>
    </>
  );
}

export default forwardRef(UploadFile);

