/**
 * index.js - 工作台
 * @date: 2022-03-10
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Modal, LocaleProvider } from 'hzero-ui';
import { connect } from 'dva';
import moment from 'moment';
import { routerRedux } from 'dva/router';
import { Bind, Debounce } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import querystring from 'querystring';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { DATETIME_MIN, DEFAULT_DATE_FORMAT } from 'utils/constants';
import { Content } from 'components/Page';
import { filterNullValueObject, getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';
import zh_CN from 'hzero-ui/lib/locale-provider/zh_CN';
import OperationRecord from '../components/OperationRecord';
import Search from './Search';
import List from './List';
import CopyModal from './CopyContract/Modal';
import './index.less';
import { SRM_BID } from '@/common/config';
// import echartLine from '../../assets/line.png';
// import echartBar from '../../assets/bar.png';
import classNames from 'classnames';
// import LazyTree from './LazyTree/index';
import formatterCollections from 'utils/intl/formatterCollections';
import CusLov from '_cus_components/CusLov';
import CusExcelExport from '_cus_components/CusExcelExport';
import PanelHeader from '_cus_components/CusCollapse';
import PageWrapper from '_cus_components/Page/PageWrapper';
import { Collapse } from 'antd';

const { Panel } = Collapse;
const tenantId = getCurrentOrganizationId();
const currentLanguage = getCurrentLanguage();

@formatterCollections({
  code: ['bid.bidcommon', 'bid.biddashbord', 'HKPC.commom'],
})
@connect(({ loading = {}, contractMaintain = {}, contractCommon = {} }) => ({
  queryListLoading: loading.effects['contractMaintain/queryList'],
  fetchEnumLoading: loading.effects['contractMaintain/fetchEnum'],
  submitting: loading.effects['contractMaintain/submit'],
  queryCopyListLoading: loading.effects['contractMaintain/queryCopyList'],
  getBatchCodeLoading: loading.effects['contractMaintain/getCopyBatchCode'],
  contractMaintain,
  contractCommon,
}))
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
      stateString: null,
      activeKey: ['form', 'table'],
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
      this.fetchList();
      // this.fetchList(pagination);
    } else {
      this.fetchList(); // 查询数据
    }
    this.fetchEnum(); // 查询值集
    this.fetchHeaderInfo();

    this.props.history.listen(() => {
      // this.fetchList(); // 注掉解决项目设置页面返回到工作台查询无效的bug
      this.fetchHeaderInfo();
    });
  }

  @Bind
  changeNum(key) {
    if (key === 'null') {
      this.setState({ stateString: null });
    }
    if (key === 'in_process') {
      this.setState({ stateString: 'in_process' });
    }
    if (key === 'completed') {
      this.setState({ stateString: 'completed' });
    }
    if (key === 'closed') {
      this.setState({ stateString: 'closed' });
    }
    this.fetchList();
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
  @Debounce(200)
  fetchList(page = {}) {
    const { dispatch } = this.props;
    const { stateString } = this.state;
    const filterValues = isUndefined(this.filterForm?.current?.getFieldsValue())
      ? {}
      : filterNullValueObject(this.filterForm?.current?.getFieldsValue());
    const handleFormValues = this.handleFormQuery(filterValues);
    const milestoneCode = handleFormValues.proStateArray ? handleFormValues.proStateArray[0] : null;
    const milestoneState = handleFormValues.proStateArray
      ? handleFormValues.proStateArray[1]
      : null;
    this.setState({ selectedRows: [], selectedRowKeys: [] });
    handleFormValues.requireTimeStr = handleFormValues.requireTimeStr
      ? handleFormValues.requireTimeStr.format(DEFAULT_DATE_FORMAT)
      : null;
    dispatch({
      type: 'contractMaintain/queryList',
      payload: {
        page,
        ...handleFormValues,
        milestoneCode: milestoneCode,
        milestoneState: milestoneState,
        proState: stateString === null ? null : stateString,
      },
    });
  }

  // 查询头部三个值（总项目数量、进行中、已完成）
  @Bind()
  fetchHeaderInfo() {
    const { dispatch } = this.props;
    const roleType = 'purchase'; // 采购
    dispatch({
      type: 'contractCommon/getHeaderInfo',
      payload: {
        roleType: roleType,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          poHeaderInfo: res,
        });
      }
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

  /**
   * 删除已有数据
   * @param {object} record - 当前行数据
   */
  @Bind()
  handleDelete(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/deletePro',
      payload: [{ ...record }],
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchList();
      }
    });
  }
  @Bind()
  updateModelState(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractMaintain/updateState',
      payload,
    });
  }

  @Bind()
  handleHandover(_, value) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/saveHandover',
      payload: {
        proIds: this.state.selectedRows,
        transferEmpNo: value.employeeId,
        transferEmpName: value.name,
      },
    }).then((res) => {
      if (res) {
        this.fetchList();
        notification.success();
      }
    });
  }

  render() {
    const otherButtonProps = {
      icon: null,
      mini: true,
    };
    const {
      queryListLoading,
      contractMaintain,
      queryCopyListLoading,
      getBatchCodeLoading,
      dispatch,
      location,
    } = this.props;
    console.log('index-props', this.props.selectedRowKeys);
    const { pagination = {}, dataSource = [], enumMap = [] } = contractMaintain;
    const {
      selectedRows = [],
      operationRecordVisible,
      pcHeaderId,
      copyModalVisible = false,
      poHeaderInfo = {},
      activeKey,
      selectedRowKeys = [],
    } = this.state;

    const rowSelection = {
      columnWidth: 50,
      selectedRowKeys,
      onChange: (keys, rows) => {
        this.setState({
          selectedRowKeys: keys,
          selectedRows: keys,
        });
      },
    };

    const searchProps = {
      enumMap,
      location,
      onRef: (node) => {
        this.filterForm = node.filterForm;
      },
      onFetchList: this.fetchList,
    };
    const listProps = {
      dispatch,
      pcHeaderId,
      dataSource,
      pagination,
      selectedRows,
      selectedRowKeys,
      contractMaintain,
      rowSelection,
      onUpdateModelState: this.updateModelState,
      loading: queryListLoading,
      onSearch: this.fetchList,
      onDelete: this.handleDelete,
      onHandover: this.handleHandover,
      onRowSelectChange: this.onRowSelectChange,
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
              <div className={styles['number']}>
                <div className={styles['number1']} onClick={() => this.changeNum(null)}> */}
        {/* <div className={styles['number1']} onClick={() => this.fetchList(pagination, null)}> */}
        {/* <span className={styles['val']}>{poHeaderInfo.totalCount}</span>
                  <span className={styles['num']}>
                    {intl.get(`bid.bidcommon.view.title.item`).d('件')}
                  </span>
                </div>
                <div className={styles['name']}>
                  {intl.get(`bid.biddashbord.view.title.totalProjectQuantity`).d('总项目数量')}
                </div>
              </div>
              <div className={styles['number']}>
                <div className={styles['number2']} onClick={() => this.changeNum('in_process')}> */}
        {/* <div className={styles['number2']} onClick={() => this.fetchList(pagination, 'in_process')}> */}
        {/* <span className={styles['val']}>{poHeaderInfo.inprocessCount}</span>
                  <span className={styles['num']}>
                    {intl.get(`bid.bidcommon.view.title.item`).d('件')}
                  </span>
                </div>
                <div className={styles['name']}>
                  {intl.get(`bid.biddashbord.view.title.ongoing`).d('进行中')}
                </div>
              </div>
              <div className={styles['number']}>
                <div className={styles['number3']} onClick={() => this.changeNum('completed')}> */}
        {/* <div className={styles['number3']} onClick={() => this.fetchList(pagination, 'completed')}> */}
        {/* <span className={styles['val']}>{poHeaderInfo.completeCount}</span>
                  <span className={styles['num']}>
                    {intl.get(`bid.bidcommon.view.title.item`).d('件')}
                  </span>
                </div>
                <div className={styles['name']}>
                  {intl.get(`bid.biddashbord.view.title.completed`).d('已完成')}
                </div>
              </div>
            </div> */}
        {/* <div className={classNames(styles['topPage'], styles['topPage_right'])}>
              <div className={styles['echart-img']}>
                <img src={echartLine} alt="echartLine" />
                <div className={styles['name']}>
                  {intl.get(`bid.echartline.view.title.echartLine`).d('项目进度统计')}
                </div>
              </div>
              <div className={styles['echart-img']}>
                <img src={echartBar} alt="echartBar" />
                <div className={styles['name']}>
                  {intl.get(`${viewMessagePrompt}.echartBar`).d('供应商情况统计')}
                </div>
              </div>
            </div> */}
        {/* </div> */}
        {/* <LocaleProvider locale={currentLanguage === 'en_US' ? undefined : zh_CN}> */}
        <PageWrapper loading={queryListLoading}>
          <Collapse
            className="customize-collapse"
            defaultActiveKey={activeKey}
            onChange={(collapseKeys) => {
              this.setState({ activeKey: collapseKeys });
            }}
          >
            <Panel
              showArrow={false}
              header={
                <PanelHeader
                  title={intl.get('hzero.common.button.search').d('查询')}
                  arrowActive={activeKey.includes('form')}
                />
              }
              key="form"
            >
              <Search {...searchProps} />
            </Panel>
            <Panel
              className="isButton"
              showArrow={false}
              collapsible="disabled"
              header={
                <PanelHeader
                  showArrow={false}
                  title={intl.get(`hzero.common.panel.header.listTable`).d('结果展示')}
                  arrowActive={activeKey.includes('table')}
                  buttons={[
                    <>
                      <CusLov
                        style={{ height: '32px', padding: '0px 8px' }}
                        isButton
                        code="BID.ASSIGNDEMANDER"
                        queryParams={{ tenantId }}
                        // lovOptions={{ displayField: '', valueField: '' }}
                        onChange={this.handleHandover}
                        disabled={selectedRowKeys.length === 0 || queryListLoading}
                      >
                        {intl.get(`bid.bidcommon.bid.button.ProjectHandover`).d('项目交接')}
                      </CusLov>
                      <CusExcelExport
                        requestUrl={`${SRM_BID}/v1/${tenantId}/bid-pro-infos/exportProInfo`}
                        otherButtonProps={otherButtonProps}
                        downloadType="Blob"
                        buttonText={<>{intl.get(`bid.bidcommon.view.button.export`).d('导出')}</>}
                        queryParams={() => {
                          const filterValues = isUndefined(
                            this.filterForm?.current?.getFieldsValue()
                          )
                            ? {}
                            : filterNullValueObject(this.filterForm?.current?.getFieldsValue());
                          return {
                            ...this.handleFormQuery(filterValues),
                          };
                        }}
                      />
                    </>,
                  ]}
                />
              }
              key="table"
            >
              <List {...listProps} onClick={this.changeNum} stateString={this.state.stateString} />
            </Panel>
          </Collapse>
        </PageWrapper>
        {/* </LocaleProvider> */}
        {/* </Content> */}
        <OperationRecord {...operationRecordProps} />
        <CopyModal {...copyModalProps} />
      </>
    );
  }
}
