/** -- CMI回复问题的表
 * @date: 2022/04/29 11:50:55
 * @author: CJ <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { Form, Input, Button, Modal, Upload, Icon, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { isString } from 'lodash';
import UploadFile from './UploadFile';
import {
  getCurrentOrganizationId,
  getAccessToken,
  tableScrollWidth,
  getResponse,
  getEditTableData
} from 'utils/utils';
import { dateRender } from 'utils/renderer';
import Lov from 'components/Lov';
import { connect } from 'dva';
import EditTable from 'components/EditTable';
import ValueList from 'components/ValueList';
import { queryMapIdpValue } from 'services/api';
import UploadEdit from 'srm-front-boot/lib/components/Upload/index';
import { API_HOST } from 'utils/config';

//  import deleteIcon from '@/assets/buttonIcons/删除.png';
import saveIcon from '@/assets/buttonIcons/保存.png';
import { HZERO_FILE } from '@/common/config';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';

const status = ['create', 'update'];
const tenantId = getCurrentOrganizationId();

const { Dragger } = Upload;

@formatterCollections({
  code: ['bid.bidcommon'],
})
@connect(({ materiel,projectQaModels }) => ({
  materiel,
  projectQaModels
}))
@Form.create({ fieldNameProp: null })
export default class PurchaseReplyTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      fastCodes: {},
      uploadVisible: false,
      fileList: [],
      caseDetailFlag: false,
      qaTypeFlag: false,
    };
    // this.unsaveFlag = false;
  }

  componentDidMount() {
    // this.checkPermission();
    this.fetchFastCode();
    // this.getQaSummaryFile();
  }

  checkStatus(record) {
    const { isEdit } = this.props;
    return status.includes(record._status) && isEdit;
  }

  @Bind
  getQaSummaryFile(){
    const {dispatch,match} = this.props
    dispatch({
      type: 'projectQaModels/getQaSummaryFile',
      payload: {
        milestoneId:match.params.milestoneId,
        proId:match.params.proId,
        remarks:'summaryFile'
      },
    })
  }

  @Bind
  updataList(e){
    let newFileUrl = ''
    if(e.length){
      e.map(item=>{
        newFileUrl =newFileUrl+','+item.fileUrl
      })
    }
    const {dispatch,match} = this.props
    dispatch({
      type: 'projectQaModels/updateState',
      payload: {
        newFileUrl:newFileUrl,
        // clarificationPagination: newPagination,
      },
    })
    
  }

  fetchFastCode() {
    const codes = {
      'BID.CLASSIFICATION': 'BID.CLASSIFICATION',
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

  // /**
  //  * 添加行
  //  *
  //  * @memberof PurchaseReplyTable
  //  */
  // @Bind
  // handleAddLine() {
  //   const { onAddLine = (e) => e } = this.props;
  //   onAddLine();
  //   this.handleDataChange();
  // }

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
    const { onChange = (e) => e, unsaveFlag } = this.props;
    if (unsaveFlag) {
      Modal.confirm({
        title: intl
          .get('hzero.common.message.confirm.giveUpTip')
          .d('你有修改未保存，是否确认离开？'),
        onOk: () => {
          onChange(page);
        },
      });
    } else {
      onChange(page);
    }
  }

  /**
   * 上传附件
   */
  @Bind()
  handleUpload() {
    this.setState({ uploadVisible: true });
  }

  /**
   * 关闭上传附件模态框
   */
  @Bind()
  handleCancel() {
    this.setState({ uploadVisible: false });
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
    const { fileList = [] } = this.state;
    this.setState({
      fileList: [...fileList, file],
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
  handleAssign(_, record) {
    const id = record.employeeId;
    const { onAssign = (e) => e, dataSource } = this.props;
    const { selectedRows } = this.state;
    const data = getEditTableData(dataSource).map((item) =>
    item._status === 'create'
      ? {
        ...item,
        poOrderId: undefined,
      }
      : item
  );
  let newList = []
  data.map((item) => {
    selectedRows.map((el) => {
      if(item.qaId === el.qaId) {
        newList.push(item)
      }
    })
  })
  const isAssign = newList.some((item) => item.answerUser);
  if(isAssign) {
    Modal.warning({
      content: intl.get('hzero.common.validation.atLeast1').d('已分配过'),
    });
    return false;
  }
    onAssign(newList, id, () => {
      this.setState({
        selectedRowKeys: [],
        selectedRows: [],
      });
      newList = []
    });
  }

  @Bind
  handleCaseDetailChange(val) {
    this.setState({
      caseDetailFlag: true,
    });
  }

  @Bind
  handleQaTypeChange() {
    this.setState({
      qaTypeFlag: true,
    });
  }

  @Bind
  handleSave() {
    const { onSave = (e) => e } = this.props;
    onSave();
    this.setState({
      selectedRowKeys: [],
      selectedRows: []
    })
  }

  render() {
    const {
      dataSource = [],
      pagination = {},
      saveLoading = false,
      fetchLoading = false,
      deleteLoading = false,
      submitFlag = false,
      onPurchaseRow = (e) => e
    } = this.props;
    const {
      selectedRowKeys = [],
      fastCodes = {},
      uploadVisible,
      caseDetailFlag = false,
      qaTypeFlag = false,
    } = this.state;
    const columns = [
      {
        title: intl.get('bid.bidcommon.view.title.suppliername').d('供应商'),
        dataIndex: 'supplierName',
        width: 180,
      },
      {
        title: intl.get('bid.bidcommon.view.title.customerfeedbackclassification').d('问题分类'),
        dataIndex: 'qaTypeNew',
        width: 250,
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('qaTypeNew', {
                initialValue: record.qaTypeNew,
              })(
                <ValueList
                  disabled={record.answerUser || record.ansPublished === 'y'}
                  style={{ width: '100%' }}
                  options={fastCodes['BID.CLASSIFICATION']}
                  lazyLoad={false}
                  allowClear
                  onChange={this.handleQaTypeChange}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('bid.bidcommon.view.title.clause').d('条目'),
        dataIndex: 'caseDetailNew',
        width: 180,
        render: (_, record) => {
          return (
            <Form.Item>
              <Tooltip title={record.caseDetailNew} placement="topLeft">
                {record.$form.getFieldDecorator('caseDetailNew', {
                  initialValue: record.caseDetailNew,
                })(<Input onChange={this.handleCaseDetailChange} disabled={record.answerUser || record.ansPublished === 'y'} />)}
              </Tooltip>
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('bid.bidcommon.view.title.question').d('问题'),
        dataIndex: 'qaContent',
        width: 180,
        render: (val, record) => (
          <Tooltip title={record.qaContent} placement="topLeft">
            <span>{record.qaContent}</span>
          </Tooltip>
        //   <Form.Item>
        //     {record.$form.getFieldDecorator('qaContent', {
        //       initialValue: val,
        //     })(<Input disabled />)}
        //   </Form.Item>
        ),
      },
      {
        title: intl.get('bid.bidcommon.view.title.fixedquestion').d('采购修正问题'),
        dataIndex: 'qaContentNew',
        width: 180,
        render: (val, record) => {
          return (
            <Form.Item>
              <Tooltip title={val} placement="topLeft">
                {record.$form.getFieldDecorator('qaContentNew', {
                  initialValue: val,
                })(<Input disabled={record.answerUser || record.ansPublished === 'y'} />)}
              </Tooltip>
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('bid.bidcommon.view.title.questiontime').d('提问时间'),
        dataIndex: 'askQuestTime',
        width: 180,
        render: (val) => dateRender(val),
      },
      {
        title: intl.get('bid.bidcommon.view.title.attachment').d('附件'),
        dataIndex: 'fileUrl',
        width: 180,
        render: (value, record) => (
          <UploadFile
            onUploadSuccess={(item) => onUploadSuccess(item, record)}
            onDeleteSuccess={() => onDeleteSuccess(record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={record.qaId}
            value={value}
            disabled={true}
            isFalse={true}
        />
        ),
      },
      {
        title: intl.get('bid.bidcommon.view.title.replycontent').d('CMI答复内容'),
        dataIndex: 'cmiAnswerContent',
        width: 180,
        render: (val, record) => (
          <Form.Item>
            <Tooltip title={val} placement="topLeft">
              {record.$form.getFieldDecorator('cmiAnswerContent', {
                initialValue: val,
              })(<Input disabled={!record.answerContent && record.answerUser || record.ansPublished === 'y'} />)}
            </Tooltip>
          </Form.Item>
        ),
      },
      {
        title: intl.get('bid.bidcommon.view.title.attchamentuploadbydemander').d('CMI补充的其他附件'),
        dataIndex: 'answerFileUrl',
        width: 180,
        render: (value, record) => (
          <UploadFile
            onUploadSuccess={(item) => onUploadSuccess(item, record)}
            onDeleteSuccess={() => onDeleteSuccess(record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={record.qaId}
            value={value}
            disabled={true}
            isFalse={true}
        />
        ),
      },
      {
        title: intl.get('bid.bidcommon.view.title.requestersreply').d('需求人提交的内容'),
        dataIndex: 'answerContent',
        width: 180,
        render: (val, record) => (
          <Tooltip title={val} placement="topLeft">
            <span>{val}</span>
          </Tooltip>
        )
        // render: (val, record) => (
        //   <Form.Item>
        //     {record.$form.getFieldDecorator('qaContent', {
        //       initialValue: val,
        //     })(<Input />)}
        //   </Form.Item>
        // ),
      },
      {
        title: intl.get('bid.bidcommon.view.title.replytime').d('答复时间'),
        dataIndex: 'answerTime',
        width: 180,
        render: (val) => dateRender(val),
      },
    ];

    const loading = saveLoading || deleteLoading || fetchLoading;
    // console.log('123321',this.props.projectQaModels.newFileUrl)
    const rowSelection = {
      columnWidth: 50,
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
        onPurchaseRow(rows);
      },
      getCheckboxProps: record => ({
        disabled: record.ansPublished === 'y' || !record.answerContent && record.answerUser,
      })
    };

    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }

    const draggerUploadProps = {
      name: 'file',
      multiple: true,
      // accept: 'image/*',
      data: this.uploadData,
      headers,
      action: `${API_HOST}${HZERO_FILE}/v1/${tenantId}/files/multipart`,
      beforeUpload: this.beforeUpload,
      onChange: this.onDraggerUploadChange,
      onRemove: this.onDraggerUploadRemove,
    };

    return (
      <div style={{ marginTop: '-10px' }}>
        {/* {isEdit && ( */}
        <div
          style={{
            marginBottom: '10px',
            float: 'right',
          }}
          className="customize-buttons"
        >
          <Button disabled={dataSource.length === 0} onClick={this.handleSave} loading={saveLoading}>
            <img src={saveIcon} alt="" style={{ width: '15px' }} />
            {intl.get('bid.bidcommon.view.button.save').d('保存')}
          </Button>
          <Lov
            isButton
            code="BID.ASSIGNDEMANDER"
            queryParams={{ tenantId: tenantId }}
            onChange={this.handleAssign}
            disabled={selectedRowKeys.length === 0 || loading}
          >
            {/* <img src={addIcon} alt="" /> */}
            {intl.get('bid.bidcommon.view.title.assign').d('分配')}
          </Lov>
          <Button>
          <UploadFile
            // onUploadSuccess={(item) => onUploadSuccess(item, record)}
            // onDeleteSuccess={() => onDeleteSuccess(record)}
            updataList={(e)=>this.updataList(e)}
            // beforeUpload={()=>this.getQaSummaryFile()}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={this.props.projectQaModels.newFileUrl}
            value={this.props.projectQaModels.newFileUrl}
            isFalse = {false}
        />
            {/* <img src={} alt="" /> */}
            {/* {intl.get('bid.bidcommon.view.title.uploadattachmentQA').d('答疑纪要上传')} */}
          </Button>
        </div>
        {/* )} */}
        <div style={{ clear: 'both' }} />
        <EditTable
          bordered
          rowKey="poOrderId"
          dataSource={dataSource}
          pagination={pagination}
          onChange={this.handlePageChange}
          columns={columns}
          loading={fetchLoading}
          rowSelection={rowSelection}
          onDataChange={this.handleDataChange}
          scroll={{ x: tableScrollWidth(columns) }}
        />
        <Modal
          title={intl.get(`hzero.common.upload.text`).d('上传附件')}
          visible={uploadVisible}
          // onOk={this.handleUploadOk}
          onCancel={this.handleCancel}
          cancelText={intl.get(`bid.bidcommon.view.button.cancel`).d('取消')}
          destroyOnClose
          width={520}
        >
          <Dragger {...draggerUploadProps}>
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-text">
              {intl
                .get(`hzero.common.upload.content`)
                .d('单击或拖动附件(10Mb以下)到此区域进行上传')}
            </p>
            <p className="ant-upload-hint">
              {intl.get(`hzero.common.upload.hint`).d('支持单个或批量上传')}
            </p>
          </Dragger>
        </Modal>
      </div>
    );
  }
}
