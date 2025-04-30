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
import { getCurrentOrganizationId, getAccessToken, getCurrentLanguage } from 'utils/utils';
import { Tag, Tooltip } from 'antd';
import CusModal from '_cus_components/CusModal';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import { downloadFile } from 'services/api';
import { Upload } from 'choerodon-ui/pro';
// import notification from 'utils/notification';
import { isInteger, isArray } from 'lodash';
import request from 'utils/request';
// import { getFiles, deleteFileByKey } from '@/services/spfmService';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import styles from './index.less';

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
      title: intl.get(`${bidCommon}.view.title.document`).d('文件名'),
      width: 250,
      dataIndex: 'fileName',
      render: (text, record) => (
        <Tooltip title={record.fileName} overlayClassName="customize-tooltip" color={'#646A73'} >
          <span className={styles.fileFontColor}
            onClick={() => handlePreview(record)}
          >
            {record.fileName}
          </span>
        </Tooltip>
      )
    },
    {
      title: intl.get('bid.milestonecommon.view.title.operation').d('操作'),
      dataIndex: 'operator',
      width: getCurrentLanguage() === 'zh_CN' ? 41 : 60,
      render: (text, record) => (
        <div>
          {/* <a onClick={() => handlePreview(record)} style={{ marginRight: '5px' }}>
            {intl.get(`${bidCommon}.bid.button.Preview`).d('预览')}
          </a> */}
          {disabled && <a onClick={() => handleDownload(record)} style={{ marginRight: '5px' }}>
            {intl.get(`${bidCommon}.view.title.uploading`).d('下载')}
          </a>}
          {!disabled && <a onClick={() => handleDelete(record)} disabled={disabled}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </a>}
        </div>
      ),
    }
  ];

  return (
    <>
      <a onClick={openModal}>
        {disabled
          ? intl.get(`${bidCommon}.view.button.viewattachments`).d('查看附件')
          : intl.get(`${bidCommon}.view.title.uploaddocx`).d('上传文件')}
      </a>
      {fileSource.length !== 0 && (
        <Tag
          color="red"
          // closable={false}
          // prefixCls="ant-tag"
          className={styles.uploadFileTag}
        >
          <span style={{ color: '#F54A45', fontSize: '12px', fontWeight: 'normal' }} >{fileSource.length}</span>
        </Tag>
      )}
      <CusModal
        title={
          disabled
            ? intl.get(`${bidCommon}.view.title.viewdocument`).d('查看文件')
            : intl.get(`${bidCommon}.view.title.uploaddocx`).d('上传文件')
        }
        open={visible}
        closable={false}
        footer={
          <>
            <CusButton onClick={() => { closeModal() }} >
              {intl.get('hzero.common.button.cancel').d('取消')}
            </CusButton>
            <CusButton
              type="primary"
              onClick={() => { closeModal() }}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </CusButton>
          </>
        }
      >
        <div className={styles.tableLeftNone}>
          {isEdit && <Upload {...uploadProps} />}
          <CusTable
            // rowKey="parentId"
            columns={columns}
            dataSource={fileSource}
          />
        </div>
      </CusModal>
    </>
  );
}

export default forwardRef(UploadFile);

