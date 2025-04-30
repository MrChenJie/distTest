/*
 * ContractMaintainDetail - erp-项目设置
 * @date: 2022-05-23
 * @author: CJ <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { Component, Fragment } from 'react';
import { Modal, Tabs, LocaleProvider } from 'hzero-ui';
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
// import styles from './index.less';
import ContractMidlle from '../components/ContractMidlle';
import QuotationTable from '../ContractMaintain/SetQuotationTable'
import QuoteSourceResult from '../ContractMaintain/QuoteSourceResult'
// import SetJudgesTable from '../ContractMaintain/SetJudgesTable'
import InviteSuppliers from '../ContractMaintain/InviteSuppliers'
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';

const { TabPane } = Tabs;
const viewMessagePrompt = 'spcm.common.view.message.title';
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
      activeKey: '1',
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
      changeFlag: false
    };
  }

  componentDidMount() {
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
    // if (pcHeaderId && isNumber(+pcHeaderId)) {
    // this.fetchHeader();
    //   this.fetchList();
    // }
    // this.fetchConfigSetting();
  }


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

  @Bind()
  callback(key) {
    // console.log('key',key)
    if (this.state.changeFlag) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        content: intl
          .get(`bid.bidcommon.view.message.confirmgetout`)
          .d('你有修改未保存，是否确认离开?'),
        onOk: () => {
          if (key == 1) {
            this.setState({ typePro: '0', activeKey: key,changeFlag:false })
            // this.headerInfoFormProps.purchaseFlag = '0'
          } else if (key == 3) {
            // this.headerInfoFormProps.purchaseFlag = '1'
            this.setState({ typePro: '1', activeKey: key,changeFlag:false })
          } else {
            this.setState(
              {
                activeKey: key,
                changeFlag:false
              }
            );
          }
        },
      });
    } else {
      if (key == 1) {
        this.setState({ typePro: '0', activeKey: key,changeFlag:false })
        // this.headerInfoFormProps.purchaseFlag = '0'
      } else if (key == 3) {
        // this.headerInfoFormProps.purchaseFlag = '1'
        this.setState({ typePro: '1', activeKey: key,changeFlag:false })
      } else {
        this.setState(
          {
            activeKey: key,
            changeFlag:false
          }
        );
      }
    }

  }

  render() {
    const {
      location,
      queryingHeader = false,
      queryingPartner = false,
      queryingSubject = false,
      queryingStage = false,
      queryingTerm = false,
      saving = false,
      // deleteHeaderLoading = false,
      submitContractLoading = false,
      // deletePcSubjectLoading = false,
      // deletePcStageLoading = false,
      // deletePartnerLoading = false,
      queryingPcAttachmentList = false,
      contractMaintain: { detailEnumMap = {}, code = {} },
      // match,
      // contractCommon: { config = {} },
      proId,
      listAll
    } = this.props;
    // const { resultList = [] } = contractMaintain

    const {
      templateListFlag,
      operationRecordVisible,
      headerEdited,
      termEdited,
      partnerEdited,
      pcSubjectEdited,
      pcStageEdited,
      templateList,
      fullScreenFlag,
      // pcSubjectDataSource = [],
      // pcStageDataSource = [],
      // pcSubjectPagination = {},
      // pcStagePagination = {},
      // pcSubjectSelectedRows = [],
      // pcStageSelectedRows = [],
      // partnerDataSource = [],
      // partnerSelectedRows = [],
      headerInfo = {},
      listEll,
      // termDataSource = [],
      // termSelectedRows = [],
      // activeKey,
      isQuoteSource,
      // backPath = {},
      // from = undefined,
      pcRebateEdited,
      // pcRebateDataSource,
      // pcRebatePagination,
      // pcRebateSelectedRows,
      quoteType,
      typePro,
      matchs,
      activeKey,
      // resultPagination = {},
    } = this.state;

    const queryingList = queryingPartner || queryingSubject || queryingStage || queryingTerm;
    // const { search = {} } = location;
    // const { pcHeaderId = headerInfo.pcHeaderId } = querystring.parse(search.substr(1));
    const pcHeaderId = headerInfo.pcHeaderId;
    const editable = !pcHeaderId;
    const maintainEditable = true;
    // const checkArtificial = true;
    // console.log('123123',this.props.match.params.status)
    // console.log('matchs',matchs)
    const headerInfoFormProps = {
      // sourceResultDTOs,
      matchs: {
        params: {
          proId: proId
        }
      },
      match: matchs,
      code: code,
      detailEnumMap,
      purchaseFlag: typePro, // 是否来自采购方
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
      isTrue: () => {
        this.setState({ changeFlag: true })
      }
    };
    return (
      <Fragment>
        <LocaleProvider locale={getCurrentLanguage() === 'zh_CN' ? zhCN : undefined}>
          <Tabs defaultActiveKey="1" onChange={this.callback} activeKey={activeKey}>
            <TabPane tab={intl.get(`bid.bidcommon.view.title.technicalanswerformsetting`).d("技术应答表设置")} key="1">{activeKey == '1' && <ContractMidlle {...headerInfoFormProps} />}</TabPane>
            <TabPane tab={intl.get(`bid.bidcommon.view.title.businessanswerformsetting`).d("商务应答表设置")} key="3">{activeKey == '3' && <ContractMidlle {...headerInfoFormProps} />}</TabPane>
            {(listAll.procurementType === 'invited_bidding' || listAll.procurementType === 'public_bidding') && <TabPane tab={intl.get(`bid.bidcommon.view.title.technicalscoreformsetting`).d("技术评分表设置")} key="quoteSourceResult">{activeKey =='quoteSourceResult'&&<QuoteSourceResult {...headerInfoFormProps} />}</TabPane>}
            {(listAll.specialQuotationProject !== 'YES' && listAll.confidentialItems !== 'YES') && <TabPane tab={intl.get(`bid.bidcommon.view.title.quotationformsetting`).d("报价表设置")} key="quotationTable">{activeKey =='quotationTable'&&<QuotationTable {...headerInfoFormProps} />}</TabPane>}
            {(listAll.procurementType === 'invited_bidding' || listAll.procurementType === 'invite_negotiation' || listAll.procurementType === 'single_source' || listAll.procurementType === 'invitation_inquiry') && <TabPane tab={intl.get(`bid.bidcommon.view.title.invitesuppliers`).d("邀请供应商")} key="inviteSuppliers">{activeKey =='inviteSuppliers'&&<InviteSuppliers {...headerInfoFormProps} />}</TabPane>}
          </Tabs>
        </LocaleProvider>
      </Fragment>
    );
  }
}
