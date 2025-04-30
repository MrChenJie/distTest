import React, { Component } from 'react';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import dayjs from 'dayjs';
import { Bind } from 'lodash-decorators';
import { createPagination } from 'utils/utils';

import CusSpin from '_cus_components/CusSpin';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import './index.less';

@connect(({ resaleRfq, loading }) => ({
  resaleRfq,
  loading: loading.effects['resaleRfq/querySoRequirySummary'],
}))
export default class CustomerQuery extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeKey: ['form', 'table'],
      dataSource: [],
      pagination: {},
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch(page) {
    const { dispatch } = this.props;
    const fieldsValue = this.form?.current?.getFieldsValue();
    const { createDateFrom, createDateTo } = fieldsValue;
    const params = {
      ...fieldsValue,
      createDateFrom: dayjs.isDayjs(createDateFrom)
        ? createDateFrom.format('YYYY-MM-DD')
        : undefined,
      createDateTo: dayjs.isDayjs(createDateTo) ? createDateTo.format('YYYY-MM-DD') : undefined,
    };
    dispatch({
      type: 'resaleRfq/querySoRequirySummary',
      payload: {
        page,
        ...params,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.content.map((item) => ({ ...item, rowKey: uuidv4() })),
          pagination: createPagination(res),
        });
      }
    });
  }

  render() {
    const {
      form,
      loading,
      onSave = (e) => e,
      onCancel = (e) => e,
      customerSynchronizeLoading,
    } = this.props;
    const { dataSource, pagination, activeKey } = this.state;
    const formProps = {
      form,
      customerSynchronizeLoading,
      onSearch: this.handleSearch,
      onRef: (ref) => {
        this.form = ref.form;
      }
    };
    const tableProps = {
      dataSource,
      pagination,
      onSave,
      onCancel,
      onSearch: this.handleSearch,
    };

    return (
      <CusSpin spinning={loading}>
        <FilterForm { ...formProps } />
        <div style={{ marginTop: '24px' }} />
        <ListTable { ...tableProps } />
      </CusSpin>
    );
  }
}
