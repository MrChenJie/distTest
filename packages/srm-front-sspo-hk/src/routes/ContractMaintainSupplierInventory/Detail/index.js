/*
 * ContractMaintainDetail - 协议维护详情
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button, Spin, Modal, Row, Col, LocaleProvider, Card, Tabs,} from 'hzero-ui';
import { connect } from 'dva';
import { isNumber, isEmpty, omit, merge, isArray, isString } from 'lodash';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
import { SRM_BID } from '@/common/config';
import { Content } from 'components/Page';
import {
  getEditTableData,
  getCurrentOrganizationId,
  addItemToPagination,
  filterNullValueObject,
  createPagination,
  delItemsToPagination,
  addItemsToPagination,
  getCurrentLanguage
} from 'utils/utils';
import intl from 'utils/intl';
// import { SRM_SPUC } from '_utils/config';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { isNullOrUndefined } from 'util';
import {
  DEFAULT_DATETIME_FORMAT,
  DEFAULT_DATE_FORMAT,
  DETAIL_DEFAULT_CLASSNAME,
  DETAIL_CARD_CLASSNAME,
} from 'utils/constants';
import request from 'utils/request';
import styles from './index.less';
import ContractHeader from '../../components/ContractHeader';
import ContractMidlle from '../../components/ContractMidlle';
import ContractEnd from '../../components/ContractEnd';
import ContractEndOld from '../../components/ContractEndOld';
// import ContractSubject from '../../components/ContractSubject';
// import ContractStage from '../../components/ContractStage';
// import ContractPartner from '../../components/ContractPartner';
// import ContractBusinessTerms from '../../components/ContractBusinessTerms';
// import ContractRebate from '../../components/ContractRebate';
import OperationRecord from '../../components/OperationRecord';
import EditorOnline from '../../components/EditorOnline';
import Attachment from '../../components/Upload';
import QuotationTable from '../../ContractMaintain/SetQuotationTable'
import QuoteSourceResult from '../../ContractMaintain/QuoteSourceResult'
import SetJudgesTable from '../../ContractMaintain/SetJudgesTable'
import InviteSuppliers from '../../ContractMaintain/InviteSuppliers'
import contractMaintain from '@/models/contractMaintain';

import zh_CN from 'hzero-ui/lib/locale-provider/zh_CN';
// const { Link } = Anchor;
const { TabPane } = Tabs;
const viewMessagePrompt = 'spcm.common.view.message.title';
const currentLanguage = getCurrentLanguage();
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
  code: [
    'spcm.contractMaintain',
    'spcm.common',
    'spcm.purchaseRequisitionCreation',
    'entity.company',
    'entity.supplier',
    'hzero.common',
    'bid.bidcommon',
    'bid.biddashbord'
  ],
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
      location: { search },
      match,
    } = this.props;
    const { pcHeaderId, itemKey, isQuoteSource, quoteType } = querystring.parse(search.substr(1));
    this.state = {
      pcHeaderId,
      itemKey,
      typePro:0,
      headerInfo: {},
      listAll: {},
      listEll:[],
      matchs:match,
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
      activeKey: 'contractSubjectInfo',
      backPath: {
        purchaseContract: '/spcm/contract-maintain/purchase-contract',
        purchaseOrder: '/spcm/contract-maintain/quote-purchase-order',
        default: '/spcm/contract-maintain/list',
      },
      from: '',
      isQuoteSource,
      pcRebateDataSource: [],
      pcRebatePagination: {},
      pcRebateSelectedRows: [],
      quoteType, // 引用类型
      changeFlag:false,
      activeKey:'1'
    };
  }

  componentDidMount() {
    const { pcHeaderId } = this.state;
    const {
      location: { search },
    } = this.props;
    const { from } = querystring.parse(search.substr(1));
    this.setState({
      from,
    });
    
    // 从其他页面带过来的默认值要放在最前面，避免覆盖已经保存的值
    this.resetDataFromStorage();
    this.fetchEnum();
    this.getProjectList();
    if (pcHeaderId && isNumber(+pcHeaderId)) {
      // this.fetchHeader();
      this.fetchList();
    }
    // this.fetchConfigSetting();
  }

  componentWillReceiveProps(){
    this.setState({})
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
   * save - 保存明细数据
   * 保存明细头数据和行明细相关字段
   * @param {Object} params 保存信息
   */
  @Bind()
  async save(params = {}) {
    const { listAll } = this.state;
    // listAll.proState = true
    // console.log(listAll)
    const param = [{...listAll}]
    request(
      `${SRM_BID}/v1/${organizationId}/bid-pro-infos` ,
      {
        method: 'POST',
        body:param

      }
    ).then((res) => {
        if (res) {
          // console.log(res)
          notification.success();
          this.state.matchs.params.status =  'proId'
          this.state.matchs.params.proId =  res[0].proId
          this.setState({matchs:this.state.matchs})
          this.getProjectList()
      }
    })
    // const { dispatch } = this.props;
    // dispatch({
    //   type: 'contractCommon/saveProject',
    //   body: param,
    // }).then((res) => {
    //   if (res) {
    //     this.setState({
          
    //     });
    //   }
    // });
  }

  // @Bind()
  // changeSourceLineNumToResultId(dataArr = []) {
  //   const arr = dataArr.map(item => ({
  //     ...item,
  //     sourceLineNum: item.resultId,
  //   }));
  //   return arr;
  // }

  /**
   * 更新协议
   * @param {Object} [params={}] 更细内容
   * @param {Number} [oldEditStep] 协议所处阶段 1重新刷新协议文本 0则不刷新
   */
  @Bind()
  handleUpdateContract(params = {}, oldEditStep) {
    const {
      tenantId,
      headerInfo = {},
      pcSubjectDataSource = [],
      pcStageDataSource = [],
      partnerDataSource = [],
      termDataSource = [],
      pcRebateDataSource = [],
      pcHeaderId,
    } = this.state;
    const { dispatch } = this.props;
    const { editStep, pcKindCode } = headerInfo;
    this.headerRef.props.form.validateFieldsAndScroll({ force: true }, (errs, values) => {
      if (!errs) {
        Promise.all([
          this.validateEditTableDataSource(pcSubjectDataSource, ['pcSubjectId'], {
            force: true,
          }),
          this.validateEditTableDataSource(pcStageDataSource, ['pcStageId'], {
            force: true,
          }),
          this.validateEditTableDataSource(partnerDataSource, ['partnerId'], {
            force: true,
          }),
          headerInfo.pcKindCode !== 'ATTACHMENT'
            ? this.validateEditTableDataSource(termDataSource, ['termId'], { force: true })
            : Promise.resolve([]),
          headerInfo.rebateFlag
            ? this.validateEditTableDataSource(pcRebateDataSource, ['rebateInformationId'], {
              force: true,
            })
            : Promise.resolve([]),
        ]).then(
          ([
            pcSubjectDetailDTOList,
            pcStageDetailDTOList,
            pcPartnerDetailDTOList,
            pcTermDetailDTOList = [],
            pcRebateInformationlist = [],
          ]) => {
            const { startDateActive, endDateActive, overseasProcurement } = values;
            const headerData = {
              tenantId,
              ...values,
              ...params,
              startDateActive: startDateActive
                ? startDateActive.format(DEFAULT_DATETIME_FORMAT)
                : undefined,
              endDateActive: endDateActive
                ? endDateActive.format(DEFAULT_DATETIME_FORMAT)
                : undefined,
              overseasProcurement: overseasProcurement ? 1 : 0,
            };
            dispatch({
              type: 'contractMaintain/update',
              payload: {
                ...headerInfo,
                ...headerData,
                mainContractId: headerData.mainContractId,
                pcPartnerDetailDTOList,
                pcSubjectDetailDTOList: this.formatTime(pcSubjectDetailDTOList, ['deliverDate']),
                pcStageDetailDTOList: this.formatTime(pcStageDetailDTOList, ['milestoneTime']), // 这里待修改
                pcTermDetailDTOList: [
                  ...pcTermDetailDTOList.filter(
                    (item) => !['DATE', 'DATETIME'].includes(item.termType)
                  ),
                  ...this.formatTime(
                    pcTermDetailDTOList.filter((item) =>
                      ['DATE', 'DATETIME'].includes(item.termType)
                    ),
                    ['termContent']
                  ),
                ],
                pcRebateInformationlist: this.formatTime(pcRebateInformationlist, [
                  'validityDateFrom',
                  'validityDateTo',
                ]),
                customizeUnitCode:
                  'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL,SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT,SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE,SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
              },
            }).then((res) => {
              if (res) {
                notification.success();
                this.fetchHeader().then(() => {
                  if (oldEditStep === 1) {
                    const n = document.querySelector(
                      `a[href="#spcm-contract-maintain-detail-contract-online-edit"]`
                    );
                    if (pcHeaderId && editStep === 1 && pcKindCode !== 'ATTACHMENT') {
                      this.editorOnlineRef.fetchEditorOnlineHTML();
                    }
                    n.click();
                  }
                });
                this.fetchList();
                partnerDataSource.forEach((i) => i.$form.resetFields());
              }
            });
          }
        );
      }
    });
  }

  /**
   * 更新头上的协议文本类型附件url
   * @param {Object} headerInfo 头信息
   */
  @Bind()
  handleUpdateContractTextUrl(headerInfo) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractMaintain/updateContractTextUrl',
      payload: headerInfo,
    });
  }

  /**
   * 行内校验
   * @param {Array} [dataSource=[]] 数据源
   * @param {Array} [excludeKeys=[]] 排除的字段
   * @param {Object} [property={}] 校验API的options
   */
  @Bind()
  async validateEditTableDataSource(dataSource = [], excludeKeys = [], property = {}) {
    if (dataSource.length === 0) {
      return dataSource;
    }
    if (dataSource.length > 0 && !dataSource[0].$form) {
      return dataSource;
    }
    return new Promise((resolve, reject) => {
      const validateDataSource = getEditTableData(dataSource, excludeKeys, property);
      if (validateDataSource.length === 0) {
        reject();
      } else {
        resolve(validateDataSource);
      }
    });
  }

  /**
   * 提交的时候校验头上附件必输
   */
  @Bind()
  attachmentRequiredCheck() {
    const { headerInfo = {}, templateList = [] } = this.state;
    const msg = [];
    templateList.forEach((item) => {
      if (item.nullableFlag === 0 && !item.attachmentUrl) {
        msg.push(item.attachmentTypeName);
      }
    });
    if (headerInfo.pcKindCode === 'ATTACHMENT' && !headerInfo.contractAttachmentUrl) {
      msg.push(intl.get(`${viewMessagePrompt}.contractAttachment`).d('协议文本'));
    }
    if (msg.length > 0) {
      notification.warning({
        message: intl.get('hzero.common.validation.notNull', {
          name: msg.join(','),
        }),
      });
      return null;
    } else {
      return 1;
    }
  }


  @Bind()
  getProjectList() {
    const {  matchs } = this.state;
    request(
      `${SRM_BID}/v1/${organizationId}/bid-pro-infos/getProInfoDetail?${matchs.params.status}=${matchs.params.proId}` ,
      {
        method: 'GET',

      }
    ).then((res) => {
      this.setState({ listAll : res })
    })
    const {listAll} = this.state
    const milestoneType = listAll.purchaseType || 'public_bidding'
    
    request(
      `${SRM_BID}/v1/${organizationId}/bid-milestones/listBidMilestone/${matchs.params.proId}` ,
      {
        method: 'GET',

      }
    ).then((res) => {
      
      this.setState({ listEll : res })
    })
  }
  /**
   * preSubmit - 提交采购协议前置modal弹窗
   */
  @Bind()
  preSubmit() {
    const { matchs } = this.state;
    if (matchs.params.status!='parentId') {
      request(
        `${SRM_BID}/v1/${organizationId}/bid-pro-infos/submitPro/${matchs.params.proId}` ,
        {
          method: 'GET',
  
        }
      ).then((res) => {
        if (res) {
          notification.success();
          }
      })
    } 
  }

  /**
   * submit - 采购申请提交
   */
  @Bind()
  submit() {
    const { dispatch } = this.props;
    const {
      headerInfo = {},
      pcSubjectDataSource = [],
      partnerDataSource = [],
      termDataSource = [],
      isQuoteSource,
      itemKey,
      pcRebateDataSource = [],
    } = this.state;
    // pcSourceCode 有3种情况，为空=普通创建协议，
    // SEARCH_SOURCE_RESULT 我引用寻源 创建的协议
    // PURCHASE_NEED 我引用采购申请 创建的协议
    // 注意： isQuoteSource 字段只能判断是否为 引用寻源 创建的协议
    let pcSourceCode = '';
    if (Number(isQuoteSource) === 1 && isNullOrUndefined(itemKey)) {
      pcSourceCode = 'SEARCH_SOURCE_RESULT';
    } else if (isNullOrUndefined(isQuoteSource) && !isNullOrUndefined(itemKey)) {
      pcSourceCode = 'PURCHASE_NEED';
    }
    if (this.headerRef && this.headerRef.props.form) {
      this.headerRef.props.form.validateFieldsAndScroll({ force: true }, (errs, values) => {
        if (!errs) {
          Promise.all([
            this.validateEditTableDataSource(pcSubjectDataSource, ['pcSubjectId'], {
              force: true,
            }),
            this.validateEditTableDataSource(partnerDataSource, ['partnerId'], {
              force: true,
            }),
            headerInfo.pcKindCode !== 'ATTACHMENT'
              ? this.validateEditTableDataSource(termDataSource, ['termId'], { force: true })
              : Promise.resolve([]),
            headerInfo.rebateFlag
              ? this.validateEditTableDataSource(pcRebateDataSource, ['rebateInformationId'], {
                force: true,
              })
              : Promise.resolve([]),
          ]).then(() => {
            if (this.attachmentRequiredCheck()) {
              const { startDateActive, endDateActive, overseasProcurement } = merge(
                headerInfo,
                values
              );
              const { pcHeaderIdSet, ...pcHeader } = {
                ...headerInfo,
                ...values,
                startDateActive: startDateActive
                  ? startDateActive.format(DEFAULT_DATETIME_FORMAT)
                  : undefined,
                endDateActive: endDateActive
                  ? endDateActive.format(DEFAULT_DATETIME_FORMAT)
                  : undefined,
                overseasProcurement: overseasProcurement ? 1 : 0,
                pcSourceCode,
              };
              dispatch({
                type: 'contractMaintain/submit',
                payload: {
                  pcHeaderList: [omit(pcHeader, ['insertPcStageList'])],
                  customizeUnitCode:
                    'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL,SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT,SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE,SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
                },
              }).then((res) => {
                if (res) {
                  notification.success();
                  this.props.history.push('/spcm/contract-maintain/list');
                } else {
                  this.fetchHeader();
                  this.fetchList();
                }
              });
            }
          });
        }
      });
    }
  }

  /**
   * delete 删除采购申请
   */
  @Bind()
  delete() {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;
    Modal.confirm({
      title: intl.get(`${viewMessagePrompt}.confirmDelete`).d('是否删除'),
      onOk: () => {
        dispatch({
          type: 'contractMaintain/delete',
          payload: [headerInfo],
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/spcm/contract-maintain/list`,
              })
            );
          }
        });
      },
    });
  }

  /**
   * handleAddLines - 新增行
   * @param {String} key - 新增对应的行数据
   */
  @Bind()
  handleAddLines(key, primaryKey) {
    const sourceField = `${key}DataSource`;
    const paginationField = `${key}Pagination`;
    const rowKey = primaryKey || `${key}Id`;
    const {
      [sourceField]: dataSource = [],
      [paginationField]: pagination = {},
      headerInfo: { supplierCurrencyCode = 'CYN', purchaseCurrencyCode = 'CYN' },
    } = this.state;
    const currencyProps = {
      currencyCode: supplierCurrencyCode,
      supplierCurrencyCode,
      purchaseCurrencyCode,
    };
    const newItem = { _status: 'create', [rowKey]: uuid(), edited: true, ...currencyProps };
    const params = {
      [sourceField]: [newItem, ...dataSource],
      [paginationField]: addItemToPagination(dataSource.length, pagination),
    };
    this.setState({ ...params });
  }

  /**
   * addLines - 新增标的行
   */
  @Bind()
  addSubjectLines(selectedListRows) {
    const {
      pcSubjectDataSource,
      pcSubjectPagination,
      headerInfo: { supplierCurrencyCode = 'CYN', purchaseCurrencyCode = 'CYN' },
    } = this.state;
    this.setState({
      pcSubjectDataSource: [
        ...pcSubjectDataSource,
        ...selectedListRows.map((n, index) => ({
          ...n,
          _status: 'create',
          edited: true,
          sourceCode: n.sourceNum || n.prNum, // sourceCode取寻源或者是需求的号码
          deliverDate: n.deliverDate || n.neededDate,
          quantity: n.availableQuantity || n.quantity,
          lineNum: pcSubjectDataSource.length + index + 1,
          sourceLineNum: n.itemNum || n.lineNum,
          pcSubjectId: uuid(),
          currencyCode: n.currencyCode || supplierCurrencyCode,
          purchaseCurrencyCode: n.purchaseCurrencyCode || purchaseCurrencyCode,
          prLineNum: pcSubjectDataSource.length + index + 1,
          unitPriceBatch: n.priceBatchQuantity || n.unitPriceBatch,
          exchangeRate: 1,
          //  priceShieldFlag: undefined,
          // poLineLocationDeleteFlag: undefined,
          //  tmpOrganizationId: n.invOrganizationId,
          //  enteredTaxIncludedPrice: n.taxIncludedUnitPrice || null,
        })),
      ],
      pcSubjectPagination: addItemsToPagination(
        selectedListRows.length,
        pcSubjectDataSource.length,
        pcSubjectPagination
      ),
      pcSubjectEdited: true,
    });
  }

  /**
   * handleDeleteLines - 删除采购申请行
   */
  @Bind()
  handleDeleteLines(key, primaryKey) {
    const sourceField = `${key}DataSource`;
    const paginationField = `${key}Pagination`;
    const selectedField = `${key}SelectedRows`;
    const actionField = `${key}LinesDelete`;
    const rowKey = primaryKey || `${key}Id`;
    const { dispatch } = this.props;
    const {
      pcHeaderId,
      [sourceField]: dataSource = [],
      [paginationField]: pagination = {},
      [selectedField]: selectedRows = [],
    } = this.state;
    const newDataSource = [];
    const deleteList = [];
    Modal.confirm({
      title: intl.get(`${viewMessagePrompt}.confirmDelete`).d('是否删除'),
      onOk: () => {
        const selectedRowKeys = selectedRows.map((n) => n[rowKey]);
        dataSource.forEach((item) => {
          if (!selectedRowKeys.includes(item[rowKey])) {
            newDataSource.push(item);
          } else if (item._status !== 'create') {
            deleteList.push(omit(item, ['$form']));
          }
        });
        if (!isEmpty(deleteList)) {
          const editedData = dataSource.filter((item) => item.edited);
          if (!this.checkModified(key, selectedRows, dataSource) || editedData.length > 0) {
            Modal.confirm({
              title: intl
                .get(`${viewMessagePrompt}.lostData`)
                .d('存在未保存数据，继续将导致数据丢失，是否继续'),
              onOk: () => {
                dispatch({
                  type: `contractMaintain/${actionField}`,
                  payload: {
                    pcHeaderId,
                    body: deleteList,
                  },
                }).then((res) => {
                  if (res) {
                    if (res) {
                      this.setState({ [selectedField]: [] });
                      notification.success();
                      this.fetchHeader();
                      this.fetchList();
                    }
                  }
                });
              },
            });
          } else {
            dispatch({
              type: `contractMaintain/${actionField}`,
              payload: {
                pcHeaderId,
                body: deleteList,
              },
            }).then((res) => {
              if (res) {
                if (res) {
                  this.setState({ [selectedField]: [] });
                  notification.success();
                  this.fetchHeader();
                  this.fetchList();
                }
              }
            });
          }
        } else {
          this.setState({
            [sourceField]: newDataSource,
            [paginationField]: delItemsToPagination(
              selectedRows.length,
              dataSource.length,
              pagination
            ),
          });
          this.setState({ [selectedField]: [] });
        }
      },
    });
  }

  /**
   * 检查是否有非本条外的项修改过
   * @param {*} key
   * @param {*} selectedRows
   * @param {*} dataSource
   */
  @Bind()
  checkModified(key) {
    // 如果是删除当前列表，则判断删除条数是否等于总条数，不是则提示
    // 如果删除的不是当前已修改列表，则提示
    /**
     * key: ['pcSubject', 'partner']
     * headerEdited: false, // 头是否编辑过
      pcSubjectEdited: false,
      partnerEdited: false,
     */
    const { headerEdited, pcSubjectEdited, pcStageEdited, partnerEdited } = this.state;
    if (
      key === 'pcSubject' &&
      !headerEdited &&
      !partnerEdited
      // selectedRows.length >= dataSource.length
    ) {
      return 1;
    } else if (
      key === 'partner' &&
      !headerEdited &&
      !pcSubjectEdited &&
      !pcStageEdited
      // selectedRows.length >=
      //   dataSource.filter(i => i._status === 'update' && i.predefinedFlag !== 1).length
    ) {
      return 1;
    } else {
      return null;
    }
  }

  /**
   * 修改行数据
   * @param {Array} listDataSource
   */
  @Bind()
  handleChangeList(listDataSource) {
    this.setState(listDataSource);
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
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * 改变模态框显示状态
   * @param {String} modalVisible 字段
   * @param {Boolean} flag 值
   * @param {Object} [otherParams={}] 其他参数
   */
  @Bind()
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  // /**
  //  * getParent-获取 dom 的parent
  //  * @param {HTMLElement} dom
  //  */
  // @Bind()
  // getParent(dom) {
  //   const parent = dom && dom.parentNode.parentNode;
  //   return parent && parent.nodeType !== 11 ? parent : null;
  // }

  // /**
  //  * getAffixContainer-获取给 Affix 组件使用的元素
  //  * @return {HTMLElement}
  //  */
  // @Bind()
  // getAffixContainer() {
  //   const parent = this.getParent(
  //     document.getElementById('spcm-contract-maintain-detail-content-inner-wrapper')
  //   );
  //   return parent || document.body;
  // }

  // /**
  //  * 设置选中行
  //  * @param {Array} selectedRowKeys 选中的主键
  //  * @param {Array} selectedRows 选中的行
  //  * @param {String} field 字段前缀
  //  */
  // @Bind()
  // handleChangeSelection(selectedRowKeys, selectedRows, field) {
  //   if(selectedRowKeys){

  //   }
  //   this.setState({
  //     [`${field}SelectedRows`]: selectedRows,
  //   });
  // }

  // /**
  //  * 改变标的信息分页前的回调
  //  */
  // @Bind()
  // handlePreSearchPcSubject(page) {
  //   const { headerEdited, pcSubjectEdited, partnerEdited, termEdited, pcRebateEdited } = this.state;
  //   const edited = headerEdited || pcSubjectEdited || partnerEdited || termEdited || pcRebateEdited;
  //   if (edited) {
  //     Modal.confirm({
  //       title: intl
  //         .get(`${viewMessagePrompt}.lostData`)
  //         .d('存在未保存数据，继续将导致数据丢失，是否继续'),
  //       onOk: () => this.fetchSubject(page),
  //       onCancel: () => this.forceUpdate(),
  //     });
  //   } else {
  //     this.fetchSubject(page);
  //   }
  // }

  // /**
  //  * 改变 阶段信息 分页前的回调
  //  */
  // @Bind()
  // handlePreSearchPcStage(page) {
  //   const { headerEdited, pcStageEdited, partnerEdited, termEdited, pcRebateEdited } = this.state;
  //   const edited = headerEdited || pcStageEdited || partnerEdited || termEdited || pcRebateEdited;
  //   if (edited) {
  //     Modal.confirm({
  //       title: intl
  //         .get(`${viewMessagePrompt}.lostData`)
  //         .d('存在未保存数据，继续将导致数据丢失，是否继续'),
  //       onOk: () => this.fetchSubject(page),
  //       onCancel: () => this.forceUpdate(),
  //     });
  //   } else {
  //     this.fetchStage(page);
  //   }
  // }

  /**
   * 选定物料后查询对应的品类定义
   * @param {Number} itemId 物料id
   */
  // @Bind()
  // handleFetchCategory(itemId) {
  //   const { dispatch } = this.props;
  //   return dispatch({
  //     type: 'contractMaintain/fetchCategory',
  //     payload: {
  //       itemId,
  //       enabledFlag: 1,
  //     },
  //   });
  // }

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

  // /**
  //  * 查询扩展信息
  //  * @param {Number} companyId 公司Id
  //  * @returns Promise(result)
  //  */
  // @Bind()
  // handleFetchExtended(companyId) {
  //   const { dispatch } = this.props;
  //   const {
  //     headerInfo: { pcHeaderId },
  //   } = this.state;
  //   return dispatch({
  //     type: 'contractMaintain/fetchExtended',
  //     payload: {
  //       companyId,
  //       pcHeaderId,
  //     },
  //   });
  // }

  /**
   * handleVisible - 通过协议-打开模态框
   * @param {String} field 设置的字段
   * @param {Boolean} flag 设置的值
   */
  @Bind()
  fullScreen(field, flag) {
    this.setState({ [field]: !!flag });
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

  /**
   * handleRecordChange - 监听行内修改
   * @param {Object} 行数据
   */
  @Bind()
  handleRecordChange(record) {
    const dataSource = this.state.pcSubjectDataSource;
    const newDataSource = dataSource.map((item) => {
      if (item.pcSubjectId === record.pcSubjectId) {
        return {
          ...item,
          edited: true,
        };
      }
      return item;
    });
    this.setState({
      pcSubjectDataSource: newDataSource,
    });
  }

  /**
   * 保存激活的tab的key
   * @param {String} activeKey
   */
  @Bind()
  handleSaveKey(activeKey) {
    this.setState({ activeKey });
  }


  

 

  

  
  @Bind()
  callback(key) {
    console.log('key',this.state.changeFlag)
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
      contractMaintain: {  detailEnumMap = {}, code= {},supplierPagination = {} },
      // match,
      // contractCommon: { config = {} },
      history,
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
      listAll,
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
      activeKey
      // resultPagination = {},
    } = this.state;
    const edited =
      headerEdited ||
      pcSubjectEdited ||
      pcStageEdited ||
      partnerEdited ||
      termEdited ||
      pcRebateEdited;
    const {
      attachmentUuid,
      supplierAttachmentUuid,
      // editStep,
      alterationFlag,
      // rebateFlag,
    } = headerInfo;
    const queryingList = queryingPartner || queryingSubject || queryingStage || queryingTerm;
    const { search = {} } = location;
    const { pcHeaderId = headerInfo.pcHeaderId } = querystring.parse(search.substr(1));
    const editable = !pcHeaderId;
    const maintainEditable = true;
    // const checkArtificial = true;
    // console.log('123123',this.props.match.params.status)
    // console.log('matchs',matchs)
    const headerInfoFormProps = {
      // sourceResultDTOs,
      supplierPagination,
      matchs,
      match:matchs,
      code:code,
      detailEnumMap,
      purchaseFlag: typePro, // 是否来自采购方
      editable,
      isQuoteSource,
      maintainEditable,
      alterationFlag,
      disabled:true,
      // createPurchaseOrderInfo,
      quoteType,
      onRef: (node) => {
        this.headerRef = node;
      },
      dataSource: headerInfo,
      isShow:listAll.purchaseType === 'public_bidding'|| listAll.purchaseType ==='invited_bidding',
      getDetailList:listAll,
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
    const endList = {
      getEndList:listEll,
      // form,
      history,
      getDetailList:listAll,
      matchs,
      match:matchs,
      detailEnumMap,
      handleEdit:this.getProjectList,
      reChange:this.getProjectList,
      onChange: this.showFile,
    }
   
    const attachmentProps = {
      templateListFlag,
      headerInfo,
      templateList,
      supplierAttachmentUuid,
      width: 610,
      onChangeState: (state) => {
        this.setState(state);
      },
      attachmentUUID: attachmentUuid,
      onUpdateHeader: this.handleUpdateContractTextUrl,
      onFetchHeader: this.fetchHeader,
      onRefresh: this.handleRefresh,
      purchaserParams: { purchaserUploadFlag: true },
      btnProps: {
        disabled: !pcHeaderId || queryingPcAttachmentList || queryingHeader || edited,
        btnText: intl.get(`bid.bidcommon.view.title.uploadattachment`).d('附件上传'),
      },
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };

    const ModalProps = {
      width: '100%',
      height: document.body.clientHeight,
      visible: fullScreenFlag,
      onCancel: () => this.fullScreen('fullScreenFlag', false),
      footer: null,
      closable: false,
    };
    const isPub = this.props.location.pathname.includes('pub'); // 判断是否为pub页面;
    return (
      <Fragment>
        {/* <Header
          title={intl
            .get(`bid.bidcommon.view.title.creatxinjianxm`)
            .d('新建项目')}
          backPath={ `${isPub ? '/pub' : ''}/sspo/online-purchase/list` }
        > */}
          {/* <Button
            loading={submitContractLoading}
            icon="check"
            onClick={this.preSubmit}
            type="primary"
          >
            {intl.get(`bid.bidcommon.view.button.submit`).d('提交')}
          </Button>
          <Button loading={saving} onClick={this.save} icon="save" type="primary">
            
            {intl.get(`view.button.save`).d('保存')}
          </Button> */}
          {/* {!isEmpty(headerInfo) && templateListFlag && <Attachment {...attachmentProps} />} */}
          
        {/* </Header> */}
        <Content>
          <div id="spcm-contract-maintain-detail-content-inner-wrapper">
            <Spin
              spinning={queryingHeader || queryingPartner || queryingList}
              wrapperClassName={classnames(
                styles['contract-maintain-spin-wrapper'],
                DETAIL_DEFAULT_CLASSNAME
              )}
            >
              <Row gutter={24}>
                <Col span={24}>
                  <Card
                    key="contractHeaderInformation"
                    id="spcm-contract-maintain-detail-contract-header-information"
                    bordered={false}
                    className={DETAIL_CARD_CLASSNAME}
                    title={
                      <h3>
                        {intl
                          .get(`bid.bidcommon.view.title.projectbasicxinxi`)
                          .d('项目基本信息')}
                      </h3>
                    }
                  >
                    <ContractHeader {...headerInfoFormProps} />
                  </Card>
                </Col>
              </Row>
              {matchs.params.status!='parentId'&&(
              <Row gutter={24}>
                <Col span={24}>
                  <Card
                    key="contractHeaderInformation"
                    id="spcm-contract-maintain-detail-contract-header-information"
                    bordered={false}
                    className={DETAIL_CARD_CLASSNAME}
                    title={
                      <h3>{intl.get(`bid.bidcommon.view.title.projectsetting`).d('项目设置')}</h3>
                    }
                  >
                    <LocaleProvider locale={currentLanguage === 'en_US' ? undefined : zh_CN}>
                      <Tabs defaultActiveKey="1" onChange={this.callback} activeKey={activeKey}>
                        <TabPane tab={intl.get(`bid.bidcommon.view.title.technicalanswerformsetting`).d("技术应答表设置")} key="1"><ContractMidlle {...headerInfoFormProps} /></TabPane>
                        <TabPane tab={intl.get(`bid.bidcommon.view.title.businessanswerformsetting`).d("商务应答表设置")} key="3"><ContractMidlle {...headerInfoFormProps} /></TabPane>
                        {(listAll.purchaseType === 'invited_bidding'||listAll.purchaseType ==='public_bidding')&&<TabPane tab={intl.get(`bid.bidcommon.view.title.technicalscoreformsetting`).d("技术评分表设置")} key="quoteSourceResult"><QuoteSourceResult {...headerInfoFormProps} /></TabPane>}
                        {(listAll.specialPrice !=='YES' && listAll.priceSecret !=='YES')&&<TabPane tab={intl.get(`bid.bidcommon.view.title.quotationformsetting`).d("报价表设置")} key="quotationTable"><QuotationTable {...headerInfoFormProps} /></TabPane>}
                        <TabPane tab={intl.get(`bid.bidcommon.view.title.expertsetting`).d("评委组设置")} key="setJudgesTable"><SetJudgesTable {...headerInfoFormProps} /></TabPane>
                        {(['invited_bidding', 'invite_negotiation', 'single_source', 'internal_source', 'invitation_inquiry', 'direct_negotiation'].includes(listAll.purchaseType)) &&<TabPane tab={intl.get(`bid.bidcommon.view.title.invitesuppliers`).d("邀请供应商")} key="inviteSuppliers"><InviteSuppliers {...headerInfoFormProps} /></TabPane>}
                      </Tabs>
                    </LocaleProvider>
                  </Card>
                </Col>
              </Row>)}
              {matchs.params.status!='parentId'&&(
              <Row gutter={24} style={{marginBottom:50}}>
                <Col span={24}>
                  <Card
                    key="contractHeaderInformation"
                    id="spcm-contract-maintain-detail-contract-header-information"
                    bordered={false}
                    className={DETAIL_CARD_CLASSNAME}
                    title={
                      <h3>{intl.get(`bid.bidcommon.view.title.lichengbei`).d('里程碑')}</h3>
                    }
                  >
                   <ContractEnd {...endList} />
                  </Card>
                </Col>
              </Row>)}
            </Spin>
          </div>
          <Modal
            wrapClassName={styles['full-modal-wrapper']}
            bodyStyle={{ height: `${document.body.clientHeight - 39}px` }}
            {...ModalProps}
            title={
              <Button
                icon="shrink"
                style={{ float: 'right' }}
                onClick={() => this.fullScreen('fullScreenFlag', false)}
              >
                {intl.get(`hzero.common.button.exitFullScreen`).d('退出全屏')}
              </Button>
            }
          >
            <EditorOnline
              iframeStyle={{
                width: '100%',
                height: `${document.body.clientHeight}px`,
              }}
              pcHeaderId={pcHeaderId}
              fullScreenFlag={fullScreenFlag}
            />
          </Modal>
        </Content>
        <OperationRecord {...operationRecordProps} />
      </Fragment>
    );
  }
}
