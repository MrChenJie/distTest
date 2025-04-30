/**
 * index.js - 我收到的协议
 * @date: 2019-05-24
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import querystring from 'querystring';
import { Button } from 'hzero-ui';
import { isUndefined, isArray } from 'lodash';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';

import { downloadFile } from 'services/api';
import { DATETIME_MIN } from 'utils/constants';
import { SRM_SPCM } from '_utils/config';
import { HZERO_FILE } from 'utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import OperationRecord from '../components/OperationRecord';
import Search from './Search';
import List from './List';

const viewMessagePrompt = 'spcm.supplierContractView.view.message';

@connect(({ loading = {}, supplierContractView = {} }) => ({
  batchSubmitDeliveryLoading: loading.effects['supplierContractView/batchSubmitDelivery'],
  queryOperationRecordLoading: loading.effects['supplierContractView/queryOperationRecord'],
  batchDeleteDeliveryLoading: loading.effects['supplierContractView/batchDeleteDelivery'],
  batchCreateDeliveryLoading: loading.effects['supplierContractView/batchCreateDelivery'],
  queryListLoading: loading.effects['supplierContractView/queryList'],
  updateStateLoading: loading.effects['supplierContractView/supplierContractView/updateState'],
  updateLoading: loading.effects['supplierContractView/supplierContractView/update'],
  getLineAttachmentUuidLoading: loading.effects['supplierContractView/getLineAttachmentUuid'],
  fetchOperationRecordListLoading: loading.effects['supplierContractView/fetchOperationRecordList'],
  supplierContractView,
}))
@formatterCollections({
  code: [
    'spcm.common',
    'spcm.supplierContractView',
    'spcm.purchaseContractView',
    'entity.company',
    'entity.roles',
    'entity.customer',
    'entity.business',
    'entity.organization',
  ],
})
export default class SupplierContractView extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcHeaderId } = querystring.parse(search.substr(1));
    this.state = {
      pcHeaderId,
      selectedRows: [],
      tenantId: getCurrentOrganizationId(),
      selectedRowKeys: [],
    };
  }

  // 进入页面渲染
  componentDidMount() {
    const {
      // TODO
      // _back:判断进入详情
      // 分页
      location: { state: { _back } = {} },
      supplierContractView: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      this.fetchList(pagination);
    } else {
      this.fetchList(); // 查询数据
    }
    this.fetchEnum(); // 查询值集
  }

  // 组件更新完成后调用，此时可以获取数据
  componentDidUpdate(prevProps, prevState, pcHeaderId) {
    if (pcHeaderId) {
      this.fetchList();
    }
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    // const takeTime = {};
    const timeArray = ['creationDateFrom', 'creationDateTo'];
    const takeArray = ['confirmedDateFrom', 'confirmedDateTo'];
    timeArray.forEach(item => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    takeArray.forEach(item => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
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
    const { pcHeaderId, tenantId } = this.state;
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const handleFormValues = this.handleFormQuery(filterValues);
    this.setState({ selectedRows });
    dispatch({
      type: 'supplierContractView/queryList',
      payload: {
        page,
        pcHeaderId,
        tenantId,
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
      type: 'supplierContractView/init',
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
        pathname: `/spcm/supplier-contract-view/detail`,
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
        pathname: `/spcm/supplier-contract-view/detail`,
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
    const api = `${HZERO_FILE}/v1/${organizationId}
    /files/download?bucketName=private-bucket&url=${contractFileUrl}`;
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

  render() {
    const { queryListLoading, supplierContractView } = this.props;
    const { pagination = {}, dataSource = [], enumMap = [], listQuery } = supplierContractView;
    const {
      tenantId,
      selectedRows = [],
      selectedRowKeys = [],
      pcHeaderId,
      operationRecordVisible,
    } = this.state;
    const contractFileUrl = selectedRows.some(item => item.contractFileUrl === null);
    const pcKindCodeFlag = selectedRows.some(item => item.pcKindCode === 'ATTACHMENT');
    const pcKindCodeNormalFlag =
      selectedRows.filter(item => item.pcKindCode === 'NORMAL').length === 1;
    const searchProps = {
      enumMap,
      onRef: node => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.fetchList,
    };
    const rowSelectionList = {
      selectedRowKeys,
    };
    const baseExportBtnProps = {
      icon: 'export',
    };
    const listProps = {
      pagination,
      selectedRows,
      selectedRowKeys,
      onSearch: this.fetchList,
      loading: queryListLoading,
      rowSelection: rowSelectionList,
      redirectDetail: this.redirectDetail,
      onRowSelectChange: this.onRowSelectChange,
      handleModalVisibleList: this.handleModalVisible,
      dataSource: dataSource.map(o => ({ ...o, key: o.pcHeaderId })),
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };

    return (
      <Fragment>
        <Header title={intl.get(`${viewMessagePrompt}.supplierContractView`).d('我收到的协议')}>
          <ExcelExport
            type="primary"
            buttonText={intl.get(`hzero.common.button.export`).d('导出')}
            otherButtonProps={baseExportBtnProps}
            requestUrl={`${SRM_SPCM}/v1/${tenantId}/purchase-contract/supplier-view/excel-export`}
            queryParams={listQuery}
          />
          <Button
            onClick={this.lookUp}
            icon="look-over"
            disabled={
              (isArray(selectedRows) && selectedRows.length !== 1) ||
              pcKindCodeFlag ||
              !pcKindCodeNormalFlag
            }
          >
            {intl.get('spcm.purchaseContractView.model.look').d('查阅')}
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
            {intl.get('spcm.purchaseContractView.model.download').d('下载文本')}
          </Button>
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
        <OperationRecord {...operationRecordProps} />
      </Fragment>
    );
  }
}
