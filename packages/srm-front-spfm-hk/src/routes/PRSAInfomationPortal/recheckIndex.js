/**
 * 采购复核供应商准入信息（门户）
 * @Author: huasheng.fang@hand-china.com
 * @Date: 2023/9/20
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import { Collapse, Row, Col } from 'antd';
import { connect } from 'dva';
import uuid from 'uuid/v4';
const { Panel } = Collapse;
import dayjs from 'dayjs';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { Form } from 'hzero-ui';
import { getCurrentUser, getCurrentOrganizationId, getDateTimeFormat, getCurrentLanguage, getEditTableData } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import CompanyInfoForm from './components/CompanyInfoForm';
import ContactTable from './components/ContactTable';
import ClientTable from './components/ClientTable';
import BankTable from './components/BankTable';
import AttachmentTable from './components/AttachmentTable';
import CusButton from '_cus_components/CusButton';
import queryString from 'querystring';
import { ready } from '@/plugin/udc-sdk-esm';
import CusNotification from '_cus_components/CusNotification';
import CusInput from '_cus_components/CusInput';
import CusModal from '_cus_components/CusModal';
import CusSpin from '_cus_components/CusSpin';
import AddressBankInfoList from './AddressBankInfoList';
import BankInfoList from './BankInfoList';

const prompt = 'spfmhk.supplier';
const organizationId = getCurrentOrganizationId();
const currentUser = getCurrentUser();
@formatterCollections({ code: [prompt, 'HKPC.commom'] })
@connect(({ loading, prsaInfomationPortal }) => ({
  prsaInfomationPortal,
  fetchListLoading: loading.effects['prsaInfomationPortal/queryInfo'],
  backLoading: loading.effects[`prsaInfomationPortal/returnPortal`] ||
    loading.effects[`prsaInfomationPortal/backInfoQuery`] ||
    loading.effects[`prsaInfomationPortal/backInfo`] ||
    loading.effects[`prsaInfomationPortal/backSendEmail`] ||
    loading.effects[`prsaInfomationPortal/saveInfo`],
  queryBankInfoListLoading: loading.effects['prsaInfomationPortal/getBankInfoList'],
  saveBankLoading: loading.effects['prsaInfomationPortal/saveBankInfoList'],
  bankInfoExportLoading: loading.effects['prsaInfomationPortal/bankInfoExport'],
}))

@Form.create()
export default class PurchasingManager extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search = '', pathname },
    } = props;
    const registerState = pathname.substring(pathname.lastIndexOf('/') + 1);
    const { createdBy, formRecordId, caseId, activityCode } = queryString.parse(search.substr(1)) || {};
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
      // activityCode: null,
      state: null,
      lineId: null,
      delContact: [],
      delClient: [],
      delBank: [],
      delAttach: [],
      backInfoFlag: false,
      activityCode,
      selectedRowKeysAddressBank: [],
      selectedRowsAddressBank: [],
      selectedRowKeysBank: [],
      selectedRowsBank: [],
    }
  }

  componentDidMount() {
    const { registerState, createdBy, caseId, activityCode } = this.state;
    this.init();
    this.listener();
    // if (!caseId) {
    //   ready({
    //     mode: 'iframe',
    //     tenant: 'CMI',
    //   }, (instance) => {
    //     //  调用iframeSdk为CMI定制API insertBtnForToolbar, 不设置id，默认为当前页面第一个iframe控件插入按钮
    //     instance.getCustomApi().insertBtnForToolbar({
    //       // 按钮插入位置
    //       position: 1,
    //       btns: [
    //         {
    //           // 按钮名称
    //           name: intl.get(`hzero.common.view.button.save`).d('保存'),
    //           customEvents: [
    //             {
    //               type: 'click',
    //               func: () => {
    //                 // 业务逻辑
    //                 console.log('点击了保存按钮');
    //                 this.saveInfo();
    //               }
    //             }
    //           ]
    //         },
    //         {
    //           // 按钮名称
    //           name: intl.get(`${prompt}.button.process.reject`).d('退回'),
    //           customEvents: [
    //             {
    //               type: 'click',
    //               func: () => {
    //                 // 业务逻辑
    //                 console.log('点击了退回按钮');
    //                 this.backInfo();
    //               }
    //             }
    //           ]
    //         }]
    //     });
    //   });
    // }
    // if ((activityCode === 'Start') && caseId) {
    //   ready({
    //     mode: 'iframe',
    //     tenant: 'CMI',
    //   }, (instance) => {
    //     //  调用iframeSdk为CMI定制API insertBtnForToolbar, 不设置id，默认为当前页面第一个iframe控件插入按钮
    //     instance.getCustomApi().insertBtnForToolbar({
    //       // 按钮插入位置
    //       position: 1,
    //       btns: [
    //         {
    //           // 按钮名称
    //           name: intl.get(`${prompt}.button.process.reject`).d('退回'),
    //           customEvents: [
    //             {
    //               type: 'click',
    //               func: () => {
    //                 // 业务逻辑
    //                 console.log('点击了退回按钮manager');
    //                 // this.backInfo();
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

  @Bind
  readyButton() {
    const { registerState, createdBy, caseId, activityCode } = this.state;
    if ((activityCode === 'Start' || activityCode === 'ReviewNode') && caseId) {
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
    const { dispatch, location: { search = '', pathname } } = this.props;
    const { activityCode, state } = queryString.parse(search.substring(1));
    const { registerState, createdBy } = this.state;
    // const userId = createdBy !== 'portal' ? createdBy : id; //和致远对接的时候，createBy肯定是id 不可能是字
    // console.log('userId', userId);
    dispatch({
      type: 'prsaInfomationPortal/initValueList',
    });
    this.query(createdBy);
    this.setState({
      activityCode,
      state
    })
  }


  // 致远流程
  @Bind()
  listener() {
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 注销即退回按钮；
        if (['TERMINATION'].includes(e.data.submitType)) {
          this.backInfo()
          top?.postMessage({
            success: true, //表单数据验证成功或不需要验证时传true，否则传false
            submitType: e.data.submitType,//将此字段值回传
            messageType: 'GET_FORM_DATA', //获取表单数据消息
          }, e.data.url)
        } else if (['SEND', 'SUBMIT', 'DRAFT_HANDLE'].includes(e.data.submitType)) {
          // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
          // 提交 SEND 保存 DRAFT_HANDLE 会签 GIVE  知会 NOTICE 查看流程 PROCESS_SHOW
          this.saveInfo((params) => {
            console.log('params', params);
            if (params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                actionInfo: {
                  preventClose: e.data.submitType === 'DRAFT_HANDLE' // 阻止页面关闭
                },
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

  // 查询
  @Bind()
  async query(userId) {
    const { dispatch, location: { search = ''} } = this.props;
    const { state } = queryString.parse(search.substring(1));
    dispatch({
      type: 'prsaInfomationPortal/queryInfo',
      payload: {
        userId,
        language: getCurrentLanguage(),
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
        }
        this.setState({
          headId: res?.supAccessTryHeads?.id,
          lineId: res?.cmhkSupAccessTryLine.id
        })
        if (res?.supAccessTryHeads?.supModifyState === 'Inapproval' && ['READY', 'PENDING'].includes(state)) this.readyButton()
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
        // const bankList = res.supplierAccessTryBankList?.map((item) => {
        //   return {
        //     ...item,
        //     bankId: uuid(),
        //   };
        // });
        dispatch({
          type: 'prsaInfomationPortal/updateState',
          payload: {
            companyInfo,
            contactList,
            clientList,
            bankList: [],
            attachmentList: res?.supAccessTryAttachList,
            lineInfo,
          },
        });
        // 获取银行地址信息
        this.handleAddressBankInfoList();
      }
    });
  }

  // 保存银行信息
  @Bind()
  saveBankInfoList(callback) {
    const { dispatch, prsaInfomationPortal } = this.props;
    const {
      addressBankInfoDataSource = [],
      bankInfoListDataSource = []
    } = prsaInfomationPortal;
    if(addressBankInfoDataSource?.length === 0) {
      CusNotification.error({
        message: intl.get(`${prompt}.field.bank.maintain.placeHolder`).d('至少维护一条银行信息')
      });
      return false;
    }
    if(addressBankInfoDataSource?.length > 0 && addressBankInfoDataSource.every(i => i.isMainAddress === 'N')) {
      CusNotification.error({
        message: intl.get(`${prompt}.form.validateFields.mainaddress.default`).d('至少需要维护一个默认主地址')
      });
      return false;
    }
    if(bankInfoListDataSource?.length > 0 && bankInfoListDataSource.every(i => i.isMain === 'N')) {
      CusNotification.error({
        message: intl.get(`${prompt}.tip.mainaccount`).d('至少需要维护一个主账号')
      });
      return false;
    }
    const addressBankValidateData = getEditTableData(addressBankInfoDataSource, ['rowKey']);
    const bankValidateData = getEditTableData(bankInfoListDataSource, ['rowKey']);
    // 判断地址行所有对象的 isMainAddress 是否都等于 "N"
    const allMainAddressN = addressBankValidateData.every(item => item.isMainAddress === "N");
    const newBankOrAddressInfoList = addressBankValidateData?.map((item) => ({
      ...item,
      isMainAddress: (allMainAddressN && item.isMainAddressFlagY === "Y") || item.isMainAddress === 1 ? "Y" : item.isMainAddress,
      bankLine: bankValidateData?.filter((bankItem) => (bankItem.bindBankId === item.rowKey) || (bankItem.refHeadId === item.id))
      .map((deitem) => ({
        ...deitem,
        isMain: deitem?.isMain === 1 || deitem?.isMain === 'Y' ? 'Y' : deitem.isMain,
      }))
    }))
    debugger
    if((newBankOrAddressInfoList.length > 0 && bankValidateData.length > 0) || (newBankOrAddressInfoList.length > 0 && bankInfoListDataSource.length === 0)) {
      console.log('addressBankValidateData', addressBankValidateData);
      console.log('bankValidateData', bankValidateData);
      console.log('newBankOrAddressInfoList', newBankOrAddressInfoList);
      dispatch({
        type: 'prsaInfomationPortal/saveBankInfoList',
        payload: newBankOrAddressInfoList
      }).then((res) => {
        if(res) {
          if (typeof callback === 'function') {
            callback(res);
          }
          this.setState({
            isShowBankInfo: false,
          }, () => {
            dispatch({
              type: 'prsaInfomationPortal/updateState',
              payload: {
                bankInfoListDataSource: [],
              }
            })
            this.handleAddressBankInfoList();
          })
        }
      })
    }
  }

  // 保存
  @Bind()
  async saveInfo(callback) {
    const { dispatch, prsaInfomationPortal } = this.props;
    const { registerState, headId, createdBy, lineId, delAttach, delBank, delClient, delContact } = this.state;
    const { language } = currentUser;
    const {
      companyInfo = {},
      contactList = [],
      clientList = [],
      // bankList = [],
      attachmentList = [],
      lineInfo = {},
    } = prsaInfomationPortal;

    const list = attachmentList.filter(item => !item.attachmentDate);
    const checkList = attachmentList.filter(i => i.isDel !== '1')
    if (list.length > 0 || checkList < 4) {
      if (typeof callback === 'function') callback(false)
      CusNotification.error({
        message: intl.get('spfmhk.supplier.button.save.attachverify').d('填写附件'),
      });
      return
    }

    const checkUndefinedField = attachmentList.some(item => item.type === undefined);
    if(checkUndefinedField) {
      return CusNotification.error({
        message: intl.get(`${prompt}.field.attachtype.verfy`).d('请补全公司附件中的附件类型'),
      })
    }

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
    const newLineInfo = { ...lineInfo, ...newCompanyInfo, id: lineId };
    this.companyForm.validateFieldsAndScroll(async (err) => {
      if (!err) {
        await dispatch({
          type: `prsaInfomationPortal/saveInfo`,
          payload: {
            supAccessTryAttachList: [...newAttachmentList, ...delAttach],
            supAccessTryContactsList: [...contactList, ...delContact],
            supAccessTryCustomerList: [...clientList, ...delClient],
            supAccessTryHeads: newCompanyInfo,
            // supplierAccessTryBankList: [...bankList, ...delBank],
            cmhkSupAccessTryLine: newLineInfo,
            userId: createdBy,
            source: 'try',
          },
        }).then(async (res) => {
          if (res) {
            this.saveBankInfoList((bankInfoRes) => {
              if(bankInfoRes) {
                CusNotification.success({
                  message: intl.get(`HKPC.commom.view.message.savesuccessfully`).d('保存成功'),
                })
                this.query(createdBy);
                this.setState({
                  delClient: [],
                  delContact: [],
                  delAttach: [],
                  delBank: []
                })
                if (typeof callback === 'function') {
                  callback(
                    {
                      newLineInfo,
                      newAttachmentList: newAttachmentList,
                      contactList: contactList,
                      clientList: clientList,
                      newCompanyInfo,
                      // bankList: bankList,
                      headId,
                      affairTitle: `${intl.get('spfmhk.supplier.todotask.portalsupplier.access').d('门户供应商准入：')}${language === 'zh_CN' ? newCompanyInfo.companyNameCh : newCompanyInfo.companyNameEn}`,
                      userId: createdBy,
                    }
                  );
                }
              }
            })
          }
        });
      }
    })
  }

  // 提交
  @Bind()
  submitInfo() {
    console.log("提交");
    // 传参和保存一样
  }
  // 退回
  @Bind()
  backInfo() {
    const { dispatch, prsaInfomationPortal, } = this.props;
    const { headId, caseId } = this.state;
    const { realName, language, loginName } = currentUser;
    const {
      companyInfo = {},
      contactList = [],
      clientList = [],
      bankList = [],
      attachmentList = [],
      lineInfo = {},
    } = prsaInfomationPortal;
    // dispatch({
    //   type: `prsaInfomationPortal/backInfoQuery`,
    //   payload: {
    //     createdBy: companyInfo?.createdBy,
    //     id: companyInfo?.id
    //   },
    // }).then((res) => {
    //   if (res) {
    //     dispatch({
    //       type: `prsaInfomationPortal/backInfo`,
    //       payload: {
    //         tenantId: 0, // 租户id
    //         workQueueType: 'P', // 待办类型
    //         workQueueInstId: uuid(), // 待办流程ID
    //         uniqueId: null, // 待办唯一ID
    //         categoryCode: 'ReturnofPortalSup', // 待办分类标识
    //         categoryName: '企业注册申请退回', // 待办分类
    //         workQueueTitle: `供应商门户准入退回`, // 待办标题
    //         requestBy: loginName, // 申请人 ——供应商
    //         preExecutor: realName, // 前处理人——采购员
    //         executor: res?.loginName, // 处理人
    //         originExecutor: realName, // 原始处理人
    //         requestDate: dayjs().format(DEFAULT_DATETIME_FORMAT), // 申请日期
    //         workQueueUrl: '/spfm/portal/enterprise/register/register', // 待办URL
    //         // finishQueueUrl: '', // 已办URL
    //         sourceCode: 'supplier', // 来源标识
    //         sourceSystem: 'supplier', // 来源系统
    //         // objectVersionNumber: '',
    //         // creationDate: '',
    //         // createdBy: 2,
    //         // lastUpdatedBy: '',
    //         // attachmentDate: '',
    //       },
    //     }).then((res2) => {
    //       if (res2) {
    //         notification.success({
    //           message: intl.get('hzero.common.notification.success').d('操作成功'),
    //         });
    //         dispatch({
    //           type: `prsaInfomationPortal/backSendEmail`,
    //           payload: {
    //             invitedCompanyId: companyInfo?.id,
    //             invitedCompanyUserId: companyInfo?.createdBy,
    //             // invitedCompany:'',
    //             // invitedEmail:'',
    //             // tenantId:'',
    //           },
    //         }).then((res3) => {
    //           if (res3) {
    //             // if (!caseId) {
    //               //关闭页面

    //             // }
    //           }
    //         });
    //       }
    //     });
    //   }
    // });
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
    dispatch({
      type: `prsaInfomationPortal/saveInfo`,
      payload: {
        supAccessTryAttachList: newAttachmentList,
        supAccessTryContactsList: contactList,
        supAccessTryCustomerList: clientList,
        supAccessTryHeads: companyInfo,
        supplierAccessTryBankList: bankList,
        cmhkSupAccessTryLine: lineInfo,
        userId: companyInfo?.createdBy,
        source: 'try',
      },
    }).then(async (res) => {
      if (res) {
        await this.query(companyInfo?.createdBy);
        this.returnPortal()
      }

    });
    dispatch({
      type: `prsaInfomationPortal/finishedDone`,
      payload: {
        organizationId,
        uuidValue: companyInfo?.appWorkQueueid,
        change: 'change',
      },
    }).then(async () => {
      this.query(companyInfo?.createdBy);
    });
  }

  // 退回
  @Bind()
  returnPortal() {
    const { dispatch, prsaInfomationPortal, } = this.props;
    const { realName, language, loginName } = currentUser;
    const {
      companyInfo = {},
    } = prsaInfomationPortal;
    this.props.form.validateFields((err, value) => {
      console.log(value?.businessManRemark, '1111')
      if (!err) {
        dispatch({
          type: `prsaInfomationPortal/returnPortal`,
          payload: {
            returnRemark: value?.businessManRemark,
            id: companyInfo?.id
          },
        }).then(() => {
          dispatch({
            type: `prsaInfomationPortal/backInfoQuery`,
            payload: {
              createdBy: companyInfo?.createdBy,
              id: companyInfo?.id
            },
          }).then((backInfoQueryRes) => {
            if (backInfoQueryRes) {
              dispatch({
                type: `prsaInfomationPortal/backInfo`,
                payload: {
                  tenantId: 0, // 租户id
                  workQueueType: 'P', // 待办类型
                  workQueueInstId: uuid(), // 待办流程ID
                  uniqueId: null, // 待办唯一ID
                  categoryCode: 'ReturnofPortalSup', // 待办分类标识
                  categoryName: '企业注册申请退回', // 待办分类
                  workQueueTitle: `供应商门户准入退回`, // 待办标题
                  requestBy: loginName, // 申请人 ——供应商
                  preExecutor: realName, // 前处理人——采购员
                  executor: backInfoQueryRes?.loginName, // 处理人
                  originExecutor: realName, // 原始处理人
                  requestDate: dayjs().format(DEFAULT_DATETIME_FORMAT), // 申请日期
                  workQueueUrl: '/spfm/portal/enterprise/register/register', // 待办URL
                  // finishQueueUrl: '', // 已办URL
                  sourceCode: 'supplier', // 来源标识
                  sourceSystem: 'supplier', // 来源系统
                  // objectVersionNumber: '',
                  // creationDate: '',
                  // createdBy: 2,
                  // lastUpdatedBy: '',
                  // attachmentDate: '',
                },
              }).then((backInfoRes) => {
                if (backInfoRes) {
                  CusNotification.success({
                    message: intl.get('hzero.common.notification.success').d('操作成功'),
                  });
                  dispatch({
                    type: `prsaInfomationPortal/backSendEmail`,
                    payload: {
                      invitedCompanyId: companyInfo?.id,
                      invitedCompanyUserId: companyInfo?.createdBy,
                      // invitedCompany:'',
                      // invitedEmail:'',
                      // tenantId:'',
                    },
                  }).then((backSendEmailRes) => {
                    if (backSendEmailRes) {
                      // 通知致远关闭窗口
                      window.parent?.postMessage(
                        {
                          messageType: 'CLOSE_WINDOW',
                        },
                        '*'
                      );
                      // if (!caseId) {
                      //关闭页面

                      // }
                    }
                  });
                }
              });
            }
          });
        });
      }
      console.log(value, err)
    }
    )

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
    const { contactSelectRows, delContact } = this.state;
    const { contactList = [] } = prsaInfomationPortal;
    // clientInfoTableDataSource.filter(r => clientInfoSelectRows.every(rd => rd.id !== r.id)),
    // let newContactList = [];
    let newContactList = contactList.filter(r => contactSelectRows.every(rd => rd.contactId !== r.contactId));
    let newDelContact = contactSelectRows.filter(r => r.id).map(item => {
      return {
        ...item,
        isDel: '1'
      }
    })
    // contactList.map(item => {
    //   contactSelectRows.map(i => {
    //     if (item.contactId === i.contactId) {
    //       if (item.id) {
    //         item.isDel = '1';
    //         newContactList.push(item);
    //       }
    //     } else {
    //       newContactList.push(item);
    //     }
    //   });
    // });
    dispatch({
      type: 'prsaInfomationPortal/updateState',
      payload: {
        contactList: newContactList,
      },
    });
    this.setState({
      contactSelectRowKeys: [],
      contactSelectRows: [],
      delContact: [
        ...delContact,
        ...newDelContact
      ]
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
    const { clientSelectRows, delClient } = this.state;
    const { clientList = [] } = prsaInfomationPortal;
    let newclientList = clientList.filter(r => clientSelectRows.every(rd => rd.clientId !== r.clientId));
    let newDelClient = clientSelectRows.filter(r => r.id).map(item => {
      return {
        ...item,
        isDel: '1'
      }
    })
    // let newclientList = [];
    // clientList.map(item => {
    //   clientSelectRows.map(i => {
    //     if (item.clientId === i.clientId) {
    //       if (item.id) {
    //         item.isDel = '1';
    //         newclientList.push(item);
    //       }
    //     } else {
    //       newclientList.push(item);
    //     }
    //   });
    // });
    dispatch({
      type: 'prsaInfomationPortal/updateState',
      payload: {
        clientList: newclientList,
      },
    });
    this.setState({
      clientSelectRowKeys: [],
      clientSelectRows: [],
      delClient: [
        ...delClient,
        ...newDelClient
      ]
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
    const { bankSelectRows, delBank } = this.state;
    const { bankList = [] } = prsaInfomationPortal;
    let newbankList = bankList.filter(r => bankSelectRows.every(rd => rd.bankId !== r.bankId));
    let newBelBank = bankSelectRows.filter(r => r.id).map(item => {
      return {
        ...item,
        isDel: '1'
      }
    })
    // let newbankList = [];
    // bankList.map(item => {
    //   bankSelectRows.map(i => {
    //     if (item.bankId === i.bankId) {
    //       if (item.id) {
    //         item.isDel = '1';
    //         newbankList.push(item);
    //       }
    //     } else {
    //       newbankList.push(item);
    //     }
    //   });
    // });
    dispatch({
      type: 'prsaInfomationPortal/updateState',
      payload: {
        bankList: newbankList,
      },
    });
    this.setState({
      bankSelectRowKeys: [],
      bankSelectRows: [],
      delBank: [
        ...delBank,
        ...newBelBank,
      ]
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
    const { attachSelectRows, delAttach } = this.state;
    const { attachmentList = [] } = prsaInfomationPortal;
    let newattachmentList = attachmentList.filter(r => attachSelectRows.every(rd => rd.attachmentUuid !== r.attachmentUuid));
    let newDelAttach = attachSelectRows.filter(r => r.id).map(item => {
      return {
        ...item,
        isDel: '1'
      }
    })
    // let newattachmentList = [];
    // attachmentList.map(item => {
    //   attachSelectRows.map(i => {
    //     if (item.attachmentUuid === i.attachmentUuid) {
    //       if (item.id) {
    //         item.isDel = '1';
    //         newattachmentList.push(item);
    //       }
    //     } else {
    //       newattachmentList.push(item);
    //     }
    //   });
    // });
    dispatch({
      type: 'prsaInfomationPortal/updateState',
      payload: {
        attachmentList: newattachmentList,
      },
    });
    this.setState({
      attachSelectRowKeys: [],
      attachSelectRows: [],
      delAttach: [
        ...delAttach,
        ...newDelAttach,
      ]
    });
  }

  // 删除银行地址信息
  handleDelAddressBankData = () => {
    const { dispatch, prsaInfomationPortal } = this.props;
    const { addressBankInfoDataSource = [] } = prsaInfomationPortal;
    const { selectedRowKeysAddressBank, selectedRowsAddressBank } = this.state;
    if(selectedRowKeysAddressBank.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        const deleteData = addressBankInfoDataSource.filter(
          (item) => selectedRowKeysAddressBank.includes(item['rowKey']) && item._status !== 'create'
        );
        if (deleteData.length > 0) {
          // 后台删除
          dispatch({
            type: 'prsaInfomationPortal/deleteAddressBankInfoLine',
            payload: deleteData.map((item) => String(item.id))
          }).then((res) => {
            if(res) {
              CusNotification.success({
                message: intl.get('hzero.common.notification.success.delete').d('删除成功')
              })
              this.handleAddressBankInfoList();
            }
          })
        } else {
          // 本地删除
          const newDataSource = addressBankInfoDataSource.filter((item) => !selectedRowKeysAddressBank.includes(item['rowKey']));
          dispatch({
            type: 'prsaInfomationPortal/updateState',
            payload: {
              addressBankInfoDataSource: newDataSource,
            },
          });
          this.setState({
            selectedRowKeysAddressBank: [],
            selectedRowsAddressBank: [],
          })
        }
      })
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    }
  }

  // 新增银行地址信息
  handleAddAddressBankData = () => {
    const { prsaInfomationPortal, dispatch } = this.props;
    console.log('this.props', this.props);
    
    const {
      companyInfo = {},
      addressBankInfoDataSource = [],
    } = prsaInfomationPortal;

    // 判断是否已有主地址
    const hasMainAddress = addressBankInfoDataSource.some(item => item.isMainAddress === 'Y');
    const newIsMainAddress = hasMainAddress ? 'N' : 'Y';

    const newDataSource = [
      ...addressBankInfoDataSource,
      {
        payerAddress: companyInfo.addressEn, // 默认公司地址英文
        payerAccountName: companyInfo.companyNameEn, // 默认公司名称英文
        isMainAddress: newIsMainAddress, // 默认主地址
        addressStatus: 'Y', // 默认生效
        isMainAddressFlagY: 'N', // 保存时用来判断的主地址
        _status: 'create',
        rowKey: uuid(),
        refSupId: companyInfo.refHeadId, // 供应商Id
      }
    ];

    dispatch({
      type: 'prsaInfomationPortal/updateState',
      payload: {
        addressBankInfoDataSource: newDataSource,
      },
    })
  }

  // 删除银行明细信息
  handleDelBankData = () => {
    const { dispatch, prsaInfomationPortal } = this.props;
    const { bankInfoListDataSource = [] } = prsaInfomationPortal;
    const { selectedRowKeysBank, selectedRowsBank } = this.state;
    if(selectedRowKeysBank.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        const deleteData = bankInfoListDataSource.filter(
          (item) => selectedRowKeysBank.includes(item['rowKey']) && item._status !== 'create'
        );
        if (deleteData.length > 0) {
          // 后台删除
          dispatch({
            type: 'prsaInfomationPortal/deleteBankInfoLine',
            payload: deleteData.map((item) => String(item.id))
          }).then((res) => {
            if(res) {
              CusNotification.success({
                message: intl.get('hzero.common.notification.success.delete').d('删除成功')
              })
              const newDataSource = bankInfoListDataSource.filter((item) => !selectedRowKeysBank.includes(item['rowKey']));
              dispatch({
                type: 'prsaInfomationPortal/updateState',
                payload: {
                  bankInfoListDataSource: newDataSource,
                },
              });
              this.setState({
                selectedRowKeysBank: [],
                selectedRowsBank: [],
              })
            }
          })
        } else {
          // 本地删除
          const newDataSource = bankInfoListDataSource.filter((item) => !selectedRowKeysBank.includes(item['rowKey']));
          dispatch({
            type: 'prsaInfomationPortal/updateState',
            payload: {
              bankInfoListDataSource: newDataSource,
            },
          });
          this.setState({
            selectedRowKeysBank: [],
            selectedRowsBank: [],
          })
        }
      })
    } else {
      CusNotification.error({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
    }
  }

  // 新增银行明细信息
  handleAddBankData = () => {
    const { prsaInfomationPortal, dispatch } = this.props;

    const { addressBankRecord = {} } = this.state;

    console.log('this.props', this.props);
    
    const {
      companyInfo = {},
      bankInfoListDataSource = [],
    } = prsaInfomationPortal;

    // 将所有现有账号的 isMain 设为 N
    const updatedDataSource = bankInfoListDataSource.map(item => ({ ...item, isMain: 'N', bankStatus: 'N' }));

    const newDataSource = [
      ...updatedDataSource.map((item) => ({
        ...item,
        bindBankId: addressBankRecord.rowKey,
      })),
      {
        accountName: companyInfo.companyNameEn, // 默认公司名称英文
        isMain: 'Y', // 默认主账号
        bankStatus: 'Y', // 默认生效
        _status: 'create',
        rowKey: uuid(),
        bindBankId: addressBankRecord.rowKey,
        refHeadId: addressBankRecord.id,
      }
    ];

    dispatch({
      type: 'prsaInfomationPortal/updateState',
      payload: {
        bankInfoListDataSource: newDataSource,
      },
    })
  }

  render() {
    const { 
      activeKey,
      registerState,
      activityCode,
      state,
      backInfoFlag,
      selectedRowKeysAddressBank,
      selectedRowKeysBank,
      isShowBankInfo = false,
    } = this.state;
    const {
      dispatch,
      form,
      prsaInfomationPortal,
      fetchListLoading = false,
      backLoading = false,
      saveBankLoading = false,
      queryBankInfoListLoading = false,
      bankInfoExportLoading = false,
    } = this.props;
    const {
      lineInfo = {},
      companyInfo = {},
      contactList = [],
      clientList = [],
      bankList = [],
      attachmentList = [],
      fileCascader = [],
    } = prsaInfomationPortal;

    // const disabled = registerState === 'manager' ? true : false;
    const disabled = activityCode !== undefined && !['READY', 'PENDING'].includes(state) || companyInfo.supModifyState === 'Return';
    // const disabled = activityCode === undefined && state === undefined;
    // const gridSpan = getLFormGridSpan();
    console.log(activityCode !== undefined && !['READY', 'PENDING'].includes(state), companyInfo.supModifyState === 'Return', 'disabled')
    // 基本信息props
    const companyInfoFormProps = {
      dispatch,
      registerState,
      data: companyInfo,
      loading: fetchListLoading,
      onRef: (node) => {
        this.companyForm = node.props.form
      },
      disabledFlag: disabled
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
        disabled, // 选择框的是否可选
      }),
    };
    // 联系信息 props
    const contactTableProps = {
      registerState,
      loading: fetchListLoading,
      rowSelection: contactTablerowSelection,
      dispatch,
      contactList,
      form,
      // loading,
      onRef: () => { },
      disabled
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
        disabled, // 选择框的是否可选
      }),
    };
    // 客户信息 props
    const clientTableProps = {
      registerState,
      loading: fetchListLoading,
      rowSelection: clientTablerowSelection,
      dispatch,
      clientList,
      form,
      // loading,
      onRef: () => { },
      disabled
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
        disabled, // 选择框的是否可选
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
      disabled
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
        disabled, // 选择框的是否可选
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
      comSource: registerState === 'bankUpdate' ? 'bank' : 'company',
      // loading,
      onRef: () => { },
      disabled
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
        disabled,
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
        disabled,
      }),
    };

    const addressBankInfoProps = {
      ...this.props,
      addressBankInfoColumnsRowSelection,
      handleBankInfoList: this.handleBankInfoList,
      disabled,
    }

    const bankInfoProps = {
      ...this.props,
      bankInfoColumnsRowSelection,
      disabled,
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
                buttons={
                  <>
                    {!disabled && <div>
                      <CusButton mini onClick={this.delContactSource}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>
                      <CusButton mini onClick={this.addContactSource} type="primary">{intl.get('hzero.common.button.add').d('新增')}</CusButton>
                    </div>}
                  </>
                }
              />
            }
            key="contact"
          >
            <ContactTable {...contactTableProps} />
          </Panel>
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.client.information`).d('客户信息')}
                arrowActive={activeKey.includes('client')}
                buttons={
                  <>
                    {!disabled && <div>
                      <CusButton mini onClick={this.delClientSource}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>
                      <CusButton mini onClick={this.addClientSource} type="primary">{intl.get('hzero.common.button.add').d('新增')}</CusButton>
                    </div>}
                  </>
                }
              />
            }
            key="client"
          >
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
            key='bank'
          >
            {!disabled && <div className="table-operator">
              <CusButton mini onClick={this.addBankSource} type="primary">{intl.get('hzero.common.button.add').d('新增')}</CusButton>
              <CusButton mini onClick={this.delBankSource}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>
            </div>}
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
                    {!disabled && <div>
                      <CusButton
                      mini
                      onClick={this.handleDelAddressBankData}
                      >
                        {intl.get('hzero.common.button.delete').d('删除')}
                      </CusButton>
                      <CusButton
                        mini
                        type='primary'
                        onClick={this.handleAddAddressBankData}
                      >
                        {intl.get('hzero.common.button.add').d('新增')}
                      </CusButton>
                    </div>}
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
                  {!disabled && <p>{intl.get(`${prompt}.view.title.bank.info.label`).d('提示: 若开户银行选不到，可暂默认选择“Dummy”。')}</p>}
                  {!disabled && <div style={{ marginRight: '32px'}}>
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
                    {!disabled && <div>
                      <CusButton mini onClick={this.delAttachSource}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>
                      <CusButton mini onClick={this.addAttachSource} type="primary">{intl.get('hzero.common.button.add').d('新增')}</CusButton>
                    </div>}
                  </>
                }
              />
            }
            key="attachment"
          >
            <AttachmentTable {...attachmentProps} />
          </Panel>
        </Collapse>
        {<CusModal
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
        }
        {/* <div>
          <CusButton type="primary" onClick={() => { this.saveInfo() }} >{intl.get('hzero.common.button.save').d('保存')}</CusButton>
        </div> */}
        {/* <div>
          <CusButton type="primary" onClick={() => { this.setState({
                      backInfoFlag: true
                    }) }} >{intl.get('hzero.common.button').d('退回')}</CusButton>
        </div> */}
      </PageWrapper>
    )
  }
}
