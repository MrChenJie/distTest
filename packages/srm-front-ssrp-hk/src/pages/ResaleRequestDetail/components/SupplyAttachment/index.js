/*
 * @Description: 转售采购成品付款申请 - 补充附件
 * @LastEditors: 何智鹏 <he.zhipeng@hand-china.com>
 * @Date: 2023-08-25 10:41:58
 * @Copyright: Copyright (c) 2023, Hand
 */
import {
  saveSupplyAttachment,
  deleteSupplyAttachment,
} from '@/services/resaleRequestDetailService';
import dayjs from 'dayjs';
import { connect } from 'dva';
import { Form } from 'hzero-ui';
import React, { Component } from 'react';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import { getCurrentOrganizationId, getCurrentUser, tableScrollWidth } from 'utils/utils';
import uuidv4 from 'uuid/v4';
import CusButton from '_cus_components/CusButton';
import CusInput from '_cus_components/CusInput';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import CusSelect from '_cus_components/CusSelect';
import CusUpload from '_cus_components/CusUpload';
import EditTable from '_cus_components/EditTable';
import cusRequest from '_cus_utils/request';

const organizationId = getCurrentOrganizationId();

@connect(({ resaleRequestDetail = {} }) => ({ resaleRequestDetail }))
export default class index extends Component {
  state = {
    selectedRowKeys: [], // 账单列表 - 勾选key
    selectedRows: [], // 账单列表 - 勾选的数据
    saveLoading: false, // 保存 - 加载标识
    deleteLoading: false, // 删除 - 加载标识
  };

  /**
   * @name: 定义 - Table列元素
   * @return {array} Table列数据集
   */
  get columns() {
    const { lovData, viewButtonFlag } = this.props.resaleRequestDetail;
    return [
      {
        title: intl.get(`spcm.paymentRequest.model.supply.fileType`).d('附件类型'),
        dataIndex: 'fileType',
        width: 120,
        render: (val, record) => {
          const data = lovData.RS_IP_ATTACHMENT_TYPE;
          if (viewButtonFlag) {
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
                })(<CusSelect options={data?.filter((item) => item.tag === '4')} />)}
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
        title: intl.get(`spcm.paymentRequest.model.supply.customerRef`).d('客户参考编号'),
        dataIndex: 'customerRef',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.supply.attachDescription`).d('附件描述'),
        dataIndex: 'attachDescription',
        width: 160,
        render: (val, record) => {
          if (viewButtonFlag) {
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
        title: intl.get(`spcm.paymentRequest.model.supply.creator`).d('上传人'),
        dataIndex: 'creator',
        width: 160,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.supply.creationDate`).d('上传日期'),
        dataIndex: 'creationDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`spcm.paymentRequest.model.supply.remarks`).d('备注'),
        dataIndex: 'remarks',
        width: 160,
        render: (val, record) => {
          if (viewButtonFlag) {
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
        title: intl.get(`spcm.paymentRequest.model.supply.attachment`).d('附件'),
        dataIndex: 'uuid',
        width: 140,
        render: (val, record) => (
          <CusUpload
            bucketName="payment-advice"
            tenantId={organizationId}
            viewOnly={!viewButtonFlag}
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
   * @name: 操作 - 删除
   */
  handleDelete = () => {
    const { resaleRequestDetail, dispatch, handleSupplyAttachment } = this.props;
    const { supplyAttachmentSource, supplyAttachmentPagination } = resaleRequestDetail;
    const { selectedRows } = this.state;
    CusModal.CusDeleteConfirm(async () => {
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
        supplyAttachmentSource.map((list) => {
          if (!deleteArray.includes(list.uuid)) {
            data.push(list);
          }
          return list;
        });
        dispatch({
          type: 'resaleRequestDetail/handleSetState',
          payload: {
            supplyAttachmentSource: data,
          },
        });
        this.setState({
          selectedRowKeys: [],
          selectedRows: [],
        });
      } else {
        // 后台删除
        const data = [];
        selectedRows.map((list) => {
          if (list._status === 'update') {
            data.push(list);
          }
          return list;
        });
        this.setState({ deleteLoading: true });
        const res = await deleteSupplyAttachment(data);
        if (res) {
          CusNotification.success();
          handleSupplyAttachment(supplyAttachmentPagination);
        }
        this.setState({ deleteLoading: false });
      }
    });
  };

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
        bucketName: 'payment-advice',
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
   * @name: 操作 - 保存
   */
  handleSave = async () => {
    const { resaleRequestDetail, handleSupplyAttachment } = this.props;
    const {
      supplyAttachmentSource,
      supplyAttachmentPagination,
      costRequestId,
    } = resaleRequestDetail;
    let flag = true;
    const data = supplyAttachmentSource.map((list) => {
      const { validateFieldsAndScroll, getFieldsValue } = list?.$form || {};
      validateFieldsAndScroll();
      const res = getFieldsValue();
      if (!res.fileType) {
        flag = false;
      }
      return { ...list, ...res };
    });
    if (flag) {
      this.setState({ saveLoading: true });
      const res = await saveSupplyAttachment(data, costRequestId);
      if (res) {
        CusNotification.success();
        handleSupplyAttachment(supplyAttachmentPagination);
      }
      this.setState({ saveLoading: false });
    }
  };

  render() {
    const { selectedRowKeys, saveLoading, deleteLoading } = this.state;
    const { resaleRequestDetail, dispatch, handleSupplyAttachment } = this.props;
    const {
      supplyAttachmentSource,
      headerData,
      viewButtonFlag,
      supplyAttachmentPagination,
    } = resaleRequestDetail;
    const { checkDateFlag } = headerData;
    const rowSelection = {
      fixed: true,
      selectedRowKeys,
      onChange: (selectedRowKeys2, selectedRows2) =>
        this.setState({ selectedRowKeys: selectedRowKeys2, selectedRows: selectedRows2 }),
    };
    return (
      <>
        <div style={{ display: 'flex', marginBottom: 16, alignItems: 'center' }}>
          <div style={{ color: '#f54a45', width: '70%' }}>
            {supplyAttachmentSource.length > 0 &&
              checkDateFlag === 'Y' &&
              intl
                .get(`${prompt}.view.message.supplyAttachment.notProvided`)
                .d('银行自付款日起30天，尚未提供付款凭证信息')}
          </div>
          {viewButtonFlag && (
            <div style={{ width: '30%', textAlign: 'right' }}>
              <CusButton mini loading={saveLoading} onClick={this.handleSave}>
                {intl.get('hzero.common.button.save').d('保存')}
              </CusButton>
              <CusButton
                mini
                loading={deleteLoading}
                disabled={selectedRowKeys.length === 0}
                onClick={this.handleDelete}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </CusButton>
              <CusButton
                mini
                type="primary"
                onClick={() => {
                  dispatch({
                    type: 'resaleRequestDetail/handleSetState',
                    payload: {
                      supplyAttachmentSource: [
                        { _status: 'create', uuid: uuidv4() },
                        ...supplyAttachmentSource,
                      ],
                    },
                  });
                }}
              >
                {intl.get('hzero.common.button.create').d('新建')}
              </CusButton>
            </div>
          )}
        </div>
        <EditTable
          rowKey="uuid"
          columns={this.columns}
          dataSource={supplyAttachmentSource}
          rowSelection={viewButtonFlag ? rowSelection : false}
          pagination={supplyAttachmentPagination}
          onChange={handleSupplyAttachment}
          scroll={{ x: tableScrollWidth(this.columns) }}
        />
      </>
    );
  }
}
