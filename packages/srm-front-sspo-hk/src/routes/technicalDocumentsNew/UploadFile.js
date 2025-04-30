/**
 * UploadFile - 用于查看文件的处理
 * @date: 2022-05-14
 * @author: CQX <qingxin.chen@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useState, useEffect, forwardRef } from 'react';
import { HZERO_FILE } from 'utils/config';
import { SRM_BID } from '@/common/config';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId, getAccessToken, getCurrentLanguage } from 'utils/utils';
import { Tag } from 'hzero-ui';
import CusModal from '_cus_components/CusModal';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import CusSpin from '_cus_components/CusSpin';
import { downloadFile } from 'services/api';
import { Upload } from 'antd';
import { isArray } from 'lodash';
import request from 'utils/request';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import './index.less';
import CusNotification from '_cus_components/CusNotification';

const bidCommon = 'bid.bidcommon';
formatterCollections({
  code: ['bid.bidcommon', 'bid.milestonecommon']
})

async function getFiles(params) {
  return request(`${SRM_BID}/v1/${getCurrentOrganizationId()}/bid-qas/getFilesByUrls`, {
    method: 'POST',
    body: params,
  });
}

const commonPrompt = 'hzero.common';

function UploadFile(props) {
  // 文件列表需要得到fileURL用于下载的时候使用
  const [visible, setVisible] = useState(false); // 是否打开modal框
  const [fileSource, setShowFileList] = useState(props.value || []);
  const [uploading, setUploadingVisible] = useState(false);
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
    // window.open(url);

    const fA = record.fileName.split('.');
    const fileExt = fA && fA[fA.length - 1];
    if (fileExt.toLowerCase() === 'docx') {
      if (record.fileSize === 0) {
        CusNotification.warning({
          message: intl.get('hzero.common.cannot.preview.empty.file').d('不能预览空白文件'),
        });
        return false;
      } else if (record.fileSize > 0) {
        window.open(url);
      } else {
        console.log('无法获取文件大小');
      }
    } else {
      window.open(url);
    }
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
    action: `${HZERO_FILE}/v1/0/files/multipart`,
    accept: ['.jpeg', '.png', '.gif', '.bmp', '.jpg', '.pdf', '.txt', '.doc', 'docx', '.xlsx'],
    data: getData,
    beforeUpload: () => {
      setUploadingVisible(true);
    },
    onSuccess: (res, info) => {
      if(res.failed) {
        CusNotification.error({ message: res.message });
      } else {
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
        CusNotification.success({
          message: intl.get(`${commonPrompt}.uploadFile.view.uploadSuccess`).d('上传成功'),
        });
      }
      setUploadingVisible(false);
    },
    onError: (res) => {
      CusNotification.error({ message: JSON.parse(res).message });
      setUploadingVisible(false);
    },
    showUploadBtn: true,
    showUploadList: false,
  };

  const columns = [
    {
      title: intl.get(`${commonPrompt}.uploadFile.view.fileName`).d('文件名'),
      key: 'fileName',
      dataIndex: 'fileName',
      width: getCurrentLanguage() === 'zh_CN' ? 205 : 160,
      render: (_, record) => (
        <a onClick={() => handlePreview(record)}>
          {record.fileName}
        </a>
      )
    },
    {
      title: intl.get(`${commonPrompt}.uploadFile.view.uploadTime`).d('上传时间'),
      key: 'orderSeq',
      dataIndex: 'orderSeq',
      width: 155,
      render: (_, record) => {
        return record.creationDate
      }
    },
    {
      title: intl.get('hzero.common.button.action').d('操作'),
      dataIndex: 'operator',
      width: getCurrentLanguage() === 'zh_CN' ? 63 : 90,
      render: (_, record) => (
        <>
          {disabled && <CusButton type="plain" onClick={() => handleDownload(record)}>
            {intl.get(`${bidCommon}.view.title.uploading`).d('下载')}
          </CusButton>}
          {!disabled && <CusButton type="plain" onClick={() => handleDelete(record)} disabled={disabled}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </CusButton>}
        </>
      ),
    }
  ];

  return (
    <>
      <div className="cus-upload-file-tag">
        <CusButton type="plain" onClick={openModal}>
          {disabled
            ? intl.get(`${bidCommon}.view.button.view`).d('查看')
            : intl.get(`${bidCommon}.view.button.ReFiUp`).d('上传')}
        </CusButton>
        {fileSource.length !== 0 && <Tag>{fileSource.length}</Tag>}
        <CusModal
          visible={visible}
          onCancel={closeModal}
          footer={
            <>
              <CusButton onClick={() => { closeModal() }}>
                {intl.get('hzero.common.button.close').d('关闭')}
              </CusButton>
            </>
          }
          destroyOnClose
          maskClosable={!uploading}
        >
          <CusSpin spinning={uploading}>
            <div className="cus-upload-header">
              <span>
                {!isEdit
                  ? intl.get(`${bidCommon}.view.button.view`).d('查看')
                  : intl.get(`${bidCommon}.view.button.ReFiUp`).d('上传')}
              </span>
              {isEdit && (
                <div className="cus-upload">
                  <Upload {...uploadProps}>
                    <CusButton mini type="primary">
                      {intl.get(`${commonPrompt}.uploadFile.selectFile`).d('上传')}
                    </CusButton>
                  </Upload>
                </div>
              )}
            </div>
            <CusTable rowKey="conFileId" columns={columns} dataSource={fileSource} />
          </CusSpin>
        </CusModal>
      </div>
    </>
  );
}

export default forwardRef(UploadFile);