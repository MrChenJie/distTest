/*
 * @Description: ContractChapter - 协议用章详情
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-08-13 11:16:24
 * @LastEditTime: 2019-11-08 16:41:30
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Spin, Form, Row, Col, Anchor, Affix, Card, Icon, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { isNumber, isEmpty } from 'lodash';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import queryString from 'querystring';

import { Header, Content } from 'components/Page';
import { createPagination } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME, DETAIL_CARD_CLASSNAME } from 'utils/constants';
import { openTab } from 'utils/menuTab';
// import { routerRedux } from 'dva/router';

import ContractHeader from '../../components/ContractHeader';
import Iconfont from '../../components/Icons'; // 下载至本地的icon
import ContractSubject from '../../components/ContractSubject';
import ContractStage from '../../components/ContractStage';
import ContractPartner from '../../components/ContractPartner';
import ContractBusinessTerms from '../../components/ContractBusinessTerms';
import ContractRebate from '../../components/ContractRebate';
import OperationRecord from '../../components/OperationRecord';
import EditorOnline from '../../components/EditorOnline';
import Attachment from '../../components/Upload';
import ValidateModal from './ValidateModal';
import styles from './index.less';

const { Link } = Anchor;
const { TabPane } = Tabs;
const commonViewMessage = 'spcm.common.view.message';
const messagePrompt = 'spcm.contractChapter.view.message';
const buttonPrompt = 'spcm.contractChapter.view.button';

@Form.create({ fieldNameProp: null })
@connect(({ loading, contractChapter, global }) => ({
  queryingHeader: loading.effects['contractCommon/fetchHeader'],
  queryingPartner: loading.effects['contractCommon/fetchPartner'],
  queryingSubject: loading.effects['contractCommon/fetchSubject'],
  queryingStage: loading.effects['contractCommon/fetchStage'],
  queryingTerm: loading.effects['contractCommon/fetchTerm'],
  chapterLoading: loading.effects['contractChapter/confirmChapter'],
  mobileChapterLoading: loading.effects['contractChapter/confirmMobileChapter'],
  contractChapter,
  global,
}))
@formatterCollections({
  code: [
    'spcm.contractChapter',
    'spcm.common',
    'entity.roles',
    'entity.company',
    'entity.business',
    'entity.item',
    'spcm.purchaseRequisitionCreation',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search, hash },
    } = this.props;
    const { pcHeaderId, companyId } = queryString.parse(search.substr(1));
    this.state = {
      hash,
      pcHeaderId,
      companyId,
      currentPic: 0,
      headerInfo: {}, // 头form数据源
      listDataSource: [], // 表格数据源
      headerFetchedFlag: false, // 锚点
      isClearListCacheDataSource: true, // 是否清除表格缓存数据源
      operationRecordVisible: false,
      mobileModalVisible: false, // 获取验证码模态框
      partnerDataSource: [], // 合作伙伴数据
      partnerPagination: {}, // 合作伙伴分页
      pcStageDataSource: [],
      partnerSelectedRows: [],
      pcSubjectDataSource: [],
      pcSubjectPagination: {},
      pcSubjectSelectedRows: [],
      pcStagePagination: {},
      termDataSource: [],
      termPagination: {},
      termSelectedRows: [],
      templateList: [],
      picDataSource: [], // 印章图片
      focusStatus: '', // 选中印章图片标识
      sealId: '', // 选中印章图片ID
      chapterFlag: true, // 是否已经盖章
      templateListFlag: false,
      activeKey: 'contractSubjectInfo', // tab切换
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
   * 获取印章图片
   */
  @Bind()
  fetchSealPictures() {
    const { dispatch } = this.props;
    const {
      companyId,
      headerInfo: { tenantId, pcKindCode },
    } = this.state;
    dispatch({
      type: 'contractChapter/fetchSealPictures',
      payload: {
        lovCode: 'SPFM.COMPANY_SEAL',
        companyId,
        tenantId,
      },
    }).then(res => {
      if (res) {
        const picDataSource = res.filter(item => {
          return item.sealFileUrl !== null && item.enabledFlag !== 0;
        });
        this.setState({
          picDataSource,
        });
        if (pcKindCode !== 'ATTACHMENT' && picDataSource.length > 0) {
          const imgHeight = document.getElementsByClassName('eachPic')[0].clientWidth;
          this.setState({ imgHeight });
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
    this.fetchSubject();
    this.fetchStage();
    this.fetchTerm();
  }

  /**
   * fetchHeader - 查询头明细数据
   */
  @Bind()
  fetchHeader() {
    const { dispatch } = this.props;
    const { pcHeaderId, companyId } = this.state;
    dispatch({
      type: 'contractChapter/fetchHeader',
      payload: {
        pcHeaderId,
        companyId,
        customizeUnitCode: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL',
      },
    }).then(res => {
      if (res) {
        this.handleFetchConfigAttachment();
        this.setState({ headerInfo: res }, () => {
          this.setState({
            headerFetchedFlag: true,
            chapterFlag: res.pcStatusCode === 'APPROVED' || res.pcStatusCode === 'CONFIRMED',
          });
        });
        this.fetchSealPictures();
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
   * 刷新头信息和附件列表
   */
  @Bind()
  handleRefresh() {
    this.fetchHeader();
    this.handleFetchConfigAttachment();
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
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleOperationRecordSearch(page = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId } = this.state;
    dispatch({
      type: 'contractChapter/fetchOperationRecordList',
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
  handleChangeSelection(selectedRows, field) {
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
   * handleClickImg 印章点击样式改变
   * @param {string} index
   */
  @Bind()
  handleClickImg(index) {
    const { focusStatus, picDataSource } = this.state;
    this.setState({
      focusStatus: focusStatus === index + 1 ? '' : index + 1,
      sealPictureUrl: picDataSource[index].sealPictureUrl,
      sealId: picDataSource[index].sealId,
    });
  }

  /**
   * handleClickSeal 点击用章 非手机验证签章
   */
  @Bind()
  handleClickSeal() {
    const { dispatch } = this.props;
    const {
      pcHeaderId,
      sealPictureUrl,
      sealId,
      companyId,
      headerInfo: { mobileVerifyFlag },
    } = this.state;
    if (mobileVerifyFlag) {
      this.setState({
        mobileModalVisible: true,
      });
    } else {
      dispatch({
        type: 'contractChapter/confirmChapter',
        payload: {
          pcHeaderId,
          sealPictureUrl,
          sealId,
          companyId,
        },
      }).then(res => {
        if (res) {
          notification.success();
          // this.goToContractOnlineEdit('#spcm-contract-sign-detail-contract-online-edit');
          this.setState({ chapterFlag: false });
          this.editorOnlineRef.fetchEditorOnlineHTML();
        }
      });
    }
  }

  /**
   * 关闭手机验证modal
   */
  @Bind()
  handleCloseModal() {
    this.setState({
      mobileModalVisible: false,
    });
    this.modalForm.resetFields();
  }

  /**
   * 获取手机验证码
   */
  @Bind()
  getVerifyCode() {
    const { dispatch } = this.props;
    const {
      companyId,
      headerInfo: { certificateResId },
    } = this.state;
    const mobile = this.modalForm.getFieldValue('mobile');
    this.modalForm.validateFields(['mobile'], err => {
      if (!err) {
        dispatch({
          type: 'contractChapter/getVerifyCode',
          payload: {
            companyId,
            mobile,
            certificateResId,
          },
        });
      }
    });
  }

  /**
   * 确认手机验证并签章
   */
  @Bind()
  handleOk(values = {}) {
    const { dispatch } = this.props;
    const { pcHeaderId, sealPictureUrl, sealId, companyId } = this.state;
    if (!isEmpty(values)) {
      dispatch({
        type: 'contractChapter/confirmMobileChapter',
        payload: {
          pcHeaderId,
          companyId,
          sealPictureUrl,
          sealId,
          ...values,
        },
      }).then(res => {
        if (res) {
          this.handleCloseModal();
          notification.success();
          // this.goToContractOnlineEdit('#spcm-contract-sign-detail-contract-online-edit');
          this.setState({ chapterFlag: false });
          this.editorOnlineRef.fetchEditorOnlineHTML();
        }
      });
    }
  }

  /**
   * 点击按钮图片移动
   */
  @Bind()
  goToPictureSign(type) {
    const { currentPic, imgHeight } = this.state;
    this.setState({
      currentPic: type === 'up' ? currentPic - (imgHeight + 16) : currentPic + (imgHeight + 16),
    });
  }

  /**
   * 跳转到印章管理
   */
  @Bind()
  skipToSealManage() {
    openTab({
      key: '/spfm/seal-mange',
      title: 'srm.bg.manager.seal.manage',
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

  render() {
    const {
      form,
      location,
      dispatch,
      deletingLines,
      queryingHeader = false,
      queryingPartner = false,
      queryingSubject = false,
      queryingStage = false,
      queryingTerm = false,
      mobileChapterLoading = false,
      chapterLoading = false,
      global,
    } = this.props;
    const {
      isClearListCacheDataSource,
      operationRecordVisible,
      templateList = [],
      pcSubjectDataSource = [],
      pcStageDataSource = [],
      pcSubjectPagination = {},
      pcStagePagination = {},
      pcSubjectSelectedRows = [],
      partnerDataSource = [],
      partnerPagination = {},
      partnerSelectedRows = [],
      headerInfo = {},
      termPagination = {},
      termDataSource = [],
      termSelectedRows = [],
      picDataSource = [],
      focusStatus,
      mobileModalVisible,
      currentPic,
      imgHeight,
      chapterFlag,
      templateListFlag,
      activeKey,
      pcRebateDataSource = [],
      pcRebatePagination = {},
    } = this.state;
    const { prStatusCode, attachmentUuid, supplierAttachmentUuid, rebateFlag } = headerInfo;
    const { search = {} } = location;
    const {
      prSourcePlatform = headerInfo.prSourcePlatform,
      pcHeaderId = headerInfo.pcHeaderId,
    } = queryString.parse(search.substr(1));
    const editable = false;
    const { menuLeafNode } = global;
    const sealMenuFlag = menuLeafNode.some(item => {
      return item.path === '/spfm/seal-mange';
    });
    /**
     * editable 根据头id
     * dataSource 数据源
     * pagination 分页
     * selectedRowKeys 选中的行
     * onSelectionChange 分页变化回调
     * onSearch 分页改变回调
     * loading 查询状态
     */
    const headerInfoFormProps = {
      form,
      purchaseFlag: true, // 是否来自采购方
      prSourcePlatform,
      editable,
      dataSource: headerInfo,
    };
    const contractSubjectListProps = {
      editable,
      loading: queryingSubject,
      pagination: pcSubjectPagination,
      dataSource: pcSubjectDataSource,
      onSearch: this.fetchPartner,
      onSelectionChange: this.handleChangeSelection,
      selectedRows: pcSubjectSelectedRows,

      ref: this.partnerRef,
      onPrePaginationChange: this.fetchSubject,
      dispatch,
      headerInfo,
      prStatusCode,
      prSourcePlatform,
      deletingLines,
      isClearListCacheDataSource,
      fetchList: this.fetchPartner,
      setDataSource: this.setItemInfoListDataSource,
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

      ref: this.partnerRef,
      dispatch,
      headerInfo,
      prStatusCode,
      prSourcePlatform,
      deletingLines,
      isClearListCacheDataSource,
      fetchList: this.fetchPartner,
      setDataSource: this.setItemInfoListDataSource,
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

      ref: this.termRef,
      isClearListCacheDataSource,
      fetchList: this.fetchPartner,
      setDataSource: this.setItemInfoListDataSource,
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
      attachmentUUID: attachmentUuid,
      onFetchHeader: this.fetchHeader,
      onHandleFetchAttachment: this.handleFetchConfigAttachment,
      isTemplateContract: true,
      supplierParams: { supplierViewFlag: true },
      showRemoveIcon: false,
      onRefresh: this.handleRefresh,
    };

    const validateModalProps = {
      mobileModalVisible,
      mobileChapterLoading,
      onClose: this.handleCloseModal,
      onModalOk: this.handleOk,
      onRef: node => {
        this.modalForm = node.props.form;
      },
      getVerifyCode: this.getVerifyCode,
    };

    return (
      <Fragment>
        <Header
          title={intl.get(`${messagePrompt}.title.contractChapter`).d('协议用章')}
          backPath="/spcm/contract-chapter/list"
        >
          <Button type="primary" href="#spcm-contract-sign-detail-contract-online-edit">
            <Iconfont type="Seal" style={{ marginRight: '8px' }} />
            {intl.get(`${buttonPrompt}.chapter`).d('用章')}
          </Button>
          {!isEmpty(headerInfo) && templateListFlag && <Attachment {...attachmentProps} />}
          <Button
            icon="clock-circle-o"
            onClick={() => this.handleModalVisible('operationRecordVisible', true, { pcHeaderId })}
          >
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </Button>
        </Header>
        <Content>
          <div id="spcm-contract-sign-detail-content-inner-wrapper">
            <Spin
              spinning={queryingHeader || queryingPartner || queryingSubject || queryingTerm}
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
                  {pcHeaderId && headerInfo.pcKindCode !== 'ATTACHMENT' && (
                    <Card
                      key="contractOnlineEdit"
                      id="spcm-contract-sign-detail-contract-online-edit"
                      bordered={false}
                      className={DETAIL_CARD_CLASSNAME}
                      title={
                        <h3>
                          {intl.get(`spcm.common.title.contractOnlineEdit`).d('采购协议文本编辑')}
                        </h3>
                      }
                    >
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
                          {picDataSource.length > 0 ? (
                            <div
                              className={styles.signet}
                              style={{ marginTop: picDataSource.length > 3 ? 0 : '-16px' }}
                            >
                              <Button
                                disabled={!currentPic}
                                onClick={() => this.goToPictureSign('up')}
                                style={{
                                  display: picDataSource.length > 3 ? 'block' : 'none',
                                  width: imgHeight,
                                }}
                              >
                                <Icon type="up" />
                              </Button>
                              <div className="img-box" style={{ maxHeight: (imgHeight + 16) * 3 }}>
                                {picDataSource.map((el, index) => (
                                  <div
                                    key={el.sealId}
                                    className="eachPic"
                                    style={{ bottom: `${currentPic}px`, height: imgHeight }}
                                  >
                                    <img
                                      src={el.sealFileUrl}
                                      title={el.sealName}
                                      alt={el.sealName}
                                      onClick={() => this.handleClickImg(index)}
                                    />
                                    <Icon
                                      type="check-circle-o"
                                      style={{
                                        display: focusStatus === index + 1 ? 'block' : 'none',
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                              <Button
                                type="primary"
                                loading={mobileChapterLoading || chapterLoading}
                                onClick={this.handleClickSeal}
                                style={{ marginBottom: 16, marginTop: 16, width: imgHeight }}
                                disabled={!focusStatus || !chapterFlag}
                              >
                                {intl.get(`${buttonPrompt}.chapter`).d('用章')}
                              </Button>
                              <Button
                                onClick={() => this.goToPictureSign('down')}
                                disabled={
                                  currentPic >=
                                  picDataSource.length * (imgHeight + 16) -
                                    ((imgHeight + 16) * 3 + 16)
                                }
                                style={{
                                  display: picDataSource.length > 3 ? 'block' : 'none',
                                  marginBottom: 0,
                                  width: imgHeight,
                                }}
                              >
                                <Icon type="down" />
                              </Button>
                            </div>
                          ) : (
                            <div className={styles.noSealImg}>
                              <p>
                                {intl
                                  .get(`${commonViewMessage}.title.goChapter`)
                                  .d('您尚未设置印章，请前往')}
                                {sealMenuFlag ? (
                                  <strong onClick={this.skipToSealManage}>
                                    {intl
                                      .get(`${commonViewMessage}.title.companyChapter`)
                                      .d('集团管理-印章管理')}
                                  </strong>
                                ) : (
                                  <span>
                                    {intl
                                      .get(`${commonViewMessage}.title.companyChapter`)
                                      .d('集团管理-印章管理')}
                                  </span>
                                )}
                                {intl
                                  .get(`${commonViewMessage}.title.setChapter`)
                                  .d('功能设置您的签署印章。')}
                              </p>
                            </div>
                          )}
                        </Col>
                      </Row>
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
                      {pcHeaderId && headerInfo.pcKindCode !== 'ATTACHMENT' && (
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
        <OperationRecord {...operationRecordProps} />
      </Fragment>
    );
  }
}
