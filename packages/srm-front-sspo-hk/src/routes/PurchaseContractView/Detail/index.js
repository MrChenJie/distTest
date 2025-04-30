/*
 * purchaseContractViewDetail - 我发起的协议详情
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button, Spin, Form, Row, Col, Anchor, Affix, Card, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { isNumber, isEmpty } from 'lodash';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
// import { routerRedux } from 'dva/router';

import { Header, Content } from 'components/Page';
import { createPagination } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME, DETAIL_CARD_CLASSNAME } from 'utils/constants';
import notification from 'utils/notification';

import ContractHeader from '../../components/ContractHeader';
import ContractSubject from '../../components/ContractSubject';
import ContractStage from '../../components/ContractStage';
import ContractPartner from '../../components/ContractPartner';
import ContractBusinessTerms from '../../components/ContractBusinessTerms';
import ContractRebate from '../../components/ContractRebate';
import OperationRecord from '../../components/OperationRecord';
import Attachment from '../../components/Upload';
import EditorOnline from '../../components/EditorOnline';
import styles from './index.less';

const { Link } = Anchor;
const { TabPane } = Tabs;
const viewMessagePrompt = 'spcm.purchaseContractView.view.message';
const commonViewPrompt = 'spcm.common.view.message';
const modelPrompt = 'spcm.purchaseContractView.model';

/**
 * purchaseContractViewDetail - 我发起的协议详情
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {!Object} [purchaseContractView={}] - 数据源
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
@Form.create({ fieldNameProp: null })
@connect(({ loading, purchaseContractView }) => ({
  queryingHeader: loading.effects['contractCommon/fetchHeader'],
  queryingPartner: loading.effects['contractCommon/fetchPartner'],
  queryingSubject: loading.effects['contractCommon/fetchSubject'],
  queryingStage: loading.effects['contractCommon/fetchStage'],
  queryingTerm: loading.effects['contractCommon/fetchTermPage'],
  confirmLoading: loading.effects['purchaseContractView/confirmContract'],
  purchaseContractView,
}))
@formatterCollections({
  code: [
    'spcm.purchaseContractView',
    'spcm.common',
    'spcm.purchaseRequisitionCreation',
    'entity.company',
    'entity.supplier',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    const routerParams = querystring.parse(props.history.location.search.substr(1));
    const pathNames = props.history.location ? props.history.location.pathname : '';
    const statementFlag = pathNames.search('contract-statement') !== -1 || false;
    const { libFlag = '', purchase = '' } = routerParams;
    super(props);
    const {
      match = {},
      location: { search, hash },
    } = this.props;
    const { params } = match;
    const { pcHeaderId } = querystring.parse(search.substr(1));
    this.state = {
      statementFlag,
      purchase,
      libFlag,
      hash,
      pcHeaderId: params.id || pcHeaderId,
      headerInfo: {}, // 头form数据源
      listDataSource: [], // 表格数据源
      headerFetchedFlag: false, // 锚点跳转取值
      operationRecordVisible: false,
      partnerDataSource: [], // 合作伙伴数据
      partnerPagination: {}, // 合作伙伴分页
      partnerSelectedRows: [],
      pcSubjectDataSource: [],
      pcSubjectPagination: {},
      pcStageDataSource: [],
      pcStagePagination: {},
      pcSubjectSelectedRows: [],
      termDataSource: [],
      termPagination: {},
      termSelectedRows: [],
      templateListFlag: false,
      activeKey: 'contractSubjectInfo',
    };
    this.maintainContentRef = React.createRef();
    this.partnerRef = React.createRef();
    this.pcSubjectRef = React.createRef();
    this.pcStageRef = React.createRef();
    this.termRef = React.createRef();
  }

  componentDidMount() {
    const { pcHeaderId } = this.state;
    if (pcHeaderId && isNumber(+pcHeaderId)) {
      this.fetchEnum();
      this.fetchHeader();
      this.fetchList();
    }
  }

  getSnapshotBeforeUpdate() {
    const { headerInfo, headerFetchedFlag } = this.state;
    if (!headerFetchedFlag && headerInfo.editStep === 1 && headerInfo.pcKindCode !== 'ATTACHMENT') {
      return headerInfo.editStep;
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      const { hash } = this.state;
      if (hash === '') {
        return null;
      } else {
        const n = document.querySelector(`a[href="${hash}"]`);
        n.click();
      }
    }
  }

  /**
   * 查询列表
   */
  @Bind()
  fetchList() {
    this.fetchPartner();
    this.fetchSubject();
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
      type: 'purchaseContractView/fetchDetailEnum',
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
    }).then(res => {
      if (res) {
        this.handleFetchConfigAttachment();
        this.setState({ headerInfo: res }, () => {
          this.setState({ headerFetchedFlag: true });
        });
        if (res.rebateFlag) {
          this.fetchContractRebate();
        }
      }
    });
  }

  /**
   * fetchPartner - 查询合作伙伴数据
   * @param {object} params - 查询条件
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
      }).then(res => {
        if (res) {
          this.setState({
            partnerDataSource: res.map(n => ({ ...n, _status: 'update' })),
            partnerPagination: createPagination(res),
          });
        }
      });
    }
  }

  /**
   * fetchSubject - 查询合作伙伴数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchSubject(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchSubject',
        payload: {
          page,
          pcHeaderId,
          customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT',
        },
      }).then(res => {
        if (res) {
          this.setState({
            pcSubjectDataSource: res.content.map(n => ({ ...n, _status: 'update' })),
            pcSubjectPagination: {
              ...createPagination(res),
              onShowSizeChange: this.onShowSizeChange,
            },
          });
        }
      });
    }
  }

  /**
   * fetchStage - 查询标的协议阶段
   * @param {object} page - 协议阶段分页条件
   */
  @Bind()
  fetchStage(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchStage',
        payload: {
          page,
          pcHeaderId,
          customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE',
        },
      }).then(res => {
        if (res) {
          this.setState({
            pcStageDataSource: res.content.map(n => ({ ...n, _status: 'update' })),
            pcStagePagination: createPagination(res),
          });
        }
      });
    }
  }

  /**
   * fetchSubject - 查询业务条款数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchTerm(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchTermPage',
        payload: {
          page,
          pcHeaderId,
        },
      }).then(res => {
        if (res) {
          this.setState({
            termDataSource: (res.content || []).map(n => ({ ...n, _status: 'update' })),
            termPagination: createPagination(res),
          });
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
    }).then(res => {
      if (res) {
        this.setState({
          pcRebateDataSource: res.content && res.content.map(r => ({ ...r, _status: 'update' })),
          pcRebatePagination: createPagination(res),
        });
      }
    });
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
    }).then(templateList => {
      if (templateList) {
        this.setState({
          templateList,
          templateListFlag: true,
        });
      }
    });
  }

  /**
   * handleVisible - 拒绝协议
   */
  @Bind()
  handleVisible(field, flag) {
    this.setState({ [field]: !!flag });
  }

  /**
   * confirmContract - 确认协议
   */
  @Bind()
  confirmContract() {
    const { headerInfo = {} } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractView/confirmContract',
      payload: {
        pcHeaderList: [headerInfo],
        signFlag: 1,
      },
    });
  }

  /**
   * 拒绝协议
   * @param {*} values
   */
  @Bind()
  handleReject(values) {
    const { headerInfo = {} } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractView/confirmContract',
      payload: {
        pcHeaderList: [{ ...headerInfo, ...values }],
        signFlag: 1,
      },
    });
  }

  /**
   * bindHeaderAttachmentUuid - 绑定头附件id
   * @param {!string} attachmentUuid - 附件uuid返回值
   */
  @Bind()
  bindHeaderAttachmentUuid(attachmentUuid) {
    const { dispatch } = this.props;
    const {
      headerInfo: { pcHeaderId },
    } = this.state;
    dispatch({
      type: 'purchaseContractView/bindHeaderAttachmentUuid',
      payload: {
        pcHeaderId,
        attachmentUuid,
      },
    }).then(res => {
      if (res) {
        this.fetchHeader();
      }
    });
  }

  /**
   * bindLineAttachmentUuid - 获取头附件uuid
   * @param {!string} attachmentUuid - 附件uuid返回值
   * @param {object} record - 行数据
   */
  @Bind()
  bindLineAttachmentUuid(attachmentUuid, record) {
    const { dispatch } = this.props;
    const {
      headerInfo: { pcHeaderId },
    } = this.state;
    const { prLineId } = record;
    dispatch({
      type: 'purchaseContractView/bindLineAttachmentUuid',
      payload: {
        pcHeaderId,
        prLineId,
        attachmentUuid,
      },
    }).then(res => {
      if (res) {
        this.fetchHeader();
        this.fetchPartner();
      }
    });
  }

  /**
   * setItemInfoListDataSource - 设置物料信息数据源
   * @param {!Array<object>} dataSource - 数据源
   */
  @Bind()
  setItemInfoListDataSource(dataSource) {
    const { listDataSource = {} } = this.state;
    this.setState({
      listDataSource: {
        ...listDataSource,
        common: dataSource,
      },
    });
  }

  /**
   * afterOpenHeaderUploadModal - 头附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   */
  @Bind()
  afterOpenHeaderUploadModal(attachmentUuid) {
    const { headerInfo = {} } = this.state;
    if (isEmpty(headerInfo.attachmentUuid)) {
      this.bindHeaderAttachmentUuid(attachmentUuid);
    }
  }

  /**
   * afterOpenLineUploadModal - 行附件弹窗打开后判断是否获取uuid
   * @param {!Array<object>} attachmentUuid - 附件uuid
   * @param {object} record - 行数据
   */
  @Bind()
  afterOpenLineUploadModal(attachmentUuid, record) {
    if (isEmpty(record.attachmentUuid) && record._status !== 'create') {
      this.bindLineAttachmentUuid(attachmentUuid, record);
    }
  }

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleOperationRecordSearch(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    dispatch({
      type: 'purchaseContractView/fetchOperationRecordList',
      payload: {
        pcHeaderId,
        page,
      },
    }).then(result => {
      if (result) {
        // this.setState({
        //   operationRecordList: result.content,
        //   operationRecordPagination: addItemToPagination(result),
        // });
      }
    });
  }

  @Bind()
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  /**
   * getParent-获取 dom 的parent
   * @param {HTMLElement} dom
   * @return {HTMLElement}
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
      document.getElementById('spcm-contract-sign-detail-content-inner-wrapper')
    );
    return parent || document.body;
  }

  /**
   * 列表主键改变
   * @param {*} selectedRowKeys
   * @param {*} selectedRows
   * @param {*} field
   */
  @Bind()
  handleChangeSelection(selectedRowKeys, selectedRows, field) {
    this.setState({
      [`${field}SelectedRows`]: selectedRows,
    });
  }

  /**
   * pageSize 变化的回调
   * @param {*} current
   * @param {*} size
   */
  @Bind()
  onShowSizeChange(current, size) {
    const { pcSubjectPagination } = this.state;
    this.fetchSubject({
      ...pcSubjectPagination,
      pageSize: size,
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
   * 批量归档
   * @param {String} pcHeaderId
   */
  @Bind()
  sureFileContract() {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;

    dispatch({
      type: 'purchaseContractView/sureFileContract',
      payload: {
        selectedRows: [headerInfo],
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.props.history.push('/spcm/purchase-contract-view/list');
      }
    });
  }

  render() {
    const {
      form,
      match,
      location,
      purchaseContractView,
      queryingHeader = false,
      queryingPartner = false,
      queryingSubject = false,
      queryingStage = false,
      queryingTerm = false,

      bindingUuid = false,
      loadingPaymentCode = false,
      submitDeliveryLoading = false,
    } = this.props;
    const {
      operationRecordVisible,
      pcSubjectDataSource = [],
      pcSubjectPagination = {},
      pcStageDataSource = [],
      pcStagePagination = {},
      pcSubjectSelectedRows = [],
      partnerDataSource = [],
      partnerPagination = {},
      partnerSelectedRows = [],
      templateList = [],
      headerInfo = {},
      termPagination = {},
      termDataSource = [],
      termSelectedRows = [],
      templateListFlag,
      activeKey,
      libFlag,
      purchase,
      statementFlag,
      pcRebateDataSource = [],
      pcRebatePagination = {},
    } = this.state;
    const { attachmentUuid, supplierAttachmentUuid, editStep, rebateFlag } = headerInfo;

    const { search = {} } = location;
    const { detailEnumMap } = purchaseContractView;
    const { pcHeaderId = headerInfo.pcHeaderId } = querystring.parse(search.substr(1));
    const editable = false;

    /**
     * editable 根据头id
     * form 表单
     * dataSource 数据源
     * enumMap 值集
     */
    const headerInfoFormProps = {
      form,
      purchaseFlag: true, // 是否来自采购方
      terminateReasonFlag:
        headerInfo.pcStatusCode === 'TERMINATION_CONFIRM' ||
        headerInfo.pcStatusCode === 'TERMINATION',
      detailEnumMap,
      loadingPaymentCode,
      editable,
      dataSource: headerInfo,
      onChangeHeader: this.handleChangeHeader,
      afterOpenUploadModal: this.afterOpenLineUploadModal,
    };
    /**
     * editable 根据头id
     * enumMap 值集
     * dataSource 数据源
     * pagination 分页
     * selectedRowKeys 选中的行
     * onSelectionChange 分页变化回调
     * onSearch 分页改变回调
     * loading 查询状态
     */
    const contractSubjectListProps = {
      editable,
      headerInfo,
      loading: queryingSubject,
      pagination: pcSubjectPagination,
      dataSource: pcSubjectDataSource,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: pcSubjectSelectedRows,
      onAdd: () => this.handleAddLines('pcSubject'),
      onDelete: () => this.handleDeleteLines('pcSubject'),
      ref: this.partnerRef,
      onPrePaginationChange: this.fetchSubject,
      onChangeListData: this.handleChangeList,
    };
    // 新增 tab 协议阶段相关数据
    const contractStageListProps = {
      editable,
      loading: queryingStage,
      pagination: pcStagePagination,
      dataSource: pcStageDataSource,
      onRef: node => {
        this.pcStageRef = node;
      },
      onPrePaginationChange: this.fetchStage,
    };
    const contractRebateProps = {
      editable,
      dataSource: pcRebateDataSource,
      pagination: pcRebatePagination,
      onPrePaginationChange: this.fetchContractRebate,
    };
    const partnerListProps = {
      editable,
      loading: queryingPartner,
      pagination: partnerPagination,
      dataSource: partnerDataSource,
      onSearch: this.fetchPartner,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: partnerSelectedRows,
      onAdd: () => this.handleAddLines('partner'),
      onDelete: () => this.handleDeleteLines('partner'),
      ref: this.partnerRef,
      onChangeListData: this.handleChangeList,
    };
    const contractBusinessTermsListProps = {
      editable,
      loading: queryingTerm,
      pagination: termPagination,
      dataSource: termDataSource,
      onSearch: this.fetchTerm,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: termSelectedRows,
      ref: this.termRef,
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };

    const attachmentProps = {
      accept: '.docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      headerInfo,
      templateList,
      supplierAttachmentUuid,
      onUpdateHeader: this.save,
      attachmentUUID: attachmentUuid,
      onFetchHeader: this.fetchHeader,
      onHandleFetchAttachment: this.handleFetchConfigAttachment,
      isTemplateContract: true,
      supplierParams: { supplierViewFlag: true },
      showRemoveIcon: false,
    };
    return (
      <Fragment>
        {match.path !== '/pub/spcm/purchase-contract-view/detail/:id' && (
          <Header
            title={
              statementFlag
                ? intl.get(`${viewMessagePrompt}.contractStatement`).d('协议报表')
                : intl.get(`${viewMessagePrompt}.purchaseContractView`).d('我发起的协议')
            }
            backPath={
              (purchase === 'purchase' && '/sodr/purchase-order-maintain/purchase/list') ||
              (statementFlag && '/spcm/contract-statement/list') ||
              (libFlag === 'priceLib' ? '' : '/spcm/purchase-contract-view/list')
            }
          >
            {libFlag !== 'priceLib' && (
              <Button
                loading={submitDeliveryLoading}
                icon="clock-circle-o"
                type="primary"
                onClick={() =>
                  this.handleModalVisible('operationRecordVisible', true, { pcHeaderId: 1 })
                }
              >
                {intl.get(`hzero.common.button.operating`).d('操作记录')}
              </Button>
            )}
            {!isEmpty(headerInfo) && templateListFlag && <Attachment {...attachmentProps} />}
            {libFlag !== 'priceLib' && !statementFlag && (
              <Button
                onClick={this.sureFileContract}
                icon="look-over"
                disabled={
                  !(
                    (headerInfo.pcStatusCode === 'EFFECTED' && headerInfo.electricSignFlag === 1) ||
                    (headerInfo.pcStatusCode === 'CONFIRMED' && headerInfo.electricSignFlag === 0)
                  )
                }
              >
                {intl.get(`${modelPrompt}.file`).d('归档')}
              </Button>
            )}
          </Header>
        )}
        <Content>
          <div id="spcm-contract-sign-detail-content-inner-wrapper">
            <Spin
              spinning={
                queryingHeader ||
                queryingPartner ||
                submitDeliveryLoading ||
                loadingPaymentCode ||
                bindingUuid
              }
              wrapperClassName={classnames(
                styles['contract-maintain-spin-wrapper'],
                DETAIL_DEFAULT_CLASSNAME
              )}
            >
              <Row gutter={24}>
                <Col span={21}>
                  <Card
                    key="contractHeaderInformation"
                    id="spcm-maintain-detail-contract-header-information"
                    bordered={false}
                    className={DETAIL_CARD_CLASSNAME}
                    title={
                      <h3>
                        {intl
                          .get(`${commonViewPrompt}.title.contractHeaderInformation`)
                          .d('采购协议头信息')}
                      </h3>
                    }
                  >
                    <ContractHeader {...headerInfoFormProps} />
                  </Card>

                  {pcHeaderId && (
                    <div key="subjectInformation" id="spcm-maintain-detail-contract-subject">
                      <Tabs activeKey={activeKey} animated={false} onChange={this.handleSaveKey}>
                        <TabPane
                          tab={intl.get(`${commonViewPrompt}.title.contractSubject`).d('协议标的')}
                          key="contractSubjectInfo"
                        >
                          <ContractSubject {...contractSubjectListProps} />
                        </TabPane>
                        <TabPane
                          tab={intl.get(`${commonViewPrompt}.title.contractStage`).d('协议阶段')}
                          key="contractStage"
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
                      id="spcm-maintain-detail-contract-partner"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get(`${commonViewPrompt}.title.contractPartnerInformation`)
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
                      id="spcm-maintain-detail-contract-business-terms"
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
                      id="spcm-contract-approval-detail-contract-online-edit"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl.get(`spcm.common.title.contractOnlineEdit`).d('采购协议文本编辑')}
                        </h3>
                      }
                    >
                      <EditorOnline
                        iframeStyle={{
                          width: '100%',
                          height: `${(document.body.clientHeight - 96) * 0.9}px`,
                        }}
                        pcHeaderId={pcHeaderId}
                        permissionCode="VIEW"
                      />
                    </Card>
                  )}
                </Col>
                <Col span={3}>
                  <Affix
                    style={{ top: '200px', width: 'calc( 100% - 11px )', position: 'absolute' }}
                    offsetTop={224}
                    target={this.getAffixContainer}
                  >
                    <Anchor getContainer={this.getAffixContainer} offsetTop={24}>
                      <Link
                        href="#spcm-maintain-detail-contract-header-information"
                        title={intl.get(`${commonViewPrompt}.title.basicInformation`).d('基本信息')}
                      />
                      <Link
                        href="#spcm-maintain-detail-contract-subject"
                        title={intl
                          .get(`${commonViewPrompt}.title.subjectInformation`)
                          .d('标的信息')}
                      />
                      <Link
                        href="#spcm-maintain-detail-contract-partner"
                        title={intl
                          .get(`${commonViewPrompt}.title.partnerInformation`)
                          .d('伙伴信息')}
                      />
                      {pcHeaderId && headerInfo.pcKindCode !== 'ATTACHMENT' && (
                        <Link
                          href="#spcm-maintain-detail-contract-business-terms"
                          title={intl
                            .get(`${commonViewPrompt}.title.businessTermsInformation`)
                            .d('业务条款')}
                        />
                      )}
                      {pcHeaderId && editStep === 1 && headerInfo.pcKindCode !== 'ATTACHMENT' && (
                        <Link
                          href="#spcm-contract-approval-detail-contract-online-edit"
                          title={intl.get(`spcm.common.title.onlineEdit`).d('文本编辑')}
                        />
                      )}
                    </Anchor>
                  </Affix>
                </Col>
              </Row>
            </Spin>
          </div>
        </Content>
        <OperationRecord {...operationRecordProps} />
      </Fragment>
    );
  }
}
