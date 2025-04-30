import React from 'react';
import intl from 'utils/intl';
import { Input } from 'antd';
import EditTable from '_cus_components/EditTable';
import CusSelect from '_cus_components/CusSelect';
import { getCurrentOrganizationId, tableScrollWidth } from 'utils/utils';
import { tooltipRender } from '_cus_utils/render';
import CusUpload from '../components/CusUpload';
import {
  Form,
} from 'hzero-ui';
import { dateTimeRender } from 'utils/renderer';
import moment from 'moment';
import {
  DEFAULT_DATE_FORMAT,
} from 'utils/constants';
import { message } from 'choerodon-ui';

@Form.create({ fieldNameProp: null })
export default class DetailList extends React.PureComponent {

  constructor(props) {
    super(props);
    props?.onRef(this);
  }

  render() {
    const {
      idpValueMap,
      rowSelection,
      CollaborationModeModal,
      readyOnly = false,
      onChange = (e) => e,
      dispatch
    } = this.props;

    const {
      productDetailSource,
      productDetailPagination,
    } = CollaborationModeModal;

    // const productDetailSource = [{
    //   productCode: '1'
    // }]

    console.log('productDetailSource', productDetailSource);

    const columns = [
      {
        title: intl.get(`spfmhk.mylink.field.attachment.type`).d('附件类型'),
        dataIndex: 'fileType',
        width: 150,
        required: true,
        render: (_, record, index) => {
          console.log('record.fileType', index)
          return (
            readyOnly ? tooltipRender(record.fileTypeMeaning) :
              <Form.Item
              >
                {record?.$form?.getFieldDecorator('fileType', {
                  initialValue: record.fileType,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.attachment.type`).d('附件类型'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    disabled={readyOnly}
                    options={idpValueMap['HKSM.COOP_MODE.ATTACH.TYPE']}
                    lazyLoad={false}
                    allowClear
                    onChange={(e) => {
                      productDetailSource[index]?.$form?.resetFields('fileDescription')
                      productDetailSource[index].fileType = e
                      productDetailSource[index].fileDescription = null
                      console.log('productDetailSource', productDetailSource)
                      dispatch({
                        type: 'CollaborationModeModal/updateState',
                        payload: {
                          productDetailSource: productDetailSource
                        }
                      })
                    }}
                  // onChange={(value) => {
                  //   console.log('productDetailSource', productDetailSource, value)
                  //   const newDataSource = (productDetailSource || []).map((item) => ({
                  //     ...item,
                  //     rowKey: uuidv4(),
                  //     quoteRule: value === 'Y' ? 'Bundled' : 'Singleton'
                  //   }))
                  //   dispatch({
                  //     type: 'CollaborationModeModal/updateState',
                  //     payload: {
                  //       productDetailSource: newDataSource
                  //     }
                  //   })
                  // }}
                  />
                )}
              </Form.Item>
          )
        }
      },
      {
        title: intl.get(`spfmhk.mylink.field.sort`).d('排序'),
        dataIndex: 'fileDescription',
        width: 200,
        render: (_, record) => {
          return (
            readyOnly ? tooltipRender(record.fileDescription) :
              <Form.Item
              >
                {record?.$form?.getFieldDecorator('fileDescription', {
                  initialValue: record.fileDescription,
                  rules: [
                    {
                      required: record.fileType == 'Logo',
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.mylink.field.sort`).d('排序'),
                      }),
                    },
                    {
                      validator: (_, value, callback) => {
                          if (!value || /^[0-9]*$/.test(value)) {
                            callback();
                          } else {
                            callback(
                              new Error(
                                intl.get(`hzero.common.validation.requireNumber`).d('请只输入数字')
                              )
                            );
                          }
                      },
                  },
                  ],
                })(
                  <Input disabled={record.fileType != 'Logo'} value={record.fileDescription} onChange={(e) => { console.log(record); record.fileDescription = e.target.value }}
                  />
                )}
              </Form.Item>

          )
        }
      },
      {
        title: intl.get(`spfmhk.mylink.field.attachment.info.last.update.time`).d('最后更新时间'),
        dataIndex: 'lastUpdateTime',
        width: 300,
        render: dateTimeRender,
      },
      // {
      //   title: intl.get(`spfmhk.mylink.field.sort`).d('排序'),
      //   dataIndex: 'sort',
      //   width: 350,
      //   required: true,
      //   render: (_, record) => {
      //     return (
      //       readyOnly ? tooltipRender(record.sort) :
      //         <Form.Item
      //           name='sort'
      //         >
      //           <Input onChange={(e) => {console.log( e.target.value);record.sort =  e.target.value}}
      //           />
      //         </Form.Item>

      //     )
      //   }
      // },
      {
        title: intl.get(`spfmhk.mylink.field.attach.upload`).d('附件上传'),
        dataIndex: 'fileUuid',
        width: 200,
        required: true,
        render: (_, record) => {
          return (
            <Form.Item
            >
              {record?.$form?.getFieldDecorator('fileUuid', {
                initialValue: record.fileUuid,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfmhk.mylink.field.attach.upload`).d('附件上传'),
                    }),
                  },
                ],
              })(
                <CusUpload
                  filePreview
                  multiple ={false}
                  bucketName="mylink"
                  fileType="image/jpeg,image/png,image/gif,image/bmp,image/svg+xml"
                  type='jpeg，png，gif，bmp，svg'
                  tenantId={getCurrentOrganizationId()}
                  viewOnly={readyOnly || record.isUploadFlag}
                  readyOnly={readyOnly}
                  attachmentUUID={record.fileUuid}
                  removeCallback={() => {
                    record.isUploadFlag = false
                    console.log('productDetailSource', productDetailSource)
                    dispatch({
                      type: 'CollaborationModeModal/updateState',
                      payload: {
                        productDetailSource: productDetailSource
                      }
                    })
                  }}
                  onUploadSuccess={() => {
                    record.lastUpdateTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                    record.isUploadFlag = true
                    console.log('productDetailSource', productDetailSource)
                    dispatch({
                      type: 'CollaborationModeModal/updateState',
                      payload: {
                        productDetailSource: productDetailSource
                      }
                    })
                  }
                  }
                />
              )}
            </Form.Item>
          )
        }
      }
    ];

    return (
      <>
        <Form ref={this.tableForm} className="customize-table-from">
          <EditTable
            rowKey="fileUuid"
            columns={columns}
            rowSelection={readyOnly ? false : rowSelection}
            dataSource={productDetailSource}
            pagination={false}
            scroll={{ x: tableScrollWidth(columns) }}
            onChange={onChange}
          />
        </Form>
      </>
    );
  }
}
