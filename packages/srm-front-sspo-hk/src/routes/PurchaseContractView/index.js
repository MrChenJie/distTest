/**
 * index.js - 我发起的协议
 * @date: 2019-05-23
 * @author: zuoxiangyu<xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import querystring from 'querystring';
import { Button, Tabs } from 'hzero-ui';
import { isUndefined, isArray } from 'lodash';
import { connect } from 'dva';
import { DATETIME_MIN } from 'utils/constants';
import { downloadFile } from 'services/api';

import { SRM_SPCM } from '_utils/config';
import { HZERO_FILE } from 'utils/config';
import ExcelExport from 'components/ExcelExport';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import OperationRecord from '../components/OperationRecord';

import Search from './Search';
import LineTable from './LineTable';
import DetailTable from './DetailTable';
import ContractStageModal from './Modal/ContractStageModal';
import ExecutiveDocumentModal from './Modal/ExecutiveDocumentModal';

const { TabPane } = Tabs;

const viewMessagePrompt = 'spcm.purchaseContractView.view.message';
const modelPrompt = 'spcm.purchaseContractView.model';
@connect(({ loading = {}, purchaseContractView = {} }) => ({
  queryListLoading:
    loading.effects['purchaseContractView/queryList'] ||
    loading.effects['purchaseContractView/fetchDetailList'],
  updateStateLoading: loading.effects['purchaseContractView/purchaseContractView/updateState'],
  updateLoading: loading.effects['purchaseContractView/purchaseContractView/update'],
  intiLoading: loading.effects['purchaseContractView/init'],
  getLineAttachmentUuidLoading: loading.effects['purchaseContractView/getLineAttachmentUuid'],
  fetchOperationRecordListLoading: loading.effects['purchaseContractView/fetchOperationRecordList'],
  stageLoading: loading.effects['purchaseContractView/fetchStage'],
  documentLoading: loading.effects['purchaseContractView/fetchDocument'],
  purchaseContractView,
}))
@formatterCollections({
  code: [
    'spcm.common',
    'spcm.purchaseContractView',
    'entity.company',
    'entity.supplier',
    'entity.organization',
    'entity.roles',
  ],
})
export default class PurchaseContractView extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcHeaderId } = querystring.parse(search.substr(1));
    this.state = {
      isSureFileContract: false,
      pcHeaderId,
      selectedRows: [],
      tenantId: getCurrentOrganizationId(),
      organizationId: getCurrentOrganizationId(),
      selectedRowKeys: [],
      stageVisible: false,
    };
  }

  // 进入页面渲染
  componentDidMount() {
    const {
      // TODO
      // _back:判断进入详情
      // 分页
      purchaseContractView: { pagination = {}, detailPagination = {} },
    } = this.props;
    this.fetchList(pagination);
    this.fetchDetailList(detailPagination);
    this.fetchEnum(); // 查询值集
  }

  // 组件更新完成后调用，此时可以获取数据
  componentDidUpdate(prevProps, prevState, pcHeaderId) {
    if (pcHeaderId) {
      this.fetchList();
      this.fetchDetailList();
    }
  }

  @Bind()
  handleSearchList() {
    this.fetchList();
    this.fetchDetailList();
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    // const takeTime = {};
    const timeArray = ['creationDateFrom', 'creationDateTo', 'startDateFrom', 'startDateTo'];
    // const takeArray = ['confirmedDateFrom', 'confirmedDateTo'];
    timeArray.forEach(item => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    // takeArray.forEach(item => {
    //   dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    // });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchList(page = {}, selectedRows = []) {
    const { tenantId, pcHeaderId } = this.state;
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const handleFormValues = this.handleFormQuery(filterValues);
    this.setState({ selectedRows });
    dispatch({
      type: 'purchaseContractView/queryList',
      payload: {
        page,
        pcHeaderId,
        tenantId,
        ...handleFormValues,
      },
    });
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchDetailList(page = {}, selectedRows = []) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const handleFormValues = this.handleFormQuery(filterValues);
    this.setState({ selectedRows });
    dispatch({
      type: 'purchaseContractView/fetchDetailList',
      payload: {
        page,
        ...handleFormValues,
      },
    });
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractView/init',
    });
  }

  /**
   * 跳转到明细页
   * @param {String} pcHeaderId
   */
  @Bind()
  redirectDetail(pcHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/purchase-contract-view/detail`,
        search: pcHeaderId ? querystring.stringify({ pcHeaderId }) : querystring.stringify({}),
      })
    );
  }

  /**
   * 跳转到固定地方
   * @param {String} pcHeaderId
   */
  @Bind()
  lookUp() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const pcHeaderId = selectedRows.map(item => item.pcHeaderId);
    dispatch(
      routerRedux.push({
        pathname: `/spcm/purchase-contract-view/detail`,
        search: pcHeaderId ? querystring.stringify({ pcHeaderId }) : null,
        hash: `#spcm-contract-approval-detail-contract-online-edit`,
      })
    );
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  @Bind()
  handleDetailSelectChange(detailRowKeys, detailRows) {
    this.setState({
      detailRowKeys,
      detailRows,
    });
  }

  @Bind()
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  /**
   * 下载
   * @param {object} record - 流程对象
   */
  @Bind()
  downloadLogFile() {
    const { selectedRows } = this.state;
    const organizationId = getCurrentOrganizationId();
    const contractFileUrl = selectedRows.map(item => item.contractFileUrl);
    const api = `${HZERO_FILE}/v1/${organizationId}/files/download?bucketName=private-bucket&url=${contractFileUrl}`;
    downloadFile({
      requestUrl: api,
      queryParams: [
        { name: 'bucketName', value: 'private-bucket' },
        { name: 'url', value: selectedRows[0].contractFileUrl },
      ],
    }).then(res => {
      if (res) {
        this.fetchList();
      }
    });
  }

  /**
   * 批量归档
   * @param {String} pcHeaderId
   */
  @Bind()
  sureFileContract() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    dispatch({
      type: 'purchaseContractView/sureFileContract',
      payload: {
        selectedRows,
      },
    }).then(() => {
      this.setState({
        isSureFileContract: false,
        selectedRows: [],
      });
      notification.success();
      this.fetchList();
    });
  }

  @Bind()
  handleSaveKey(activeKey) {
    this.props.dispatch({
      type: 'purchaseContractView/updateState',
      payload: { activeKey },
    });
  }

  @Bind()
  handleControlStageModal(phId) {
    const { stageVisible } = this.state;
    this.setState({ stageVisible: !stageVisible, phId }, () => {
      if (!stageVisible) this.fetchStage();
    });
  }

  @Bind()
  handleControlDocumentModal(phId) {
    const { documentVisible } = this.state;
    this.setState({ documentVisible: !documentVisible, pcSubjectId: phId }, () => {
      if (!documentVisible) this.fetchDocument();
    });
  }

  /**
   * 查询协议阶段
   */
  @Bind()
  fetchStage(page = {}) {
    const { dispatch } = this.props;
    const { phId } = this.state;
    dispatch({
      type: 'purchaseContractView/fetchStage',
      payload: {
        page,
        pcHeaderId: phId,
      },
    });
  }

  /**
   * 查询执行单据
   */
  @Bind()
  fetchDocument(page = {}) {
    const { dispatch } = this.props;
    const { pcSubjectId } = this.state;
    dispatch({
      type: 'purchaseContractView/fetchDocument',
      payload: {
        page,
        pcSubjectId,
      },
    });
  }

  render() {
    const {
      tenantId,
      selectedRows = [],
      selectedRowKeys = [],
      detailRows = [],
      detailRowKeys = [],
      pcHeaderId,
      operationRecordVisible,
      stageVisible,
      documentVisible,
    } = this.state;
    const {
      form,
      purchaseContractView,
      queryListLoading,
      stageLoading,
      documentLoading,
    } = this.props;
    const contractFileUrl = selectedRows.some(item => item.contractFileUrl === null);
    const {
      pagination = {},
      dataSource = [],
      enumMap = [],
      listQuery,
      activeKey = 'contractLine',
      stageList = [],
      stagePagination = {},
      documentList = [],
      documentPagination = {},
      detailList = [],
      detailPagination = {},
    } = purchaseContractView;
    const pcKindCodeFlag = selectedRows.some(item => item.pcKindCode === 'ATTACHMENT');
    const pcKindCodeNormalFlag =
      selectedRows.filter(item => item.pcKindCode === 'NORMAL').length === 1;
    const baseExportBtnProps = {
      icon: 'export',
    };
    const searchProps = {
      enumMap,
      onRef: node => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.handleSearchList,
    };
    const rowSelectionList = {
      selectedRowKeys,
    };
    const lineTableProps = {
      rowSelection: rowSelectionList,
      form,
      pagination,
      selectedRows,
      selectedRowKeys,
      purchaseContractView,
      onSearch: this.fetchList,
      loading: queryListLoading,
      redirectDetail: this.redirectDetail,
      onRowSelectChange: this.onRowSelectChange,
      handleModalVisibleList: this.handleModalVisible,
      dataSource: dataSource.map(o => ({ ...o, key: o.pcHeaderId })),
      onControlStageModal: this.handleControlStageModal,
    };

    const detailTableProps = {
      selectedRows: detailRows,
      dataSource: detailList,
      pagination: detailPagination,
      onSearch: this.fetchDetailList,
      loading: queryListLoading,
      redirectDetail: this.redirectDetail,
      onDetailSelectChange: this.handleDetailSelectChange,
      handleModalVisibleList: this.handleModalVisible,
      onControlStageModal: this.handleControlStageModal,
      onControlDocumentModal: this.handleControlDocumentModal,
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };

    const stageModalProps = {
      title: intl.get(`spcm.common.view.message.title.contractStage`).d('协议阶段'),
      visible: stageVisible,
      onCancel: this.handleControlStageModal,
      tableProps: {
        rowKey: 'pcStageId',
        loading: stageLoading,
        dataSource: stageList,
        pagination: stagePagination,
        onChange: this.fetchStage,
      },
    };
    const documentModalProps = {
      title: intl.get('spcm.common.view.message.title.executiveDocument').d('执行单据'),
      visible: documentVisible,
      onCancel: this.handleControlDocumentModal,
      tableProps: {
        rowKey: 'seqNum',
        loading: documentLoading,
        dataSource: documentList,
        pagination: documentPagination,
        onChange: this.fetchDocument,
      },
    };

    const pcHeaderIds = selectedRowKeys.join(',');
    const lineQueryParams = selectedRows.length > 0 ? { pcHeaderIds } : listQuery;
    selectedRows.forEach(v => {
      if (
        (v.pcStatusCode === 'EFFECTED' && v.electricSignFlag === 1) ||
        (v.pcStatusCode === 'CONFIRMED' && v.electricSignFlag === 0)
      ) {
        this.state.isSureFileContract = true;
      } else {
        this.state.isSureFileContract = false;
      }
    });
    if (selectedRows.length === 0) {
      this.state.isSureFileContract = false;
    }

    const pcSubjectIds = detailRowKeys.join(',');
    const detailQueryParams = detailRowKeys.length > 0 ? { pcSubjectIds } : listQuery;

    const exportRequestUrl =
      activeKey === 'contractLine'
        ? `${SRM_SPCM}/v1/${tenantId}/purchase-contract/purchase-view/excel-export`
        : `${SRM_SPCM}/v1/${tenantId}/contract-report/receiving/excel-details`;

    const queryParams = activeKey === 'contractLine' ? lineQueryParams : detailQueryParams;

    return (
      <Fragment>
        <Header title={intl.get(`${viewMessagePrompt}.PurchaseContractView`).d('我发起的协议')}>
          <ExcelExport
            buttonText={intl.get(`hzero.common.button.export`).d('导出')}
            otherButtonProps={baseExportBtnProps}
            requestUrl={exportRequestUrl}
            queryParams={queryParams}
          />
          <Button
            onClick={this.lookUp}
            icon="look-over"
            disabled={
              (isArray(selectedRows) && selectedRows.length !== 1) ||
              pcKindCodeFlag ||
              contractFileUrl ||
              !pcKindCodeNormalFlag
            }
          >
            {intl.get(`${modelPrompt}.look`).d('查阅')}
          </Button>
          <Button
            onClick={this.sureFileContract}
            // icon="look-over"
            disabled={!this.state.isSureFileContract}
          >
            {intl.get(`${modelPrompt}.file`).d('归档')}
          </Button>
          <Button
            onClick={this.downloadLogFile}
            icon="download"
            disabled={
              (isArray(selectedRows) && selectedRows.length !== 1) ||
              contractFileUrl ||
              pcKindCodeFlag
            }
          >
            {intl.get(`${modelPrompt}.download`).d('下载文本')}
          </Button>
        </Header>
        <Content>
          <Search {...searchProps} />
          <Tabs activeKey={activeKey} animated={false} onChange={this.handleSaveKey}>
            <TabPane
              tab={intl.get(`${viewMessagePrompt}.contractLine`).d('按协议查询')}
              key="contractLine"
            >
              <LineTable {...lineTableProps} />
            </TabPane>
            <TabPane
              tab={intl.get(`${viewMessagePrompt}.contractDetail`).d('按明细查询')}
              key="contractDetail"
            >
              <DetailTable {...detailTableProps} />
            </TabPane>
          </Tabs>
        </Content>
        <OperationRecord {...operationRecordProps} />
        <ContractStageModal {...stageModalProps} />
        <ExecutiveDocumentModal {...documentModalProps} />
      </Fragment>
    );
  }
}
