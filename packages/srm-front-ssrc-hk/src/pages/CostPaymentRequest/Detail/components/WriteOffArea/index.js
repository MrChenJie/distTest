import React from 'react';
import { Bind } from 'lodash-decorators';
import request from 'utils/request';
import { SRM_SPUC } from '_utils/config';
import {
  getCurrentOrganizationId,
  getResponse,
  createPagination,
  parseParameters,
  addItemsToPagination,
  delItemsToPagination,
} from 'utils/utils';
import notification from 'utils/notification';

import DataTable from './DataTable';
import Search from './Search';

const organizationId = getCurrentOrganizationId();
const ROW_KEY = 'writeOffId';

export default class WriteOffArea extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: [],
      pagenation: [],
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch(page = {}) {
    const { writeOffData } = this.props;
    const { costRequestId, costInvoiceId } = writeOffData;
    request(`${SRM_SPUC}/v1/${organizationId}/prepayment-write-offs/queryWriteOff`, {
      method: 'GET',
      query: parseParameters({
        costRequestId,
        costInvoiceId,
        page,
        ...this.getFormValue(),
      })
    }).then(res => {
      if (getResponse(res)) {
        this.setState({
          dataSource: res.content.map(item => ({ ...item, _status: 'update' })),
          pagination: createPagination(res),
        });
      }
    })
  }

  @Bind()
  getFormValue() {
    const { form } = this.search.props;
    return form.getFieldsValue();
  }

  @Bind()
  handleAddLines(data = []) {
    const { dataSource = [], pagination = {} } = this.state;
    const newPagination = addItemsToPagination(data.length, dataSource.length, pagination);
    this.setState({
      dataSource: [...data, ...dataSource],
      pagination: newPagination,
    });
  }

  @Bind()
  handleDeleteLines(keys = []) {
    const { dataSource = [], pagination = {} } = this.state;
    const deleteData = dataSource.filter(
      (item) => keys.includes(item[ROW_KEY]) && item._status !== 'create'
    );
    if (deleteData.length > 0) {
      request(`${SRM_SPUC}/v1/${organizationId}/prepayment-write-offs/deleteList`, {
        method: 'POST',
        body: deleteData,
      }).then(res => {
        if (getResponse(res)) {
          notification.success();
          this.handleSearch();
        }
      });
    } else {
      const newDataSource = dataSource.filter((item) => !keys.includes(item[ROW_KEY]));
      const delItemsLength = dataSource.length - newDataSource.length;
      const newPagination = delItemsToPagination(delItemsLength, dataSource.length, pagination);
      this.setState({
        dataSource: newDataSource,
        pagination: newPagination,
      });
    }
  }

  render() {
    const {
      writeOffData,
      headerData,
      onCancel = (e) => e,
      onOk = (e) => e,
      defaultFlag,
    } = this.props;
    const { dataSource = [], pagination = [] } = this.state;
    const { prompt } = this.props;
    return (
      <React.Fragment>
        <Search
          prompt={prompt}
          handleSearch={this.handleSearch}
          onRef={(ref) => {
            this.search = ref;
          }}
        />
        <DataTable
          dataSource={dataSource}
          pagination={pagination}
          prompt={prompt}
          writeOffData={writeOffData}
          headerData={headerData}
          onCancel={onCancel}
          onChange={this.handleSearch}
          onAdd={this.handleAddLines}
          onDelete={this.handleDeleteLines}
          onOk={onOk}
          defaultFlag={defaultFlag}
        />
      </React.Fragment>
    )
  }
}