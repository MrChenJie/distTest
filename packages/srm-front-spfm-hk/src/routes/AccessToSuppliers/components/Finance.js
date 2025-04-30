/*
 * @Description:
 * @Author: 谭治鹏
 * @email: ZHIPENG.TAN01@HAND-CHINA.COM
 * @Date: 2025-03-13 10:52:06
 */
/**
 * 供应商准入 - 财务（A2P & 非A2P）
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/11
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Collapse, Row, Col } from 'antd';
import intl from 'utils/intl';
import { fastCodeLoader } from '@/utils/decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import PanelHeader from '_cus_components/CusCollapse';
import CusButton from '_cus_components/CusButton';
import CusInput from '_cus_components/CusInput';
import CusSelect from '_cus_components/CusSelect';
import EditTable from '_cus_components/EditTable';
import '../index.less';
import { Bind } from 'lodash-decorators';
import { Checkbox, Form } from 'hzero-ui';
import A2pForm from '@/routes/AccessToSuppliers/components/A2pForm';
import uuid from 'uuid/v4';
import CusUpload from '_cus_components/CusUpload';
import CusLov from '_cus_components/CusLov';
import CusSpin from '_cus_components/CusSpin';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import dayjs from 'dayjs';
import queryString from 'query-string';
import CusCascader from '_cus_components/CusCascader';
import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import notification from '_cus_components/CusNotification';
import { EMAIL } from 'utils/regExp';
import AddressBankInfoList from './AddressBankInfoList';
import BankInfoList from './BankInfoList';
import { isEmpty } from 'lodash';

const { Panel } = Collapse;
const prompt = 'spfmhk.supplier';

@Form.create()
@formatterCollections({ code: [prompt] })
@fastCodeLoader([])

@connect(({ accessToSupplierHK, loading = {} }) => ({
  accessToSupplierHK,
  tenantId: getCurrentOrganizationId(),
  queryBankInfoListLoading: loading.effects['accessToSupplierHK/getBankInfoList'],
  saveBankLoading: loading.effects['accessToSupplierHK/saveBankInfoList'],
  bankInfoExportLoading: loading.effects['accessToSupplierHK/bankInfoExport'],
}))
export default class Finance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['basic', 'bank', 'bankAttachment', 'a2pInfo'],
      bankInfoDataSource: [], // 银行信息表格数据
      bankInfoDataRemove: [],
      bankInfoSelectRowKeys: [],
      bankInfoSelectRows: [], // 银行信息表格checkbox
      bankAttachmentDataSource: [], // 银行附件表格数据
      bankAttachmentDataRemove: [],
      bankAttachmentSelectRowKeys: [],
      bankAttachmentSelectRows: [], // 银行附件表格checkbox
      contactTypeDataSource: [], // a2p信息表格数据
      contactTypeDataRemove: [],
      contactSelectRowKeys: [],
      contactSelectRows: [], // a2p信息表格checkbox
      accountDataSource: [], // a2p账号表格数据
      accountDataRemove: [],
      accountSelectRowKeys: [],
      accountSelectRows: [], // // a2p账号表格checkbox
      showA2pInfo: false, // a2p信息展示
      a2p: {},
      initialValue: {},
      partnerId: null,
      selectedRowKeysAddressBank: [],
      selectedRowsAddressBank: [],
      selectedRowKeysBank: [],
      selectedRowsBank: [],
    };
  }

  componentDidMount() {
    const { dispatch } = this.props.props.props;
    dispatch({
      type: 'accessToSupplierHK/init',
    });
    // this.initDictDate();
    this.queryPurchaseDetail();
    this.listener();
    // 获取银行地址信息
    this.handleAddressBankInfoList();
  }

  @Bind()
  handleAddressBankInfoList() {
    const {
      dispatch,
      location: { search },
    } = this.props.props.props;
    const { supplierId, formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'accessToSupplierHK/getAddressBankInfoList',
      payload: {
        supplierId: supplierId || formRecordId,
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
          type: 'accessToSupplierHK/updateState',
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
    } = this.props.props.props;
    if(record?.id) {
      dispatch({
        type: 'accessToSupplierHK/getBankInfoList',
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
            type: 'accessToSupplierHK/updateState',
            payload: {
              bankInfoListDataSource: newDataSource,
            }
          })
        }
      })
    } else {
      dispatch({
        type: 'accessToSupplierHK/updateState',
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
     } = this.props.props.props;
    const { supplierId, formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'accessToSupplierHK/bankInfoExport',
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
    const {
      location: { search },
    } = this.props.props.props;
    const { affairTitle, backAffairTitle } = this.props;
    const { supplierId, formRecordId } = queryString.parse(search.substring(1));
    console.log(affairTitle, 'affairTitle3');
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if (e.data.messageType === 'GET_FORM_DATA') {
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        // 提交 保存 退回 撤回 知会 会签 查看流程
        if (['SUBMIT', 'DRAFT_HANDLE', 'UNDO', 'NOTICE'].includes(e.data.submitType)) {
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
        } else if (['GIVE', 'BACK'].includes(e.data.submitType)) {
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
   * 是否a2p供应商
   */
  @Bind()
  handleSelectA2p(val) {
    this.setState({
      showA2pInfo: val === 'Y',
    });
  }

  /**
   * 设置唯一
   */
  @Bind()
  setDefaultVal(val, record, field) {
    const { bankInfoDataSource } = this.state;
    record[field] = val.target.checked;
    const arr = bankInfoDataSource.map((i) => {
      if (i.id !== record.id || i.uuid !== record.uuid) {
        return {
          ...i,
          [field]: 'N',
        };
      } else {
        return i;
      }
    });
    this.setState({
      bankInfoDataSource: arr,
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
          showA2pInfo: res.isA2p === 'Y',
        });
        if (res.id) {
          this.queryAttachmentDetail();
          this.previewSupplierBankDetail();
          this.previewSupplierA2pDetail();
        } else {
          this.initDictDate();
        }
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
    const { supplierId, formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'accessToSupplierHK/queryAttachmentDetail',
      payload: {
        supplierId: supplierId || formRecordId,
        refType: 'bank',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          bankAttachmentDataSource: res,
        });
      }
    });
  }

  /**
   * 查询银行信息详情
   */
  @Bind()
  previewSupplierBankDetail() {
    const {
      dispatch,
      location: { search },
    } = this.props.props.props;
    const { supplierId, formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'accessToSupplierHK/previewSupplierBankDetail',
      payload: {
        supplierId: supplierId || formRecordId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          bankInfoDataSource: res,
        });
      }
    });
  }

  /**
   * 查询a2p信息详情
   */
  @Bind()
  previewSupplierA2pDetail() {
    const {
      dispatch,
      location: { search },
    } = this.props.props.props;
    const { supplierId, formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'accessToSupplierHK/previewSupplierA2pDetail',
      payload: {
        supplierId: supplierId || formRecordId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          contactTypeDataSource: res.contacts,
          accountDataSource: res.account,
          a2p: res.a2p,
        });
      }
    });
  }

  // 保存银行信息
  @Bind()
  saveBankInfoList(callback) {
    const { dispatch, accessToSupplierHK } = this.props;
    const {
      addressBankInfoDataSource = [],
      bankInfoListDataSource = []
    } = accessToSupplierHK;
    if(addressBankInfoDataSource?.length === 0) {
      notification.error({
        message: intl.get(`${prompt}.field.bank.maintain.placeHolder`).d('至少维护一条银行信息')
      });
      return false;
    }
    if(addressBankInfoDataSource?.length > 0 && addressBankInfoDataSource.every(i => i.isMainAddress === 'N')) {
      notification.error({
        message: intl.get(`${prompt}.form.validateFields.mainaddress.default`).d('至少需要维护一个默认主地址')
      });
      return false;
    }
    if(bankInfoListDataSource?.length > 0 && bankInfoListDataSource.every(i => i.isMain === 'N')) {
      notification.error({
        message: intl.get(`${prompt}.tip.mainaccount`).d('至少需要维护一个主账号')
      });
      return false;
    }
    const addressBankValidateData = getEditTableData(addressBankInfoDataSource);
    const bankValidateData = getEditTableData(bankInfoListDataSource);
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
    if((newBankOrAddressInfoList.length > 0 && bankValidateData.length > 0) || (newBankOrAddressInfoList.length > 0 && bankInfoListDataSource.length === 0)) {
      console.log('addressBankValidateData', addressBankValidateData);
      console.log('bankValidateData', bankValidateData);
      console.log('newBankOrAddressInfoList', newBankOrAddressInfoList);
      dispatch({
        type: 'accessToSupplierHK/saveBankInfoList',
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
              type: 'accessToSupplierHK/updateState',
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

  /**
   * 保存
   */
  @Bind()
  handleSave(callback) {
    const { dispatch, form, finance, processType } = this.props;
    const {
      location: { search },
    } = this.props.props.props;
    const {
      bankInfoDataSource,
      bankAttachmentDataSource,
      contactTypeDataSource,
      accountDataSource,
      initialValue,
      a2p,
    } = this.state;
    const {
      addressBankInfoDataSource = [],
      bankInfoListDataSource = []
    } = this.props.accessToSupplierHK;

    const { supplierId, formRecordId } = queryString.parse(search.substring(1));
    if (finance) {
      form.validateFields((err, values) => {
        console.log(values, 'values');
        if (!err) {
          const lineParams = {
            isA2p: values.isA2p,
            isRelatedTrader: values.isRelatedTrader,
            liabilityAccount: values.liabilityAccount,
            dealings: values.dealings,
            isRelatedBudget: values.isRelatedBudget,
            id: initialValue.id,
          };
          let dtoParams;
          if(addressBankInfoDataSource?.length === 0) {
            notification.error({
              message: intl
                .get(`${prompt}.field.bank.maintain.placeHolder`)
                .d('至少维护一条银行信息'),
            });
            return false;
          }
          if(addressBankInfoDataSource?.length > 0 && addressBankInfoDataSource.every(i => i.isMainAddress === 'N')) {
            notification.error({
              message: intl
                .get(`${prompt}.form.validateFields.mainaddress.default`)
                .d('至少需要维护一个默认主地址'),
            });
            return false;
          }
          if(bankInfoListDataSource?.length > 0 && bankInfoListDataSource.every(i => i.isMain === 'N')) {
            notification.error({
              message: intl.get(`${prompt}.tip.mainaccount`).d('至少需要维护一个主账号')
            });
            return false;
          }
          if(bankAttachmentDataSource?.length === 0) {
            notification.error({
              message: intl.get(`${prompt}.field.bank.attachment.placeHolder`).d('请至少上传一个银行相关证明附件')
            });
            return false;
          }
          if(bankAttachmentDataSource?.length > 0) {
            if(bankAttachmentDataSource.some(i => i.attachmentDate === undefined)) {
              notification.error({
                message: intl.get(`${prompt}.field.bank.attachment.placeHolder`).d('请至少上传一个银行相关证明附件')
              });
              return false;
            }
          }
          
          // const bank = bankInfoDataSource?.map(i => {
          //   return {
          //     bankName: i.bankName,
          //     branchName: i.branchName,
          //     country: i.country,
          //     accountName: i.accountName,
          //     bankAccountName: i.bankAccountName,
          //     interRemittanceNum: i.interRemittanceNum,
          //     payerAddress: i.payerAddress,
          //     isMainAddress: i.isMainAddress,
          //     addressStatus: i.addressStatus,
          //     payerCode: i.payerCode,
          //     isMain: i.isMain,
          //     bankStatus: i.bankStatus,
          //     ebsBankId: i.ebsBankId,
          //     ebsBranchId: i.ebsBranchId,
          //   }
          // });
          const attachment = bankAttachmentDataSource?.map(i => {
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
          dtoParams = {
            supplierId: supplierId || formRecordId,
            line: lineParams,
            attachment,
            // bank,
          };
          if (values.isA2p === 'Y') {
            const a2pContacts = contactTypeDataSource.map((i) => {
              return {
                type: i.type,
                name: i.name,
                email: i.email,
                position: i.position,
                phone: i.phone,
              };
            });
            const a2pAccount = accountDataSource.map((i) => {
              return {
                account: i.account,
                method: i.method,
                protocol: i.protocol,
                captiveModel: i.captiveModel,
                tps: i.tps,
                ip: i.ip,
                accountSession: i.accountSession,
                specialConfiguration: i.specialConfiguration,
              };
            });
            dtoParams = {
              ...dtoParams,
              a2p: {
                a2p: {
                  quoteEmail: values.quoteEmail,
                  priceIncreaseNotice: values.priceIncreaseNotice,
                  creditLimit: values.creditLimit,
                  settlementCondition: values.settlementCondition,
                  settlementEmail: values.settlementEmail,
                  paymentDeadline: values.paymentDeadline,
                  sla: values.sla,
                  id: a2p?.id,
                },
                a2pAccount,
                a2pContacts,
              },
            };
          }

          const checkUndefinedField = attachment.some((item) => item.type === undefined);
          if (checkUndefinedField) {
            return notification.error({
              message: intl.get(`${prompt}.field.attachtype.verfy`).d('请补全公司附件中的附件类型'),
            });
          }

          dispatch({
            type: 'accessToSupplierHK/financeInfoDataSave',
            payload: {
              dto: dtoParams
            }
          }).then(res => {
            if(res) {
              this.saveBankInfoList((bankInfoRes) => {
                if(bankInfoRes) {
                  notification.success();
                  this.setState({
                    bankInfoDataSource: res?.banks || [],
                    bankAttachmentDataSource: res?.attachments || [],
                    contactTypeDataSource: res?.contacts || [],
                    accountDataSource: res?.accounts || [],
                    initialValue: res?.line,
                    a2p: res?.a2p
                  })
                  // const processType = ['Financial payments', '财务付款'].includes(supplierCategory) ? 'N' : 'Y';    // 采购 Y/ 非采购N
                  // 取最新的数据给致远
                  if (typeof callback === 'function') {
                    callback({ ...res, processType: processType });
                  }
                }
              })
            }
          });
        }
      });
    }
  }

  @Bind()
  handleBankInfoRowSelectionChange(keys, rows) {
    this.setState({
      bankInfoSelectRowKeys: keys,
      bankInfoSelectRows: rows,
    });
  }

  @Bind()
  handleBankAttachmentRowSelectionChange(keys, rows) {
    this.setState({
      bankAttachmentSelectRowKeys: keys,
      bankAttachmentSelectRows: rows,
    });
  }

  @Bind()
  handleContactRowSelectionChange(keys, rows) {
    this.setState({
      contactSelectRowKeys: keys,
      contactSelectRows: rows,
    });
  }

  @Bind()
  handleAccountRowSelectionChange(keys, rows) {
    this.setState({
      accountSelectRowKeys: keys,
      accountSelectRows: rows,
    });
  }

  // // 新增一行银行信息
  // @Bind()
  // handleAddBankInfoData() {
  //   const { bankInfoDataSource } = this.state;
  //   this.setState({
  //     bankInfoDataSource: [...bankInfoDataSource, {
  //       id: uuid(),
  //       _status: 'create',
  //       bankName: undefined,
  //       branchName: undefined,
  //       country: undefined,
  //       accountName: undefined,
  //       bankAccountName: undefined,
  //       interRemittanceNum: undefined,
  //       payerAddress: undefined,
  //       isMainAddress: 'N',
  //       addressStatus: undefined,
  //       payerCode: undefined,
  //       isMain: 'N',
  //       bankStatus: undefined
  //     }],
  //   });
  // }

  // // 删除一行银行信息
  // @Bind()
  // handleDelBankInfoData() {
  //   const { bankInfoDataSource = [], bankInfoSelectRows = [] } = this.state;
  //   this.setState({
  //     bankInfoDataSource: bankInfoDataSource.filter(r => bankInfoSelectRows.every(rd => rd.id !== r.id)),
  //     bankInfoSelectRowKeys: [],
  //     bankInfoSelectRows: []
  //   });
  // }

  // 新增一行银行附件信息
  @Bind()
  handleAddBankAttachmentData() {
    const { bankAttachmentDataSource } = this.state;
    this.setState({
      bankAttachmentDataSource: [
        ...bankAttachmentDataSource,
        {
          id: uuid(),
          _status: 'create',
          type: undefined,
          subType: undefined,
          description: undefined,
          // expirationDate: undefined,
          attachmentDate: undefined,
          attachmentUuid: uuid(),
          refType: 'bank',
        },
      ],
    });
  }

  // 删除一行银行附件信息
  @Bind()
  handleDelBankAttachmentData() {
    const { bankAttachmentDataSource = [], bankAttachmentSelectRows = [] } = this.state;
    this.setState({
      bankAttachmentDataSource: bankAttachmentDataSource.filter((r) =>
        bankAttachmentSelectRows.every((rd) => rd.id !== r.id)
      ),
      bankAttachmentSelectRowKeys: [],
      bankAttachmentSelectRows: [],
    });
  }

  // 新增一行a2p联系人信息
  @Bind()
  handleAddContactTypeData() {
    const { contactTypeDataSource } = this.state;
    this.setState({
      contactTypeDataSource: [
        ...contactTypeDataSource,
        {
          id: uuid(),
          _status: 'create',
          type: undefined,
          name: undefined,
          email: undefined,
          position: undefined,
          phone: undefined,
        },
      ],
    });
  }

  // 删除一行a2p联系人信息
  @Bind()
  handleDelContactTypeData() {
    const { contactTypeDataSource = [], contactSelectRows = [] } = this.state;
    this.setState({
      contactTypeDataSource: contactTypeDataSource.filter((r) =>
        contactSelectRows.every((rd) => rd.id !== r.id)
      ),
      contactSelectRowKeys: [],
      contactSelectRows: [],
    });
  }

  // 新增一行a2p账户信息
  @Bind()
  handleAddAccountData() {
    const { accountDataSource } = this.state;
    this.setState({
      accountDataSource: [
        ...accountDataSource,
        {
          id: uuid(),
          _status: 'create',
          account: undefined,
          method: undefined,
          protocol: undefined,
          captiveModel: undefined,
          tps: undefined,
          ip: undefined,
          accountSession: undefined,
          specialConfiguration: undefined,
        },
      ],
    });
  }

  // 删除一行a2p账户信息
  @Bind()
  handleDelAccountData() {
    const { accountDataSource = [], accountSelectRows = [] } = this.state;
    this.setState({
      accountDataSource: accountDataSource.filter((r) =>
        accountSelectRows.every((rd) => rd.id !== r.id)
      ),
      contactSelectRowKeys: [],
      accountSelectRows: [],
    });
  }

  // 银行信息表格
  @Bind()
  bankInfoColumns() {
    const { form, currentActivityCode, state, disabledEdit } = this.props;
    const disabled = currentActivityCode === 'CG03' || ['SENT', 'DONE'].includes(state);
    const supModifyState = this.props.accessToSupplierHK.previewData.head.supModifyState;
    const isEdit = ((!disabled && state !== 'DONE' && (!disabledEdit || supModifyState === 'Approved' )) || !disabledEdit);
    
    return [
      {
        title: intl.get(`${prompt}.field.opening.bank`).d('供应商开户行银行'),
        dataIndex: 'bankName',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(!isEdit) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`bankName${record.id}`, {
                initialValue: record?.bankName,
              })(
                <CusLov
                  style={{ width: '100%' }}
                  code="CMHK.API.BANKINFO"
                  lovOptions={{ displayField: 'bankName', valueField: 'id' }}
                  textValue={record?.bankName}
                  onChange={(e, lovData) => {
                    record.bankName = lovData.bankName;
                    record.branchName = lovData.bankBranchName;
                    record.country = lovData.bankCountryCode;
                    record.interRemittanceNum = lovData.swiftCode;
                    record.ebsBankId = lovData.ebsBankId; // ebs银行ID(handleSave也需要加)
                    record.ebsBranchId = lovData.ebsBranchId; // ebs分行ID(handleSave也需要加)
                  }}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.bank.branch.name`).d('分行名称'),
        dataIndex: 'branchName',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(!isEdit) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`branchName${record.id}`, {
                initialValue: record?.branchName,
              })(<CusInput style={{ width: '100%' }} onChange={(e) => (record.branchName = e)} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.country`).d('国家'),
        dataIndex: 'country',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(!isEdit) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`country${record.id}`, {
                initialValue: record?.country,
              })(
                <CusLov
                  style={{ width: '100%' }}
                  code="HPFM.COUNTRY"
                  onChange={(e) => (record.country = e)}
                  lovOptions={{ displayField: 'countryName', valueField: 'countryCode' }}
                  textField={`country${record.id}`}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.international.remittance.number`).d('国际汇款编号'),
        dataIndex: 'interRemittanceNum',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(!isEdit) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`interRemittanceNum${record.id}`, {
                initialValue: record?.interRemittanceNum,
              })(
                <CusInput
                  style={{ width: '100%' }}
                  onChange={(e) => (record.interRemittanceNum = e)}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.account.name`).d('账户名称'),
        dataIndex: 'accountName',
        width: 200,
        required: true,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(!isEdit) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`accountName${record.id}`, {
                initialValue: record?.accountName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.account.name`).d('账户名称'),
                    }),
                  },
                ],
              })(<CusInput style={{ width: '100%' }} onChange={(e) => (record.accountName = e)} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.bank.account`).d('银行账户'),
        dataIndex: 'bankAccountName',
        width: 200,
        required: true,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(!isEdit) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`bankAccountName${record.id}`, {
                initialValue: record?.bankAccountName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.bank.account`).d('银行账户'),
                    }),
                  },
                ],
              })(
                <CusInput
                  style={{ width: '100%' }}
                  onChange={(e) => (record.bankAccountName = e)}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.address.of.payment.recipient`).d('付款对象地址'),
        dataIndex: 'payerAddress',
        width: 200,
        required: true,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(!isEdit) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`payerAddress${record.id}`, {
                initialValue: record?.payerAddress,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${prompt}.field.address.of.payment.recipient`)
                        .d('付款对象地址'),
                    }),
                  },
                ],
              })(
                <CusInput style={{ width: '100%' }} onChange={(e) => (record.payerAddress = e)} />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.bank.primaryaddress`).d('是否主地址'),
        dataIndex: 'isMainAddress',
        width: 200,
        align: 'left',
        required: true,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          return (
            <Form.Item>
              {getFieldDecorator(`isMainAddress${record.id}`, {
                initialValue: record?.isMainAddress || 'N',
              })(<Checkbox checked={record.isMainAddress === 'Y'}
                           checkedValue="Y"
                           unCheckedValue="N"
                           onChange={(e) => {
                             this.setDefaultVal(e, record, 'isMainAddress')
                           }}
                           disabled={!isEdit}
              />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.bank.addresstatus`).d('地址状态'),
        dataIndex: 'addressStatus',
        width: 200,
        required: true,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(!isEdit) {
            return <>{record.addressStatusMeaning}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`addressStatus${record.id}`, {
                initialValue: record?.addressStatus,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.bank.addresstatus`).d('地址状态'),
                    }),
                  },
                ],
              })(
                <CusSelect
                  style={{ width: '100%' }}
                  lovCode="HKSP.SUP_ADDSTATUS"
                  onChange={(e) => (record.addressStatus = e)}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.payment.object.code`).d('付款对象代码'),
        dataIndex: 'payerCode',
        width: 200,
      },
      {
        title: intl.get(`${prompt}.field.master.account.or.not`).d('是否主账号'),
        dataIndex: 'isMain',
        align: 'left',
        width: 200,
        render: (_, record) => {
          const { getFieldDecorator } = form;
          return (
            <Form.Item>
              {getFieldDecorator(`isMain${record.id}`)(<Checkbox checked={record.isMain === 'Y'}
                                                                 checkedValue="Y"
                                                                 unCheckedValue="N"
                                                                 onChange={(e) => record.isMain = e.target.checked}
                                                                 disabled={!isEdit}
              />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.bank.status`).d('银行状态'),
        dataIndex: 'bankStatus',
        width: 200,
        required: true,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(!isEdit) {
            return <>{record.bankStatusMeaning}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`bankStatus${record.id}`, {
                initialValue: record?.bankStatus,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prompt}.field.bank.status`).d('银行状态'),
                    }),
                  },
                ],
              })(
                <CusSelect
                  style={{ width: '100%' }}
                  lovCode="HKSP.BANK_STATUS"
                  onChange={(e) => (record.bankStatus = e)}
                />
              )}
            </Form.Item>
          );
        },
      },
    ];
  }

  // 银行附件表格
  @Bind()
  bankAttachmentColumns() {
    const { accessToSupplierHK, tenantId, form, currentActivityCode, state, disabledEdit } = this.props;
    const disabled = currentActivityCode === 'CG03' || ['SENT', 'DONE'].includes(state);
    const supModifyState = this.props.accessToSupplierHK.previewData.head.supModifyState;
    const isEdit = ((!disabled && state !== 'DONE' && (!disabledEdit || supModifyState === 'Approved' )) || !disabledEdit);

    const { fileCascader = [] } = accessToSupplierHK;
    return [
      {
        title: intl.get(`${prompt}.field.attachment.info.upload`).d('附件上传'),
        width: 200,
        dataIndex: 'attachmentUuid',
        render: (_, record, index) => {
          const { getFieldDecorator } = form;
          return (
            <Form.Item>
              {getFieldDecorator(`attachmentUuid${record.id}`, {
                initialValue: record?.attachmentUuid,
              })(<CusUpload
                viewOnly={!isEdit}
                filePreview
                bucketName="private-bucket"
                tenantId={tenantId}
                attachmentUUID={record?.attachmentUuid}
                onUploadSuccess={() => {
                  const arr = this.state.bankAttachmentDataSource;
                  arr[index].attachmentDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
                  arr[index].attachmentUuid = record.attachmentUuid;
                  this.setState({
                    bankAttachmentDataSource: arr
                  })
                }}
              />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.attachment.type`).d('附件类型'),
        width: 200,
        render: (_, record) => {
          const { getFieldDecorator } = form;
          const { type, subType } = record;
          const data = [type, subType];
          if(!isEdit) {
            return <>{record.typeMeaning + '/' + record.subTypeMeaning}</>
          }
          if (record?._status === 'create') {
            return (
              <Form.Item>
                {getFieldDecorator(`type${record.id}`)(
                  <CusCascader
                    fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
                    options={fileCascader.filter((i) => i.tag === 'bank')}
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
                  options={fileCascader.filter((i) => i.tag === 'bank')}
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
        },
      },
      {
        title: intl.get(`${prompt}.field.attachment.info.description`).d('附件描述'),
        dataIndex: 'description',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(!isEdit) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`description${record.id}`, {
                initialValue: record.description,
              })(<CusInput style={{ width: '100%' }} onChange={(e) => (record.description = e)} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.attachment.info.last.update.time`).d('最后更新时间'),
        dataIndex: 'attachmentDate',
        required: true,
        width: 200,
      },
    ];
  }

  // a2p表格
  @Bind()
  contactTypeColumns() {
    const { form, currentActivityCode, state } = this.props;
    const disabled = currentActivityCode === 'CG03' || ['SENT', 'DONE'].includes(state);
    return [
      {
        title: intl.get(`${prompt}.field.a2p.supplier.contact.type`).d('A2P业务联系人类型'),
        dataIndex: 'type',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if (disabled) {
            return <>{record.typeMeaning}</>;
          }
          return (
            <Form.Item>
              {getFieldDecorator(`type${record.id}`, {
                initialValue: record.type,
              })(
                <CusSelect
                  style={{ width: '100%' }}
                  lovCode="HKSP.A2P_CONTACT_TYPE"
                  onChange={(e) => (record.type = e)}
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.a2p.contact.person.name`).d('A2P业务联系人姓名'),
        dataIndex: 'name',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if (disabled) {
            return <>{value}</>;
          }
          return (
            <Form.Item>
              {getFieldDecorator(`name${record.id}`, {
                initialValue: record.name,
              })(<CusInput style={{ width: '100%' }} onChange={(e) => (record.name = e)} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.a2p.contact.mailbox`).d('A2P业务联系人邮箱'),
        dataIndex: 'email',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if (disabled) {
            return <>{value}</>;
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
              })(<CusInput style={{ width: '100%' }} onChange={(e) => (record.email = e)} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.a2p.contact.position`).d('A2P业务联系人职位'),
        dataIndex: 'position',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if (disabled) {
            return <>{value}</>;
          }
          return (
            <Form.Item>
              {getFieldDecorator(`position${record.id}`, {
                initialValue: record.position,
              })(<CusInput style={{ width: '100%' }} onChange={(e) => (record.position = e)} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.a2p.contact.phone.number`).d('A2P业务联系人电话'),
        dataIndex: 'phone',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if (disabled) {
            return <>{value}</>;
          }
          return (
            <Form.Item>
              {getFieldDecorator(`phone${record.id}`, {
                initialValue: record.phone,
              })(<CusInput style={{ width: '100%' }} onChange={(e) => (record.phone = e)} />)}
            </Form.Item>
          );
        },
      },
    ];
  }

  // 账号表格
  @Bind()
  accountColumns() {
    const { form, currentActivityCode, state } = this.props;
    const disabled = currentActivityCode === 'CG03' || ['SENT', 'DONE'].includes(state);
    return [
      {
        title: intl.get(`${prompt}.field.a2p.access.account`).d('接入账号'),
        dataIndex: 'account',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if (disabled) {
            return <>{value}</>;
          }
          return (
            <Form.Item>
              {getFieldDecorator(`account${record.id}`, {
                initialValue: record.account,
              })(<CusInput style={{ width: '100%' }} onChange={(e) => (record.account = e)} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.a2p.access.method`).d('接入方式'),
        dataIndex: 'method',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if (disabled) {
            return <>{value}</>;
          }
          return (
            <Form.Item>
              {getFieldDecorator(`method${record.id}`, {
                initialValue: record.method,
              })(
                <CusSelect
                  style={{ width: '100%' }}
                  onChange={(e) => (record.method = e)}
                  lovCode="HKSP.ACCESS_METHOD"
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.a2p.protocol`).d('Protocol'),
        dataIndex: 'protocol',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if (disabled) {
            return <>{value}</>;
          }
          return (
            <Form.Item>
              {getFieldDecorator(`protocol${record.id}`, {
                initialValue: record.protocol,
              })(
                <CusSelect
                  style={{ width: '100%' }}
                  onChange={(e) => (record.protocol = e)}
                  lovCode="HKSP.PROTOCOL"
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.a2p.settlement.mode`).d('结算模式'),
        dataIndex: 'captiveModel',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if (disabled) {
            return <>{value}</>;
          }
          return (
            <Form.Item>
              {getFieldDecorator(`captiveModel${record.id}`, {
                initialValue: record.captiveModel,
              })(
                <CusSelect
                  style={{ width: '100%' }}
                  onChange={(e) => (record.captiveModel = e)}
                  lovCode="HKSP.SETTLE_MODE"
                />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.a2p.tps`).d('TPS'),
        dataIndex: 'tps',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if (disabled) {
            return <>{value}</>;
          }
          return (
            <Form.Item>
              {getFieldDecorator(`tps${record.id}`, {
                initialValue: record.tps,
              })(<CusInput style={{ width: '100%' }} onChange={(e) => (record.tps = e)} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.a2p.ip`).d('IP'),
        dataIndex: 'ip',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if (disabled) {
            return <>{value}</>;
          }
          return (
            <Form.Item>
              {getFieldDecorator(`ip${record.id}`, {
                initialValue: record.ip,
              })(<CusInput style={{ width: '100%' }} onChange={(e) => (record.ip = e)} />)}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.a2p.session`).d('Session'),
        dataIndex: 'accountSession',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if (disabled) {
            return <>{value}</>;
          }
          return (
            <Form.Item>
              {getFieldDecorator(`accountSession${record.id}`, {
                initialValue: record.accountSession,
              })(
                <CusInput style={{ width: '100%' }} onChange={(e) => (record.accountSession = e)} />
              )}
            </Form.Item>
          );
        },
      },
      {
        title: intl.get(`${prompt}.field.a2p.special.configuration.instructions`).d('特殊配置说明'),
        dataIndex: 'specialConfiguration',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if (disabled) {
            return <>{value}</>;
          }
          return (
            <Form.Item>
              {getFieldDecorator(`specialConfiguration${record.id}`, {
                initialValue: record.specialConfiguration,
              })(
                <CusInput
                  style={{ width: '100%' }}
                  onChange={(e) => (record.specialConfiguration = e)}
                />
              )}
            </Form.Item>
          );
        },
      },
    ];
  }

  // dict获取数据入口
  @Bind()
  initDictDate() {
    const { dispatch } = this.props.props.props;
    const { companyName, registrationNumber } = this.props;
    dispatch({
      type: 'accessToSupplierHK/initDictDate',
      payload: {
        cmpanyName: companyName,
        businessRegistration: registrationNumber,
      },
    }).then((res) => {
      if (!isEmpty(res)) {
        this.setState({
          partnerId: res?.partnerId,
        });
        this.queryDictBankInfo();
      }
    });
  }

  // 查询DICT银行信息
  @Bind()
  queryDictBankInfo() {
    const { dispatch } = this.props.props.props;
    const { partnerId } = this.state;
    dispatch({
      type: 'accessToSupplierHK/queryConvertSupplierInfo',
      payload: {
        partnerId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          bankInfoDataSource: [
            {
              ...res,
              _status: 'update',
              id: uuid(),
              bankName: res.depositBank,
              branchName: undefined,
              interRemittanceNum: res.interRemittanceNum,
              accountName: res.accountName,
              bankAccountName: res.account,
              payerAddress: undefined,
              isMainAddress: 'N',
              addressStatus: undefined,
              payerCode: undefined,
              isMain: 'N',
              bankStatus: undefined,
            },
          ],
        });
      }
    });
  }

  // 删除银行地址信息
  handleDelAddressBankData = () => {
    const { dispatch, accessToSupplierHK } = this.props;
    const { addressBankInfoDataSource = [] } = accessToSupplierHK;
    const { selectedRowKeysAddressBank, selectedRowsAddressBank } = this.state;
    if(selectedRowKeysAddressBank.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        const deleteData = addressBankInfoDataSource.filter(
          (item) => selectedRowKeysAddressBank.includes(item['rowKey']) && item._status !== 'create'
        );
        if (deleteData.length > 0) {
          // 后台删除
          dispatch({
            type: 'accessToSupplierHK/deleteAddressBankInfoLine',
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
            type: 'accessToSupplierHK/updateState',
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
    const { accessToSupplierHK, dispatch, initialValues } = this.props;
    const { supplierId, formRecordId } = queryString.parse(this.props.props.props.location.search.substring(1));

    console.log('this.props', this.props);
    
    const {
      addressBankInfoDataSource = [],
    } = accessToSupplierHK;

    // 判断是否已有主地址
    const hasMainAddress = addressBankInfoDataSource.some(item => item.isMainAddress === 'Y');
    const newIsMainAddress = hasMainAddress ? 'N' : 'Y';

    const newDataSource = [
      ...addressBankInfoDataSource,
      {
        payerAddress: initialValues.addressEn, // 默认公司地址英文
        payerAccountName: initialValues.companyNameEn, // 默认公司名称英文
        isMainAddress: newIsMainAddress, // 默认主地址
        addressStatus: 'Y', // 默认生效
        isMainAddressFlagY: 'N', // 保存时用来判断的主地址
        _status: 'create',
        rowKey: uuid(),
        refSupId: supplierId || formRecordId,
      }
    ];

    dispatch({
      type: 'accessToSupplierHK/updateState',
      payload: {
        addressBankInfoDataSource: newDataSource,
      },
    })
  }

  // 删除银行明细信息
  handleDelBankData = () => {
    const { dispatch, accessToSupplierHK } = this.props;
    const { bankInfoListDataSource = [] } = accessToSupplierHK;
    const { selectedRowKeysBank, selectedRowsBank } = this.state;
    if(selectedRowKeysBank.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        const deleteData = bankInfoListDataSource.filter(
          (item) => selectedRowKeysBank.includes(item['rowKey']) && item._status !== 'create'
        );
        if (deleteData.length > 0) {
          // 后台删除
          dispatch({
            type: 'accessToSupplierHK/deleteBankInfoLine',
            payload: deleteData.map((item) => String(item.id))
          }).then((res) => {
            if(res) {
              CusNotification.success({
                message: intl.get('hzero.common.notification.success.delete').d('删除成功')
              })
              const newDataSource = bankInfoListDataSource.filter((item) => !selectedRowKeysBank.includes(item['rowKey']));
              dispatch({
                type: 'accessToSupplierHK/updateState',
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
            type: 'accessToSupplierHK/updateState',
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
    const { accessToSupplierHK, dispatch, initialValues } = this.props;

    const { addressBankRecord = {} } = this.state;

    console.log('this.props', this.props);
    
    const {
      bankInfoListDataSource = [],
    } = accessToSupplierHK;

    // 将所有现有账号的 isMain 设为 N
    const updatedDataSource = bankInfoListDataSource.map(item => ({ ...item, isMain: 'N', bankStatus: 'N' }));

    const newDataSource = [
      ...updatedDataSource.map((item) => ({
        ...item,
        bindBankId: addressBankRecord.rowKey,
      })),
      {
        accountName: initialValues.companyNameEn, // 默认公司名称英文
        isMain: 'Y', // 默认主账号
        bankStatus: 'Y', // 默认生效
        _status: 'create',
        rowKey: uuid(),
        bindBankId: addressBankRecord.rowKey,
        refHeadId: addressBankRecord.id,
      }
    ];

    dispatch({
      type: 'accessToSupplierHK/updateState',
      payload: {
        bankInfoListDataSource: newDataSource,
      },
    })
  }

  render() {
    const gridSpan = {
      xs: 12,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12,
      xxl: 12,
    };
    const {
      activeKey,
      bankInfoDataSource,
      bankAttachmentDataSource,
      contactTypeDataSource,
      accountDataSource,
      bankInfoSelectRowKeys,
      bankAttachmentSelectRowKeys,
      contactSelectRowKeys,
      accountSelectRowKeys,
      showA2pInfo,
      initialValue,
      a2p,
      selectedRowKeysAddressBank,
      selectedRowKeysBank,
      isShowBankInfo = false,
    } = this.state;
    const { form: { getFieldDecorator }, currentActivityCode, state, disabledEdit, queryBankInfoListLoading = false, saveBankLoading = false, bankInfoExportLoading = false } = this.props;

    const supModifyState = this.props.accessToSupplierHK.previewData.head.supModifyState;

    console.log('disabledEdit', disabledEdit);
    console.log('initialValue', initialValue);
    console.log('this.props', this.props);
    
    const disabled = currentActivityCode === 'CG03' || ['SENT', 'DONE'].includes(state);
    const bankInfoColumns = this.bankInfoColumns();
    const bankAttachmentColumns = this.bankAttachmentColumns();
    const contactTypeColumns = this.contactTypeColumns();
    const accountColumns = this.accountColumns();
    const a2pFormProps = {
      ...this.props,
      initialValue: a2p,
      disabled: disabled || state === 'DONE',
    };


  // 可编辑场景
    /**
     * 1.当前登录人=业务员，且状态为草稿（!disabledEdit）
     * 2.当前登录人=业务员，且状态为已审批（!disabledEdit || supModifyState === 'Approved'）
     * 3.
    */
   const isEdit = ((!disabled && state !== 'DONE' && (!disabledEdit || supModifyState === 'Approved' )) || !disabledEdit);

    const addressBankInfoColumnsRowSelection = {
      selectedRowKeysAddressBank,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeysAddressBank: keys,
          selectedRowsAddressBank: rows,
        });
      },
      getCheckboxProps: record => ({
        disabled: disabled || record.uploadErpStatus === 'Y',
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
        disabled: disabled || record.uploadErpStatus === 'Y',
      }),
    };

    const addressBankInfoProps = {
      ...this.props,
      addressBankInfoColumnsRowSelection,
      handleBankInfoList: this.handleBankInfoList,
      disabled: !isEdit,
    }

    const bankInfoProps = {
      ...this.props,
      bankInfoColumnsRowSelection,
      disabled: !isEdit,
    }
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
                title={intl.get(`${prompt}.view.title.basic.information`).d('基本信息')}
                arrowActive={activeKey.includes('basic')}
              />
            }
            key="basic"
          >
            <div className="customize-form">
              <Row gutter={24}>
                <Col {...gridSpan}>
                  <Form.Item label={intl.get(`${prompt}.field.a2p.supplier`).d('A2P供应商')}>
                    {getFieldDecorator('isA2p', {
                      rules: [{
                        required: true,
                      }],
                      initialValue: initialValue?.isA2p || 'N'
                    })(<CusSelect disabled={!isEdit} style={{ width: '100%' }}
                                  lovCode="HKSP.A2P_SUPLIER" onChange={this.handleSelectA2p} />)}
                  </Form.Item>
                </Col>
                <Col {...gridSpan}>
                  <Form.Item
                    label={intl.get(`${prompt}.field.relatedtranstparty`).d('是否为关联交易方')}
                  >
                    {getFieldDecorator('isRelatedTrader', {
                      initialValue: initialValue?.isRelatedTrader || 'N'
                    })(<CusSelect disabled={!isEdit} style={{ width: '100%' }}
                                  lovCode="HKSP.SUP_ASSOCIATED_PARTY" />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col {...gridSpan}>
                  <Form.Item label={intl.get(`${prompt}.field.liabilityaccount`).d('负债账户')}>
                    {getFieldDecorator('liabilityAccount', {
                      initialValue: initialValue?.liabilityAccount || '2121800001'
                    })(<CusInput disabled={!isEdit} />)}
                  </Form.Item>
                </Col>
                <Col {...gridSpan}>
                  <Form.Item label={intl.get(`${prompt}.field.communicatsection`).d('往来段')}>
                    {getFieldDecorator('dealings', {
                      initialValue: initialValue?.dealings
                    })(<CusInput disabled={!isEdit} />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col {...gridSpan}>
                  <Form.Item
                    label={intl.get(`${prompt}.field.controlledbudget`).d('是否受关联预算控制')}
                  >
                    {getFieldDecorator('isRelatedBudget', {
                      initialValue: initialValue?.isRelatedBudget || 'N'
                    })(<CusSelect disabled={!isEdit} style={{ width: '100%' }}
                                  lovCode="HKSP.SUP_ASSOBUDG_CON" />)}
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </Panel>
          {/* <Panel
            data-border={false}
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.bank.info`).d('银行信息')}
                arrowActive={activeKey.includes('bank')}
                buttons={
                  <>
                    {isEdit && <CusButton mini
                                          onClick={this.handleDelBankInfoData}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>}
                    {isEdit && <CusButton mini type='primary'
                                          onClick={this.handleAddBankInfoData}>{intl.get('hzero.common.button.add').d('新增')}</CusButton>}
                  </>
                }
              />
            }
            key="bank"
          >
            <p>
              {intl
                .get(`${prompt}.view.title.bank.info.label`)
                .d('提示: 若开户银行选不到，可暂默认选择“Dummy”。')}
            </p>
            <EditTable
              bordered
              pagination={false}
              dataSource={bankInfoDataSource}
              columns={bankInfoColumns}
              rowSelection={{
                selectedRowKeys: bankInfoSelectRowKeys,
                onChange: this.handleBankInfoRowSelectionChange,
                getCheckboxProps: () => ({
                  disabled: disabled,
                }),
              }}
              rowKey="id"
            />
          </Panel> */}
          <Panel
            key="bank"
            data-border={false}
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
                    {isEdit && <div>
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
          >
            <AddressBankInfoList {...addressBankInfoProps} />
            {isShowBankInfo && <div>
              <CusSpin spinning={queryBankInfoListLoading}>
                <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', margin: ' 16px 0' }}>
                  { false &&<p>{intl.get(`${prompt}.view.title.bank.info.label`).d('提示: 若开户银行选不到，可暂默认选择“Dummy”。')}</p>}
                  {isEdit && <div style={{ marginRight: '32px'}}>
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
            data-border={false}
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.bank.attachment`).d('银行附件')}
                arrowActive={activeKey.includes('bankAttachment')}
                buttons={
                  <>
                    {isEdit && <CusButton mini
                                          onClick={this.handleDelBankAttachmentData}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>}
                    {isEdit && <CusButton mini type='primary'
                                          onClick={this.handleAddBankAttachmentData}>{intl.get('hzero.common.button.add').d('新增')}</CusButton>}
                  </>
                }
              />
            }
            key="bankAttachment"
          >
            <p>
              {intl
                .get(`${prompt}.view.title.back.attachment.tips`)
                .d('提示: 必须上传银行的相关证明文件。')}
            </p>
            <EditTable
              bordered
              pagination={false}
              dataSource={bankAttachmentDataSource}
              columns={bankAttachmentColumns}
              rowSelection={{
                selectedRowKeys: bankAttachmentSelectRowKeys,
                onChange: this.handleBankAttachmentRowSelectionChange,
                getCheckboxProps: () => ({
                  disabled: disabled,
                }),
              }}
              rowKey="id"
            />
          </Panel>
          {showA2pInfo && (
            <Panel
              data-border={false}
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.a2p.info`).d('A2P信息')}
                  arrowActive={activeKey.includes('a2pInfo')}
                />
              }
              key="a2pInfo"
            >
              <A2pForm {...a2pFormProps} />
              <div style={{ textAlign: 'right', marginTop: '16px', marginBottom: '16px' }}>
                {!disabled && state !== 'DONE' && (
                  <CusButton mini onClick={this.handleDelContactTypeData}>
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </CusButton>
                )}
                {!disabled && state !== 'DONE' && (
                  <CusButton mini type="primary" onClick={this.handleAddContactTypeData}>
                    {intl.get('hzero.common.button.add').d('新增')}
                  </CusButton>
                )}
              </div>
              <EditTable
                bordered
                pagination={false}
                dataSource={contactTypeDataSource}
                columns={contactTypeColumns}
                rowSelection={{
                  selectedRowKeys: contactSelectRowKeys,
                  onChange: this.handleContactRowSelectionChange,
                  getCheckboxProps: () => ({
                    disabled: disabled,
                  }),
                }}
                rowKey="id"
              />
              <div style={{ textAlign: 'right', marginTop: '16px', marginBottom: '16px' }}>
                {!disabled && state !== 'DONE' && (
                  <CusButton mini onClick={this.handleDelAccountData}>
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </CusButton>
                )}
                {!disabled && state !== 'DONE' && (
                  <CusButton mini type="primary" onClick={this.handleAddAccountData}>
                    {intl.get('hzero.common.button.add').d('新增')}
                  </CusButton>
                )}
              </div>
              <EditTable
                bordered
                pagination={false}
                dataSource={accountDataSource}
                columns={accountColumns}
                rowSelection={{
                  selectedRowKeys: accountSelectRowKeys,
                  onChange: this.handleAccountRowSelectionChange,
                  getCheckboxProps: () => ({
                    disabled: disabled,
                  }),
                }}
                rowKey="id"
              />
            </Panel>
          )}
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
