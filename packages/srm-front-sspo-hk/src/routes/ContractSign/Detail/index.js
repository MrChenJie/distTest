/*
 * @Description: ContractSignDetail - 协议签署详情
 * @Author: HB <bin.huang02@hand-china.com>
 * @Date: 2019-08-16 15:19:28
 * @LastEditTime : 2020-02-04 17:22:20
 * @version: 0.0.1
 */

import React, { Component, Fragment } from 'react';
import { Button, Spin, Form, Row, Col, Anchor, Affix, Card, Icon, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { isNumber, isEmpty } from 'lodash';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import { createPagination } from 'utils/utils';
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
import RejectModal from './RejectModal';
import ValidateModal from './ValidateModal';
import EditorOnline from '../../components/EditorOnline';
import Attachment from '../../components/Upload';
import styles from './index.less';

const { Link } = Anchor;
const { TabPane } = Tabs;
const viewMessagePrompt = 'spcm.contractSign.view.message';
const commonViewMessage = 'spcm.common.view.message';

/**
 * ContractSignDetail - 协议签署详情
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {!Object} [contractSign={}] - 数据源
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
@connect(({ loading, contractSign }) => ({
  queryingHeader: loading.effects['contractCommon/fetchHeader'],
  queryingPartner: loading.effects['contractCommon/fetchPartner'],
  queryingSubject: loading.effects['contractCommon/fetchSubject'],
  queryingStage: loading.effects['contractCommon/fetchStage'],
  queryingTerm: loading.effects['contractCommon/fetchTerm'],
  confirmLoading: loading.effects['contractSign/confirmContract'],
  rejectLoading: loading.effects['contractSign/rejectContract'],
  contractLoading: loading.effects['contractSign/confirmMobile'],
  contractSignLoading: loading.effects['contractSign/contractSign'],
  contractSign,
}))
@formatterCollections({
  code: [
    'spcm.contractSign',
    'spcm.common',
    'entity.roles',
    'entity.company',
    'entity.business',
    'entity.item',
    'spcm.purchaseRequisitionCreation',
    'entity.supplier',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcHeaderId, supplierCompanyId } = querystring.parse(search.substr(1));
    this.state = {
      pcHeaderId,
      supplierCompanyId,
      headerInfo: {}, // 头form数据源
      currentPic: 0,
      listDataSource: [], // 表格数据源
      headerFetchedFlag: false, // 锚点
      isClearListCacheDataSource: true, // 是否清除表格缓存数据源
      operationRecordVisible: false,
      partnerDataSource: [], // 合作伙伴数据
      partnerPagination: {}, // 合作伙伴分页
      partnerSelectedRows: [],
      pcSubjectDataSource: [],
      pcSubjectPagination: {},
      pcSubjectSelectedRows: [],
      pcStagePagination: {},
      pcStageDataSource: [],
      termDataSource: [],
      termPagination: {},
      termSelectedRows: [],
      rejectModalVisible: false, // 审批拒绝弹窗
      templateList: [],
      mobileModalVisible: false, // 手机验证弹窗
      picArray: [], // 所有公司印章图片信息
      focusStatus: undefined, // 当前选中的印章图片
      sealPictureUrl: '', // 选中印章图片url
      sealId: '', // 选中印章图片ID
      signFlag: false, // 是否已经盖章
      templateListFlag: false,
      activeKey: 'contractSubjectInfo',
    };
    this.maintainContentRef = React.createRef();
    this.partnerRef = React.createRef();
    this.pcSubjectRef = React.createRef();
    this.pcStageRef = React.createRef();
    this.termRef = React.createRef();
    this.editorOnlineRef = React.createRef();
  }

  componentDidMount() {
    const { pcHeaderId } = this.state;
    if (pcHeaderId && isNumber(+pcHeaderId)) {
      // this.fetchEnum();
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
      const { hash } = location;
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
  // @Bind()
  // fetchEnum() {
  //   const { dispatch } = this.props;
  //   dispatch({
  //     type: 'contractSign/fetchDetailEnum',
  //   });
  // }

  /**
   * fetchHeader - 查询头明细数据
   */
  @Bind()
  fetchHeader() {
    const { dispatch } = this.props;
    const { pcHeaderId, supplierCompanyId } = this.state;
    return dispatch({
      type: 'contractSign/fetchHeader',
      payload: {
        companyId: supplierCompanyId,
        pcHeaderId,
        customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL',
      },
    }).then(res => {
      if (res) {
        this.handleFetchConfigAttachment();
        this.setState({ headerInfo: res }, () => {
          this.setState({
            headerFetchedFlag: true,
            signFlag:
              res.pcStatusCode === 'PUBLISHED' || res.pcStatusCode === 'TERMINATION_CONFIRM',
          });
        });
        const {
          headerInfo: { electricSignFlag },
        } = this.state;
        if (electricSignFlag) {
          this.fetchSignImg();
        }
        if (res.rebateFlag) {
          this.fetchContractRebate();
        }
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
   * handleVisible - 拒绝协议
   */
  @Bind()
  handleVisible(field, flag) {
    const { dispatch } = this.props;
    const { headerInfo = {} } = this.state;
    if (headerInfo.pcStatusCode === 'TERMINATION_CONFIRM') {
      dispatch({
        type: 'contractSign/sureRejectContract',
        payload: { pcHeaderList: [headerInfo] },
      }).then(res => {
        if (res) {
          notification.success();
          this.props.history.push('/spcm/contract-sign/list');
        }
      });
    } else {
      this.setState({ [field]: !!flag });
    }
  }

  /**
   * confirmContract - 确认协议
   */
  @Bind()
  confirmContract() {
    const { headerInfo = {} } = this.state;
    const { dispatch } = this.props;
    if (!headerInfo.electricSignFlag) {
      if (headerInfo.pcStatusCode === 'TERMINATION_CONFIRM') {
        dispatch({
          type: 'contractSign/sureContract',
          payload: { pcHeaderList: [headerInfo] },
        }).then(res => {
          if (res) {
            notification.success();
            this.props.history.push('/spcm/contract-sign/list');
          }
        });
      } else {
        dispatch({
          type: 'contractSign/confirmContract',
          payload: { pcHeaderList: [headerInfo] },
        }).then(res => {
          if (res) {
            notification.success();
            this.props.history.push('/spcm/contract-sign/list');
          }
        });
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (headerInfo.pcStatusCode === 'TERMINATION_CONFIRM') {
        dispatch({
          type: 'contractSign/sureContract',
          payload: { pcHeaderList: [headerInfo] },
        }).then(res => {
          if (res) {
            notification.success();
            this.props.history.push('/spcm/contract-sign/list');
          }
        });
      } else {
        const hash = '#spcm-contract-sign-detail-contract-online-edit';
        const n = document.querySelector(`a[href="${hash}"]`);
        n.click();
      }
    }
  }
  /**
   * 获取公司印章图片
   * @param {*} values
   */

  fetchSignImg() {
    const { dispatch } = this.props;
    const {
      supplierCompanyId,
      headerInfo: { tenantId },
    } = this.state;
    dispatch({
      type: 'contractSign/fetchSignImgList',
      payload: { companyId: supplierCompanyId, tenantId, lovCode: 'SPFM.COMPANY_SEAL' },
    }).then(res => {
      if (res) {
        const {
          headerInfo: { editStep, pcKindCode },
        } = this.state;
        const picArray = res.filter(item => {
          return item.sealFileUrl !== null && item.enabledFlag !== 0;
        });
        this.setState({ picArray }, () => {
          if (this.state.picArray.length > 0 && editStep === 1 && pcKindCode !== 'ATTACHMENT') {
            const imgHeight = document.getElementsByClassName('eachPic')[0].clientWidth;
            this.setState({ imgHeight });
          }
        });
      }
    });
  }

  /**
   * 拒绝协议
   * @param {*} values
   */
  @Bind()
  handleReject(processRemark) {
    const { headerInfo = {} } = this.state;
    const { dispatch } = this.props;
    const { pcHeaderIdSet, ...otherParams } = headerInfo;
    dispatch({
      type: 'contractSign/rejectContract',
      payload: { pcHeaderList: [otherParams], processRemark },
    }).then(res => {
      if (res) {
        notification.success();
        this.props.history.push('/spcm/contract-sign/list');
      }
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
      type: 'contractSign/bindHeaderAttachmentUuid',
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
      type: 'contractSign/bindLineAttachmentUuid',
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
      type: 'contractSign/fetchOperationRecordList',
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
   * 显示手机验证签署弹窗,没有手机校验的直接电签
   * @param {*} values
   */
  @Bind()
  signContract() {
    const {
      pcHeaderId,
      sealPictureUrl,
      sealId,
      supplierCompanyId,
      headerInfo: { mobileVerifyFlag },
    } = this.state;
    const { dispatch } = this.props;
    if (mobileVerifyFlag === 0) {
      dispatch({
        type: 'contractSign/contractSign',
        payload: {
          pcHeaderId,
          sealPictureUrl,
          sealId,
          companyId: supplierCompanyId,
        },
      }).then(res => {
        if (res) {
          notification.success();
          this.setState({ signFlag: false });
          this.editorOnlineRef.fetchEditorOnlineHTML();
        }
      });
    } else {
      this.setState({ mobileModalVisible: true });
    }
  }

  /**
   * 手机验证确认签署
   */
  @Bind()
  handleOk(values = {}) {
    const { pcHeaderId, sealPictureUrl, sealId, supplierCompanyId } = this.state;
    const { dispatch } = this.props;
    if (!isEmpty(values)) {
      dispatch({
        type: 'contractSign/confirmMobile',
        payload: {
          pcHeaderId,
          sealPictureUrl,
          sealId,
          companyId: supplierCompanyId,
          ...values,
        },
      }).then(res => {
        if (res) {
          this.handleModalVisible('mobileModalVisible', false);
          notification.success();
          this.setState({ signFlag: false });
          this.editorOnlineRef.fetchEditorOnlineHTML();
        }
      });
    }
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
   * 点击图片样式修改
   */
  @Bind()
  handleClickImg(index) {
    const { focusStatus, picArray } = this.state;
    this.setState({
      focusStatus: focusStatus === index ? undefined : index,
      sealPictureUrl: picArray[index].sealPictureUrl,
      sealId: picArray[index].sealId,
    });
  }

  /**
   * 获取验证码
   * @param {*} [values={}]
   * @memberof Detail
   */
  @Bind()
  handleCheckCode(values = {}) {
    const { dispatch } = this.props;
    const {
      headerInfo: { certificateResId, supplierCompanyId },
    } = this.state;
    this.modalForm.validateFields(['mobile'], err => {
      if (!err) {
        dispatch({
          type: 'contractSign/getCheckCode',
          payload: {
            mobile: values,
            certificateResId,
            companyId: supplierCompanyId,
          },
        });
      }
    });
  }

  /**
   * 点击向上按钮图片向上移动
   *
   * @returns
   * @memberof Detail
   */
  @Bind()
  goToPictureSign(type) {
    const { currentPic, imgHeight } = this.state;
    this.setState({
      currentPic: type === 'up' ? currentPic - (imgHeight + 16) : currentPic + (imgHeight + 16),
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

  /**
   * 防抖，减少渲染频率
   * @param {Function} fun 回调函数
   * @param {number} delay 延时
   */
  @Bind()
  debounce(fun, delay) {
    let timeout = null;
    // eslint-disable-next-line
    return function() {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        fun.call(this, arguments); // eslint-disable-line
      }, delay);
    };
  }

  render() {
    const {
      form,
      location,
      dispatch,
      deletingLines,
      contractSign,
      queryingHeader = false,
      queryingPartner = false,
      queryingSubject = false,
      queryingStage = false,
      queryingTerm = false,
      confirmLoading = false,
      rejectLoading = false,
      contractLoading = false,
      bindingUuid = false,
      loadingPaymentCode = false,
      submitDeliveryLoading = false,
      contractSignLoading = false,
    } = this.props;
    const {
      rejectModalVisible = false,
      mobileModalVisible = false,
      isClearListCacheDataSource,
      operationRecordVisible,
      templateList = [],
      pcSubjectDataSource = [],
      pcSubjectPagination = {},
      pcStageDataSource = [],
      pcStagePagination = {},
      pcSubjectSelectedRows = [],
      partnerDataSource = [],
      partnerPagination = {},
      partnerSelectedRows = [],
      headerInfo = {},
      termPagination = {},
      termDataSource = [],
      termSelectedRows = [],
      focusStatus = undefined,
      picArray,
      currentPic,
      imgHeight,
      signFlag,
      templateListFlag,
      activeKey,
      pcRebateDataSource = [],
      pcRebatePagination = {},
    } = this.state;
    const {
      prStatusCode,
      attachmentUuid,
      supplierAttachmentUuid,
      electricSignFlag,
      editStep,
      rebateFlag,
    } = headerInfo;
    const { search = {} } = location;
    const { detailEnumMap } = contractSign;
    const {
      prSourcePlatform = headerInfo.prSourcePlatform,
      pcHeaderId = headerInfo.pcHeaderId,
    } = querystring.parse(search.substr(1));
    const editable = false;
    const currentPicPx = String(currentPic).concat('px');
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
      terminateReasonFlag: headerInfo.pcStatusCode === 'TERMINATION_CONFIRM',
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

      dispatch,
      prStatusCode,
      prSourcePlatform,
      deletingLines,
      onChangeListData: this.handleChangeList,
      onChangeHeader: this.handleChangeHeader,
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
      ref: this.partnerRef,

      dispatch,
      headerInfo,
      prStatusCode,
      prSourcePlatform,
      deletingLines,

      onChangeListData: this.handleChangeList,
      onChangeHeader: this.handleChangeHeader,
      isClearListCacheDataSource,
      fetchList: this.fetchPartner,
      deleteLines: this.deleteDetailLines,
      setDataSource: this.setItemInfoListDataSource,
      afterOpenUploadModal: this.afterOpenLineUploadModal,
    };
    const contractBusinessTermsListProps = {
      editable,
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
      ref: this.termRef,

      onChangeListData: this.handleChangeList,
      onChangeHeader: this.handleChangeHeader,
      isClearListCacheDataSource,
      fetchList: this.fetchPartner,
      deleteLines: this.deleteDetailLines,
      setDataSource: this.setItemInfoListDataSource,
      afterOpenUploadModal: this.afterOpenLineUploadModal,
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };

    const rejectModalProps = {
      rejectLoading,
      visible: rejectModalVisible,
      onOk: this.handleReject,
      onCancel: () => this.handleModalVisible('rejectModalVisible', false),
    };

    const attachmentProps = {
      headerInfo,
      templateList,
      supplierAttachmentUuid,
      onUpdateHeader: this.save,
      attachmentUUID: attachmentUuid,
      onFetchHeader: this.fetchHeader,
      onHandleFetchAttachment: this.handleFetchConfigAttachment,
      isTemplateContract: true,
      supplierParams: { supplierUploadFlag: true },
    };

    const validateModalProps = {
      contractLoading,
      mobileModalVisible,
      onClose: () => this.handleModalVisible('mobileModalVisible', false),
      onModalOk: this.handleOk,
      onGetCheckCode: this.handleCheckCode,
      onRef: node => {
        this.modalForm = node.props.form;
      },
      dispatch: this.props.dispatch,
    };
    return (
      <Fragment>
        <Header
          title={intl.get(`${viewMessagePrompt}.title.contractSign`).d('协议签署')}
          backPath="/spcm/contract-sign/list"
        >
          <Button
            loading={confirmLoading || queryingHeader}
            icon="check"
            disabled={
              !pcHeaderId ||
              isEmpty(headerInfo) ||
              !(
                headerInfo.pcStatusCode === 'PUBLISHED' ||
                headerInfo.pcStatusCode === 'TERMINATION_CONFIRM'
              )
            }
            onClick={this.confirmContract}
            type="primary"
          >
            {intl.get(`${viewMessagePrompt}.confirmTheAgreement`).d('确认协议')}
          </Button>
          <Button
            loading={submitDeliveryLoading}
            icon="close"
            onClick={() => this.handleVisible('rejectModalVisible', true)}
            disabled={!pcHeaderId || !signFlag}
          >
            {intl.get(`${viewMessagePrompt}.refusedToDeal`).d('拒绝协议')}
          </Button>
          {!isEmpty(headerInfo) && templateListFlag && <Attachment {...attachmentProps} />}
          <Button
            loading={submitDeliveryLoading}
            icon="clock-circle-o"
            onClick={() => this.handleModalVisible('operationRecordVisible', true, { pcHeaderId })}
          >
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </Button>
        </Header>
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
                          .get(`${commonViewMessage}.title.contractHeaderInformation`)
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
                          tab={intl.get(`${commonViewMessage}.title.contractSubject`).d('协议标的')}
                          key="contractSubjectInfo"
                        >
                          <ContractSubject {...contractSubjectListProps} />
                        </TabPane>
                        <TabPane
                          tab={intl.get(`${commonViewMessage}.title.contractStage`).d('协议阶段')}
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
                            .get(`${commonViewMessage}.title.contractPartnerInformation`)
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
                      id="spcm-contract-sign-detail-contract-online-edit"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl
                            .get(`${commonViewMessage}.title.contractOnlineEdit`)
                            .d('采购协议文本编辑')}
                        </h3>
                      }
                    >
                      {electricSignFlag === 1 ? (
                        <Row>
                          <Col span={21}>
                            <EditorOnline
                              iframeStyle={{
                                width: '100%',
                                height: `${(document.body.clientHeight - 96) * 0.9}px`,
                              }}
                              onRef={node => {
                                this.editorOnlineRef = node;
                              }}
                              pcHeaderId={pcHeaderId}
                            />
                          </Col>

                          <Col span={3}>
                            {picArray.length > 0 ? (
                              <div
                                className={styles.signet}
                                style={{
                                  marginTop: picArray.length <= 3 ? '-16px' : 0,
                                }}
                              >
                                <Button
                                  style={{
                                    display: picArray.length > 3 ? 'block' : 'none',
                                    width: imgHeight,
                                  }}
                                  disabled={currentPic === 0}
                                  onClick={() => {
                                    this.goToPictureSign('up');
                                  }}
                                >
                                  <Icon type="up" />
                                </Button>
                                <div
                                  className="img-box"
                                  style={{ maxHeight: (imgHeight + 16) * 3 }}
                                >
                                  {picArray.map((ele, index) => {
                                    return (
                                      <p
                                        key={ele.sealId}
                                        className="eachPic"
                                        style={{
                                          bottom: currentPicPx,
                                          height: imgHeight,
                                        }}
                                      >
                                        <img
                                          alt={ele.sealName}
                                          src={ele.sealFileUrl}
                                          title={ele.sealName}
                                          onClick={() => {
                                            this.handleClickImg(index);
                                          }}
                                        />
                                        <Icon
                                          type="check-circle-o"
                                          style={{
                                            fontSize: 14,
                                            display: focusStatus === index ? 'block' : 'none',
                                          }}
                                          className={focusStatus === index ? 'focusImg' : ''}
                                        />
                                      </p>
                                    );
                                  })}
                                </div>
                                <Button
                                  loading={contractSignLoading}
                                  type="primary"
                                  onClick={this.signContract}
                                  style={{ marginTop: 16, marginBottom: 16, width: imgHeight }}
                                  disabled={focusStatus === undefined || !signFlag}
                                >
                                  {intl.get(`${viewMessagePrompt}.title.sign`).d('签署')}
                                </Button>
                                <Button
                                  style={{
                                    display: picArray.length > 3 ? 'block' : 'none',
                                    width: imgHeight,
                                  }}
                                  onClick={() => this.goToPictureSign('down')}
                                  disabled={
                                    currentPic >=
                                    picArray.length * (imgHeight + 16) - ((imgHeight + 16) * 3 + 16)
                                  }
                                >
                                  <Icon type="down" />
                                </Button>
                              </div>
                            ) : (
                              <div className={styles.noSealImg}>
                                {intl
                                  .get(`${commonViewMessage}.title.goChapter`)
                                  .d('您尚未设置印章，请前往')}
                                <strong>
                                  {intl
                                    .get(`${commonViewMessage}.title.companyChapter`)
                                    .d('集团管理-印章管理')}
                                </strong>
                                {intl
                                  .get(`${commonViewMessage}.title.setChapter`)
                                  .d('功能设置您的签署印章。')}
                              </div>
                            )}
                          </Col>
                        </Row>
                      ) : (
                        <Row>
                          <Col span={24}>
                            <EditorOnline
                              iframeStyle={{
                                width: '100%',
                                height: `${(document.body.clientHeight - 96) * 0.9}px`,
                              }}
                              pcHeaderId={pcHeaderId}
                            />
                          </Col>
                        </Row>
                      )}
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
                        title={intl
                          .get(`${commonViewMessage}.title.basicInformation`)
                          .d('基本信息')}
                      />
                      <Link
                        href="#spcm-maintain-detail-contract-subject"
                        title={intl
                          .get(`${commonViewMessage}.title.subjectInformation`)
                          .d('标的信息')}
                      />
                      <Link
                        href="#spcm-maintain-detail-contract-partner"
                        title={intl
                          .get(`${commonViewMessage}.title.partnerInformation`)
                          .d('伙伴信息')}
                      />{' '}
                      {pcHeaderId && headerInfo.pcKindCode !== 'ATTACHMENT' && (
                        <Link
                          href="#spcm-maintain-detail-contract-business-terms"
                          title={intl
                            .get(`${commonViewMessage}.title.businessTermsInformation`)
                            .d('业务条款')}
                        />
                      )}{' '}
                      {pcHeaderId && editStep === 1 && headerInfo.pcKindCode !== 'ATTACHMENT' && (
                        <Link
                          href="#spcm-contract-sign-detail-contract-online-edit"
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
        <ValidateModal {...validateModalProps} />
        <RejectModal {...rejectModalProps} />
        <OperationRecord {...operationRecordProps} />
      </Fragment>
    );
  }
}
