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
import notification from '_cus_components/CusNotification';
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
import { ready } from '@/plugin/udc-sdk-esm';
import CusModal from '_cus_components/CusModal';
import AddressBankInfoList from './AddressBankInfoList';
import BankInfoList from './BankInfoList';

const prompt = 'spfmhk.supplier';
const organizationId = getCurrentOrganizationId();
const currentUser = getCurrentUser();
@formatterCollections({ code: [prompt] })
@connect(({ loading, prsaInfomationPortal }) => ({
  prsaInfomationPortal,
  fetchListLoading: loading.effects['prsaInfomationPortal/queryBankInfo'],
  backLoading: loading.effects[`prsaInfomationPortal/returnPortalChange`] ||
    loading.effects[`prsaInfomationPortal/backInfoQuery`] ||
    loading.effects[`prsaInfomationPortal/backInfo`] ||
    loading.effects[`prsaInfomationPortal/finishedDone`] ||
    loading.effects[`prsaInfomationPortal/submitInfo`] ||
    loading.effects[`prsaInfomationPortal/getEditAddressBankInfoList`],
  queryBankInfoListLoading: loading.effects['prsaInfomationPortal/getEditBankInfoList'],
  bankInfoEditExportLoading: loading.effects['prsaInfomationPortal/bankInfoEditExport'],
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
    const { createdBy, formRecordId, caseId } = queryString.parse(search.substr(1)) || {};
    this.state = {
      registerState, // 企业注册状态  recheck-准入信息/退回   manager-经理审核  basicUpdate-信息更新 bankUpdate- 银行更新
      createdBy: createdBy || formRecordId,
      caseId, //致远caseId
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
      backInfoFlag: false,
      selectedRowKeysAddressBank: [],
      selectedRowsAddressBank: [],
      selectedRowKeysBank: [],
      selectedRowsBank: [],
    }
  }

  componentDidMount() {
    // 致远自定义按钮
    const { location: { search } } = this.props;
    const { caseId } = this.state;
    const { isStart } = queryString.parse(search.substring(1));
    console.log('isStart', isStart);
    // if ((isStart === 'true' || isStart) && !caseId) {
    //   ready({
    //     mode: 'iframe',
    //     tenant: 'CMI',
    //   }, (instance) => {
    //     //  调用iframeSdk为CMI定制API insertBtnForToolbar, 不设置id，默认为当前页面第一个iframe控件插入按钮
    //     instance.getCustomApi().insertBtnForToolbar({
    //       // 按钮插入位置
    //       position: 1,
    //       btns: [
    //         // {
    //         //   // 按钮名称
    //         //   name: intl.get(`hzero.common.view.button.save`).d('保存'),
    //         //   customEvents: [
    //         //     {
    //         //       type: 'click',
    //         //       func: () => {
    //         //         // 业务逻辑
    //         //         console.log('点击了保存按钮');
    //         //         this.saveInfo();
    //         //       }
    //         //     }
    //         //   ]
    //         // },
    //         {
    //           // 按钮名称
    //           name: intl.get(`${prompt}.button.process.reject`).d('退回'),
    //           customEvents: [
    //             {
    //               type: 'click',
    //               func: () => {
    //                 // 业务逻辑
    //                 console.log('点击了退回按钮');
    //                 this.setState({
    //                   backInfoFlag: true
    //                 })
    //               }
    //             }
    //           ]
    //         }]
    //     });
    //   });
    // }

    this.init();
    this.listener();
    // 查询变更单的供应商地址信息
    this.handleEditIdAddressBankInfoList();
  }

  // 变更id查询银行信息
  @Bind()
  handleEditIdAddressBankInfoList() {
    const {
      dispatch,
      location: { search },
    } = this.props;
    const { formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'prsaInfomationPortal/getEditAddressBankInfoList',
      payload: {
        supplierId: formRecordId,
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
      location: { search },
    } = this.props;
    if(record?.id) {
      dispatch({
        type: 'prsaInfomationPortal/getEditBankInfoList',
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

  // 变更Id银行信息导出
  @Bind()
  handleEditExport() {
    const {
      dispatch,
      location: { search },
      } = this.props;
    const { formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'prsaInfomationPortal/bankInfoEditExport',
      payload: {
        supplierId: formRecordId,
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

  @Bind
  readyButton() {
    const { registerState, createdBy, caseId } = this.state;
    const { location: { search } } = this.props;
    const { isStart, activityCode } = queryString.parse(search.substring(1));
    if ((isStart === 'true' || isStart) || activityCode === 'ReviewNode') {
      ready({
        mode: 'iframe',
        tenant: 'CMI',
      }, (instance) => {
        //  调用iframeSdk为CMI定制API insertBtnForToolbar, 不设置id，默认为当前页面第一个iframe控件插入按钮
        instance.getCustomApi().insertBtnForToolbar({
          // 按钮插入位置
          position: 1,
          btns: [
            {
              // 按钮名称
              name: intl.get(`${prompt}.button.process.reject`).d('退回'),
              customEvents: [
                {
                  type: 'click',
                  func: () => {
                    // 业务逻辑
                    console.log('点击了退回按钮manager');
                    // this.backInfo();
                    this.setState({
                      backInfoFlag: true
                    })
                  }
                }
              ]
            }]
        });
      });
    }
  }

  @Bind()
  init() {
    // console.log('初始化；');
    const { dispatch } = this.props;
    const { registerState, createdBy } = this.state;
    // const userId = createdBy !== 'portal' ? createdBy : id; //和致远对接的时候，createBy肯定是id 不可能是字
    // console.log('userId', userId);
    dispatch({
      type: 'prsaInfomationPortal/initValueList',
    });
    this.bankQuery(createdBy);

  }


  // 致远流程
  @Bind()
  listener() {
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if (e.data.messageType === 'GET_FORM_DATA') {
        console.log('e.data.submitType', e.data.submitType);
        // 注销即退回按钮；
        if (['TERMINATION'].includes(e.data.submitType)) {
          this.backInfo()
          top?.postMessage({
            success: true, //表单数据验证成功或不需要验证时传true，否则传false
            submitType: e.data.submitType,//将此字段值回传
            messageType: 'GET_FORM_DATA', //获取表单数据消息
          }, e.data.url)
        } else if (['BACK'].includes(e.data.submitType)) {
          // 退回流程
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
        } else if (['SEND', 'SUBMIT', 'DRAFT_HANDLE'].includes(e.data.submitType)) {
          // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
          // 提交 SEND 保存 DRAFT_HANDLE 会签 GIVE  知会 NOTICE 查看流程 PROCESS_SHOW
          console.log(e.data.submitType, this.props.prsaInfomationPortal?.lineInfo?.applyStatus, 'return')
          if ((e.data.submitType == 'SEND' || e.data.submitType == 'SUBMIT' )&& this.props.prsaInfomationPortal?.lineInfo?.applyStatus === 'Return') {
            notification.error({
              description: intl
                .get(`${prompt}.button.return.valiadtip`)
                .d('该流程已被退回，请勿重复操作。')
            });
            return
          }
          this.saveInfo((params) => {
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
          }, e.data.url)
        }
      }
    })
  }


  // 查询财务审核财务信息变更单
  @Bind()
  async bankQuery(id) {
    const { dispatch, location: { search = ''} } = this.props;
    const { state } = queryString.parse(search.substring(1));
    dispatch({
      type: 'prsaInfomationPortal/queryBankInfo',
      payload: {
        id,
      },
    }).then((res) => {
      if (res) {
        const bankList = res.cmhkSupAccessBankEditList?.map((item) => {
          return {
            ...item,
            bankId: uuid(),
          };
        });
        const companyInfo = {
          ...res?.cmhkSupAccLineEdit,
          ...res?.cmhkSupAccessEditHead,
        };
        const lineInfo = {
          ...res?.cmhkSupAccessEditHead,
          ...res?.cmhkSupAccLineEdit
        };
        if (lineInfo?.applyStatus === 'Inapproval' && ['READY', 'PENDING'].includes(state)) this.readyButton()
        dispatch({
          type: 'prsaInfomationPortal/updateState',
          payload: {
            attachmentList: res?.cmhkSupAccessAttachEditList,
            bankList,
            lineInfo,
            companyInfo
          },
        });
      }
    });
  }

  // 保存
  @Bind()
  async saveInfo(callback) {
    console.log('callback', callback);
    const { dispatch, prsaInfomationPortal } = this.props;
    const { registerState, headId, createdBy } = this.state;
    const { language } = currentUser;
    console.log('language', language);
    console.log('registerState', registerState);
    const {
      bankList = [],
      attachmentList = [],
      lineInfo = {},
      companyInfo = {},
    } = prsaInfomationPortal;
    // 附件的文件到期日得调整一下；
    const newAttachmentList = attachmentList.map((item) => {
      return {
        ...item,
        expirationDateSt: item.expirationDate,
      };
    });
    console.log('companyInfo', companyInfo);
    if (typeof callback === 'function') {
      callback({ companyInfo, lineInfo, newAttachmentList, bankList, headId, userId: createdBy, affairTitle: `${intl.get('spfmhk.supplier.todotask.financeinfo.update').d('供应商银行信息更新:')}${language === 'zh_CN' ? companyInfo.companyNameCh : companyInfo.companyNameEn}`, });
    }
  }

  // 提交
  @Bind()
  submitInfo() {
    console.log("提交");
    // 传参和保存一样
  }

  // 退回
  @Bind()
  async backInfo() {
    const { dispatch, prsaInfomationPortal, } = this.props;
    const { realName, loginName } = currentUser;
    const { caseId, createdBy } = this.state;
    const {
      companyInfo = {},
      contactList = [],
      clientList = [],
      bankList = [],
      attachmentList = [],
      lineInfo = {},
    } = prsaInfomationPortal;
    const list = {uuid : uuid()}
    console.log(list , 'uuid')
    this.props.form.validateFields((err, value) => {
      if (!err) {
        dispatch({
          type: `prsaInfomationPortal/backInfoQuery`,
          payload: {
            createdBy: companyInfo?.createdBy,
            id: companyInfo?.id
          },
        }).then((res) => {
          if (res) {
            dispatch({
              type: `prsaInfomationPortal/backInfo`,
              payload: {
                tenantId: 0, // 租户id
                workQueueType: 'P', // 待办类型
                workQueueInstId: list.uuid, // 待办流程ID
                uniqueId: null, // 待办唯一ID
                categoryCode: 'ReturnofPortalSupbBank', // 待办分类标识
                categoryName: '银行信息变更申请退回', // 待办分类
                workQueueTitle: `银行信息变更退回`, // 待办标题
                requestBy: loginName, // 申请人
                requestDate: dayjs().format(DEFAULT_DATETIME_FORMAT), // 申请日期
                preExecutor: realName, // 前处理人
                executor: res?.loginName, // 处理人
                originExecutor: realName, // 原始处理人
                workQueueUrl: '/spfm/portal/enterprise/bankChange', // 待办URL
                // finishQueueUrl: '', // 已办URL
                sourceCode: 'supplier', // 来源标识
                sourceSystem: 'supplier', // 来源系统
                // objectVersionNumber: '',
                // creationDate: '',
                // createdBy: 2,
                // lastUpdatedBy: '',
                // attachmentDate: '',
              },
            }).then((res2) => {
              if (res2) {

                dispatch({
                  type: `prsaInfomationPortal/returnPortalChange`,
                  payload: {
                    returnRemark: value?.businessManRemark,
                    returnType: 'PORTAL_FINANCE_CHANGE',
                    workQueueInstId: list.uuid,
                    id: companyInfo?.id
                  },
                }).then(async () => {
                  notification.success({
                    message: intl.get('hzero.common.notification.success').d('操作成功'),
                  });

                  companyInfo.foundDate = companyInfo.foundDate ? dayjs(companyInfo.foundDate).format(getDateTimeFormat()) : null;
                  companyInfo.applyDate = companyInfo.applyDate ? dayjs(companyInfo.applyDate).format(getDateTimeFormat()) : null;
                  companyInfo.statusUpdateTime = companyInfo.statusUpdateTime ? dayjs(companyInfo.statusUpdateTime).format(getDateTimeFormat()) : null;
                  companyInfo.supplierAccessTime = companyInfo.supplierAccessTime ? dayjs(companyInfo.supplierAccessTime).format(getDateTimeFormat()) : null;
                  companyInfo.versionsUpdateTime = companyInfo.versionsUpdateTime ? dayjs(companyInfo.versionsUpdateTime).format(getDateTimeFormat()) : null;
                  companyInfo.subStatus = 'N';

                  // 附件的文件到期日得调整一下；
                  const newAttachmentList = attachmentList.map((item) => {
                    return {
                      ...item,
                      expirationDateSt: item.expirationDate,
                    };
                  });
                  // await dispatch({
                  //   type: `prsaInfomationPortal/submitBankInfo`,
                  //   payload: {
                  //     cmhkSupAccLineEdit: lineInfo,
                  //     cmhkSupAccessAttachEditList: newAttachmentList,
                  //     cmhkSupAccessCustEditList: clientList,
                  //     cmhkSupAccessCtsEditList: contactList,
                  //     cmhkSupAccessEditHead: companyInfo,
                  //     cmhkSupAccessBankEditList: bankList,
                  //     userId: companyInfo?.createdBy,
                  //     source: 'try',
                  //   },
                  // }).then(async () => {
                  //   this.bankQuery(createdBy);
                  // });
                  await dispatch({
                    type: `prsaInfomationPortal/finishedDone`,
                    payload: {
                      organizationId,
                      uuidValue: companyInfo?.appWorkQueueid,
                      change: 'change',
                    },
                  }).then(async () => {
                    // 12.24修改为companyInfo?.createdBy 为 createdBy 
                    window.parent?.postMessage(
                      {
                        messageType: 'CLOSE_WINDOW',
                      },
                      '*'
                    );
                    this.bankQuery(createdBy);
                  });

                })
              }
            })
          }
        });
      }

    });

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
      backInfoFlag,
      selectedRowKeysAddressBank,
      selectedRowKeysBank,
      isShowBankInfo = false,
    } = this.state;
    const { dispatch, form, prsaInfomationPortal, fetchListLoading = false, backLoading = false, queryBankInfoListLoading = false, bankInfoEditExportLoading = false, saveBankLoading = false, prompt } = this.props;
    const {
      lineInfo = {},
      bankList = [],
      attachmentList = [],
      fileCascader = [],
    } = prsaInfomationPortal;

    // 基础props
    const basicInfoFormProps = {
      registerState,
      data: lineInfo,
      loading: fetchListLoading,
      onRef: (node) => {
        this.basicInfoForm = node.props.form
      },
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
      loading: fetchListLoading,
      rowSelection: bankTablerowSelection,
      dispatch,
      bankList,
      form,
      // loading,
      onRef: () => { },
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
      loading: fetchListLoading,
      rowSelection: attachTablerowSelection,
      dispatch,
      attachmentList,
      form,
      fileCascader,
      comSource: 'bank',
      // loading,
      onRef: () => { },
    };

    const addressBankInfoColumnsRowSelection = {
      selectedRowKeysAddressBank,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeysAddressBank: keys,
          selectedRowsAddressBank: rows,
        });
      },
      getCheckboxProps: (record) => ({
        disabled: true
      })
    };

    const bankInfoColumnsRowSelection = {
      selectedRowKeysBank,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeysBank: keys,
          selectedRowsBank: rows,
        });
      },
      getCheckboxProps: (record) => ({
        disabled: true
      })
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
      <PageWrapper loading={backLoading}>
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
                title={intl.get(`${prompt}.view.title.basicInfo`).d('基础信息')}
                arrowActive={activeKey.includes('basicInfo')}
              />
            }
            key="basicInfo"
          >
            <BasicInfoForm {...basicInfoFormProps} />
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
                      onClick={this.handleEditExport}
                      loading={bankInfoEditExportLoading}
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
                title={intl.get(`${prompt}.view.title.bank.attachment`).d('银行附件')}
                arrowActive={activeKey.includes('attachment')}
              />
            }
            key="attachment"
          >
            {/* <p>{intl.get(`${prompt}.view.title.attachment3.tips`).d('请上传基本资质的三项必要文件')}</p> */}
            {/* {!disabled && <div className="table-operator">
              <CusButton onClick={this.delAttachSource}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>
              <CusButton>{intl.get('hzero.common.button.edit').d('编辑')}</CusButton>
              <CusButton onClick={this.addAttachSource} type="primary">{intl.get('hzero.common.button.add').d('新增')}</CusButton>
            </div>} */}
            <AttachmentTable {...attachmentProps} />
          </Panel>
        </Collapse>
        <CusModal
          title={intl.get(`spfmhk.supplier.field.returnremark`).d('退回商户')}
          width={800}
          visible={backInfoFlag}
          destroyOnClose
          onCancel={() => {
            this.setState({
              backInfoFlag: false,
            })
          }}
          onOk={() => { this.backInfo() }}
        // confirmLoading={confirmLoading}

        >
          <div className="customize-form" style={{ paddingLeft: '16px' }}>
            <Form ref={this.form} >
              <Form.Item
              // label={intl.get(`spfmhk.supplier.field.returnremark`).d('退回商户')}
              >
                {this.props.form.getFieldDecorator('businessManRemark', {
                  rules: [
                    {
                      required: backInfoFlag,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`spfmhk.supplier.field.returnremark`).d('退回商户'),
                      }),
                    },
                  ],
                })(
                  <CusInput.TextArea
                    rows={7}
                    autoSize={{ minRows: 7, maxRows: 7 }}
                    maxLength={2000}
                    showCharacter
                  />
                )}
              </Form.Item>
            </Form>
          </div>
        </CusModal>
        {/* <div>
          {(registerState !== 'basicUpdate' ||
            registerState !== 'bankUpdate') &&
            <CusButton type="primary" onClick={() => { this.saveInfo('审批中') }} >{intl.get('hzero.common.button.save').d('保存')}</CusButton>}
          <CusButton type="primary" onClick={() => { registerState === 'recheck' ? this.saveInfo('审批中') : this.saveInfo('已审批') }} >{intl.get('hzero.common.button.submit').d('提交')}</CusButton>
        </div> */}
      </PageWrapper >
    )
  }
}
