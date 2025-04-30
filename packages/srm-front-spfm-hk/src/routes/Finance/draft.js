/**
 * 供应商财务信息 - 财务信息变更单（草稿）
 * @Author: qi.xue01@hand-china.com
 * @Date: 2023/9/18
 * @Copyright: Copyright (c), 2023, hand
 */
import React, { Component } from 'react';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import { Col, Collapse, Row } from 'antd';
const { Panel } = Collapse;
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { Form } from 'hzero-ui';
import CusButton from '_cus_components/CusButton';
import CusInput from '_cus_components/CusInput';
import CusSpin from '_cus_components/CusSpin';
import CusModal from '_cus_components/CusModal';
import CusNotification from '_cus_components/CusNotification';
import BankTable from '@/routes/Finance/components/BankTable';
import AttachmentTable from '@/routes/Finance/components/AttachmentTable';
import HeaderForm from '@/routes/Finance/components/HeaderForm';
import { connect } from 'dva';
import queryString from 'querystring';
import { getCurrentOrganizationId, getCurrentUser, getEditTableData } from 'utils/utils';
import uuid from 'uuid/v4';
import EditTable from '_cus_components/EditTable';
import CusSelect from '_cus_components/CusSelect';
import notification from '_cus_components/CusNotification';
import dayjs from 'dayjs';
import { EMAIL } from 'utils/regExp';
import AddressBankInfoList from './AddressBankInfoList';
import BankInfoList from './BankInfoList';

const prompt = 'spfmhk.supplier';
@Form.create()
@connect(({ supplierHK, loading }) => ({
  supplierHK,
  financeUpdateInfo: supplierHK.financeUpdateInfo || {},
  loading: loading.effects['supplierHK/financeUpdateInfoDetail'],
  queryBankInfoListLoading: loading.effects['supplierHK/getBankInfoList'] ||
  loading.effects['supplierHK/getEditBankInfoList'],
  saveBankLoading: loading.effects['supplierHK/saveEditBankInfoList'],
  bankInfoExportLoading: loading.effects['supplierHK/bankInfoExport'],
  bankInfoEditExportLoading: loading.effects['supplierHK/bankInfoEditExport'],
  tenantId: getCurrentOrganizationId(),
  currentUser: getCurrentUser()
}))
export default class Draft extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: ['basicInfo', 'bank', 'bankAttachment', 'a2pInfo'],
      isPub: props.location.pathname.includes('/pub'), // 判断是否为pub页面
      bankInfoDataSource: [], // 银行信息Table data
      bankInfoSelectRowKeys: [],
      bankInfoSelectRows: [],
      bankInfoRemove: [],
      attachmentDataSource: [], // 附件信息Table data
      attachmentSelectRowKeys: [],
      attachmentSelectRows: [],
      attachmentRemove: [], // 附件信息删除data
      a2pContactDataSource: [], // 附件信息Table data
      a2pContactSelectRowKeys: [],
      a2pContactSelectRows: [],
      a2pContactRemove: [], // 附件信息删除data
      a2pAccountDataSource: [], // 附件信息Table data
      a2pAccountSelectRowKeys: [],
      a2pAccountSelectRows: [],
      a2pAccountRemove: [], // 附件信息删除data
      isA2p: 'N',
      loading: false,
      disabled: false,
      selectedRowKeysAddressBank: [],
      selectedRowsAddressBank: [],
      selectedRowKeysBank: [],
      selectedRowsBank: [],
    }
    this.platform = {};
    this.handleBankChange = this.handleBankChange.bind(this);
    this.handleAttachmentChange = this.handleAttachmentChange.bind(this);
  }

  componentDidMount() {
    const { formRecordId } = queryString.parse(location.search.substring(1));
    this.init();
    this.listener();
    if(formRecordId !== 'null') {
      this.handleEditIdAddressBankInfoList();
    } else {
      this.handleSupplierIdAddressBankInfoList();
    }
  }

  // 供应商id查询银行信息
  @Bind()
  handleSupplierIdAddressBankInfoList() {
    const {
      dispatch,
      location: { search },
    } = this.props;
    const { id } = queryString.parse(search.substring(1));
    dispatch({
      type: 'supplierHK/getAddressBankInfoList',
      payload: {
        supplierId: id,
      }
    }).then((res) => {
      if(res) {
        debugger
        const newDataSource = res?.map((item) => ({
          ...item,
          isMainAddressFlagY: item?.isMainAddress === 'Y' ? 'Y' : 'N', // 保存时用来判断的主地址
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

  // 变更id查询银行信息
  @Bind()
  handleEditIdAddressBankInfoList(refSupEditId) {
    const {
      dispatch,
      location: { search },
    } = this.props;
    const { formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'supplierHK/getEditAddressBankInfoList',
      payload: {
        supplierId: refSupEditId || formRecordId,
      }
    }).then((res) => {
      if(res) {
        debugger
        const newDataSource = res?.map((item) => ({
          ...item,
          isMainAddressFlagY: item?.isMainAddress === 'Y' ? 'Y' : 'N', // 保存时用来判断的主地址
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
      location: { search },
    } = this.props;
    const { formRecordId } = queryString.parse(search.substring(1));
    if(record?.id) {
      dispatch({
        type: record?.refSupEditId ? 'supplierHK/getEditBankInfoList' :'supplierHK/getBankInfoList',
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

  // 供应商Id银行信息导出
  @Bind()
  handleExport() {
    const {
      dispatch,
      location: { search },
      } = this.props;
      const { id } = queryString.parse(search.substring(1));
    dispatch({
      type: 'supplierHK/bankInfoExport',
      payload: {
        supplierId: id,
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

  // 变更Id银行信息导出
  @Bind()
  handleEditExport() {
    const {
      dispatch,
      location: { search },
      } = this.props;
    const { formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'supplierHK/bankInfoEditExport',
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

  @Bind()
  handleBankChange(data = []) {
    this.setState({ bankInfoDataSource: data });
  }

  @Bind()
  handleAttachmentChange(data = []) {
    this.setState({ attachmentDataSource: data });
  }

  // 致远流程
  @Bind()
  listener() {
    const { location: { search } } = this.props;
    const { formRecordId } = queryString.parse(search.substring(1));
    // 审批流程监听
    top?.postMessage({ hasListener: true }, '*');
    window.addEventListener('message', (e) => {
      if(e.data.messageType === 'GET_FORM_DATA') {
        // 监听了流程的发送，处理等操作,操作完成后，需要发送postMessage通知父页面
        // 提交 保存 退回 撤回 知会 会签 查看流程
        if(['SUBMIT', 'DRAFT_HANDLE', 'BACK', 'UNDO', 'NOTICE', 'GIVE'].includes(e.data.submitType)) {
          this.handleSave((params) => {
            if(params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                actionInfo: {
                  preventClose: e.data.submitType === 'DRAFT_HANDLE' // 阻止页面关闭
                },
                formData: {
                  formRecordId: params?.editHead?.id || formRecordId,//表单记录id（Long）
                  //下面内容为表单数据
                  ...params,
                }
              }, e.data.url)
            }
          });
        } else {
          this.handleSave((params) => {
            if(params) {
              top?.postMessage({
                success: true, //表单数据验证成功或不需要验证时传true，否则传false
                submitType: e.data.submitType,//将此字段值回传
                messageType: 'GET_FORM_DATA', //获取表单数据消息
                actionInfo: {
                  preventClose: e.data.submitType === 'DRAFT_HANDLE' // 阻止页面关闭
                },
                formData: {
                  formRecordId: params?.editHead?.id || formRecordId,//表单记录id（Long）
                  //下面内容为表单数据
                  ...params,
                }
              }, e.data.url)
            }
          });
        }
      }
    })
  }

  @Bind()
  init() {
    const { location: { search }, dispatch } = this.props;
    const { applyNumber, id, formRecordId, state, permissionType } = queryString.parse(search.substring(1));
    console.log(state, !['READY', 'PENDING'].includes(state), permissionType !== 'SEND');
    console.log(!['READY', 'PENDING'].includes(state) || permissionType !== 'SEND',)
    if(state && permissionType) {
      this.setState({
        disabled: (!['READY', 'PENDING'].includes(state) || permissionType !== 'SEND') // 退回单、草稿单可编辑
      })
    } else {
      // 新增没有state和permissionType
      this.setState({
        disabled: false
      })
    }
    if(applyNumber || formRecordId !== 'null') {
      this.queryFinanceUpdateInfoDetail();
    }
    if(id && formRecordId === 'null') {
      dispatch({
        type: 'supplierHK/newFinanceSupplierInfo',
        payload: {
          supplierId: id
        }
      }).then(res => {
        if(res) {
          this.setState({
            bankInfoDataSource: res.banks || [],
            attachmentDataSource: res.attachments || [],
            a2pContactDataSource: res.a2pAll?.a2pCtsEdits || [],
            a2pAccountDataSource: res.a2pAll?.a2pAccEdits || [],
            isA2p: res?.isA2p
          })
          console.log(res?.isA2p, 'isA2p');
        }
      })
    }
    dispatch({
      type: 'supplierHK/init',
    })
  }

  /**
   * 查询供应商财务信息更新单详情
   */
  @Bind()
  queryFinanceUpdateInfoDetail() {
    const { location: { search }, dispatch } = this.props;
    const { applyNumber, formRecordId } = queryString.parse(search.substring(1));
    dispatch({
      type: 'supplierHK/financeUpdateInfoDetail',
      payload: {
        applyNumber: applyNumber || formRecordId
      }
    }).then(res => {
      if(res) {
        this.handleAttachmentChange(res?.attachments || []);
        this.handleBankChange(res?.banks || []);
        this.setState({
          isA2p: res?.editHead?.isA2p,
          a2pContactDataSource: res.a2pAll?.contacts || [],
          a2pAccountDataSource: res.a2pAll?.account || [],
        })
      }
    })
  }

  // 保存银行信息
  @Bind()
  saveAllBankInfoList() {
    const { dispatch, supplierHK, financeUpdateInfo, location: { search } } = this.props;
    const { id, formRecordId } = queryString.parse(search.substring(1));
    debugger
    const {
      addressBankInfoDataSource = [],
      bankInfoListDataSource = []
    } = supplierHK;
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
      id: item?.refSupEditId ? (item.id) : (formRecordId === 'null' ? null : item.id),
      isMainAddress: (allMainAddressN && item.isMainAddressFlagY === "Y") || item.isMainAddress === 1 ? "Y" : item.isMainAddress,
      bankLine: bankValidateData?.filter((bankItem) => (bankItem.bindBankId === item.rowKey) || (bankItem.refHeadId === item.id))
      .map((delItem) => {
        // 如果是供应商Id的话（id）,需要把银行信息中的行列表中的refHeadId删除掉
        if(!(item?.refSupEditId) && formRecordId === 'null') {
          const { id, ...rest } = delItem;  // 解构并删除 id 字段
          return { ...rest };  // 返回没有 id 的对象
        }
        return {
          ...delItem,
          isMain: delItem?.isMain === 1 || delItem?.isMain === 'Y' ? 'Y' : delItem.isMain,
        };
      })
    }))
    if((newBankOrAddressInfoList.length > 0 && bankValidateData.length > 0) || (newBankOrAddressInfoList.length > 0 && bankInfoListDataSource.length === 0)) {
      console.log('addressBankValidateData', addressBankValidateData);
      console.log('bankValidateData', bankValidateData);
      console.log('newBankOrAddressInfoList', newBankOrAddressInfoList);
      const {
        bankInfoDataSource,
        attachmentDataSource,
        a2pContactDataSource,
        a2pAccountDataSource,
        isA2p
      } = this.state;
      const { dispatch, location: { search }, financeUpdateInfo, form: { getFieldValue } } = this.props;
      const { id } = queryString.parse(search.substring(1));
      const values = this.platform.props.form.getFieldsValue();
      const headEdit = {
        editReason: values.editReason,
        refSupHeadId: id || financeUpdateInfo?.editHead?.refSupHeadId,
        applyNumber: values.applyNumber,
        applyStatus: values.applyStatus,
        supplierNumber: values.supplierNumber,
        companyNameEn: values.companyNameEn,
        companyNameCh: values.companyNameCh,
        applyDate: dayjs.isDayjs(values.applyDate)
          ? values.applyDate.format("YYYY-MM-DD 00:00:00")
          : undefined,
        applyUser: values.applyUser,
        id: financeUpdateInfo?.editHead?.id
      };
      const bank = bankInfoDataSource?.map(i => {
        return {
          bankName: i.bankName,
          branchName: i.branchName,
          country: i.country,
          accountName: i.accountName,
          bankAccountName: i.bankAccountName,
          interRemittanceNum: i.interRemittanceNum,
          payerAddress: i.payerAddress,
          isMainAddress: i.isMainAddress,
          addressStatus: i.addressStatus,
          payerCode: i.payerCode,
          isMain: i.isMain,
          bankStatus: i.bankStatus,
          uploadErpStatus: i?.uploadErpStatus === 'Y' ? 'Y' : 'N',
          ebsBankId: i.ebsBankId,
          ebsBranchId: i.ebsBranchId,
        }
      });
      const attachment = attachmentDataSource?.map(i => {
        return {
          type: i.type,
          subType: i.subType,
          description: i.description,
          expirationDate: dayjs.isDayjs(i.expirationDate)
            ? i.expirationDate.format("YYYY-MM-DD 00:00:00")
            : dayjs(i.expirationDate).format('YYYY-MM-DD 00:00:00'),
          attachmentDate: dayjs.isDayjs(i.attachmentDate)
            ? i.attachmentDate.format("YYYY-MM-DD HH:mm:ss")
            : undefined,
          attachmentUuid: i.attachmentUuid,
          uploadErpStatus: i?.uploadErpStatus === 'Y' ? 'Y' : 'N'
        }
      })
      const a2pEditContact = a2pContactDataSource.map(i => {
        return {
          type: i.type,
          name: i.name,
          email: i.email,
          position: i.position,
          phone: i.phone
        }
      })
      const a2pEditAccount = a2pAccountDataSource.map(i => {
        return {
          account: i.account,
          method: i.method,
          protocol: i.protocol,
          captiveModel: i.captiveModel,
          tps: i.tps,
          ip: i.ip,
          accountSession: i.accountSession,
          specialConfiguration: i.specialConfiguration
        }
      });
      const a2p = {
        a2pEdit: {
          quoteEmail: getFieldValue('quoteEmail'),
          priceIncreaseNotice: getFieldValue('priceIncreaseNotice'),
          creditLimit: getFieldValue('creditLimit'),
          settlementCondition: getFieldValue('settlementCondition'),
          settlementEmail: getFieldValue('settlementEmail'),
          paymentDeadline: getFieldValue('paymentDeadline'),
          sla: getFieldValue('sla'),
          id: financeUpdateInfo?.a2pAll?.a2p?.id,
          refHeadId: financeUpdateInfo?.a2pAll?.a2p?.refHeadId,
        },
        a2pEditContact,
        a2pEditAccount,
      };

      this.setState({
        loading: true
      });
      const payload = {
        headEdit,
        bank,
        attachment,
      };
      dispatch({
        type: 'supplierHK/financeUpdateInfoSave',
        payload: isA2p === 'Y' ? {...payload, a2p} : payload
      }).then(res => {
        if(res) {
          const editBankOrAddressInfoList = newBankOrAddressInfoList.map((item) => ({
            ...item,
            refSupEditId: res?.editHead?.id
          }))
          debugger
          notification.success();
          this.setState({
            bankInfoDataSource: res?.banks || [],
            attachmentDataSource: res?.attachments || [],
            a2pContactDataSource: res?.a2pAll?.contacts || [],
            a2pAccountDataSource: res?.a2pAll?.account || [],
          })
          dispatch({
            type: 'supplierHK/saveEditBankInfoList',
            payload: editBankOrAddressInfoList
          }).then((editRes) => {
            if(editRes) {
              this.setState({
                isShowBankInfo: false,
              }, () => {
                dispatch({
                  type: 'supplierHK/updateState',
                  payload: {
                    bankInfoListDataSource: [],
                  }
                })
                this.handleEditIdAddressBankInfoList(res?.editHead?.id);
              })
            }
          })
        } else {
          this.init();
        }
      })
    }
  }

  
  // 保存银行信息的校验
  @Bind()
  saveBankInfoListValidate(callback) {
    const { dispatch, supplierHK, location: { search } } = this.props;
    const {
      addressBankInfoDataSource = [],
      bankInfoListDataSource = []
    } = supplierHK;
    const { id, formRecordId } = queryString.parse(search.substring(1));
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
    debugger
    const newBankOrAddressInfoList = addressBankValidateData?.map((item) => ({
      ...item,
      id: item?.refSupEditId ? (item.id) : (formRecordId === 'null' ? null : item.id),
      isMainAddress: (allMainAddressN && item.isMainAddressFlagY === "Y") || item.isMainAddress === 1 ? "Y" : item.isMainAddress,
      bankLine: bankValidateData?.filter((bankItem) => (bankItem.bindBankId === item.rowKey) || (bankItem.refHeadId === item.id))
      .map((delItem) => {
        // 如果是供应商Id的话（id）,需要把银行信息中的行列表中的refHeadId删除掉
        if(!(item?.refSupEditId) && formRecordId === 'null') {
          const { id, ...rest } = delItem;  // 解构并删除 id 字段
          return { ...rest };  // 返回没有 id 的对象
        }
        return {
          ...delItem,
          isMain: delItem?.isMain === 1 || delItem?.isMain === 'Y' ? 'Y' : delItem.isMain,
        };
      })
    }))
    if((newBankOrAddressInfoList.length > 0 && bankValidateData.length > 0) || (newBankOrAddressInfoList.length > 0 && bankInfoListDataSource.length === 0)) {
      console.log('addressBankValidateData', addressBankValidateData);
      console.log('bankValidateData', bankValidateData);
      console.log('newBankOrAddressInfoList', newBankOrAddressInfoList);
      if (typeof callback === 'function') {
        callback(newBankOrAddressInfoList);
      }
    }
  }

  // 给handleSave用的保存银行信息
  @Bind()
  saveBankInfoList(callback, resInfo, newBankOrAddressInfoList) {
    const { dispatch } = this.props;
    const editBankOrAddressInfoList = newBankOrAddressInfoList.map((item) => ({
      ...item,
      refSupEditId: resInfo?.editHead?.id
    }))
    dispatch({
      type: 'supplierHK/saveEditBankInfoList',
      payload: editBankOrAddressInfoList
    }).then((res) => {
      if(res) {
        if (typeof callback === 'function') {
          callback(res);
        }
      }
    })
  }

  /**
   * 页面大保存
   */
  @Bind()
  handleSave(callback) {
    this.platform.props.form.validateFields((err, values) => {
      if(!err) {
        this.props.form.validateFields((error, values2) => {
          if (!error) {
            const {
              bankInfoDataSource,
              attachmentDataSource,
              a2pContactDataSource,
              a2pAccountDataSource,
              isA2p
            } = this.state;
            const { dispatch, location: { search }, financeUpdateInfo, form: { getFieldValue } } = this.props;
            const { id } = queryString.parse(search.substring(1));
            const headEdit = {
              editReason: values.editReason,
              refSupHeadId: id || financeUpdateInfo?.editHead?.refSupHeadId,
              applyNumber: values.applyNumber,
              applyStatus: values.applyStatus,
              supplierNumber: values.supplierNumber,
              companyNameEn: values.companyNameEn,
              companyNameCh: values.companyNameCh,
              applyDate: dayjs.isDayjs(values.applyDate)
                ? values.applyDate.format("YYYY-MM-DD 00:00:00")
                : undefined,
              applyUser: values.applyUser,
              id: financeUpdateInfo?.editHead?.id
            };
            const bank = bankInfoDataSource?.map(i => {
              return {
                bankName: i.bankName,
                branchName: i.branchName,
                country: i.country,
                accountName: i.accountName,
                bankAccountName: i.bankAccountName,
                interRemittanceNum: i.interRemittanceNum,
                payerAddress: i.payerAddress,
                isMainAddress: i.isMainAddress,
                addressStatus: i.addressStatus,
                payerCode: i.payerCode,
                isMain: i.isMain,
                bankStatus: i.bankStatus,
                uploadErpStatus: i?.uploadErpStatus === 'Y' ? 'Y' : 'N',
                ebsBankId: i.ebsBankId,
                ebsBranchId: i.ebsBranchId,
              }
            });
            const attachment = attachmentDataSource?.map(i => {
              return {
                type: i.type,
                subType: i.subType,
                description: i.description,
                expirationDate: dayjs.isDayjs(i.expirationDate)
                  ? i.expirationDate.format("YYYY-MM-DD 00:00:00")
                  : dayjs(i.expirationDate).format('YYYY-MM-DD 00:00:00'),
                attachmentDate: dayjs.isDayjs(i.attachmentDate)
                  ? i.attachmentDate.format("YYYY-MM-DD HH:mm:ss")
                  : undefined,
                attachmentUuid: i.attachmentUuid,
                uploadErpStatus: i?.uploadErpStatus === 'Y' ? 'Y' : 'N'
              }
            })
            const a2pEditContact = a2pContactDataSource.map(i => {
              return {
                type: i.type,
                name: i.name,
                email: i.email,
                position: i.position,
                phone: i.phone
              }
            })
            const a2pEditAccount = a2pAccountDataSource.map(i => {
              return {
                account: i.account,
                method: i.method,
                protocol: i.protocol,
                captiveModel: i.captiveModel,
                tps: i.tps,
                ip: i.ip,
                accountSession: i.accountSession,
                specialConfiguration: i.specialConfiguration
              }
            });
            const a2p = {
              a2pEdit: {
                quoteEmail: getFieldValue('quoteEmail'),
                priceIncreaseNotice: getFieldValue('priceIncreaseNotice'),
                creditLimit: getFieldValue('creditLimit'),
                settlementCondition: getFieldValue('settlementCondition'),
                settlementEmail: getFieldValue('settlementEmail'),
                paymentDeadline: getFieldValue('paymentDeadline'),
                sla: getFieldValue('sla'),
                id: financeUpdateInfo?.a2pAll?.a2p?.id,
                refHeadId: financeUpdateInfo?.a2pAll?.a2p?.refHeadId,
              },
              a2pEditContact,
              a2pEditAccount,
            };

            // 判断附件中的附件类型有没有填写
            const checkUndefinedField = attachment.some(item => item.type === undefined);
            if(checkUndefinedField) {
              return notification.error({
                message: intl.get(`${prompt}.field.attachtype.verfy`).d('请补全公司附件中的附件类型'),
              })
            }
            this.setState({
              loading: true
            });
            const payload = {
              headEdit,
              bank,
              attachment,
            };
            this.saveBankInfoListValidate((list) => {
              if(list.length > 0) {
                dispatch({
                  type: 'supplierHK/financeUpdateInfoSave',
                  payload: isA2p === 'Y' ? {...payload, a2p} : payload
                }).then(res => {
                  if(res) {
                    this.saveBankInfoList((bankRes) => {
                      if(bankRes) {
                        notification.success();
                        this.setState({
                          bankInfoDataSource: res?.banks || [],
                          attachmentDataSource: res?.attachments || [],
                          a2pContactDataSource: res?.a2pAll?.contacts || [],
                          a2pAccountDataSource: res?.a2pAll?.account || [],
                          loading: false
                        })
                        if(typeof callback === 'function') {
                          callback({
                            ...res,
                            affairTitle: intl.get(`${prompt}.todotask.financeinfo.update`).d('供应商银行信息更新：') + headEdit.companyNameCh, //待办流程名称
                          });
                          console.log('affairTitle', intl.get(`${prompt}.todotask.financeinfo.update`).d('供应商银行信息更新：') + headEdit.companyNameCh);
                        }
                        this.setState({
                          isShowBankInfo: false,
                        }, () => {
                          dispatch({
                            type: 'supplierHK/updateState',
                            payload: {
                              bankInfoListDataSource: [],
                            }
                          })
                          this.handleEditIdAddressBankInfoList(res?.editHead?.id);
                        })
                      }
                    }, res, list)
                  } else {
                    this.init();
                    this.setState({
                      loading: false
                    });
                  }
                })
              }
            })
          }
        })
      }
    })
  }

  // 新增一行银行信息
  @Bind()
  handleAddBankInfoData() {
    const { bankInfoDataSource } = this.state;
    const { companyNameEn } = this.platform.props.form.getFieldsValue();
    this.setState({
      bankInfoDataSource: [...bankInfoDataSource, {
        uuid: uuid(),
        _status: 'create',
        bankName: undefined,
        branchName: undefined,
        country: undefined,
        accountName: companyNameEn,
        bankAccountName: undefined,
        interRemittanceNum: undefined,
        payerAddress: undefined,
        isMainAddress: 'N',
        addressStatus: undefined,
        payerCode: undefined,
        isMain: 'N',
        bankStatus: undefined
      }],
    });
  }

  // 删除一行银行信息
  @Bind()
  handleDelBankInfoData() {
    const { bankInfoDataSource = [], bankInfoSelectRows = [] } = this.state;
    this.setState({
      bankInfoDataSource: bankInfoDataSource.filter(r => bankInfoSelectRows.every(rd => rd.uuid !== r.uuid)),
      bankInfoRemove: bankInfoSelectRows,
      bankInfoSelectRowKeys: [],
      bankInfoSelectRows: []
    });
  }

  // 银行表格checkBox
  @Bind()
  handleBankInfoRowSelectionChange(keys, rows) {
    this.setState({
      bankInfoSelectRowKeys: keys,
      bankInfoSelectRows: rows,
    })
  }

  // 新增一行附件信息
  @Bind()
  handleAddAttachmentData() {
    const { attachmentDataSource } = this.state;
    this.setState({
      attachmentDataSource: [...attachmentDataSource, {
        uuid: uuid(),
        _status: 'create',
        type: undefined,
        subType: undefined,
        description: undefined,
        expirationDate: undefined,
        attachmentDate: undefined,
        attachmentUuid: uuid()
      }],
    });
  }

  // 删除一行附件信息
  @Bind()
  handleDelAttachmentData() {
    const { attachmentDataSource = [], attachmentSelectRows = [] } = this.state;
    this.setState({
      attachmentDataSource: attachmentDataSource.filter(r => attachmentSelectRows.every(rd => rd.uuid !== r.uuid)),
      attachmentRemove: attachmentSelectRows,
      attachmentSelectRowKeys: [],
      attachmentSelectRows: []
    });
  }

  // 附件信息表格checkBox
  @Bind()
  handleAttachmentRowSelectionChange(keys, rows) {
    this.setState({
      attachmentSelectRowKeys: keys,
      attachmentSelectRows: rows,
    })
  }

  // 新增一行a2p联系人信息
  @Bind()
  handleAddContactTypeData() {
    const { a2pContactDataSource } = this.state;
    this.setState({
      a2pContactDataSource: [...a2pContactDataSource, {
        uuid: uuid(),
        _status: 'create',
        type: undefined,
        name: undefined,
        email: undefined,
        position: undefined,
        phone: undefined
      }],
    });
  }

  // 删除一行a2p联系人信息
  @Bind()
  handleDelContactTypeData() {
    const { a2pContactDataSource = [], a2pContactSelectRows = [] } = this.state;
    this.setState({
      a2pContactDataSource: a2pContactDataSource.filter(r => a2pContactSelectRows.every(rd => rd.uuid !== r.uuid)),
      a2pContactRemove: a2pContactSelectRows,
      a2pContactSelectRowKeys: [],
      a2pContactSelectRows: [],
    });
  }

  // a2p联系人表格checkBox
  @Bind()
  handleA2PContactRowSelectionChange(keys, rows) {
    this.setState({
      a2pContactSelectRowKeys: keys,
      a2pContactSelectRows: rows,
    })
  }

  // 新增一行a2p账户信息
  @Bind()
  handleAddAccountData() {
    const { a2pAccountDataSource } = this.state;
    this.setState({
      a2pAccountDataSource: [...a2pAccountDataSource, {
        uuid: uuid(),
        _status: 'create',
        account: undefined,
        method: undefined,
        protocol: undefined,
        captiveModel: undefined,
        tps: undefined,
        ip: undefined,
        accountSession: undefined,
        specialConfiguration: undefined
      }],
    });
  }

  // 删除一行a2p账户信息
  @Bind()
  handleDelAccountData() {
    const { a2pAccountDataSource = [], a2pAccountSelectRows = [] } = this.state;
    this.setState({
      a2pAccountDataSource: a2pAccountDataSource.filter(r => a2pAccountSelectRows.every(rd => rd.uuid !== r.uuid)),
      a2pAccountRemove: a2pAccountSelectRows,
      a2pAccountSelectRowKeys: [],
      a2pAccountSelectRows: []
    });
  }

  // a2p账号表格表格checkBox
  @Bind()
  handleA2PAccountRowSelectionChange(keys, rows) {
    this.setState({
      a2pAccountSelectRowKeys: keys,
      a2pAccountSelectRows: rows,
    })
  }

  // 联系人表格
  @Bind()
  contactTypeColumns() {
    const { form } = this.props;
    const { disabled } = this.state;
    return [
      {
        title: intl.get(`${prompt}.field.a2p.supplier.contact.type`).d('A2P业务联系人类型'),
        dataIndex: 'type',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{record.typeMeaning}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`type${record.uuid}`, {
                initialValue: record.type
              })(<CusSelect style={{ width: '100%' }}
                            lovCode="HKSP.A2P_CONTACT_TYPE"
                            onChange={e => record.type = e}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.contact.person.name`).d('A2P业务联系人姓名'),
        dataIndex: 'name',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`name${record.uuid}`, {
                initialValue: record.name
              })(<CusInput style={{ width: '100%' }}
                           onChange={e => record.name = e}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.contact.mailbox`).d('A2P业务联系人邮箱'),
        dataIndex: 'email',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`email${record.uuid}`, {
                initialValue: record.email,
                rules: [
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ],
              })(<CusInput style={{ width: '100%' }}
                           onChange={e => record.email = e}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.contact.position`).d('A2P业务联系人职位'),
        dataIndex: 'position',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`position${record.uuid}`, {
                initialValue: record.position
              })(<CusInput style={{ width: '100%' }}
                           onChange={e => record.position = e}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.contact.phone.number`).d('A2P业务联系人电话'),
        dataIndex: 'phone',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`phone${record.uuid}`, {
                initialValue: record.phone
              })(<CusInput style={{ width: '100%' }}
                           onChange={e => record.phone = e}
              />)}
            </Form.Item>
          )
        }
      },
    ]
  }
  // 账号表格
  @Bind()
  accountColumns() {
    const { form } = this.props;
    const { disabled } = this.state;
    return [
      {
        title: intl.get(`${prompt}.field.a2p.access.account`).d('接入账号'),
        dataIndex: 'account',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`account${record.uuid}`, {
                initialValue: record.account
              })(<CusInput style={{ width: '100%' }}
                           onChange={e => record.account = e}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.access.method`).d('接入方式'),
        dataIndex: 'method',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`method${record.uuid}`, {
                initialValue: record.method
              })(<CusSelect style={{ width: '100%' }}
                            lovCode="HKSP.ACCESS_METHOD"
                            onChange={e => record.method = e}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.protocol`).d('Protocol'),
        dataIndex: 'protocol',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`protocol${record.uuid}`, {
                initialValue: record.protocol
              })(<CusSelect style={{ width: '100%' }}
                            lovCode="HKSP.PROTOCOL"
                            onChange={e => record.protocol = e}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.settlement.mode`).d('结算模式'),
        dataIndex: 'captiveModel',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{record.captiveModelMeaning}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`captiveModel${record.uuid}`, {
                initialValue: record.captiveModel
              })(<CusSelect style={{ width: '100%' }}
                            lovCode="HKSP.SETTLE_MODE"
                            onChange={e => record.captiveModel = e}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.tps`).d('TPS'),
        dataIndex: 'tps',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`tps${record.uuid}`, {
                initialValue: record.tps
              })(<CusInput style={{ width: '100%' }}
                           onChange={e => record.tps = e}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.ip`).d('IP'),
        dataIndex: 'ip',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`ip${record.uuid}`, {
                initialValue: record.ip
              })(<CusInput style={{ width: '100%' }}
                           onChange={e => record.ip = e}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.session`).d('Session'),
        dataIndex: 'accountSession',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`accountSession${record.uuid}`, {
                initialValue: record.accountSession
              })(<CusInput style={{ width: '100%' }}
                           onChange={e => record.accountSession = e}
              />)}
            </Form.Item>
          )
        }
      },
      {
        title: intl.get(`${prompt}.field.a2p.special.configuration.instructions`).d('特殊配置说明'),
        dataIndex: 'specialConfiguration',
        width: 200,
        render: (value, record) => {
          const { getFieldDecorator } = form;
          if(disabled) {
            return <>{value}</>
          }
          return (
            <Form.Item>
              {getFieldDecorator(`specialConfiguration${record.uuid}`, {
                initialValue: record.specialConfiguration
              })(<CusInput style={{ width: '100%' }}
                           onChange={e => record.specialConfiguration = e}
              />)}
            </Form.Item>
          )
        }
      },
    ]
  }

  // 删除银行地址信息
  handleDelAddressBankData = () => {
    const { dispatch, supplierHK } = this.props;
    const { addressBankInfoDataSource = [] } = supplierHK;
    const { selectedRowKeysAddressBank, selectedRowsAddressBank } = this.state;
    if(selectedRowKeysAddressBank.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        const deleteData = addressBankInfoDataSource.filter(
          (item) => selectedRowKeysAddressBank.includes(item['rowKey']) && item._status !== 'create'
        );
        if (deleteData.length > 0) {
          // 后台删除
          dispatch({
            type: 'supplierHK/deleteEditAddressBankInfoLine',
            payload: deleteData.map((item) => String(item.id))
          }).then((res) => {
            if(res) {
              CusNotification.success({
                message: intl.get('hzero.common.notification.success.delete').d('删除成功')
              })
              const newDataSource = addressBankInfoDataSource.filter((item) => !selectedRowKeysAddressBank.includes(item['rowKey']));
              dispatch({
                type: 'supplierHK/updateState',
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
          // 本地删除
          const newDataSource = addressBankInfoDataSource.filter((item) => !selectedRowKeysAddressBank.includes(item['rowKey']));
          dispatch({
            type: 'supplierHK/updateState',
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
    const { supplierHK, dispatch, financeUpdateInfo } = this.props;
    const { id, formRecordId } = queryString.parse(this.props.location.search.substring(1));

    console.log('this.props', this.props);
    
    const {
      addressBankInfoDataSource = [],
    } = supplierHK;

    // 判断是否已有主地址
    const hasMainAddress = addressBankInfoDataSource.some(item => item.isMainAddress === 'Y');
    const newIsMainAddress = hasMainAddress ? 'N' : 'Y';

    const newDataSource = [
      ...addressBankInfoDataSource,
      {
        payerAddress: financeUpdateInfo?.editHead?.addressEn, // 默认公司地址英文
        payerAccountName: financeUpdateInfo?.editHead?.companyNameEn, // 默认公司名称英文
        isMainAddress: newIsMainAddress, // 默认主地址
        addressStatus: 'Y', // 默认生效
        isMainAddressFlagY: 'N', // 保存时用来判断的主地址
        _status: 'create',
        rowKey: uuid(),
        ...(id ? { refSupId: id } : { refSupEditId: formRecordId })
      }
    ];

    dispatch({
      type: 'supplierHK/updateState',
      payload: {
        addressBankInfoDataSource: newDataSource,
      },
    })
  }

  // 删除银行明细信息
  handleDelBankData = () => {
    const { dispatch, supplierHK } = this.props;
    const { bankInfoListDataSource = [] } = supplierHK;
    const { selectedRowKeysBank, selectedRowsBank } = this.state;
    if(selectedRowKeysBank.length > 0) {
      CusModal.CusDeleteConfirm(() => {
        const deleteData = bankInfoListDataSource.filter(
          (item) => selectedRowKeysBank.includes(item['rowKey']) && item._status !== 'create'
        );
        if (deleteData.length > 0) {
          // 后台删除
          dispatch({
            type: 'supplierHK/deleteEditBankInfoLine',
            payload: deleteData.map((item) => String(item.id))
          }).then((res) => {
            if(res) {
              CusNotification.success({
                message: intl.get('hzero.common.notification.success.delete').d('删除成功')
              })
              const newDataSource = bankInfoListDataSource.filter((item) => !selectedRowKeysBank.includes(item['rowKey']));
              dispatch({
                type: 'supplierHK/updateState',
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
            type: 'supplierHK/updateState',
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
    const { supplierHK, dispatch, financeUpdateInfo } = this.props;

    const { addressBankRecord = {} } = this.state;

    console.log('this.props', this.props);
    
    const {
      bankInfoListDataSource = [],
    } = supplierHK;

    // 将所有现有账号的 isMain 设为 N
    const updatedDataSource = bankInfoListDataSource.map(item => ({ ...item, isMain: 'N', bankStatus: 'N' }));

    const newDataSource = [
      ...updatedDataSource.map((item) => ({
        ...item,
        bindBankId: addressBankRecord.rowKey,
      })),
      {
        accountName: financeUpdateInfo?.editHead?.companyNameEn, // 默认公司名称英文
        isMain: 'Y', // 默认主账号
        bankStatus: 'Y', // 默认生效
        _status: 'create',
        rowKey: uuid(),
        bindBankId: addressBankRecord.rowKey,
        refHeadId: addressBankRecord.id,
      }
    ];

    dispatch({
      type: 'supplierHK/updateState',
      payload: {
        bankInfoListDataSource: newDataSource,
      },
    })
  }

  render() {
    const {
      activeKey,
      bankInfoDataSource,
      bankInfoSelectRowKeys,
      attachmentDataSource,
      attachmentSelectRowKeys,
      a2pContactDataSource,
      a2pContactSelectRowKeys,
      a2pAccountDataSource,
      a2pAccountSelectRowKeys,
      isA2p,
      disabled,
      selectedRowKeysAddressBank,
      selectedRowKeysBank,
      isShowBankInfo = false,
    } = this.state;
    const {
      supplierHK,
      form,
      financeUpdateInfo,
      tenantId,
      currentUser,
      queryBankInfoListLoading = false,
      saveBankLoading = false,
      bankInfoExportLoading = false,
      bankInfoEditExportLoading = false,
      location: { search },
    } = this.props;
    const { a2pAll = {} } = financeUpdateInfo;
    const { getFieldDecorator } = form;
    const { formRecordId } = queryString.parse(search.substring(1));
    const headFormProps = {
      initialValues: {
        ...financeUpdateInfo?.editHead,
        ...financeUpdateInfo?.lineEdit,
      },
      currentUser,
      disabled
    };
    const bankTableProps = {
      form,
      rowKey: 'uuid',
      dataSource: bankInfoDataSource,
      rowSelection: {
        selectedRowKeys: bankInfoSelectRowKeys,
        onChange: this.handleBankInfoRowSelectionChange,
        getCheckboxProps: (record) => ({
          disabled: disabled || record?.uploadErpStatus === 'Y'
        })
      },
      handleChange: this.handleBankChange,
      readOnly: disabled
    };
    const attachmentTableProps = {
      supplierHK,
      form,
      rowKey: 'uuid',
      dataSource: attachmentDataSource,
      rowSelection: {
        selectedRowKeys: attachmentSelectRowKeys,
        onChange: this.handleAttachmentRowSelectionChange,
        getCheckboxProps: (record) => ({
          disabled: record?.uploadErpStatus === 'Y' ? true : disabled
        })
      },
      tenantId,
      handleAttachmentChange: this.handleAttachmentChange,
      tag: 'bank',
      readOnly: disabled
    };
    const a2pContactTableProps = {
      rowKey: 'uuid',
      dataSource: a2pContactDataSource,
      rowSelection: {
        selectedRowKeys: a2pContactSelectRowKeys,
        onChange: this.handleA2PContactRowSelectionChange,
        getCheckboxProps: () => ({
          disabled: disabled
        })
      },
    };
    const a2pAccountTableProps = {
      rowKey: 'uuid',
      dataSource: a2pAccountDataSource,
      rowSelection: {
        selectedRowKeys: a2pAccountSelectRowKeys,
        onChange: this.handleA2PAccountRowSelectionChange,
        getCheckboxProps: () => ({
          disabled: disabled
        })
      },
    };
    const gridSpan = {
      xs: 12,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12,
      xxl: 12
    };
    const contactTypeColumns = this.contactTypeColumns();
    const accountColumns = this.accountColumns();

    const addressBankInfoColumnsRowSelection = {
      selectedRowKeysAddressBank,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeysAddressBank: keys,
          selectedRowsAddressBank: rows,
        });
      },
      getCheckboxProps: (record) => ({
        disabled: disabled || record?.uploadErpStatus === 'Y'
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
        disabled: disabled || record?.uploadErpStatus === 'Y'
      })
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
                title={intl.get(`${prompt}.view.title.basicInfo`).d('基础信息')}
                arrowActive={activeKey.includes('basicInfo')}
              />
            }
            key="basicInfo"
          >
            <HeaderForm
              onRef={ref => this.platform = ref}
              {...headFormProps}
            />
          </Panel>
          {/* <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.bank.info`).d('银行信息')}
                arrowActive={activeKey.includes('bank')}
                buttons={
                  <>
                    {!disabled && <CusButton mini
                                onClick={this.handleDelBankInfoData}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>}
                    {!disabled && <CusButton mini type='primary'
                                onClick={this.handleAddBankInfoData}>{intl.get('hzero.common.button.add').d('新增')}</CusButton>}
                  </>
                }
              />
            }
            key="bank"
          >
            <BankTable {...bankTableProps}/>
          </Panel> */}
          <Panel
            showArrow={false}
            header={
              <PanelHeader
                title={intl.get(`${prompt}.view.title.bank.info`).d('银行信息')}
                arrowActive={activeKey.includes('bank')}
                buttons={
                  <>
                    {formRecordId !== 'null' ? <CusButton
                      mini
                      onClick={this.handleEditExport}
                      loading={bankInfoEditExportLoading}
                    >
                      {intl.get('hzero.common.button.export').d('导出')}
                    </CusButton>
                    :
                    <CusButton
                      mini
                      onClick={this.handleExport}
                      loading={bankInfoExportLoading}
                    >
                      {intl.get('hzero.common.button.export').d('导出')}
                    </CusButton>
                    }
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
            key="bank"
          >
            <AddressBankInfoList {...addressBankInfoProps} />
            {isShowBankInfo && <div>
              <CusSpin spinning={queryBankInfoListLoading}>
                <div style={{ display: 'flex', justifyContent: 'end', alignItems: 'center', margin: ' 16px 0' }}>
                  { false && <p>{intl.get(`${prompt}.view.title.bank.info.label`).d('提示: 若开户银行选不到，可暂默认选择“Dummy”。')}</p>}
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
                      onClick={this.saveAllBankInfoList}
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
                arrowActive={activeKey.includes('bankAttachment')}
                buttons={
                  <>
                    {!disabled && <CusButton mini
                                onClick={this.handleDelAttachmentData}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>}
                    {!disabled && <CusButton mini type='primary'
                                onClick={this.handleAddAttachmentData}>{intl.get('hzero.common.button.add').d('新增')}</CusButton>}
                  </>
                }
              />
            }
            key="bankAttachment"
          >
            <AttachmentTable {...attachmentTableProps}/>
          </Panel>
          {isA2p === 'Y' && (
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`${prompt}.view.title.a2p.info`).d('A2P信息')}
                  arrowActive={activeKey.includes('a2pInfo')}
                />
              }
              key="a2pInfo"
            >
              <div className="customize-form">
                <Row gutter={24}>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${prompt}.a2p.info.quotation.mail`).d('供应商报价邮件')}>
                      {getFieldDecorator('quoteEmail', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get(`${prompt}.a2p.info.quotation.mail`).d('供应商报价邮件'),
                            }),
                          },
                          {
                            pattern: EMAIL,
                            message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                          },
                        ],
                        initialValue: a2pAll?.a2pEdit?.quoteEmail || a2pAll?.a2p?.quoteEmail
                      })(<CusInput allowClear disabled={disabled}/>)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${prompt}.a2p.info.advance.in.price`).d('涨价通知期')}>
                      {getFieldDecorator('priceIncreaseNotice', {
                        rules: [{
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${prompt}.a2p.info.advance.in.price`).d('涨价通知期'),
                          }),
                        }],
                        initialValue: a2pAll?.a2pEdit?.priceIncreaseNotice || a2pAll?.a2p?.priceIncreaseNotice
                      })(<CusInput allowClear disabled={disabled}/>)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${prompt}.a2p.info.credit.limit`).d('Credit Limit')}>
                      {getFieldDecorator('creditLimit', {
                        initialValue: a2pAll?.a2pEdit?.creditLimit || a2pAll?.a2p?.creditLimit
                      })(<CusInput allowClear disabled={disabled}/>)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${prompt}.a2p.info.settlement.term`).d('结算条件')}>
                      {getFieldDecorator('settlementCondition',  {
                        rules: [{
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${prompt}.a2p.info.settlement.term`).d('结算条件'),
                          }),
                        }],
                        initialValue: a2pAll?.a2pEdit?.settlementCondition || a2pAll?.a2p?.settlementCondition
                      })(<CusInput allowClear disabled={disabled}/>)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${prompt}.a2p.info.settlement.account.email`).d('结算账号邮箱')}>
                      {getFieldDecorator('settlementEmail',  {
                        rules: [{
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${prompt}.a2p.info.settlement.account.email`).d('结算账号邮箱'),
                          }),
                        }],
                        initialValue: a2pAll?.a2pEdit?.settlementEmail || a2pAll?.a2p?.settlementEmail
                      })(<CusInput allowClear disabled={disabled}/>)}
                    </Form.Item>
                  </Col>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${prompt}.a2p.info.payment.period`).d('缴费期限')}>
                      {getFieldDecorator('paymentDeadline',  {
                        rules: [{
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${prompt}.a2p.info.payment.period`).d('缴费期限'),
                          }),
                        }],
                        initialValue: a2pAll?.a2pEdit?.paymentDeadline || a2pAll?.a2p?.paymentDeadline
                      })(<CusInput allowClear disabled={disabled}/>)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col {...gridSpan}>
                    <Form.Item label={intl.get(`${prompt}.a2p.info.sla`).d('SLA')}>
                      {getFieldDecorator('sla', {
                        initialValue: a2pAll?.a2pEdit?.sla || a2pAll?.a2p?.sla
                      })(<CusInput allowClear disabled={disabled}/>)}
                    </Form.Item>
                  </Col>
                </Row>
              </div>
              <br/>
              <div className="table-operator">
                {!disabled && <CusButton type="primary" onClick={this.handleAddContactTypeData}>{intl.get('hzero.common.button.add').d('新增')}</CusButton>}
                {!disabled && <CusButton onClick={this.handleDelContactTypeData}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>}
              </div>
              <EditTable
                bordered
                pagination={false}
                columns={contactTypeColumns}
                {...a2pContactTableProps}
              />
              <div className="table-operator" style={{ marginTop: 36 }}>
                {!disabled && <CusButton type='primary'
                            onClick={this.handleAddAccountData}>{intl.get('hzero.common.button.add').d('新增')}</CusButton>}
                {!disabled && <CusButton
                  onClick={this.handleDelAccountData}>{intl.get('hzero.common.button.delete').d('删除')}</CusButton>}
              </div>
              <br/>
              <EditTable
                bordered
                pagination={false}
                columns={accountColumns}
                {...a2pAccountTableProps}
              />
            </Panel>
          )}
        </Collapse>
      </PageWrapper>
    )
  }
}
