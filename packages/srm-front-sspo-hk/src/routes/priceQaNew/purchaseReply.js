/** -- CMI回复问题的表
 * @date: 2021/03/29 11:50:55
 * @author: Xukuan <kuan.xu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { Upload } from 'antd';
import CusLov from '_cus_components/CusLov';
import CusInput from '_cus_components/CusInput';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import { tooltipRender } from '_cus_utils/render';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { isString } from 'lodash';
import {
  getCurrentOrganizationId,
  getAccessToken,
  tableScrollWidth,
  getResponse,
  getCurrentLanguage
} from 'utils/utils';
import { connect } from 'dva';
import EditTable from '_cus_components/EditTable';
import { queryMapIdpValue } from 'services/api';
import { API_HOST } from 'utils/config';
import UploadFile from './UploadFile';
import styles from './index.less';
import { HZERO_FILE } from '@/common/config';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';

const status = ['create', 'update'];
const tenantId = getCurrentOrganizationId();
// const { Dragger } = Upload;

@connect(({ loading }, materiel) => ({
  materiel,
}))
@formatterCollections({
  code: [
    'bid.bidcommon',
    'bid.biddashbord',
    'bid.milestonecommon',
    'hzero.common'
  ],
})

@Form.create({ fieldNameProp: null })
export default class PurchaseReplyTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      fastCodes: {},
      uploadVisible: false,
      fileList: '',
      ids: '',
      caseDetailFlag: false,
      qaTypeFlag: false
    };
    // this.unsaveFlag = false;
  }

  componentDidMount() {
    // this.checkPermission();
    this.props.onRef && this.props.onRef(this);
    this.fetchFastCode();
  }

  checkStatus(record) {
    const { isEdit } = this.props;
    return status.includes(record._status) && isEdit;
  }

  fetchFastCode() {
    const codes = {
      'BID.Classification': 'BID.Classification',
    };
    queryMapIdpValue(codes).then((res) => {
      const response = getResponse(res);
      if (response) {
        this.setState({
          fastCodes: response,
        });
      }
    });
  }

  /**
   * 添加行
   *
   * @memberof PurchaseReplyTable
   */
  @Bind
  handleAddLine() {
    const { onAddLine = (e) => e } = this.props;
    onAddLine();
    this.handleDataChange();
  }

  /**
   * 监听编辑事件，更改当前未保存状态
   *
   * @memberof PurchaseReplyTable
   */
  @Bind
  handleDataChange() {
    const { unsaveFlag } = this.props;
    if (!unsaveFlag) {
      const { onEdit = (e) => e } = this.props;
      onEdit(true);
    }
  }

  /**
   * 监听分页变化，判断是否有未保存的数据
   *
   * @param {object} page
   * @memberof PurchaseReplyTable
   */
  @Bind
  handlePageChange(page) {
    const { onPageChange = (e) => e, unsaveFlag } = this.props;
    if (unsaveFlag) {
      CusModal.confirm({
        content: intl
          .get('hzero.common.message.confirm.giveUpTip')
          .d('你有修改未保存，是否确认离开？'),
          okType:'normal',
        onOk: () => {
          onPageChange(page);
        },
      });
    } else {
      onPageChange(page);
    }
  }

  /**
   * 上传附件
   */
  @Bind()
  handleUpload(record) {
    this.setState({
      uploadVisible: true,
      ids: record.qaId ? record.qaId : record.qaIds
    });
  }

  /**
   * 关闭上传附件模态框
   */
  @Bind()
  handleCancel() {
    this.setState({
      uploadVisible: false,
      ids: '',
      fileList: ''
    });
  }


  /**
  * 关闭上传附件模态框成功 
  */
  @Bind()
  handleUploadOk(fileList, res) {
    console.log('123', fileList, res)

    let newFileUrl = ''
    fileList.map((item, index) => {
      if (index == 0) {
        newFileUrl = item.fileUrl
      } else {
        newFileUrl = newFileUrl + ',' + item.fileUrl
      }
    })
    this.props.dataSource.map(item => {
      if (item._status != 'create') {
        if (item.qaId == res.qaId) {
          item.fileUrl = newFileUrl
        }
      } else {
        if (item.poOrderId == res.poOrderId) {
          item.fileUrl = newFileUrl
        }
      }
    })
    console.log('list', this.props.dataSource)
    this.setState({
      uploadVisible: false,
      ids: '',
      fileList: ''
    });
  }
  /**
   * 方法含义？
   * @param {*} file - <>
   */
  @Bind()
  uploadData(file) {
    return {
      tenantId: tenantId,
      bucketName: 'bidding',
      // storageCode: 'BID.FILEUPLOAD',

      fileName: file.name,
    };
  }

  /**
   * 上传前的校验
   * @param {*} file - <>
   */
  @Bind()
  beforeUpload(file) {
    const { fileSize = 10 * 1024 * 1024 } = this.props;
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get(`hzero.common.upload.error.size`, {
            fileSize: fileSize / (1024 * 1024),
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    return true;
  }

  /**
   * 上传change触发事件
   * @param {*} info - <>
   */
  @Bind()
  onDraggerUploadChange(info) {
    const { status, response } = info.file;
    if (status === 'done') {
      if (isString(response)) {
        notification.success();
        this.setFileList(info.file);
      } else {
        notification.error();
      }
    } else if (status === 'error') {
      notification.error(response);
    }
  }

  /**
   * 将上传列表放到state
   * @param {*} file - <>
   */
  @Bind()
  setFileList(file) {
    const { fileList = '' } = this.state;
    this.setState({
      fileList: fileList + ',' + file.response,
    });
  }

  /**
   * 删除文件回调函数
   * @param {*} file - <>
   */
  @Bind()
  onDraggerUploadRemove(file) {
    const { fileList } = this.state;
    const { dispatch } = this.props;
    if (isString(file.response)) {
      dispatch({
        type: 'materiel/onDraggerUploadRemove',
        payload: {
          tenantId,
          bucketName: 'bidding',
          urls: [file.response],
        },
      }).then((res) => {
        if (res) {
          notification.success();
        }
      });
      this.setState({
        fileList: fileList.filter((o) => o.uid !== file.uid),
      });
    }
  }

  @Bind
  handleCaseDetailChange(val) {
    this.setState({
      caseDetailFlag: true
    })
  }

  @Bind
  handleQaTypeChange() {
    this.setState({
      qaTypeFlag: true
    })
  }

  // 删除行
  @Bind
  handleDeleteLine() {
    const { onDeleteLine = (e) => e } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    onDeleteLine(selectedRowKeys, selectedRows, () => {
      this.setState({
        selectedRowKeys: [],
        selectedRows: [],
      });
    });
  }

  @Bind
  clearRowKey() {
    console.log('123123123', this.props.dataSource)
    this.setState({
      selectedRowKeys: [],
      selectedRows: [],
    });
  }

  render() {
    const {
      // dataSource = [],
      pagination = {},
      onSave = (e) => e,
      saveLoading = false,
      fetchLoading = false,
      deleteLoading = false,
      match,
      isShow = true,
      timeFlag,
      submitFlag,
      onCheckRow =(e) =>(e),
    } = this.props;
    const { proId } = match.params
    // const isShow = false
    // console.log('dataSource', dataSource)
    const { selectedRowKeys = [], fastCodes = {}, uploadVisible, caseDetailFlag = false, qaTypeFlag = false } = this.state;
    const columns = [
      {
        title: intl.get('bid.bidcommon.view.title.suppliername').d('供应商'),
        dataIndex: 'supplierName',
        width: 180,
        render: (val, record) =>
        (
          (!timeFlag || submitFlag) ? (
            tooltipRender(val)
          ) :
            (<Form.Item>
              {record.$form.getFieldDecorator('supplierName', {
                initialValue: val,
              })(
                <CusLov
                  style={{ width: '100%' }}
                  code='BID.SELECTPJSUPPLIER'
                  queryParams={{ proId }}
                  disabled={!timeFlag || submitFlag}
                  textValue={record.supplierName}
                  onChange={(_, item) => {
                    record.questTo = item.userId
                    record.supplierNum = item.userId
                  }}
                />
              )}
            </Form.Item>)
        )
      },
      isShow && {
        title: intl.get('bid.bidcommon.view.title.purchaseitems').d('采购内容'),
        dataIndex: 'qaType',
        width: 180,
        render: (val, record) => {
          return (
            (!timeFlag || submitFlag) ? (
              tooltipRender(record.qaTypeNew ? record.qaTypeNew : record.qaType)
            ) :
              (<Form.Item>
                {record.$form.getFieldDecorator(qaTypeFlag ? 'qaTypeNew' : 'qaType', {
                  initialValue: record.qaTypeNew ? record.qaTypeNew : record.qaType,
                })(
                  <CusLov
                    style={{ width: '100%' }}
                    code='BID.PURCHASECONTENT'
                    disabled={!timeFlag || submitFlag}
                    queryParams={{ proId }}
                    textValue={record.qaType}
                    lovOptions={{ valueField: 'proPriceConfigId', displayField: 'purchaseContent' }}
                    onChange={(_, item) => {
                      record.qaType = item.purchaseContent
                      record.caseDetail = item.serviceContent
                    }}
                  />
                )}
              </Form.Item>)
          );
        },
      },
      isShow && {
        title: intl.get('bid.bidcommon.view.title.type').d('规格型号/服务内容'),
        dataIndex: 'caseDetail',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get('bid.bidcommon.view.title.question').d('问题'),
        dataIndex: 'qaContent',
        width: 240,
        render: (val, record) =>
        (
          (!timeFlag || submitFlag) ? (
            tooltipRender(val)
          ) :
            (<Form.Item>
              {record.$form.getFieldDecorator('qaContent', {
                initialValue: val,
              })(
                <CusInput.TextArea autoChangeSize={true} />
              )}
            </Form.Item>)
        )
      },
      {
        title: intl.get('bid.bidcommon.view.title.dafuneirong').d('答复内容'),
        dataIndex: 'answerContent',
        width: 240,
        render: tooltipRender,
      },
      {
        title: intl.get('bid.bidcommon.view.title.replytimeNew').d('答复时间'),
        dataIndex: 'answerTime',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get('bid.bidcommon.view.title.gysdefujian').d('供应商附件'),
        dataIndex: 'answerFileUrl',
        width: getCurrentLanguage() === 'zh_CN' ? 115: 195,
        render: (value, record) => (
          <UploadFile
            onUploadSuccess={(item) => onUploadSuccess(item, record)}
            onDeleteSuccess={() => onDeleteSuccess(record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={record.qaId}
            value={value}
            disabled
          />
        ),
      },
      {
        title: intl.get('bid.milestonecommon.view.title.operation').d('操作'),
        dataIndex: 'fileUrl',
        width: getCurrentLanguage() === 'zh_CN' ?110 :130,
        render: (val, record) => {
          return (
            <UploadFile
              handleUploadOk={(item) => this.handleUploadOk(item, record)}
              // onDeleteSuccess={() => onDeleteSuccess(record)}
              tableName="SPUC_PO_CON_ATTACH"
              parentId={val}
              value={val}
              disabled={!timeFlag || submitFlag}
            />
          )
        }
      }
    ].filter(Boolean);

    const loading = saveLoading || deleteLoading || fetchLoading;

    const rowSelection = {
      columnWidth: 50,
      selectedRowKeys,
      getCheckboxProps: record => ({
        disabled: record._status === undefined || (!timeFlag || submitFlag),
      }),
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
        onCheckRow(rows);
      },
    };

    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }

    // const draggerUploadProps = {
    //   name: 'file',
    //   multiple: true,
    //   // accept: 'image/*',
    //   data: this.uploadData,
    //   headers,
    //   action: `${API_HOST}${HZERO_FILE}/v1/${tenantId}/files/multipart`,
    //   beforeUpload: this.beforeUpload,
    //   onChange: this.onDraggerUploadChange,
    //   onRemove: this.onDraggerUploadRemove,
    // };

    let dataSource = [...this.props.dataSource]
    return (
      <>
        {/* <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '16px'}}>
          {!(selectedRowKeys.length === 0 || !timeFlag || submitFlag) && <CusButton
            mini
            onClick={this.handleDeleteLine}
          >
            {intl.get('bid.bidcommon.view.button.delete').d('删除')}
          </CusButton>}
          {!(!timeFlag || submitFlag) && <CusButton mini onClick={this.handleAddLine}>
            {intl.get('bid.bidcommon.view.button.add').d('添加')}
          </CusButton>}
          {!(!timeFlag || submitFlag) && <CusButton mini onClick={onSave}>
            {intl.get('bid.bidcommon.view.button.save').d('保存')}
          </CusButton>}
        </div> */}
        <EditTable
          rowKey="poOrderId"
          dataSource={dataSource}
          pagination={pagination}
          onChange={this.handlePageChange}
          columns={columns}
          rowSelection={rowSelection}
          onDataChange={this.handleDataChange}
          scroll={{ x: tableScrollWidth(columns) }}
        />
        {/* <Modal
          title={intl.get(`hzero.common.upload.text`).d('上传附件')}
          visible={uploadVisible}
          onOk={this.handleUploadOk}
          onCancel={this.handleUploadOk}
          cancelText={intl.get(`bid.bidcommon.view.button.cancel`).d('取消')}
          okText={intl.get(`bid.bidcommon.view.button.surequeren`).d('确认')}
          destroyOnClose
          width={520}
        >
          <Dragger {...draggerUploadProps}>
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-text">
              {intl
                .get(`bid.bidcommon.view.message.uploadtext`)
                .d('单击或拖动附件(2GB以下)到此区域进行上传')}
            </p>
            <p className="ant-upload-hint">
              {intl.get(`hzero.common.upload.hint`).d('支持单个或批量上传')}
            </p>
          </Dragger>
        </Modal> */}
      </>
    );
  }
}
