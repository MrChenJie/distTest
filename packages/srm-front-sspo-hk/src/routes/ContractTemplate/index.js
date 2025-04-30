/**
 * index.js - 协议模板管理
 * @date: 2019-05-15
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { parse, stringify } from 'querystring';
import { Button, Modal } from 'hzero-ui';
import { isUndefined, isArray, isEmpty } from 'lodash';
import { connect } from 'dva';
import uuid from 'uuid/v4';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import { Bind, Debounce } from 'lodash-decorators';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  addItemToPagination,
  getEditTableData,
  delItemsToPagination,
  createPagination,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';

import Search from './Search';
import List from './List';
import CompanyModal from './CompanyModal';

const modelPrompt = 'spcm.common.model.common';
@connect(({ loading = {}, contractTemplate = {} }) => ({
  queryListLoading: loading.effects['contractTemplate/queryList'],
  updateStateLoading: loading.effects['contractTemplate/updateState'],
  submitting: loading.effects['contractTemplate/update'],
  queryCompanyLoading: loading.effects['contractTemplate/fetchCompany'],
  contractTemplate,
}))
@formatterCollections({
  code: [
    'spcm.contractTemplate',
    'spcm.purchaseContactType',
    'spcm.common',
    'entity.company',
    'entity.item',
  ],
})
export default class ContractTemplate extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcTemplateId } = parse(search.substr(1));
    this.state = {
      pcTemplateId,
      pcTempId: null,
      pcTypeId: null,
      dataSource: [],
      selectedRows: [],
      selectedRowKeys: [],
      pagination: [],
      tenantId: getCurrentOrganizationId(),
      companyDataSource: [], // 公司数据
      companyPagination: {}, // 公司分页
    };
  }

  componentDidMount() {
    const {
      // TODO
      // _back:判断进入详情
      // 分页
      location: { state: { _back } = {} },
      contractTemplate: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      this.fetchList(pagination);
    } else {
      this.fetchList(); // 查询数据
    }
    this.fetchEnum(); // 查询值集
  }

  componentDidUpdate(prevProps, prevState, pcTemplateId) {
    if (pcTemplateId) {
      this.fetchList();
    }
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchList(page = {}, selectedRows = [], selectedRowKeys = []) {
    const { pcTemplateId, tenantId } = this.state;
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    this.setState({ selectedRows, selectedRowKeys });
    dispatch({
      type: 'contractTemplate/queryList',
      payload: {
        page,
        pcTemplateId,
        tenantId,
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
    const { contractTemplate } = this.props;
    const { dataSource = [] } = contractTemplate;
    dataSource.forEach(item => {
      item.$form.resetFields();
    });
  }

  /**
   * save - 保存明细数据
   * 保存明细头数据和行明细相关字段
   */
   @Debounce(300, { leading: true })
  @Bind()
  save() {
    const { dispatch, contractTemplate } = this.props;
    const { dataSource = [], pagination } = contractTemplate;
    const newDataSource = dataSource.filter(item => item.edited);
    const lines = getEditTableData(newDataSource, ['pcTemplateId', '_status']);
    if (newDataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
      const headerData = {
        lines,
      };
      dispatch({
        type: 'contractTemplate/update',
        payload: { headerData },
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchList(pagination);
        }
      });
    }
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractTemplate/init',
    });
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
   * 新建列表
   * @param {String} pcTemplateId
   */
  @Bind()
  newProject() {
    const {
      dispatch,
      contractTemplate: { dataSource, pagination },
    } = this.props;
    const newDataSource = {
      enabledFlag: 1,
      edited: true,
      pcTemplateId: uuid(),
      _status: 'create',
      templateFileUrl: 'NULL_TEMPLATE',
    };
    dispatch({
      type: 'contractTemplate/updateState',
      payload: {
        dataSource: [newDataSource, ...dataSource],
        pagination: addItemToPagination(dataSource.length, pagination),
      },
    });
  }

  @Bind()
  handleRecordChange(record) {
    const { dispatch, contractTemplate } = this.props;
    const { dataSource } = contractTemplate;
    const newDataSource = dataSource.map(item => {
      if (item.pcTemplateId === record.pcTemplateId) {
        return {
          ...item,
          edited: true,
        };
      }
      return item;
    });
    dispatch({
      type: 'contractTemplate/updateState',
      payload: {
        dataSource: newDataSource,
      },
    });
  }

  /**
   * 跳转到明细页
   * @param {String} pcTemplateId
   */
  @Bind()
  redirectDetail(pcTemplateId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-template/detail`,
        search: pcTemplateId ? stringify({ pcTemplateId }) : stringify({}),
      })
    );
  }

  /**
   * 更新附件
   * @param {*} params
   */
  @Bind()
  handleUpdateAttachment(params) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'contractCommon/updateContractTemplateUrl',
      payload: params,
    });
  }

  /**
   * delete - 删除列表
   */
  @Bind()
  delete() {
    const sourceField = `dataSource`;
    const paginationField = `pagination`;
    const selectedField = `selectedRows`;
    const rowKey = `pcTemplateId`;
    const { [selectedField]: selectedRows = [] } = this.state;
    const { contractTemplate, dispatch } = this.props;
    const { [sourceField]: dataSource = [], [paginationField]: pagination = {} } = contractTemplate;
    Modal.confirm({
      title: intl.get(`spcm.purchaseContactType.view.message.removePurchaseLines`).d('是否清除'),
      onOk: () => {
        const selectedRowKeys = selectedRows.map(item => item[rowKey]);
        const newDataSource = dataSource.filter(item => !selectedRowKeys.includes(item[rowKey]));
        dispatch({
          type: 'contractTemplate/updateState',
          payload: {
            [sourceField]: newDataSource,
            [paginationField]: delItemsToPagination(
              selectedRows.length,
              newDataSource.length, // 当前数据长度
              // newDataSource.length, // 新增数据长度
              pagination // 原始分页对象
            ),
          },
        });
        this.setState({ [selectedField]: [], [paginationField]: [] });
      },
    });
  }

  /**
   * handleCompany - 处理公司查看/新增
   */
  @Bind()
  handleCompany(pcTypeId, pcTemplateId) {
    this.setState(
      {
        companyVisible: true,
        pcTempId: pcTemplateId,
        pcTypeId,
      },
      () => this.fetchCompany(pcTypeId, pcTemplateId)
    );
  }

  /**
   fetchCompany - 查询公司(子账号权限下的公司)
   */
  @Bind()
  fetchCompany(record, pcTemplateId, page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.companyForm)
      ? {}
      : filterNullValueObject(this.companyForm.getFieldsValue());
    dispatch({
      type: 'contractTemplate/fetchCompany',
      payload: {
        ...filterValues,
        pcConfigId: record,
        pcTemplateId,
        page,
      },
    }).then(res => {
      if (res) {
        this.setState({
          companyDataSource: res.content.map(n => ({ ...n, _status: 'update' })) || [],
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
   * 确认保存新建的公司
   */
  @Bind()
  saveCompany() {
    const { companyDataSource, pcTempId } = this.state;
    const { dispatch } = this.props;
    const companyData = getEditTableData(companyDataSource, ['companyId', '_status']);
    dispatch({
      type: 'contractTemplate/saveCompany',
      payload: { pcTemplateId: pcTempId, companyDataSource: companyData },
    }).then(res => {
      if (res) {
        notification.success();
        this.setState({
          companyVisible: false,
        });
      }
    });
  }

  render() {
    const {
      form,
      queryListLoading,
      contractTemplate,
      submitting,
      updateStateLoading,
      queryCompanyLoading,
    } = this.props;
    const { pagination = {}, dataSource = [], enumMap = [] } = contractTemplate;
    const {
      selectedRows = [],
      companyVisible,
      companyDataSource,
      companyPagination,
      pcTypeId,
      pcTempId,
    } = this.state;
    const selectedRowKeys = selectedRows.map(item => item.pcTemplateId);
    const searchProps = {
      enumMap,
      onRef: node => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.fetchList,
    };
    const companyProps = {
      dataSource: companyDataSource,
      pagination: companyPagination,
      loading: queryCompanyLoading,
      visible: companyVisible,
      onSearch: this.fetchCompany,
      handleCompany: this.fetchCompany,
      fetchCompany: this.fetchCompany,
      saveCompany: this.saveCompany,
      hideModal: this.hideCompanyModal,
      pcTypeId, // 类型id
      pcTempId, // 模板id
      onRef: node => {
        this.companyForm = node.props.form;
      },
    };
    const listProps = {
      form,
      dataSource,
      pagination,
      selectedRows,
      companyProps,
      contractTemplate,
      onSearch: this.fetchList,
      loading: queryListLoading,
      newProject: this.newProject,
      redirectDetail: this.redirectDetail,
      onHandleRecord: this.handleRecordChange,
      onRowSelectChange: this.onRowSelectChange,
      onFetchList: () => this.fetchList(pagination),
      onUpdateAttachment: this.handleUpdateAttachment,
      handleCompany: this.handleCompany,
    };
    return (
      <Fragment>
        <Header title={intl.get(`${modelPrompt}.pcTemplateId`).d('协议模板')}>
          <Button icon="plus" type="primary" onClick={() => this.newProject()}>
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
          <Button
            icon="save"
            loading={submitting}
            onClick={this.save}
            disabled={queryListLoading || updateStateLoading}
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
          <Button
            icon="delete"
            onClick={this.delete}
            disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
          >
            {intl.get(`hzero.common.button.clean`).d('清除')}
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
