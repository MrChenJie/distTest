/** -- CMI回复问题的表
 * @date: 2022/04/29 11:50:55
 * @author: CJ <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { Form, Upload, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { isString } from 'lodash';
import UploadFile from './UploadFile';
import {
  getCurrentOrganizationId,
  getAccessToken,
  tableScrollWidth,
  getResponse,
  getEditTableData,
  getCurrentLanguage
} from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { connect } from 'dva';
import EditTable from '_cus_components/EditTable';
import CusSelect from '_cus_components/CusSelect';
import { queryMapIdpValue } from 'services/api';
import UploadEdit from 'srm-front-boot/lib/components/Upload/index';
import { API_HOST } from 'utils/config';
import { HZERO_FILE } from '@/common/config';
import notification from '_cus_components/CusNotification';
import formatterCollections from 'utils/intl/formatterCollections';
import CusButton from '_cus_components/CusButton';
import CusLov from '_cus_components/CusLov';
import CusSpin from '_cus_components/CusSpin';
import CusInput from '_cus_components/CusInput';
import CusModal from '_cus_components/CusModal';
import { tooltipRender } from '_cus_utils/render';

const status = ['create', 'update'];
const tenantId = getCurrentOrganizationId();
const currentLanguage = getCurrentLanguage();

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
    this.props.onRef && this.props.onRef(this);
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
      CusModal.confirm({
        content: intl
          .get('hzero.common.message.confirm.giveUpTip')
          .d('你有修改未保存，是否确认离开？'),
        okType: 'normal',
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
    CusModal.warning({
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

  // @Bind
  // handleSave() {
  //   const { onSave = (e) => e } = this.props;
  //   onSave();
  //   this.setState({
  //     selectedRowKeys: [],
  //     selectedRows: []
  //   })
  // }

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
        render: tooltipRender,
      },
      {
        title: intl.get('bid.bidcommon.view.title.customerfeedbackclassification').d('问题分类'),
        dataIndex: 'qaTypeNew',
        width: 250,
        render: (_, record) => {
          return (
            record.answerUser || record.ansPublished === 'y' ?
            tooltipRender(record.qaTypeNewMeaning)
            :
            <Form.Item>
              {record.$form.getFieldDecorator('qaTypeNew', {
                initialValue: record.qaTypeNew,
              })(
                <CusSelect
                  allowClear
                  style={{ width: '100%' }}
                  options={fastCodes['BID.CLASSIFICATION']}
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
            record.answerUser || record.ansPublished === 'y' ?
            tooltipRender(record.caseDetailNew)
            :
            <Form.Item>
              {record.$form.getFieldDecorator('caseDetailNew', {
                initialValue: record.caseDetailNew,
              })(
                <CusInput.TextArea autoChangeSize={true} onChange={this.handleCaseDetailChange} />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('bid.bidcommon.view.title.question').d('问题'),
        dataIndex: 'qaContent',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get('bid.bidcommon.view.title.fixedquestion').d('采购修正问题'),
        dataIndex: 'qaContentNew',
        width: 180,
        render: (val, record) => {
          return (
            record.answerUser || record.ansPublished === 'y' ?
            tooltipRender(val)
            :
            <Form.Item>
              {record.$form.getFieldDecorator('qaContentNew', {
                initialValue: val,
              })(<CusInput.TextArea autoChangeSize={true} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get('bid.bidcommon.view.title.questionDate').d('提问日期'),
        dataIndex: 'askQuestTime',
        width: currentLanguage === 'zh_CN' ? 115 : 135,
        render: (val) => dateRender(val),
      },
      {
        title: intl.get('bid.bidcommon.view.title.attachment').d('附件'),
        dataIndex: 'fileUrl',
        width: currentLanguage === 'zh_CN' ? 90 : 160,
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
          !record.answerContent && record.answerUser || record.ansPublished === 'y' ?
          tooltipRender(val)
          :
          <Form.Item>
            {record.$form.getFieldDecorator('cmiAnswerContent', {
              initialValue: val,
            })(<CusInput.TextArea autoChangeSize={true} />)}
          </Form.Item>
        ),
      },
      {
        title: intl.get('bid.bidcommon.view.title.attchamentuploadbydemander').d('CMI补充的其他附件'),
        dataIndex: 'answerFileUrl',
        width: currentLanguage === 'zh_CN' ? 160 : 170,
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
        title: intl.get('bid.bidcommon.view.title.demandPerson').d('需求人'),
        dataIndex: 'answerUserName',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get('bid.bidcommon.view.title.requestersreply').d('需求人提交的内容'),
        dataIndex: 'answerContent',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get('bid.bidcommon.view.title.replyDate').d('答复日期'),
        dataIndex: 'answerTime',
        width: 115,
        render: (val) => dateRender(val),
      },
    ];

    // const loading = saveLoading || deleteLoading || fetchLoading;
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
      <>
        <CusSpin spinning={saveLoading}>
          {/* <div style={{marginBottom: '16px', textAlign: 'right'}}> */}
            {/* <CusButton
              mini
              disabled={dataSource.length === 0}
              onClick={this.handleSave}
            >
              {intl.get('bid.bidcommon.view.button.save').d('保存')}
            </CusButton> */}
            {/* <CusLov
              mini
              isButton
              code="BID.ASSIGNDEMANDER"
              queryParams={{ tenantId: tenantId }}
              onChange={this.handleAssign}
              disabled={selectedRowKeys.length === 0 || loading}
            >
              {intl.get('bid.bidcommon.view.title.assign').d('分配')}
            </CusLov> */}
            {/* <UploadFile
              // onUploadSuccess={(item) => onUploadSuccess(item, record)}
              // onDeleteSuccess={() => onDeleteSuccess(record)}
              updataList={(e)=>this.updataList(e)}
              // beforeUpload={()=>this.getQaSummaryFile()}
              tableName="SPUC_PO_CON_ATTACH"
              parentId={this.props.projectQaModels.newFileUrl}
              value={this.props.projectQaModels.newFileUrl}
              isFalse = {false}
            /> */}
          {/* </div> */}
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
        </CusSpin>
        <CusModal
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
        </CusModal>
      </>
    );
  }
}
