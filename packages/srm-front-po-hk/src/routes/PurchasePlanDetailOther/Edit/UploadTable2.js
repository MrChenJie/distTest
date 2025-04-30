import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import mime from 'mime-types';
import { tableScrollWidth, getCurrentLanguage, getCurrentOrganizationId, getAccessToken } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { pullAllBy } from 'lodash';
import request from 'utils/request';
import { HZERO_FILE } from 'utils/config';
import { tooltipRender } from '_cus_utils/render';
import CusFileViewer from '_cus_components/CusFileViewer';
import CusTable from '_cus_components/CusTable';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
// import RfqResponse from './components/RfqResponse';
import { Popconfirm } from 'hzero-ui';
import { operatorRender } from 'utils/renderer';

/**
 * 多语言前缀
 */
const promptCode = 'ssrc.resaleRfq';
const ROW_KEY = 'uid';
export default class UploadTable extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      rfqResponseVisible: false,
      exportModalVisible: false,
      nowRecord: {},
      currentProcessedRow: null,
      prApplyAttachmentListValue: [],
      // 预览文件
      previewFileVisible: false,
      fileExt: null,
      previewUrl: null,
    };
  }

  componentDidMount() {
    if (this.props.prApplyAttachmentList == null) {
      this.setState({
        prApplyAttachmentListValue: [],
      });
    } else {
      this.setState({
        prApplyAttachmentListValue: [...this.props.prApplyAttachmentList, ...this.props.attachmentSource],
      });
    }
  }

  @Bind()
  clearState() {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    });
  }

  @Bind()
  openEnquiryResponseModal(record) {
    this.setState({
      rfqResponseVisible: true,
      nowRecord: record,
    });
  }

  /**
   * 跳转详情界面
   * @param {object} record
   */
  @Bind()
  openPriceEntryDetail(record) {
    console.log('预览');
  }

  /**
   * @description 提交生成采购审批
   */
  @Bind()
  handleSubmitToApproval() {
    const { onSubmitToApproval = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    onSubmitToApproval(selectedRows);
  }

  /**
   * @description 删除
   */
  @Bind()
  handleDelete() {
    const { onDetele = (e) => e, fileSource, dispatch, purchaseApplicationModel } = this.props;
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    const filterFileSource = fileSource.filter(item => !selectedRows.includes(item));
    dispatch({
      type: 'purchasePlan/updateState',
      payload: {
        fileSource: filterFileSource,
        delSelectedRows: selectedRows,
      }
    })
    onDetele(selectedRows, this.clearState);
    this.props.getFatherFileList(filterFileSource)
  }

  /**
   * @description 发布询价
   */
  @Bind()
  handlePublish() {
    const { onPublish = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    if (selectedRows.length === 0) {
      CusNotification.error({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return 0;
    }
    onPublish(selectedRows);
  }

  @Bind()
  onSelect(record, selected) {
    const { selectedRows = [] } = this.state;
    const newSRows = selected
      ? selectedRows.concat(record)
      : selectedRows.filter((n) => n[ROW_KEY] !== record[ROW_KEY]);
    const newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item[ROW_KEY]);
    });
    console.log('newSRows', newSRows);
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
    });
  }

  @Bind()
  onSelectAll(selected, _, changeRows) {
    const { selectedRows = [] } = this.state;
    const newSRows = selected
      ? selectedRows.concat(changeRows)
      : pullAllBy([...selectedRows], changeRows, ROW_KEY);
    const newSelectedRowKeys = [];
    newSRows.forEach((item) => {
      newSelectedRowKeys.push(item[ROW_KEY]);
    });
    this.setState({
      selectedRows: newSRows,
      selectedRowKeys: newSelectedRowKeys,
    });
  }

  handleDownload = (record) => {
    if (record.fileName) {
      request(`${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download`, {
        method: 'GET',
        query: {
          bucketName: 'spfm-comp',
          url: encodeURIComponent(record.fileUrl),
          access_token: getAccessToken(),
        },
        responseType: 'blob',
      }).then((res) => {
        if (res) {
          const extension = record.fileName?.split('.').pop();
          const mimeType = mime.lookup(extension);
          const blob = new Blob([res], {
            type: mimeType,
          });
          if ('msSaveOrOpenBlob' in navigator) {
            // 使用ie下载
            navigator.msSaveOrOpenBlob(blob, `${record.fileName}`);
            return false;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${record.fileName}`;
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }
      });
    }
  }

  renderButtons = ({ parent }) => {
    const {
      publishLoading = false,
      submitLoading = false,
      deleteLoading = false,
      exportLoading = false,
    } = parent.props;
    const {
      onMassCreate = (e) => e,
      onOpenModal = (e) => e,
      onExport = (e) => e,
    } = this.props;

    return (
      <>
        <CusButton mini onClick={onExport} loading={exportLoading}>
          {intl.get('hzero.common.button.export').d('导出')}
        </CusButton>
        <CusButton
          mini
          onClick={this.handleSubmitToApproval}
          loading={submitLoading}
        >
          {intl.get(`${promptCode}.button.submitToApproval`).d('提交')}
        </CusButton>
        <CusButton
          mini
          onClick={this.handleDelete}
          loading={deleteLoading}
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </CusButton>
        <CusButton
          mini
          onClick={this.handlePublish}
          loading={publishLoading}
        >
          {intl.get(`${promptCode}.button.publish`).d('发布询价')}
        </CusButton>
        <CusButton mini onClick={onMassCreate}>
          {intl.get(`${promptCode}.button.massCreate`).d('批量创建')}
        </CusButton>
        <CusButton mini onClick={onOpenModal} type='primary'>
          {intl.get('hzero.common.button.create').d('新建')}
        </CusButton>
      </>
    );
  };

  @Bind()
  handlePreviewFile(item) {
    const fA = item.fileName.split('.');
    const fileExt = fA && fA[fA.length - 1];
    if (fileExt.toLowerCase() === 'docx') {
      request(item.fileUrl, {
        responseType: 'blob',
        method: 'GET',
      }).then((response) => {
        if (response.size === 0) {
          CusNotification.warning({
            message: intl.get('hzero.common.cannot.preview.empty.file').d('不能预览空白文件'),
          });
          return false;
        } else {
          this.setState({
            previewFileVisible: true,
            fileExt,
            previewUrl: item.fileUrl,
          });
        }
      });
    } else {
      this.setState({
        previewFileVisible: true,
        fileExt,
        previewUrl: item.fileUrl,
      });
    }
  }


  render() {
    const {
      onChange = (e) => e,
      getQueryParams = (e) => (e),
      // resaleRfq,
      attachmentSource,
      prApplyAttachmentList,
      fileSource,
      purchaseApplicationModel
    } = this.props;
    const {
      selectedRows,
      selectedRowKeys,
      rfqResponseVisible,
      nowRecord,
      exportModalVisible = false,
      currentProcessedRow,
      prApplyAttachmentListValue,
      previewFileVisible,
      fileExt,
      previewUrl,
    } = this.state;
    // const {
    //   rfqList = [],
    //   rfqPagination = [],
    // } = resaleRfq;
    const columns = [
      {
        title: intl.get(`HKPC.commom.view.title.filename`).d('文件名称'),
        dataIndex: 'fileName',
        width: 800,
        render: (val, record) => {
          return (
            <span className='action-link'>
              <a style={{ color: '#3271FE' }} onClick={() => this.handlePreviewFile(record)}>{val}</a>
            </span>
          );
        },
      },
      {
        title: intl.get(`HKPC.commom.view.title.operate`).d('操作'),
        width: 120,
        fixed: 'center',
        render: (text, record) => {
          // const operators = [
          //   {
          //     key: 'delete',
          //     ele: (
          //       <Popconfirm
          //         title={intl.get(`hzero.common.message.confirm.delete`).d('是否删除此条记录？')}
          //         onConfirm={this.handleDelete.bind(this, record)}
          //       >
          //         <a className='delete'>{intl.get(`hzero.common.button.delete`).d('删除')}</a>
          //       </Popconfirm>
          //     ),
          //     len: 2,
          //     title: intl.get(`hzero.common.button.delete`).d('删除'),
          //   },
          // ];
          // return operatorRender(operators, record);
          return (
            <>
              <CusButton
                style={{ marginRight: '16px' }}
                type="plain"
                onClick={() => this.handleDownload(record)}
              >
                {intl.get('hzero.common.button.download').d('下载')}
              </CusButton>
              {/* <CusButton
                style={{ marginRight: '16px' }}
                type="plain"
                onClick={() => this.handleDelete(_, record)}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </CusButton> */}

            </>
          )
        },
      },
    ];

    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onSelect: this.onSelect,
      onSelectAll: this.onSelectAll,
    };
    const exportModalProps = {
      title: intl.get(`${promptCode}.model.title.enquiryPriceExport`).d('询价单导出列表'),
      visible: exportModalVisible,
      destroyOnClose: true,
      width: '1000px',
      onCancel: () => {
        this.setState({
          exportModalVisible: false,
        });
      },
      footer: null,
    };
    return (
      <React.Fragment>
        <CusTable
          rowKey={ROW_KEY}
          // dataSource={[...attachmentSource, ...prApplyAttachmentListValue]}
          dataSource={fileSource}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={false}
          onChange={onChange}
          rowSelection={rowSelection}
        />

        {/* 询价响应 CusModal */}
        <CusModal
          visible={rfqResponseVisible}
          width={800}
          title={intl.get('ssrc.resaleRfq.create.rfqResponseModal.title').d('线上报价情况')}
          footer={
            <CusButton
              onClick={() => {
                this.setState({
                  rfqResponseVisible: false,
                });
              }}
            >
              {intl.get('hzero.common.button.close').d('关闭')}
            </CusButton>
          }
          onCancel={() => this.setState({
            rfqResponseVisible: false,
          })}
          destroyOnClose
        >
          {/* <RfqResponse
            {...this.props}
            nowRecord={nowRecord}
          /> */}
        </CusModal>
        <CusFileViewer
          visible={previewFileVisible}
          fileType={fileExt}
          filePath={previewUrl}
          onCancel={() => {
            this.setState({ previewFileVisible: false });
          }}
          onClosePreview={() => {
            this.setState({
              previewFileVisible: false,
            })
          }}
        />
      </React.Fragment>
    );
  }
}
