/**
 * @Description: 附件上传
 * @date 2023-08-07
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';
import cusRequest from '_cus_utils/request';
import { tableScrollWidth, getCurrentOrganizationId, getCodeMeaning } from 'utils/utils';
import { getCurrentUser } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import EditTable from '_cus_components/EditTable';
import CusModal from '_cus_components/CusModal';
import CusUpload from '_cus_components/CusUpload';
import CusButton from '_cus_components/CusButton';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import { tooltipRender, labelTip } from '_cus_utils/render';
import { Row, Col } from 'antd';
import { batchDownloadFile } from '@/common/utils';
import dayjs from 'dayjs';

const ROW_KEY = 'costAttachFileId';
const prompt = 'spcm.costPayment';
const organizationId = getCurrentOrganizationId();

export default class Attachment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      downloading: false,
      selectedRows: [],
      selectedRowKeys: [],
    };
  }

  @Bind
  @Debounce(500, { leading: true })
  async handleDownload() {
    const { isOther } = this.props;
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
            fileDir: item.fileType,
          };
        }),
      isOther
        ? intl.get('spcm.costPayment.view.file.other').d('其他附件')
        : intl.get('spcm.costPayment.view.file.require').d('必要附件')
    );
    this.setState({
      downloading: false,
    });
  }

  isEdit(record) {
    const { isEdit } = this.props;
    return ['create', 'update'].includes(record._status) && isEdit;
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

  render() {
    const {
      isEdit,
      isOther,
      dataSource = [],
      pagination = {},
      idpValueMap = {},
      loading = false,
      deleteLoading = false,
      onChange = (e) => e,
      onCreate = (e) => e,
      onDelete = (e) => e,
      require,
    } = this.props;
    const { selectedRows, selectedRowKeys, downloading } = this.state;

    const columns = [
      {
        title: intl.get(`${prompt}.view.attach.fileType`).d('附件类型'),
        dataIndex: 'fileType',
        width: 180,
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
                  options={idpValueMap['RS_IP_ATTACHMENT_TYPE']?.filter(
                    (item) => item.tag === (require ? '1' : '0')
                  )}
                />
              )}
            </Form.Item>
          ) : (
            tooltipRender(getCodeMeaning(text, idpValueMap['RS_IP_ATTACHMENT_TYPE']))
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
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`${prompt}.view.attach.creationDate`).d('上传日期'),
        dataIndex: 'creationDate',
        width: 180,
        render: dateRender,
      },
      {
        title: intl.get(`${prompt}.view.attach.attachDescription`).d('说明'),
        dataIndex: 'remarks',
        width: 180,
        render: (text, record) =>
          this.isEdit(record) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`remarks`, {
                initialValue: record.remarks,
              })(<CusInput.TextArea autoChangeSize={true} />)}
            </Form.Item>
          ) : (
            tooltipRender(text)
          ),
      },
      {
        title: intl.get('hzero.common.upload.modal.title').d('附件'),
        dataIndex: 'uuid',
        width: 170,
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
      selectedRowKeys: selectedRows.map((item) => item[ROW_KEY]),
      onChange: (keys, rows) => {
        this.setState({
          selectedRows: rows,
          selectedRowKeys: keys,
        });
      },
    };

    return (
      <>
        <Row style={{ marginBottom: '16px' }}>
          <Col span={12} style={{ lineHeight: '32px' }}>
            {isOther
              ? intl.get(`${prompt}.view.file.other`).d('其他附件')
              : labelTip({
                  label: intl.get(`${prompt}.view.file.require`).d('必要附件'),
                  tip: intl
                    .get('spcm.costPayment.view.requiredAttachment.tooltip')
                    .d('必要附件仅供下载查看，不可手动上传'),
                })}
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <CusButton
              mini
              disabled={selectedRows.length === 0}
              loading={downloading}
              onClick={this.handleDownload}
            >
              {intl.get('hzero.common.button.batchDownload').d('批量下载')}
            </CusButton>
            {isEdit && (
              <>
                <CusButton
                  mini
                  loading={deleteLoading}
                  onClick={() =>
                    CusModal.CusDeleteConfirm(() =>
                      onDelete(selectedRows, selectedRowKeys, () => {
                        this.setState({
                          selectedRows: [],
                          selectedRowKeys: [],
                        });
                      })
                    )
                  }
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </CusButton>
                <CusButton
                  mini
                  type="primary"
                  onClick={() => {
                    onCreate();
                  }}
                >
                  {intl.get('hzero.common.button.create').d('新建')}
                </CusButton>
              </>
            )}
          </Col>
        </Row>
        <EditTable
          rowKey={ROW_KEY}
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          rowSelection={rowSelection}
          onChange={(page) => onChange(page)}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </>
    );
  }
}
