import React, { PureComponent, Fragment } from 'react';
import intl from 'utils/intl';
import { Form, Checkbox } from 'hzero-ui';
import CusButton from 'srm-front-common/lib/components/CusButton';
import dayjs from 'dayjs';
import CusInput from '_cus_components/CusInput';
import { tableScrollWidth, getDateFormat, getDateTimeFormat, getCurrentOrganizationId, isTenantRoleLevel  } from 'utils/utils';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusCascader from '_cus_components/CusCascader';
import CusUpload from '_cus_components/CusUpload';
import { Bind } from 'lodash-decorators';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import EditTable from '_cus_components/EditTable';
import cusRequest from '_cus_utils/request';
import { HZERO_FILE } from 'utils/config';

const prompt = 'spfmhk.supplier';
export default class AttachmentTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
    }
  }

  /**
     * 设置最新更新时间
     * @param {object} record 行数据
     */
  @Bind()
  setLastUploadTime(record, type) {
    const {
      dispatch,
      attachmentList = [],
    } = this.props;
    const time = dayjs().format(DEFAULT_DATETIME_FORMAT);
    const newAttachmentList = attachmentList.map((item) => {
      if (item.attachmentUuid === record.attachmentUuid) {
        return {
          ...item,
          attachmentDate: time,
          attachmentCount:
            type === 'upload' ? record.attachmentCount + 1 : record.attachmentCount - 1,
        };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'prsaInfomationPortal/updateState',
      payload: {
        attachmentList: newAttachmentList,
      },
    });
  }

  componentDidMount() {
  }

  removeFile = (record) => {
    cusRequest(
      `${HZERO_FILE}/v1${isTenantRoleLevel() ? `/${getCurrentOrganizationId()}/` : '/'}files/${record.attachmentUuid}/file`,
      {
        method: 'GET',
        query: {
          tenantId: getCurrentOrganizationId(),
          bucketName: "private-bucket",
          attachmentUUID: record.attachmentUuid,
        },
      }
    ).then(res => {
      console.log(res, res.length == 0)
      if (res.length == 0) {
        record.attachmentDate = null
        record.$form?.setFieldsValue({
          attachmentDate: null
        })
      }
    })
  }


  render() {
    const {
      rowSelection,
      onChange,
      form,
      attachmentList = [],
      fileCascader = [],
      registerState,
      comSource,
      loading = false,
      disabled = true,
      dispatch,
      readOnly = false,
    } = this.props;
    const { getFieldDecorator } = form;
    const dataSource = registerState === 'bankUpdate' || registerState === 'basicUpdate' ? attachmentList.filter((item) => item.refType === comSource) : attachmentList;
    // const disabled = registerState === 'manager' ? true : false; 现在默认都不能编辑；
    // const disabled = true;
    const columns = [
      {
        title: intl.get(`${prompt}.field.attachment.info.upload`).d('附件上传'),
        width: 200,
        dataIndex: 'attachmentUuid',
        render: (_, record) => {
          const { getFieldDecorator } = form;
          return (
            <CusUpload
              filePreview
              bucketName="private-bucket"
              attachmentUUID={record.attachmentUuid}
              viewOnly={(disabled && !readOnly) || record.uploadErpStatus === 'Y'}
              onUploadSuccess={() => {
                record.attachmentDate = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
                dispatch({
                  type: 'prsaInfomationPortal/updateState',
                  payload: {
                    attachmentList: attachmentList
                  }
                })
              }
              }
              removeCallback={() =>
                this.removeFile(record)
              }
            />
          )
        },
      },
      {
        title: intl.get(`${prompt}.field.attachment.type`).d('附件类型'),
        width: 300,
        dataIndex: 'subType',
        render: (_, record) => {
          const { type, subType, typeMeaning, subTypeMeaning } = record;
          const data = type ? [type, subType] : [];
          const showData = `${typeMeaning}/${subTypeMeaning}`;
          return record.uploadErpStatus !== 'Y' && (!disabled || readOnly) ? (
            <Form.Item>
              {getFieldDecorator(`type$${record.attachmentUuid}`, {
                initialValue: data
              })(<CusCascader
                style={{ width: '100%' }}
                fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
                options={fileCascader}
                expandTrigger="hover"
                disabled={(disabled && !readOnly) || record.uploadErpStatus === 'Y'}
                allowClear={false}
                onChange={(e) => {
                  record.type = e[0];
                  record.subType = e[1];
                }}
              />)}
            </Form.Item>
          ) : (showData)
        }
      },
      {
        title: intl.get(`${prompt}.field.attachment.info.description`).d('附件描述'),
        dataIndex: 'description',
        width: 200,
        render: (_, record) => {
          return record.uploadErpStatus !== 'Y' && (!disabled || readOnly) ? (
            <Form.Item>
              {getFieldDecorator(`description$${record.attachmentUuid}`, {
                initialValue: record.description
              })(<CusInput
                disabled={(disabled && !readOnly) || record.uploadErpStatus === 'Y'}
                onChange={e => record.description = e}
                style={{ width: '100%' }}
              />)}
            </Form.Item>
          ) : (_)
        }
      },
      // {
      //   title: intl.get(`${prompt}.field.attachment.info.file.expiration.date`).d('文件到期日'),
      //   dataIndex: 'expirationDate',
      //   width: 200,
      //   render: (_, record) => {
      //     return !disabled ? (
      //       <Form.Item>
      //         {getFieldDecorator(`expirationDate$${record.attachmentUuid}`, {
      //           initialValue: record?.expirationDate ? dayjs(record?.expirationDate) : null,
      //
      //         })(<CusDatePicker
      //           format={getDateFormat()}
      //           disabled={disabled}
      //           onChange={(e) => {
      //             record.expirationDate = dayjs(e).format(getDateFormat())
      //           }}
      //           style={{ width: '100%' }}
      //         />)}
      //       </Form.Item>
      //     ) : (_)
      //   }
      // },
      {
        title: intl.get(`${prompt}.field.attachment.info.last.update.time`).d('最后更新时间'),
        dataIndex: 'attachmentDate',
        width: 200,
        // render: (_, record) => {
        //   const { getFieldDecorator } = form;
        //   return !disabled ? (
        //     <Form.Item>
        //       {getFieldDecorator(`attachmentDate$${record.attachmentUuid}`, {
        //         initialValue: record.attachmentDate ? dayjs(record.attachmentDate) : undefined
        //       })(<CusDatePicker style={{ width: '100%' }}
        //         onChange={e => record.attachmentDate = dayjs(record.attachmentDate)}
        //         format={getDateTimeFormat()}
        //         disabled />)}
        //     </Form.Item>
        //   ) : (_)
        // }
      }
    ];
    return (
      <Fragment>
        <EditTable
          rowKey="attachmentUuid"
          pagination={false}
          columns={columns}
          loading={loading}
          dataSource={dataSource?.filter(i => i.isDel !== '1')}
          rowSelection={rowSelection}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </Fragment>
    )
  }
}
