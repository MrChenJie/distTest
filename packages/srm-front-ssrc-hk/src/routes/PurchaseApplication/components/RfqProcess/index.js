import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { createPagination } from 'utils/utils';
import { Form } from 'hzero-ui';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

@Form.create({})
@connect(({ resaleRfq, loading }) => ({
  resaleRfq,
  loading: loading.effects['resaleRfq/queryRfqProgress'],
}))
export default class RfqProgress extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      pagination: [],
    }
  }

  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, form } = this.props;
    const filterData = form.getFieldsValue();
    dispatch({
      type: 'resaleRfq/queryRfqProgress',
      payload: {
        page,
        ...filterData,
      },
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.content,
          pagination: createPagination(res),
        });
      };
    });
  }

  render() {
    const { dataSource, pagination } =this.state;
    const { form, loading } = this.props;
    const filterFormProps = {
      form,
      onSearch: this.handleSearch,
    }

    const listTableProps = {
      dataSource,
      pagination,
      loading,
      onChange: this.handleSearch,
    }

    return (
      <React.Fragment>
        <FilterForm { ...filterFormProps } />
        <ListTable { ...listTableProps } />
      </React.Fragment>
    )
  }
}
