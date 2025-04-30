/**
 * index.js - 协议拟制
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import querystring from 'querystring';

import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { Header, Content } from 'components/Page';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import OperationRecord from '../../components/OperationRecord';
import LadderOfferModal from './ladderOfferModal';
import Search from './Search';
import List from './List';

@connect(({ loading = {}, contractMaintain = {} }) => ({
  loadingLadderOffer: loading.effects['contractMaintain/fetchLadderOffer'],
  fetchSourceList: loading.effects['contractMaintain/fetchSourceList'],
  fetchEnumLoading: loading.effects['contractMaintain/fetchEnum'],
  loadingSourceCreate: loading.effects['contractMaintain/sourceList'],
  contractMaintain,
}))
@formatterCollections({
  code: [
    'spcm.common',
    'entity.company',
    'entity.roles',
    'hzero.common',
    'entity.supplier',
    'entity.business',
    'ssrc.inquiryHall.model',
    'ssrc.inquiryHall.view',
  ],
})
export default class QuoteSourceResult extends Component {
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
      ladderOfferList: [],
      ladderOfferVisible: false,
      operationRecordVisible: false,
      LadderLevelHeaderData: {
        itemCode: '',
        itemName: '',
        quotationLineId: '',
        supplierCompanyName: '',
        quotationLineStatus: '',
      },
    };
  }

  componentDidMount() {
    this.fetchList(); // 查询数据
    this.fetchEnum(); // 查询值集
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchList(page = {}) {
    const { dispatch } = this.props;
    let filterValues = {};
    if (!isUndefined(this.filterForm)) {
      const formValue = this.filterForm.getFieldsValue();
      const values = {
        ...formValue,
        createDateFrom: formValue.createDateFrom && formValue.createDateFrom.format(DATETIME_MIN),
        createDateTo: formValue.createDateTo && formValue.createDateTo.format(DATETIME_MAX),
      };
      filterValues = filterNullValueObject(values);
    }
    this.setState({ selectedRows: [], selectedRowKeys: [] });
    const tenantId = getCurrentOrganizationId();
    dispatch({
      type: 'contractMaintain/fetchSourceList',
      payload: {
        page,
        tenantId,
        ...filterValues,
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
  quoteSourceCreate() {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/sourceCreate',
      payload: selectedRows,
    }).then(res => {
      if (res) {
        dispatch(
          routerRedux.push({
            pathname: `/spcm/contract-maintain/detail`,
            search: querystring.stringify({ isQuoteSource: String(1) }),
          })
        );
        dispatch({
          type: 'contractMaintain/updateState',
          payload: { sourceResultDTOs: selectedRows },
        });
      }
    });
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
   * 阶梯报价可见
   */
  @Bind()
  ladderOfferVisible(record) {
    const {
      itemCode,
      itemName,
      supplierCompanyName,
      quotationLineId,
      quotationLineStatus,
    } = record;
    this.setState({
      ladderOfferVisible: true,
      LadderLevelHeaderData: {
        itemCode,
        itemName,
        quotationLineId,
        supplierCompanyName,
        quotationLineStatus,
      },
    });
  }

  /**
   * 查询阶梯报价
   */
  @Bind()
  fetchLadderOffer() {
    const { dispatch } = this.props;
    const {
      LadderLevelHeaderData: { quotationLineId = '' },
    } = this.state;
    dispatch({
      type: 'contractMaintain/fetchLadderOffer',
      payload: quotationLineId,
    }).then(res => {
      if (res) {
        this.setState({ ladderOfferList: res.content });
      }
    });
  }

  /**
   * 阶梯报价可见
   */
  @Bind()
  hideLadderOfferVisible() {
    this.setState({ ladderOfferVisible: false });
  }

  render() {
    const {
      fetchSourceList,
      contractMaintain,
      loadingLadderOffer,
      loadingSourceCreate,
    } = this.props;
    const { quoteSourcePagination = {}, quoteSourceList = [], enumMap = [] } = contractMaintain;
    const {
      selectedRows = [],
      selectedRowKeys = [],
      operationRecordVisible,
      ladderOfferVisible,
      pcHeaderId,
      ladderOfferList,
      LadderLevelHeaderData,
    } = this.state;
    const searchProps = {
      enumMap,
      onRef: node => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.fetchList,
    };
    const listProps = {
      pcHeaderId,
      dataSource: quoteSourceList,
      pagination: quoteSourcePagination,
      selectedRows,
      selectedRowKeys,
      contractMaintain,
      loading: fetchSourceList,
      onSearch: this.fetchList,
      onRowSelectChange: this.onRowSelectChange,
      redirectDetail: this.redirectDetail,
      operatingData: this.operatingData,
      showModal: this.ladderOfferVisible,
    };
    const ladderOfferProps = {
      location,
      LadderLevelHeaderData,
      ladderOfferList,
      loadingLadderOffer,
      visible: ladderOfferVisible,
      hideModal: this.hideLadderOfferVisible,
      fetchLadderOffer: this.fetchLadderOffer,
      ladderOfferVisible: this.ladderOfferVisible,
    };
    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };

    return (
      <Fragment>
        <Header
          backPath="/spcm/contract-maintain/list"
          title={intl.get(`spcm.contractMaintain.view.message.title.quoteSource`).d('引用寻源结果')}
        >
          <Button
            disabled={!selectedRows.length}
            icon="check"
            type="primary"
            onClick={() => this.quoteSourceCreate()}
            loading={loadingSourceCreate}
          >
            {intl.get(`spcm.common.button.create`).d('创建')}
          </Button>
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
        {<OperationRecord {...operationRecordProps} />}
        {ladderOfferVisible && <LadderOfferModal {...ladderOfferProps} />}
      </Fragment>
    );
  }
}
