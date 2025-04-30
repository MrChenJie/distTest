/*
 * @Description: index.js - 协议变更
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-11-12
 */
import React, { Fragment, Component } from 'react';
import { connect } from 'dva';
import { Button, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
// import uuid from 'uuid/v4';
import { isUndefined, merge } from 'lodash';

import { routerRedux } from 'dva/router';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject } from 'utils/utils';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { DATETIME_MIN } from 'utils/constants';
import notification from 'utils/notification';

import List from './List';
import Search from './Search';
import OperationRecord from '../components/OperationRecord';
import Icons from '../components/Icons';
import TerminateReasonModal from './TerminateReasonModal';

@connect(({ loading = {}, contractChange = {} }) => ({
  queryListLoading: loading.effects['contractChange/queryList'],
  queryingChange: loading.effects['contractChange/changeContract'],
  terminateLoading: loading.effects['contractChange/changeContractStatus'],
  contractChange,
}))
@formatterCollections({
  code: [
    'spcm.common',
    'entity.company',
    'entity.supplier',
    'entity.organization',
    'spcm.contractChange',
    'spcm.contractChapter',
    'spcm.purchaseContractView',
  ],
})
export default class ContractChange extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cancellFlag: false,
      terminateFlag: false,
      operationRecordVisible: false,
      terminateReasonVisible: false,
    };
  }

  componentDidMount() {
    const {
      // TODO
      // _back:判断进入详情
      // 分页
      location: { state: { _back } = {} },
      contractChange: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      this.fetchList(pagination);
    } else {
      this.fetchList(); // 查询数据
    }
    this.fetchEnum(); // 查询值集
  }

  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractChange/init',
    });
  }

  /**
   * fetchList - 查询列表数据
   */
  @Bind()
  fetchList(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const handleFormValues = this.handleFormQuery(filterValues);
    this.setState({ selectedRows: [], selectedRowKeys: [] });
    dispatch({
      type: 'contractChange/queryList',
      payload: {
        page,
        ...handleFormValues,
      },
    });
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
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
   * 跳转到明细页
   * @param {String} pcHeaderId
   */
  @Bind()
  redirectDetail(pcHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-change/detail/${pcHeaderId}`,
        // search: pcHeaderId ? querystring.stringify({ pcHeaderId }) : null,
      })
    );
  }

  @Bind()
  handleClick(action) {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    // let pcHeaderStatus = '';
    // switch (action) {
    //   // case 'delete':
    //   //   pcHeaderStatus = 'DELETED';
    //   //   break;
    //   case 'cancell':
    //     pcHeaderStatus = 'CANCELLATION';
    //     break;
    //   case 'terminate':
    //     pcHeaderStatus = 'TERMINATION_CONFIRM';
    //     break;
    //   default:
    //     pcHeaderStatus = null;
    // }
    Modal.confirm({
      // title:
      //   pcHeaderStatus === 'TERMINATION_CONFIRM'
      //     ? intl.get(`spcm.contractChange.title.sureTermination`).d('确认终止')
      //     : intl.get(`spcm.contractChange.title.sureCancel`).d('确认作废'),
      title: intl.get(`spcm.contractChange.title.sureCancel`).d('确认作废'),
      onOk: () => {
        dispatch({
          type: 'contractChange/changeContractStatus',
          payload: {
            pcHeaderStatus: action,
            pcHeaderDetailDtos: selectedRows,
          },
        }).then(res => {
          if (res) {
            notification.success();
            this.fetchList();
          }
        });
      },
    });
  }

  /**
   * 终止理由
   * @param {*} action
   * @param {*} terminationReason
   */
  @Bind()
  handleTerminate(action, terminationReason) {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    dispatch({
      type: 'contractChange/changeContractStatus',
      payload: {
        terminationReason,
        pcHeaderStatus: action,
        pcHeaderDetailDtos: selectedRows,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleControlModal();
        this.fetchList();
      }
    });
  }

  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    let cancellFlag = true;
    let terminateFlag = true;
    // eslint-disable-next-line array-callback-return
    selectedRows.map(ele => {
      if (ele.pcStatusCode !== 'PUBLISHED' && cancellFlag === true) {
        cancellFlag = false;
      }
      if (ele.pcStatusCode === 'PUBLISHED' && terminateFlag === true) {
        terminateFlag = false;
      }
    });
    this.setState({
      selectedRowKeys,
      selectedRows,
      cancellFlag,
      terminateFlag,
    });
  }

  @Bind()
  fetchHeader(pcHeaderId) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractCommon/fetchHeader',
      pcHeaderId,
    }).then(res => {
      if (res) {
        return Promise.resolve(res);
      }
    });
  }

  /**
   * fetchPartner - 查询合作伙伴数据
   * @param {object} page - 合作伙伴分页条件
   */
  @Bind()
  fetchPartner(page = {}, pcHeaderId) {
    const { dispatch } = this.props;
    if (pcHeaderId) {
      return new Promise(resolve => {
        dispatch({
          type: 'contractCommon/fetchPartner',
          payload: {
            page,
            pcHeaderId,
          },
        }).then(res => {
          if (res) {
            const partnerDataSource = res.map(n => ({
              ...n,
              pcHeaderId: null,
              partnerId: null,
            }));
            return resolve(partnerDataSource);
          }
        });
      });
    }
  }

  /**
   * fetchSubject - 查询标的信息数据
   * @param {object} page - 标的信息分页条件
   */
  @Bind()
  fetchSubject(page = {}, pcHeaderId) {
    const { dispatch } = this.props;
    if (pcHeaderId) {
      return new Promise(resolve => {
        dispatch({
          type: 'contractCommon/fetchSubject',
          payload: {
            page,
            pcHeaderId,
          },
        }).then(res => {
          if (res) {
            const pcSubjectDataSource = res.content.map(n => ({
              ...n,
              pcHeaderId: null,
              pcSubjectId: null,
            }));
            return resolve(pcSubjectDataSource);
          }
        });
      });
    }
  }

  /**
   * fetchStage - 查询标的协议阶段
   * @param {object} page - 协议阶段分页条件
   */
  @Bind()
  fetchStage(page = {}, pcHeaderId) {
    const { dispatch } = this.props;
    if (pcHeaderId) {
      return new Promise(resolve => {
        dispatch({
          type: 'contractCommon/fetchStage',
          payload: {
            page,
            pcHeaderId,
          },
        }).then(res => {
          if (res) {
            const pcStageDataSource = res.content.map(n => ({
              ...n,
              pcHeaderId: null,
              pcStageId: null,
            }));
            return resolve(pcStageDataSource);
          }
        });
      });
    }
  }

  /**
   * fetchSubject - 查询业务条款数据
   * @param {object} page - 业务条款分页数据
   */
  @Bind()
  fetchTerm(page = {}, pcHeaderId) {
    const { dispatch } = this.props;
    if (pcHeaderId) {
      return new Promise(resolve => {
        dispatch({
          type: 'contractCommon/fetchTerm',
          payload: {
            page,
            pcHeaderId,
          },
        }).then(res => {
          if (res) {
            const termDataSource = res.map(n => ({
              ...n,
              pcHeaderId: null,
              termId: null,
            }));
            return resolve(termDataSource);
          }
        });
      });
    }
  }

  /**
   * 查询返利信息
   * @param {*} page
   */
  @Bind()
  fetchContractRebate(page = {}, pcHeaderId) {
    const { dispatch } = this.props;
    if (pcHeaderId) {
      return new Promise(resolve => {
        dispatch({
          type: 'contractCommon/fetchContractRebate',
          payload: {
            page,
            pcHeaderId,
          },
        }).then(res => {
          if (res && res.content) {
            const pcRebateDataSource = res.content.map(n => ({
              ...n,
              pcHeaderId: null,
              rebateInformationId: null,
            }));
            return resolve(pcRebateDataSource);
          }
        });
      });
    }
  }

  @Bind()
  fetchAll(pcHeaderId) {
    const { dispatch } = this.props;
    Promise.all([
      this.fetchHeader(pcHeaderId),
      this.fetchTerm({}, pcHeaderId),
      this.fetchStage({}, pcHeaderId),
      this.fetchSubject({}, pcHeaderId),
      this.fetchPartner({}, pcHeaderId),
      this.fetchContractRebate({}, pcHeaderId),
    ]).then(
      ([
        headerInfo,
        termDataSource,
        pcStageDataSource,
        pcSubjectDataSource,
        partnerDataSource,
        pcRebateDataSource,
      ]) => {
        const payload = {
          ...merge(headerInfo),
          pcSubjectDetailDTOList: [...pcSubjectDataSource],
          pcPartnerDetailDTOList: [...partnerDataSource],
          pcStageDetailDTOList: [...pcStageDataSource],
          pcTermDetailDTOList: [...termDataSource],
          pcRebateInformationlist: [...pcRebateDataSource],
          mainContractId: pcHeaderId,
          pcHeaderId: null,
          amount: null,
          creationDate: null,
          pcNum: null,
          createdBy: null,
          electricSignFlag: null,
          alterationFlag: 1,
          // attachmentUuid: uuid(),
        };
        dispatch({
          type: 'contractChange/changeContract',
          payload,
        }).then(res => {
          if (res) {
            dispatch(
              routerRedux.push({
                pathname: `/spcm/contract-change/detail/${res.pcHeaderId}`,
              })
            );
          }
        });
      }
    );
  }

  /**
   * 确认变更
   */
  @Bind()
  changeContract(pcHeaderId, fn) {
    Modal.confirm({
      title: intl.get(`spcm.contractChange.title.sureChange`).d('确认变更'),
      onOk: () => {
        fn(pcHeaderId);
      },
    });
  }

  @Bind()
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  /**
   * 控制终止理由modal显隐
   */
  @Bind()
  handleControlModal() {
    const { terminateReasonVisible } = this.state;
    this.setState({ terminateReasonVisible: !terminateReasonVisible });
  }

  render() {
    const {
      queryListLoading,
      terminateLoading,
      queryingChange,
      contractChange: { dataSource, pagination, enumMap },
    } = this.props;
    const {
      selectedRowKeys,
      selectedRows = [],
      cancellFlag,
      terminateFlag,
      operationRecordVisible,
      pcHeaderId,
      terminateReasonVisible,
    } = this.state;
    const searchProps = {
      enumMap,
      onFetchList: this.fetchList,
      onRef: node => {
        this.filterForm = node.props.form;
      },
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };

    const listProps = {
      pagination,
      dataSource,
      loading: queryListLoading,
      selectedRowKeys,
      onRowSelectChange: this.onRowSelectChange,
      onSearch: this.fetchList,
      redirectDetail: this.redirectDetail,
      handleModalVisibleList: this.handleModalVisible,
    };

    const terminateReasonProps = {
      terminateLoading,
      visible: terminateReasonVisible,
      onOk: values => this.handleTerminate('TERMINATION_CONFIRM', values.terminationReason),
      onCancel: this.handleControlModal,
    };

    return (
      <Fragment>
        <Header
          title={intl.get(`spcm.contractChange.view.message.title.contractChange`).d('协议变更')}
        >
          <Button
            type="primary"
            loading={queryingChange}
            onClick={() => this.changeContract(selectedRows[0].pcHeaderId, this.fetchAll)}
            disabled={selectedRows.length !== 1}
          >
            <Icons type="main-handover" style={{ marginRight: '8px', fontSize: '16px' }} />
            {intl.get(`spcm.contractChange.view.button.change`).d('变更')}
          </Button>
          {/* <Button onClick={() => this.handleClick('delete')} disabled={selectedRows.length < 1}>
            {intl.get(`spcm.contractChange.view.button.delete`).d('删除')}
          </Button> */}
          <Button
            onClick={() => this.handleClick('cancell')}
            disabled={selectedRows.length < 1 || !cancellFlag}
          >
            <Icons type="main-tovoid" style={{ marginRight: '8px', fontSize: '16px' }} />
            {intl.get(`spcm.contractChange.view.button.cancell`).d('作废')}
          </Button>
          <Button
            onClick={this.handleControlModal}
            disabled={selectedRows.length < 1 || !terminateFlag}
          >
            <Icons type="jieshu" style={{ marginRight: '8px', fontSize: '16px' }} />
            {intl.get(`spcm.contractChange.view.button.terminate`).d('终止')}
          </Button>
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
          <OperationRecord {...operationRecordProps} />
          {terminateReasonVisible && <TerminateReasonModal {...terminateReasonProps} />}
        </Content>
      </Fragment>
    );
  }
}
