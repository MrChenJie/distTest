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
// import { isInteger } from 'lodash';
// import { getFiles, deleteFileByKey } from '@/services/spfmService';
import intl from 'utils/intl';

// const organizationId = getCurrentOrganizationId();

async function getFiles(params) {
  return request(`${SRM_BID}/v1/bid-ten-busi-filess/look`, {
    method: 'GET',
    query: params,
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
  const [fileSource, setShowFileList] = useState(props.value || []);
  // debugger;
  const {
    disabled, // 不能做上传的操作
    tableName,
    parentId,
    isContract,
  } = props;
  useEffect(() => {
    setShowFileList(props.value || []);
  }, [props.value]);
  useEffect(() => {
    // 查询数据
    //  if (tableName && isInteger(parentId)) {
      if (parentId) {
    getFiles({
      fileUrls: props.value
    }).then((res) => {
      if (res) {
        updateShowFileList(res.content || []);
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
        { name: 'bucketName', value: 'purchase-con-files' },
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
    const newFileList = fileSource.filter((item) => {
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
        updateShowFileList([...fileSource, { ...dto, isLocal: true, tableName }]);
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
      title: intl.get(`ssrc.bidHall.model.bidHall.supplierCompanyNum`).d('轮次'),
      key: 'round',
      dataIndex: 'round',
      render: (text, row) => {
        return (
          <p>
            {intl.get('bid.bidcommon.view.title.the').d('第')}
            {row.round}
            {intl.get('bid.bidcommon.view.title.turn').d('轮')}
          </p>
        )
      }
    },
    {
      title: intl.get(`bid.bidcommon.bid.title.TechnicalDocuments`).d('技术文件'),
      key: 'tenFileUrls',
      dataIndex: 'tenFileUrls',
      render: (text, record) => (
        <div>
          <a onClick={() => handleDownload(record)} style={{ marginRight: '5px' }}>
            {intl.get('hzero.common.button.download').d(`${tenFileUrls}`)}
          </a>
        </div>
      ),
    },
    {
      title: intl.get(`bid.bidcommon.bid.title.BusinessDocuments`).d('商务文件'),
      key: 'busiFileUrls',
      dataIndex: 'busiFileUrls',
      render: (text, record) => (
        <div>
          <a onClick={() => handleDownload(record)} style={{ marginRight: '5px' }}>
            {intl.get('hzero.common.button.download').d(`${busiFileUrls}`)}
          </a>
        </div>
      ),
    }, ,
    {
      title: intl.get(`bid.bidcommon.bid.title.TechnicalAndCommercialResponseDocuments`).d('技术、商务应答表'),
      key: 'answerFileUrls',
      dataIndex: 'answerFileUrls',
      render: (text, record) => (
        <div>
          <a onClick={() => handleDownload(record)} style={{ marginRight: '5px' }}>
            {intl.get('hzero.common.button.download').d(`${answerFileUrls}`)}
          </a>
        </div>
      ),
    },
    // {
    //   title: intl.get('hzero.common.button.action').d('操作'),
    //   key: 'operate',
    //   dataIndex: 'operate',
    //   render: (text, record) => (
    //     <div>
    //       <a onClick={() => handleDownload(record)} style={{ marginRight: '5px' }}>
    //         {intl.get('hzero.common.button.download').d('下载')}
    //       </a>
    //       <a onClick={() => handleDelete(record)} disabled={disabled}>
    //         {intl.get('hzero.common.button.delete').d('删除')}
    //       </a>
    //     </div>
    //   ),
    // },
  ];

  return (
    <>
      <a onClick={openModal}>
        {disabled
          ? intl.get(`${commonPrompt}.uploadFile.view.checkFile`).d('查看文件')
          : intl.get(`${commonPrompt}.uploadFile.view.uploadFile`).d('上传文件')}
      </a>
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
        title={
          disabled
            ? intl.get(`${commonPrompt}.uploadFile.view.checkFile`).d('查看文件')
            : intl.get(`${commonPrompt}.uploadFile.view.uploadFile`).d('上传文件')
        }
        visible={visible}
        onCancel={closeModal}
        width="50%"
        footer={null}
      >
        <div>
          {!disabled && <Upload {...uploadProps} />}
          <Table
            rowKey="conFileId"
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
