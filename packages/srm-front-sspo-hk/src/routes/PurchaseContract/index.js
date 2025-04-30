/*
 * ContractMaintainDetail - 协议维护详情
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
// import { connect } from 'dva';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { Bind } from 'lodash-decorators';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { filterNullValueObject } from 'utils/utils';
import { DATETIME_MIN } from 'utils/constants';
import _ from 'lodash';

import intl from 'utils/intl';
import List from './List';

import Search from './Search';

/**
 * CreateByPurchase - 引用申请创建协议
 * @extends {Component} - React.Component中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ purchaseApplicationContract = {}, loading }) => ({
  purchaseApplicationContract,
  querying: loading.effects['purchaseApplicationContract/queryList'],
  creating: loading.effects['purchaseApplicationContract/verified'],
}))
@formatterCollections({
  code: ['spcm.common', 'hzero.common'],
})
export default class CreateByPurchase extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedPurchaseContracts: [],
    };
  }

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      purchaseApplicationContract: { pagination = {} },
      dispatch,
    } = this.props;
    this.fetchList(_back === -1 ? pagination : undefined);
    dispatch({
      type: 'purchaseApplicationContract/fetchEnum',
    });
  }

  @Bind()
  async create() {
    const { selectedPurchaseContracts = [] } = this.state;
    const { dispatch } = this.props;
    if (selectedPurchaseContracts.length > 1) {
      const result = await dispatch({
        type: 'purchaseApplicationContract/verified',
        payload: { selectedPurchaseContracts },
      });
      if (!result) {
        return;
      }
    }
    // 合并头信息
    const headerInfo = [
      'supplierTenantId',
      'supplierCompanyId',
      'supplierCompanyName',
      'supplierId',
      'supplierName',
      'ouId',
      'ouName',
      'purchaseOrgId',
      'purchaseOrgName',
      'purchaseAgentId',
      'purchaseAgentName',
      'companyOrgName',
      'companyOrgId',
      'costAnchDepId',
      'costAnchDepDesc',
      'overseasProcurement',
      'companyId',
      'companyName',
    ].reduce((obj, filedNames) => {
      const [filedName, targetFiledName] = [].concat(filedNames);
      const _headerInfo = obj;
      // 当前字段在选择项中不同值集合
      const diffValues = new Set(
        selectedPurchaseContracts.map(purchaseContract => {
          if (purchaseContract[filedName]) {
            return purchaseContract[filedName];
          } else {
            return null;
          }
        })
      );
      diffValues.delete(null);
      if (diffValues.size === 1) {
        [_headerInfo[targetFiledName || filedName]] = diffValues;
      }
      return _headerInfo;
    }, {});
    headerInfo.pcSourceCodeMeaning = intl.get(`spcm.common.model.purchaseDemand`).d('采购需求');
    headerInfo.pcSourceCode = 'PURCHASE_NEED';
    // 合并协议标行
    const contractSubjects = _.cloneDeep(selectedPurchaseContracts).map(_subject => {
      const subject = _subject;
      // delete subject.prLineId;
      delete subject.$form;
      subject.deliverDate = subject.neededDate;
      subject.address = subject.location;
      subject.sourceCode = subject.prNum;
      subject.sourceLineNum = subject.lineNum;
      subject.prLineNum = subject.lineNum;
      subject.quantity = subject.availableQuantity;
      subject.specifications = subject.itemModel;
      subject.model = subject.itemSpecs;
      // subject.projectNum = null; // 默认不带出项目编码==>海能达需要带出来
      return subject;
    });
    const contractMaintain = { headerInfo, pcSubjectDataSource: contractSubjects };

    const itemKey = `spcm.contractMaintain.${Math.random()}`;
    window.sessionStorage.setItem(itemKey, JSON.stringify(contractMaintain));

    this.props.history.push({
      pathname: '/spcm/contract-maintain/detail',
      search: `?from=purchaseContract&itemKey=${itemKey}`,
    });
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchList(page = {}) {
    const { dispatch } = this.props;
    const { supplierCompanyId, supplierId } = this.state;
    let filterValues = !this.filterForm ? {} : this.filterForm.getFieldsValue();
    // 处理时间字段
    filterValues = [
      'createdDateStart',
      'createdDateEnd',
      'neededDateStart',
      'neededDateEnd',
    ].reduce((_filterFormValue, timeFiled) => {
      const filterFormValue = _filterFormValue;
      filterFormValue[timeFiled] =
        filterFormValue[timeFiled] && filterFormValue[timeFiled].format(DATETIME_MIN);
      return filterValues;
    }, filterValues);
    filterValues = filterNullValueObject({ ...filterValues, supplierCompanyId, supplierId });
    // this.setState({ selectedPurchaseContracts: [] });
    const erpControlFlag = 1;
    dispatch({
      type: 'purchaseApplicationContract/queryList',
      payload: {
        page,
        ...filterValues,
        erpControlFlag,
      },
    });
  }

  /** 选择行
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    const { selectedPurchaseContracts } = this.state;
    const { purchaseApplicationContract } = this.props;
    const { dataSource = [] } = purchaseApplicationContract;
    const currentIds = dataSource.map(item => item.prLineId);
    const oldSelectedPurchaseContracts = selectedPurchaseContracts.filter(item => {
      return !currentIds.includes(item.prLineId);
    });
    this.setState({
      selectedRowKeys,
      selectedPurchaseContracts: [...oldSelectedPurchaseContracts, ...selectedRows],
    });
  }

  // 获取 Search 中 供应商 字段中选中的其他参数
  @Bind()
  handleGetLovValues(supplierCompanyId, supplierId) {
    this.setState({
      supplierCompanyId,
      supplierId,
    });
  }

  render() {
    const { purchaseApplicationContract = {}, querying, creating } = this.props;
    const { pagination = {}, dataSource = [], enumMap = [] } = purchaseApplicationContract;
    const { selectedPurchaseContracts = [], selectedRowKeys = [] } = this.state;

    const searchProps = {
      enumMap,
      onRef: node => {
        this.filterForm = node.props.form;
      },
      onSearch: this.fetchList,
      onGetLovValues: this.handleGetLovValues,
    };

    const listProps = {
      dataSource,
      pagination,
      selectedRowKeys,
      // selectedPurchaseContracts,
      loading: querying,
      onSearch: this.fetchList,
      onRowSelectChange: this.onRowSelectChange,
    };

    return (
      <Fragment>
        <Header
          title={intl.get(`spcm.common.view.message.title.referencePurchase`).d('引用采购需求')}
          backPath="/spcm/contract-maintain/list"
        >
          <Button
            disabled={!selectedPurchaseContracts.length}
            icon="check"
            type="primary"
            loading={creating}
            onClick={this.create}
          >
            {intl.get(`hzero.common.create`).d('创建')}
          </Button>
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
