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
import formatterCollections from 'utils/intl/formatterCollections';
import uuid from 'uuid/v4';

@Form.create()
@formatterCollections({ code: [prompt] })
export default class AttachmentTable extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.fetchEnum(); // 查询值集
  }

  fetchEnum = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierHK/init'
    })
  }

  render() {
    const { rowSelection, dataSource = [], rowKey, form, supplierHK, readOnly = false, tenantId, tag = 'company', refType, initialValues } = this.props;
    const { fileCascader = [] } = supplierHK;

    console.log('initialValues', initialValues, readOnly);
    // supModifyState-HKSP.SUP_MOD_STATUS》 supplierStatus-》HKSP.SUP_STATUS

    // const isEdit = (['Draft', 'Approved'].includes(initialValues?.supModifyState || 'Draft')) && !(Boolean(initialValues?.supplierStatus));
    let isEdit = false;
    console.log('initialValues?.supModifyState', initialValues);
    
    if(initialValues?.supModifyState === 'Draft') {
      isEdit = initialValues.uploadErpStatus === 'Y';
    } else if (initialValues?.supModifyState === 'Approved' && !(Boolean(initialValues?.supplierStatus))) {
      isEdit = initialValues.uploadErpStatus === 'Y';
    } else if (initialValues?.supModifyState === 'Approved' && Boolean(initialValues?.supplierStatus)) {
      isEdit = true;
    } else {
      if(!(window.location.href.indexOf('spfm-hk/supplier/PRSA-infomation-portal/recheck') > -1)) {
        isEdit = true;
      } else {
        isEdit = false;
      }
    }

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
                initialValue: record.attachmentUuid,
              })(<CusUpload
                viewOnly={(refType === 'bank' && isEdit) || readOnly || record?.uploadErpStatus === 'Y'}
                filePreview
                bucketName="private-bucket"
                tenantId={tenantId}
                attachmentUUID={record?.attachmentUuid}
                onUploadSuccess={(res) => {
                  const arr = dataSource;
                  arr[index].attachmentDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
                  arr[index].attachmentUuid = record.attachmentUuid;
                  this.props?.handleAttachmentChange(arr);
                }}
              />)}
            </Form.Item>
          )
        },
      },
      {
        title: intl.get(`${prompt}.field.attachment.type`).d('附件类型'),
        width: 300,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          const { type, subType, typeMeaning, subTypeMeaning } = record;
          const data = [type, subType];
          const dataMeaning = [typeMeaning, subTypeMeaning];
          const filteredData = data.filter(item => item !== undefined && item !== null);
          console.log('record?.uploadErpStatus', record?.uploadErpStatus);
          
          if(readOnly || (isEdit && record._status !== 'create') || record?.uploadErpStatus === 'Y') {
            console.log(readOnly, 'readOnly', record?._status, 'record?._status');
            return <>{record.typeMeaning + '/' + record.subTypeMeaning}</>
          }
          if(!isEdit || record._status === 'create') {
            return (
              <Form.Item>
                {getFieldDecorator(`type${uuid()}`, {
                  initialValue: filteredData.length === 0 ? '' : data
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
          return (
            <Form.Item>
              {getFieldDecorator(`type${uuid()}`, {
                initialValue: (record._status === 'create' && filteredData.length === 0) ? '' : (refType === 'bank' ? dataMeaning : data)
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
                disabled={refType === 'bank'}
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
          if(readOnly || (isEdit && record._status !== 'create') || record?.uploadErpStatus === 'Y') {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`description${uuid()}`, {
                initialValue: record.description
              })(<CusInput style={{ width: '100%' }}
                           onChange={e => record.description = e}
                           disabled={refType === 'bank' && isEdit}
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
      //     if(readOnly || record?._status === 'update') {
      //       return <>{value}</>
      //     }
      //     return (
      //       <Form.Item>
      //         {getFieldDecorator(`expirationDate${uuid()}`, {
      //           initialValue: record.expirationDate ? dayjs(record.expirationDate) : undefined
      //         })(<CusDatePicker style={{ width: '100%' }}
      //                           onChange={e => record.expirationDate = e}
      //                           disabled={refType === 'bank' && record?._status !== 'create'}
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
