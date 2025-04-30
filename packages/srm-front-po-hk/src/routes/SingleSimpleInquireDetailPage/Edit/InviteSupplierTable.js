// 邀请供应商列表
import React, { PureComponent } from 'react';
import { Form } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { pullAllBy } from 'lodash';
import uuid from 'uuid/v4';
import formatterCollections from 'utils/intl/formatterCollections';
import { tooltipRender } from '_cus_utils/render';
import EditTable from '_cus_components/EditTable';
import { EMAIL } from 'utils/regExp';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
// import RfqResponse from './components/RfqResponse';
// import QuotationDocumentSubmitNextModal from './QuotationDocumentSubmitNextModal'
import CusInput from '_cus_components/CusInput';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
// import CusUpload from '_cus_components/CusUpload';
import CusUpload from './component/CusUpload';
import CusDatePicker from '_cus_components/CusDatePicker';
import { Input, Tooltip } from 'antd';
// import ExportHistoryData from './components/ExportHistoryData';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'uuid';
const FormItem = Form.Item

@formatterCollections({ code: [promptCode] })
export default class InquireInfoTable extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = this.props;
    onRef(this);
    // props?.onRef(this);
    this.state = {
      rfqResponseVisible: false,
      exportModalVisible: false,
      nowRecord: {},
    };
  }

  componentDidMount() {
  }


  @Bind()
  openEnquiryResponseModal(record) {
    this.setState({
      rfqResponseVisible: true,
      nowRecord: record,
    });
  }




  @Bind()
  supplierNameOnChange(_, lovRecord, record) {
    const { singlePurchaseApplicationModel, dispatch } = this.props
    const { InviteSuppliersList = [] } = singlePurchaseApplicationModel;
    record.$form.setFieldsValue({
      email: lovRecord.email,
      contacts: lovRecord.name,
      phone: lovRecord.phoneNumber,
      refSupId: lovRecord.id,
      supLoginName: lovRecord.email, // 用于存放原始的邮箱
    })
    const newDataSource = InviteSuppliersList.map(item => {
      if (item[ROW_KEY] === record[ROW_KEY]) {
        return {
          ...item,
          name: lovRecord.companyNameCh,
          email: lovRecord.email,
          contacts: lovRecord.name,
          phone: lovRecord.phoneNumber,
          refSupId: lovRecord.id,
          supLoginName: lovRecord.email, // 用于存放原始的邮箱
        };
      }
      return { ...item };
    })
    // console.log('newDataSource', newDataSource);
    dispatch({
      type: `singlePurchaseApplicationModel/updateState`,
      payload: {
        InviteSuppliersList: newDataSource,
      },
    });
  }


  //   /**
  //  * 如果字段有修改，当前行的是否可发送状态就重新变成false；
  //  * @param {object} record
  //  */
  //   @Bind()
  //   changeRow(record) {
  //     const { singlePurchaseApplicationModel, dispatch } = this.props
  //     const { InviteSuppliersList } = singlePurchaseApplicationModel;
  //     const { $form } = record;
  //     $form.setFieldsValue({
  //       [`${record[ROW_KEY]}#isInviteSended`]: false,
  //     });
  //     const newDataSource = InviteSuppliersList.map(item => {
  //       if (item[ROW_KEY] === record[ROW_KEY]) {
  //         return {
  //           ...item,
  //           isInviteSended: false,
  //         };
  //       }
  //       return { ...item };
  //     })
  //     console.log('newDataSource', newDataSource);
  //     dispatch({
  //       type: `singlePurchaseApplicationModel/updateState`,
  //       payload: {
  //         InviteSuppliersList: newDataSource,
  //       },
  //     });
  //   }



  /**
   * 跳转详情界面
   * @param {object} record
   */
  @Bind()
  openPriceEntryDetail(record) {
    const isPub = this.props.location.pathname.includes('pub'); // 判断是否为pub页面
    const { businessType, enquiryPriceId, enquiryPriceRoundsId } = record;
    let url = '';
    switch (businessType) {
      case 'STANDARD':
        url = `${isPub ? '/pub' : ''}${SRM_SSRC}/standard-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`;
        break;
      case 'ICTS':
        url = `${isPub ? '/pub' : ''}${SRM_SSRC}/resale-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`;
        break;
      case 'CHINA_DIA':
        url = `${isPub ? '/pub' : ''}${SRM_SSRC}/china-dia-rfq/detail/${enquiryPriceId}/${enquiryPriceRoundsId}`;
        break;
    }
    window.open(url);
  }


  @Bind
  onUploadSuccess(file, fileList, record) {
    this.updateFileList(fileList, record);
  }

  @Bind
  removeChange(file, record) {
    const { prThirdSupAttachmentList = [] } = record;
    const fileList = prThirdSupAttachmentList.filter((list) => list.url !== file.url)
    this.updateFileList(fileList, record);
  }

  @Bind
  updateFileList(list = [], record) {
    const fileList = list.map(item => {
      return {
        ...item,
        fileName: item?.name,
        filePath: item?.url,
      }
    })
    const { singlePurchaseApplicationModel, dispatch } = this.props;
    const { InviteSuppliersList = [] } = singlePurchaseApplicationModel
    const newInviteSuppliersList = InviteSuppliersList?.map(item => {
      if (item[ROW_KEY] === record[ROW_KEY]) {
        return {
          ...item,
          prThirdSupAttachmentList: fileList
        }
      } else {
        return item
      }
    })
    dispatch({
      type: 'singlePurchaseApplicationModel/updateState',
      payload: {
        InviteSuppliersList: newInviteSuppliersList,
      },
    });
  }



  render() {
    const {
      form,
      singlePurchaseApplicationModel,
      rowSelection,
      isEdit = true,
    } = this.props;
    const { getFieldDecorator } = form;
    const { InviteSuppliersList = [], detailEnumMap } = singlePurchaseApplicationModel;
    console.log('InviteSuppliersList', InviteSuppliersList);
    const { inviteSupplierOptions } = detailEnumMap;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.SN`).d('序号'),
        width: '50px',
        render: (val, record, index) => {
          return <span>{index + 1}</span>
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.Type`).d('类型'),
        dataIndex: 'type',
        key: 'type',
        required: true,
        width: 200,
        render: (val, record) => {
          return (
            isEdit ?
              <Form.Item>
                {record.$form.getFieldDecorator(`type`, {
                  initialValue: record.type,
                  rules: [
                    {
                      required: true,
                      message: intl.get(`hzero.common.validation.notNull`, {
                        name: intl.get(`${promptCode}.view.title.Type`).d('类型'),
                      }),
                    },
                  ],
                })(
                  <CusSelect
                    options={inviteSupplierOptions}
                    allowClear
                    onChange={(e) => {
                      record.type = e
                    }}
                  />
                )}
              </Form.Item> : tooltipRender(record.typeMeaning)
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称'),
        dataIndex: 'name',
        key: 'name',
        width: 200,
        required: true,
        render: (val, record) => {
          return (
            isEdit ? <Form.Item>
              {record.$form.getFieldDecorator(`name`, {
                initialValue: record.name,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称'),
                    }),
                  },
                ],
              })(
                record.type === 'internal' ?
                  <CusLov
                    code="CMHK.QUALIFIED_SUPPLIER"
                    lovOptions={{ displayField: 'companyNameCh', valueField: 'companyNameCh' }}
                    textValue={record.name}
                    onChange={(value, lovRecord) => this.supplierNameOnChange(value, lovRecord, record)}
                  /> :
                  <CusInput.TextArea
                    autoChangeSize
                    onChange={(e) => {
                      record.name = e.target.value;
                      if (record._status !== 'create') {
                        if (e.target.value !== record.copyName) {
                          record.isUpdated = 'true';
                          record.isInviteSended = 'false';
                        }
                      }
                    }}
                  />
              )}
            </Form.Item> : tooltipRender(val)
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.MailAddress`).d('联系邮箱'),
        dataIndex: 'email',
        key: 'email',
        width: 200,
        required: true,
        render: (val, record) => {
          return (
            isEdit ? <Form.Item>
              {record.$form.getFieldDecorator(`email`, {
                initialValue: record.email,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.MailAddress`).d('联系邮箱'),
                    }),
                  },
                  {
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                    pattern: EMAIL,
                  },
                ],
              })(
                // record.type === 'internal' ? <span>{val}</span> :
                  <Input onBlur={(e) => {
                    record.email = e.target.value;
                    console.log('record', record);
                    if (record._status !== 'create') {
                      if (e.target.value !== record.copyEmail) {
                        record.isUpdated = 'true';
                        record.isInviteSended = 'false';
                      }
                    }
                  }} />
              )}
            </Form.Item> : tooltipRender(val)
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.Contact`).d('联系人'),
        required: true,
        width: 200,
        key: 'contacts',
        dataIndex: 'contacts',
        render: (val, record) => {
          return (
            isEdit ? <Form.Item>
              {record.$form.getFieldDecorator(`contacts`, {
                initialValue: record.contacts,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.Contact`).d('联系人'),
                    }),
                  },
                ],
              })(
                // record.type === 'internal' ? <span>{val}</span> :
                <Input onBlur={(e) => {
                  record.contacts = e.target.value;
                  if (record._status !== 'create') {
                    if (e.target.value !== record.copyContacts) {
                      record.isUpdated = 'true';
                      record.isInviteSended = 'false';
                    }
                  }
                }} />
              )}
            </Form.Item> : tooltipRender(val)
          )
        }
      },
      {
        title: intl.get(`${promptCode}.view.title.Telephone`).d('联系方式'),
        key: 'phone',
        dataIndex: 'phone',
        width: 200,
        required: true,
        render: (val, record) => {
          return (
            isEdit ? <Form.Item>
              {record.$form.getFieldDecorator(`phone`, {
                initialValue: record.phone,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.view.title.Telephone`).d('联系方式'),
                    }),
                  },
                ],
              })(
                // record.type === 'internal' ? <span>{val}</span> :
                <Input onBlur={(e) => {
                  record.phone = e.target.value;
                  if (record._status !== 'create') {
                    if (e.target.value !== record.copyPhone) {
                      record.isUpdated = 'true';
                      record.isInviteSended = 'false';
                    }
                  }
                }} />
              )}
            </Form.Item> : tooltipRender(val)
          )
        }
      },
    ];
    console.log('InviteSuppliersList', InviteSuppliersList);
    return (
      <>
        <EditTable
          rowKey='uuid'
          dataSource={InviteSuppliersList.filter((i) => i?.isDel !== '1')}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          rowSelection={rowSelection}
        />
      </>
    );
  }
}
