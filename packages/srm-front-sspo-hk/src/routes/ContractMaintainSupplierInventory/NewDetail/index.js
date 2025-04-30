/*
 * ui 修改
 * @date: 2023-08-04
 * @author: HB <haitao.lu02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Collapse, Row, Col } from 'antd';
import CusButton from '_cus_components/CusButton';
import CusSpin from '_cus_components/CusSpin';
import CusModal from '_cus_components/CusModal';
import CusTabs from '_cus_components/CusSearchTabs';
import PageWrapper from '_cus_components/Page/PageWrapper';
import PanelHeader from '_cus_components/CusCollapse';
import { connect } from 'dva';
import { isNumber, isEmpty, omit, merge, isArray, isString } from 'lodash';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';
import { SRM_BID } from '@/common/config';
import {
  getEditTableData,
  getCurrentOrganizationId,
  addItemToPagination,
  filterNullValueObject,
  createPagination,
  delItemsToPagination,
  addItemsToPagination,
  getCurrentUser,
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
} from 'utils/constants';
import request from 'utils/request';
import styles from './index.less';
import ContractHeader from '../../components/ContractHeaderNew';
import ContractMidlle from '../../components/ContractMidlleNew';
// import ContractEnd from '../../components/ContractEndNew';
import ContractEnd from '../../components/ContractEnd';
import OperationRecord from '../../components/OperationRecord';
import EditorOnline from '../../components/EditorOnline';
// import QuotationTable from '../../ContractMaintain/SetQuotationTable'
import QuotationTable from '../../ContractMaintain/SetQuotationTableNew'
// import QuoteSourceResult from '../../ContractMaintain/QuoteSourceResult'
import QuoteSourceResult from '../../ContractMaintain/QuoteSourceResultNew'
// import SetJudgesTable from '../../ContractMaintain/SetJudgesTable'
import SetJudgesTable from '../../ContractMaintain/SetJudgesTableNew'
// import InviteSuppliers from '../../ContractMaintain/InviteSuppliers'
import InviteSuppliers from '../../ContractMaintain/InviteSuppliersNew'
import CusExcelExport from '_cus_components/CusExcelExport';
import CusInput from '_cus_components/CusInput';
import { Form } from 'hzero-ui';
import CusNotification from '_cus_components/CusNotification';
import CusTable from '_cus_components/CusTable';
import { dateTimeRender } from 'utils/renderer';
import { tooltipRender } from '_cus_utils/render';

const { Panel } = Collapse;
const viewMessagePrompt = 'spcm.common.view.message.title';
const organizationId = getCurrentOrganizationId();
const { loginName } = getCurrentUser();
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
  temLoading: loading.effects['contractMaintain/handleClauseTemInfo'],
  cluaseSupplierLoading: loading.effects['contractMaintain/getSupplierList'],
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
    'bid.biddashbord',
    'HKPC.commom'
  ],
})
@Form.create({ fieldNameProp: null })
export default class Detail extends Component {
  editorOnlineRef;


  handleExport() {
    this.setState({
      exportLoading: true,

    });
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
      typePro: 0,
      headerInfo: {},
      listAll: {},
      listEll: [],
      activeKeyList: ['form', 'tab', 'tabel'],
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
      changeFlag: false,
      activeKey: '1',
      clauseVisible: false,
      cluaseInfo: {},
      clauseTemVisible: false,
      clauseTemplate: '',
      clauseTemplate1: '',
      activeKeyTem: ['tem', 'tem1'],
      cluaseSupplierVisible: false,
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

  componentWillReceiveProps() {
    this.setState({})
  }

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
    const param = [{ ...listAll }]
    request(
      `${SRM_BID}/v1/${organizationId}/bid-pro-infos`,
      {
        method: 'POST',
        body: param
      }
    ).then((res) => {
      if (res) {
        // console.log(res)
        notification.success();
        this.state.matchs.params.status = 'proId'
        this.state.matchs.params.proId = res[0].proId
        this.setState({ matchs: this.state.matchs })
        this.getProjectList()
      }
    })
  }

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
    const { matchs } = this.state;
    request(
      `${SRM_BID}/v1/${organizationId}/bid-pro-infos/getProInfoDetail?${matchs.params.status}=${matchs.params.proId}`,
      {
        method: 'GET',
      }
    ).then((res) => {
    // 总预算港币：50万 ~ 100万的金额判断
    const isTalZero = Number(res.talCurrencyZero) > 500000 && Number(res.talCurrencyZero) <= 1000000;
    const isTalZeroMore = Number(res.talCurrencyZero) > 1000000;
    // 技术应答表&商务应答表&评委组显示条件
    // 50~100万：50~100万&采购方式为公开招标，邀请招标
    // 100万以上：100万&采购方式为公开招标，邀请招标，公开询价，邀请询价，直接谈判
    const isContractMidle = (
      isTalZero &&
      (['public_bidding', 'invited_bidding'].includes(res.purchaseType))
      ||
      isTalZeroMore &&
      (['public_bidding', 'invited_bidding', 'public_inquiry', 'invitation_inquiry', 'direct_negotiation'].includes(res.purchaseType))
    )
      this.setState({ listAll: res, activeKey: isContractMidle ? '1' : 'quotationTable' })
    })
    request(
      `${SRM_BID}/v1/${organizationId}/bid-milestones/listBidMilestone/${matchs.params.proId}`,
      {
        method: 'GET',

      }
    ).then((res) => {
      this.setState({ listEll: [...res] })
    })
  }
  /**
   * preSubmit - 提交采购协议前置modal弹窗
   */
  @Bind()
  preSubmit() {
    const { matchs } = this.state;
    if (matchs.params.status != 'parentId') {
      request(
        `${SRM_BID}/v1/${organizationId}/bid-pro-infos/submitPro/${matchs.params.proId}`,
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
    CusModal.confirm({
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
    CusModal.confirm({
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
            CusModal.confirm({
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
    console.log('key', this.state.changeFlag)
    if (this.state.changeFlag) {
      CusModal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        content: intl
          .get(`bid.bidcommon.view.message.confirmgetout`)
          .d('你有修改未保存，是否确认离开?'),
        onOk: () => {
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
        },
      });
    } else {
      if (key == 1) {
        this.setState({ typePro: '0', activeKey: key, changeFlag: false })
      } else if (key == 3) {
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

  // 查看条款
  @Bind()
  setClause() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractMaintain/checkClauseInfo',
      payload: {
        proId: match.params.proId,
      }
    }).then((res) => {
      if(res.endTimeIsNull) {
        return CusNotification.warning({
          message: intl.get('HKPC.commom.view.title.setcutofftime').d('请先设置截止时间')
        })
      }
      dispatch({
        type: 'contractMaintain/getClauseInfo',
        payload: {
          proId: match.params.proId,
        }
      }).then((res) => {
        if(res) {
          this.setState({
            cluaseInfo: res,
          }, () => {
            this.setState({
              clauseVisible: true,
            })
          })
        }
      })
    })
  }

  // 查看条款模板明细
  @Bind()
  checkClause() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractMaintain/handleClauseTemInfo',
      payload: {
        proId: match.params.proId,
        tempCode: 'HKPC.COMFIRM_TERMS',
        lang: getCurrentLanguage(),
      }
    }).then((res) => {
      if(res) {
        dispatch({
          type: 'contractMaintain/handleClauseTemInfo',
          payload: {
            proId: match.params.proId,
            tempCode: 'HKPC.COMFIRM_TERMS2',
            lang: getCurrentLanguage(),
          }
        }).then((res1) => {
          if(res1) {
            this.setState({
              clauseTemVisible: true,
              clauseTemplate: res?.content,
              clauseTemplate1: res1?.content,
            })
          }
        })
      }
    })
  }

  // 查看供应商情况
  @Bind()
  checkSupplierInfo() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'contractMaintain/getSupplierList',
      payload: {
        proId: match.params.proId
      }
    }).then((res) => {
      if(res) {
        this.setState({
          cluaseSupplierVisible: true,
          cluaseSupplierList: res
        })
      }
    })
  }

  @Bind()
  handleClauseOk() {
    const { form, dispatch, match } = this.props;
    form.validateFields((err, values) => {
      if(err) return;
      console.log('values', values)
      dispatch({
        type: 'contractMaintain/saveClause',
        payload: [
          {
            ...values,
            proId: match.params.proId,
            tempCode: 'HKPC.COMFIRM_TERMS',
            isTemp: '0'
          }
        ]
      }).then((res) => {
        if(res) {
          dispatch({
            type: 'contractMaintain/saveClause',
            payload: [
              {
                ...values,
                proId: match.params.proId,
                tempCode: 'HKPC.COMFIRM_TERMS2',
                isTemp: '0'
              }
            ]
          }).then((res) => {
            if(res) {
              this.setState({
                clauseVisible: false,
              })
            }
          })
        }
      })
    })
  }

  render() {
    const {
      match,
      location,
      queryingHeader = false,
      queryingPartner = false,
      queryingSubject = false,
      queryingStage = false,
      queryingTerm = false,
      contractMaintain: { detailEnumMap = {}, code = {}, supplierPagination = {} },
      history,
      form,
      temLoading = false,
      cluaseSupplierLoading = false,
    } = this.props;

    const {
      operationRecordVisible,
      fullScreenFlag,
      headerInfo = {},
      listAll,
      listEll,
      isQuoteSource,
      quoteType,
      typePro,
      matchs,
      activeKey,
      activeKeyList,
      clauseVisible,
      cluaseInfo,
      clauseTemVisible,
      clauseTemplate,
      clauseTemplate1,
      activeKeyTem,
      cluaseSupplierVisible,
      cluaseSupplierList,
    } = this.state;
    const {
      alterationFlag,
    } = headerInfo;
    const queryingList = queryingPartner || queryingSubject || queryingStage || queryingTerm;
    const { search = {} } = location;
    const { pcHeaderId = headerInfo.pcHeaderId } = querystring.parse(search.substr(1));
    const editable = !pcHeaderId;
    const maintainEditable = true;
    const headerInfoFormProps = {
      supplierPagination,
      matchs,
      match: matchs,
      code: code,
      detailEnumMap,
      purchaseFlag: typePro, // 是否来自采购方
      editable,
      isQuoteSource,
      maintainEditable,
      alterationFlag,
      disabled: true,
      quoteType,
      isSaveFlag: true,
      onRef: (node) => {
        this.headerRef = node;
      },
      dataSource: headerInfo,
      isShow: listAll.purchaseType === 'public_bidding' || listAll.purchaseType === 'invited_bidding',
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
    const endList = {
      getEndList: listEll,
      history,
      getDetailList: listAll,
      matchs,
      match: matchs,
      detailEnumMap,
      handleEdit: this.getProjectList,
      reChange: this.getProjectList,
      onChange: this.showFile,
    }

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };

    const columns = [
      {
        title: intl.get(`HKPC.commom.view.title.ictsuppliername`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 200,
        render: tooltipRender,
      },
      {
        title: intl.get(`HKPC.commom.view.title.Contacty`).d('应答联系人'),
        dataIndex: 'contactName',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`HKPC.commom.view.title.responsiblepersonnumber`).d('联系电话'),
        dataIndex: 'contactPhone',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`HKPC.commom.view.title.MailAddress2`).d('邮箱'),
        dataIndex: 'contactEmail',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`HKPC.commom.view.title.acceptterms`).d('是否同意条款'),
        dataIndex: 'clauseStatus',
        width: 120,
        render: (_, record) => {
          return (
            <div>
              {record.clauseStatus === 'y' ? intl.get('HKPC.commom.view.title.yes').d('是') : '-'}
            </div>
          )
        },
      },
      {
        title: intl.get(`HKPC.commom.view.title.accepttime`).d('条款确认时间'),
        dataIndex: 'confirmTime',
        width: 180,
        render: dateTimeRender,
      },
    ]

    const ModalProps = {
      width: '100%',
      height: document.body.clientHeight,
      visible: fullScreenFlag,
      onCancel: () => this.fullScreen('fullScreenFlag', false),
      footer: null,
      closable: false,
    };
    // 总预算港币：50万 ~ 100万的金额判断
    const isTalZero = Number(listAll.talCurrencyZero) > 500000 && Number(listAll.talCurrencyZero) <= 1000000;
    const isTalZeroMore = Number(listAll.talCurrencyZero) > 1000000;
    // 技术应答表&商务应答表&评委组显示条件
    // 50~100万：50~100万&采购方式为公开招标，邀请招标
    // 100万以上：100万&采购方式为公开招标，邀请招标，公开询价，邀请询价，直接谈判
    const isContractMidle = (
      isTalZero &&
      (['public_bidding', 'invited_bidding'].includes(listAll.purchaseType))
      ||
      isTalZeroMore &&
      (['public_bidding', 'invited_bidding', 'public_inquiry', 'invitation_inquiry', 'direct_negotiation'].includes(listAll.purchaseType))
    )

    // 邀请供应商显示条件
    // 50~100万：50~100万&采购方式为邀请招标，邀请询价，单一来源，内部采购，直接谈判
    // 100万以上：100万&采购方式为邀请招标，邀请询价，单一来源，内部采购，直接谈判
    const isInviteSuppliers = (
      (isTalZero || isTalZeroMore) && 
      (['invited_bidding', 'invitation_inquiry', 'single_source', 'internal_source', 'direct_negotiation'].includes(listAll.purchaseType))
    )
    const tabItems = [
      isContractMidle && {
        key: '1',
        label: intl.get(`bid.bidcommon.view.title.technicalanswerformsetting`).d("技术应答表设置"),
        children: <>
          <ContractMidlle {...headerInfoFormProps} />
        </>
      },
      isContractMidle && {
        key: '3',
        label: intl.get(`bid.bidcommon.view.title.businessanswerformsetting`).d("商务应答表设置"),
        children: <>
          <ContractMidlle {...headerInfoFormProps} />
        </>
      },
      ['invited_bidding', 'public_bidding'].includes(listAll.purchaseType) && {
        key: 'quoteSourceResult',
        label: intl.get(`bid.bidcommon.view.title.technicalscoreformsetting`).d("技术评分表设置"),
        children: <>
          <QuoteSourceResult {...headerInfoFormProps} />
        </>
      },
      isContractMidle && {
        key: 'setJudgesTable',
        label: intl.get(`bid.bidcommon.view.title.expertsetting`).d("评委组设置"),
        children: <>
          <SetJudgesTable {...headerInfoFormProps} />
        </>
      },
      (listAll.specialPrice !== 'YES' && listAll.priceSecret !== 'YES') && {
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
    return (
      <PageWrapper loading={false}>
        <CusSpin spinning={queryingHeader || queryingPartner || queryingList}>
          <Collapse
            className={classnames('customize-collapse')}
            defaultActiveKey={activeKeyList}
            onChange={(collapseKeys) => {
              this.setState({ activeKeyList: collapseKeys });
            }}
          >
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get(`bid.bidcommon.view.title.projectbasicxinxi`).d('项目基本信息')}
                  arrowActive={activeKeyList.includes('form')}
                />
              }
              key="form"
            >
              <ContractHeader {...headerInfoFormProps} />
            </Panel>
            {matchs.params.status != 'parentId' && (
              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`bid.bidcommon.view.title.projectsetting`).d('项目设置')}
                    arrowActive={activeKeyList.includes('tab')}
                  />
                }
                key="tab"
              >
                <CusTabs
                  activeKey={activeKey}
                  items={tabItems}
                  // moreIcon={false}
                  onChange={this.callback}
                />
              </Panel>
            )}
            {matchs.params.status != 'parentId' && (
              <Panel
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`bid.bidcommon.view.title.lichengbei`).d('里程碑')}
                    arrowActive={activeKeyList.includes('tabel')}
                    buttons={
                      <>
                        {
                          !(['completed', 'closed'].includes(listAll.proState)) &&
                          (listAll.purchasingEmpNum === loginName ||
                            listAll.transferorEmpNum === loginName) && (
                            <CusButton onClick={this.setClause} mini>
                              {intl.get(`HKPC.commom.view.title.setterms`).d('设置条款')}
                            </CusButton>
                          )}
                        <CusButton onClick={this.checkClause} mini>
                          {intl.get(`HKPC.commom.view.title.viewterms`).d('查看条款')}
                        </CusButton>
                        <CusButton onClick={this.checkSupplierInfo} mini>
                          {intl.get(`HKPC.commom.view.title.viewbidders`).d('查看供应商情况')}
                        </CusButton>
                      </>
                    }
                  />
                }
                key="tabel"
              >
                <ContractEnd {...endList} />
              </Panel>
            )}
          </Collapse>
        </CusSpin>
        <CusModal
          wrapClassName={styles['full-modal-wrapper']}
          bodyStyle={{ height: `${document.body.clientHeight - 39}px` }}
          {...ModalProps}
          title={
            <CusButton
              icon="shrink"
              style={{ float: 'right' }}
              onClick={() => this.fullScreen('fullScreenFlag', false)}
            >
              {intl.get(`hzero.common.button.exitFullScreen`).d('退出全屏')}
            </CusButton>
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
        </CusModal>
        <CusModal
          title={intl.get('HKPC.commom.view.title.settermsinfo').d('设置条款信息')}
          visible={clauseVisible}
          destroyOnClose
          onCancel={() => {
            this.setState({
              clauseVisible: false,
            });
          }}
          onOk={this.handleClauseOk}
        >
          <Form className="customize-form">
            <Row>
              <Col span={24}>
                <Form.Item label={intl.get(`HKPC.commom.view.title.PackageName`).d('标包名称')}>
                  {form.getFieldDecorator('packageName', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('himp.template.model.template.prefixPatch').d('标包名称'),
                        }),
                      },
                    ],
                    initialValue: listAll.packageName,
                  })(<CusInput disabled />)}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={intl.get(`HKPC.commom.view.title.technicalevaluation`).d('技术评审')}
                >
                  {form.getFieldDecorator('attribute7', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('HKPC.commom.view.title.technicalevaluation')
                            .d('技术评审'),
                        }),
                      },
                    ],
                    initialValue: cluaseInfo?.attribute7,
                  })(<CusInput.TextArea showCharacter autoChangeSize maxLength={500} />)}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label={intl.get(`HKPC.commom.view.title.priceevaluation`).d('商业评审')}>
                  {form.getFieldDecorator('attribute6', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('HKPC.commom.view.title.priceevaluation').d('商业评审'),
                        }),
                      },
                    ],
                    initialValue: cluaseInfo?.attribute6,
                  })(<CusInput.TextArea showCharacter autoChangeSize maxLength={500} />)}
                </Form.Item>
              </Col>
              {/* <Col span={24}>
                <Form.Item
                  label={intl.get(`HKPC.commom.view.title.contactinfomation`).d('联系人信息')}
                >
                  {form.getFieldDecorator('attribute2', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('HKPC.commom.view.title.contactinfomation')
                            .d('联系人信息'),
                        }),
                      },
                    ],
                    initialValue: cluaseInfo?.attribute2,
                  })(<CusInput.TextArea showCharacter autoChangeSize maxLength={500} />)}
                </Form.Item>
              </Col> */}
            </Row>
          </Form>
        </CusModal>
        <CusModal
          title={intl.get('HKPC.commom.view.title.termsinfo').d('条款信息')}
          visible={clauseTemVisible}
          destroyOnClose
          width={1200}
          onCancel={() => {
            this.setState({
              clauseTemVisible: false,
            });
          }}
          footer={
            <>
              <CusButton
                onClick={() => {
                  this.setState({
                    clauseTemVisible: false,
                  });
                }}
              >
                {intl.get('hzero.common.button.close').d('关闭')}
              </CusButton>
            </>
          }
        >
          <PageWrapper loading={temLoading}>
            <Collapse
              className="customize-collapse"
              defaultActiveKey={activeKeyTem}
              onChange={(collapseKeys) => {
                this.setState({ activeKeyTem: collapseKeys });
              }}
            >
              <Panel
                key="tem"
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`HKPC.commom.view.title.parti`).d('第一部分')}
                    arrowActive={activeKeyTem.includes('tem')}
                  />
                }
              >
                <div dangerouslySetInnerHTML={{ __html: clauseTemplate }}></div>
              </Panel>
              <Panel
                key="tem1"
                showArrow={false}
                header={
                  <PanelHeader
                    title={intl.get(`HKPC.commom.view.title.partii`).d('第二部分')}
                    arrowActive={activeKeyTem.includes('tem1')}
                  />
                }
              >
                <div dangerouslySetInnerHTML={{ __html: clauseTemplate1 }}></div>
              </Panel>
            </Collapse>
          </PageWrapper>
        </CusModal>
        <CusModal
          title={intl.get('HKPC.commom.view.title.biddersconsent').d('投标商同意状态')}
          visible={cluaseSupplierVisible}
          destroyOnClose
          width={1200}
          onCancel={() => {
            this.setState({
              cluaseSupplierVisible: false,
            });
          }}
          footer={
            <>
              <CusButton
                onClick={() => {
                  this.setState({
                    cluaseSupplierVisible: false,
                  });
                }}
              >
                {intl.get('hzero.common.button.close').d('关闭')}
              </CusButton>
            </>
          }
        >
          <CusSpin spinning={cluaseSupplierLoading}>
            <div style={{textAlign:'right',marginBottom:'16px'}}>
              <CusExcelExport
                requestUrl={`${SRM_BID}/v1/${getCurrentOrganizationId()}/bid-clauses/getSupplierConfirmListExport`}
                otherButtonProps={{
                  icon: null,
                  mini: true,
                }}
                downloadType="Blob"
                buttonText={intl.get('hzero.common.button.export').d('导出')}
                fileName={intl.get(`HKPC.commom.view.title.viewbidders`).d('查看供应商情况')}
                queryParams={{ proId: match.params.proId }}
              />
            </div>
            <CusTable
              rowKey="supplierId"
              columns={columns}
              dataSource={cluaseSupplierList}
              pagination={false}
            />
          </CusSpin>
        </CusModal>
        <OperationRecord {...operationRecordProps} />
      </PageWrapper>
    );
  }
}
