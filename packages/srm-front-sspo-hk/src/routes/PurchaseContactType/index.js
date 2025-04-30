/**
 * index.js - 协议类型管理
 * @date: 2019-05-13
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button } from 'hzero-ui';
import { parse, stringify } from 'querystring';
import { isUndefined } from 'lodash';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';

import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { filterNullValueObject, createPagination } from 'utils/utils';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';

import Search from './Search';
import List from './List';
import CompanyModal from './CompanyModal';

// const viewMessagePrompt = 'spcm.purchaseContactType.view.message';
const mldelMessagePropt = 'spcm.common.model.common';

@connect(({ loading = {}, purchaseContractType = {} }) => ({
  queryListLoading: loading.effects['purchaseContractType/queryList'],
  fetchEnumLoading: loading.effects['purchaseContractType/fetchEnum'],
  updateStateLoading: loading.effects['purchaseContractType/updateState'],
  submitting: loading.effects['purchaseContractType/update'],
  queryCompanyLoading: loading.effects['purchaseContractType/fetchCompany'],
  purchaseContractType,
}))
@formatterCollections({
  code: [
    'spcm.purchaseContactType',
    'spcm.common',
    'entity.company',
    'entity.item',
    'spcm.purchaseContractType',
    'entity.roles',
  ],
})
export default class PurchaseContactType extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcTypeId } = parse(search.substr(1));
    this.state = {
      pcTypeId,
      pcConfigId: null,
      companyVisible: false,
      // selectedRows: [],
      // selectedRowKeys: [],
    };
  }

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      purchaseContractType: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      // _back=-1 在详情页
      this.fetchList(pagination);
    } else {
      this.fetchList(); // 查询数据
    }
    this.fetchEnum(); // 查询值集
  }

  componentDidUpdate(prevProps, prevState, pcTypeId) {
    if (pcTypeId) {
      this.fetchList();
    }
  }

  /**
   * handleCompany - 处理公司查看/新增
   */
  @Bind()
  handleCompany(record) {
    this.setState(
      {
        companyVisible: true,
        pcConfigId: record.pcTypeId,
      },
      () => this.fetchCompany(record.pcTypeId)
    );
  }

  /**
   fetchCompany - 查询公司(子账号权限下的公司)
   */
  @Bind()
  fetchCompany(pcTypeId, page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.companyForm)
      ? {}
      : filterNullValueObject(this.companyForm.getFieldsValue());
    dispatch({
      type: 'purchaseContractType/fetchCompany',
      payload: {
        pcConfigId: pcTypeId,
        page,
        ...filterValues,
      },
    }).then(res => {
      if (res) {
        this.setState({
          companyDataSource: res.content,
          companyPagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 关闭公司模态框
   */
  @Bind()
  hideCompanyModal() {
    this.setState({
      companyVisible: false,
    });
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */

  @Bind()
  fetchList(page = {}) {
    const { pcTypeId } = this.state;
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    // this.setState({ selectedRows: [] });
    dispatch({
      type: 'purchaseContractType/queryList',
      payload: {
        page,
        pcTypeId,
        ...filterValues,
      },
    }).then(() => {
      this.resetDataForm();
    });
  }

  /**
   * onReset - 重置列表事件
   */
  @Bind()
  resetDataForm() {
    const { purchaseContractType } = this.props;
    const { dataSource = [] } = purchaseContractType;
    dataSource.forEach(item => {
      item.$form.resetFields();
    });
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseContractType/init',
    });
  }

  /**
   * 跳转到明细页
   * @param {String} pcTypeId
   */
  @Bind()
  redirectDetail(pcTypeId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/purchase-contract-type/detail`,
        search: pcTypeId ? stringify({ pcTypeId }) : stringify({}),
      })
    );
  }

  /**
   * 新建列表
   */
  @Bind()
  project() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/purchase-contract-type/detail`,
      })
    );
  }

  /**
   * save - 保存明细数据
   * 保存明细头数据和行明细相关字段
   */
  /* @Bind()
  save() {
    const { dispatch = e => e, purchaseContractType } = this.props;
    const { dataSource = [] } = purchaseContractType;
    const newDataSource = dataSource.filter(item => item.edited);
    const lines = getEditTableData(newDataSource, ['pcTypeId', '_status']);
    if (newDataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
      const list = {
        pcAttachmentTypeDtailDTOList: null,
        pcPartnerTypeDetailDTOList: null,
        pcTermTypeDetailDTOList: null,
      };
      const Lines = lines.map(item => {
        return {
          ...item,
          ...list,
        };
      });
      dispatch({
        type: 'purchaseContractType/update',
        payload: Lines,
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchList();
        }
      });
    }
  } */

  /**
   * handleRecordChange - 列表项启用禁用勾选
   */
  // @Bind()
  // handleRecordChange(record) {
  //   const { dispatch, purchaseContractType } = this.props;
  //   const { dataSource } = purchaseContractType;
  //   const newDataSource = dataSource.map(item => {
  //     if (item.pcTypeId === record.pcTypeId) {
  //       return {
  //         ...item,
  //         edited: true,
  //       };
  //     }
  //     return item;
  //   });
  //   dispatch({
  //     type: 'purchaseContractType/updateState',
  //     payload: {
  //       dataSource: newDataSource,
  //     },
  //   });
  // }

  render() {
    const { queryListLoading, queryCompanyLoading, purchaseContractType, form } = this.props;
    const { companyVisible, companyDataSource, companyPagination, pcConfigId } = this.state;
    const { pagination = {}, dataSource = [], enumMap = {} } = purchaseContractType;
    const searchProps = {
      enumMap,
      onRef: node => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.fetchList,
    };
    const listProps = {
      form,
      dataSource,
      pagination,
      purchaseContractType,
      onSearch: this.fetchList,
      onChange: this.fetchList,
      loading: queryListLoading,
      redirectDetail: this.redirectDetail,
      onHandleRecord: this.handleRecordChange,
      handleCompany: this.handleCompany,
    };
    const companyProps = {
      dataSource: companyDataSource,
      pagination: companyPagination,
      loading: queryCompanyLoading,
      visible: companyVisible,
      onSearch: this.fetchCompany,
      handleCompany: this.fetchCompany,
      fetchCompany: this.fetchCompany,
      hideModal: this.hideCompanyModal,
      pcConfigId,
      onRef: node => {
        this.companyForm = node.props.form;
      },
    };
    return (
      <Fragment>
        <Header title={intl.get(`${mldelMessagePropt}.pcType`).d('协议类型')}>
          <Button icon="plus" type="primary" onClick={this.project}>
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
        {companyVisible && <CompanyModal {...companyProps} />}
      </Fragment>
    );
  }
}
