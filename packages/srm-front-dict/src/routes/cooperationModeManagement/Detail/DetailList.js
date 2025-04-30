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

const prompt = 'spfmhk.supplier';
@Form.create()
@formatterCollections({ code: [prompt] })
export default class DetailList extends PureComponent {
  constructor(props) {
    super(props);
    props?.onRef(this);
  }

  componentDidMount() {
  }

  render() {
    const {
      rowSelection,
      readyOnly = false,
      attachmentSource,
      idpValueMap,
      form,
      tenantId,
    } = this.props;
    const { getFieldDecorator } = form;
    const columns = [
      {
        title:intl.get(`spfmhk.dict.view.field.attachmenttype`).d('附件类型'),
        dataIndex: 'fileType',
        width: 300,
        required:true,
        render: (value, record, index) => {
          const attachmentTypeOptions = idpValueMap['DICT.MODE_FILE_TYPE'] || [];
          const meaning = attachmentTypeOptions?.find(item => item.value === record.fileType)?.meaning;
          return (
            readyOnly ? tooltipRender(record.fileTypeMeaning) :
              <Form.Item>
                {getFieldDecorator(`fileType${record.rowKey}`, {
                  initialValue: record?.fileType ? record?.fileType : (index === 0 ? 'background_pic' : record?.fileType),//默认第一条为背景图片，未触发change，需在index中手动填写
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
                    lazyload={false}
                    allowClear
                    disabled={index === 0 || readyOnly}
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
          return readyOnly ? (
            tooltipRender(record.fileDesc)
          ) : (
            <Form.Item>
              {getFieldDecorator(`fileDesc${uuid()}`, {
                initialValue: record?.fileDesc,
              })(
                <CusInput
                  onChange={(value) => {
                    record.fileDesc = value;
                  }}
                  disabled={readyOnly}
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
          return readyOnly ? (
            tooltipRender(record.lastUpdateDate)
          ) : (
            <Form.Item>
              {getFieldDecorator(`lastUpdateDate${uuid()}`, {
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
              {getFieldDecorator(`fileUuid${record.rowKey}`, {
                initialValue: record.fileUuid,
              })(<CusUpload
                fileType={(record.fileType==='background_pic' || index===0) && "image/jpeg,image/png,image/jpg"}
                filePreview
                bucketName="dict"
                tenantId={tenantId}
                attachmentUUID={record?.fileUuid}
                viewOnly={readyOnly}//当申请状态不可修改时,只能查看
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
          dataSource={attachmentSource}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </Fragment>
    );
  }
}
