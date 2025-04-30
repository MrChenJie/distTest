/**
 * UploadFile - 用于查看文件的处理
 * @date: 2022-05-14
 * @author: CQX <qingxin.chen@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useState, useEffect, forwardRef } from 'react';
import { HZERO_FILE } from 'utils/config';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId, getAccessToken, getCurrentLanguage } from 'utils/utils';
import { Tooltip, Upload, Tag } from 'antd';
import { downloadFile } from 'services/api';
import CusNotification from '_cus_components/CusNotification';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import CusModal from '_cus_components/CusModal';
import CusTable from '_cus_components/CusTable';
import CusSpin from '_cus_components/CusSpin';
import CusButton from '_cus_components/CusButton';
import tipIcon from '@/assets/tips.svg';
import './index.less';

formatterCollections({
  code: ['bid.bidcommon', 'bid.milestonecommon']
})


const commonPrompt = 'hzero.common';

function UploadFile(props) {
  // 文件列表需要得到fileURL用于下载的时候使用
  const [visible, setVisible] = useState(false); // 是否打开modal框
  const [showFileList, setShowFileList] = useState(props.fileSource|| []);
  const [uploading, setUploading] = useState(false);
  const {
    parentId,
    tableName,
    disabled,
    tip,
    onUploadList = (e) => e,
    uploadName,
    readyName,
  } = props;
  const openModal = () => {
    setVisible(true);
  };
  const closeModal = () => {
    setShowFileList(props.fileSource|| []);
    setVisible(false);
  };
  const uploadModal = () => {
    let url
    showFileList.forEach((item, index )=> {
      if(index == 0) {
          url = item.fileUrl
      } else {
          url = url  + ',' + item.fileUrl
      }
      
    });
    console.log('showFileList', showFileList, url)
    onUploadList(url)
    setVisible(false);
  }
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
  const handleDelete = (record) => {
    const newShowList = showFileList.filter(ite => ite.fileUrl !== record.fileUrl)
    updateShowFileList(newShowList)
  }
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
      bucketName: 'bidding',
      tenantId: getCurrentOrganizationId(),
      fileName: file.name,
    };
  };

  const uploadProps = {
    headers: {
      Authorization: getAccessToken(), // 'Bearer 67f89715-2143-4019-b54e-e988f553c561'
    },
    action: `${HZERO_FILE}/v1/0/files/multipart`,
    accept: ['.jpeg', '.png', '.gif', '.bmp', '.jpg', '.pdf', '.txt', '.doc', '.docx', '.xlsx', '.xls', '.zip', '.rar', '.ppt', '.pptx'],
    data: getData,
    beforeUpload: () => {
      setUploading(true);
    },
    onSuccess: (res, info) => {
      console.log('res', res, info)
      if(res.failed) {
        CusNotification.error({ message: res.message });
      } else {
      updateShowFileList([
        ...showFileList,
        {
          ...info,
          fileName: info.name,
          fileType: info.type,
          fileSize: info.size,
          isLocal: true,
          creationDate: moment().format(DEFAULT_DATETIME_FORMAT),
          fileUrl: res,
        },
      ]);
      CusNotification.success({
        message: intl.get(`${commonPrompt}.uploadFile.view.uploadSuccess`).d('上传成功'),
      });
    }
      setUploading(false);
    },
    onError: (res) => {
      CusNotification.error({ message: res.message });
      setUploading(false);
    },
    showUploadBtn: true,
    showUploadList: false,
  };

  const columns = [
    {
      title: intl.get(`bid.bidcommon.view.title.document`).d('文件'),
      key: 'fileName',
      dataIndex: 'fileName',
      width: getCurrentLanguage() === 'zh_CN' ? 370 : 317,
      render: (_, record) => {
        return <a onClick={() => handlePreview(record)}>{record.fileName}</a>;
      },
    },
    {
      title: intl.get(`hzero.common.uploadFile.view.uploadTime`).d('上传时间'),
      key: 'creationDate',
      dataIndex: 'creationDate',
      width: 172,
      render: (_, record) => {
        return <div>{record.creationDate}</div>;
      },
    },
    {
      title: intl.get('bid.milestonecommon.view.title.operation').d('操作'),
      key: 'operator',
      dataIndex: 'operator',
      width: getCurrentLanguage() === 'zh_CN' ? 105 : 163,
      render: (_, record) => (
        <>
          <CusButton
            type="plain"
            onClick={() => handleDownload(record)}
            style={{ marginRight: '16px' }}
          >
            {intl.get('hzero.common.button.download').d('下载')}
          </CusButton>
          <CusButton type="plain" onClick={() => handleDelete(record)}>
            {intl.get('bid.bidcommon.view.button.delete').d('删除')}
          </CusButton>
        </>
      ),
    },
  ];

  return (
    <>
      <div className="cus-upload-file-tag">
        <CusButton type="plain" onClick={openModal}>
          {disabled
            ? readyName ? readyName : intl.get(`${commonPrompt}.uploadFile.view.checkFile`).d('查看文件')
            : uploadName ? uploadName : intl.get(`${commonPrompt}.uploadFile.view.uploadFile`).d('上传文件')}
        </CusButton>
        {showFileList.length !== 0 && <Tag style={{marginLeft: '4px' }}>{showFileList.length}</Tag>}
        {tip && (
          <Tooltip title={tip} overlayClassName="customize-tooltip">
            <img src={tipIcon} style={{ width: '16px', marginLeft: '8px' }} alt="tip" />
          </Tooltip>
        )}
      </div>
      <CusModal
        visible={visible}
        onCancel={closeModal}
        footer={
          <>
            <CusButton onClick={closeModal} disabled={uploading}>
            {intl.get(`bid.bidcommon.view.button.quxiaocancel`).d('取消')}
            </CusButton>
            <CusButton onClick={uploadModal} type='primary' disabled={uploading}>
            {intl.get(`hzero.common.cusModal.button.confirm`).d('确认')}
            </CusButton>
          </>
        }
        maskClosable={!uploading}
        destroyOnClose
      >
        <CusSpin spinning={uploading}>
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
        </CusSpin>
      </CusModal>
    </>
  );
}

export default forwardRef(UploadFile);

