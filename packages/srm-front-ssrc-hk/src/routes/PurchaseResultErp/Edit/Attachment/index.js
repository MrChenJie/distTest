import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { HZERO_FILE } from 'utils/config';
import intl from 'utils/intl';
import { getCurrentOrganizationId, tableScrollWidth, getAccessToken } from 'utils/utils';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import { downloadFile } from 'hzero-front/lib/services/api';
import request from 'utils/request';
import CusNotification from '_cus_components/CusNotification';
import mime from 'mime-types';

const ROW_KEY = 'enquiryPriceId';
const promptCode = 'ssrc.resaleRfq';
export default class Attachment extends Component {
  /**
   * state初始化
   */
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {
      fileList: [],
      businessAttachments: [], // 商务附件
      techAttachments: [], // 技术附件
      businessAttachmentUuid: undefined, // 打开模态框新建的uuid 自动生成商务附件uuid
      techAttachmentUuid: undefined, // 打开模态框新建的uuid 自动生成技术附件uuid
      previewVisible: false,
      previewFileName: '',
      previewImage: '',
    };
  }

  componentDidMount() {}

  @Bind()
  handleDownload(record) {
    if (record.fileUrl){
      request(`${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download`,{
        method: "GET",
        query: {
          bucketName: 'bidding',
          url: encodeURIComponent(record.fileUrl),
          access_token: getAccessToken()
        },
        responseType: 'blob'
      }).then(res => {
        if(res){
          const extension = record.fileUrl?.split('@').pop();
          const mimeType = mime.lookup(extension);
          const blob = new Blob([res], {
            type: mimeType,
          });
          if ('msSaveOrOpenBlob' in navigator) {
            // 使用ie下载
            navigator.msSaveOrOpenBlob(blob, extension);
            return false;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = extension;
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }
      })
    }else {
      CusNotification.warning({
        message: intl.get('hzero.common').d('超过30天，文件已被清理。'),
      });
    }
  }

  render() {
    const { cmhkPrFourthFiles } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.filename`).d('文件名称'),
        dataIndex: 'fileName',
        width: 140,
        render: (val, record) => {
          return <span>{val}</span>;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.operate`).d('操作'),
        width: 60,
        fixed: 'center',
        render: (text, record) => {
          console.log(record, 'record');
          return (
            <>
              <CusButton type="plain">
                <a
                  onClick={() => {
                    this.handleDownload(record);
                  }}
                >
                  {intl.get(`hzero.common.button.download`).d('下载')}
                </a>
              </CusButton>
            </>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <CusTable
          rowKey={ROW_KEY}
          dataSource={cmhkPrFourthFiles}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={false}
          // onChange={onChange}
          // rowSelection={rowSelection}
        />
      </React.Fragment>
    );
  }
}
