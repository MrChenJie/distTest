/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-07-31 09:15:29
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import { HZERO_FILE } from 'utils/config';
import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import { tableScrollWidth } from 'utils/utils';
import { tooltipRender } from '_cus_utils/render';
import {
  getAccessToken,
  getCurrentOrganizationId,
} from 'utils/utils';
import { head, split } from 'lodash';
import { numberRender } from 'utils/renderer';

@Form.create()
export default class DetailList extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  // 预览文件
  handlePreviewFile = (item) => {
    const { bucketName } = this.props;
    const { OOS_HOST } = process.env;
    const onlineApi = `${OOS_HOST}?file=`;
    const api = encodeURIComponent(
      `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download?access_token=${getAccessToken()}&bucketName=${bucketName}&url=`
    );
    const urlEncode = encodeURIComponent(item.fileUrl);
    const url = `${onlineApi}${api}${urlEncode}`;
    window.open(url);
  };

  render() {
    const {
      form,
      payTradeModal,
      readyOnly = false,
      bucketName,
    } = this.props;

    const {
      fileDetailSource,
    } = payTradeModal;

    console.log('fileDetailSource', fileDetailSource);

    const columns = [
      {
        title: intl.get(`hzero.common.table.column.fileName`).d('附件名称'),
        dataIndex: 'fileName',
        width: 200,
        render: (_, record) => {
          return (
            <a onClick={() => {this.handlePreviewFile(record)}}>{record.fileName}</a>
          )
        }
      },
      {
        title: intl.get(`hzero.common.uploadFile.view.uploadTime`).d('上传时间'),
        dataIndex: 'creationDate',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.trade.view.title.Operation`).d('操作'),
        dataIndex: 'operation',
        width: 100,
        render: (_, record) => {
          const url = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download?access_token=${getAccessToken()}&bucketName=${bucketName}&url=${encodeURIComponent(record.fileUrl)}`;
          return (
            <>
              <CusButton type="plain">
                <a href={url}>{intl.get(`hzero.common.button.download`).d('下载')}</a>
              </CusButton>
            </>
          )
        }
      },
    ];

    return (
      <>
        <CusTable
          rowKey="rowKey"
          columns={columns}
          dataSource={fileDetailSource}
          pagination={false}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </>
    );
  }
}
