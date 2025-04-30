/*
 * purchaseContractViewDetail - 我收到的协议详情
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

import { Header, Content } from 'components/Page';
import { createPagination } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME, DETAIL_CARD_CLASSNAME } from 'utils/constants';

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
const viewMessagePrompt = 'spcm.supplierContractView.view.message';
const commonViewPrompt = 'spcm.common.view.message';
// const viewTitlePrompt = 'spcm.supplierContractView.view.title';

/**
 * purchaseContractViewDetail - 我收到的协议详情
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {!Object} [supplierContractView={}] - 数据源
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
@connect(({ loading, supplierContractView }) => ({
  queryingHeader: loading.effects['contractCommon/fetchHeader'],
  queryingPartner: loading.effects['contractCommon/fetchPartner'],
  queryingSubject: loading.effects['contractCommon/fetchSubject'],
  queryingStage: loading.effects['contractCommon/fetchStage'],
  queryingTerm: loading.effects['contractCommon/fetchTermPage'],
  confirmLoading: loading.effects['supplierContractView/confirmContract'],
  supplierContractView,
}))
@formatterCollections({
  code: [
    'spcm.supplierContractView',
    'spcm.common',
    'entity.roles',
    'entity.company',
    'entity.business',
    'entity.item',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search, hash },
    } = this.props;
    const { pcHeaderId } = querystring.parse(search.substr(1));
    this.state = {
      hash,
      pcHeaderId,
      headerInfo: {}, // 头form数据源
      listDataSource: [], // 表格数据源
      headerFetchedFlag: false, // 锚点
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
      type: 'supplierContractView/fetchDetailEnum',
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
      type: 'supplierContractView/confirmContract',
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
      type: 'supplierContractView/confirmContract',
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
      type: 'supplierContractView/bindHeaderAttachmentUuid',
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
      type: 'supplierContractView/bindLineAttachmentUuid',
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
      type: 'supplierContractView/fetchOperationRecordList',
      payload: {
        pcHeaderId,
        page,
      },
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
      document.getElementById('spcm-contract-supplier-detail-content-inner-wrapper')
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
   * 保存激活的tab的key
   * @param {String} activeKey
   */
  @Bind()
  handleSaveKey(activeKey) {
    this.setState({ activeKey });
  }

  render() {
    const {
      form,
      location,
      supplierContractView,
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
      pcSubjectSelectedRows = [],
      partnerDataSource = [],
      partnerPagination = {},
      pcStageDataSource = [],
      pcStagePagination = {},
      partnerSelectedRows = [],
      templateList = [],
      headerInfo = {},
      termPagination = {},
      termDataSource = [],
      termSelectedRows = [],
      templateListFlag,
      activeKey,
      pcRebateDataSource = [],
      pcRebatePagination = {},
    } = this.state;
    const { attachmentUuid, supplierAttachmentUuid, editStep, rebateFlag } = headerInfo;
    const { search = {} } = location;
    const { detailEnumMap } = supplierContractView;
    const {
      prSourcePlatform = headerInfo.prSourcePlatform,
      pcHeaderId = headerInfo.pcHeaderId,
    } = querystring.parse(search.substr(1));
    const editable = false;

    /**
     * editable 根据头id
     * form 表单
     * dataSource 数据源
     * enumMap 值集
     */
    const headerInfoFormProps = {
      form,
      prSourcePlatform,
      detailEnumMap,
      loadingPaymentCode,
      editable,
      dataSource: headerInfo,
      terminateReasonFlag:
        headerInfo.pcStatusCode === 'TERMINATION_CONFIRM' ||
        headerInfo.pcStatusCode === 'TERMINATION',
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
      onSearch: this.fetchPartner,
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
      supplierFilePreview: true,
      supplierViewOnly: true,
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
        <Header
          title={intl.get(`${viewMessagePrompt}.supplierContractView`).d('我收到的协议')}
          backPath="/spcm/supplier-contract-view/list"
        >
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
          {!isEmpty(headerInfo) && templateListFlag && <Attachment {...attachmentProps} />}
        </Header>
        <Content>
          <div id="spcm-contract-supplier-detail-content-inner-wrapper">
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
                    <div
                      key="subjectInformation"
                      id="spcm-contract-maintain-detail-contract-subject"
                    >
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
                          {intl
                            .get(`${commonViewPrompt}.title.contractOnlineEdit`)
                            .d('采购协议文本编辑')}
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
                      />{' '}
                      {pcHeaderId && headerInfo.pcKindCode !== 'ATTACHMENT' && (
                        <Link
                          href="#spcm-maintain-detail-contract-business-terms"
                          title={intl
                            .get(`${commonViewPrompt}.title.businessTermsInformation`)
                            .d('业务条款')}
                        />
                      )}{' '}
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
