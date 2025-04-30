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
import { getCurrentOrganizationId, getAccessToken, getCurrentLanguage } from 'utils/utils';
import request from 'utils/request';
import { Tag } from 'hzero-ui';
import { Tooltip, Upload } from 'antd';
import { downloadFile } from 'services/api';
import { isArray } from 'lodash';
import uuidv4 from 'uuid/v4';
// import { getFiles, deleteFileByKey } from '@/services/spfmService';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import CusNotification from '_cus_components/CusNotification';
import CusModal from '_cus_components/CusModal';
import CusTable from '_cus_components/CusTable';
import CusSpin from '_cus_components/CusSpin';
import CusButton from '_cus_components/CusButton';
import tipIcon from '@/assets/tips.svg';
import './index.less';
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
  const [uploading, setUploadingVisible] = useState(false);
  const {
    disabled, // 不能做上传的操作
    tableName,
    parentId,
    val,
    uploadFile = (e) => e,
    state,
    type,
    tip
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
    CusModal.confirm({
      content: intl
        .get(`hzero.common.uploadFile.deleteConfirm`, {
          name: record.fileName,
        })
        .d(`确定需要删除 {name} ？`),
      okText: intl.get('hzero.common.button.ok').d('确定'),
      okType: 'normal',
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
    accept: ['.jpeg', '.png', '.gif', '.bmp', '.jpg', '.pdf', '.txt', '.doc', '.docx', '.xlsx', '.xls', '.ppt', '.pptx', '.zip', '.rar', '.7z', '.dwg', '.dwf', '.dxf'],
    data: getData,
    beforeUpload: () => {
      setUploadingVisible(true);
    },
    onSuccess: (res, info) => {
      const newDate = new Date();
      if(res.failed) {
        CusNotification.error({ message: res.message });
      } else {
        updateShowFileList([
          ...showFileList,
          {
            ...info,
            fileName: info.name,
            creationDate: moment(newDate).format(DEFAULT_DATETIME_FORMAT),
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
      width: getCurrentLanguage() === 'zh_CN' ? 211 : 150,
      dataIndex: 'fileName',
      render: (_, record) => {
        return (
          <a onClick={() => handlePreview(record)}>{record.fileName}</a>
        )
      }
    },
    {
      title: intl.get(`${commonPrompt}.uploadFile.view.uploadTime`).d('上传时间'),
      key: 'orderSeq',
      dataIndex: 'orderSeq',
      width: 150,
      render: (_, record) => {
        return record.creationDate
      }
    },
    {
      title: intl.get('hzero.common.button.action').d('操作'),
      key: 'operator',
      width: ((state && state === 'published') || type) ? getCurrentLanguage() === 'zh_CN' ? 63 : 90 : getCurrentLanguage() === 'zh_CN' ? 107 : 167,
      dataIndex: 'operator',
      render: (_, record) => (
        <>
          <CusButton type="plain" onClick={() => handleDownload(record)} style={{ marginRight: !((state && state === 'published') || type) ? '16px' : '0px' }}>
            {intl.get('bid.bidcommon.view.title.uploading').d('下载')}
          </CusButton>
          {!((state && state === 'published') || type) && <CusButton type="plain" onClick={() => handleDelete(record)}>
            {intl.get('bid.bidcommon.view.button.delete').d('删除')}
          </CusButton>}
        </>
      ),
    },
  ];

  return (
    <>
      <div className="cus-upload-file-tag">
        <CusButton type="plain" onClick={openModal}>
          {((state && state === 'published') || type)
            ? intl.get(`${commonPrompt}.uploadFile.view.checkFile`).d('查看文件')
            : intl.get(`${commonPrompt}.uploadFile.view.uploadFile`).d('上传文件')}
        </CusButton>
        {showFileList.length !== 0 && <Tag>{showFileList.length}</Tag>}
        {tip && (
          <Tooltip title={tip} overlayClassName="customize-tooltip">
            <img src={tipIcon} style={{ width: '16px', marginLeft: '8px' }} alt="tip" />
          </Tooltip>
        )}
      </div>
      <CusModal
        visible={visible}
        onCancel={closeModal}
        bodyStyle={{
          marginTop: '0px',
        }}
        footer={
          <>
            <CusButton onClick={closeModal} disabled={uploading}>
              {intl.get('hzero.common.button.close').d('关闭')}
            </CusButton>
          </>
        }
        maskClosable={!uploading}
        destroyOnClose
      >
        <CusSpin spinning={uploading}>
          <div className="cus-upload-header">
            <span>
              {((state && state === 'published') || type)
                ? intl.get(`${commonPrompt}.uploadFile.view.checkFile`).d('查看文件')
                : intl.get(`${commonPrompt}.uploadFile.view.uploadFile`).d('上传文件')}
            </span>
            {!((state && state === 'published') || type) && (
              <div className="cus-upload">
                <Upload {...uploadProps}>
                  <CusButton mini type="primary">
                    {intl.get(`${commonPrompt}.uploadFile.selectFile`).d('上传')}
                  </CusButton>
                </Upload>
              </div>
            )}
          </div>
          <CusTable rowKey="conFileId" columns={columns} dataSource={showFileList} />
        </CusSpin>
      </CusModal>
    </>
  );
}

export default forwardRef(UploadFile);
