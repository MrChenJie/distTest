import React from 'react';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { Upload } from 'antd';
import intl from 'utils/intl';
import { tableScrollWidth, getCurrentLanguage, getCurrentOrganizationId, getAccessToken, createPagination,delItemsToPagination } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import { downloadFile } from 'services/api';
import moment from 'moment';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import CusTable from '_cus_components/CusTable';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import CusSpin from '_cus_components/CusSpin';

const commonPrompt = 'hzero.common';

@connect(({ loading, projectQaModels }) => ({
  projectQaModels,
}))

export default class FileTable extends React.Component {
  constructor(props) {
    super(props);
    console.log('this.pros', this.props.projectQaModels.newFileUrl)

    this.state = {
      activeKey: ['table'],
      showFileList: [],
      selectedRowKeys: [],
      selectedRows: [],
      uploadLoading: false,
    }
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
    this.handleSearch();
  }

  handleSearch = (page = {}) => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'projectQaModels/getQaSummaryFileNew',
      payload: {
        page,
        milestoneId: match.params.milestoneId,
        proId: match.params.proId,
        fileFlag: 'summaryFile',
      }
    }).then((res) => {
      if(res) {
        dispatch({
          type: `projectQaModels/updateState`,
          payload: {
            qaSummaryFileNew: res.content,
            qaSummaryFilePaginationNew: createPagination(res)
          },
        });
        this.setState({
          showFileList: [...res.content],
          pagination: createPagination(res),
        })
      }
    })
  }

  // 获取文件的信息生成调用接口数据
  getData = (file) => {
    return {
      fileName: file.name,
      //  fileKey: 'test',
      //  storageCode:'BID.FILEUPLOAD',
      bucketName: 'bidding',
      uuid: uuidv4(),
    }
  };

  // 预览
  handlePreview = (record) => {
    const { OOS_HOST } = process.env;
    const onlineApi = `${OOS_HOST}?file=`;
    const api = encodeURIComponent(`${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download?access_token=${getAccessToken()}&bucketName=bidding&url=`)
    const urlEncode = encodeURIComponent(record.fileUrl)
    const url = `${onlineApi}${api}${urlEncode}`
    window.open(url)
   };

   // 下载
   handleDownload = (record) => {
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

   // 批量删除
   handleBatchDelete = () => {
    const { dispatch, projectQaModels: { qaSummaryFileNew, qaSummaryFilePaginationNew} } = this.props;
    const { selectedRowKeys = [], selectedRows = [], showFileList = [], pagination } = this.state;
    console.log('selectedRowKeys', selectedRowKeys)

    if (selectedRowKeys.length <= 0) {
      CusNotification.info({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
      return 0;
    };
    const deleteAll = () => {
      const newShowFileList = showFileList.filter(row => {
        return !selectedRowKeys.includes(row['fileUrl']);
      })
      // this.setState({
      //   showFileList: newShowFileList,
      //   selectedRowKeys: [],
      //   selectedRows: [],
      // }, () => {
        this.setState({
          showFileList: newShowFileList,
            selectedRowKeys: [],
            selectedRows: [],
          pagination: delItemsToPagination(
            selectedRowKeys.length,
            showFileList.length,
            pagination
          )
        })
        dispatch({
          type: `projectQaModels/updateState`,
          payload: {
            qaSummaryFileNew: newShowFileList,
            qaSummaryFilePaginationNew: delItemsToPagination(
              selectedRowKeys.length,
              qaSummaryFileNew.length,
              qaSummaryFilePaginationNew
            )
          },
        });
      // })
    }
    const deleteData = selectedRows.filter(row => !['create'].includes(row._status));
    if(deleteData.length > 0) {
      let deleteRows = [];
      selectedRows.map((item) => {
        deleteRows.push({id: item.id})
      })
      dispatch({
        type: 'projectQaModels/deleteQaSummaryFileNew',
        payload: deleteRows,
      }).then((res) => {
        CusNotification.success();
        deleteAll();
      });
    } else {
      deleteAll();
    }
   }

  render() {
    const {
      projectQaModels: { qaSummaryFileNew },
      poHeaderMilestonesInfo,
    } = this.props;
    const { selectedRowKeys, activeKey, uploadLoading, showFileList, pagination } = this.state;

    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          selectedRows,
        });
      },
      getCheckboxProps: () => ({
        disabled: poHeaderMilestonesInfo.milestoneState === 'completed',
      }),
    };

    const uploadProps = {
      headers: {
        Authorization: `bearer ${getAccessToken()}`,
      },
      action: `${HZERO_FILE}/v1/0/files/multipart`,
      accept: ['.jpeg', '.png', '.gif', '.bmp', '.jpg', '.pdf', '.txt', '.doc', 'docx', '.xlsx', '.zip', '.rar', '.7z'],
      data: this.getData,
      beforeUpload: () => {
        this.setState({ uploadLoading: true });
        return true;
      },
      multiple: true,
      onSuccess: (res, info) => {
       const newDate = new Date();
       if(res.failed) {
         CusNotification.error({ message: res.message });
       } else {
        let newList = [
          ...showFileList,
          {
            ...info,
            fileName: info.name,
            uploadDate: moment(newDate).format(DEFAULT_DATETIME_FORMAT),
            fileUrl: res,
            _status: 'create',
          }
        ];
         this.setState({
          showFileList: newList
         })
         this.props.dispatch({
          type: `projectQaModels/updateState`,
          payload: {
            qaSummaryFileNew: newList,
            qaSummaryFilePaginationNew: createPagination(newList)
          },
        });
         CusNotification.success({
           message: intl.get(`${commonPrompt}.uploadFile.view.uploadSuccess`).d('上传成功'),
         });
       }
       this.setState({ uploadLoading: false });
     },
      onError: (res) => {
       CusNotification.error({ message: res.message });
       this.setState({ uploadLoading: false });
     },
      showUploadBtn: true,
      showUploadList: false,
    };

    const columns = [
      {
        title: intl.get(`${commonPrompt}.uploadFile.view.fileName`).d('文件名'),
        key: 'fileName',
        width: getCurrentLanguage() === 'zh_CN' ? 450 : 880,
        dataIndex: 'fileName',
        render: (_, record) => {
         return (
           <a onClick={() => this.handlePreview(record)}>{record.fileName}</a>
         )
       }
      },
      {
        title: intl.get(`${commonPrompt}.uploadFile.view.uploadTimeNew`).d('上传时间'),
        key: 'uploadDate',
        width: getCurrentLanguage() === 'zh_CN' ? 173 : 171,
        dataIndex: 'orderSeq',
        render: (_, record) => {
          return record.uploadDate
        }
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        key: 'operator',
        width: getCurrentLanguage() === 'zh_CN' ? 70 : 110,
        dataIndex: 'operator',
        render: (_, record) => (
          <>
            <CusButton type="plain" onClick={() => this.handleDownload(record)}>
              {intl.get('hzero.common.button.download').d('下载')}
            </CusButton>
          </>
        ),
      },
    ];
    return (
      <>
        <CusSpin spinning={false}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontWeight: '600' }}>
              {intl.get(`bid.bidcommon.view.button.shangchuandayi`).d('上传答疑纪要')}
            </div>
            {poHeaderMilestonesInfo.milestoneState !== 'completed' &&
            <div>
              <CusButton onClick={this.handleBatchDelete}>
                {intl.get(`bid.bidcommon.view.button.Bude`).d('批量删除')}
              </CusButton>
              <Upload {...uploadProps} style={{ marginLeft: '16px' }}>
                <CusButton mini type="primary" loading={uploadLoading}>
                  {intl.get(`bid.bidcommon.view.button.ReFiUp`).d('上传')}
                </CusButton>
              </Upload>
            </div>}
          </div>
          <CusTable
            rowKey="fileUrl"
            columns={columns}
            dataSource={showFileList}
            pagination={pagination}
            rowSelection={rowSelection}
            scroll={{ x: tableScrollWidth(columns) }}
            onChange={this.handleSearch}
          />
        </CusSpin>
      </>
    );
  }
}