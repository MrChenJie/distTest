/*
 * @Description: index.js - 协议用章
 * @Author: MJQ <jiaqi.mao@hand-china.com>
 * @Date: 2019-08-13
 * @LastEditTime: 2019-08-26 16:14:37
 */
import React, { Fragment, Component } from 'react';
import { Button } from 'hzero-ui';
import { isUndefined, isArray, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { parse, stringify } from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { DATETIME_MIN } from 'utils/constants';
import intl from 'utils/intl';

import List from './List';
import Search from './Search';
import OperationRecord from '../components/OperationRecord';

const viewMessagePrompt = 'spcm.contractSign.view.message';

@connect(({ loading = {}, contractChapter = {} }) => ({
  queryListLoading: loading.effects['contractChapter/queryList'],
  contractChapter,
}))
@formatterCollections({
  code: [
    'spcm.contractSign',
    'spcm.common',
    'entity.company',
    'entity.supplier',
    'entity.organization',
    'spcm.contractChapter',
  ],
})
export default class ContractChapter extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcHeaderId } = parse(search.substr(1));
    this.state = {
      pcHeaderId,
      selectedRows: [],
      selectedRowKeys: [],
      operationRecordVisible: false,
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      contractChapter: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      this.fetchList(pagination);
    } else {
      this.fetchList();
    }
  }

  // 组件更新完成后调用，此时可以获取数据
  componentDidUpdate(prevProps, prevState, pcHeaderId) {
    if (pcHeaderId) {
      this.fetchList();
    }
  }

  /**
   * 预览协议
   */
  @Bind()
  preview() {
    const { dispatch } = this.props;
    const { selectedRows = [] } = this.state;
    const pcHeaderId = selectedRows.map(item => item.pcHeaderId);
    const companyId = selectedRows.map(item => item.companyId);
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-chapter/detail`,
        search: pcHeaderId ? stringify({ pcHeaderId, companyId }) : null,
        hash: 'spcm-contract-sign-detail-contract-online-edit',
      })
    );
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    const timeArray = ['creationDateFrom', 'creationDateTo'];
    timeArray.forEach(item => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  /* 操作记录Modal */
  @Bind()
  handleModalVisibleList(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  /* 设置选中行 */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  /**
   * 跳转到明细页
   * @param {String} pcHeaderId
   */
  @Bind()
  redirectDetail(pcHeaderId, companyId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-chapter/detail`,
        search: pcHeaderId ? stringify({ pcHeaderId, companyId }) : null,
      })
    );
  }

  @Bind()
  fetchList(page = {}) {
    const { pcHeaderId, tenantId } = this.state;
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const handleFormValues = this.handleFormQuery(filterValues);
    dispatch({
      type: 'contractChapter/queryList',
      payload: {
        page,
        pcHeaderId,
        tenantId,
        ...handleFormValues,
      },
    });
  }

  render() {
    const {
      pcHeaderId,
      operationRecordVisible,
      selectedRows = [],
      selectedRowKeys = [],
    } = this.state;
    const {
      queryListLoading,
      contractChapter: { dataSource, pagination },
    } = this.props;
    const pcKindCodeFlag = selectedRows.some(item => item.pcKindCode === 'ATTACHMENT');
    const pcKindCodeNormalFlag =
      selectedRows.filter(item => item.pcKindCode === 'NORMAL').length === 1;
    const searchProps = {
      onFetchList: this.fetchList,
      onRef: node => {
        this.filterForm = node.props.form;
      },
    };

    const listProps = {
      pcHeaderId,
      pagination,
      dataSource,
      selectedRowKeys,
      onSearch: this.fetchList,
      loading: queryListLoading,
      redirectDetail: this.redirectDetail,
      onRowSelectChange: this.onRowSelectChange,
      handleModalVisibleList: this.handleModalVisibleList,
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisibleList('operationRecordVisible', false),
    };

    return (
      <Fragment>
        <Header
          title={intl.get(`spcm.contractChapter.view.message.title.contractChapter`).d('协议用章')}
        >
          <Button
            icon="check"
            disabled={
              (isArray(selectedRows) && isEmpty(selectedRows)) ||
              pcKindCodeFlag ||
              !pcKindCodeNormalFlag
            }
            onClick={this.preview}
          >
            {intl.get(`${viewMessagePrompt}.previewTheAgreement`).d('预览协议')}
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
