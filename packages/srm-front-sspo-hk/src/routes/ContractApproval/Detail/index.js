/*
 * ContractApprovalDetail - 协议审批详情
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button, Spin, Modal, Form, Row, Col, Anchor, Affix, Input, Card, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { isNumber, isEmpty, omit } from 'lodash';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import uuid from 'uuid/v4';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import {
  // getCurrentOrganizationId,
  addItemToPagination,
  createPagination,
  delItemToPagination,
} from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME, DETAIL_CARD_CLASSNAME } from 'utils/constants';

import ContractHeader from '../../components/ContractHeader';
import ContractSubject from '../../components/ContractSubject';
import ContractStage from '../../components/ContractStage';
import ContractPartner from '../../components/ContractPartner';
import ContractBusinessTerms from '../../components/ContractBusinessTerms';
import ContractRebate from '../../components/ContractRebate';
import OperationRecord from '../../components/OperationRecord';
import styles from './index.less';
import Attachment from '../../components/Upload';
import EditorOnline from '../../components/EditorOnline';

const { Link } = Anchor;
const { TabPane } = Tabs;
const { TextArea } = Input;
const FormItem = Form.Item;
const viewMessagePrompt = 'spcm.contractApproval.view.message';
const commonPrompt = 'spcm.common.view.message.title';
// const viewTitlePrompt = 'spcm.contractApproval.view.title';

/**
 * ContractApprovalDetail - 协议审批详情
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {!Object} [contractApproval={}] - 数据源
 * @reactProps {boolean} [getHeaderAttachmentUuidLoading=false] - 获取附件uuid处理中
 * @reactProps {boolean} [deleteDetailLinesLoading=false] - 删除明细行处理中
 * @reactProps {boolean} [submitDeliveryLoading=false] - 提交送货单处理中
 * @reactProps {boolean} [deleteDeliveryLoading=false] - 删除送货单处理中
 * @reactProps {boolean} [queryCreateListLoading=false] - 查询可创建行处理中
 * @reactProps {boolean} [queryMaintenanceListLoading=false] - 查询可审批行处理中
 * @reactProps {boolean} [fetchingDetailHeader=false] - 查询明细头处理中
 * @reactProps {boolean} [queryDetailListLoading=false] - 查询明细行处理中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@connect(({ loading, contractApproval }) => ({
  queryingHeader: loading.effects['contractCommon/fetchHeader'],
  queryingPartner: loading.effects['contractCommon/fetchPartner'],
  queryingSubject: loading.effects['contractCommon/fetchSubject'],
  queryingStage: loading.effects['contractCommon/fetchStage'],
  queryingTerm: loading.effects['contractCommon/fetchTermPage'],
  approving: loading.effects['contractApproval/approveList'],
  rejecting: loading.effects['contractApproval/rejectApprovalList'],
  queryingPcAttachmentList: loading.effects['contractCommon/fetchPcAttachmentList'],
  contractApproval,
}))
@formatterCollections({
  code: [
    'spcm.contractApproval',
    'spcm.common',
    'entity.organization',
    'entity.attachment',
    'entity.company',
    'entity.business',
    'entity.item',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcHeaderId } = querystring.parse(search.substr(1));
    this.state = {
      pcHeaderId,
      headerInfo: {}, // 头form数据源
      listDataSource: [], // 表格数据源
      isClearListCacheDataSource: true, // 是否清除表格缓存数据源
      operationRecordVisible: false,
      requireApprovedRemark: false,
      // tenantId: getCurrentOrganizationId(),
      partnerDataSource: [], // 合作伙伴数据
      partnerPagination: {}, // 合作伙伴分页
      pcStagePagination: {}, // 标的阶段分页
      partnerSelectedRows: [],
      pcSubjectDataSource: [],
      pcStageDataSource: [],
      pcSubjectPagination: {},
      pcSubjectSelectedRows: [],
      termDataSource: [],
      termPagination: {},
      termSelectedRows: [],
      templateList: [],
      templateListFlag: false,
      activeKey: 'contractSubjectInfo', // tab切换
    };
    this.maintainContentRef = React.createRef();
    this.pcStageRef = React.createRef();
  }

  componentDidMount() {
    const { pcHeaderId } = this.state;
    if (isNumber(+pcHeaderId)) {
      this.fetchEnum();
      this.fetchHeader();
      this.fetchList();
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
      type: 'contractApproval/fetchDetailEnum',
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
        this.setState({ headerInfo: res });
        this.handleFetchConfigAttachment();
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
   * preReject - 协议拒绝前置modal弹窗
   */
  @Bind()
  preReject() {
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    Modal.confirm({
      title: intl.get(`${viewMessagePrompt}.preReject`).d(`确定审批拒绝吗？`),
      onOk: () => {
        this.setState(
          {
            requireApprovedRemark: true,
          },
          () => this.reject()
        );
      },
      onCancel: () =>
        this.setState({ requireApprovedRemark: false }, () =>
          validateFieldsAndScroll({ force: true })
        ),
    });
  }

  /**
   * reject - 采购申请拒绝
   */
  @Bind()
  reject() {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
    } = this.props;
    const { headerInfo = {} } = this.state;
    const { pcHeaderIdSet, ...otherHeaderInfo } = headerInfo;
    validateFieldsAndScroll({ force: true }, (errs, values) => {
      if (!errs) {
        dispatch({
          type: 'contractApproval/rejectApprovalList',
          payload: {
            pcHeaderList: [otherHeaderInfo],
            approvedRemark: values.approvedRemark,
          },
        }).then(res => {
          if (res) {
            notification.success();
            this.props.history.push('/spcm/contract-approval/list');
          } else {
            this.fetchHeader();
            this.fetchList();
          }
        });
      }
    });
  }

  /**
   * 审批通过协议
   */
  @Bind()
  approve() {
    const {
      dispatch,
      form: { getFieldValue, validateFieldsAndScroll },
    } = this.props;
    const { headerInfo = {} } = this.state;
    const approvedRemark = getFieldValue('approvedRemark');
    this.setState({ requireApprovedRemark: false }, () => validateFieldsAndScroll({ force: true }));
    const { pcHeaderIdSet, ...otherHeaderInfo } = headerInfo;
    dispatch({
      type: 'contractApproval/approveList',
      payload: {
        pcHeaderList: [otherHeaderInfo],
        approvedRemark,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.props.history.push('/spcm/contract-approval/list');
      } else {
        this.fetchHeader();
        this.fetchList();
      }
    });
  }

  /**
   * delete 删除采购申请
   */
  @Bind()
  delete() {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;
    Modal.confirm({
      title: intl.get(`${viewMessagePrompt}.deletePurchaseLines`).d('是否删除'),
      onOk: () => {
        dispatch({
          type: 'contractApproval/delete',
          payload: [headerInfo],
        }).then(res => {
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

  @Bind()
  cancel() {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;
    Modal.confirm({
      title: intl.get(`${viewMessagePrompt}.cancelPurchase`).d('是否取消采购申请'),
      onOk: () => {
        dispatch({
          type: 'contractApproval/cancel',
          payload: {
            prHeaderDTOs: [headerInfo],
          },
        }).then(res => {
          if (res) {
            notification.success();
            dispatch(
              routerRedux.push({
                pathname: `/spcm/purchase-requisition-creation/list`,
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
  handleAddLines(key) {
    const sourceField = `${key}DataSource`;
    const paginationField = `${key}Pagination`;
    const rowKey = `${key}Id`;
    const { [sourceField]: dataSource = [], [paginationField]: pagination = {} } = this.state;
    const newItem = { _status: 'create', [rowKey]: uuid() };
    const params = {
      [sourceField]: [newItem, ...dataSource],
      [paginationField]: addItemToPagination(dataSource.length + 1, pagination),
    };
    this.setState({ ...params });
  }

  /**
   * handleDeleteLines - 删除采购申请行
   */
  @Bind()
  handleDeleteLines(key) {
    const sourceField = `${key}DataSource`;
    const paginationField = `${key}Pagination`;
    const selectedField = `${key}SelectedRows`;
    const actionField = `${key}LinesDelete`;
    const rowKey = `${key}Id`;
    const { dispatch } = this.props;
    const {
      [sourceField]: dataSource = [],
      [paginationField]: pagination = {},
      [selectedField]: selectedRows = [],
    } = this.state;
    const newDataSource = [];
    const deleteList = [];
    Modal.confirm({
      title: intl.get(`${viewMessagePrompt}.deletePurchaseLines`).d('是否删除'),
      onOk: () => {
        const selectedRowKeys = selectedRows.map(n => n[rowKey]);
        dataSource.forEach(item => {
          if (!selectedRowKeys.includes(item[rowKey])) {
            newDataSource.push(item);
          } else if (item._status !== 'create') {
            deleteList.push(omit(item, ['$form']));
          }
        });
        if (!isEmpty(deleteList)) {
          dispatch({
            type: `contractApproval/${actionField}`,
            payload: deleteList,
          }).then(res => {
            if (res) {
              if (res) {
                this.setState({ [selectedField]: [] });
                notification.success();
                this.fetchHeader();
                this.fetchList();
              }
            }
          });
        } else {
          this.setState({
            [sourceField]: newDataSource,
            [paginationField]: delItemToPagination(newDataSource.length, pagination),
          });
          this.setState({ [selectedField]: [] });
        }
      },
    });
  }

  /**
   * 修改头数据
   * @param {*} headerInfo
   */
  @Bind()
  handleChangeHeader(headerInfo) {
    this.setState({ headerInfo });
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
      type: 'contractApproval/bindHeaderAttachmentUuid',
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
      type: 'contractApproval/bindLineAttachmentUuid',
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
      type: 'contractApproval/fetchOperationRecordList',
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
      document.getElementById('spcm-contract-approval-detail-content-inner-wrapper')
    );
    return parent || document.body;
  }

  /**
   * 选中行回调
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

  render() {
    const {
      form,
      location,
      dispatch,
      deletingLines,
      contractApproval,
      queryingHeader = false,
      queryingPartner = false,
      queryingSubject = false,
      queryingStage = false,
      queryingTerm = false,
      approving = false,
      rejecting = false,
      queryingPcAttachmentList = false,

      queryDetailListLoading = false,
      bindingUuid = false,
      loadingPaymentCode = false,
      submitDeliveryLoading = false,
      fetchingDetailHeader = false,
    } = this.props;
    const {
      isClearListCacheDataSource,
      operationRecordVisible,
      requireApprovedRemark = false,
      pcSubjectDataSource = [],
      pcStageDataSource = [],
      pcStagePagination = {},
      pcSubjectPagination = {},
      pcSubjectSelectedRows = [],
      partnerDataSource = [],
      partnerPagination = {},
      partnerSelectedRows = [],
      headerInfo = {},
      termPagination = {},
      termDataSource = [],
      termSelectedRows = [],
      templateList = [],
      templateListFlag,
      activeKey,
      pcRebateDataSource = [],
      pcRebatePagination = {},
    } = this.state;
    const { getFieldDecorator } = form;
    const {
      prStatusCode,
      attachmentUuid,
      supplierAttachmentUuid,
      editStep,
      rebateFlag,
    } = headerInfo;
    const { search = {} } = location;
    const { detailEnumMap } = contractApproval;
    const {
      prSourcePlatform = headerInfo.prSourcePlatform,
      pcHeaderId = headerInfo.pcHeaderId,
    } = querystring.parse(search.substr(1));
    const editable = false;
    const check = false;

    /**
     * editable 根据头id
     * form 表单
     * dataSource 数据源
     * enumMap 值集
     */
    const headerInfoFormProps = {
      prSourcePlatform,
      detailEnumMap,
      loadingPaymentCode,
      editable,
      purchaseFlag: true, // 是否来自采购方
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
      check,
      headerInfo,
      loading: queryingSubject,
      pagination: pcSubjectPagination,
      dataSource: pcSubjectDataSource,
      onSearch: this.fetchSubject,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: pcSubjectSelectedRows,
      onAdd: () => this.handleAddLines('pcSubject'),
      onDelete: () => this.handleDeleteLines('pcSubject'),
      onPrePaginationChange: this.fetchSubject,

      dispatch,
      prStatusCode,
      prSourcePlatform,
      deletingLines,
      onChangeListData: this.handleChangeList,
      onChangeHeader: this.handleChangeHeader,
      wrappedComponentRef: node => {
        this.list = node;
      },
      isClearListCacheDataSource,
      fetchList: this.fetchPartner,
      deleteLines: this.deleteDetailLines,
      setDataSource: this.setItemInfoListDataSource,
      afterOpenUploadModal: this.afterOpenLineUploadModal,
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

      dispatch,
      headerInfo,
      prStatusCode,
      prSourcePlatform,
      deletingLines,

      onChangeListData: this.handleChangeList,
      onChangeHeader: this.handleChangeHeader,
      wrappedComponentRef: node => {
        this.list = node;
      },
      isClearListCacheDataSource,
      fetchList: this.fetchPartner,
      deleteLines: this.deleteDetailLines,
      setDataSource: this.setItemInfoListDataSource,
      afterOpenUploadModal: this.afterOpenLineUploadModal,
    };
    const contractBusinessTermsListProps = {
      editable,
      check,
      loading: queryingTerm,
      pagination: termPagination,
      dataSource: termDataSource,
      onSearch: this.fetchTerm,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: termSelectedRows,

      dispatch,
      headerInfo,
      prStatusCode,
      prSourcePlatform,
      deletingLines,
      onAdd: () => this.handleAddLines('term'),
      onDelete: () => this.handleDeleteLines('term'),
      onChangeListData: this.handleChangeList,
      onChangeHeader: this.handleChangeHeader,
      wrappedComponentRef: node => {
        this.list = node;
      },
      isClearListCacheDataSource,
      fetchList: this.fetchPartner,
      deleteLines: this.deleteDetailLines,
      setDataSource: this.setItemInfoListDataSource,
      afterOpenUploadModal: this.afterOpenLineUploadModal,
    };

    const attachmentProps = {
      accept: '.docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      headerInfo,
      templateList,
      onChangeState: state => {
        this.setState(state);
      },
      supplierAttachmentUuid,
      attachmentUUID: attachmentUuid,
      onUpdateHeader: this.save,
      onFetchHeader: this.fetchHeader,
      onRefresh: this.handleFetchConfigAttachment,
      // purchaserParams: { purchaserUploadFlag: true },
      btnProps: {
        disabled: !pcHeaderId || queryingPcAttachmentList || queryingHeader,
        btnText: intl.get(`entity.attachment.tag`).d('附件'),
      },
      showRemoveIcon: false,
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };

    return (
      <Fragment>
        <Header
          title={intl.get(`${viewMessagePrompt}.title.purchaseMaintain`).d('协议审批')}
          backPath="/spcm/contract-approval/list"
        >
          <Button
            loading={approving}
            onClick={this.approve}
            icon="check"
            type="primary"
            disabled={fetchingDetailHeader || queryDetailListLoading || submitDeliveryLoading}
          >
            {intl.get(`spfm.certificationApproval.view.button.approval`).d('审批通过')}
          </Button>
          <Button
            loading={rejecting}
            onClick={this.preReject}
            icon="close"
            disabled={fetchingDetailHeader || queryDetailListLoading || submitDeliveryLoading}
          >
            {intl.get(`spcm.common.button.reject`).d('审批拒绝')}
          </Button>
          <Button
            loading={submitDeliveryLoading}
            icon="clock-circle-o"
            // disabled={
            //   saveDetailLoading || fetchingDetailHeader || queryDetailListLoading || !pcHeaderId
            // }
            onClick={() =>
              this.handleModalVisible('operationRecordVisible', true, { pcHeaderId: 1 })
            }
          >
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </Button>
          {!isEmpty(headerInfo) && templateListFlag && <Attachment {...attachmentProps} />}
        </Header>
        <Content>
          <div id="spcm-contract-approval-detail-content-inner-wrapper">
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
              <Row className="approve-header" gutter={48}>
                <Col>{intl.get(`${viewMessagePrompt}.approvalOpinion`).d('审批意见')}</Col>
              </Row>
              <Row className="approve-option">
                <Col span={12}>
                  <FormItem className={styles['approval-remark-form-item']}>
                    {getFieldDecorator('approvedRemark', {
                      rules: [
                        {
                          max: 160,
                          message: intl
                            .get(`hzero.common.validation.max`, {
                              max: 160,
                            })
                            .d(`长度不能超过${160}个字符`),
                        },
                        {
                          required: requireApprovedRemark,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get(`${viewMessagePrompt}.approvalOpinion`).d('审批意见'),
                          }),
                        },
                      ],
                    })(<TextArea rows={2} />)}
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={21}>
                  <Card
                    key="contractHeaderInformation"
                    id="spcm-contract-approval-detail-contract-header-information"
                    bordered={false}
                    className={DETAIL_CARD_CLASSNAME}
                    title={
                      <h3>
                        {intl.get(`${commonPrompt}.contractHeaderInformation`).d('采购协议头信息')}
                      </h3>
                    }
                  >
                    <ContractHeader {...headerInfoFormProps} />
                  </Card>
                  {pcHeaderId && (
                    <div
                      key="subjectInformation"
                      id="spcm-contract-approval-detail-contract-subject"
                    >
                      <Tabs activeKey={activeKey} animated={false} onChange={this.handleSaveKey}>
                        <TabPane
                          tab={intl.get(`${commonPrompt}.title.contractSubject`).d('协议标的')}
                          key="contractSubjectInfo"
                        >
                          <ContractSubject {...contractSubjectListProps} />
                        </TabPane>
                        <TabPane
                          tab={intl.get(`${commonPrompt}.title.contractStage`).d('协议阶段')}
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
                      key="contractPartner"
                      id="spcm-contract-approval-detail-contract-partner"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get(`${commonPrompt}.contractPartnerInformation`)
                            .d('采购协议伙伴信息')}
                        </h3>
                      }
                    >
                      <ContractPartner {...partnerListProps} />
                    </Card>
                  )}
                  {pcHeaderId && headerInfo.pcKindCode !== 'ATTACHMENT' && (
                    <Card
                      key="contractBusinessTerms"
                      id="spcm-contract-approval-detail-contract-business-terms"
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
                    <Anchor
                      className={styles['anchor-wrapper']}
                      getContainer={this.getAffixContainer}
                      offsetTop={138}
                    >
                      <Link
                        href="#spcm-contract-approval-detail-contract-header-information"
                        title={intl.get(`${commonPrompt}.basicInformation`).d('基本信息')}
                      />
                      <Link
                        href="#spcm-contract-approval-detail-contract-subject"
                        title={intl.get(`${commonPrompt}.subjectInformation`).d('标的信息')}
                      />
                      <Link
                        href="#spcm-contract-approval-detail-contract-partner"
                        title={intl.get(`${commonPrompt}.partnerInformation`).d('伙伴信息')}
                      />
                      {pcHeaderId && headerInfo.pcKindCode !== 'ATTACHMENT' && (
                        <Link
                          href="#spcm-contract-approval-detail-contract-business-terms"
                          title={intl.get(`${commonPrompt}.businessTermsInformation`).d('业务条款')}
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
