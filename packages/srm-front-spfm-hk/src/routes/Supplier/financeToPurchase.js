/**
 * 供应商查询 - 财务转采购供应商准入
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/27
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component, Fragment } from 'react';
import PageWrapper from '_cus_components/Page/PageWrapper';
import { Collapse } from 'antd';
import { Form, Checkbox } from 'hzero-ui';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusSelect from '_cus_components/CusSelect';
import CusInput from '_cus_components/CusInput';
import CusSpin from '_cus_components/CusSpin';
import intl from 'utils/intl';
import FinanceToPurchaseBasicForm from '@/routes/Supplier/components/FinanceToPurchaseBasicForm';
import { connect } from 'dva';
import { getCurrentOrganizationId } from 'utils/utils';
import ClientTable from '@/routes/Supplier/components/ClientTable';
import A2PTable from '@/routes/Supplier/components/A2PTable';
import BankTable from '@/routes/Supplier/components/BankTable';
import AttachmentTable from '@/routes/Supplier/components/AttachmentTable';
import EditTable from '_cus_components/EditTable';
import { Bind } from 'lodash-decorators';
import queryString from 'querystring';
import uuid from 'uuid/v4';
import dayjs from 'dayjs';
import notification from '_cus_components/CusNotification';
import { EMAIL } from 'utils/regExp';
import formatterCollections from 'utils/intl/formatterCollections';
import AddressBankInfoList from './AddressBankInfoList';
import BankInfoList from './BankInfoList';

const { Panel } = Collapse;

const prompt = 'spfmhk.supplier';
@Form.create()
@formatterCollections({ code: [prompt] })
@connect(({ supplierHK, loading }) => ({
  supplierHK,
  previewData: supplierHK.previewData || {},
  loading: loading.effects['supplierHK/previewSupplierDetail'],
  queryBankInfoListLoading: loading.effects['supplierHK/getBankInfoList'],
  bankInfoExportLoading: loading.effects['supplierHK/bankInfoExport'],
  tenantId: getCurrentOrganizationId(),
}))
export default class FinanceToPurchase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['basic', 'contact', 'client', 'a2p', 'bank', 'attachment'],
      supplierId: null,
      contactPersonDataSource: [], // 联系人Table data
      contactPersonSelectedRowKeys: [],
      contactPersonSelectedRows: [],
      contactPersonRemove: [],
      customersDataSource: [],
      clientInfoTableDataSource: [], // 客户信息Table data
      clientInfoSelectRowKeys: [],
      clientInfoSelectRows: [],
      clientInfoRemove: [],
      a2pData: {},
      bankDataSource: [], // 银行信息Table data
      attachmentDataSource: [], // 公司附件信息Table data
      attachmentSelectRowKeys: [],
      attachmentSelectRows: [],
      attachmentRemove: [],
      lineId: null,
      isA2p: false,
      disabled: false,
      state: '', // 审批状态
      permissionType: '',
      selectedRowKeysAddressBank: [],
      selectedRowsAddressBank: [],
      selectedRowKeysBank: [],
      selectedRowsBank: [],
    };
    this.platform = {};
    this.handleAttachmentChange = this.handleAttachmentChange.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this.getSupplierDetailData();
    dispatch({
      type: 'supplierHK/init',
    });
    this.listener();
    // 获取银行地址信息
    this.handleAddressBankInfoList();
  }

  handleAttachmentChange(data = []) {
    this.setState({ attachmentDataSource: data });
  }
  
  @Bind()
  handleAddressBankInfoList() {
    const {
      dispatch,
      location: { search },
    } = this.props;
    const { supplierId, formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'supplierHK/getAddressBankInfoList',
      payload: {
        supplierId: supplierId || formRecordId,
      }
    }).then((res) => {
      if(res) {
        const newDataSource = res?.map((item) => ({
          ...item,
          rowKey: uuid(),
          _status:'update',
        }))
        dispatch({
          type: 'supplierHK/updateState',
          payload: {
            addressBankInfoDataSource: newDataSource,
          }
        })
      }
    });
  }

  // 根据地址行信息查询明细
  @Bind()
  handleBankInfoList(record) {
    const {
      dispatch,
    } = this.props;
    if(record?.id) {
      dispatch({
        type: 'supplierHK/getBankInfoList',
        payload: {
          bankHeadId: record?.id,
        }
      }).then((res) => {
        if(res) {
          const newDataSource = res?.map((item) => ({
            ...item,
            bindBankId: record?.rowKey,
            rowKey: uuid(),
            _status:'update',
          }))
          dispatch({
            type: 'supplierHK/updateState',
            payload: {
              bankInfoListDataSource: newDataSource,
            }
          })
        }
      })
    } else {
      dispatch({
        type: 'supplierHK/updateState',
        payload: {
          bankInfoListDataSource: [],
        }
      })
    }
    this.setState({
      isShowBankInfo: true,
      addressBankRecord: record,
    })
  }

  // 银行信息导出
  @Bind()
  handleExport() {
    const {
      dispatch,
      location: { search },
      } = this.props;
    const { supplierId, formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'supplierHK/bankInfoExport',
      payload: {
        supplierId: supplierId || formRecordId,
      }
    }).then(res => {
      if(res) {
        // 创建下载的链接
        const url = window.URL.createObjectURL(new Blob([res],
          // 设置该⽂件的mime类型，这⾥对应的mime类型对应为.xlsx格式
          { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
        const location = document.createElement('a');
        location.style.display = 'none';
        const fileName = `${intl.get(`${prompt}.view.title.bank.info`).d('银行信息')}.xlsx`;
        location.download = fileName;
        location.href = url;
        document.body.appendChild(location);
        location.click();
        // 释放的 URL 对象以及移除 a 标签
        URL.revokeObjectURL(location.href);
        document.body.removeChild(location);
      }
    });
  }

  // 致远流程
  @Bind()
  listener() {
    const { location: { search } } = this.props;
    const { supplierId, supplierCategory, formRecordId } = queryString.parse(search.substring(1));
    const processType = 'Y';
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        // 提交 保存 退回 撤回 知会 会签 查看流程
        if (['SUBMIT', 'DRAFT_HANDLE', 'BACK', 'UNDO', 'NOTICE', 'GIVE'].includes(e.data.submitType)) {
          this.handleSave((params) => {
            if (params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                actionInfo: {
                  preventClose: e.data.submitType === 'DRAFT_HANDLE', // 阻止页面关闭
                },
                formData: {
                  formRecordId: supplierId || formRecordId,//表单记录id（Long）
                  processType, // 采购 Y/ 非采购N
                  //下面内容为表单数据
                  ...params,
                },
              }, e.data.url);
            }
          });
        } else {
          this.handleSave((params) => {
            if (params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                actionInfo: {
                  preventClose: e.data.submitType === 'DRAFT_HANDLE', // 阻止页面关闭
                },
                formData: {
                  formRecordId: supplierId || formRecordId,//表单记录id（Long）
                  processType, // 采购 Y/ 非采购N
                  //下面内容为表单数据
                  ...params,
                },
              }, e.data.url);
            }
          });
        }
      }
    });
  }

  /**
   * 查询供应商预览详情
   */
  @Bind()
  getSupplierDetailData() {
    const { location: { search }, dispatch } = this.props;
    const {
      supplierId,
      formRecordId,
      isStart,
      state,
      permissionType,
    } = queryString.parse(search.substring(1));
    this.setState({
      state,
      permissionType,
    });
    dispatch({
      type: 'supplierHK/previewSupplierDetail',
      payload: {
        supplierId: supplierId || formRecordId,
      },
    }).then(res => {
      if (res) {
        if(res?.head?.supModifyState === 'Inapproval' || !isStart || (res?.head?.supModifyState === 'Approved' && res?.head?.supplierStatus)) {
          this.setState({
            disabled: true,
          });
        }
        this.setState({
          contactPersonDataSource: res?.contacts || [],
          clientInfoTableDataSource: res?.customers || [],
          supplierId: res?.head?.id,
          lineId: res?.line?.id,
          isA2p: ['是', 'Y'].includes(res?.line?.isA2p),
        });
      }
    });
    dispatch({
      type: 'supplierHK/previewSupplierA2pDetail',
      payload: {
        supplierId: supplierId || formRecordId,
      },
    }).then(res => {
      if (res) {
        this.setState({
          a2pData: res,
        });
      }
    });
    dispatch({
      type: 'supplierHK/previewSupplierBankDetail',
      payload: {
        supplierId: supplierId || formRecordId,
      },
    }).then(res => {
      if (res) {
        this.setState({
          bankDataSource: res,
        });
      }
    });
    dispatch({
      type: 'supplierHK/previewSupplierAttachmentDetail',
      payload: {
        supplierId: supplierId || formRecordId,
      },
    }).then(res => {
      if (res) {
        const arr = res?.map(i => {
          return {
            ...i,
            _status: 'update',
          };
        });
        this.handleAttachmentChange(arr || []);
      }
    });
  }

  // 保存后调用的查询方法，只查询基本信息和联系人信息
  @Bind()
  getSupplierInfo() {
    const { location: { search }, dispatch } = this.props;
    const {
      supplierId,
      formRecordId,
      isStart,
      state,
      permissionType,
    } = queryString.parse(search.substring(1));
    this.setState({
      state,
      permissionType,
    });
    dispatch({
      type: 'supplierHK/previewSupplierDetail',
      payload: {
        supplierId: supplierId || formRecordId,
      },
    }).then(res => {
      if (res) {
        if(res?.head?.supModifyState === 'Inapproval' || !isStart || (res?.head?.supModifyState === 'Approved' && res?.head?.supplierStatus)) {
          this.setState({
            disabled: true,
          });
        }
        this.setState({
          contactPersonDataSource: res?.contacts || [],
          clientInfoTableDataSource: res?.customers || [],
          supplierId: res?.head?.id,
          lineId: res?.line?.id,
          isA2p: ['是', 'Y'].includes(res?.line?.isA2p),
        });
      }
    });
  }

  /**
   * 设置唯一默认联系人
   * @param val
   * @param record
   */
  @Bind()
  setDefaultContact(val, record) {
    const { contactPersonDataSource } = this.state;
    record.isDefault = val.target.checked;
    const arr = contactPersonDataSource.map(i => {
      if (i.id !== record.id || i.uuid !== record.uuid) {
        return {
          ...i,
          isDefault: 'N',
        };
      } else {
        return i;
      }
    });
    this.setState({
      contactPersonDataSource: arr,
    });
  }

  // 新增一行联系人信息
  @Bind()
  handleAddContactPersonData() {
    const { contactPersonDataSource } = this.state;
    this.setState({
      contactPersonDataSource: [...contactPersonDataSource, {
        id: uuid(),
        _status: 'create',
        type: undefined,
        name: undefined,
        phone: undefined,
        email: undefined,
        isDefault: 'N',
      }],
    });
  }

  // 删除一行联系人信息
  @Bind()
  handleDelContactPersonData() {
    const { contactPersonDataSource = [], contactPersonSelectedRows = [] } = this.state;
    this.setState({
      contactPersonDataSource: contactPersonDataSource.filter(r => contactPersonSelectedRows.every(rd => rd.id !== r.id)),
      contactPersonRemove: contactPersonSelectedRows,
      contactPersonSelectedRowKeys: [],
      contactPersonSelectedRows: [],
    });
  }

  // 联系人信息表格checkBox
  @Bind()
  handleContactPersonRowSelectionChange(keys, rows) {
    this.setState({
      contactPersonSelectedRowKeys: keys,
      contactPersonSelectedRows: rows,
    });
  }

  // 新增一行客户信息
  @Bind()
  handleAddClientData() {
    const { clientInfoTableDataSource } = this.state;
    this.setState({
      clientInfoTableDataSource: [...clientInfoTableDataSource, {
        id: uuid(),
        _status: 'create',
        companyName: undefined,
        contactName: undefined,
        contactPhone: undefined,
        contactEmail: undefined,
      }],
    });
  }

  // 删除一行客户信息
  @Bind()
  handleDelClientData() {
    const { clientInfoTableDataSource = [], clientInfoSelectRows = [] } = this.state;
    this.setState({
      clientInfoTableDataSource: clientInfoTableDataSource.filter(r => clientInfoSelectRows.every(rd => rd.id !== r.id)),
      clientInfoRemove: clientInfoSelectRows,
      clientInfoSelectRowKeys: [],
      clientInfoSelectRows: [],
    });
  }

  // 客户信息表格checkBox
  @Bind()
  handleClientInfoRowSelectionChange(keys, rows) {
    this.setState({
      clientInfoSelectRowKeys: keys,
      clientInfoSelectRows: rows,
    });
  }

  // 联系人信息表格
  @Bind()
  contactPersonTableColumns() {
    const { disabled, state, permissionType } = this.state;
    return [
      {
        title: intl.get(`${prompt}.table.contact.info.type`).d('联系人类型'),
        dataIndex: 'type',
        width: 200,
        render: (val, record) => {
          const { getFieldDecorator, setFieldsValue } = this.props.form;
          if (disabled && (!['READY', 'PENDING'].includes(state) || permissionType !== 'SEND')) {
            return <>{record?.typeMeaning}</>;
          }
          return (
            <Form.Item>
              {getFieldDecorator(`type${record.id}`, {
                initialValue: record.type,
              })(<CusSelect
                style={{ width: '100%' }}
                onChange={e => {
                  record.type = e;
                }}
                placeholder={intl.get(`${prompt}.field.placeholder.select.type`).d('请选择类型')}
                lovCode='HKSP.CONTACT_TYPE'
              />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.table.contact.info.name`).d('姓名'),
        dataIndex: 'name',
        width: 200,
        render: (val, record) => {
          const { getFieldDecorator, setFieldsValue } = this.props.form;
          if (disabled && (!['READY', 'PENDING'].includes(state) || permissionType !== 'SEND')) {
            return <>{val}</>;
          }
          return (
            <Form.Item>
              {getFieldDecorator(`name${record.id}`, {
                initialValue: record.name,
              })(<CusInput onChange={e => {
                record.name = e;
              }} placeholder={intl.get(`${prompt}.field.placeholder.contact.name`).d('请输入联系姓名')}
              />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.phoneNumber`).d('电话'),
        dataIndex: 'phone',
        width: 200,
        render: (val, record) => {
          const { getFieldDecorator, setFieldsValue } = this.props.form;
          if (disabled && (!['READY', 'PENDING'].includes(state) || permissionType !== 'SEND')) {
            return <>{val}</>;
          }
          return (
            <Form.Item>
              {getFieldDecorator(`phone${record.id}`, {
                initialValue: record.phone,
              })(<CusInput onChange={e => {
                record.phone = e;
              }}
              />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.table.contact.info.email`).d('电邮'),
        dataIndex: 'email',
        width: 200,
        render: (val, record) => {
          const { getFieldDecorator, setFieldsValue } = this.props.form;
          if (disabled && (!['READY', 'PENDING'].includes(state) || permissionType !== 'SEND')) {
            return <>{val}</>;
          }
          return (
            <Form.Item>
              {getFieldDecorator(`email${record.id}`, {
                initialValue: record.email,
                rules: [
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ],
              })(<CusInput onChange={e => {
                record.email = e;
              }}
              />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.table.contact.info.default`).d('默认联系人'),
        dataIndex: 'isDefault',
        width: 200,
        align: 'left',
        render: (val, record) => {
          const { getFieldDecorator, setFieldsValue } = this.props.form;
          return (
            <Form.Item>
              {getFieldDecorator(`isDefault${uuid()}`, {
                initialValue: record.isDefault || 'N',
              })(<Checkbox
                disabled={disabled && (!['READY', 'PENDING'].includes(state) || permissionType !== 'SEND')}
                checked={record.isDefault === 'Y'}
                checkedValue='Y'
                unCheckedValue='N'
                onChange={(e) => this.setDefaultContact(e, record)}
              />)}
            </Form.Item>
          );
        },
      },
    ];
  }

  /**
   /**
   * 保存准入
   */
  @Bind()
  handleSave(callback) {
    const {
      dispatch,
      tenantId,
      previewData,
    } = this.props;
    const {
      contactPersonDataSource,
      clientInfoTableDataSource,
      attachmentDataSource,
      lineId,
    } = this.state;
    this.platform.props.form.validateFields({ force: true }, (err, values) => {
      if (!err) {
        if (values.supplierCategory === 'FINANCIALPAYMENT') {
          notification.error({
            message: intl.get(`${prompt}.form.validateFields.supcategory`).d('请更新供应商类别后再保存'),
          });
          return false;
        }
        const basicInfoParams = {
          companyNameEn: values.companyNameEn,
          companyNameCh: values.companyNameCh,
          addressEn: values.addressEn,
          addressCh: values.addressCh,
          phoneNumber: values.phoneNumber,
          fax: values.fax,
          email: values.email,
          companyWebsite: values.companyWebsite,
          companyType: values.companyType,
          product: values.product,
          companyClasses: values.companyClasses,
          professional: values.professional,
          supplierCategory: values.supplierCategory,
          supplierProductClass: values.supplierProductClass,
          foundDate: dayjs.isDayjs(values.foundDate)
            ? values.foundDate.format('YYYY-MM-DD 00:00:00')
            : undefined,
          foundAddress: values.foundAddress,
          registrationNumber: values.registrationNumber,
          country: values.country,
          orderMoneyType: values.orderMoneyType,
          prompt: values.prompt,
          paymentMethod: values.paymentMethod,
          deliveryClause: values.deliveryClause,
          organizationId: tenantId,
          id: previewData?.head?.id,
        };
        const contact = contactPersonDataSource.map(i => {
          return {
            type: i.type,
            name: i.name,
            phone: i.phone,
            email: i.email,
            isDefault: i.isDefault,
            tenantId: tenantId,
          };
        });
        const customer = clientInfoTableDataSource.map(i => {
          return {
            companyName: i.companyName,
            contactName: i.contactName,
            contactPhone: i.contactPhone,
            contactEmail: i.contactEmail,
          };
        });
        const attachment = attachmentDataSource.map(i => {
          return {
            type: i.type,
            subType: i.subType,
            description: i.description,
            // expirationDate: dayjs.isDayjs(i.expirationDate)
            //   ? i.expirationDate.format('YYYY-MM-DD 00:00:00')
            //   : dayjs(i.expirationDate).format('YYYY-MM-DD 00:00:00'),
            attachmentDate: dayjs.isDayjs(i.attachmentDate)
              ? i.attachmentDate.format('YYYY-MM-DD HH:mm:ss')
              : dayjs(i.attachmentDate).format('YYYY-MM-DD HH:mm:ss'),
            attachmentUuid: i.attachmentUuid,
            refType: i.refType,
            uploadErpStatus: i?.uploadErpStatus === 'Y' ? 'Y' : 'N'
          };
        });
        // 判断公司附件中是否有未选择的附件类型
        const checkUndefinedField = attachment.some(item => item.type === undefined);
        if(checkUndefinedField) {
          return notification.error({
            message: intl.get(`${prompt}.field.attachtype.verfy`).d('请补全公司附件中的附件类型'),
          })
        }

        dispatch({
          type: 'supplierHK/financeToPurchaseSave',
          payload: {
            dto: {
              head: { ...basicInfoParams },
              line: {
                reason: values.reason,
                purchaseInfo: values.purchaseInfo,
                partnerName: values.partnerName,
                directorName: values.directorName,
                id: lineId,
                headcount: values.headcount,
                repairReason: values.repairReason,
                creditScore: values.creditScore,
                creditRating: values.creditRating,
              },
              contact,
              customer,
              attachment,
            },
          },
        }).then(res => {
          if (res) {
            notification.success();
            this.getSupplierInfo();
          }
          if (typeof callback === 'function') {
            callback({
              ...res,
              affairTitle: intl.get(`${prompt}.todotask.fintopur.access`).d('财务转采购供应商准入：') + values.companyNameCh, //待办流程名称
            });
          }
        });
      }
    });
  }

  // 新增一行附件信息
  @Bind()
  handleAddAttachmentData() {
    const { attachmentDataSource } = this.state;
    this.setState({
      attachmentDataSource: [...attachmentDataSource, {
        id: uuid(),
        _status: 'create',
        type: undefined,
        subType: undefined,
        description: undefined,
        // expirationDate: undefined,
        attachmentDate: undefined,
        attachmentUuid: uuid(),
        refType: 'company',
      }],
    });
  }

  // 删除一行附件信息
  @Bind()
  handleDelAttachmentData() {
    const { attachmentDataSource = [], attachmentSelectRows = [] } = this.state;
    this.setState({
      attachmentDataSource: attachmentDataSource.filter(r => attachmentSelectRows.every(rd => rd.id !== r.id)),
      attachmentRemove: attachmentSelectRows,
      attachmentSelectRowKeys: [],
      attachmentSelectRows: [],
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
      queryLoading = false,
      form,
      previewData,
      supplierHK,
      queryBankInfoListLoading = false,
      bankInfoExportLoading = false,
    } = this.props;
    const {
      activeKey,
      contactPersonDataSource,
      contactPersonSelectedRowKeys,
      clientInfoTableDataSource,
      clientInfoSelectRowKeys,
      a2pData,
      bankDataSource,
      attachmentDataSource,
      isA2p,
      disabled,
      attachmentSelectRowKeys,
      state,
      permissionType,
      selectedRowKeysAddressBank,
      selectedRowKeysBank,
      isShowBankInfo = false,
    } = this.state;
    const basicInfoFormProps = {
      initialValues: {
        ...previewData.head,
        ...previewData.line,
      },
      disabled: disabled && (!['READY', 'PENDING'].includes(state) || permissionType !== 'SEND'),
    };
    const contactTableProps = {
      dataSource: contactPersonDataSource,
      rowSelection: {
        selectedRowKeys: contactPersonSelectedRowKeys,
        onChange: this.handleContactPersonRowSelectionChange,
        getCheckboxProps: () => ({
          disabled: disabled && (!['READY', 'PENDING'].includes(state) || permissionType !== 'SEND'),
        }),
      },
    };
    const clientTableProps = {
      dataSource: clientInfoTableDataSource,
      otherDataSource: clientInfoTableDataSource,
      rowSelection: {
        selectedRowKeys: clientInfoSelectRowKeys,
        onChange: this.handleClientInfoRowSelectionChange,
        getCheckboxProps: () => ({
          disabled: disabled && (!['READY', 'PENDING'].includes(state) || permissionType !== 'SEND'),
        }),
      },
      rowKey: 'id',
      form,
      readOnly: disabled && (!['READY', 'PENDING'].includes(state) || permissionType !== 'SEND'),
    };
    const contactPersonTableColumns = this.contactPersonTableColumns();
    const a2pProps = {
      data: a2pData,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: !disabled || (!['READY', 'PENDING'].includes(state) || permissionType !== 'SEND'),
        }),
      },
      rowKey: 'id',
      form,
      disabled: !disabled || (!['READY', 'PENDING'].includes(state) || permissionType !== 'SEND'),
    };
    const bankTableProps = {
      form,
      rowKey: 'id',
      dataSource: bankDataSource,
      rowSelection: {
        getCheckboxProps: () => ({
          disabled: !disabled || (!['READY', 'PENDING'].includes(state) || permissionType !== 'SEND'),
        }),
      },
      readOnly: !disabled || (!['READY', 'PENDING'].includes(state) || permissionType !== 'SEND'),
    };
    const attachmentTableProps = {
      supplierHK,
      form,
      rowKey: 'id',
      dataSource: attachmentDataSource,
      rowSelection: {
        onChange: this.handleAttachmentRowSelectionChange,
        selectedRowKeys: attachmentSelectRowKeys,
        getCheckboxProps: (record) => ({
          disabled: record?.uploadErpStatus === 'Y' ? true : (disabled && (!['READY', 'PENDING'].includes(state) || permissionType !== 'SEND')),
        }),
      },
      handleAttachmentChange: this.handleAttachmentChange,
      refType: 'bank',
      disabled: disabled && (!['READY', 'PENDING'].includes(state) || permissionType !== 'SEND'),
      initialValues: {
        ...previewData.head,
        ...previewData.line,
      },
    };

    const addressBankInfoColumnsRowSelection = {
      selectedRowKeysAddressBank,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeysAddressBank: keys,
          selectedRowsAddressBank: rows,
        });
      },
      getCheckboxProps: record => ({
        disabled: true,
      }),
    };

    const bankInfoColumnsRowSelection = {
      selectedRowKeysBank,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeysBank: keys,
          selectedRowsBank: rows,
        });
      },
      getCheckboxProps: record => ({
        disabled: true,
      }),
    };

    const addressBankInfoProps = {
      ...this.props,
      addressBankInfoColumnsRowSelection,
      handleBankInfoList: this.handleBankInfoList,
      disabled: true,
    }

    const bankInfoProps = {
      ...this.props,
      bankInfoColumnsRowSelection,
      disabled: true,
    }
    return (
      <Fragment>
        <PageWrapper loading={queryLoading}>
          <Collapse
            className='customize-collapse'
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.basic.information`).d('基本信息')}
                  arrowActive={activeKey.includes('basic')}
                />
              }
              key='basic'
            >
              <FinanceToPurchaseBasicForm
                onRef={ref => {
                  this.platform = ref;
                }}
                {...basicInfoFormProps} />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.contact.person`).d('联系信息')}
                  arrowActive={activeKey.includes('contact')}
                  buttons={
                    <d>
                      {!disabled && [null, undefined, 'READY', 'PENDING'].includes(state) && permissionType === 'SEND' &&
                        <CusButton mini
                                   onClick={this.handleDelContactPersonData}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>}
                      {!disabled && [null, undefined, 'READY', 'PENDING'].includes(state) && permissionType === 'SEND' &&
                        <CusButton mini type='primary'
                                   onClick={this.handleAddContactPersonData}>{intl.get('hzero.common.button.add').d('新增')}</CusButton>}
                    </d>
                  }
                />
              }
              key='contact'
            >
              <EditTable
                bordered
                pagination={false}
                columns={contactPersonTableColumns}
                rowKey='id'
                {...contactTableProps}
              />
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.client.information`).d('客户信息')}
                  arrowActive={activeKey.includes('client')}
                  buttons={
                    <>
                      {!disabled && [null, undefined, 'READY', 'PENDING'].includes(state) && permissionType === 'SEND' &&
                        <CusButton mini
                                   onClick={this.handleDelClientData}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>}
                      {!disabled && [null, undefined, 'READY', 'PENDING'].includes(state) && permissionType === 'SEND' &&
                        <CusButton mini type='primary'
                                   onClick={this.handleAddClientData}>{intl.get('hzero.common.button.add').d('新增')}</CusButton>}
                    </>
                  }
                />
              }
              key='client'
            >
              <ClientTable {...clientTableProps} />
            </Panel>
            {isA2p && (
              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`${prompt}.view.title.a2p.info`).d('A2P信息')}
                    arrowActive={activeKey.includes('a2p')}
                  />
                }
                key='a2p'
              >
                <A2PTable {...a2pProps} />
              </Panel>
            )}
            {/* <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.bank.info`).d('银行信息')}
                  arrowActive={activeKey.includes('bank')}
                />
              }
              key='bank'
            >
              <BankTable {...bankTableProps} />
            </Panel> */}
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.bank.info`).d('银行信息')}
                  arrowActive={activeKey.includes('bank')}
                  buttons={
                    <>
                      <CusButton
                        mini
                        onClick={this.handleExport}
                        loading={bankInfoExportLoading}
                      >
                        {intl.get('hzero.common.button.export').d('导出')}
                      </CusButton>
                    </>
                  }
                />
              }
              key='bank'
            >
              <AddressBankInfoList {...addressBankInfoProps} />
              {isShowBankInfo && <div>
                <CusSpin spinning={queryBankInfoListLoading}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: ' 16px 0' }}>
                    {false && <p>{intl.get(`${prompt}.view.title.bank.info.label`).d('提示: 若开户银行选不到，可暂默认选择“Dummy”。')}</p>}
                    {false && <div style={{ marginRight: '32px'}}>
                      <CusButton
                        mini
                        onClick={this.handleDelBankData}
                      >
                        {intl.get('hzero.common.button.delete').d('删除')}
                      </CusButton>
                      <CusButton
                        mini
                        type='primary'
                        onClick={this.handleAddBankData}
                      >
                        {intl.get('hzero.common.button.add').d('新增')}
                      </CusButton>
                      <CusButton
                        mini
                        type='primary'
                        onClick={this.saveBankInfoList}
                        loading={saveBankLoading}
                      >
                        {intl.get(`${prompt}.button.savebankinfo`).d('保存银行信息')}
                      </CusButton>
                    </div>}
                  </div>
                  <BankInfoList {...bankInfoProps} />
                </CusSpin>
              </div>}
            </Panel>
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.company.attachment`).d('公司附件')}
                  arrowActive={activeKey.includes('attachment')}
                  buttons={
                    <>
                      {!disabled && [null, undefined, 'READY', 'PENDING'].includes(state) && permissionType === 'SEND' &&
                        <CusButton mini
                                   onClick={this.handleDelAttachmentData}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>}
                      {!disabled && [null, undefined, 'READY', 'PENDING'].includes(state) && permissionType === 'SEND' &&
                        <CusButton mini type='primary'
                                   onClick={this.handleAddAttachmentData}>{intl.get('hzero.common.button.add').d('新增')}</CusButton>}
                    </>
                  }
                />
              }
              key='attachment'
            >
              <AttachmentTable {...attachmentTableProps} />
            </Panel>
          </Collapse>
        </PageWrapper>
      </Fragment>
    );
  }
}
