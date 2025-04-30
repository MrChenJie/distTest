/**
 * index.js - 协议拟制
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Modal } from 'hzero-ui';
import { connect } from 'dva';

import { routerRedux } from 'dva/router';
import { Bind, bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import querystring from 'querystring';
import intl from 'utils/intl';

import notification from 'utils/notification';
import { DATETIME_MIN } from 'utils/constants';
import { Header, Content } from 'components/Page';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import OperationRecord from '../components/OperationRecord';
import Search from './Search';
import List from './List';
import CopyModal from './CopyContract/Modal';

const viewMessagePrompt = 'spcm.contractMaintain.view.message.title';

@connect(({ loading = {}, contractMaintain = {} }) => ({
  queryListLoading: loading.effects['contractMaintain/queryList'],
  fetchEnumLoading: loading.effects['contractMaintain/fetchEnum'],
  submitting: loading.effects['contractMaintain/submit'],
  queryCopyListLoading: loading.effects['contractMaintain/queryCopyList'],
  getBatchCodeLoading: loading.effects['contractMaintain/getCopyBatchCode'],
  contractMaintain,
}))
@formatterCollections({
  code: [
    'spcm.contractMaintain',
    'spcm.common',
    'entity.company',
    'entity.organization',
    'entity.business',
    'spcm.purchaseContractType',
    'entity.roles',
  ],
})
export default class ContractMaintain extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcHeaderId } = querystring.parse(search.substr(1));
    this.state = {
      pcHeaderId,
      selectedRows: [],
      selectedRowKeys: [],
      operationRecordVisible: false,
      copyModalVisible: false, // 复制弹框
    };
  }

  componentDidMount() {
    const {
      // TODO
      // _back:判断进入详情
      // 分页
      location: { state: { _back } = {} },
      contractMaintain: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      this.fetchList(pagination);
    } else {
      this.fetchList(); // 查询数据
    }
    this.fetchEnum(); // 查询值集
    this.fetchSetting();
  }

  componentDidUpdate(prevProps, prevState, pcHeaderId) {
    if (pcHeaderId) {
      this.fetchList();
    }
  }

  @Bind()
  fetchSetting() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/setting',
    });
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    const timeArray = ['creationDateFrom', 'creationDateTo'];
    timeArray.forEach((item) => {
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
  fetchList(page = {}) {
    const { pcHeaderId } = this.state;
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const handleFormValues = this.handleFormQuery(filterValues);
    this.setState({ selectedRows: [], selectedRowKeys: [] });
    dispatch({
      type: 'contractMaintain/queryList',
      payload: {
        page,
        pcHeaderId,
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
      type: 'contractMaintain/init',
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
        pathname: `/spcm/contract-maintain/detail`,
        search: pcHeaderId ? querystring.stringify({ pcHeaderId }) : null,
      })
    );
  }

  /**
   * 操作记录
   * @param {String} pcHeaderId
   */
  @Bind()
  operatingData(pcHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-maintain/detail`,
        search: pcHeaderId ? querystring.stringify({ pcHeaderId }) : null,
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

  /**
   * 提交
   */
  @Bind()
  submit() {
    const { dispatch } = this.props;
    const { selectedRows = [] } = this.state;
    Modal.confirm({
      title: intl.get(`${viewMessagePrompt}.confirmSubmit`).d('是否提交采购申请单'),
      onOk: () => {
        dispatch({
          type: 'contractMaintain/submit',
          payload: { pcHeaderList: selectedRows },
        }).then((res) => {
          if (res) {
            notification.success();
            this.fetchList();
          }
        });
      },
    });
  }

  @Bind()
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  @bind()
  toPurchaseContract() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-maintain/purchase-contract`,
      })
    );
  }

  /**
   * 跳转到明细页
   * @param {String} pcHeaderId
   */
  @Bind()
  goToSourceCreate() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-maintain/quoteSource`,
      })
    );
  }

  @Bind()
  JumpToPurchaseOrder() {
    this.props.history.push('/spcm/contract-maintain/quote-purchase-order');
  }

  // 显示弹框
  @Bind()
  toggleCopyModal(visible) {
    this.setState({
      copyModalVisible: visible,
    });
    if (visible) {
      this.queryCopyList();
      this.getCopyBatchCode();
    }
  }

  // 查询复制协议弹框-值集
  @Bind()
  getCopyBatchCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/getCopyBatchCode',
    });
  }

  // 查询复制协议弹框-数据
  @Bind()
  queryCopyList(page = {}, searchValues = {}) {
    const { dispatch } = this.props;
    const values = filterNullValueObject(searchValues);
    const tenantId = getCurrentOrganizationId();
    dispatch({
      type: 'contractMaintain/queryCopyList',
      payload: {
        page,
        tenantId,
        ...values,
      },
    });
  }

  render() {
    const {
      queryListLoading,
      contractMaintain,
      submitting,
      queryCopyListLoading,
      getBatchCodeLoading,
    } = this.props;
    const { pagination = {}, dataSource = [], enumMap = [], setting = {} } = contractMaintain;
    const {
      dsHcFlag, // 手工创建
      dsPrFlag, // 采购需求
      dsFrFlag, // 寻源结果
      dsPoFlag, // 采购订单
    } = setting;
    const {
      selectedRows = [],
      selectedRowKeys = [],
      operationRecordVisible,
      pcHeaderId,
      copyModalVisible = false,
    } = this.state;

    const searchProps = {
      enumMap,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.fetchList,
    };
    const listProps = {
      pcHeaderId,
      dataSource,
      pagination,
      selectedRows,
      selectedRowKeys,
      contractMaintain,
      loading: queryListLoading,
      onSearch: this.fetchList,
      onRowSelectChange: this.onRowSelectChange,
      redirectDetail: this.redirectDetail,
      operatingData: this.operatingData,
      handleModalVisibleList: this.handleModalVisible,
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };

    const copyModalProps = {
      copyModalVisible,
      queryCopyListLoading,
      getBatchCodeLoading,
      toggleModal: this.toggleCopyModal,
      onQueryCopyList: this.queryCopyList,
    };

    return (
      <Fragment>
        <Header title={intl.get(`${viewMessagePrompt}.purchaseCreation`).d('协议拟制')}>
          {dsHcFlag === 1 && (
            <Button
              icon="plus"
              type={dsHcFlag === 1 && 'primary'}
              onClick={() => this.redirectDetail()}
            >
              {intl.get(`hzero.common.button.create`).d('新建')}
            </Button>
          )}
          {dsPoFlag === 1 && (
            <Button icon="plus" onClick={this.JumpToPurchaseOrder}>
              {intl.get(`spcm.common.button.quotePurchaseOrder`).d('引用采购订单')}
            </Button>
          )}
          {dsPrFlag === 1 && (
            <Button
              icon="plus"
              type={dsHcFlag === 0 && dsPrFlag === 1 && 'primary'}
              onClick={this.toPurchaseContract}
            >
              {/* <Icons type="main-quote-procurement-application" style={{ marginRight: '8px' }} /> */}
              {intl.get(`spcm.common.button.refPurchaseDemand`).d('引用采购需求')}
            </Button>
          )}
          {dsFrFlag === 1 && (
            <Button
              icon="plus"
              type={dsHcFlag === 0 && dsPrFlag === 0 && dsFrFlag === 1 && 'primary'}
              onClick={() => this.goToSourceCreate()}
            >
              {intl.get(`spam.contractMaintain.view.button.quoteCreateOrder`).d('引用寻源结果')}
            </Button>
          )}
          <Button
            type={dsHcFlag === 0 && dsPrFlag === 0 && dsFrFlag === 0 && 'primary'}
            icon="check"
            loading={submitting}
            onClick={this.submit}
            disabled={isEmpty(selectedRows)}
          >
            {intl.get(`hzero.common.button.submit`).d('提交')}
          </Button>
          <Button icon="plus" onClick={() => this.toggleCopyModal(true)}>
            {intl.get('spcm.common.button.copyHistoryContract').d('复制历史单据')}
          </Button>
        </Header>
        <Content>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              width: '80%',
              height: 100,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 26,
                  color: '#1d85fe',
                }}
              >
                {intl.get(`hzero.common.button.create`).d('28件')}
              </span>
              <br></br>
              {intl.get(`hzero.common.button.create`).d('总项目数量')}
            </div>
            <div>
              <span
                style={{
                  color: '#1d85fe',
                  fontSize: 26,
                }}
              >
                {intl.get(`hzero.common.button.create`).d('13件')}
              </span>
              <br></br>
              {intl.get(`hzero.common.button.create`).d('进行中')}
            </div>
            <div>
              <span
                style={{
                  color: '#1d85fe',
                  fontSize: 26,
                }}
              >
                {intl.get(`hzero.common.button.create`).d('15件')}
              </span>
              <br></br>
              {intl.get(`hzero.common.button.create`).d('已完成')}
            </div>
          </div>
          {/* <div>
             <div >
              {intl.get(`hzero.common.button.create`).d('111')}
            </div> 
            <div>
              {intl.get(`hzero.common.button.create`).d('111')}
            </div> 
            <div>
              {intl.get(`hzero.common.button.create`).d('111')}
            </div> 
            </div> */}
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
        <OperationRecord {...operationRecordProps} />
        <CopyModal {...copyModalProps} />
      </Fragment>
    );
  }
}
