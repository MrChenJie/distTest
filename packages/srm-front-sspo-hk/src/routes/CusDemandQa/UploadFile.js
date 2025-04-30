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
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, getAccessToken, getCurrentLanguage } from 'utils/utils';
import request from 'utils/request';
import { Tag } from 'hzero-ui';
import { Tooltip, Upload } from 'antd';
import { downloadFile } from 'services/api';
import CusNotification from '_cus_components/CusNotification';
import CusModal from '_cus_components/CusModal';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import uuidv4 from 'uuid/v4';
import moment from 'moment';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import tipIcon from '@/assets/tips.svg';
import './index.less';

// import { getFiles, deleteFileByKey } from '@/services/spfmService';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { isArray } from 'lodash';
const organizationId = getCurrentOrganizationId();
formatterCollections({
  code: ['bid.bidcommon'],
});
async function getFiles(params) {
  return request(`${SRM_BID}/v1/${organizationId}/bid-qas/getFilesByUrls`, {
    method: 'POST',
    body: params,
  });
}

async function deleteFileByKey(params) {
  const { fileKey } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-con-filess/deleteByKey?fileKey=${fileKey}`, {
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
    onUploadSuccess = (e) => e,
    tip,
  } = props;
  useEffect(() => {
    if (isArray(props.value)) {
      setShowFileList(props.value || []);
    } else {
      setShowFileList
    }
  }, [props.value]);
  useEffect(() => {
    // 查询数据
    //  if (tableName && isInteger(parentId)) {
      if(parentId) {
        getFiles({
          fileUrl: props.value,
        }).then((res) => {
          if (isArray(res)) {
            updateShowFileList(res || []);
          } else {
            updateShowFileList([])
          }
        });
      }
    //  }
  }, [parentId]);
  const openModal = () => {
    //  console.log('list',showFileList)
    setVisible(true);
  };
  const closeModal = () => {
    setVisible(false);
    //  updataList(showFileList)
    onUploadSuccess(showFileList);
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
    const api = encodeURIComponent(
      `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download?access_token=${getAccessToken()}&bucketName=bidding&url=`
    );
    const urlEncode = encodeURIComponent(record.fileUrl);
    const url = `${onlineApi}${api}${urlEncode}`;
    window.open(url);
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
          deleteFileByKey({ fileKey: record.uid }).then((res) => {
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
      return item.uid !== record.uid;
    });
    updateShowFileList(newFileList);
  };

  // 获取文件的信息生成调用接口数据
  const getData = (file) => {
    return {
      fileName: file.name,
      fileKey: 'test',
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
    onSuccess: (res, info) => {
      updateShowFileList([
        ...showFileList,
        {
          ...info,
          fileName: info.name,
          creationDate: moment(new Date().getTime()).format(DEFAULT_DATETIME_FORMAT),
          fileUrl: res,
          isLocal: true
        },
      ]);
      CusNotification.success({
        message: intl.get(`${commonPrompt}.uploadFile.view.uploadSuccess`).d('上传成功'),
      });
    },
    onError: (res) => {
      CusNotification.error({ message: JSON.parse(res).message });
    },
    showUploadBtn: true,
    showUploadList: false,
  };

  const columns = [
    {
      title: intl.get(`${commonPrompt}.uploadFile.view.fileName`).d('文件名'),
      key: 'fileName',
      width: getCurrentLanguage() === 'zh_CN' ? 211 : 166,
      dataIndex: 'fileName',
      render: (_, record) => {
        return (
          <a onClick={() => handlePreview(record)}>{record.fileName}</a>
        )
      }
    },
    {
      title: intl.get(`${commonPrompt}.uploadFile.view.uploadTime`).d('上传时间'),
      key: 'creationDate',
      width: 160,
      dataIndex: 'creationDate',
    },
    {
      title: intl.get('hzero.common.button.action').d('操作'),
      key: 'operate',
      width: getCurrentLanguage() === 'zh_CN' ? (disabled ? 56 : 105) : (disabled ? 95: 149),
      dataIndex: 'operate',
      render: (_, record) => (
        <>
          <CusButton
            type="plain"
            onClick={() => handleDownload(record)}
            style={disabled ? null : { marginRight: '16px' }}
          >
            {intl.get('hzero.common.button.download').d('下载')}
          </CusButton>
          {!disabled && <CusButton type="plain" onClick={() => handleDelete(record)} disabled={disabled}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </CusButton>}
        </>
      ),
    },
  ];

  return (
    <>
      <div className="cus-upload-file-tag">
        <CusButton type="plain" onClick={openModal}>
          {disabled
            ? intl.get(`bid.bidcommon.view.button.view`).d('查看')
            : intl.get(`bid.bidcommon.view.button.ReFiUp`).d('上传')}
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
            <CusButton onClick={closeModal}>
              {intl.get('hzero.common.button.close').d('关闭')}
            </CusButton>
          </>
        }
      >
        <div>
          <div className="cus-upload-header">
            <span>
              {disabled
                ? intl.get(`bid.bidcommon.view.button.view`).d('查看')
                : intl.get(`bid.bidcommon.view.button.ReFiUp`).d('上传')}    
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
      </CusModal>
    </>
  );
}

export default forwardRef(UploadFile);
