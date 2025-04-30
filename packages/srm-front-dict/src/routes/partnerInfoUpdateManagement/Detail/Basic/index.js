/**
 * 合作伙伴信息更新
 * @Author: qi.xue01@hand-china.com
 * @Date: 2024/11/3
 * @Copyright: Copyright (c), 2024, hand
 */
import React from 'react';
import { connect } from 'dva';
import { Collapse } from 'antd';
import { Form } from 'hzero-ui';
import { fastCodeLoader } from '@/utils/decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import BasicForm from './BasicForm';
import BasicInfo from './BasicInfo';
import ContactInfo from './ContactInfo';
import CustomerInfo from './CustomerInfo';
import Experience from './Experience';
import Attachment from './Attachment';
import queryString from 'query-string';
import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import CusNotification from '_cus_components/CusNotification';
import dayjs from 'dayjs';
import FinanceListTable from '@/routes/partnerInfoUpdateManagement/Detail/Basic/FinanceListTable';

const { Panel } = Collapse;
const prompt = 'spfmhk.dict';

@Form.create()
@formatterCollections({ code: [prompt] })
@fastCodeLoader(['DICT.EDIT_TYPE', 'HKSP.COMPANY_TYPE', 'HKSP.COMPANY_CATEG', 'HKSP.CONTACT_TYPE', 'DICT.PARTNER_FILE_TYPE', 'HKSP.CREDIT_PERIOD', 'DICT.PARTNER_EDIT_APPLY_STATUS'])
@connect(({ partnerInfoUpdateManagement, partnerReview }) => ({
  partnerInfoUpdateManagement,
  partnerReview,
}))
export default class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['basicForm', 'basicInfo', 'contactInfo', 'customerInfo', 'experience', 'attachment', 'finance'],
      selectedRows: [],
      selectedRowKeys: [],
      headerInfo: {}, // 基本信息
      basicValues: {}, // 基础信息
      contactDataSource: [],
      contactSelectRowKeys: [],
      contactSelectRows: [],
      customerDataSource: [],
      customerSelectRowKeys: [],
      customerSelectRows: [],
      projectDataSource: [],
      projectSelectRowKeys: [],
      projectSelectRows: [],
      fileDataSource: [],
      fileSelectRowKeys: [],
      fileSelectRows: [],
      editType: '',
      partnerId: '',
      financeDataSource: [],
      financeSelectRowKeys: [],
      financeSelectRows: [],
      readOnly: false,
      isSupplier: false,
      optionList: [],
    };
    this.headerInfoForm = {};
    this.basicForm = {};
  }

  async componentDidMount() {
    await this.pageInit();
    this.initLov();
  }

  @Bind()
  initLov() {
    const { dispatch } = this.props;
    dispatch({
      type: `partnerInfoUpdateManagement/getCooperationMode`,
      payload: {
        viewCode: 'DICT.MODE_NOTICE',
      },
    }).then((res) => {
      this.setState({
        optionList: res,
      });
    });
  }

  async pageInit() {
    const { location: { search } } = this.props;
    const { partnerId, formRecordId, state, permissionType } = queryString.parse(search.substring(1));
    if (partnerId) {
      console.log('新增');
      this.addInit();
    } else {
      console.log('修改');
      await this.updateInit();
    }
    this.setState({
      readOnly: (formRecordId?.indexOf('null') < 0 && state !== 'READY' && !(state === 'PENDING' && permissionType === 'SEND')),
    });
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 提交 保存 退回 会签 注销 查看流程
        if (['DRAFT_HANDLE', 'BACK', 'GIVE', 'TERMINATION'].includes(e.data.submitType)) {
          this.handleSave((params) => {
            console.log(params, '===params===');
            if (params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                formData: {
                  //下面内容为表单数据
                  ...params,
                },
              }, e.data.url);
            }
          });
        } else if (['SUBMIT'].includes(e.data.submitType)) {
          this.handleSave((params) => {
            console.log(params, '===params===');
            if (params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                formData: {
                  //下面内容为表单数据
                  ...params,
                },
              }, e.data.url);
            }
          }, 'SUBMIT');
        } else {
          this.handleSave((params) => {
            console.log(params, '===params===');
            if (params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                formData: {
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

  // 新增
  @Bind()
  addInit() {
    const { location: { search }, dispatch } = this.props;
    const { partnerId, editType } = queryString.parse(search.substring(1));
    this.setState({
      editType,
      partnerId,
    });
    dispatch({
      type: 'partnerReview/getPartnerInfo',
      payload: {
        partnerId,
      },
    }).then(res => {
      if (res) {
        this.setState({
          headerInfo: { ...res, applyNum: '' },
          basicValues: res,
          isSupplier: !!res?.supplierNumber,
        });
      }
    });
    // 采购基本信息查询
    if (editType === 'BASIC') {
      dispatch({
        type: 'partnerReview/getContactInfo',
        payload: {
          partnerId,
        },
      }).then(res => {
        if (res?.content?.length > 0) {
          const arr = res.content.map(item => {
            return {
              ...item,
              rowKey: uuid(),
              _status: 'update',
            };
          });
          this.setState({
            contactDataSource: arr,
          });
        }
      });
      dispatch({
        type: 'partnerReview/getCustomersInfo',
        payload: {
          partnerId,
        },
      }).then(res => {
        if (res?.content?.length > 0) {
          const arr = res.content.map(item => {
            return {
              ...item,
              rowKey: uuid(),
              _status: 'update',
            };
          });
          this.setState({
            customerDataSource: arr,
          });
        }
      });
      dispatch({
        type: 'partnerReview/getProjectInfo',
        payload: {
          partnerId,
        },
      }).then(res => {
        if (res?.content?.length > 0) {
          const arr = res.content.map(item => {
            return {
              ...item,
              rowKey: uuid(),
              _status: 'update',
            };
          });
          this.setState({
            projectDataSource: arr,
          });
        }
      });
      dispatch({
        type: 'partnerReview/getAttachmentInfo',
        payload: {
          partnerId,
        },
      }).then(res => {
        if (res?.content?.length > 0) {
          const arr = res.content.map(item => {
            return {
              ...item,
              rowKey: uuid(),
              _status: 'update',
            };
          });
          this.setState({
            fileDataSource: arr,
          });
        }
      });
    }
    // 财务信息查询
    if (editType === 'FINANCE') {
      dispatch({
        type: 'partnerReview/getFinancialInfo',
        payload: {
          partnerId,
        },
      }).then(res => {
        if (res?.content?.length > 0) {
          const arr = res.content.map(item => {
            return {
              ...item,
              rowKey: uuid(),
              _status: 'update',
            };
          });
          this.setState({
            financeDataSource: arr,
          });
        }
      });
    }
  }

  // 更新
  @Bind()
  async updateInit(params) {
    const { location: { search }, dispatch } = this.props;
    const { formRecordId, editRecordId } = queryString.parse(search.substring(1));
    const queryId = params?.queryId;
    const payload = queryId ? queryId : editRecordId || formRecordId;
    let editType;
    let editApproveUsers;
    await dispatch({
      type: 'partnerInfoUpdateManagement/queryPartnerBaseData',
      payload: {
        editRecordId: payload,
      },
    }).then(res => {
      console.log(res, '=====res====');
      editType = res.editType;
      editApproveUsers = res.editApproveUsers;
      console.log(editApproveUsers, '1');
      this.setState({
        headerInfo: { ...res },
        basicValues: { ...res },
        editType: res.editType,
        isSupplier: !!res?.supplierNumber,
      });
    });
    if (editType === 'BASIC') {
      dispatch({
        type: 'partnerInfoUpdateManagement/queryContactInfo',
        payload: {
          editRecordId: payload,
        },
      }).then(res => {
        if (res?.content?.length > 0) {
          const contactDataSource = res.content.map(item => {
            return {
              ...item,
              _status: 'update',
              rowKey: uuid(),
            };
          });
          this.setState({
            contactDataSource,
          });
        }
      });
      dispatch({
        type: 'partnerInfoUpdateManagement/queryCustomerInfo',
        payload: {
          editRecordId: payload,
        },
      }).then(res => {
        if (res?.content?.length > 0) {
          const customerDataSource = res.content.map(item => {
            return {
              ...item,
              _status: 'update',
              rowKey: uuid(),
            };
          });
          this.setState({
            customerDataSource,
          });
        }
      });
      dispatch({
        type: 'partnerInfoUpdateManagement/queryProjectInfo',
        payload: {
          editRecordId: payload,
        },
      }).then(res => {
        if (res?.content?.length > 0) {
          const projectDataSource = res.content.map(item => {
            return {
              ...item,
              _status: 'update',
              rowKey: uuid(),
            };
          });
          this.setState({
            projectDataSource,
          });
        }
      });
      dispatch({
        type: 'partnerInfoUpdateManagement/queryFiles',
        payload: {
          editRecordId: payload,
        },
      }).then(res => {
        if (res?.content?.length > 0) {
          const fileDataSource = res.content.map(item => {
            return {
              ...item,
              _status: 'update',
              rowKey: uuid(),
            };
          });
          this.setState({
            fileDataSource,
          });
        }
      });
    }
    if (editType === 'FINANCE') {
      dispatch({
        type: 'partnerInfoUpdateManagement/queryFinance',
        payload: {
          editRecordId: payload,
        },
      }).then(res => {
        if (res?.content?.length > 0) {
          const financeDataSource = res.content.map(item => {
            return {
              ...item,
              _status: 'update',
              rowKey: uuid(),
            };
          });
          this.setState({
            financeDataSource,
          });
        }
      });
    }
    console.log(editApproveUsers, '2');
    return editApproveUsers;
  }

  // 新增一行联系人信息
  @Bind()
  handleAddContactLine() {
    const { contactDataSource } = this.state;
    this.setState({
      contactDataSource: [...contactDataSource, {
        rowKey: uuid(),
        _status: 'create',
        contactType: undefined,
        contactName: undefined,
        contactPhone: undefined,
        contactEmail: undefined,
        defaultContact: 'N',
      }],
    });
  }

  // 删除一行联系人信息
  @Bind()
  handleDelContactLine() {
    const { contactDataSource, contactSelectRows } = this.state;
    const { dispatch } = this.props;
    let arr1 = [];
    let arr2 = [];
    contactDataSource.map(item => {
      if (item?.partnerContactDraftId) {
        arr1 = [...arr1, item];
      } else {
        arr2 = [...arr2, item];
      }
    });
    if (arr1.length > 0) {
      const payload = arr1.map(item => ({ partnerContactDraftId: item.partnerContactDraftId }));
      dispatch({
        type: 'partnerInfoUpdateManagement/delContactInfo',
        payload,
      }).then(res => {
        if (res) {
          CusNotification.success({
            message: intl.get('hzero.common.notification.success.delete').d('删除成功'),
          });
        }
      });
    }
    console.log(contactDataSource.filter(r => contactSelectRows.every(rd => rd.rowKey !== r.rowKey)), '联系人');
    this.setState({
      contactDataSource: contactDataSource.filter(r => contactSelectRows.every(rd => rd.rowKey !== r.rowKey)),
      contactSelectRows: [],
      contactSelectRowKeys: [],
    });
  }

  @Bind()
  handleContactRowSelectionChange(keys, rows) {
    this.setState({
      contactSelectRowKeys: keys,
      contactSelectRows: rows,
    });
  }

  /**
   * 设置唯一默认联系人
   * @param $event
   * @param record
   */
  @Bind()
  setDefaultContact($event, record) {
    const { contactDataSource } = this.state;
    record.defaultContact = $event.target.checked;
    const arr = contactDataSource.map(i => {
      if (i.rowKey !== record.rowKey) {
        return {
          ...i,
          defaultContact: 'N',
        };
      } else {
        return i;
      }
    });
    this.setState({
      contactDataSource: arr,
    });
  }

  @Bind()
  handleCustomerRowSelectionChange(keys, rows) {
    this.setState({
      customerSelectRowKeys: keys,
      customerSelectRows: rows,
    });
  }

  // 新增一行客户信息
  @Bind()
  handleAddCustomerLine() {
    const { customerDataSource } = this.state;
    this.setState({
      customerDataSource: [...customerDataSource, {
        rowKey: uuid(),
        _status: 'create',
        customerContact: undefined,
        customerPhone: undefined,
      }],
    });
  }

  // 删除一行客户信息
  @Bind()
  handleDelCustomerLine() {
    const { customerDataSource, customerSelectRows } = this.state;
    console.log(customerDataSource);
    const { dispatch } = this.props;
    let arr1 = [];
    let arr2 = [];
    customerDataSource.map(item => {
      if (item?.customerDraftId) {
        arr1 = [...arr1, item];
      } else {
        arr2 = [...arr2, item];
      }
    });
    if (arr1.length > 0) {
      const payload = arr1.map(item => ({ customerDraftId: item.customerDraftId }));
      dispatch({
        type: 'partnerInfoUpdateManagement/delCustomerInfo',
        payload,
      }).then(res => {
        if (res) {
          CusNotification.success({
            message: intl.get('hzero.common.notification.success.delete').d('删除成功'),
          });
        }
      });
    }
    console.log(customerDataSource.filter(r => customerSelectRows.every(rd => rd.rowKey !== r.rowKey)));
    this.setState({
      customerDataSource: customerDataSource.filter(r => customerSelectRows.every(rd => rd.rowKey !== r.rowKey)),
      customerSelectRows: [],
      customerSelectRowKeys: [],
    });
  }

  // 新增一行信息化
  @Bind()
  handleAddProjectLine() {
    const { projectDataSource } = this.state;
    this.setState({
      projectDataSource: [...projectDataSource, {
        rowKey: uuid(),
        _status: 'create',
        cooperativeCompany: undefined,
        projectDesc: undefined,
        projectAmount: undefined,
        currency: undefined,
        projectFileUuid: uuid(),
      }],
    });
  }

  @Bind()
  handleProjectRowSelectionChange(keys, rows) {
    this.setState({
      projectSelectRowKeys: keys,
      projectSelectRows: rows,
    });
  }

  // 删除一行信息化
  @Bind()
  handleDelProjectLine() {
    const { projectDataSource, projectSelectRows } = this.state;
    const { dispatch } = this.props;
    let arr1 = [];
    let arr2 = [];
    projectDataSource.map(item => {
      if (item?.projectDraftId) {
        arr1 = [...arr1, item];
      } else {
        arr2 = [...arr2, item];
      }
    });
    if (arr1.length > 0) {
      const payload = arr1.map(item => ({ projectDraftId: item.projectDraftId }));
      dispatch({
        type: 'partnerInfoUpdateManagement/delProjectInfo',
        payload,
      }).then(res => {
        if (res) {
          CusNotification.success({
            message: intl.get('hzero.common.notification.success.delete').d('删除成功'),
          });
        }
      });
    }
    this.setState({
      projectDataSource: projectDataSource.filter(r => projectSelectRows.every(rd => rd.rowKey !== r.rowKey)),
      projectSelectRows: [],
      projectSelectRowKeys: [],
    });
  }

  // 新增一行附件
  @Bind()
  handleAddFileLine() {
    const { fileDataSource } = this.state;
    this.setState({
      fileDataSource: [...fileDataSource, {
        rowKey: uuid(),
        _status: 'create',
        fileType: undefined,
        fileDesc: undefined,
        lastUpdateDate: undefined,
        fileUuid: uuid(),
        bucketName: 'dict',
        fromSupplier: 'N',
      }],
    });
  }

  @Bind()
  handleFileRowSelectionChange(keys, rows) {
    this.setState({
      fileSelectRowKeys: keys,
      fileSelectRows: rows,
    });
  }

  // 删除一行附件
  @Bind()
  handleDelFileLine() {
    const { fileDataSource, fileSelectRows } = this.state;
    const { dispatch } = this.props;
    let arr1 = [];
    let arr2 = [];
    fileDataSource.map(item => {
      if (item?.partnerFileDraftId) {
        arr1 = [...arr1, item];
      } else {
        arr2 = [...arr2, item];
      }
    });
    if (arr1.length > 0) {
      const payload = arr1.map(item => ({ partnerFileDraftId: item.partnerFileDraftId }));
      dispatch({
        type: 'partnerInfoUpdateManagement/delFiles',
        payload,
      }).then(res => {
        if (res) {
          CusNotification.success({
            message: intl.get('hzero.common.notification.success.delete').d('删除成功'),
          });
        }
      });
    }
    this.setState({
      fileDataSource: fileDataSource.filter(r => fileSelectRows.every(rd => rd.rowKey !== r.rowKey)),
      fileSelectRows: [],
      fileSelectRowKeys: [],
    });
  }

  @Bind()
  handleFinanceRowSelectionChange(keys, rows) {
    this.setState({
      financeSelectRowKeys: keys,
      financeSelectRows: rows,
    });
  }

  // 新增一行财务信息
  @Bind()
  handleAddFinanceLine() {
    const { financeDataSource } = this.state;
    this.setState({
      financeDataSource: [...financeDataSource, {
        rowKey: uuid(),
        _status: 'create',
        orderCurrency: undefined,
        paymentProvision: undefined,
        countryCode: undefined,
        ibanCode: undefined,
        accountName: undefined,
        account: undefined,
        tradeTerms: undefined,
      }],
    });
  }

  // 删除一行财务信息
  @Bind()
  handleDelFinanceLine() {
    const { financeDataSource, financeSelectRows } = this.state;
    const { dispatch } = this.props;
    let arr1 = [];
    let arr2 = [];
    financeDataSource.map(item => {
      if (item?.conditionDraftId) {
        arr1 = [...arr1, item];
      } else {
        arr2 = [...arr2, item];
      }
    });
    if (arr1.length > 0) {
      const payload = arr1.map(item => ({ conditionDraftId: item.conditionDraftId }));
      dispatch({
        type: 'partnerInfoUpdateManagement/delFiles',
        payload,
      }).then(res => {
        if (res) {
          CusNotification.success({
            message: intl.get('hzero.common.notification.success.delete').d('删除成功'),
          });
        }
      });
    }
    this.setState({
      financeDataSource: financeDataSource.filter(r => financeSelectRows.every(rd => rd.rowKey !== r.rowKey)),
      financeSelectRows: [],
      financeSelectRowKeys: [],
    });
  }


  @Bind()
  handleSave(callback, type = 'SUBMIT') {
    const {
      partnerId,
      contactDataSource,
      customerDataSource,
      projectDataSource,
      fileDataSource,
      headerInfo,
      editType,
      financeDataSource,
    } = this.state;
    const { dispatch } = this.props;
    this.headerInfoForm.validateFields((headerInfoFormErr, headerInfoFormValues) => {
      if (!headerInfoFormErr) {
        if (editType === 'BASIC') {
          this.basicForm.validateFields((basicFormErr, basicFormValues) => {
            if (!basicFormErr) {
              let formValues = {
                partnerId: partnerId,
                cmpanyNameEn: basicFormValues.cmpanyNameEn,
                cmpanyNameCh: basicFormValues.cmpanyNameCh,
                addressEn: basicFormValues.addressEn,
                addressCh: basicFormValues.addressCh,
                phone: basicFormValues.phone,
                fax: basicFormValues.fax,
                email: basicFormValues.email,
                websiteUrl: basicFormValues.websiteUrl,
                companyType: basicFormValues.companyType,
                supplyOf: basicFormValues.supplyOf,
                companyCategory: basicFormValues.companyCategory,
                businessNature: basicFormValues.businessNature,
                establishmentDateStr: dayjs(basicFormValues.establishmentDateStr).format('YYYY-MM-DD'),
                establishmentPlace: basicFormValues.establishmentPlace,
                businessRegistration: basicFormValues.businessRegistration,
                companyParnter: basicFormValues.companyParnter,
                directorName: basicFormValues.directorName,
                employeesCount: basicFormValues.employeesCount,
                partnerStorageStatus: basicFormValues.partnerStorageStatus,
                partnerCategory: basicFormValues.partnerCategory,
                statusUpdateTime: basicFormValues.statusUpdateTime,
                supplierAccessTime: basicFormValues.supplierAccessTime,
                supplierVersions: basicFormValues.supplierVersions,
                versionsUpdateTime: basicFormValues.versionsUpdateTime,
                editReason: headerInfoFormValues.editReason, // 头表变更原因
                editType: headerInfoFormValues.editType,
                // collaborationMode: headerInfoFormValues.collaborationMode ? headerInfoFormValues.collaborationMode.join(',') : '',
                partnerNum: headerInfoFormValues.partnerNum,
                cmpanyName: headerInfo.cmpanyName,
                modeNoticeId: headerInfoFormValues.modeNoticeId ? headerInfoFormValues.modeNoticeId.join(',') : '',
              };
              if (headerInfo?.editRecordId) {
                formValues = {
                  ...formValues,
                  applyNum: headerInfo.applyNum,
                  editRecordId: headerInfo.editRecordId,
                };
              }
              if (contactDataSource.length === 0) {
                CusNotification.error({
                  message: intl.get(`${prompt}.table.validateFields.contacts`).d('联系人必须要填写一行'),
                });
                return false;
              }
              if (contactDataSource.length > 0) {
                const defaultContact = contactDataSource.filter(i => i.defaultContact === 'Y');
                if (defaultContact.length === 0) {
                  CusNotification.error({
                    message: intl.get(`${prompt}.table.validateFields.contacts.default`).d('至少需要维护一条默认联系人'),
                  });
                  return false;
                }
              }
              if (projectDataSource.length === 0) {
                CusNotification.error({
                  message: intl.get(`${prompt}.table.validateFields.project`).d('信息化项目经验必须要填写一行'),
                });
                return false;
              }
              dispatch({
                type: 'partnerInfoUpdateManagement/savePartnerBaseData',
                payload: [{ ...formValues }],
              }).then(async res => {
                console.log(res, '====res====');
                if (res?.length > 0) {
                  const editRecordId = res[0].editRecordId;
                  const applyNum = res[0].applyNum;
                  const contacts = contactDataSource.map(item => {
                    if (item?.partnerContactDraftId) {
                      return {
                        partnerContactDraftId: item.partnerContactDraftId,
                        editRecordId,
                        contactType: item.contactType,
                        contactName: item.contactName,
                        contactPhone: item.contactPhone,
                        contactEmail: item.contactEmail,
                        defaultContact: item.defaultContact,
                      };
                    } else {
                      return {
                        editRecordId,
                        contactType: item.contactType,
                        contactName: item.contactName,
                        contactPhone: item.contactPhone,
                        contactEmail: item.contactEmail,
                        defaultContact: item.defaultContact,
                      };
                    }
                  });
                  dispatch({
                    type: 'partnerInfoUpdateManagement/saveContactInfo',
                    payload: contacts,
                  }).then(res => {
                    console.log(res, '====contacts====');
                  });
                  const customers = customerDataSource.map(item => {
                    if (item?.customerDraftId) {
                      return {
                        customerDraftId: item.customerDraftId,
                        editRecordId,
                        customerName: item.customerName,
                        customerContact: item.customerContact,
                        customerPhone: item.customerPhone,
                      };
                    } else {
                      return {
                        editRecordId,
                        customerName: item.customerName,
                        customerContact: item.customerContact,
                        customerPhone: item.customerPhone,
                      };
                    }
                  });
                  dispatch({
                    type: 'partnerInfoUpdateManagement/saveCustomerInfo',
                    payload: customers,
                  }).then(res => {
                    console.log(res, '====customers====');
                  });
                  const projects = projectDataSource.map(item => {
                    if (item?.projectDraftId) {
                      return {
                        projectDraftId: item.projectDraftId,
                        editRecordId,
                        cooperativeCompany: item.cooperativeCompany,
                        projectDesc: item.projectDesc,
                        currency: item.currency,
                        projectAmount: item.projectAmount,
                        projectFileUuid: item.projectFileUuid,
                      };
                    } else {
                      return {
                        editRecordId,
                        cooperativeCompany: item.cooperativeCompany,
                        projectDesc: item.projectDesc,
                        currency: item.currency,
                        projectAmount: item.projectAmount,
                        projectFileUuid: item.projectFileUuid,
                      };
                    }
                  });
                  dispatch({
                    type: 'partnerInfoUpdateManagement/saveProjectInfo',
                    payload: projects,
                  }).then(res => {
                    console.log(res, '====projects====');
                  });
                  console.log(fileDataSource, '====projects====');
                  const files = fileDataSource.map(item => {
                    if (item?.partnerFileDraftId) {
                      return {
                        partnerFileDraftId: item.partnerFileDraftId,
                        editRecordId,
                        fileType: item.fileType,
                        fileUuid: item.fileUuid,
                        fileDesc: item.fileDesc,
                        fromSupplier: item.fromSupplier
                      };
                    } else {
                      return {
                        editRecordId,
                        fileType: item.fileType,
                        fileUuid: item.fileUuid,
                        fileDesc: item.fileDesc,
                        fromSupplier: item.fromSupplier
                      };
                    }
                  });
                  dispatch({
                    type: 'partnerInfoUpdateManagement/saveFiles',
                    payload: files,
                  }).then(res => {
                    console.log(res, '====files====');
                  });
                  // 保存后查询最新信息
                  const editApproveUsers = await this.updateInit({ queryId: editRecordId });
                  console.log(editApproveUsers, '3');
                  if (!editApproveUsers && type === 'SUBMIT') {
                    CusNotification.error({
                      message: intl.get(`${prompt}.field.editApproveUsers.error.msg`).d('该流程无相关审批人员，请更新后重试！'),
                    });
                    return false;
                  }
                  if (typeof callback === 'function') {
                    console.log('待办标题: ', intl.get('hzero.common.title.info.update.process').d('信息更新流程') + '：' + applyNum);
                    callback({
                      ...res,
                      IsPurchase: 'Y', // 审批分支条件 采购
                      Purchaser: editApproveUsers,
                      formRecordId: editRecordId,
                      affairTitle: intl.get('hzero.common.title.info.update.process').d('信息更新流程') + '：' + applyNum,
                    });
                  }
                }
              });
            }
          });
        }
        if (editType === 'FINANCE') {
          let formValues = {
            partnerId: partnerId,
            editType: headerInfoFormValues.editType,
            editReason: headerInfoFormValues.editReason, // 头表变更原因
            cmpanyNameEn: headerInfoFormValues.cmpanyNameEn,
            cmpanyNameCh: headerInfoFormValues.cmpanyNameCh,
            // collaborationMode: headerInfoFormValues.collaborationMode ? headerInfoFormValues.collaborationMode.join(',') : '',
            partnerNum: headerInfoFormValues.partnerNum,
            cmpanyName: headerInfo.cmpanyName,
            modeNoticeId: headerInfoFormValues.modeNoticeId ? headerInfoFormValues.modeNoticeId.join(',') : '',
          };
          if (headerInfo?.editRecordId) {
            formValues = {
              ...formValues,
              applyNum: headerInfo.applyNum,
              editRecordId: headerInfo.editRecordId,
            };
          }
          if (financeDataSource.length === 0) {
            CusNotification.error({
              message: intl.get(`${prompt}.table.validateFields.finance`).d('财务信息必须要填写一行'),
            });
            return false;
          }
          dispatch({
            type: 'partnerInfoUpdateManagement/savePartnerBaseData',
            payload: [{ ...formValues }],
          }).then(async res => {
            if (res?.length > 0) {
              const editRecordId = res[0].editRecordId;
              const applyNum = res[0].applyNum;
              const finances = financeDataSource.map(item => {
                if (item?.conditionDraftId) {
                  return {
                    conditionDraftId: item.conditionDraftId,
                    editRecordId,
                    orderCurrency:  Array.isArray(item?.orderCurrency)
                    ? item?.orderCurrency.join(',')
                    : item?.orderCurrency,
                    paymentProvision: item.paymentProvision,
                    countryCode: item.countryCode,
                    ibanCode: item.ibanCode,
                    accountName: item.accountName,
                    account: item.account,
                    tradeTerms: item.tradeTerms,
                    depositBank: item.depositBank,
                  };
                } else {
                  return {
                    editRecordId,
                    orderCurrency: Array.isArray(item?.orderCurrency)
                    ? item?.orderCurrency.join(',')
                    : item?.orderCurrency,
                    paymentProvision: item.paymentProvision,
                    countryCode: item.countryCode,
                    ibanCode: item.ibanCode,
                    accountName: item.accountName,
                    account: item.account,
                    tradeTerms: item.tradeTerms,
                    depositBank: item.depositBank,
                  };
                }
              });
              dispatch({
                type: 'partnerInfoUpdateManagement/saveFinance',
                payload: finances,
              }).then(res => {
                console.log(res, '====finances====');
              });
              // 保存后查询最新信息
              const editApproveUsers = await this.updateInit({ queryId: editRecordId });
              console.log(editApproveUsers, '3');
              if (!editApproveUsers && type === 'SUBMIT') {
                CusNotification.error({
                  message: intl.get(`${prompt}.field.editApproveUsers.error.msg`).d('该流程无相关审批人员，请更新后重试！'),
                });
                return false;
              }
              if (typeof callback === 'function') {
                console.log('待办标题: ', intl.get('hzero.common.title.info.update.process').d('信息更新流程') + '：' + applyNum);
                callback({
                  ...res,
                  IsPurchase: 'N', // 审批分支条件
                  Salesman: editApproveUsers,
                  formRecordId: editRecordId,
                  affairTitle: intl.get('hzero.common.title.info.update.process').d('信息更新流程') + '：' + applyNum,
                });
              }
            }
          });
        }
      }
    });
  }


  render() {
    const { idpValueMap } = this.props;
    const {
      activeKey,
      headerInfo,
      basicValues,
      contactDataSource,
      contactSelectRowKeys,
      customerDataSource,
      customerSelectRowKeys,
      projectDataSource,
      projectSelectRowKeys,
      fileDataSource,
      fileSelectRowKeys,
      editType,
      financeDataSource,
      financeSelectRowKeys,
      readOnly,
      isSupplier,
      optionList,
    } = this.state;
    const headerInfoFormProps = {
      onRef: ref => this.headerInfoForm = ref.props.form,
      headerInfo,
      idpValueMap,
      editType,
      readOnly,
      isSupplier,
      optionList,
    };

    const basicFormProps = {
      onRef: ref => this.basicForm = ref.props.form,
      basicValues,
      idpValueMap,
      editType,
      readOnly,
      isSupplier,
    };

    const contactInfoProps = {
      dataSource: contactDataSource,
      rowSelection: {
        selectedRowKeys: contactSelectRowKeys,
        onChange: this.handleContactRowSelectionChange,
        getCheckboxProps: () => ({
          disabled: readOnly || isSupplier,
        }),
      },
      idpValueMap,
      setDefaultContact: this.setDefaultContact,
      isSupplier,
      readOnly,
    };

    const customerInfoProps = {
      dataSource: customerDataSource,
      rowSelection: {
        selectedRowKeys: customerSelectRowKeys,
        onChange: this.handleCustomerRowSelectionChange,
        getCheckboxProps: () => ({
          disabled: readOnly || isSupplier,
        }),
      },
      isSupplier,
      readOnly,
    };

    const projectProps = {
      dataSource: projectDataSource,
      rowSelection: {
        selectedRowKeys: projectSelectRowKeys,
        onChange: this.handleProjectRowSelectionChange,
        getCheckboxProps: () => ({
          disabled: readOnly || isSupplier,
        }),
      },
      isSupplier,
      readOnly,
    };

    const fileProps = {
      dataSource: fileDataSource,
      rowSelection: {
        selectedRowKeys: fileSelectRowKeys,
        onChange: this.handleFileRowSelectionChange,
        getCheckboxProps: (record) => ({
          disabled: readOnly || (record.fileUuid && isSupplier),
        }),
      },
      idpValueMap,
      isSupplier,
      readOnly,
    };

    const financeListTableProps = {
      dataSource: financeDataSource,
      rowSelection: {
        selectedRowKeys: financeSelectRowKeys,
        onChange: this.handleFinanceRowSelectionChange,
        getCheckboxProps: () => ({
          disabled: readOnly || isSupplier,
        }),
      },
      idpValueMap,
      isSupplier,
      readOnly,
    };

    return (
      <PageWrapper>
        {/* <CusButton onClick={this.handleSave}>test</CusButton> */}
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
                title={intl.get(`spfmhk.dict.view.common.basicinformation`).d('基础信息')}
                arrowActive={activeKey.includes('basicForm')}
              />
            }
            key="basicForm"
          >
            <BasicForm {...headerInfoFormProps} />
          </Panel>
          {editType === 'BASIC' && (
            <>
              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`spfmhk.dict.view.field.common.basicinfo`).d('基本信息')}
                    arrowActive={activeKey.includes('basicInfo')}
                  />
                }
                key="basicInfo"
              >
                <BasicInfo {...basicFormProps} />
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`spfmhk.dict.view.portal.contactinfo`).d('联系信息')}
                    arrowActive={activeKey.includes('contactInfo')}
                    buttons={
                      !readOnly && (
                        <>
                          <CusButton
                            mini
                            onClick={this.handleDelContactLine}
                            disabled={contactSelectRowKeys.length === 0}
                          >
                            {intl.get('hzero.common.view.button.delete').d('删除')}
                          </CusButton>
                          <CusButton
                            mini
                            type="primary"
                            onClick={this.handleAddContactLine}
                            disabled={readOnly || isSupplier}
                          >
                            {intl.get('hzero.common.view.button.add').d('新建')}
                          </CusButton>
                        </>
                      )
                    }
                  />
                }
                key="contactInfo"
              >
                <ContactInfo {...contactInfoProps} />
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`spfmhk.dict.view.common.clientinformation`).d('客户信息')}
                    arrowActive={activeKey.includes('customerInfo')}
                    buttons={
                      !readOnly && <>
                        <CusButton
                          mini
                          onClick={this.handleDelCustomerLine}
                          disabled={customerSelectRowKeys.length === 0}
                        >
                          {intl.get('hzero.common.view.button.delete').d('删除')}
                        </CusButton>
                        <CusButton
                          mini
                          type="primary"
                          onClick={this.handleAddCustomerLine}
                          disabled={readOnly || isSupplier}
                        >
                          {intl.get('hzero.common.view.button.add').d('新建')}
                        </CusButton>
                      </>
                    }
                  />
                }
                key="customerInfo"
              >
                <CustomerInfo {...customerInfoProps} />
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`spfmhk.dict.view.field.portalfinacncepex`).d('信息化项目经验')}
                    arrowActive={activeKey.includes('experience')}
                    buttons={
                      !readOnly && <>
                        <CusButton
                          mini
                          onClick={this.handleDelProjectLine}
                          disabled={projectSelectRowKeys.length === 0}
                        >
                          {intl.get('hzero.common.view.button.delete').d('删除')}
                        </CusButton>
                        <CusButton
                          mini
                          type="primary"
                          onClick={this.handleAddProjectLine}
                        >
                          {intl.get('hzero.common.view.button.add').d('新建')}
                        </CusButton>
                      </>
                    }
                  />
                }
                key="experience"
              >
                <Experience {...projectProps} />
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`spfmhk.dict.view.common.companyattachments`).d('公司附件')}
                    arrowActive={activeKey.includes('attachment')}
                    buttons={
                      !readOnly && (
                        <>
                          <CusButton
                            mini
                            onClick={this.handleDelFileLine}
                            disabled={fileSelectRowKeys.length === 0}
                          >
                            {intl.get('hzero.common.view.button.delete').d('删除')}
                          </CusButton>
                          <CusButton
                            mini
                            type="primary"
                            onClick={this.handleAddFileLine}
                          >
                            {intl.get('hzero.common.view.button.add').d('新建')}
                          </CusButton>
                        </>
                      )
                    }
                  />
                }
                key="attachment"
              >
                <Attachment {...fileProps} />
              </Panel>
            </>
          )}
          {editType === 'FINANCE' && (
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`spfmhk.dict.view.field.portalfinacncecondition`).d('财务条件')}
                  arrowActive={activeKey.includes('finance')}
                  buttons={
                    !readOnly && (
                      <>
                        <CusButton
                          mini
                          onClick={this.handleDelFinanceLine}
                          disabled={financeSelectRowKeys.length === 0}
                        >
                          {intl.get('hzero.common.view.button.delete').d('删除')}
                        </CusButton>
                        <CusButton
                          mini
                          type="primary"
                          onClick={this.handleAddFinanceLine}
                          disabled={readOnly || isSupplier}
                        >
                          {intl.get('hzero.common.view.button.add').d('新建')}
                        </CusButton>
                      </>
                    )
                  }
                />
              }
              key="finance"
            >
              <FinanceListTable {...financeListTableProps} />
            </Panel>
          )}
        </Collapse>
      </PageWrapper>
    );
  }
}

