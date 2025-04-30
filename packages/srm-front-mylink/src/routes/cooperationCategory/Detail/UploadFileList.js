import React from 'react';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import EditTable from '_cus_components/EditTable';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import { getCurrentOrganizationId, tableScrollWidth, isTenantRoleLevel, } from 'utils/utils';
import { tooltipRender } from '_cus_utils/render';
import CusUpload from '_cus_components/CusUpload';
import CusCascader from '_cus_components/CusCascader';
import dayjs from 'dayjs';
import cusRequest from '_cus_utils/request';
import { HZERO_FILE } from 'utils/config';

@Form.create({ fieldNameProp: null })

export default class UploadFileList extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  removeFile = (record) => {
    const {
      dispatch,
      cooperationCategoryModal
    } = this.props;
    const {
      partnerFile
    } = cooperationCategoryModal;
    cusRequest(
      `${HZERO_FILE}/v1${isTenantRoleLevel() ? `/${getCurrentOrganizationId()}/` : '/'}files/${record.fileUuid}/file`,
      {
        method: 'GET',
        query: {
          tenantId: getCurrentOrganizationId(),
          bucketName: "mylink",
          attachmentUUID: record.fileUuid,
        },
      }
    ).then(res => {
      console.log(res ,res.length == 0)
      if(res.length == 0) {
        record.lastUpdateTime = null
        dispatch({
          type: 'cooperationCategoryModal/updateState',
          payload: {
            partnerFile: partnerFile,
          },
        })
      }
    })
  }

  render() {
    const {
      rowSelection,
      cooperationCategoryModal,
      readyOnly = false,
      dispatch,
      PartnerInformationModal,
      activityCode,
      state,
    } = this.props;

    const {
      partnerFile,
    } = cooperationCategoryModal;
    const {
      fileTypeList
    } = PartnerInformationModal;

    console.log('partnerFile', partnerFile);
    console.log('readyOnly', readyOnly);

    const columns = [
      {
        title: intl.get(`spfmhk.mylink.field.attachment.type`).d('附件类型'),
        dataIndex: 'fileType',
        width: 450,
        required: true,
        render: (_, record) => {
          return (
            (!readyOnly  || activityCode === '06' && state != 'DONE')?
              <Form.Item>
                {record.$form.getFieldDecorator('fileTypeList', {
                  initialValue: record?.fileType ? [record?.fileType, record.subFileType] : [],
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.attachment.type`).d('附件类型'),
                      }),
                    },
                  ],
                })(
                  <CusCascader
                    fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
                    options={fileTypeList}
                    allowClear
                  />
                )}
              </Form.Item>
              :
              tooltipRender(`${record.fileTypeMeaning}/ ${record.subFileTypeMeaning}`)
          )
        }
      },
      {
        title: intl.get(`spfmhk.mylink.field.attachment.info.description`).d('附件描述'),
        dataIndex: 'fileDescription',
        width: 200,
        render: (_, record) => {
          return (
            (!readyOnly || activityCode === '06' && state != 'DONE') ?
              <Form.Item>
                {record.$form.getFieldDecorator('fileDescription', {
                  initialValue: record?.fileDescription,
                })(
                  <CusInput />
                )}
              </Form.Item>
              :
              tooltipRender(record.fileDescription)
          )
        },
      },
      {
        title: intl.get(`spfmhk.mylink.field.attachment.info.last.update.time`).d('最后更新时间'),
        dataIndex: 'lastUpdateTime',
        width: 300,
        render: tooltipRender,
      },
      {
        title: intl.get(`spfmhk.mylink.field.attachment.upload`).d('附件上传'),
        dataIndex: 'fileUuid',
        required: true,
        width: 200,
        render: (_, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('fileUuid', {
                initialValue: record?.fileUuid,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.mylink.field.attachment.upload`).d('附件上传'),
                    }),
                  },
                ],
              })(
                <CusUpload
                  filePreview
                  bucketName="mylink"
                  tenantId={getCurrentOrganizationId()}
                  viewOnly={!(!readyOnly || activityCode === '06' && state != 'DONE')}
                  attachmentUUID={record.fileUuid}
                  uploadSuccess={() => {
                    record.lastUpdateTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
                    dispatch({
                      type: 'cooperationCategoryModal/updateState',
                      payload: {
                        partnerFile: partnerFile,
                      },
                    })
                  }}
                  removeCallback={() =>
                    this.removeFile(record)
                  }
                  isEncrypt
                />
              )}
            </Form.Item>
          )
        }
      }
    ];

    return (
      <>
        <EditTable
          rowKey="rowKey"
          columns={columns}
          rowSelection={!readyOnly ? rowSelection : false}
          dataSource={partnerFile}
          pagination={false}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </>
    );
  }
}
