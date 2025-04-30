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
import { Tooltip, Upload } from 'antd';
import { downloadFile } from 'services/api';
import { isArray } from 'lodash';
import request from 'utils/request';
import intl from 'utils/intl';
import uuidv4 from 'uuid/v4';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import CusModal from '_cus_components/CusModal';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import tipIcon from '@/assets/tips.svg';
import './index.less';

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
  const {
    parentId,
    tableName,
    disabled,
    tip,
  } = props;
  // useEffect(() => {
  //   setShowFileList(props.value || []);
  // }, [props.value]);
  useEffect(() => {
    // 查询数据
    if (tableName && props.value.length > 0) {
      let newData = []
      props.value.map(item => {
        getFiles({
          fileUrl: item.fileUrls,
        }).then((res) => {
          if (isArray(res)) {
            newData.push(...res)
            props.value.map((j, jdex) => {
              // let fileUrlsArray = j.fileUrls.split(',').filter(url => url.trim() !== '');
              // console.log('fileUrlsArray', fileUrlsArray)
              // fileUrlsArray.map((i, idex) => {
              //   newData.map((k, kdex) => {
              //     if (idex === kdex) {
              //       k.round = j.round
              //     }
              //   })
              // })
              newData.map((k, kdex) => {
                if (jdex === kdex) {
                  k.round = j.round
                }
              })
            })
            setTimeout(() => {
              return updateShowFileList(newData);
            }, 100)
            // return newData
          }
        });
      })
      // updateShowFileList(newData);
      // setShowFileList(newData);
    }
    // if (parentId) {
    //   getFiles({
    //     fileUrl: props.value,
    //   }).then((res) => {
    //     if (isArray(res)) {
    //       updateShowFileList(res || []);
    //     } else {
    //       updateShowFileList([]);
    //     }
    //   });
    // }
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
    window.open(url);
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
      Authorization: getAccessToken(), // 'Bearer 67f89715-2143-4019-b54e-e988f553c561'
    },
    action: `${HZERO_FILE}/v1/0/files/multipart`,
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
          fileUrls: res,
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
      title: intl.get(`bid.bidcommon.view.title.round`).d('轮次'),
      key: 'orderSeq',
      dataIndex: 'orderSeq',
      width: getCurrentLanguage() === 'zh_CN' ? 60 : 100,
      render: (_, record) => (
        <div>{intl.get(`bid.bidcommon.view.title.the`).d('第')}{record.round}{intl.get(`bid.bidcommon.view.title.turn`).d('轮')}</div>
      ),
    },
    {
      title: intl.get(`bid.bidcommon.view.title.document`).d('文件'),
      key: 'fileName',
      dataIndex: 'fileName',
      width: 200,
      render: (_, record) => {
        return (
          <a onClick={() => handlePreview(record)}>{record.fileName}</a>
        )
      }
    },
    {
      title: intl.get('bid.bidcommon.view.button.Operate').d('操作'),
      dataIndex: 'operator',
      key: 'operator',
      width: getCurrentLanguage() === 'zh_CN' ? 60 : 106,
      render: (_, record) => (
        <>
          <CusButton
            type="plain"
            onClick={() => handleDownload(record)}
          >
            {intl.get('hzero.common.button.download').d('下载')}
          </CusButton>
        </>
      ),
    }
  ];

  return (
    <>
      <div className="cus-upload-file-tag">
        <CusButton type="plain" onClick={openModal}>
          {disabled
            ? intl.get(`${commonPrompt}.uploadFile.view.checkFile`).d('查看文件')
            : intl.get(`${commonPrompt}.uploadFile.view.uploadFile`).d('上传文件')}
        </CusButton>
        {fileSource.length !== 0 && <Tag>{fileSource.length}</Tag>}
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
          <CusTable columns={columns} dataSource={fileSource} />
        </div>
      </CusModal>
    </>
  );
}

export default forwardRef(UploadFile);

