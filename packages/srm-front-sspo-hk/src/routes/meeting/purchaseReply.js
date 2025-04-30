/** -- CMI回复问题的表
 * @date: 2021/03/29 11:50:55
 * @author: Xukuan <kuan.xu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Form, Input, Button, Modal, Upload, Icon } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import { operatorRender } from 'utils/renderer';

import intl from 'utils/intl';
import { isString } from 'lodash';
import {
  getCurrentOrganizationId,
  getAccessToken,
  tableScrollWidth,
  getResponse,
} from 'utils/utils';
import { dateRender } from 'utils/renderer';
import Lov from 'components/Lov';
import { connect } from 'dva';
import EditTable from 'components/EditTable';
import ValueList from 'components/ValueList';
import { queryMapIdpValue } from 'services/api';
import UploadEdit from 'srm-front-boot/lib/components/Upload/index';
import { API_HOST } from 'utils/config';
import UploadFile from './UploadFile';
//  import deleteIcon from '@/assets/buttonIcons/删除.png';
import saveIcon from '@/assets/buttonIcons/保存.png';
import addIcon from '@/assets/buttonIcons/新建.png';
import { HZERO_FILE } from '@/common/config';
import notification from 'utils/notification';

const status = ['create', 'update'];
const tenantId = getCurrentOrganizationId();
const promptCode = `sodr.standardPurchaseOrder`;

const { Dragger } = Upload;

@connect(({ loading }, materiel) => ({
  materiel,
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
      fileList: '',
      ids: '',
      caseDetailFlag: false,
      qaTypeFlag: false
    };
    // this.unsaveFlag = false;
  }

  componentDidMount() {
    // this.checkPermission();
    this.fetchFastCode();
  }

  checkStatus(record) {
    const { isEdit } = this.props;
    return status.includes(record._status) && isEdit;
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
      Modal.confirm({
        title: intl
          .get('hzero.common.message.confirm.giveUpTip')
          .d('你有修改未保存，是否确认离开？'),
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
      ids: record.qaId
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
  handleUploadOk() {
    this.props.dataSource.map(item => {
      if (item._status != 'create') {
        if (item.qaId == this.state.ids) {
          item.fileUrl = item.fileUrl + ',' + this.state.fileList
          // console.log(item.fileUrl,'134')
        }
      } else {
        if (item.organizationId == this.state.ids) {
          item.fileUrl = item.fileUrl + ',' + this.state.fileList
        }
      }
    })
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
      storageCode: 'BID.FILEUPLOAD',

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
    // console.log('url', file)
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
  handleDistribution() { }

  @Bind
  handleAssign(value) {
    const { onAssign = (e) => e } = this.props;
    const { selectedRowKeys, selectedRows } = this.state;
    onAssign(selectedRowKeys, selectedRows, value, () => {
      this.setState({
        selectedRowKeys: [],
        selectedRows: [],
      });
    });
  }

  @Bind
  handleCaseDetailChange(val) {
    // console.log('val', val)
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

  render() {
    const {
      dataSource = [],
      pagination = {},
      onSave = (e) => e,
      saveLoading = false,
      fetchLoading = false,
      deleteLoading = false,
      // onAssign = (e) => e,
      isEdit = false,
    } = this.props;
    // console.log(dataSource)
    const { selectedRowKeys = [], fastCodes = {}, uploadVisible, caseDetailFlag = false, qaTypeFlag = false } = this.state;
    const columns = [
      {
        title: intl.get('spsm.taskHandover.model.taskT1ype').d('供应商'),
        dataIndex: 'supplierName',
        width: 180,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item style={{ width: '150px' }}>
              {record.$form.getFieldDecorator('supplierName', {
                initialValue: val,
              })(
                <Input />
              )}
            </Form.Item>
          ) : (
            val
          )
      },
      {
        title: '采购内容',
        dataIndex: 'qaType',
        width: 180,
        render: (val, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator(qaTypeFlag ? 'qaTypeNew' : 'qaType', {
                initialValue: record.qaTypeNew ? record.qaTypeNew : record.qaType,
              })(
                <ValueList
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
        title: '规格型号/服务内容',
        dataIndex: 'caseDetail',
        width: 180,
        render: (val, record) => {
          // console.log('条目', val,record)
          return (
            <Form.Item>
              {record.$form.getFieldDecorator(caseDetailFlag ? 'caseDetailNew' : 'caseDetail', {
                initialValue: record.caseDetailNew ? record.caseDetailNew : record.caseDetail,
              })(<Input onChange={this.handleCaseDetailChange} />)}
            </Form.Item>
          )
        }
      },
      {
        title: '问题',
        dataIndex: 'qaContent',
        width: 180,
        render: (val, record) =>
          record._status === 'create' ? (
            <Form.Item style={{ width: '250px' }}>
              {record.$form.getFieldDecorator('qaContent', {
                initialValue: val,
              })(
                <Input />
              )}
            </Form.Item>
          ) : (
            val
          )
      },
      {
        title: '答复内容',
        dataIndex: 'qaContentNew',
        width: 180,
        render: (val, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('qaContentNew', {
                initialValue: val,
              })(<Input />)}
            </Form.Item>
          )
        }
      },
      {
        title: '答复时间',
        dataIndex: 'answerTime',
        width: 180,
        render: (val) => dateRender(val),
      },
      {
        title: '附件',
        dataIndex: 'fileUrl',
        width: 180,
        render: (value, record) => (
          // <UploadEdit
          //   bucketName="private-bucket"
          //   attachmentUUID={value}
          //   tenantId={tenantId}
          //   btnText="查看附件"
          //   viewOnly
          //   filePreview
          // />
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
        title: '操作',
        render: (val, record) => {
          const operators = [];
          operators.push({
            key: 'view',
            ele: (

              <a onClick={() => this.handleUpload(record)}>
                {/* <img src={} alt="" /> */}
                {intl.get('hzero.common.button.a1dd').d('附件上传')}
              </a>
            ),
            len: 8,
            title: intl.get('hzero.common.button').d('附件上传'),
          })
          return operatorRender(operators, record, { limit: 5 });
        }
      }
    ];

    const loading = saveLoading || deleteLoading || fetchLoading;

    const rowSelection = {
      columnWidth: 50,
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: rows,
        });
      },
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
          <Button onClick={onSave}>
            <img src={saveIcon} alt="" style={{ width: '15px' }} />
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button onClick={this.handleAddLine}>
            <img src={saveIcon} alt="" style={{ width: '15px' }} />
            {intl.get('hzero.common.button.add').d('添加')}
          </Button>

        </div>
        {/* )} */}
        <div style={{ clear: 'both' }} />
        <EditTable
          bordered
          //  rowKey="poOrderId"
          dataSource={dataSource}
          pagination={pagination}
          //  onChange={this.handlePageChange}
          columns={columns}
          //  loading={fetchLoading}
          rowSelection={rowSelection}
          //  onDataChange={this.handleDataChange}
          scroll={{ x: tableScrollWidth(columns) }}
        />
        <Modal
          title={intl.get(`hzero.common.upload.text`).d('上传附件')}
          visible={uploadVisible}
          onOk={this.handleUploadOk}
          onCancel={this.handleCancel}
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
