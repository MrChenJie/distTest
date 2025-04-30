/*
 * @Description: 账单列表 - 发票附件
 * @LastEditors: 何智鹏 <he.zhipeng@hand-china.com>
 * @Date: 2023-08-10 17:33:39
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { Component } from 'react';
import dayjs from 'dayjs';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import { tableScrollWidth, getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import CusButton from '_cus_components/CusButton';
import EditTable from '_cus_components/EditTable';
import CusSelect from '_cus_components/CusSelect';
import CusUpload from '_cus_components/CusUpload';
import CusInput from '_cus_components/CusInput';
import CusModal from '_cus_components/CusModal';
import cusRequest from '_cus_utils/request';
import { batchDownloadFile } from '@/common/utils';

const organizationId = getCurrentOrganizationId();

@connect(({ resaleRequestDetail = {} }) => ({ resaleRequestDetail }))
export default class index extends Component {
  state = {
    selectedRowKeys: [], // 账单列表 - 勾选key
    selectedRows: [], // 账单列表 - 勾选的数据
    downloadBtnLoading: false, // 批量下载按钮 - loading
    // deleteBtnLoading: false, // 删除按钮 - loading
  };

  /**
   * @name: 定义 - Table列元素
   * @return {array} Table列数据集
   */
  get columns() {
    const { resaleRequestDetail, editFlag } = this.props;
    const { lovData } = resaleRequestDetail;
    return [
      {
        title: intl.get(`spcm.paymentRequest.model.attachmentType`).d('附件类型'),
        dataIndex: 'fileType',
        width: 120,
        required: true,
        render: (val, record) => {
          const data = lovData.RS_IP_ATTACHMENT_TYPE;
          if (editFlag) {
            return (
              <Form.Item>
                {record?.$form?.getFieldDecorator('fileType', {
                  initialValue: val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spcm.paymentRequest.model.attachmentType`).d('附件类型'),
                      }),
                    },
                  ],
                })(<CusSelect options={data?.filter((item) => item.tag === '3')} />)}
              </Form.Item>
            );
          } else {
            let text = val;
            data.map((list) => {
              if (list.value === val) {
                text = list.meaning;
              }
              return list;
            });
            return text;
          }
        },
      },
      {
        title: intl.get(`spcm.paymentRequest.model.attachDescription`).d('附件描述'),
        dataIndex: 'attachDescription',
        width: 160,
        render: (val, record) => {
          if (editFlag) {
            return (
              <Form.Item>
                {record?.$form?.getFieldDecorator('attachDescription', {
                  initialValue: val,
                })(<CusInput.TextArea autoChangeSize />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`spcm.paymentRequest.model.creator`).d('上传人'),
        dataIndex: 'realName',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.uploadDate`).d('上传日期'),
        dataIndex: 'creationDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.description`).d('说明'),
        dataIndex: 'remark',
        width: 160,
        render: (val, record) => {
          if (editFlag) {
            return (
              <Form.Item>
                {record?.$form?.getFieldDecorator('remark', {
                  initialValue: val,
                })(<CusInput.TextArea autoChangeSize />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`spcm.paymentRequest.model.attachment`).d('附件'),
        dataIndex: 'uuid',
        width: 140,
        render: (val, record) => (
          <CusUpload
            bucketName="cost-payment-files"
            tenantId={organizationId}
            viewOnly={!editFlag}
            attachmentUUID={val}
            showReUploadIcon={false}
            onChange={(attachmentUUID) => record?.$form.setFieldsValue({ uuid: attachmentUUID })}
            onCloseUploadModal={() => {
              this.setFileQuantity(record, val);
            }}
          />
        ),
      },
    ];
  }

  /**
   * @name: 操作 - 计算附件个数
   * @param {object} record 行数据集
   * @param {string} uuid - 附件唯一标识
   */
  setFileQuantity = (record, uuid) => {
    // uuid为空则默认没有附件
    if (uuid === undefined) {
      Object.assign(record, {
        fileQuantity: 0,
      });
      return;
    }
    cusRequest(`/hfle/v1/${organizationId}/files/${uuid}/file`, {
      method: 'GET',
      query: {
        attachmentUUID: uuid,
        bucketName: 'private-bucket',
        tenantId: organizationId,
      },
    }).then((res) => {
      if (res) {
        Object.assign(record, {
          fileQuantity: res.length || 0,
          creationDate: dayjs().format(DEFAULT_DATETIME_FORMAT),
          realName: getCurrentUser().realName,
        });
      }
    });
  };

  /**
   * @name: 操作 - 批量下载
   */
  handleDownload = async () => {
    const { selectedRows } = this.state;
    this.setState({ downloadBtnLoading: true });
    await batchDownloadFile(
      selectedRows
        .filter((item) => item.uuid !== undefined)
        .map((item) => {
          return {
            attachmentUuid: item.uuid,
            fileDir: item.fileType,
          };
        }),
      intl.get('spcm.costPayment.view.file.summary').d('附件汇总')
    );
    this.setState({ downloadBtnLoading: false });
  };

  /**
   * @name: 操作 - 删除
   */
  handleDelete = () => {
    const { dataSource, resaleRequestDetail, dispatch } = this.props;
    const { blListNewAttachment } = resaleRequestDetail;
    const { selectedRows } = this.state;
    CusModal.CusDeleteConfirm(() => {
      let flag = true; // 是否本地删除标识
      const deleteArray = [];
      selectedRows.map((list) => {
        deleteArray.push(list.uuid);
        if (list._status === 'update') {
          flag = false;
        }
        return list;
      });
      if (flag) {
        // 仅本地删除
        const data = [];
        [...dataSource, ...blListNewAttachment].map((list) => {
          if (!deleteArray.includes(list.uuid)) {
            data.push(list);
          }
          return list;
        });
        dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: {
            blListAttachment: data,
            blListNewAttachment: [],
          },
        });
      } else {
        // 后台删除
        // TODO 调删除接口
      }
    });
  };

  render() {
    const { editFlag, dataSource, resaleRequestDetail, dispatch } = this.props;
    const { blListNewAttachment } = resaleRequestDetail;
    const { selectedRowKeys, selectedRows, downloadBtnLoading } = this.state;
    const rowSelection = {
      fixed: true,
      selectedRowKeys,
      onChange: (selectedRowKeys2, selectedRows2) =>
        this.setState({ selectedRowKeys: selectedRowKeys2, selectedRows: selectedRows2 }),
    };
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ width: '78%' }}>
            {editFlag &&
              intl
                .get('spcm.costPayment.view.tip.requiredAttachment')
                .d(
                  '注意：当上传附件选择附件类型为发票时，对应附件会开放给供应商查看，请注意发票类型的附件只能上传发票附件。'
                )}
          </div>
          <div style={{ width: '22%', textAlign: 'right' }}>
            <CusButton
              mini
              disabled={selectedRows.length === 0}
              loading={downloadBtnLoading}
              onClick={this.handleDownload}
            >
              {intl.get('hzero.common.button.batchDownload').d('批量下载')}
            </CusButton>
            {editFlag && (
              <>
                <CusButton mini disabled={selectedRows.length === 0} onClick={this.handleDelete}>
                  {intl.get('hzero.common.button.delete').d('删除')}
                </CusButton>
                <CusButton
                  mini
                  type="primary"
                  onClick={() => {
                    dispatch({
                      type: 'resaleRequestDetail/handleSetState',
                      payload: {
                        blListNewAttachment: [
                          ...blListNewAttachment,
                          { _status: 'create', uuid: uuidv4(), fileType: 'RS_INVOICE' },
                        ],
                      },
                    });
                  }}
                >
                  {intl.get('hzero.common.button.create').d('新建')}
                </CusButton>
              </>
            )}
          </div>
        </div>
        <EditTable
          rowKey="uuid"
          columns={this.columns}
          dataSource={[...dataSource, ...blListNewAttachment]}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(this.columns) }}
        />
      </>
    );
  }
}
