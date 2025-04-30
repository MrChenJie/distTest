/**
 * @Description: FTP服务器信息列表
 * @date 2023-02-02
 * @author <kaicong.lin@hand-china.com>
 * @version 1.0.0
 * @copyright Copyright (c) 2022, Hand
 */
import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import { connect } from 'dva';
import notification from 'utils/notification';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject } from 'utils/utils';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

@Form.create({ fieldNameProp: null })
@connect(({ ftpServers, loading }) => ({
  ftpServers,
  loading: { query: loading.effects['ftpServers/query'] },
}))
@formatterCollections({ code: ['himp.ftpServers'] })
export default class List extends Component {
  state = {
    selectedRows: [],
  };

  /**
   * componentDidMount 生命周期函数
   * render()执行后获取页面数据
   */
  componentDidMount() {
    const {
      ftpServers: { pagination },
    } = this.props;
    this.fetchList(pagination);
  }

  /**
   * fetchList - 查询列表数据
   * @param fields {object} [params = {}] - 查询参数
   */
  @Bind()
  fetchList(fields = {}) {
    const { dispatch, form } = this.props;
    const fieldValues = filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'ftpServers/query',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
      },
    });
  }

  @Bind()
  handleAdd() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/himp/ftp-servers/detail/create`,
      })
    );
  }

  @Bind
  handleDelete() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    dispatch({
      type: 'ftpServers/deleteServers',
      payload: selectedRows,
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchList();
      }
    });
  }

  @Bind()
  handleEdit(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/himp/ftp-servers/detail/${record.serverId}`,
      })
    );
  }

  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form,
      loading,
      ftpServers: { dataSource, pagination },
    } = this.props;
    const { selectedRows = [] } = this.state;
    const filterProps = {
      form,
      search: this.fetchList,
    };
    const rowSelection = {
      onChange: this.onSelectChange,
      selectedRowKeys: selectedRows.map((n) => n.serverId),
    };
    const listProps = {
      pagination,
      dataSource: dataSource,
      rowSelection,
      loading: loading.query,
      onChange: (page) => this.fetchList(page),
      onAdd: this.handleAdd,
      onDelete: this.handleDelete,
      onEdit: this.handleEdit,
    };
    return (
      <>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <ListTable {...listProps} />
        </Content>
      </>
    );
  }
}
