import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import CusUpload from '_cus_components/CusUpload';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import { Form } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { tooltipRender } from '_cus_utils/render';
import dayjs from 'dayjs';
import uuid from 'uuid/v4';

const prompt = 'spfmhk.dict';
@Form.create()
@formatterCollections({ code: [prompt] })
export default class Attachment extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    const {
      rowSelection,
      readOnly = false,
      idpValueMap,
      tenantId,
      dataSource,
    } = this.props;
    const columns = [
      {
        title: intl.get(`spfmhk.dict.view.field.attachmenttype`).d('附件类型'),
        dataIndex: 'fileType',
        width: 300,
        render: (value, record, index) => {
          const attachmentTypeOptions = idpValueMap['DICT.PARTNER_FILE_TYPE'] || [];
          return (
            readOnly ? tooltipRender(record.fileTypeMeaning) :
              <Form.Item>
                {record.$form.getFieldDecorator('fileType', {
                  initialValue: record?.fileType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.dict.view.field.attachmenttype`).d('附件类型'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    options={attachmentTypeOptions}
                    allowClear
                    disabled={readOnly}
                    onChange={(value) => {
                      record.fileType = value;
                    }}
                  />,
                )}
              </Form.Item>
          );
        },
      },
      {
        title: intl.get(`spfmhk.dict.view.field.attachmentdescription`).d('附件描述'),
        dataIndex: 'fileDesc',
        width: 300,
        render: (value, record) => {
          return readOnly ? (
            tooltipRender(record.fileDesc)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('fileDesc', {
                initialValue: record?.fileDesc,
              })(
                <CusInput
                  onChange={(value) => {
                    record.fileDesc = value;
                  }}
                  disabled={readOnly}
                />,
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`spfmhk.dict.view.field.attachmentuploaddate`).d('最后更新时间'),
        width: 300,
        dataIndex: 'lastUpdateDate',
        render: (value, record) => {
          return readOnly ? (
            tooltipRender(record.lastUpdateDate)
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('lastUpdateDate', {
                initialValue: record?.lastUpdateDate
                  ? record?.lastUpdateDate
                  : dayjs().format(DEFAULT_DATETIME_FORMAT),
              })(
                <CusInput disabled />,
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`spfmhk.dict.view.field.attachment`).d('附件上传'),
        width: 300,
        dataIndex: 'fileUuid',
        render: (value, record, index) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('fileUuid', {
                initialValue: record.fileUuid,
              })(<CusUpload
                filePreview
                bucketName={record.bucketName}
                tenantId={tenantId}
                attachmentUUID={value}
                viewOnly={readOnly}
                isEncrypt
              />)}
            </Form.Item>
          );
        },
      },
    ];
    return (
      <Fragment>
        <EditTable
          rowKey="rowKey"
          pagination={false}
          columns={columns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </Fragment>
    );
  }
}
