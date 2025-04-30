/**
 * 供应商准入 - 采购
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/28
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusInput from '_cus_components/CusInput';
import '../index.less';
import { Bind } from 'lodash-decorators';
import EditTable from '_cus_components/EditTable';
import { Collapse } from 'antd';
import uuid from 'uuid/v4';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import PurchaseForm from '@/routes/AccessToSuppliers/components/PurchaseForm';
import { Form } from 'hzero-ui';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusSelect from '_cus_components/CusSelect';
import queryString from 'query-string';
import dayjs from 'dayjs';
import CusCascader from '_cus_components/CusCascader';
import CusUpload from '_cus_components/CusUpload';
import notification from '_cus_components/CusNotification';
import { TRIM, EMAIL, PHONE } from 'utils/regExp';
import { isEmpty } from 'lodash';

const prompt = 'spfmhk.supplier';
const { Panel } = Collapse;

@Form.create()
@formatterCollections({ code: [prompt] })
@fastCodeLoader(['DICT.PARTNER_FILE_TYPE'])
@connect(({ accessToSupplierHK }) => ({
  accessToSupplierHK,
  tenantId: getCurrentOrganizationId(),
}))
export default class Purchase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['form', 'client', 'attachment'],
      clientInfoTableDataSource: [],
      clientInfoSelectRowKeys: [],
      clientInfoSelectRows: [],
      clientInfoRemove: [],
      attachmentListTableDataSource: [
        {
          id: uuid(),
          _status: 'create',
          type: 'BasicQualifications',
          subType: 'SupplierRegistrationForm',
          description: undefined,
          // expirationDate: undefined,
          attachmentDate: undefined,
          attachmentUuid: uuid(),
        },
        {
          id: uuid(),
          _status: 'create',
          type: 'BasicQualifications',
          subType: 'CMHKPartnerComplianceCommitment',
          description: undefined,
          // expirationDate: undefined,
          attachmentDate: undefined,
          attachmentUuid: uuid(),
        },
        {
          id: uuid(),
          _status: 'create',
          type: 'BasicQualifications',
          subType: 'AvalidBRcopy',
          description: undefined,
          // expirationDate: undefined,
          attachmentDate: undefined,
          attachmentUuid: uuid(),
        },
      ],
      attachmentSelectRowKeys: [],
      attachmentSelectRows: [],
      attachmentRemove: [],
      initialValue: {},
      partnerId: null,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props.props.props;
    dispatch({
      type: 'accessToSupplierHK/init',
    });
    this.queryPurchaseDetail();
    this.listener();
  }

  // 致远流程
  @Bind()
  listener() {
    const {
      location: { search },
    } = this.props.props.props;
    const { supplierCategory, affairTitle, backAffairTitle } = this.props;
    const { supplierId, formRecordId } = queryString.parse(search.substring(1));
    console.log(affairTitle, 'affairTitle2');
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        // 提交 保存 退回 撤回 知会 会签 查看流程
        if (['SUBMIT', 'DRAFT_HANDLE', 'NOTICE'].includes(e.data.submitType)) {
          this.handleSave((params) => {
            if (params) {
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  actionInfo: {
                    preventClose: e.data.submitType === 'DRAFT_HANDLE', // 阻止页面关闭
                  },
                  formData: {
                    formRecordId: supplierId || formRecordId, //表单记录id（Long）
                    affairTitle,
                    //下面内容为表单数据
                    ...params,
                  },
                },
                e.data.url
              );
            }
          });
        } else if (['GIVE', 'BACK', 'UNDO'].includes(e.data.submitType)) {
          top?.postMessage(
            {
              success: true, //表单数据验证成功或不需要验证时传true，否则传false
              submitType: e.data.submitType, //将此字段值回传
              messageType: 'GET_FORM_DATA', //获取表单数据消息
              actionInfo: {
                preventClose: e.data.submitType === 'DRAFT_HANDLE', // 阻止页面关闭
              },
              formData: {
                formRecordId: supplierId || formRecordId, //表单记录id（Long）
                affairTitle: backAffairTitle,
              },
            },
            e.data.url
          );
        } else {
          this.handleSave((params) => {
            if (params) {
              top?.postMessage(
                {
                  success: true, //表单数据验证成功或不需要验证时传true，否则传false
                  submitType: e.data.submitType, //将此字段值回传
                  messageType: 'GET_FORM_DATA', //获取表单数据消息
                  actionInfo: {
                    preventClose: e.data.submitType === 'DRAFT_HANDLE', // 阻止页面关闭
                  },
                  formData: {
                    formRecordId: supplierId || formRecordId, //表单记录id（Long）
                    affairTitle,
                    //下面内容为表单数据
                    ...params,
                  },
                },
                e.data.url
              );
            }
          });
        }
      }
    });
  }

  /**
   * 查询补充信息详情
   */
  @Bind()
  queryPurchaseDetail() {
    const {
      dispatch,
      location: { search },
    } = this.props.props.props;
    const { supplierId, formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'accessToSupplierHK/queryPurchaseDetail',
      payload: {
        supplierId: supplierId || formRecordId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          initialValue: res,
        });
        if (!res.id) {
          this.initDictDate();
        } else {
          this.queryContactDetail();
          this.queryAttachmentDetail();
        }
      }
    });
  }

  /**
   * 查询客户信息详情
   */
  @Bind()
  queryContactDetail() {
    const {
      dispatch,
      location: { search },
    } = this.props.props.props;
    const { supplierId, formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'accessToSupplierHK/queryContactDetail',
      payload: {
        supplierId: supplierId || formRecordId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          clientInfoTableDataSource: res,
        });
      }
    });
  }

  /**
   * 查询附件信息详情
   */
  @Bind()
  queryAttachmentDetail() {
    const {
      dispatch,
      location: { search },
    } = this.props.props.props;
    const { supplierId, formRecordId, isStart, state, permissionType } = queryString.parse(
      search.substring(1)
    );
    dispatch({
      type: 'accessToSupplierHK/queryAttachmentDetail',
      payload: {
        supplierId: supplierId || formRecordId,
        refType: 'company',
      },
    }).then((res) => {
      console.log(res, 'res');
      console.log(isStart, typeof isStart, 'isStart');
      if (
        (res && isStart !== 'true') ||
        (state === 'PENDING' && permissionType === 'SEND') ||
        ['READY', 'SENT', 'DONE', 'REVOKE'].includes(state)
      ) {
        console.log(res);
        this.setState({
          attachmentListTableDataSource:
            res?.length > 0 ? res : this.state.attachmentListTableDataSource,
        });
      }
    });
  }

  // dict获取数据入口
  @Bind()
  initDictDate() {
    const { dispatch } = this.props.props.props;
    const { companyName, registrationNumber } = this.props;
    const { initialValue } = this.state;
    dispatch({
      type: 'accessToSupplierHK/initDictDate',
      payload: {
        cmpanyName: companyName,
        businessRegistration: registrationNumber,
      },
    }).then((res) => {
      if (!isEmpty(res)) {
        this.setState({
          initialValue: {
            ...initialValue,
            directorName: res?.directorName,
            partnerName: res?.companyParnter,
            headcount: res?.employeesCount,
          },
          partnerId: res?.partnerId,
        });
        this.queryDictClientInfo();
        // this.queryDictCompanyAttachment();
      }
    });
  }

  // 查询DICT客户信息
  @Bind()
  queryDictClientInfo() {
    const { partnerId } = this.state;
    const { dispatch } = this.props.props.props;
    dispatch({
      type: 'accessToSupplierHK/queryDictClientInfo',
      payload: {
        partnerId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          clientInfoTableDataSource: res.content.map((item) => {
            return {
              ...item,
              id: uuid(),
              _status: 'update',
              companyName: item.customerName,
              contactName: item.customerContact,
              contactPhone: item.customerPhone,
            };
          }),
        });
      }
    });
  }

  // 查询DICT公司附件
  @Bind()
  queryDictCompanyAttachment() {
    const { partnerId } = this.state;
    const { dispatch } = this.props.props.props;
    dispatch({
      type: 'accessToSupplierHK/queryDictCompanyAttachment',
      payload: {
        partnerId,
      },
    }).then((res) => {
      this.setState({
        attachmentListTableDataSource:
          res?.content.length > 0
            ? res.content.map((item) => {
                return {
                  ...item,
                  id: uuid(),
                  _status: 'update',
                  type: null,
                  subType: null,
                  description: item.fileDesc,
                  // expirationDate: undefined,
                  attachmentDate: item.lastUpdateDate,
                  attachmentUuid: item.fileUuid,
                };
              })
            : this.state.attachmentListTableDataSource,
      });
    });
  }

  // 客户信息表格
  @Bind()
  clientInfoTableColumns() {
    const { form, currentActivityCode, state, disabledEdit } = this.props;
    const disabled = ['CG02', 'CG03'].includes(currentActivityCode) || ['SENT', 'DONE'].includes(state);
    return [
      {
        title: intl.get(`${prompt}.field.company.name`).d('公司名称'),
        dataIndex: 'companyName',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled || disabledEdit) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`companyName${uuid()}`, {
                initialValue: record?.companyName,
              })(<CusInput style={{ width: '100%' }} onChange={(e) => (record.companyName = e)} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.contact.person`).d('联系人'),
        dataIndex: 'contactName',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled || disabledEdit) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`contactName${uuid()}`, {
                initialValue: record?.contactName,
              })(<CusInput style={{ width: '100%' }} onChange={(e) => (record.contactName = e)} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.phoneNumber`).d('电话'),
        dataIndex: 'contactPhone',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled || disabledEdit) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`contactPhone${uuid()}`, {
                initialValue: record?.contactPhone,
              })(
                <CusInput style={{ width: '100%' }} onChange={(e) => (record.contactPhone = e)} />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.email`).d('电邮'),
        dataIndex: 'contactEmail',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled || disabledEdit) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`contactEmail${uuid()}`, {
                initialValue: record?.contactEmail,
                rules: [
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ],
              })(
                <CusInput style={{ width: '100%' }} onChange={(e) => (record.contactEmail = e)} />
              )}
            </Form.Item>
          );
        },
      },
    ];
  }

  // 新增一行客户信息
  @Bind()
  handleAddClientData() {
    const { clientInfoTableDataSource } = this.state;
    this.setState({
      clientInfoTableDataSource: [
        ...clientInfoTableDataSource,
        {
          id: uuid(),
          _status: 'create',
          companyName: undefined,
          contactName: undefined,
          contactPhone: undefined,
          contactEmail: undefined,
        },
      ],
    });
  }

  // 删除一行客户信息
  @Bind()
  handleDelClientData() {
    const { clientInfoTableDataSource = [], clientInfoSelectRows = [] } = this.state;
    this.setState({
      clientInfoTableDataSource: clientInfoTableDataSource.filter((r) =>
        clientInfoSelectRows.every((rd) => rd.id !== r.id)
      ),
      clientInfoRemove: clientInfoSelectRows,
      clientInfoSelectRowKeys: [],
      clientInfoSelectRows: [],
    });
  }

  // 新增一行附件信息
  @Bind()
  handleAddAttachmentData() {
    const { attachmentListTableDataSource } = this.state;
    this.setState({
      attachmentListTableDataSource: [
        ...attachmentListTableDataSource,
        {
          id: uuid(),
          _status: 'create',
          type: undefined,
          subType: undefined,
          description: undefined,
          // expirationDate: undefined,
          attachmentDate: undefined,
          attachmentUuid: uuid(),
        },
      ],
    });
  }

  // 删除一行附件信息
  @Bind()
  handleDelAttachmentData() {
    const { attachmentListTableDataSource = [], attachmentSelectRows = [] } = this.state;
    this.setState({
      attachmentListTableDataSource: attachmentListTableDataSource.filter((r) =>
        attachmentSelectRows.every((rd) => rd.id !== r.id)
      ),
      attachmentRemove: attachmentSelectRows,
      attachmentSelectRowKeys: [],
      attachmentSelectRows: [],
    });
  }

  @Bind()
  attachmentListTableColumns() {
    const { accessToSupplierHK, tenantId, form, currentActivityCode, state, supplierCategory, disabledEdit } = this.props;
    const { fileCascader = [] } = accessToSupplierHK;
    const disabled =
      ['CG02', 'CG03'].includes(currentActivityCode) || ['SENT', 'DONE'].includes(state);
    const { partnerId } = this.state;
    return [
      {
        title: intl.get(`${prompt}.field.attachment.info.upload`).d('附件上传'),
        width: 200,
        dataIndex: 'attachmentUuid',
        render: (value, record, index) => {
          const { getFieldDecorator } = form;
          return (
            <Form.Item>
              {getFieldDecorator(`attachmentUuid${record.id}`, {
                initialValue: record.attachmentUuid,
              })(<CusUpload
                viewOnly={disabled || disabledEdit}
                filePreview
                bucketName="private-bucket"
                tenantId={tenantId}
                attachmentUUID={record?.attachmentUuid}
                onUploadSuccess={() => {
                  const arr = this.state.attachmentListTableDataSource;
                  arr[index].attachmentDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
                  arr[index].attachmentUuid = record.attachmentUuid;
                  this.setState({
                    attachmentListTableDataSource: arr
                  })
                }}
              />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.attachment.type`).d('附件类型'),
        width: 300,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          const { type, subType } = record;
          const data = [type, subType];
          if(supplierCategory !== 'FINANCIALPAYMENT') {
            if(disabled || disabledEdit) {
              return <>{record.typeMeaning +  '/' + record.subTypeMeaning}</>
            }
            if (record?._status === 'create') {
              return (
                <Form.Item>
                  {getFieldDecorator(`type${record.id}`, {
                    initialValue:
                      record.type && record.subType ? [record.type, record.subType] : undefined,
                  })(
                    <CusCascader
                      fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
                      options={fileCascader.filter((i) => i.tag === 'company')}
                      expandTrigger="hover"
                      onChange={(e) => {
                        if (e) {
                          record.type = e[0];
                          record.subType = e[1];
                        }
                      }}
                    />
                  )}
                </Form.Item>
              );
            }
            return (
              <Form.Item>
                {getFieldDecorator(`type${record.id}`, {
                  initialValue: data,
                })(
                  <CusCascader
                    fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
                    options={fileCascader.filter((i) => i.tag === 'company')}
                    expandTrigger="hover"
                    onChange={(e) => {
                      if (e) {
                        record.type = e[0];
                        record.subType = e[1];
                      }
                    }}
                  />
                )}
              </Form.Item>
            );
          }
        },
      },
      {
        title: intl.get(`${prompt}.field.attachment.info.description`).d('附件描述'),
        dataIndex: 'description',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(supplierCategory !== 'FINANCIALPAYMENT') {
            if(disabled || disabledEdit) {
              return <>{value}</>
            }
            return (
              <Form.Item>
                {getFieldDecorator(`description${record.id}`, {
                  initialValue: record.description,
                })(
                  <CusInput style={{ width: '100%' }} onChange={(e) => (record.description = e)} />
                )}
              </Form.Item>
            );
          }
        },
      },
      // {
      //   title: intl.get(`${prompt}.field.attachment.info.file.expiration.date`).d('文件到期日'),
      //   dataIndex: 'expirationDate',
      //   width: 200,
      //   render: (value, record) => {
      //     const { getFieldDecorator } = form;
      //     if(supplierCategory !== 'FINANCIALPAYMENT') {
      //       if(disabled) {
      //         return <>{value}</>
      //       }
      //       return (
      //         <Form.Item>
      //           {getFieldDecorator(`expirationDate${record.id}`, {
      //             initialValue: record.expirationDate ? dayjs(record.expirationDate) : undefined
      //           })(<CusDatePicker style={{ width: '100%' }} onChange={e => record.expirationDate = e} />)}
      //         </Form.Item>
      //       )
      //     }
      //   }
      // },
      {
        title: intl.get(`${prompt}.field.attachment.info.last.update.time`).d('最后更新时间'),
        dataIndex: 'attachmentDate',
        width: 200,
      },
    ];
  }

  @Bind()
  handleSave(callback) {
    const {
      dispatch,
      location: { search },
    } = this.props.props.props;
    const { purchase, supplierCategory, processType } = this.props;
    const { supplierId, formRecordId } = queryString.parse(search.substring(1));
    const { clientInfoTableDataSource, attachmentListTableDataSource, initialValue } = this.state;
    // if(purchase && !['Financial payments', '财务付款'].includes(supplierCategory)) {
    if (purchase && processType === 'Y') {
      this.platform.props.form.validateFields((err, values) => {
        if(!err){
          if (attachmentListTableDataSource?.length === 0) {
            notification.error({
              message: intl.get(`${prompt}.field.verify.fileupload`).d('请按要求上传附件。')
            });
            return false;
          }
          if(attachmentListTableDataSource?.length > 0) {
            if(attachmentListTableDataSource.some(i => i.attachmentDate === undefined)) {
              notification.error({
                message: intl.get(`${prompt}.field.verify.fileupload`).d('请按要求上传附件。')
              });
              return false;
            }
          }
          const purchaseInfoParams = {
            ...values,
            id: initialValue.id,
          };
          const customer = clientInfoTableDataSource?.map((i) => {
            return {
              companyName: i.companyName,
              contactName: i.contactName,
              contactPhone: i.contactPhone,
              contactEmail: i.contactEmail,
            };
          });
          const attachment = attachmentListTableDataSource?.map((i) => {
            return {
              type: i.type,
              subType: i.subType,
              description: i.description,
              // expirationDate: dayjs.isDayjs(i.expirationDate)
              //   ? i.expirationDate.format("YYYY-MM-DD 00:00:00")
              //   : dayjs(i.expirationDate).format('YYYY-MM-DD 00:00:00'),
              attachmentDate: dayjs.isDayjs(i.attachmentDate)
                ? i.attachmentDate.format('YYYY-MM-DD HH:mm:ss')
                : undefined,
              attachmentUuid: i.attachmentUuid,
            };
          });
          const paramsDTO = {
            supplierId: supplierId || formRecordId,
            line: purchaseInfoParams,
            customer,
            attachment,
          };

          const checkUndefinedField = attachment.some((item) => item.type === undefined);
          if (checkUndefinedField) {
            return notification.error({
              message: intl.get(`${prompt}.field.attachtype.verfy`).d('请补全公司附件中的附件类型'),
            });
          }

          dispatch({
            type: 'accessToSupplierHK/purchaseInfoSave',
            payload: {
              dto: paramsDTO,
            },
          }).then((res) => {
            if (res) {
              notification.success();
              this.setState({
                initialValue: res.line,
              });
              if (typeof callback === 'function') {
                callback({ ...res, processType });
              }
            }
          });
        }
      });
    }
  }

  // 客户信息表格checkBox
  @Bind()
  handleClientInfoRowSelectionChange(keys, rows) {
    this.setState({
      clientInfoSelectRowKeys: keys,
      clientInfoSelectRows: rows,
    });
  }

  // 附件信息表格checkBox
  @Bind()
  handleAttachmentRowSelectionChange(keys, rows) {
    this.setState({
      attachmentSelectRowKeys: keys,
      attachmentSelectRows: rows,
    });
  }

  render() {
    const {
      activeKey,
      attachmentListTableDataSource,
      clientInfoTableDataSource,
      clientInfoSelectRowKeys,
      attachmentSelectRowKeys,
      initialValue,
    } = this.state;
    const { currentActivityCode, supplierCategory, state, disabledEdit } = this.props;
    const isFinance = supplierCategory === 'FINANCIALPAYMENT';
    const disabled = ['CG02', 'CG03'].includes(currentActivityCode) || ['SENT', 'DONE'].includes(state) || disabledEdit;
    const purchaseFormProps = {
      onRef: (ref) => (this.platform = ref),
      initialValue,
      disabled: disabled || isFinance || state === 'DONE',
    };
    const clientInfoTableColumns = this.clientInfoTableColumns();
    const attachmentListTableColumns = this.attachmentListTableColumns();
    const clientInfoRowSelection = {
      selectedRowKeys: clientInfoSelectRowKeys,
      onChange: this.handleClientInfoRowSelectionChange,
      getCheckboxProps: () => ({
        disabled: disabled || isFinance || state === 'DONE',
      }),
    };
    const attachmentRowSelection = {
      selectedRowKeys: attachmentSelectRowKeys,
      onChange: this.handleAttachmentRowSelectionChange,
      getCheckboxProps: () => ({
        disabled: disabled || isFinance || state === 'DONE',
      }),
    };
    return (
      <>
        <Collapse
          className="customize-collapse"
          defaultActiveKey={activeKey}
          onChange={(collapseKeys) => {
            this.setState({ activeKey: collapseKeys });
          }}
          style={{ border: 'none' }}
        >
          <Panel
            data-border={false}
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.purchase.extra.info`).d('采购补充信息')}
                arrowActive={activeKey.includes('form')}
              />
            }
            key="form"
          >
            <PurchaseForm {...purchaseFormProps} />
          </Panel>
          <Panel
            data-border={false}
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.client.information`).d('客户信息')}
                arrowActive={activeKey.includes('client')}
                buttons={
                  <>
                    {!disabled && !isFinance && state !== 'DONE' && (
                      <CusButton mini onClick={this.handleDelClientData}>
                        {intl.get('hzero.common.button.delete').d('删除')}
                      </CusButton>
                    )}
                    {!disabled && !isFinance && state !== 'DONE' && (
                      <CusButton mini type="primary" onClick={this.handleAddClientData}>
                        {intl.get('hzero.common.button.add').d('新增')}
                      </CusButton>
                    )}
                  </>
                }
              />
            }
            key="client"
          >
            <p>
              {intl.get(`${prompt}.view.title.client.tips`).d('建议填写合作的客户单位，供参考。')}
            </p>
            <EditTable
              bordered
              pagination={false}
              dataSource={clientInfoTableDataSource}
              columns={clientInfoTableColumns}
              rowKey="id"
              rowSelection={clientInfoRowSelection}
            />
          </Panel>
          <Panel
            data-border={false}
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.company.attachment`).d('公司附件')}
                arrowActive={activeKey.includes('attachment')}
                buttons={
                  <>
                    {!disabled && !isFinance && state !== 'DONE' && (
                      <CusButton mini onClick={this.handleDelAttachmentData}>
                        {intl.get('hzero.common.button.delete').d('删除')}
                      </CusButton>
                    )}
                    {!disabled && !isFinance && state !== 'DONE' && (
                      <CusButton mini type="primary" onClick={this.handleAddAttachmentData}>
                        {intl.get('hzero.common.button.add').d('新增')}
                      </CusButton>
                    )}
                  </>
                }
              />
            }
            key="attachment"
          >
            <EditTable
              bordered
              pagination={false}
              dataSource={
                supplierCategory !== 'FINANCIALPAYMENT' ? attachmentListTableDataSource : []
              }
              columns={attachmentListTableColumns}
              rowKey="id"
              rowSelection={attachmentRowSelection}
            />
          </Panel>
        </Collapse>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </>
    );
  }
}
