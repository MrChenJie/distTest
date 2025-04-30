import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import EditTable from '_cus_components/EditTable';
import CusUpload from '_cus_components/CusUpload';
import { Form } from 'hzero-ui';
import CusCascader from '_cus_components/CusCascader';
import formatterCollections from 'utils/intl/formatterCollections';

const prompt = 'spfmhk.supplier';
@Form.create()
@formatterCollections({ code: [prompt] })
export default class AttachmentTable extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    const { rowSelection, dataSource, disabled = false, form: { getFieldDecorator }, rowKey, fileCascader, tenantId } = this.props;
    const columns = [
      {
        title: intl.get(`${prompt}.field.attachment.info.upload`).d('附件上传'),
        width: 300,
        dataIndex: 'attachmentUuid',
        render: (value, record, index) => {
          return (
            <Form.Item>
              {getFieldDecorator(`attachmentUuid${record.id}`, {
                initialValue: record.attachmentUuid,
              })(<CusUpload
                filePreview
                bucketName="private-bucket"
                tenantId={tenantId}
                attachmentUUID={record?.attachmentUuid}
                viewOnly
              />)}
            </Form.Item>
          )
        },
      },
      {
        title: intl.get(`${prompt}.field.attachment.type`).d('附件类型'),
        dataIndex: 'type',
        width: 300,
        render: (value, record) => {
          const { typeMeaning, subTypeMeaning } = record;
          const data = [typeMeaning, subTypeMeaning];
          if(disabled) {
            return <>{record.typeMeaning + '/' + record.subTypeMeaning}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`type${record.id}`, {
                initialValue: data
              })(<CusCascader
                fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
                expandTrigger="hover"
                disabled
                style={{width: '100%'}}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.attachment.info.description`).d('附件描述'),
        dataIndex: 'description',
        width: 300,
      },
      // {
      //   title: intl.get(`${prompt}.field.attachment.info.file.expiration.date`).d('文件到期日'),
      //   dataIndex: 'expirationDate',
      //   width: 300,
      // },
      {
        title: intl.get(`${prompt}.field.attachment.info.last.update.time`).d('最后更新时间'),
        width: 300,
        dataIndex: 'attachmentDate',
      }
    ];
    return (
      <Fragment>
        <EditTable
          rowKey={rowKey}
          pagination={false}
          columns={columns}
          dataSource={dataSource}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </Fragment>
    )
  }
}
