/*
 * ContractMaintainDetail - 协议维护详情
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button, Spin, Modal, Row, Col, Anchor, Affix, Card, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { isNumber, isEmpty, omit, merge, isArray, get, isString } from 'lodash';
import classnames from 'classnames';
import { Bind, Debounce } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import {
  getEditTableData,
  getCurrentOrganizationId,
  addItemToPagination,
  createPagination,
  delItemsToPagination,
  addItemsToPagination,
} from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { isNullOrUndefined } from 'util';
import {
  DEFAULT_DATETIME_FORMAT,
  DEFAULT_DATE_FORMAT,
  DETAIL_DEFAULT_CLASSNAME,
  DETAIL_CARD_CLASSNAME,
} from 'utils/constants';

import styles from './index.less';
import ContractHeader from '../../components/ContractHeader';
import ContractSubject from '../../components/ContractSubject';
import ContractStage from '../../components/ContractStage';
import ContractPartner from '../../components/ContractPartner';
import ContractBusinessTerms from '../../components/ContractBusinessTerms';
import ContractRebate from '../../components/ContractRebate';
import OperationRecord from '../../components/OperationRecord';
import EditorOnline from '../../components/EditorOnline';
import Attachment from '../../components/Upload';

const { Link } = Anchor;
const { TabPane } = Tabs;
const viewMessagePrompt = 'spcm.common.view.message.title';

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
  ],
})
export default class Detail extends Component {
  editorOnlineRef;

  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcHeaderId, itemKey, isQuoteSource, quoteType } = querystring.parse(search.substr(1));
    this.state = {
      pcHeaderId,
      itemKey,
      headerInfo: {}, // 头form数据源
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
    if (pcHeaderId && isNumber(+pcHeaderId)) {
      this.fetchHeader();
      this.fetchList();
    }
  }

  componentWillUnmount() {
    this.offDTOs();
  }

  @Bind()
  offDTOs() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/updateState',
      payload: { sourceResultDTOs: [], createPurchaseOrderList: [], createPurchaseOrderInfo: {} },
    });
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
    this.fetchPartner();
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
  @Bind()
  fetchPartner(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchPartner',
        payload: {
          page,
          pcHeaderId,
          customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
        },
      }).then((res) => {
        if (res) {
          this.setState({
            partnerDataSource: res.map((n) => ({ ...n, _status: 'update' })),
          });
          this.resetEditFlag();
        }
      });
    }
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
   * fetchStage - 查询标的协议阶段
   * @param {object} page - 协议阶段分页条件
   */
  @Bind()
  fetchStage(page = {}) {
    const { dispatch } = this.props;
    const {
      pcHeaderId,
      headerInfo: { supplierCurrencyCode = 'CYN', purchaseCurrencyCode = 'CYN' },
    } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchStage',
        payload: {
          page,
          pcHeaderId,
          customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE',
        },
      }).then((res) => {
        if (res) {
          this.setState({
            pcStageDataSource: res.content.map((n) => ({
              ...n,
              _status: 'update',
              supplierCurrencyCode: n.supplierCurrencyCode || supplierCurrencyCode,
              purchaseCurrencyCode: n.purchaseCurrencyCode || purchaseCurrencyCode,
            })),
            pcStagePagination: createPagination(res),
          });
          this.resetEditFlag();
        }
      });
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

   @Debounce(300, { leading: true })
  @Bind()
  async save(params = {}) {
    const {
      dispatch,
      contractMaintain: {
        sourceResultDTOs,
        createPurchaseOrderList = [],
        createPurchaseOrderInfo = {},
      },
    } = this.props;
    const {
      tenantId,
      headerInfo = {},
      pcHeaderId = headerInfo.pcHeaderId,
      itemKey,
      pcStageDataSource = [],
      pcSubjectDataSource = [],
    } = this.state;
    const { editStep } = headerInfo;
    const formRef = get(this, 'headerRef.props.form');
    const { defaultSupplierTenantId } = this.headerRef.state.defaultValues;
    if (
      formRef.getFieldValue('acceptType') === 'stage' &&
      isEmpty(pcStageDataSource) &&
      pcHeaderId
    ) {
      Modal.confirm({
        title: intl
          .get(`${viewMessagePrompt}.stageCannotSave`)
          .d('验收类型为按阶段验收时，协议阶段行不可为空'),
      });
      return;
    }

    if (
      formRef.getFieldValue('acceptType') === 'target' &&
      isEmpty(pcSubjectDataSource) &&
      pcHeaderId
    ) {
      Modal.confirm({
        title: intl
          .get(`${viewMessagePrompt}.targetCannotSave`)
          .d('验收类型为按标的验收时，协议标的行不可为空'),
      });
      return;
    }

    if (!formRef) {
      return;
    }
    const { isQuoteSource, quoteType } = this.state;
    // prSourceCode 有3种情况，为空=普通创建协议，
    // SEARCH_SOURCE_RESULT 我引用寻源 创建的协议
    // PURCHASE_NEED 我引用采购申请 创建的协议
    // PURCHASE_ORDER 引用采购订单 创建的协议
    // 注意： isQuoteSource 字段只能判断是否为 引用寻源 创建的协议
    let pcSourceCode = '';
    if (Number(isQuoteSource) === 1 && isNullOrUndefined(itemKey)) {
      pcSourceCode = 'SEARCH_SOURCE_RESULT';
    } else if (isNullOrUndefined(isQuoteSource) && !isNullOrUndefined(itemKey)) {
      pcSourceCode = 'PURCHASE_NEED';
    } else if (quoteType === 'PO') {
      pcSourceCode = 'PURCHASE_ORDER';
    }
    if (!pcHeaderId) {
      formRef.validateFieldsAndScroll({ force: true }, (errs, values) => {
        if (!errs) {
          const { startDateActive, endDateActive, overseasProcurement } = values;
          const headerData = {
            supplierTenantId:
              pcSourceCode === 'PURCHASE_ORDER'
                ? createPurchaseOrderInfo.supplierTenantId
                : defaultSupplierTenantId,
            sourceResultDTOs,
            tenantId,
            ...headerInfo,
            ...values,
            ...params,
            startDateActive: startDateActive
              ? startDateActive.format(DEFAULT_DATETIME_FORMAT)
              : undefined,
            endDateActive: endDateActive
              ? endDateActive.format(DEFAULT_DATETIME_FORMAT)
              : undefined,
            overseasProcurement: overseasProcurement ? 1 : 0,
            pcSourceCode,
            poLineLocationVOList: createPurchaseOrderList,
          };
          dispatch({
            type: 'contractMaintain/add',
            payload: {
              ...headerData,
              customizeUnitCode:
                'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL,SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT,SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE,SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
            },
          }).then((newHeaderInfo) => {
            if (newHeaderInfo) {
              this.setState({ headerInfo: newHeaderInfo, pcHeaderId: newHeaderInfo.pcHeaderId });

              const query = {
                pcHeaderId: newHeaderInfo.pcHeaderId,
              };
              if (itemKey) {
                query.itemKey = itemKey;
              }

              this.props.history.push({
                pathname: '/spcm/contract-maintain/detail',
                search: querystring.stringify(query),
              });
              this.fetchHeader();
              this.fetchList();
              notification.success();
            }
          });
        }
      });
      return;
    }

    if (editStep === 1) {
      Modal.confirm({
        title: intl.get(`${viewMessagePrompt}.newconfirmUpdate`).d('是否需要重新生成协议文本？'),
        onOk: () => this.handleUpdateContract({ fileFlag: 1 }, 1),
        onCancel: () => this.handleUpdateContract({ fileFlag: 0 }, 0),
      });
    } else {
      this.handleUpdateContract({}, 0);
    }
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

  /**
   * preSubmit - 提交采购协议前置modal弹窗
   */
  @Bind()
  preSubmit() {
    const { partnerDataSource } = this.state;
    if (partnerDataSource.length > 0) {
      Modal.confirm({
        title: intl
          .get(`${viewMessagePrompt}.submitMessage`)
          .d('未保存已修改数据,可能造成数据丢失.是否确认已保存数据并提交采购协议'),
        onOk: this.submit,
      });
    } else {
      notification.warning({
        message: intl
          .get(`${viewMessagePrompt}.mustMaintainPartnerLine`)
          .d('该采购协议未维护合伙伙伴行信息，无法提交'),
      });
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

  /**
   * getParent-获取 dom 的parent
   * @param {HTMLElement} dom
   */
  @Bind()
  getParent(dom) {
    const parent = dom && dom.parentNode.parentNode;
    return parent && parent.nodeType !== 11 ? parent : null;
  }

  /**
   * getAffixContainer-获取给 Affix 组件使用的元素
   * @return {HTMLElement}
   */
  @Bind()
  getAffixContainer() {
    const parent = this.getParent(
      document.getElementById('spcm-contract-maintain-detail-content-inner-wrapper')
    );
    return parent || document.body;
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys 选中的主键
   * @param {Array} selectedRows 选中的行
   * @param {String} field 字段前缀
   */
  @Bind()
  handleChangeSelection(selectedRowKeys, selectedRows, field) {
    this.setState({
      [`${field}SelectedRows`]: selectedRows,
    });
  }

  /**
   * 改变标的信息分页前的回调
   */
  @Bind()
  handlePreSearchPcSubject(page) {
    const { headerEdited, pcSubjectEdited, partnerEdited, termEdited, pcRebateEdited } = this.state;
    const edited = headerEdited || pcSubjectEdited || partnerEdited || termEdited || pcRebateEdited;
    if (edited) {
      Modal.confirm({
        title: intl
          .get(`${viewMessagePrompt}.lostData`)
          .d('存在未保存数据，继续将导致数据丢失，是否继续'),
        onOk: () => this.fetchSubject(page),
        onCancel: () => this.forceUpdate(),
      });
    } else {
      this.fetchSubject(page);
    }
  }

  /**
   * 改变 阶段信息 分页前的回调
   */
  @Bind()
  handlePreSearchPcStage(page) {
    const { headerEdited, pcStageEdited, partnerEdited, termEdited, pcRebateEdited } = this.state;
    const edited = headerEdited || pcStageEdited || partnerEdited || termEdited || pcRebateEdited;
    if (edited) {
      Modal.confirm({
        title: intl
          .get(`${viewMessagePrompt}.lostData`)
          .d('存在未保存数据，继续将导致数据丢失，是否继续'),
        onOk: () => this.fetchSubject(page),
        onCancel: () => this.forceUpdate(),
      });
    } else {
      this.fetchStage(page);
    }
  }

  /**
   * 选定物料后查询对应的品类定义
   * @param {Number} itemId 物料id
   */
  @Bind()
  handleFetchCategory(itemId) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractMaintain/fetchCategory',
      payload: {
        itemId,
        enabledFlag: 1,
      },
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

  /**
   * 查询扩展信息
   * @param {Number} companyId 公司Id
   * @returns Promise(result)
   */
  @Bind()
  handleFetchExtended(companyId) {
    const { dispatch } = this.props;
    const {
      headerInfo: { pcHeaderId },
    } = this.state;
    return dispatch({
      type: 'contractMaintain/fetchExtended',
      payload: {
        companyId,
        pcHeaderId,
      },
    });
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

  /**
   * fetchSubjectCreateList - 查询可创建行数据
   * @param {object} params - 查询条件
   * @param {function} [success=(e => e)] - 查询成功回调函数
   */
  @Bind()
  fetchSubjectCreateList(params, success = (e) => e) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    dispatch({
      type: 'contractMaintain/querySubjectCreateList',
      pcHeaderId,
      params,
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  /**
   * fetchSubjectQuoteList - 查询可创建寻源单据
   * @param {object} params - 查询条件
   * @param {function} [success=(e => e)] - 查询成功回调函数
   */
  @Bind()
  fetchSubjectQuoteList(params, success = (e) => e) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/querySubjectQuoteList',
      params,
    }).then((res) => {
      if (res) {
        success(res);
      }
    });
  }

  @Bind()
  handleAppendValidate(poLineDetailDTOList) {
    const { pcHeaderId } = this.state;
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractMaintain/appendValidate',
      payload: {
        pcHeaderId,
        poLineDetailDTOList,
      },
    });
  }

  isQuoteSourceFlag = () => {
    const {
      isQuoteSource,
      headerInfo: { pcSourceCode },
    } = this.state;
    // 引用寻源单据跳转到 协议拟制详情页
    if (Number(isQuoteSource) === 1) {
      return true;
    }
    // 直接进入 协议拟制详情页 或 引用寻源单据保存后，isQuoteSource 丢失时
    if (pcSourceCode === 'SEARCH_SOURCE_RESULT') {
      return true;
    }
    return false;
  };

  @Bind()
  handleAddPurchaseOrder(selectedList = []) {
    const {
      pcSubjectDataSource,
      pcSubjectPagination,
      headerInfo: { supplierCurrencyCode = 'CYN', purchaseCurrencyCode = 'CYN' },
    } = this.state;
    this.setState({
      pcSubjectDataSource: [
        ...pcSubjectDataSource,
        ...selectedList.map((n, index) => ({
          ...n,
          _status: 'create',
          edited: true,
          sourceCode: n.displayPoNum,
          sourceLineNum: n.displayLineNum,
          deliverDate: n.deliverDate,
          lineNum: pcSubjectDataSource.length + index + 1,
          pcSubjectId: uuid(),
          currencyCode: n.currencyCode || supplierCurrencyCode,
          purchaseCurrencyCode: n.purchaseCurrencyCode || purchaseCurrencyCode,
          prLineNum: pcSubjectDataSource.length + index + 1,
          taxIncludedUnitPrice: n.enteredTaxIncludedPrice,
          purchaseTaxLineAmount: n.taxIncludedLineAmount,
          taxAmount: n.taxPrice,
          resultId: n.poLineLocationId,
          exchangeRate: 1,
        })),
      ],
      pcSubjectPagination: addItemsToPagination(
        selectedList.length,
        pcSubjectDataSource.length,
        pcSubjectPagination
      ),
      pcSubjectEdited: true,
    });
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
      deleteHeaderLoading = false,
      submitContractLoading = false,
      deletePcSubjectLoading = false,
      deletePcStageLoading = false,
      deletePartnerLoading = false,
      queryingPcAttachmentList = false,
      contractMaintain: { sourceResultDTOs, createPurchaseOrderInfo = {}, detailEnumMap = {} },
      contractCommon: { configSetting = {} },
    } = this.props;
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
      pcSubjectDataSource = [],
      pcStageDataSource = [],
      pcSubjectPagination = {},
      pcStagePagination = {},
      pcSubjectSelectedRows = [],
      pcStageSelectedRows = [],
      partnerDataSource = [],
      partnerSelectedRows = [],
      headerInfo = {},
      termDataSource = [],
      termSelectedRows = [],
      activeKey,
      isQuoteSource,
      backPath = {},
      from = undefined,
      pcRebateEdited,
      pcRebateDataSource,
      pcRebatePagination,
      pcRebateSelectedRows,
      quoteType,
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
      editStep,
      alterationFlag,
      rebateFlag,
    } = headerInfo;
    const queryingList = queryingPartner || queryingSubject || queryingStage || queryingTerm;
    const { search = {} } = location;
    const { pcHeaderId = headerInfo.pcHeaderId } = querystring.parse(search.substr(1));
    const editable = !pcHeaderId;
    const maintainEditable = true;
    const checkArtificial = true;
    const headerInfoFormProps = {
      sourceResultDTOs,
      detailEnumMap,
      purchaseFlag: true, // 是否来自采购方
      editable,
      isQuoteSource,
      maintainEditable,
      alterationFlag,
      createPurchaseOrderInfo,
      quoteType,
      onRef: (node) => {
        this.headerRef = node;
      },
      dataSource: headerInfo,
      onChangeHeader: this.handleChangeHeader,
      onChangeState: this.handleChangeState,
      handleExpenseUnitChange: this.handleExpenseUnitChange,
    };
    const contractSubjectListProps = {
      sourceResultDTOs,
      pcHeaderId,
      editable,
      checkArtificial,
      maintainEditable,
      headerInfo,
      detailEnumMap,
      deleting: deletePcSubjectLoading,
      loading: queryingSubject,
      doubleUomFlag: configSetting['000112'] === '1',
      pagination: pcSubjectPagination,
      dataSource: pcSubjectDataSource,
      onSelectionChange: this.handleChangeSelection,
      fetchSubjectCreateList: this.isQuoteSourceFlag()
        ? this.fetchSubjectQuoteList
        : this.fetchSubjectCreateList,
      addSubjectLines: this.addSubjectLines,
      onHandleAppendValidate: this.onHandleAppendValidate,
      selectedRows: pcSubjectSelectedRows,
      onAdd: () => this.handleAddLines('pcSubject'),
      onDelete: () => this.handleDeleteLines('pcSubject'),
      onRef: (node) => {
        this.partnerRef = node;
      },
      onHandleRecord: this.handleRecordChange, // 监听修改
      onFetchCategory: this.handleFetchCategory,
      onChangeState: this.handleChangeState,
      onChangeListData: this.handleChangeList,
      onPrePaginationChange: this.handlePreSearchPcSubject,
      originPage: {
        contractMaintain: true,
      },
      quoteSourceFlag: this.isQuoteSourceFlag(),
      onAddPurchaseOrder: this.handleAddPurchaseOrder,
    };
    // 新增 tab 协议阶段相关数据和操作
    const contractStageListProps = {
      detailEnumMap,
      editable,
      checkArtificial,
      maintainEditable,
      deleting: deletePcStageLoading,
      loading: queryingStage,
      pagination: pcStagePagination,
      dataSource: pcStageDataSource,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: pcStageSelectedRows,
      onAdd: () => this.handleAddLines('pcStage'),
      onDelete: () => this.handleDeleteLines('pcStage'),
      onRef: (node) => {
        this.partnerRef = node;
      },
      onHandleRecord: this.handleRecordChange, // 监听修改
      onFetchCategory: this.handleFetchCategory,
      onChangeState: this.handleChangeState,
      onChangeListData: this.handleChangeList,
      onPrePaginationChange: this.handlePreSearchPcStage,
    };
    const contractRebateProps = {
      editable,
      maintainEditable,
      checkArtificial,
      dataSource: pcRebateDataSource,
      pagination: pcRebatePagination,
      selectedRows: pcRebateSelectedRows,
      onFetchContractRebate: this.fetchContractRebate,
      onAdd: () => this.handleAddLines('pcRebate', 'rebateInformationId'),
      onDelete: () => this.handleDeleteLines('pcRebate', 'rebateInformationId'),
      onChangeState: this.handleChangeState,
      onSelectionChange: this.handleChangeSelection,
      onPrePaginationChange: this.fetchContractRebate,
    };
    const partnerListProps = {
      editable,
      checkArtificial,
      maintainEditable,
      detailEnumMap,
      deleting: deletePartnerLoading,
      loading: queryingPartner,
      dataSource: partnerDataSource,
      onSearch: this.fetchPartner,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: partnerSelectedRows,
      onAdd: () => this.handleAddLines('partner'),
      onDelete: () => this.handleDeleteLines('partner'),
      onRef: (node) => {
        this.pcSubjectRef = node;
      },
      onChangeState: this.handleChangeState,
      onChangeListData: this.handleChangeList,
      onFetchExtended: this.handleFetchExtended,
    };
    const contractBusinessTermsListProps = {
      editable,
      checkArtificial,
      maintainEditable,
      loading: queryingTerm,
      pagination: false,
      dataSource: termDataSource,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: termSelectedRows,
      onRef: (node) => {
        this.termRef = node;
      },
      onChangeState: this.handleChangeState,
    };

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
        btnText: intl.get(`entity.attachment.upload`).d('附件上传'),
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
    return (
      <Fragment>
        <Header
          title={intl
            .get(`spcm.contractMaintain.view.message.title.purchaseCreation`)
            .d('协议拟制')}
          backPath={
            isQuoteSource === '1'
              ? '/spcm/contract-maintain/quoteSource'
              : backPath[from] || backPath.default
          }
        >
          <Button
            loading={saving}
            onClick={() => this.save()}
            icon="save"
            type="primary"
            disabled={queryingHeader || saving}
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
          {!isEmpty(headerInfo) && templateListFlag && <Attachment {...attachmentProps} />}
          <Button
            loading={submitContractLoading}
            icon="check"
            onClick={this.preSubmit}
            disabled={!pcHeaderId}
          >
            {intl.get(`hzero.common.button.submit`).d('提交')}
          </Button>
          <Button
            loading={deleteHeaderLoading}
            icon="delete"
            disabled={!pcHeaderId}
            onClick={this.delete}
          >
            {intl.get(`hzero.common.button.delete`).d('删除')}
          </Button>
          <Button
            // loading={submitDeliveryLoading}
            icon="clock-circle-o"
            disabled={!pcHeaderId}
            onClick={() => this.handleModalVisible('operationRecordVisible', true, { pcHeaderId })}
          >
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </Button>
        </Header>
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
                <Col span={21}>
                  <Card
                    key="contractHeaderInformation"
                    id="spcm-contract-maintain-detail-contract-header-information"
                    bordered={false}
                    className={DETAIL_CARD_CLASSNAME}
                    title={
                      <h3>
                        {intl.get(`bid.bidcommon.view.title.techbussjishuyd`).d('技术应答表')}
                      </h3>
                    }
                  >
                    <ContractHeader {...headerInfoFormProps} />
                  </Card>
                  {pcHeaderId && (
                    <div
                      key="subjectInformation"
                      id="spcm-contract-maintain-detail-contract-subject"
                    >
                      <Tabs activeKey={activeKey} animated={false} onChange={this.handleSaveKey}>
                        <TabPane
                          tab={intl
                            .get('spcm.common.view.message.title.contractSubject')
                            .d('协议标的')}
                          key="contractSubjectInfo"
                        >
                          <ContractSubject {...contractSubjectListProps} />
                        </TabPane>
                        <TabPane
                          tab={intl
                            .get('spcm.common.view.message.title.contractStage')
                            .d('协议阶段')}
                          key="agreementStage"
                        >
                          <ContractStage {...contractStageListProps} />
                        </TabPane>
                        {rebateFlag && (
                          <TabPane
                            tab={intl
                              .get('spcm.common.view.message.title.ContractRebate')
                              .d('返利信息')}
                            key="contractRebate"
                          >
                            <ContractRebate {...contractRebateProps} />
                          </TabPane>
                        )}
                      </Tabs>
                    </div>
                  )}
                  {pcHeaderId && (
                    <Card
                      key="contractPartnerInformation"
                      id="spcm-contract-maintain-detail-contract-partner"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get(`${viewMessagePrompt}.contractPartnerInformation`)
                            .d('采购协议伙伴信息')}
                        </h3>
                      }
                    >
                      <ContractPartner {...partnerListProps} />
                    </Card>
                  )}
                  {pcHeaderId && headerInfo.pcKindCode !== 'ATTACHMENT' && (
                    <Card
                      key="contractBusinessTermsInformation"
                      id="spcm-contract-maintain-detail-contract-business-terms"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get(`spcm.common.view.message.title.purcAgreementBusinessTerms`)
                            .d('采购协议业务条款')}
                        </h3>
                      }
                    >
                      <ContractBusinessTerms {...contractBusinessTermsListProps} />
                    </Card>
                  )}
                  {pcHeaderId && editStep === 1 && headerInfo.pcKindCode !== 'ATTACHMENT' && (
                    <Card
                      key="contractOnlineEdit"
                      id="spcm-contract-maintain-detail-contract-online-edit"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl.get(`spcm.common.title.contractOnlineEdit`).d('采购协议文本编辑')}
                        </h3>
                      }
                    >
                      <div className={styles['button-wrapper']}>
                        <Button
                          type="primary"
                          onClick={() => this.fullScreen('fullScreenFlag', true)}
                        >
                          {intl.get(`hzero.common.button.fullScreen`).d('全屏模式')}
                        </Button>
                      </div>
                      <EditorOnline
                        iframeStyle={{
                          width: '100%',
                          height: `${(document.body.clientHeight - 96) * 0.9}px`,
                        }}
                        pcHeaderId={pcHeaderId}
                        onRef={(node) => {
                          this.editorOnlineRef = node;
                        }}
                      />
                    </Card>
                  )}
                </Col>
                <Col span={3} className={styles['anchor-wrapper']}>
                  <Affix
                    style={{ top: '200px', width: 'calc( 100% - 11px )', position: 'absolute' }}
                    offsetTop={224}
                    target={this.getAffixContainer}
                  >
                    <Anchor offsetTop={24} getContainer={this.getAffixContainer}>
                      {pcHeaderId && (
                        <Link
                          href="#spcm-contract-maintain-detail-contract-header-information"
                          title={intl.get(`${viewMessagePrompt}.basicInformation`).d('基本信息')}
                        />
                      )}
                      {pcHeaderId && (
                        <Link
                          href="#spcm-contract-maintain-detail-contract-subject"
                          title={intl.get(`${viewMessagePrompt}.subjectInformation`).d('标的信息')}
                        />
                      )}
                      {pcHeaderId && (
                        <Link
                          href="#spcm-contract-maintain-detail-contract-partner"
                          title={intl.get(`${viewMessagePrompt}.partnerInformation`).d('伙伴信息')}
                        />
                      )}
                      {pcHeaderId && headerInfo.pcKindCode !== 'ATTACHMENT' && (
                        <Link
                          href="#spcm-contract-maintain-detail-contract-business-terms"
                          title={intl
                            .get(`${viewMessagePrompt}.businessTermsInformation`)
                            .d('业务条款')}
                        />
                      )}
                      {pcHeaderId && editStep === 1 && headerInfo.pcKindCode !== 'ATTACHMENT' && (
                        <Link
                          href="#spcm-contract-maintain-detail-contract-online-edit"
                          title={intl.get(`spcm.common.title.onlineEdit`).d('文本编辑')}
                        />
                      )}
                    </Anchor>
                  </Affix>
                </Col>
              </Row>
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
