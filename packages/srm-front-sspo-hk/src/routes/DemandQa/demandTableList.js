/** -- 需求人答疑表
 * @date: 2022/05/29 11:50:55
 * @author: Cj <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { Form, Input, Button, Modal, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import {
  getCurrentOrganizationId,
  getAccessToken,
  tableScrollWidth,
  getResponse,
} from 'utils/utils';
import { dateRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import ValueList from 'components/ValueList';
import { queryMapIdpValue } from 'services/api';
import styles from './index.less';
import saveIcon from '@/assets/buttonIcons/保存.png';
import exportIcon from '@/assets/buttonIcons/导出.png';
import UploadFile from './UploadFile';
import formatterCollections from 'utils/intl/formatterCollections';
import ExcelExport from '@/components/ExcelExport';
import { SRM_BID } from '@/common/config';

const status = ['create', 'update'];
const tenantId = getCurrentOrganizationId();

@formatterCollections({
  code: ['bid.bidcommon'],
})

@Form.create({ fieldNameProp: null })
export default class demandTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // selectedRows: [],
      selectedRowKeys: [],
      fastCodes: {},
      fileList: [],
    };
    // this.unsaveFlag = false;
  }

  componentDidMount() {
    // this.checkPermission();
    this.fetchFastCode();
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
   * 监听编辑事件，更改当前未保存状态
   *
   * @memberof OrderGroup
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
   * @memberof OrderGroup
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

  @Bind
  onUploadSuccess(fileList, res) {
    const { dataSource } = this.props;
    let newFileUrl = '';
    fileList.map((item, index) => {
      if(index == 0) {
        newFileUrl = item.fileUrl
      } else {
        newFileUrl =newFileUrl +','+item.fileUrl
      }
    })
    dataSource.map(item => {
      if(item._status != 'create') {
        if (item.qaId == res.qaId) {
          item.answerFileUrl = newFileUrl
        }
      } else {
        if (item.poOrderId == res.poOrderId) {
          item.answerFileUrl = newFileUrl
        }
      }
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
      isEdit,
      submitFlag,
      proId,
      milestoneId,
      demandQaFileList = []
    } = this.props;

    const { fastCodes = {} } = this.state;
    const columns = [
      {
        title: intl.get(`bid.bidcommon.view.title.customerfeedbackclassification`).d('问题分类'),
        dataIndex: 'qaType',
        render: (val, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('qaType', {
                initialValue: record.qaTypeNew ? record.qaTypeNew : record.qaType,
              })(
                <ValueList
                  style={{ width: '100%' }}
                  options={fastCodes['BID.CLASSIFICATION']}
                  lazyLoad={false}
                  allowClear
                  disabled
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`bid.bidcommon.view.title.clause`).d('条目'), 
        dataIndex: 'caseDetail',
        width: 180,
        render: (val, record) => (
          <Form.Item>
            <Tooltip title={val} placement="topLeft">
              {record.$form.getFieldDecorator('caseDetail', {
                initialValue: record.caseDetailNew ? record.caseDetailNew : record.caseDetail,
              })(<Input disabled />)}
            </Tooltip>
          </Form.Item>
        ),
      },
      {
        title: intl.get(`bid.bidcommon.view.title.question`).d('问题'),
        dataIndex: 'qaContent',
        width: 180,
        render: (val, record) => (
          <Form.Item>
            <Tooltip title={val} placement="topLeft">
              {record.$form.getFieldDecorator('qaContent', {
                initialValue: record.qaContentNew ? record.qaContentNew : record.qaContent,
              })(<Input disabled />)}
            </Tooltip>
          </Form.Item>
        ),
      },
      {
        title: intl.get(`bid.bidcommon.view.title.attachment`).d('附件'),
        dataIndex: 'fileUrl',
        width: 150,
        render: (value, record) => (
          <UploadFile
            onUploadSuccess={(item) => this.onUploadSuccess(item, record)}
            // onDeleteSuccess={() => onDeleteSuccess(record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={record.qaId}
            value={value}
            disabled
          />
        ),
      },
      {
        title: intl.get(`bid.bidcommon.view.title.attchamentuploadbydemander`).d('CMI补充的其他附件'),
        dataIndex: 'answerFileUrl',
        width: 180,
        render: (value, record) => (
          <UploadFile
            onUploadSuccess={(item) => this.onUploadSuccess(item, record)}
            // onDeleteSuccess={() => onDeleteSuccess(record)}
            tableName="SPUC_PO_CON_ATTACH"
            parentId={value}
            value={value}
            disabled={record.publishedToJudge === 'y' || !isEdit}
          />
        ),
      },
      {
        title: intl.get(`bid.bidcommon.view.title.requestersreply`).d('需求人提交的内容'),
        dataIndex: 'answerContent',
        onHeaderCell: () => ({ className: styles['table-thead-required'] }),
        render: (val, record) => (
          <Form.Item>
            <Tooltip title={val} placement="topLeft">
              {record.$form.getFieldDecorator('answerContent', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`bid.bidcommon.view.title.requestersreply`).d('需求人提交的内容'),
                    }),
                  },
                ],
              })(<Input disabled={record.publishedToJudge === 'y' || !isEdit} />)}
            </Tooltip>
          </Form.Item>
        ),
      },
      {
        title: intl.get(`bid.bidcommon.view.title.replytime`).d('答复时间'),
        dataIndex: 'answerTime',
        width: 130,
        render: (val) => dateRender(val),
      },
    ];
    const loading = saveLoading || deleteLoading || fetchLoading;

    // const rowSelection = {
    //   columnWidth: 50,
    //   selectedRowKeys,
    //   onChange: (keys) => {
    //     this.setState({
    //       selectedRowKeys: keys,
    //       // selectedRows: rows,
    //     });
    //   },
    // };

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

    return (
      <div style={{ marginTop: '-10px' }}>
        {isEdit && (
        <div
          style={{
            marginBottom: '10px',
            float: 'right',
          }}
          className="customize-buttons"
        >
          <ExcelExport
            requestUrl={`${SRM_BID}/v1/${tenantId}/bid-qas/exportQueryPuestQuestionAnsList?proId=${proId}&milestoneId=${milestoneId}&type=4`}
            // queryParams={
            //   proId,
            //   milestoneId
            //   type
            // }
            downloadType="Blob"
            fileName={intl
              .get(`bid.bidcommon.view.title.Questionansweringoutputofthedemander`)
              .d('需求人答疑导出')}
            otherButtonProps={{
              type: 'default',
              icon: null,
            }}
            buttonText={
              <>
                <img src={exportIcon} alt="" />
                {intl.get('bid.bidcommon.view.button.export').d('导出')}
              </>
            }
          />
          <Button onClick={onSave} loading={saveLoading} disabled={loading || submitFlag}>
            <img src={saveIcon} alt="" style={{ width: '15px' }} />
            {intl.get('bid.bidcommon.view.button.save').d('保存')}
          </Button>
        </div>
        )}
        <div style={{ clear: 'both' }} />
        <EditTable
          bordered
          rowKey="qaId"
          dataSource={dataSource}
          pagination={pagination}
          onChange={this.handlePageChange}
          columns={columns}
          loading={fetchLoading}
          // rowSelection={rowSelection}
           onDataChange={this.handleDataChange}
           scroll={{ x: tableScrollWidth(columns) }}
        />
      </div>
    );
  }
}
