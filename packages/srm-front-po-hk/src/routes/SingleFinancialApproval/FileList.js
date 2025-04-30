import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth, getCurrentLanguage } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import uuidv4 from 'uuid/v4';
import { getResponse } from '@/utils/utils';
import { getAttachmentUrl, queryFileList } from './utils';

export default class FileList extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
    this.state = {
      fileList: []
    };
  }

  componentDidMount() {
    const { bucketName, attachmentUUID, tenantId } = this.props;
    if (attachmentUUID) {
      queryFileList({
        tenantId,
        bucketName,
        attachmentUUID,
      }).then((fileList) => {
        if (getResponse(fileList)) {
          this.setState({
            fileList: this.changeFileList(fileList),
          });
        }
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { bucketName, attachmentUUID, tenantId } = this.props;
    if (attachmentUUID && attachmentUUID !== prevProps.attachmentUUID) {
      queryFileList({
        tenantId,
        bucketName,
        attachmentUUID,
      }).then((fileList) => {
        if (getResponse(fileList)) {
          this.setState({
            fileList: this.changeFileList(fileList),
          });
        }
      });
    }
  }
  
  /**
   *格式化已经上传的文件列表
   *
   * @param {*} response 请求返回的文件列表
   * @returns 格式化后的文件列表
   * @memberof UploadModal
   */
  changeFileList = (response) => {
    const { bucketName, bucketDirectory, tenantId, isEncrypt } = this.props;
    return response.map((res, index) => {
      return {
        uid: index + 1,
        name: res.fileName,
        creationDate: res.creationDate,
        status: 'done',
        rowKey: uuidv4(),
        url: getAttachmentUrl({
          url: res.fileUrl,
          bucketName,
          tenantId,
          bucketDirectory,
          isEncrypt,
        }),
      };
    });
  }

  // 新预览文件
  handlePreviewFile = (item) => {
    const { bucketName } = this.props;
    const { OOS_HOST } = process.env;
    const onlineApi = `${OOS_HOST}?file=`;
    const urlEncode = encodeURIComponent(item.url);
    const url = `${onlineApi}${urlEncode}`;
    window.open(url);
  };

  render() {
    const {
      viewOnly = false,
    } = this.props;
    const {
      fileList
    } = this.state;

    const columns = [
      {
        title: intl.get(`hzero.common.table.column.fileName`).d('附件名'),
        width: getCurrentLanguage() === 'zh_CN' ? (viewOnly ? 463 : 418) : viewOnly ? 398 : 330,
        dataIndex: 'name',
      },
      {
       title: intl.get(`hzero.common.uploadFile.view.uploadTime`).d('上传时间'),
       width: getCurrentLanguage() === 'zh_CN' ? (viewOnly ? 174 : 172) : viewOnly ? 175 : 233,
       dataIndex: 'creationDate',
     },
      {
        title: intl.get(`hzero.common.table.column.option`).d('操作'),
        width: getCurrentLanguage() === 'zh_CN' ? (viewOnly ? 105 : 150) : viewOnly ? 170 : 228,
        dataIndex: 'operation',
        render: (_, record) => {
          return (
            <>
              <CusButton type="plain">
                <a href={record.url}>{intl.get(`hzero.common.button.download`).d('下载')}</a>
              </CusButton>
              <CusButton
                type="plain"
                style={{ marginLeft: '16px' }}
                onClick={() =>
                  this.handlePreviewFile(record)
                }
              >
                {intl.get(`hzero.common.button.preview`).d('预览')}
              </CusButton>
            </>
          );
        },
      },
    ];

    return (
      <>
        <CusTable
          rowKey="rowKey"
          dataSource={fileList}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={false}
        />
      </>
    );
  }
}
