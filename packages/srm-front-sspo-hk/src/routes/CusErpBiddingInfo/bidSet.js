/*
 * ContractMaintainDetail - erp-项目设置
 * @date: 2022-05-23
 * @author: CJ <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { Component, Fragment } from 'react';
import { Modal, Tabs, LocaleProvider } from 'hzero-ui';
import { Collapse } from 'antd';
import CusModal from '_cus_components/CusModal';
import PageWrapper from '_cus_components/Page/PageWrapper';
import CusTabs from '../components/CusSearchTabs';
import PanelHeader from '_cus_components/CusCollapse';
import { connect } from 'dva';
import { isEmpty, isArray, isString } from 'lodash';
import { Bind } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { SRM_BID } from '@/common/config';
import {
  getCurrentOrganizationId,
  filterNullValueObject,
  createPagination,
  getCurrentLanguage
} from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  DEFAULT_DATETIME_FORMAT,
  DEFAULT_DATE_FORMAT,
} from 'utils/constants';
import request from 'utils/request';
import styles from './index.less';
import ContractMidlle from '../components/ContractMidlleNew';
import ContractMidlleBusiness from '../components/ContractMidlleBusinessNew';
import QuotationTable from '../ContractMaintain/SetQuotationTableNewERP'
import QuoteSourceResult from '../ContractMaintain/QuoteSourceResultNew'
import SetJudgesTable from '../ContractMaintain/SetJudgesTableNew'
import InviteSuppliers from '../ContractMaintain/InviteSuppliersNew'
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';
import './index.less'
import classNames from 'classnames';
import eventBus from '../components/ev';
import notification from '_cus_components/CusNotification';

const { Panel } = Collapse;
const organizationId = getCurrentOrganizationId();
/**
 * ContractMaintainDetail - 协议维护详情
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {!Object} [contractMaintain={}] - 数据源
 * @reactProps {boolean} [getHeaderAttachmentUuidLoading=false] - 获取附件uuid处理中
 * @reactProps {boolean} [deleteDetailLinesLoading=false] - 删除明细行处理中
 * @reactProps {boolean} [submitDeliveryLoading=false] - 提交送货单处理中
 * @reactProps {boolean} [deleteDeliveryLoading=false] - 删除送货单处理中
 * @reactProps {boolean} [queryCreateListLoading=false] - 查询可创建行处理中
 * @reactProps {boolean} [queryMaintenanceListLoading=false] - 查询可维护行处理中
 * @reactProps {boolean} [fetchingDetailHeader=false] - 查询明细头处理中
 * @reactProps {boolean} [queryDetailListLoading=false] - 查询明细行处理中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading, contractMaintain, contractCommon }) => ({
  queryingHeader: loading.effects['contractCommon/fetchHeader'],
  queryingPartner: loading.effects['contractCommon/fetchPartner'],
  queryingSubject: loading.effects['contractCommon/fetchSubject'],
  queryingStage: loading.effects['contractCommon/fetchStage'],
  queryingTerm: loading.effects['contractCommon/fetchTerm'],
  saving: loading.effects['contractMaintain/update'] || loading.effects['contractMaintain/add'],
  deleteHeaderLoading: loading.effects['contractMaintain/delete'],
  submitContractLoading: loading.effects['contractMaintain/submit'],
  deletePcSubjectLoading: loading.effects['contractMaintain/pcSubjectLinesDelete'],
  deletePcStageLoading: loading.effects['contractMaintain/pcStageLinesDelete'],
  deletePartnerLoading: loading.effects['contractMaintain/partnerLinesDelete'],
  queryingPcAttachmentList: loading.effects['contractCommon/fetchPcAttachmentList'],
  contractMaintain,
  contractCommon,
}))
@formatterCollections({
  code: [],
})
export default class Detail extends Component {
  editorOnlineRef;


  handleExport() {
    this.setState({
      exportLoading: true,
    });
    // const queryParams = this.getExportQueryParams();
    request(
      `${SRM_BID}/v1/${organizationId}/bid-pro-infos/exportProInfo?ids=0%2C1%2C2&fillerType=single-sheet&exportType=DATA`,
      {
        method: 'GET',
        responseType: 'blob',
        // query: queryParams,
      }
    ).then((res) => {
      this.setState({
        exportLoading: false,
      });
      if (res) {
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const fileName = '转售付款申请导出';
        if ('msSaveOrOpenBlob' in navigator) {
          // 使用ie下载
          navigator.msSaveOrOpenBlob(blob, `${fileName}`);
          resolve(true);
          return false;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    });
  }

  getExportQueryParams() {
    const data = this.props.acceptTypeList;
    let filterData = filterNullValueObject(data);
    if (filterData.currencyCode) {
      filterData = { ...filterData, currencyCode: filterData.currencyCode.currencyCode };
    }
    if (filterData.requestDepartment) {
      filterData = { ...filterData, requestDepartment: filterData.requestDepartment.unitCode };
    }
    if (filterData.vendorCompanyName) {
      filterData = { ...filterData, vendorCompanyName: filterData.vendorCompanyName.vendorName };
    }
    // if (data.length > 0) {
    //   this.setState({
    //     exportQueryParams: filterData,
    //   });
    // }
    return filterData;
  }
  constructor(props) {
    super(props);
    const {
      //   location: { search },
      match,
    } = this.props;
    // 总预算港币：50万 ~ 100万的金额判断
    const isTalZero = Number(props.listAll.talCurrencyZero) > 500000 && Number(props.listAll.talCurrencyZero) <= 1000000;
    const isTalZeroMore = Number(props.listAll.talCurrencyZero) > 1000000;
    // 技术应答表&商务应答表&评委组显示条件
    // 50~100万：50~100万&采购方式为公开招标，邀请招标
    // 100万以上：100万&采购方式为公开招标，邀请招标，公开询价，邀请询价，直接谈判
    const isContractMidle = (
      isTalZero &&
      (['public_bidding', 'invited_bidding'].includes(props.listAll.procurementType || props.listAll.purchaseType))
      ||
      isTalZeroMore &&
      (['public_bidding', 'invited_bidding', 'public_inquiry', 'invitation_inquiry', 'direct_negotiation'].includes(props.listAll.procurementType || props.listAll.purchaseType))
    )
    // const { pcHeaderId, itemKey, isQuoteSource, quoteType } = querystring.parse(search.substr(1));
    this.state = {
      pcHeaderId: '',
      itemKey: '',
      typePro: '0',
      headerInfo: {},
      listEll: [],
      matchs: match,
      // 头form数据源
      collapseKeys: [
        'contractHeaderInformation',
        'contractPartnerInformation',
        'contractSubjectInformation',
        'contractBusinessTermsInformation',
        'contractOnlineEdit',
        'projectsetting',
      ], // 打开的折叠面板key
      listDataSource: [], // 表格数据源
      operationRecordVisible: false,
      headerEdited: false, // 头是否编辑过
      pcSubjectEdited: false,
      pcStageEdited: false,
      partnerEdited: false,
      termEdited: false,
      pcRebateEdited: false,
      fullScreenFlag: false,
      tenantId: getCurrentOrganizationId(),
      partnerDataSource: [], // 合作伙伴数据
      partnerSelectedRows: [],
      pcSubjectDataSource: [],
      pcStageDataSource: [],
      pcSubjectPagination: {},
      pcStagePagination: {},
      pcSubjectSelectedRows: [],
      pcStageSelectedRows: [],
      resultPagination: {},
      termDataSource: [],
      termSelectedRows: [],
      templateList: [],
      templateListFlag: false,
      activeKey: isContractMidle ? '1' : 'quotationTable',
      backPath: {
        purchaseContract: '/spcm/contract-maintain/purchase-contract',
        purchaseOrder: '/spcm/contract-maintain/quote-purchase-order',
        default: '/spcm/contract-maintain/list',
      },
      from: '',
      isQuoteSource: '',
      pcRebateDataSource: [],
      pcRebatePagination: {},
      pcRebateSelectedRows: [],
      quoteType: '', // 引用类型
      changeFlag: false,
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
    if (this.props.onChildEvent) this.props.onChildEvent(this)
    const { pcHeaderId } = this.state;
    const {
      //   location: { search },
    } = this.props;
    // const { from } = querystring.parse(search.substr(1));
    // this.setState({
    //   from,
    // });

    // 从其他页面带过来的默认值要放在最前面，避免覆盖已经保存的值
    this.resetDataFromStorage();
    this.fetchEnum();
    eventBus.on('callback', this.callback)
    eventBus.on('backSet', this.backSetList)
    // if (pcHeaderId && isNumber(+pcHeaderId)) {
    // this.fetchHeader();
    //   this.fetchList();
    // }
    // this.fetchConfigSetting();
  }

  cons = () => {
    this.MidlleRef.save()  }

  // componentWillUnmount() {
  //   // this.offDTOs();
  // }

  // @Bind()
  // offDTOs() {
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: 'contractMaintain/updateState',
  //     payload: { sourceResultDTOs: [], createPurchaseOrderList: [], createPurchaseOrderInfo: {} },
  //   });
  // }

  /**
   * resetDataFromStorage - 从存储数据中初始化数据，
   *  这些存储数据可能从采购申请中点击创建时设置sessionStorege
   */
  @Bind()
  resetDataFromStorage() {
    const { itemKey } = this.state;
    if (!itemKey) {
      return;
    }
    // 从sessionStorage中获取其他页面暂存的数据
    const dataFromPurchaseContract = JSON.parse(window.sessionStorage.getItem(itemKey));
    if (!dataFromPurchaseContract) {
      return;
    }
    dataFromPurchaseContract.pcSubjectDataSource = (
      dataFromPurchaseContract.pcSubjectDataSource || []
    ).map((item) => ({
      _status: 'create',
      pcSubjectId: uuid(),
      edited: true,
      ...item,
      lineNum: '',
    }));
    this.setState({
      ...dataFromPurchaseContract,
    });
  }

  // @Bind
  // saveTabs(id) {
  //   const { activeKey} = this.state
  //   console.log('activeKey', this.state.activeKey)
  //   if (activeKey == '1') eventBus.emit('save', id)
  //   if (activeKey == '3')  eventBus.emit('saveBusinessNew', id)
  //   if (activeKey == 'quoteSourceResult') eventBus.emit('handleSave', id)
  //   if (activeKey == 'quotationTable')  eventBus.emit('handleSaveQuotation', id)
  //   if (activeKey == 'inviteSuppliers') eventBus.emit('handleSaveInviteSuppliers', id)
  // }

  /**
   * fetchHeader - 查询头明细数据
   */
  @Bind()
  fetchHeader() {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    return dispatch({
      type: 'contractCommon/fetchHeader',
      pcHeaderId,
      customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL',
    }).then((res) => {
      if (res) {
        this.setState({ headerInfo: res }, () => {
          this.fetchSubject(); // 需要头信息里的字段
        });
        dispatch({
          type: 'contractMaintain/fetchPcPartnerTypes',
          payload: {
            pcTypeId: res.pcTypeId,
          },
        });
        this.handleFetchConfigAttachment();
        this.resetEditFlag();
        if (this.headerRef) {
          this.headerRef.setState({ signFlag: res.signEffectFlag });
        }
        if (res.rebateFlag) {
          this.fetchContractRebate();
        }
      }
    });
  }

  /**
   * 查询列表
   */
  @Bind()
  fetchList() {
    // this.fetchPartner();
    this.fetchStage();
    this.fetchTerm();
  }

  /**
   * 查询详情值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/fetchDetailEnum',
    });
  }

  /**
   * 查询配置中心配置
   */
  @Bind()
  fetchConfigSetting() {
    const { dispatch } = this.props;
    const lovCodes = {
      typeList: 'BID.YES_OR_NO',
      sheetList: 'BID.SUPPLY_WAY',
    };
    dispatch({
      type: 'contractMaintain/init',
      payload: {
        lovCodes,
      },
    });
    // dispatch({
    //   type: 'contractCommon/fetchConfigSetting',
    // });
  }

  /**
   * 重置修改标志
   */
  @Bind()
  resetEditFlag() {
    this.setState({
      headerEdited: false,
      pcSubjectEdited: false,
      pcStageEdited: false,
      partnerEdited: false,
      termEdited: false,
      pcRebateEdited: false,
    });
  }

  /**
   * fetchPartner - 查询合作伙伴数据
   * @param {object} page - 合作伙伴分页条件
   */
  // @Bind()
  // fetchPartner(page = {}) {
  //   const { dispatch } = this.props;
  //   const { pcHeaderId } = this.state;
  //   if (pcHeaderId) {
  //     dispatch({
  //       type: 'contractCommon/fetchPartner',
  //       payload: {
  //         page,
  //         pcHeaderId,
  //         customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
  //       },
  //     }).then((res) => {
  //       if (res) {
  //         this.setState({
  //           partnerDataSource: res.map((n) => ({ ...n, _status: 'update' })),
  //         });
  //         this.resetEditFlag();
  //       }
  //     });
  //   }
  // }

  /**
   * fetchSubject - 查询标的信息数据
   * @param {object} page - 标的信息分页条件
   */
  @Bind()
  async fetchSubject(page = {}) {
    const { dispatch } = this.props;
    const {
      pcHeaderId,
      itemKey,
      // pcSubjectDataSource,
      headerInfo: {
        supplierCurrencyCode = 'CYN',
        purchaseCurrencyCode = 'CYN',
        pcKindCode,
        contractPurpose,
      },
    } = this.state;

    // 当协议性质为框架协议，协议用途为电商采购，该字段为false
    const taxIncludedUpRequired = !(
      pcKindCode === 'FRAMEWORK_AGREEMENT' && contractPurpose === 'OMMERCE_PURCHASE'
    );

    const dataFromPurchaseContract = JSON.parse(window.sessionStorage.getItem(itemKey)) || {};
    const oldPcSubjectData = dataFromPurchaseContract.pcSubjectDataSource
      ? dataFromPurchaseContract.pcSubjectDataSource.map((item) => ({
        _status: 'create',
        pcSubjectId: uuid(),
        edited: true,
        ...item,
        lineNum: '',
        purchaseCurrencyCode: item.purchaseCurrencyCode || purchaseCurrencyCode,
      }))
      : [];

    if (pcHeaderId) {
      const res = await dispatch({
        type: 'contractCommon/fetchSubject',
        payload: {
          page,
          pcHeaderId,
          customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT',
        },
      });
      if (!res) {
        return;
      }

      // 如果是根据其他数据创建协议, 则要默认带出值
      const newPcSubjectDataSource =
        itemKey && isEmpty(res.content)
          ? oldPcSubjectData
          : res.content.map((n) => ({
            ...n,
            _status: 'update',
            currencyCode: taxIncludedUpRequired
              ? n.currencyCode || supplierCurrencyCode
              : n.currencyCode,
            purchaseCurrencyCode: taxIncludedUpRequired
              ? n.purchaseCurrencyCode || purchaseCurrencyCode
              : n.purchaseCurrencyCode,
          }));
      this.setState({
        pcSubjectDataSource: newPcSubjectDataSource,
        pcSubjectPagination: createPagination(res),
      });
      this.resetEditFlag();
    }
  }

  /**
   * fetchStage - 查询标的协议阶段
   * @param {object} page - 协议阶段分页条件
   */
  // @Bind()
  // fetchStage(page = {}) {
  //   const { dispatch } = this.props;
  //   const {
  //     pcHeaderId,
  //     headerInfo: { supplierCurrencyCode = 'CYN', purchaseCurrencyCode = 'CYN' },
  //   } = this.state;
  //   if (pcHeaderId) {
  //     dispatch({
  //       type: 'contractCommon/fetchStage',
  //       payload: {
  //         page,
  //         pcHeaderId,
  //         customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE',
  //       },
  //     }).then((res) => {
  //       if (res) {
  //         this.setState({
  //           pcStageDataSource: res.content.map((n) => ({
  //             ...n,
  //             _status: 'update',
  //             supplierCurrencyCode: n.supplierCurrencyCode || supplierCurrencyCode,
  //             purchaseCurrencyCode: n.purchaseCurrencyCode || purchaseCurrencyCode,
  //           })),
  //           pcStagePagination: createPagination(res),
  //         });
  //         this.resetEditFlag();
  //       }
  //     });
  //   }
  // }

  /**
   * fetchSubject - 查询业务条款数据
   * @param {object} page - 业务条款分页数据
   */
  @Bind()
  fetchTerm(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchTerm',
        payload: {
          page,
          pcHeaderId,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            termDataSource: res.map((n) => ({ ...n, _status: 'update' })),
          });
          this.resetEditFlag();
        }
      });
    }
  }

  /**
   * 查询返利信息
   * @param {*} page
   */
  @Bind()
  fetchContractRebate(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    dispatch({
      type: 'contractCommon/fetchContractRebate',
      payload: {
        page,
        pcHeaderId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          pcRebateDataSource: res.content && res.content.map((r) => ({ ...r, _status: 'update' })),
          pcRebatePagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 刷新头信息和附件列表
   */
  @Bind()
  handleRefresh() {
    this.fetchHeader();
    this.handleFetchConfigAttachment();
  }

  /**
   * 查询配置的附件列表
   */
  @Bind()
  handleFetchConfigAttachment() {
    const { pcHeaderId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'contractCommon/fetchPcAttachmentList',
      payload: pcHeaderId,
    }).then((templateList) => {
      if (templateList) {
        this.setState({
          templateList,
          templateListFlag: true,
        });
      }
    });
  }

  /**
   * 格式化时间
   * @param {*} [dataSource=[]] 数据数组
   * @param {*} [fields=[]] 字段数组
   */
  @Bind()
  formatTime(dataSource = [], fields = []) {
    if (isArray(dataSource)) {
      return dataSource.map((item) => {
        const newItem = {};
        fields.forEach((field) => {
          if (isString(item[field])) {
            newItem[field] = item[field];
          } else {
            newItem[field] = item[field]
              ? item.termType === 'DATE'
                ? item[field].format(DEFAULT_DATE_FORMAT)
                : item[field].format(DEFAULT_DATETIME_FORMAT)
              : undefined;
          }
        });
        return {
          ...item,
          ...newItem,
        };
      });
    }
  }

  /**
   * 修改头数据
   * @param {*} headerInfo
   */
  @Bind()
  handleChangeHeader(headerInfo) {
    const { pcSubjectDataSource, pcStageDataSource } = this.state;
    const { supplierCurrencyCode = null } = headerInfo;
    this.setState({
      headerInfo,
      pcSubjectDataSource: pcSubjectDataSource.map((ele) => {
        return {
          ...ele,
          currencyCode: supplierCurrencyCode || ele.currencyCode || 'CYN',
        };
      }),
      pcStageDataSource: pcStageDataSource.map((ele) => {
        return {
          ...ele,
          supplierCurrencyCode: supplierCurrencyCode || ele.supplierCurrencyCode || 'CYN',
        };
      }),
    });
  }

  /**
   * 防抖，减少渲染频率
   * @param {Function} fun 回调函数
   * @param {number} delay 延时
   */
  /* eslint-disable */
  @Bind()
  debounce(fun, delay) {
    let timeout = null;
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        fun.call(this, arguments);
      }, delay);
    };
  }
  /* eslint-enable */

  /**
   * 改变state时
   * @param {Object} params state内容
   */
  @Bind()
  handleChangeState(params) {
    this.debounce(() => this.setState(params), 300)();
  }

  @Bind()
  handleExpenseUnitChange(record = {}) {
    const { headerInfo } = this.state;
    this.setState({
      headerInfo: {
        ...headerInfo,
        costAnchDepId: record.unitId || null,
        costAnchDepDesc: record.unitName || null,
      },
    });
  }
  
  // 变更采购方式时跟新项目设置
  @Bind
  backSetList(){
    const { listAll } = this.props;
    // 总预算港币：50万 ~ 100万的金额判断
    const isTalZero = Number(listAll.talCurrencyZero) > 500000 && Number(listAll.talCurrencyZero) <= 1000000;
    const isTalZeroMore = Number(listAll.talCurrencyZero) > 1000000;
    // 技术应答表&商务应答表&评委组显示条件
    // 50~100万：50~100万&采购方式为公开招标，邀请招标
    // 100万以上：100万&采购方式为公开招标，邀请招标，公开询价，邀请询价，直接谈判
    const isContractMidle = (
      isTalZero &&
      (['public_bidding', 'invited_bidding'].includes(listAll.procurementType || listAll.purchaseType))
      ||
      isTalZeroMore &&
      (['public_bidding', 'invited_bidding', 'public_inquiry', 'invitation_inquiry', 'direct_negotiation'].includes(listAll.procurementType || listAll.purchaseType))
    )
    this.setState({ typePro: '0', activeKey: isContractMidle ? '1' : 'quotationTable'})
  }

  // key : 保错表格的activeky flag 未保存
  @Bind()
  callback(key,flag) {
    console.log('key', this.state.changeFlag, flag)
    if (flag) {
      this.handleChangeTabFlag()
      this.setState({changeFlag: true})
      return
    }
    if (this.state.changeFlag ) {
      notification.warning({
        message: intl.get(`bid.bidcommon.view.message.confirmsave`).d('请先保存数据'),
      });
      // CusModal.confirm({
      //   title: intl.get('hzero.common.message.confirm.title').d('提示'),
      //   content: intl
      //     .get(`bid.bidcommon.view.message.confirmgetout`)
      //     .d('你有修改未保存，是否确认离开?'),
      //     okType: 'normal',
      //   onOk: () => {
      //     // if (key == 1) {
      //     //   this.setState({ typePro: '0', activeKey: key, changeFlag: false })
      //     //   // this.headerInfoFormProps.purchaseFlag = '0'
      //     // } else if (key == 3) {
      //     //   // this.headerInfoFormProps.purchaseFlag = '1'
      //     //   this.setState({ typePro: '1', activeKey: key, changeFlag: false })
      //     // } else {
      //     //   this.setState(
      //     //     {
      //     //       activeKey: key,
      //     //       changeFlag: false
      //     //     }
      //     //   );
      //     // }
      //   },
      // });
    } else {
      if (key == 1) {
        this.setState({ typePro: '0', activeKey: key, changeFlag: false })
        // this.headerInfoFormProps.purchaseFlag = '0'
      } else if (key == 3) {
        // this.headerInfoFormProps.purchaseFlag = '1'
        this.setState({ typePro: '1', activeKey: key, changeFlag: false })
      } else {
        this.setState(
          {
            activeKey: key,
            changeFlag: false
          }
        );
      }
    }

  }

  @Bind
  handleChangeTabFlag() {
    this.props.onEdit(),
    console.log('key1',this.state.changeFlag)
    this.setState({ changeFlag: true })
  }

  render() {
    const {
      contractMaintain: { detailEnumMap = {}, code = {} },
      // match,
      // contractCommon: { config = {} },
      onEdit  = (e) => e,
      proId,
      listAll,
      erpAllInfo,
      form,
    } = this.props;

    console.log('erpAllInfo1', erpAllInfo)
    // const { resultList = [] } = contractMaintain

    const {
      // pcSubjectDataSource = [],
      // pcStageDataSource = [],
      // pcSubjectPagination = {},
      // pcStagePagination = {},
      // pcSubjectSelectedRows = [],
      // pcStageSelectedRows = [],
      // partnerDataSource = [],
      // partnerSelectedRows = [],
      headerInfo = {},
      typePro,
      matchs,
      activeKey,
      collapseKeys,
      // resultPagination = {},
    } = this.state;
    const headerInfoFormProps = {
      // sourceResultDTOs,
      erpAllInfo,
      matchs: {
        params: {
          proId: proId
        }
      },
      match: matchs,
      code: code,
      activeKey,
      detailEnumMap,
      // purchaseFlag: typePro, // 是否来自采购方
      //   editable,
      //   isQuoteSource,
      //   maintainEditable,
      //   alterationFlag,
      // createPurchaseOrderInfo,
      //   quoteType,
      //   onRef: (node) => {
      //     this.headerRef = node;
      //   },
      dataSource: headerInfo,
      isShow: listAll.procurementType === 'public_bidding' || listAll.procurementType === 'invited_bidding',
      getDetailList: listAll,
      detailList: this.getProjectList,
      onChangeHeader: this.handleChangeHeader,
      onChangeState: this.handleChangeState,
      handleExpenseUnitChange: this.handleExpenseUnitChange,
      isFalse: () => {
        this.setState({ changeFlag: false })
      },
      onChangeTabsFlag: this.handleChangeTabFlag,
      isTrue: () => {
        this.setState({ changeFlag: true })
      }
    };
    // 总预算港币：50万 ~ 100万的金额判断
    const isTalZero = Number(listAll.talCurrencyZero) > 500000 && Number(listAll.talCurrencyZero) <= 1000000;
    const isTalZeroMore = Number(listAll.talCurrencyZero) > 1000000;
    // 技术应答表&商务应答表&评委组显示条件
    // 50~100万：50~100万&采购方式为公开招标，邀请招标
    // 100万以上：100万&采购方式为公开招标，邀请招标，公开询价，邀请询价，直接谈判
    const isContractMidle = (
      isTalZero &&
      (['public_bidding', 'invited_bidding'].includes(listAll.procurementType || listAll.purchaseType))
      ||
      isTalZeroMore &&
      (['public_bidding', 'invited_bidding', 'public_inquiry', 'invitation_inquiry', 'direct_negotiation'].includes(listAll.procurementType || listAll.purchaseType))
    )

    // 邀请供应商显示条件
    // 50~100万：50~100万&采购方式为邀请招标，邀请询价，单一来源，内部采购，直接谈判
    // 100万以上：100万&采购方式为邀请招标，邀请询价，单一来源，内部采购，直接谈判
    const isInviteSuppliers = (
      (isTalZero || isTalZeroMore) && 
      (['invited_bidding', 'invitation_inquiry', 'single_source', 'internal_source', 'direct_negotiation'].includes(listAll.procurementType || listAll.purchaseType))
    )
    
    const tabItems = [
      isContractMidle && {
        key: '1',
        label: intl.get(`bid.bidcommon.view.title.technicalanswerformsetting`).d("技术应答表设置"),
        children: <>
          <ContractMidlle 
          onRef={
            (node) => {
              this.MidlleRef = node
            }
          } 
          purchaseFlag='0'
          {...headerInfoFormProps} />
        </>
      },
      isContractMidle && {
        key: '3',
        label: intl.get(`bid.bidcommon.view.title.businessanswerformsetting`).d("商务应答表设置"),
        children: <>
          <ContractMidlleBusiness 
          onRef={
            (node) => {
              this.MidlleRef = node
            }
          } 
          purchaseFlag='1'
          {...headerInfoFormProps} />
        </>
      },
      (['invited_bidding', 'public_bidding'].includes(form.getFieldValue('purchaseType'))) && {
        key: 'quoteSourceResult',
        label: intl.get(`bid.bidcommon.view.title.technicalscoreformsetting`).d("技术评分表设置"),
        children: <>
          <QuoteSourceResult {...headerInfoFormProps} />
        </>
      },
      // isContractMidle && {
      //   key: 'setJudgesTable',
      //   label: intl.get(`bid.bidcommon.view.title.expertsetting`).d("评委组设置"),
      //   children: <>
      //     <SetJudgesTable {...headerInfoFormProps} />
      //   </>
      // },
      (listAll.procurementType || listAll.purchaseType) && {
        key: 'quotationTable',
        label: intl.get(`bid.bidcommon.view.title.quotationformsetting`).d("报价表设置"),
        children: <>
          <QuotationTable {...headerInfoFormProps} />
        </>
      },
      isInviteSuppliers && {
        key: 'inviteSuppliers',
        label: intl.get(`bid.bidcommon.view.title.invitesuppliers`).d("邀请供应商"),
        children: <>
          <InviteSuppliers {...headerInfoFormProps} />
        </>
      },
    ].filter(Boolean);
    console.log('keye', this.state.changeFlag)
    return (
      <>
        {/* <div className={styles['card-tab']}> */}
        <Collapse
          className="customize-collapse"
          defaultActiveKey={collapseKeys}
          style={{ border: 'none' }}
          onChange={(value) => {
            this.setState({
              collapseKeys: value,
            });
          }}
        >
          <Panel
            data-border={false}
            showArrow={false}
            className="projectsetting-tab"
            header={
              <PanelHeader
                title={intl.get(`bid.bidcommon.view.title.projectsetting`).d('项目设置')}
                style={{ padding: '0', marginTop: '12px', marginBottom: '12px' }}
                verticalLine={false}
                arrowActive={collapseKeys.includes('projectsetting')}
              />
            }
            key="projectsetting"
          >
            <div style={{ marginTop: '4px', marginBottom: '24px' }}>
              <CusTabs
                // className="new-search-tab"
                defaultActiveKey={activeKey}
                destroyInactiveTabPane={true}
                activeKey={activeKey}
                items={tabItems}
                // moreIcon={false}
                onChange={this.callback}
              />
            </div>
          </Panel>
        </Collapse>
        {/* <PanelHeader
          title={intl.get(`bid.bidcommon.view.title.projectsetting`).d('项目设置')}
          style={{ paddingLeft: '0', marginTop: '24px', borderTop: '1px soild #DEE0E3' }}
          showArrow={true}
          verticalLine={false}
        />
        <CusTabs
          className="new-search-tab"
          defaultActiveKey={activeKey}
          activeKey={activeKey}
          items={tabItems}
          // moreIcon={false}
          onChange={this.callback}
        /> */}
        {/* </div> */}
      </>
    );
  }
}
