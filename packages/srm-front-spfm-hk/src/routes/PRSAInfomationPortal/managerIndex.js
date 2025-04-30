/**
 * 采购复核供应商准入信息（门户）
 * @Author: huasheng.fang@hand-china.com
 * @Date: 2023/9/20
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import { Col, Collapse, Row } from 'antd';
import { connect } from 'dva';
import uuid from 'uuid/v4';
const { Panel } = Collapse;
import dayjs from 'dayjs';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { Form } from 'hzero-ui';
import { getCurrentUser, getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import CusButton from '_cus_components/CusButton';
import CusSpin from '_cus_components/CusSpin';
import { getLFormGridSpan } from 'srm-front-common/lib/utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
// import ContactTable from '@/routes/Approval/components/ContactTable';
import BasicInfoForm from './components/BasicInfoForm';
import CompanyInfoForm from './components/CompanyInfoForm';
import ContactTable from './components/ContactTable';
import ClientTable from './components/ClientTable';
import BankTable from './components/BankTable';
import AttachmentTable from './components/AttachmentTable';
import queryString from 'querystring';
import AddressBankInfoList from './AddressBankInfoList';
import BankInfoList from './BankInfoList';

const prompt = 'spfmhk.supplier';
const organizationId = getCurrentOrganizationId();
const currentUser = getCurrentUser();
@formatterCollections({ code: [prompt] })
@connect(({ loading, prsaInfomationPortal }) => ({
  prsaInfomationPortal,
  fetchListLoading: loading.effects['prsaInfomationPortal/queryInfo'],
  queryBankInfoListLoading: loading.effects['prsaInfomationPortal/getBankInfoList'],
}))

@Form.create()
export default class PurchasingManager extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search = '', pathname },
    } = props;
    console.log('pathname', pathname);
    const registerState = pathname.substring(pathname.lastIndexOf('/') + 1);
    console.log('registerState', registerState);
    const { createdBy, formRecordId } = queryString.parse(search.substr(1)) || {};
    this.state = {
      registerState, // 企业注册状态  recheck-准入信息/退回   manager-经理审核  basicUpdate-信息更新 bankUpdate- 银行更新
      createdBy: createdBy || formRecordId,
      activeKey: ['basicInfo', 'basic', 'contact', 'client', 'bank', 'attachment'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      contactSelectRows: [],
      contactSelectRowKeys: [],
      clientSelectRows: [],
      clientSelectRowKeys: [],
      bankSelectRows: [],
      bankSelectRowKeys: [],
      attachSelectRows: [],
      attachSelectRowKeys: [],
      headId: null,
      activityCode: null,
      selectedRowKeysAddressBank: [],
      selectedRowsAddressBank: [],
      selectedRowKeysBank: [],
      selectedRowsBank: [],
    }
  }

  componentDidMount() {
    const { registerState, createdBy, } = this.state;
    // console.log('registerState', registerState);
    // console.log('createdBy', createdBy);
    // console.log('createdBy ==portal', createdBy === 'portal');
    this.init();
    this.listener();
    // const { isStart, caseId } = queryString.parse(search.substring(1));
    // console.log('isStart', isStart);

  }

  @Bind()
  init() {
    // console.log('初始化；');
    const { dispatch, location: { search = '', pathname }, } = this.props;
    const { activityCode } = queryString.parse(search.substring(1));
    const { registerState, createdBy } = this.state;
    // const userId = createdBy !== 'portal' ? createdBy : id; //和致远对接的时候，createBy肯定是id 不可能是字
    // console.log('userId', userId);
    dispatch({
      type: 'prsaInfomationPortal/initValueList',
    });
    this.query(createdBy);
    this.setState({
      activityCode
    })
    console.log(activityCode, 'activityCode');
  }


  // 致远流程
  @Bind()
  listener() {
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      console.log('e.data.submitType', e.data.submitType);
      // 退回流程
      if (['BACK'].includes(e.data.submitType)) {
        this.saveInfo((params) => {
          if (params) {
            console.log('params', params);
            console.log('top', top);
            top?.postMessage({
              success: true, //表单数据验证成功或不需要验证时传true，否则传false
              submitType: e.data.submitType,//将此字段值回传
              messageType: 'GET_FORM_DATA', //获取表单数据消息
              formData: {
                formRecordId: params?.userId,//表单记录id（Long）
                affairTitle: params?.affairTitle, //待办流程名称
                subject: params?.affairTitle, //待办流程名称
                //下面内容为表单数据
                ...params,
              }
            }, e.data.url)
          }
        });
        return;
      }
      if (e.data.messageType === 'GET_FORM_DATA') {
        console.log('e.data.submitType', e.data.submitType);
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        // 提交 SEND 保存 DRAFT_HANDLE 会签 GIVE  知会 NOTICE 查看流程 PROCESS_SHOW
        if (['SEND', 'SUBMIT', 'DRAFT_HANDLE'].includes(e.data.submitType)) {
          this.saveInfo((params) => {
            console.log('params', params);
            if (params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                formData: {
                  formRecordId: params?.userId,//表单记录id（Long）
                  affairTitle: params?.affairTitle, //待办流程名称
                  subject: params?.affairTitle, //待办流程名称
                  //下面内容为表单数据
                  ...params,
                }
              }, e.data.url)
            }
          });
        } else {
          top?.postMessage({
            success: true, //表单数据验证成功或不需要验证时传true，否则传false
            submitType: e.data.submitType,//将此字段值回传
            messageType: 'GET_FORM_DATA', //获取表单数据消息
            formData: {}
          }, e.data.url)
        }
      }
    })
  }


  // 查询
  @Bind()
  async query(userId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'prsaInfomationPortal/queryInfo',
      payload: {
        userId,
      },
    }).then((res) => {
      if (res) {
        const companyInfo = {
          ...res?.cmhkSupAccessTryLine,
          ...res?.supAccessTryHeads,
        };
        const lineInfo = {
          ...res?.supAccessTryHeads,
          ...res?.cmhkSupAccessTryLine,
        };
        this.setState({
          headId: res?.supAccessTryHeads?.id,
        })

        const contactList = res.supAccessTryContactsList?.map((item) => {
          return {
            ...item,
            contactId: uuid(),
          };
        });
        const clientList = res.supAccessTryCustomerList?.map((item) => {
          return {
            ...item,
            clientId: uuid(),
          };
        });
        const bankList = res.supplierAccessTryBankList?.map((item) => {
          return {
            ...item,
            bankId: uuid(),
          };
        });
        dispatch({
          type: 'prsaInfomationPortal/updateState',
          payload: {
            companyInfo,
            contactList,
            clientList,
            bankList,
            attachmentList: res?.supAccessTryAttachList,
            lineInfo,
          },
        });
        // 获取银行地址信息
        this.handleAddressBankInfoList();
      }
    });
  }

  @Bind()
  handleAddressBankInfoList() {
    const {
      dispatch,
      prsaInfomationPortal,
    } = this.props;

    const { companyInfo = {} } = prsaInfomationPortal;
    
    dispatch({
      type: 'prsaInfomationPortal/getAddressBankInfoList',
      payload: {
        supplierId: companyInfo?.refHeadId,
      }
    }).then((res) => {
      if(res) {
        const newDataSource = res?.map((item) => ({
          ...item,
          isMainAddressFlagY: item?.isMainAddress === 'Y' ? 'Y' : 'N', // 保存时用来判断的主地址
          rowKey: uuid(),
          _status:'update',
        }))
        dispatch({
          type: 'prsaInfomationPortal/updateState',
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
        type: 'prsaInfomationPortal/getBankInfoList',
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
            type: 'prsaInfomationPortal/updateState',
            payload: {
              bankInfoListDataSource: newDataSource,
            }
          })
        }
      })
    } else {
      dispatch({
        type: 'prsaInfomationPortal/updateState',
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
      prsaInfomationPortal,
     } = this.props;
    const { companyInfo = {} } = prsaInfomationPortal;
    dispatch({
      type: 'prsaInfomationPortal/bankInfoExport',
      payload: {
        supplierId: companyInfo?.refHeadId,
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

  // 保存
  @Bind()
  async saveInfo(callback) {
    console.log('callback', callback);
    // console.log('approvalStatus', approvalStatus);
    // console.log("保存");
    const { dispatch, prsaInfomationPortal } = this.props;
    const { registerState, headId, createdBy } = this.state;
    const { language } = currentUser;
    console.log('language', language);
    console.log('registerState', registerState);
    const {
      companyInfo = {},
      contactList = [],
      clientList = [],
      bankList = [],
      attachmentList = [],
      lineInfo = {},
    } = prsaInfomationPortal;

    // 附件的文件到期日得调整一下；
    const newAttachmentList = attachmentList.map((item) => {
      return {
        ...item,
        expirationDateSt: item.expirationDate,
      };
    });
    // 采购复核供应商准入信息(门户)——保存
    const companyForm = this.companyForm.getFieldsValue();
    const newCompanyInfo = { ...companyInfo, ...companyForm };
    newCompanyInfo.foundDate = newCompanyInfo.foundDate ? dayjs(newCompanyInfo.foundDate).format(getDateTimeFormat()) : null;
    newCompanyInfo.applyDate = newCompanyInfo.applyDate ? dayjs(newCompanyInfo.applyDate).format(getDateTimeFormat()) : null;
    newCompanyInfo.statusUpdateTime = newCompanyInfo.statusUpdateTime ? dayjs(newCompanyInfo.statusUpdateTime).format(getDateTimeFormat()) : null;
    newCompanyInfo.supplierAccessTime = newCompanyInfo.supplierAccessTime ? dayjs(newCompanyInfo.supplierAccessTime).format(getDateTimeFormat()) : null;
    newCompanyInfo.versionsUpdateTime = newCompanyInfo.versionsUpdateTime ? dayjs(newCompanyInfo.versionsUpdateTime).format(getDateTimeFormat()) : null;
    newCompanyInfo.tenantId = organizationId;
    newCompanyInfo.id = headId;
    const newLineInfo = { ...newCompanyInfo, ...lineInfo };
    console.log('newCompanyInfo', newCompanyInfo);
    if (typeof callback === 'function') {
      callback(
        {
          newLineInfo,
          newAttachmentList: newAttachmentList,
          contactList: contactList,
          clientList: clientList,
          newCompanyInfo,
          bankList: bankList,
          headId,
          affairTitle: `${intl.get('spfmhk.supplier.todotask.portalsupplier.access').d('门户供应商准入：')}${language === 'zh_CN' ? newCompanyInfo.companyNameCh : newCompanyInfo.companyNameEn}`,
          userId: createdBy,
        }
      );
    }
  }

  // 提交
  @Bind()
  submitInfo() {
    console.log("提交");
    // 传参和保存一样
  }


  // 联系人新增；
  @Bind()
  addContactSource() {
    // console.log('联系人新增');
    const { dispatch,
      prsaInfomationPortal: { contactList = [] },
    } = this.props;
    const { headId } = this.state;
    const newData = {
      tenantId: organizationId,
      type: '', // 联系人类型
      name: '', // 姓名
      phone: '', // 电话
      email: '', // 电邮
      isDefault: 'N', // 默认联系人
      isDel: '0',
      _status: 'create',
      contactId: uuid(),
      refHeadId: headId,
    };
    const newContactList = [...contactList, newData];
    dispatch({
      type: 'prsaInfomationPortal/updateState',
      payload: {
        contactList: newContactList,
      },
    });
  }

  // 联系人删除
  @Bind()
  delContactSource() {
    const { dispatch, prsaInfomationPortal } = this.props;
    const { contactSelectRows } = this.state;
    const { contactList = [] } = prsaInfomationPortal;
    let newContactList = [];
    contactList.map(item => {
      contactSelectRows.map(i => {
        if (item.contactId === i.contactId) {
          if (item.id) {
            item.isDel = '1';
            newContactList.push(item);
          }
        } else {
          newContactList.push(item);
        }
      });
    });

    dispatch({
      type: 'prsaInfomationPortal/updateState',
      payload: {
        contactList: newContactList,
      },
    });
    this.setState({
      contactSelectRowKeys: [],
      contactSelectRows: [],
    });
  }

  // 客户新增；
  @Bind()
  addClientSource() {
    const { dispatch,
      prsaInfomationPortal: { clientList = [] },
    } = this.props;
    const { headId } = this.state;

    const newData = {
      tenantId: organizationId,
      companyName: '', // 公司名称
      contactName: '', // 姓名
      contactPhone: '', // 电话
      contactEmail: '', // 电邮
      isDel: '0',
      _status: 'create',
      clientId: uuid(),
      refHeadId: headId,
    };
    const newclientList = [...clientList, newData];
    dispatch({
      type: 'prsaInfomationPortal/updateState',
      payload: {
        clientList: newclientList,
      },
    });
  }

  // 客户删除
  @Bind()
  delClientSource() {
    const { dispatch, prsaInfomationPortal } = this.props;
    const { clientSelectRows } = this.state;
    const { clientList = [] } = prsaInfomationPortal;
    let newclientList = [];
    clientList.map(item => {
      clientSelectRows.map(i => {
        if (item.clientId === i.clientId) {
          if (item.id) {
            item.isDel = '1';
            newclientList.push(item);
          }
        } else {
          newclientList.push(item);
        }
      });
    });

    dispatch({
      type: 'prsaInfomationPortal/updateState',
      payload: {
        clientList: newclientList,
      },
    });
    this.setState({
      clientSelectRowKeys: [],
      clientSelectRows: [],
    });
  }

  // 银行新增；
  @Bind()
  addBankSource() {
    const { dispatch,
      prsaInfomationPortal: { bankList = [] },
    } = this.props;
    const { headId } = this.state;
    // console.log('银行新增-------');
    const newData = {
      _status: 'create',
      bankId: uuid(),
      tenantId: organizationId,
      bankName: '', // 供应商开户银行
      branchName: '', // 分行名称
      country: '', // 国家
      interRemittanceNum: '', // 国际汇款编号
      accountName: '', // 账户名称
      bankAccountName: '', // 银行账户
      payerAddress: '', // 付款对象地址
      isMainAddress: '0', // 是否主地址
      addressStatus: '', // 地址状态
      payerCode: '', // 付款对象代码
      isMain: '0', // 是否主账号
      bankStatus: '', // 银行状态
      refHeadId: headId,
      isDel: '0',
    };
    const newbankList = [...bankList, newData];
    dispatch({
      type: 'prsaInfomationPortal/updateState',
      payload: {
        bankList: newbankList,
      },
    });
  }

  // 银行删除
  @Bind()
  delBankSource() {
    const { dispatch, prsaInfomationPortal } = this.props;
    const { bankSelectRows } = this.state;
    const { bankList = [] } = prsaInfomationPortal;
    let newbankList = [];
    bankList.map(item => {
      bankSelectRows.map(i => {
        if (item.bankId === i.bankId) {
          if (item.id) {
            item.isDel = '1';
            newbankList.push(item);
          }
        } else {
          newbankList.push(item);
        }
      });
    });
    dispatch({
      type: 'prsaInfomationPortal/updateState',
      payload: {
        bankList: newbankList,
      },
    });
    this.setState({
      bankSelectRowKeys: [],
      bankSelectRows: [],
    });
  }

  // 附件新增；
  @Bind()
  addAttachSource() {
    const { dispatch,
      prsaInfomationPortal: { attachmentList = [] },
    } = this.props;
    const { registerState, headId } = this.state;
    const newData = {
      attachmentUuid: uuid(),
      _status: 'create',
      tenantId: organizationId,
      type: '', // 附件类型
      description: '', // 附件描述
      expirationDate: '', // 文件到期日
      attachmentDate: '', // 最后更新时间
      filePath: '', // 附件上传
      isDel: '0',
      refType: registerState === 'bankUpdate' ? 'bank' : 'company', // 附件关联信息 ,
      attachmentCount: 0, // 附件数量
      refHeadId: headId,
    };
    const newattachmentList = [...attachmentList, newData];
    dispatch({
      type: 'prsaInfomationPortal/updateState',
      payload: {
        attachmentList: newattachmentList,
      },
    });
  }

  // 附件删除
  @Bind()
  delAttachSource() {
    const { dispatch, prsaInfomationPortal } = this.props;
    const { attachSelectRows } = this.state;
    const { attachmentList = [] } = prsaInfomationPortal;
    let newattachmentList = [];
    attachmentList.map(item => {
      attachSelectRows.map(i => {
        if (item.attachmentUuid === i.attachmentUuid) {
          if (item.id) {
            item.isDel = '1';
            newattachmentList.push(item);
          }
        } else {
          newattachmentList.push(item);
        }
      });
    });
    dispatch({
      type: 'prsaInfomationPortal/updateState',
      payload: {
        attachmentList: newattachmentList,
      },
    });
    this.setState({
      attachSelectRowKeys: [],
      attachSelectRows: [],
    });
  }


  render() {
    const {
      activeKey,
      registerState,
      activityCode,
      selectedRowKeysAddressBank,
      selectedRowKeysBank,
      isShowBankInfo = false,
    } = this.state;
    const { dispatch, form, prsaInfomationPortal, fetchListLoading = false, queryBankInfoListLoading = false, bankInfoExportLoading = false } = this.props;
    const {
      lineInfo = {},
      companyInfo = {},
      contactList = [],
      clientList = [],
      bankList = [],
      attachmentList = [],
      fileCascader = [],
    } = prsaInfomationPortal;

    const disabled = registerState === 'manager' ? true : false;
    // const disabled = activityCode !== 'CGJL02'; // 采购员复核节点可编辑，其余不可编辑
    // const gridSpan = getLFormGridSpan();

    // 基础props
    const basicInfoFormProps = {
      registerState,
      data: lineInfo,
      loading: fetchListLoading,
      onRef: (node) => {
        this.basicInfoForm = node.props.form
      },
    };
    // 基本信息props
    const companyInfoFormProps = {
      registerState,
      data: companyInfo,
      loading: fetchListLoading,
      onRef: (node) => {
        this.companyForm = node.props.form
      },
    };
    // 联系人RowSelection
    const contactTablerowSelection = {
      columnWidth: 50,
      onChange: (selectedRowKeys, selectedRows) => {
        // 选中项发生变化时的回调
        this.setState({
          contactSelectRowKeys: selectedRowKeys,
          contactSelectRows: selectedRows,
        });
      },
      getCheckboxProps: (record) => ({
        disabled: true, // 选择框的是否可选
      }),
    };
    // 联系信息 props
    const contactTableProps = {
      registerState,
      rowSelection: contactTablerowSelection,
      dispatch,
      contactList,
      loading: fetchListLoading,
      form,
      // loading,
      onRef: () => { },
      disabled: true
    };

    // 客户RowSelection
    const clientTablerowSelection = {
      columnWidth: 50,
      onChange: (selectedRowKeys, selectedRows) => {
        // 选中项发生变化时的回调
        this.setState({
          clientSelectRowKeys: selectedRowKeys,
          clientSelectRows: selectedRows,
        });
      },
      getCheckboxProps: (record) => ({
        disabled: true, // 选择框的是否可选
      }),
    };
    // 客户信息 props
    const clientTableProps = {
      registerState,
      rowSelection: clientTablerowSelection,
      dispatch,
      clientList,
      loading: fetchListLoading,
      form,
      // loading,
      onRef: () => { },
      disabled: true
    };


    // 银行RowSelection
    const bankTablerowSelection = {
      columnWidth: 50,
      onChange: (selectedRowKeys, selectedRows) => {
        // 选中项发生变化时的回调
        this.setState({
          bankSelectRowKeys: selectedRowKeys,
          bankSelectRows: selectedRows,
        });
      },
      getCheckboxProps: (record) => ({
        disabled: true, // 选择框的是否可选
      }),
    };
    // 银行 props
    const bankTableProps = {
      registerState,
      rowSelection: bankTablerowSelection,
      dispatch,
      bankList,
      loading: fetchListLoading,
      form,
      // loading,
      onRef: () => { },
      disabled: true
    };

    // 附件 RowSelection
    const attachTablerowSelection = {
      columnWidth: 50,
      onChange: (selectedRowKeys, selectedRows) => {
        // 选中项发生变化时的回调
        this.setState({
          attachSelectRowKeys: selectedRowKeys,
          attachSelectRows: selectedRows,
        });
      },
      getCheckboxProps: (record) => ({
        disabled: true, // 选择框的是否可选
      }),
    };

    // 附件 props
    const attachmentProps = {
      registerState,
      rowSelection: attachTablerowSelection,
      dispatch,
      attachmentList,
      form,
      loading: fetchListLoading,
      fileCascader,
      comSource: registerState === 'bankUpdate' ? 'bank' : 'company',
      // loading,
      onRef: () => { },
      disabled: true
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
      <PageWrapper>
        <Collapse
          className="customize-collapse"
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
            key="basic"
          >
            {/* <p>{intl.get(`${prompt}.view.title.basicInfo.tips`).d('适用于企业、个体工商户、事业单位等，通过营业执照，组织机构代码等相关资质进行认证')}</p> */}
            <CompanyInfoForm {...companyInfoFormProps} />
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.contact.person`).d('联系人信息')}
                arrowActive={activeKey.includes('contact')}
              />
            }
            key="contact"
          >
            {/*{!disabled && <p>{intl.get(`${prompt}.view.title.contact.tips`).d('提示: 真实的联系人信息便于合作企业快速联系您，至少需要维护一条默认联系人。 ')}</p>}*/}
            {/* {!disabled && <div className="table-operator">*/}
            {/*  <CusButton onClick={this.delContactSource} >{intl.get('hzero.common.button.delete').d('删除')}</CusButton>*/}
            {/*  /!*<CusButton>{intl.get('hzero.common.button.edit').d('编辑')}</CusButton>*!/*/}
            {/*  <CusButton onClick={this.addContactSource} type="primary">{intl.get('hzero.common.button.add').d('新增')}</CusButton>*/}
            {/*</div>}*/}
            <ContactTable {...contactTableProps} />
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.client.information`).d('客户信息')}
                arrowActive={activeKey.includes('client')}
              />
            }
            key="client"
          >
            {/*{!disabled && <p>{intl.get(`${prompt}.view.title.client.tips`).d('提示: 建议填写合作的客户单位，供参考。')}</p>}*/}
            {/* {!disabled && <div className="table-operator">*/}
            {/*  <CusButton onClick={this.delClientSource}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>*/}
            {/*  /!*<CusButton>{intl.get('hzero.common.button.edit').d('编辑')}</CusButton>*!/*/}
            {/*  <CusButton onClick={this.addClientSource} type="primary">{intl.get('hzero.common.button.add').d('新增')}</CusButton>*/}
            {/*</div>}*/}
            <ClientTable {...clientTableProps} />
          </Panel>
          {/* <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.bank.info`).d('银行信息')}
                arrowActive={activeKey.includes('bank')}
              />
            }
            key="bank"
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
            key="bank"
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
              />
            }
            key="attachment"
          >
            {/*{!disabled && <p>{intl.get(`${prompt}.view.title.attachment3.tips`).d('请上传基本资质的三项必要文件')}</p>}*/}
            <AttachmentTable {...attachmentProps} />
          </Panel>
        </Collapse>
      </PageWrapper >
    )
  }
}
