/* eslint-disable no-redeclare */
/**
 * index.js - 协议签署
 * @date: 2019-05-22
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { parse, stringify } from 'querystring';
import { Button, Form } from 'hzero-ui';
import { isUndefined, isArray, isEmpty } from 'lodash';
import { connect } from 'dva';
import intl from 'utils/intl';
import { DATETIME_MIN } from 'utils/constants';

import { Header, Content } from 'components/Page';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import OperationRecord from '../components/OperationRecord';

import RejectModal from './Detail/RejectModal';
import Search from './Search';
import List from './List';
import LocalizedModal from './LocalizedModal';

const viewMessagePrompt = 'spcm.contractSign.view.message';

@Form.create({ fieldNameProp: null })
@connect(({ loading = {}, contractSign = {} }) => ({
  queryListLoading: loading.effects['contractSign/queryList'],
  updateStateLoading: loading.effects['contractSign/updateState'],
  fetchOperationRecordListLoading: loading.effects['contractSign/fetchOperationRecordList'],
  rejectLoading: loading.effects['contractSign/rejectContract'],
  contractSignLoading: loading.effects['contractSign/'],
  contractSign,
}))
@formatterCollections({
  code: [
    'spcm.contractSign',
    'spcm.common',
    'entity.company',
    'entity.roles',
    'entity.business',
    'entity.organization',
  ],
})
export default class ContractSign extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcHeaderId } = parse(search.substr(1));
    this.state = {
      headerInfo: {}, // 头form数据源
      pcHeaderId,
      visible: false,
      selectedRows: [],
      selectedRowKeys: [],
      operationRecordVisible: false,
      tenantId: getCurrentOrganizationId(),
      rejectModalVisible: false, // 审批拒绝弹窗
      pcSureCodeFlag: true,
      pcPublishCodeFlag: true,
    };
  }

  // 进入页面渲染
  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      contractSign: { pagination = {} },
    } = this.props;
    // const { visible } = this.state;
    if (_back === -1) {
      this.fetchList(pagination);
    } else {
      // visible: false;
      this.fetchList(); // 查询数据
    }
    this.fetchEnum(); // 查询值集
    document.getElementById('root').scrollIntoView(false);
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
    const timeArray = ['approvedDateFrom', 'approvedDateTo'];
    timeArray.forEach(item => {
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
      type: 'contractSign/queryList',
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
      type: 'contractSign/fetchEnum',
    });
  }

  /**
   * 审批拒绝
   */
  @Bind()
  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  /**
   * 跳转到明细页
   * @param {String} pcHeaderId
   */
  @Bind()
  redirectDetail(pcHeaderId, supplierCompanyId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-sign/detail`,
        search: pcHeaderId ? stringify({ pcHeaderId, supplierCompanyId }) : null,
      })
    );
  }

  /**
   * 跳转到固定地方
   * @param {String} pcHeaderId
   */
  @Bind()
  jump() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const pcHeaderId = selectedRows.map(item => item.pcHeaderId);
    const supplierCompanyId = selectedRows.map(item => item.supplierCompanyId);
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-sign/detail`,
        search: pcHeaderId ? stringify({ pcHeaderId, supplierCompanyId }) : null,
        hash: `#spcm-contract-sign-detail-contract-online-edit`,
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
    const pcSureCodeFlag = selectedRows.some(item => item.pcStatusCode === 'TERMINATION_CONFIRM');
    const pcPublishCodeFlag = selectedRows.some(item => item.pcStatusCode === 'PUBLISHED');
    this.setState({
      selectedRows,
      selectedRowKeys,
      pcSureCodeFlag,
      pcPublishCodeFlag,
    });
  }

  @Bind()
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  /**
   * 确认协议
   */
  @Bind()
  confirmContract() {
    const { selectedRows = [], pcSureCodeFlag } = this.state;
    const flag = selectedRows.some(ele => {
      return ele.electricSignFlag === 1;
    });
    const { contractSign, dispatch } = this.props;
    const { pagination = {}, dataSource = [] } = contractSign;
    const selectedRowKeys = selectedRows.map(item => item.pcHeaderId);
    const pcHeaderList = dataSource.filter(item => selectedRowKeys.indexOf(item.pcHeaderId) >= 0);
    // 确认
    if (pcSureCodeFlag) {
      // 确认协议
      dispatch({
        type: 'contractSign/sureContract',
        payload: {
          approvedRemark: null,
          pcHeaderList,
        },
      }).then(res => {
        if (res) {
          this.fetchList(pagination);
          this.setState({ selectedRows: [] });
          notification.success();
        }
      });
    } else if (selectedRowKeys.length > 0 && !flag) {
      dispatch({
        type: 'contractSign/confirmContract',
        payload: {
          approvedRemark: null,
          pcHeaderList,
        },
      }).then(res => {
        if (res) {
          this.fetchList(pagination);
          this.setState({ selectedRows: [] });
          notification.success();
        }
      });
    } else if (selectedRowKeys.length > 0 && flag) {
      notification.warning({
        message: intl
          .get(`hzero.common.message.confirm.selected.atLeasta`)
          .d('所选单据包含电子签章协议，请进入明细界面进行电子签章签署'),
      });
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    }
  }

  /**
   * handleVisible - 拒绝协议
   */
  @Bind()
  handleVisible(field, flag) {
    const { selectedRows = [], pcSureCodeFlag } = this.state;
    const { contractSign, dispatch } = this.props;
    const { pagination = {}, dataSource = [] } = contractSign;
    const selectedRowKeys = selectedRows.map(item => item.pcHeaderId);
    const pcHeaderList = dataSource.filter(item => selectedRowKeys.indexOf(item.pcHeaderId) >= 0);
    // 确认
    if (pcSureCodeFlag) {
      // 确认协议
      dispatch({
        type: 'contractSign/sureRejectContract',
        payload: {
          approvedRemark: null,
          pcHeaderList,
        },
      }).then(res => {
        if (res) {
          this.fetchList(pagination);
          this.setState({ selectedRows: [] });
          notification.success();
        }
      });
    } else {
      this.setState({ [field]: !!flag });
    }
  }

  /**
   * 拒绝协议
   * @param {*} values
   */
  @Bind()
  handleReject(values) {
    const { selectedRows = [] } = this.state;
    const { contractSign, dispatch } = this.props;
    const { dataSource = [], pagination = {} } = contractSign;
    const selectedRowKeys = selectedRows.map(item => item.pcHeaderId);
    const pcHeaderList = dataSource.filter(item => selectedRowKeys.indexOf(item.pcHeaderId) >= 0);
    if (selectedRowKeys.length > 0) {
      dispatch({
        type: 'contractSign/rejectContract',
        payload: { processRemark: values, pcHeaderList },
      }).then(res => {
        if (res) {
          this.setState({ selectedRows: [] });
          notification.success();
          this.handleModalVisible();
          this.fetchList(pagination);
        }
      });
    }
  }

  render() {
    const {
      visible,
      selectedRows = [],
      selectedRowKeys = [],
      pcHeaderId,
      operationRecordVisible,
      rejectModalVisible = false, // 审批拒绝弹窗
      pcSureCodeFlag,
      pcPublishCodeFlag,
    } = this.state;
    const { form, contractSign, queryListLoading, rejectLoading = false } = this.props;
    const { pagination = {}, dataSource = [], enumMap = {} } = contractSign;
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
    const listProps = {
      form,
      pcHeaderId,
      dataSource,
      pagination,
      selectedRows,
      contractSign,
      selectedRowKeys,
      loading: queryListLoading,
      onSearch: this.fetchList,
      redirectDetail: this.redirectDetail,
      onRowSelectChange: this.onRowSelectChange,
      handleModalVisibleList: this.handleModalVisible,
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
    return (
      <Fragment>
        <Header title={intl.get(`${viewMessagePrompt}.title.contractSign`).d('协议签署')}>
          <Button
            type="primary"
            onClick={this.confirmContract}
            icon="check"
            // loading={approving}
            disabled={
              (isArray(selectedRows) && isEmpty(selectedRows)) ||
              (pcSureCodeFlag && pcPublishCodeFlag)
            }
          >
            {intl.get(`${viewMessagePrompt}.confirmTheAgreement`).d('确认协议')}
          </Button>
          <Button
            onClick={this.jump}
            icon="check"
            disabled={
              (isArray(selectedRows) && isEmpty(selectedRows)) ||
              pcKindCodeFlag ||
              !pcKindCodeNormalFlag
            }
          >
            {intl.get(`${viewMessagePrompt}.previewTheAgreement`).d('预览协议')}
          </Button>
          <Button
            onClick={() => this.handleVisible('rejectModalVisible', true)}
            icon="close"
            // loading={rejecting}
            disabled={
              (isArray(selectedRows) && isEmpty(selectedRows)) ||
              (pcSureCodeFlag && pcPublishCodeFlag)
            }
          >
            {intl.get(`${viewMessagePrompt}.refusedToDeal`).d('拒绝协议')}
          </Button>
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
          <LocalizedModal visible={visible} />
        </Content>
        <RejectModal {...rejectModalProps} />
        <OperationRecord {...operationRecordProps} />
      </Fragment>
    );
  }
}
