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
import CusLov from '_cus_components/CusLov';
import notification from '_cus_components/CusNotification';
import { getLFormGridSpan } from 'srm-front-common/lib/utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
// import ContactTable from '@/routes/Approval/components/ContactTable';
import BasicInfoForm from './components/BasicInfoForm';
import CompanyInfoForm from './components/CompanyInfoForm';
import ContactTable from './components/ContactTable';
import ClientTable from './components/ClientTable';
import BankTable from './components/BankTable';
import AttachmentTable from './components/AttachmentTable';
import CusButton from 'srm-front-common/lib/components/CusButton';
import queryString from 'querystring';
import { ready } from '@/plugin/udc-sdk-esm';
import CusNotification from '_cus_components/CusNotification';
import CusModal from '_cus_components/CusModal';

const prompt = 'spfmhk.supplier';
const organizationId = getCurrentOrganizationId();
const currentUser = getCurrentUser();

@formatterCollections({ code: [prompt] })
@connect(({ loading, prsaInfomationPortal }) => ({
  prsaInfomationPortal,
  fetchListLoading: loading.effects['prsaInfomationPortal/queryBasicInfo'],
  backLoading: loading.effects[`prsaInfomationPortal/returnPortalChange`] ||
    loading.effects[`prsaInfomationPortal/backInfoQuery`] ||
    loading.effects[`prsaInfomationPortal/backInfo`] ||
    loading.effects[`prsaInfomationPortal/finishedDone`] ||
    loading.effects[`prsaInfomationPortal/submitInfo`]
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
      activeKey: ['basicInfo', 'basic', 'contact', 'client', 'bank', 'attachment'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      caseId, //致远caseId
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
      lineId: null,
      delContact: [],
      delClient: [],
      delAttach: [],
    }
  }

  componentDidMount() {
    this.init();
    this.listener();
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
    this.basicQuery(createdBy);
  }

  // 设置致远自定义按钮
  handleReady = (lineInfo) => {
    const { location: { search } } = this.props;
    const { state, isStart, activityCode } = queryString.parse(search.substring(1));
    ready(
      {
        mode: 'iframe',
        tenant: 'CMI',
      },
      (instance) => {
        const btns = [
          {
            name: intl.get(`${prompt}.view.button.comparison`).d('信息比对'),
            buttonType: 'primary',
            customEvents: [
              {
                type: 'click',
                messageType: 'informationComparison',
                func: () => {
                  // 业务逻辑
                  window.open(`/pub/spfm-hk/supplier/supplier-comparison?applyNumber=${lineInfo?.applyNumber}`);
                }
              },
            ],
          },
        ];
        if(lineInfo?.applyStatus === 'Inapproval' && ['READY', 'PENDING'].includes(state)) {
          if((isStart === 'true' || isStart) || activityCode === 'ReviewNode') {
            btns.push({
              // 按钮名称
              name: intl.get(`${prompt}.button.process.reject`).d('退回'),
              customEvents: [
                {
                  type: 'click',
                  messageType: 'reject',
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
            })
          }
        }

        instance.getCustomApi().insertBtnForToolbar({
          // 按钮插入位置
          position: 1,
          btns,
        });
      }
    );
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
          this.saveInfo((params) => {
            console.log(e.data.submitType, this.props.prsaInfomationPortal?.lineInfo?.applyStatus, 'return')
            if ((e.data.submitType == 'SEND' || e.data.submitType == 'SUBMIT' ) && this.props.prsaInfomationPortal?.lineInfo?.applyStatus === 'Return') {
              notification.error({
                description: intl
                .get(`${prompt}.button.return.valiadtip`)
                .d('该流程已被退回，请勿重复操作。')
              });
              return
            }
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

  // 查询采购审核供应商信息更新单
  @Bind()
  async basicQuery(id) {
    const { dispatch, location: { search = '', pathname }, } = this.props;
    const { state } = queryString.parse(search.substring(1));
    dispatch({
      type: 'prsaInfomationPortal/queryBasicInfo',
      payload: {
        id,
      },
    }).then((res) => {
      if (res) {
        const companyInfo = {
          ...res?.cmhkSupAccLineEdit,
          ...res?.cmhkSupAccessEditHead,
        };
        const lineInfo = {
          ...res?.cmhkSupAccessEditHead,
          ...res?.cmhkSupAccLineEdit,
        };
        this.setState({
          headId: res?.cmhkSupAccessEditHead?.id,
          lineId: res?.cmhkSupAccLineEdit.id
        })
        const contactList = res.cmhkSupAccessCtsEditList?.map((item) => {
          return {
            ...item,
            contactId: uuid(),
          };
        });
        const clientList = res.cmhkSupAccessCustEditList?.map((item) => {
          return {
            ...item,
            clientId: uuid(),
          };
        });
        // if (lineInfo?.applyStatus === 'Inapproval' && ['READY', 'PENDING'].includes(state) ) this.readyButton()
        this.handleReady(lineInfo);
        dispatch({
          type: 'prsaInfomationPortal/updateState',
          payload: {
            companyInfo,
            contactList,
            clientList,
            attachmentList: res?.cmhkSupAccessAttachEditList,
            lineInfo,
          },
        });
      }
    });
  }

  // 保存
  @Bind()
  async saveInfo(callback) {
    const { dispatch, prsaInfomationPortal } = this.props;
    const { registerState, headId, createdBy, lineId, delAttach, delClient, delContact } = this.state;
    const { language } = currentUser;
    const {
      companyInfo = {},
      contactList = [],
      clientList = [],
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
    // 采购审核供应商信息更新单——保存
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
    console.log('newLineInfo', newLineInfo);
    
    this.companyForm.validateFieldsAndScroll(async (err) => {
      if (!err) {
        await dispatch({
          type: `prsaInfomationPortal/submitInfo`,
          payload: {
            cmhkSupAccessAttachEditList: [...newAttachmentList, ...delAttach],
            cmhkSupAccessCtsEditList: [...contactList, ...delContact],
            cmhkSupAccessCustEditList: [...clientList, ...delClient],
            cmhkSupAccessEditHead: newCompanyInfo,
            cmhkSupAccLineEdit: newLineInfo,
            userId: createdBy,
            source: 'try',
          },
        }).then(async (res) => {
          if (res) {
            CusNotification.success({
              message: intl.get(`HKPC.commom.view.message.savesuccessfully`).d('保存成功'),
            })
            this.basicQuery(createdBy);
            this.setState({
              delClient: [],
              delContact: [],
              delAttach: [],
            })
            if (typeof callback === 'function') {
              callback(
                {
                  newLineInfo,
                  newAttachmentList: newAttachmentList,
                  contactList: contactList,
                  clientList: clientList,
                  newCompanyInfo,
                  headId,
                  userId: createdBy,
                  affairTitle: `${intl.get('spfmhk.supplier.todotask.basicinfo.update').d('供应商基本信息更新：')}${language === 'zh_CN' ? newCompanyInfo.companyNameCh : newCompanyInfo.companyNameEn}`,
                }
              )
            }
          }
        })
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
    const {
      companyInfo = {},
      contactList = [],
      clientList = [],
      attachmentList = [],
      lineInfo = {},
    } = prsaInfomationPortal;
    const { caseId, createdBy } = this.state;
    const { realName, loginName } = currentUser;
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
                categoryCode: 'ReturnofPortalSupBasic', // 待办分类标识
                categoryName: '企业基本信息变更申请退回', // 待办分类
                workQueueTitle: `企业基本信息变更退回`, // 待办标题
                requestBy: loginName, // 申请人
                requestDate: dayjs().format(DEFAULT_DATETIME_FORMAT), // 申请日期
                preExecutor: realName, // 前处理人
                executor: res?.loginName, // 处理人
                originExecutor: realName, // 原始处理人
                workQueueUrl: '/spfm/portal/enterprise/basicChange', // 待办URL
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
                    returnType: 'PORTAL_BASE_INFO_CHANGE',
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
                  //   type: `prsaInfomationPortal/submitInfo`,
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
                  //   this.basicQuery(createdBy);
                  // });
                  await dispatch({
                    type: `prsaInfomationPortal/finishedDone`,
                    payload: {
                      organizationId,
                      uuidValue: companyInfo?.appWorkQueueid,
                      change: 'change',
                    },
                  }).then(async () => {
                    if (caseId) {
                      window.parent?.postMessage(
                        {
                          messageType: 'CLOSE_WINDOW',
                        },
                        '*'
                      );
                    }
                    // 12.24修改为companyInfo?.createdBy 为 createdBy 
                    this.basicQuery(createdBy);
                  });
                  // if (caseId) {
                  //   window.parent?.postMessage(
                  //     {
                  //       messageType: 'CLOSE_WINDOW',
                  //     },
                  //     '*'
                  //   );
                  // }
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
    const { contactSelectRows, delContact } = this.state;
    const { contactList = [] } = prsaInfomationPortal;
    let newContactList = contactList.filter(r => contactSelectRows.every(rd => rd.contactId !== r.contactId));
    let newDelContact = contactSelectRows.filter(r => r.id).map(item => {
      return {
        ...item,
        isDel: '1'
      }
    })

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

  render() {
    const { activeKey, registerState, backInfoFlag } = this.state;
    const { dispatch, form, prsaInfomationPortal, fetchListLoading = false, backLoading = false, location: { search } } = this.props;
    const { activityCode } = queryString.parse(search.substring(1));
    const {
      lineInfo = {},
      companyInfo = {},
      contactList = [],
      clientList = [],
      attachmentList = [],
      fileCascader = [],
    } = prsaInfomationPortal;
    
    const readOnly = activityCode === 'ReviewNode' && lineInfo?.applyStatus === 'Inapproval';

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
      ...this.props,
      registerState,
      data: companyInfo,
      loading: fetchListLoading,
      onRef: (node) => {
        this.companyForm = node.props.form
      },
      readOnly,
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
        disabled: !readOnly, // 选择框的是否可选
      }),
    };
    // 联系信息 props
    const contactTableProps = {
      registerState,
      rowSelection: contactTablerowSelection,
      dispatch,
      loading: fetchListLoading,
      contactList,
      form,
      // loading,
      onRef: () => { },
      readOnly,
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
        disabled: !readOnly, // 选择框的是否可选
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
      readOnly,
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
        disabled: !readOnly || record.uploadErpStatus === 'Y', // 选择框的是否可选
      }),
    };

    // 附件 props
    const attachmentProps = {
      registerState,
      rowSelection: attachTablerowSelection,
      dispatch,
      attachmentList,
      form,
      fileCascader,
      loading: fetchListLoading,
      comSource: 'company',
      // loading,
      onRef: () => { },
      readOnly,
    };



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
            {/* <p>{intl.get(`${prompt}.view.title.contact.tips`).d('提示: 真实的联系人信息便于合作企业快速联系您，至少需要维护一条默认联系人。 ')}</p> */}
            {readOnly && <div className="table-operator">
              <CusButton onClick={this.addContactSource} type="primary" mini>{intl.get('hzero.common.button.add').d('新增')}</CusButton>
              <CusButton onClick={this.delContactSource} mini>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>
            </div>}
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
            {/* <p>{intl.get(`${prompt}.view.title.client.tips`).d('提示: 建议填写合作的客户单位，供参考。')}</p> */}
            {readOnly && <div className="table-operator">
              <CusButton onClick={this.addClientSource} type="primary" mini>{intl.get('hzero.common.button.add').d('新增')}</CusButton>
              <CusButton onClick={this.delClientSource} mini>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>
            </div>}
            <ClientTable {...clientTableProps} />
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
            {/* <p>{intl.get(`${prompt}.view.title.attachment3.tips`).d('请上传基本资质的三项必要文件')}</p> */}
            {readOnly && <div className="table-operator">
              <CusButton onClick={this.addAttachSource} type="primary" mini>{intl.get('hzero.common.button.add').d('新增')}</CusButton>
              <CusButton onClick={this.delAttachSource} mini>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>
            </div>}
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
      </PageWrapper>
    )
  }
}
