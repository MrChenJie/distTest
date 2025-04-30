/** 跨销售单元权限配置
 * @date: 2021/04/06 10:07:39
 * @author: Xukuan <kuan.xu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import moment from 'moment';
import { LocaleProvider } from 'hzero-ui';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';

import { Content } from 'components/Page';
import { createPagination, addItemToPagination, getCurrentLanguage } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';

import { delItemsToPagination } from 'hzero-front/lib/utils/utils';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

const ROW_KEY = 'permissionConfigId';

@formatterCollections({ code: ['spcm.csPermissionConfig'] })
@connect(({ csPermissionConfig, loading }) => ({
  csPermissionConfig,
  fetchLoading: loading.effects['csPermissionConfig/fetchData'],
  saveLoading: loading.effects['csPermissionConfig/save'],
}))
export default class PermissionConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      idpValueMap: {},
      dataSource: [],
      pagination: [],
      treeData: [],
    };
    this.codes = ['SPUC.BUSINESS_TYPE', 'SPFM.YES_NO', 'SPUC.DOCUMENT_TYPE'];
  }

  componentDidMount() {
    this.handleSearch();
    this.initValueList();
    this.initUnits();
  }

  @Bind
  initUnits() {
    const { dispatch } = this.props;
    dispatch({
      type: 'csPermissionConfig/units',
    }).then((res) => {
      if (res) {
        this.setState({
          treeData: this.buildTreeData(res),
        });
      }
    });
  }

  /**
   * 构建部门结构树
   *
   * @param {array} [data=[]]
   * @returns
   * @memberof PermissionConfig
   */
  buildTreeData(data = []) {
    data.forEach((item) => {
      const { unitId } = item;
      const children = data.filter((d) => d.parentUnitId === unitId);
      Object.assign(item, {
        children,
        key: item.unitCode,
        title: item.unitName,
        value: item.unitCode,
      });
    });
    return data.filter((item) => item.parentUnitId === null);
  }

  @Bind
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'csPermissionConfig/fetchData',
      payload: {
        page,
        ...this.getQueryParams(),
      },
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.content.map((item) => ({ ...item, _status: 'update' })),
          pagination: createPagination(res),
        });
        if (this.list) {
          const { clearEditRowKey = (e) => e } = this.list;
          clearEditRowKey();
        }
      }
    });
  }

  @Bind
  @Bind()
  initValueList() {
    const params = {};
    Object.assign(params, ...this.codes.map((item) => ({ [item]: item })));
    queryMapIdpValue(params).then((res) => {
      if (res) {
        this.setState({
          idpValueMap: res,
        });
      }
    });
  }

  @Bind
  handleAddLine(newLine = {}) {
    const { dataSource = [], pagination = {} } = this.state;
    const newPagination = addItemToPagination(dataSource.length, pagination);
    this.setState({
      dataSource: [newLine, ...dataSource],
      pagination: newPagination,
    });
  }

  @Bind
  handleSaveLine(data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'csPermissionConfig/save',
      payload: [data],
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch();
      }
    });
  }

  @Bind
  handleDeleteLine(keys = [], callback) {
    const { dispatch } = this.props;
    const { dataSource = [], pagination = {} } = this.state;
    const deleteData = dataSource.filter(
      (item) => keys.includes(item[ROW_KEY]) && item._status === 'update'
    );
    if (deleteData.length > 0) {
      dispatch({
        type: 'csPermissionConfig/delete',
        payload: deleteData,
      }).then((res) => {
        if (res) {
          notification.success();
          callback();
          this.handleSearch();
        }
      });
    } else {
      const newDataSource = dataSource.filter((item) => !keys.includes(item[ROW_KEY]));
      const delItemsLength = dataSource.length - newDataSource.length;
      const newPagination = delItemsToPagination(delItemsLength, dataSource.length, pagination);
      this.setState(
        {
          dataSource: newDataSource,
          pagination: newPagination,
        },
        () => {
          callback();
        }
      );
    }
  }

  @Bind
  getQueryParams() {
    const fieldsValue = this.form.getFieldsValue();
    const { createDateFrom, createDateTo } = fieldsValue;
    return {
      ...fieldsValue,
      createDateFrom: moment.isMoment(createDateFrom)
        ? createDateFrom.format('YYYY-MM-DD')
        : undefined,
      createDateTo: moment.isMoment(createDateTo) ? createDateTo.format('YYYY-MM-DD') : undefined,
    };
  }

  render() {
    const { fetchLoading, saveLoading } = this.props;
    const { idpValueMap, dataSource, pagination, treeData } = this.state;
    const formProps = {
      idpValueMap,
      onSearch: this.handleSearch,
      onRef: (ref) => {
        this.form = ref.props.form;
      },
    };
    const tableProps = {
      idpValueMap,
      dataSource,
      pagination,
      loading: fetchLoading,
      saveLoading,
      treeData,
      onAddLine: this.handleAddLine,
      onSaveLine: this.handleSaveLine,
      onDeleteLine: this.handleDeleteLine,
      onRef: (ref) => {
        this.list = ref;
      },
      getQueryParams: this.getQueryParams,
      onChange: this.handleSearch,
    };
    return (
      <>
        <Content>
          <LocaleProvider locale={getCurrentLanguage() === 'en_US' ? undefined : zhCN}>
            <>
              <FilterForm {...formProps} />
              <ListTable {...tableProps} />
            </>
          </LocaleProvider>
        </Content>
      </>
    );
  }
}
