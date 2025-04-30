import React from 'react';
import intl from 'utils/intl';
import { Form, Tag } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import cusRequest from '_cus_utils/request';
import {
  tableScrollWidth,
  getCurrentOrganizationId,
  getEditTableData,
  getCodeMeaning,
  getCurrentUser,
  getCurrentLanguage,
} from 'utils/utils';
import { dateRender } from 'utils/renderer';
import uuidv4 from 'uuid/v4';
import { SRM_SPUC } from '_utils/config';
import { sum, isEmpty } from 'lodash';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import EditTable from '_cus_components/EditTable';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import CusSelect from '_cus_components/CusSelect';
import CusUpload from '_cus_components/CusUpload';
import CusInput from '_cus_components/CusInput';
import CusNotification from '_cus_components/CusNotification';
import { tooltipRender } from '_cus_utils/render';
import { batchDownloadFile } from '@/common/utils';
import dayjs from 'dayjs';

const organizationId = getCurrentOrganizationId();

export default class Attachment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      localTempId: undefined, // 用于点击取消时，多虑此次操作的数据
      visible: false,
      dataSource: [],
      downloading: false,
      deleteLoading: false,
      selectedRows: [],
      selectedRowKeys: [],
    };
  }

  // 组件的值需要通过DataSource属性传递，因通过表单传递时，数组里版本号改变时，通过initialValue传递过来的props不变。
  componentDidMount() {
    this.updateDataSource(this.props.dataSource || []);
  }

  componentDidUpdate(prevProps) {
    const { dataSource = [] } = this.props;
    if (!isEmpty(dataSource)) {
      const currentVersion = dataSource[0]?.objectVersionNumber;
      if (currentVersion && currentVersion !== prevProps.dataSource[0]?.objectVersionNumber) {
        // 子组件需要更新数据的相关逻辑
        this.updateDataSource(this.props.dataSource || []);
      }
    }
  }

  @Bind
  @Debounce(500, { leading: true })
  async handleDownload() {
    const { idpValueMap = {}, prompt } = this.props;
    const { selectedRows } = this.state;
    if (selectedRows.length === 0) {
      return false;
    }
    this.setState({
      downloading: true,
    });
    await batchDownloadFile(
      selectedRows
        .filter((item) => item.uuid !== undefined)
        .map((item) => {
          return {
            attachmentUuid: item.uuid,
            fileDir: getCodeMeaning(item.fileType, idpValueMap.RS_IP_ATTACHMENT_TYPE),
          };
        }),
      intl.get(`${prompt}.view.file.invoice`).d('发票附件')
    );
    this.setState({
      downloading: false,
      selectedRows: [],
      selectedRowKeys: [],
    });
  }

  isEdit(record) {
    const { disabled } = this.props;
    return ['create', 'update'].includes(record._status) && !disabled;
  }

  @Bind
  handleCreate() {
    const { parentId, rowKey } = this.props;
    const { dataSource, localTempId } = this.state;
    const tempId = uuidv4();
    if (!localTempId) {
      this.setState({
        localTempId: tempId,
      });
    }
    const newAttItem = {
      localTempId: localTempId || tempId,
      [rowKey]: uuidv4(),
      ...parentId,
      fileQuantity: 0,
      _status: 'create',
      fileType: 'INVOICE',
    };
    this.updateDataSource([...dataSource, newAttItem]);
  }

  @Bind
  handleDelete() {
    const { rowKey } = this.props;
    const { selectedRows, selectedRowKeys, dataSource } = this.state;
    if (selectedRows.length <= 0) {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
      return false;
    }
    const deleteData = dataSource.filter(
      (item) => selectedRowKeys.includes(item[rowKey]) && item._status === 'update'
    );
    if (deleteData.length > 0) {
      cusRequest(`${SRM_SPUC}/v1/isp/${organizationId}/cost-invoice-filess`, {
        method: 'DELETE',
        body: deleteData,
      }).then((res) => {
        if (res) {
          CusNotification.success();
          const newDataSource = dataSource.filter(
            (item) => !selectedRowKeys.includes(item[rowKey])
          );
          this.setState({
            selectedRows: [],
            selectedRowKeys: [],
          });
          this.updateDataSource(newDataSource);
        }
      });
    } else {
      const newDataSource = dataSource.filter((item) => !selectedRowKeys.includes(item[rowKey]));
      this.setState({
        selectedRows: [],
        selectedRowKeys: [],
      });
      this.updateDataSource(newDataSource);
    }
  }

  /**
   * 更新附件行附件数量
   * @param record
   * @param uuid
   */
  @Bind
  setFileQuantity(record, uuid) {
    // uuid为空则默认没有附件
    if (uuid === undefined) {
      Object.assign(record, {
        fileQuantity: 0,
      });
      this.setState({});
      return false;
    }
    cusRequest(`/hfle/v1/${organizationId}/files/${uuid}/file`, {
      method: 'GET',
      query: {
        attachmentUUID: uuid,
        bucketName: 'cost-payment-files',
        tenantId: organizationId,
      },
    }).then((res) => {
      if (res) {
        Object.assign(record, {
          fileQuantity: res.length || 0,
        });
        this.setState({});
      }
    });
  }

  /**
   * 更新组件的数据源
   * @param dataSource
   */
  @Bind()
  updateDataSource(dataSource = []) {
    const { onChange } = this.props;
    if (onChange) {
      onChange(dataSource);
      this.setState({
        dataSource,
      });
    } else {
      this.setState({
        dataSource,
      });
    }
  }

  @Bind()
  handleConfirm() {
    const { dataSource } = this.state;
    this.updateDataSource(getEditTableData(dataSource));
    this.setState({ visible: false, localTempId: undefined });
  }

  @Bind()
  handleCancel() {
    const { dataSource, localTempId } = this.state;
    this.updateDataSource(
      dataSource.filter((i) => !i.localTempId || i.localTempId !== localTempId)
    );
    this.setState({ visible: false, localTempId: undefined });
  }

  render() {
    const {
      prompt,
      disabled,
      idpValueMap = {},
      rowKey,
      title = intl.get(`${prompt}.modal.title.file`).d('附件'),
    } = this.props;
    const { selectedRows, downloading, deleteLoading, dataSource, visible } = this.state;
    const columns = [
      {
        title: intl.get(`${prompt}.view.attach.fileType`).d('附件类型'),
        dataIndex: 'fileType',
        width: 150,
        required: true,
        render: (text, record) =>
          this.isEdit(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`fileType`, {
                initialValue: record.fileType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.view.attach.fileType`).d('附件类型'),
                    }),
                  },
                ],
              })(
                <CusSelect
                  options={idpValueMap.RS_IP_ATTACHMENT_TYPE?.filter((item) => {
                    return item.tag === '1';
                  })}
                />
              )}
            </Form.Item>
          ) : (
            tooltipRender(getCodeMeaning(text, idpValueMap.RS_IP_ATTACHMENT_TYPE))
          ),
      },
      {
        title: intl.get(`${prompt}.view.attach.fileName`).d('附件描述'),
        dataIndex: 'attachDescription',
        width: 180,
        render: (text, record) =>
          this.isEdit(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`attachDescription`, {
                initialValue: record.attachDescription,
              })(<CusInput.TextArea autoChangeSize={true} />)}
            </Form.Item>
          ) : (
            tooltipRender(text)
          ),
      },
      {
        title: intl.get(`${prompt}.view.attach.realName`).d('上传人'),
        dataIndex: 'realName',
        width: 150,
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.attach.creationDate`).d('上传日期'),
        dataIndex: 'creationDate',
        width: 110,
        render: dateRender,
      },
      {
        title: intl.get(`${prompt}.view.attach.attachDescription`).d('说明'),
        dataIndex: 'remark',
        width: 180,
        render: (text, record) =>
          this.isEdit(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`remark`, {
                initialValue: record.remark,
              })(<CusInput.TextArea autoChangeSize={true} />)}
            </Form.Item>
          ) : (
            tooltipRender(text)
          ),
      },
      {
        title: intl.get('hzero.common.upload.modal.title').d('附件'),
        dataIndex: 'uuid',
        width: getCurrentLanguage() === 'en_US' ? 200 : 130,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator(`uuid`, {
              initialValue: record.uuid,
            })(
              <CusUpload
                isEncrypt
                bucketName="cost-payment-files"
                tenantId={getCurrentOrganizationId()}
                viewOnly={!this.isEdit(record)}
                attachmentUUID={record.$form.getFieldValue('uuid')}
                showReUploadIcon={false}
                onChange={(attachmentUUID) => {
                  record.$form.setFieldsValue({
                    uuid: attachmentUUID,
                  });
                  Object.assign(record, {
                    creationDate: dayjs().format(DEFAULT_DATETIME_FORMAT),
                    realName: getCurrentUser().realName,
                  });
                }}
                onCloseUploadModal={() => {
                  this.setFileQuantity(record, record.$form.getFieldValue('uuid'));
                }}
              />
            )}
          </Form.Item>
        ),
      },
    ];

    const rowSelection = {
      selectedRowKeys: selectedRows.map((item) => item[rowKey]),
      onChange: (keys, rows) => {
        this.setState({
          selectedRows: rows,
          selectedRowKeys: keys,
        });
      },
    };
    const count = sum(dataSource.map((item) => item.fileQuantity));

    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center' }} className="cus-upload-tag">
          <CusButton
            type="plain"
            onClick={() => {
              this.setState({
                visible: true,
              });
            }}
          >
            {disabled
              ? intl.get(`${prompt}.view.upload.viewFile`).d('查看附件')
              : intl.get(`${prompt}.view.upload.attachment`).d('上传附件')}
          </CusButton>
          <Tag>{count}</Tag>
        </div>
        <CusModal
          title={title}
          visible={visible}
          width={1000}
          onCancel={this.handleCancel}
          cancelText={
            disabled
              ? intl.get('hzero.common.button.close').d('关闭')
              : intl.get('hzero.common.button.cancel').d('取消')
          }
          onOk={disabled ? null : this.handleConfirm}
        >
          <div style={{ marginTop: '-8px', marginBottom: '16px' }}>
            <span>
              {intl
                .get('spcm.costPayment.view.tip.requiredAttachment')
                .d(
                  '注意：当上传附件选择附件类型为发票时，对应附件会开放给供应商查看，请注意发票类型的附件只能上传发票附件。'
                )}
            </span>
          </div>
          <div style={{ textAlign: 'right', marginBottom: '16px' }}>
            <CusButton
              mini
              disabled={selectedRows.length === 0}
              loading={downloading}
              onClick={this.handleDownload}
            >
              {intl.get('hzero.common.button.batchDownload').d('批量下载')}
            </CusButton>
            {!disabled && (
              <>
                <CusButton
                  mini
                  loading={deleteLoading}
                  onClick={() => CusModal.CusDeleteConfirm(() => this.handleDelete())}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </CusButton>
                <CusButton mini type="primary" onClick={this.handleCreate}>
                  {intl.get('hzero.common.button.create').d('新建')}
                </CusButton>
              </>
            )}
          </div>
          <EditTable
            rowKey={rowKey}
            columns={columns}
            dataSource={dataSource}
            rowSelection={rowSelection}
            scroll={{ x: tableScrollWidth(columns) }}
          />
        </CusModal>
      </>
    );
  }
}
