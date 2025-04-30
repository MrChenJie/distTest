/**
 * index.js - 工作台
 * @date: 2022-03-10
 * @author: jie.chen <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
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
import List from './list';
import styles from './index.less';
import classNames from 'classnames';
// import LazyTree from './LazyTree/index';
import PanelHeader from '_cus_components/CusCollapse';
import PageWrapper from '_cus_components/Page/PageWrapper';
import { Collapse } from 'antd';

const { Panel } = Collapse;

const viewMessagePrompt = 'bid.dashbord.view.message.title';

@connect(({ loading = {}, demandDashbordModels = {}, contractCommon = {} }) => ({
  queryLoading: loading.effects['demandDashbordModels/getFetchList'],
  queryListLoading: loading.effects['demandDashbordModels/unitsQueryLazyTree'],
  submitting: loading.effects['demandDashbordModels/submit'],
  queryCopyListLoading: loading.effects['demandDashbordModels/queryCopyList'],
  getBatchCodeLoading: loading.effects['demandDashbordModels/getCopyBatchCode'],
  demandDashbordModels,
  contractCommon
}))
@formatterCollections({
  code: [
    'bid.bidcommon',
    'bid.biddashbord'
  ],
})
export default class BiddingDashbord extends Component {
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
      visible: false,
      poHeaderInfo: {},
      stateNum: 3,
      activeKey: ['form']
    };
  }

  componentDidMount() {
    const {
      // TODO
      // _back:判断进入详情
      // 分页
      location: { state: { _back } = {} },
      demandDashbordModels: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      this.fetchList(pagination);
    } else {
      this.fetchList(); // 查询数据
    }
    this.fetchHeaderInfo()
  }

  componentDidUpdate(prevProps, prevState, pcHeaderId) {
    if (pcHeaderId) {
      this.fetchList();
    }
  }

  @Bind
  changeNum(key) {
    if (key === '3') {
      this.setState({ stateNum: 3 });
    }
    if (key === '0') {
      this.setState({ stateNum: 0 });
    }
    if (key === '1') {
      this.setState({ stateNum: 1 });
    }
    setTimeout(() => {
      this.fetchList();
    }, 200)
  }

  // 查询头部三个值（总项目数量、进行中、已完成）
  @Bind()
  fetchHeaderInfo() {
    const { dispatch } = this.props;
    const roleType = 'demander' // 需求人
    dispatch({
      type: 'contractCommon/getHeaderInfo',
      payload: {
        roleType: roleType
      }
    }).then((res) => {
      if (res) {
        this.setState({
          poHeaderInfo: res
        })
      }
    })
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
    const { dispatch } = this.props;
    const { stateNum } = this.state;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const handleFormValues = this.handleFormQuery(filterValues);
    this.setState({ selectedRows: [], selectedRowKeys: [] });
    dispatch({
      type: 'demandDashbordModels/getFetchList',
      payload: {
        page,
        ...handleFormValues,
        state: stateNum === '' ? 3 : stateNum
      },
    });
  }

  // /**
  //  * 跳转到明细页
  //  * @param {String} pcHeaderId
  //  */
  // @Bind()
  // redirectDetail(pcHeaderId) {
  //   const { dispatch } = this.props;
  //   dispatch(
  //     routerRedux.push({
  //       pathname: `/spcm/contract-maintain/detail`,
  //       search: pcHeaderId ? querystring.stringify({ pcHeaderId }) : null,
  //     })
  //   );
  // }

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
          type: 'demandDashbordModels/submit',
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
      type: 'demandDashbordModels/getCopyBatchCode',
    });
  }

  // 查询复制协议弹框-数据
  @Bind()
  queryCopyList(page = {}, searchValues = {}) {
    const { dispatch } = this.props;
    const values = filterNullValueObject(searchValues);
    const tenantId = getCurrentOrganizationId();
    dispatch({
      type: 'demandDashbordModels/queryCopyList',
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
      queryLoading,
      demandDashbordModels,
      queryCopyListLoading,
      submitting,
      getBatchCodeLoading,
      dispatch,
    } = this.props;
    const { pagination = {}, dataSource = [], enumMap = [] } = demandDashbordModels;
    const {
      selectedRows = [],
      selectedRowKeys = [],
      operationRecordVisible,
      pcHeaderId,
      copyModalVisible = false,
      poHeaderInfo = {},
      activeKey
    } = this.state;

    const listProps = {
      dispatch,
      pcHeaderId,
      dataSource,
      pagination,
      selectedRows,
      selectedRowKeys,
      demandDashbordModels,
      //  loading: queryListLoading,
      onPageChange: this.fetchList,
      // redirectDetail: this.redirectDetail,
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
      <>
        {/* <Content className={classNames(styles['page-content'])}> */}
        {/* <div className={styles['dasbord-data-top']}>
             <div className={classNames(styles['topPage'], styles['topPage_left'])}>
               <div className={styles['number']} onClick={() => this.changeNum()}>
                 <div className={styles['number1']}>
                   <span className={styles['val']}>{poHeaderInfo.totalCount}</span>
                   <span className={styles['num']}>
                      {intl.get(`bid.bidcommon.view.title.item`).d('件')}
                   </span>
                 </div>
                 <div className={styles['name']}>
                   {intl.get(`bid.biddashbord.view.title.totalProjectQuantity`).d('总项目数量')}
                 </div>
               </div>
               <div className={styles['number']} onClick={() => this.changeNum()}>
                 <div className={styles['number2']}>
                   <span className={styles['val']}>{poHeaderInfo.inprocessCount}</span>
                   <span className={styles['num']}>
                      {intl.get(`bid.bidcommon.view.title.item`).d('件')}
                   </span>
                 </div>
                 <div className={styles['name']}>
                   {intl.get(`bid.biddashbord.view.title.ongoing`).d('进行中')}
                 </div>
               </div>
               <div className={styles['number']} onClick={() => this.changeNum()}>
                 <div className={styles['number3']}>
                   <span className={styles['val']}>{poHeaderInfo.completeCount}</span>
                   <span className={styles['num']}>
                      {intl.get(`bid.bidcommon.view.title.item`).d('件')}
                   </span>
                 </div>
                 <div className={styles['name']}>
                   {intl.get(`bid.biddashbord.view.title.completed`).d('已完成')}
                 </div>
               </div>
             </div>
           </div> */}
        <PageWrapper loading={queryLoading}>
          <Collapse
            className='customize-collapse'
            defaultActiveKey={activeKey}
          >
            <Panel
              showArrow={false}
              collapsible='disabled'
              header={
                <PanelHeader
                  showArrow={false}
                  title={intl.get(`hzero.common.panel.header.listTable`).d('结果展示')}
                  arrowActive={activeKey.includes('form')}
                />}
              key='form'
            >
              <List {...listProps} onClick={this.changeNum} stateString={this.state.stateNum} />
            </Panel>
          </Collapse>
        </PageWrapper>
        {/* </Content> */}
        {/* <OperationRecord {...operationRecordProps} />
         <CopyModal {...copyModalProps} /> */}
      </>
    );
  }
}
