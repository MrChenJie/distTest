import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import { Form } from 'hzero-ui';
import CusCascader from '_cus_components/CusCascader';
import CusInput from '_cus_components/CusInput';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusUpload from '_cus_components/CusUpload';
import dayjs from 'dayjs';
const prompt = 'spfmhk.supplier';
import uuid from 'uuid/v4';
import formatterCollections from 'utils/intl/formatterCollections';
@formatterCollections({ code: [prompt] })
@Form.create()
export default class AttachmentTable extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    const { rowSelection, dataSource = [], rowKey, form, supplierHK, readOnly = false, tenantId, handleAttachmentChange, tag = 'company' } = this.props;
    const { fileCascader = [] } = supplierHK;
    const columns = [
      {
        title: intl.get(`${prompt}.field.attachment.info.upload`).d('附件上传'),
        width: 200,
        dataIndex: 'attachmentUuid',
        render: (value, record, index) => {
          const { getFieldDecorator } = form;
          return (
            <Form.Item>
              {getFieldDecorator(`attachmentUuid${uuid()}`, {
                initialValue: record?.attachmentUuid,
              })(<CusUpload
                viewOnly={readOnly || record?.uploadErpStatus === 'Y'}
                filePreview
                bucketName="private-bucket"
                tenantId={tenantId}
                attachmentUUID={record?.attachmentUuid}
                onUploadSuccess={(res) => {
                  const arr = dataSource;
                  arr[index].attachmentDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
                  arr[index].attachmentUuid = record.attachmentUuid;
                  handleAttachmentChange(arr);
                }}
              />)}
            </Form.Item>
          )
        },
      },
      {
        title: intl.get(`${prompt}.field.attachment.type`).d('附件类型'),
        // dataIndex: 'type',
        width: 300,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          const { type, subType } = record;
          const data = [type, subType];
          if(readOnly || record?.uploadErpStatus === 'Y') {
            return <>{record.typeMeaning + '/' + record.subTypeMeaning}</>
          }
          if(record?._status === 'create') {
            return (
              <Form.Item>
                {getFieldDecorator(`type${uuid()}`)(<CusCascader
                  options={fileCascader.filter(i => i.tag === tag)}
                  fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
                  expandTrigger="hover"
                  onChange={e => {
                    if(e) {
                      record.type = e[0];
                      record.subType = e[1];
                    }
                  }}
                />)}
              </Form.Item>
            )
          }
          return (
            <Form.Item>
              {getFieldDecorator(`type${uuid()}`, {
                initialValue: data
              })(<CusCascader
                options={fileCascader.filter(i => i.tag === tag)}
                fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
                expandTrigger="hover"
                onChange={e => {
                  if(e) {
                    record.type = e[0];
                    record.subType = e[1];
                  }
                }}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.attachment.info.description`).d('附件描述'),
        dataIndex: 'description',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(readOnly || record?.uploadErpStatus === 'Y') {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`description${uuid()}`, {
                initialValue: record.description
              })(<CusInput style={{ width: '100%' }}
                           onChange={e => record.description = e}
              />)}
            </Form.Item>
          )
        }
      },
      // {
      //   title: intl.get(`${prompt}.field.attachment.info.file.expiration.date`).d('文件到期日'),
      //   dataIndex: 'expirationDate',
      //   width: 200,
      //   render: (value, record) => {
      //     const { getFieldDecorator } = form;
      //     if(readOnly) {
      //       return <>{value}</>
      //     }
      //     return (
      //       <Form.Item>
      //         {getFieldDecorator(`expirationDate${uuid()}`, {
      //           initialValue: record.expirationDate ? dayjs(record.expirationDate) : undefined
      //         })(<CusDatePicker style={{ width: '100%' }}
      //                           onChange={e => {
      //                             if(e) {
      //                               record.expirationDate = dayjs(e).format('YYYY-MM-DD HH:mm:ss');
      //                             } else {
      //                               record.expirationDate = undefined
      //                             }
      //                           }}
      //         />)}
      //       </Form.Item>
      //     )
      //   }
      // },
      {
        title: intl.get(`${prompt}.field.attachment.info.last.update.time`).d('最后更新时间'),
        dataIndex: 'attachmentDate',
        width: 200,
      }
    ];
    return (
      <EditTable
        rowKey={rowKey}
        pagination={false}
        columns={columns}
        dataSource={dataSource}
        rowSelection={rowSelection}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    )
  }
}
