import React from 'react';
import { Bind } from 'lodash-decorators';
import request from 'utils/request';
import { SRM_SPUC } from '_utils/config';
import {
  getCurrentOrganizationId,
  getResponse,
  createPagination,
  parseParameters,
} from 'utils/utils';

import List from './List';
import Search from './Search';

const organizationId = getCurrentOrganizationId();

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
    const { writeOffData, headerData } = this.props;
    const { costRequestId, costInvoiceId } = writeOffData;
    const { companyOrgCode, vendorCompanyNum, currencyCode } = headerData;
    console.log(writeOffData);
    request(`${SRM_SPUC}/v1/${organizationId}/prepayment-write-offs/insertQuery`, {
      method: 'GET',
      query: parseParameters({
        costRequestId,
        costInvoiceId,
        vendorCompanyNum,
        companyOrgCode,
        currencyCode,
        page,
        ...this.getFormValue(),
      })
    }).then(res => {
      if (getResponse(res)) {
        this.setState({
          dataSource: res.content,
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

  render() {
    const { dataSource = [], pagination = [] } = this.state;
    const {
      prompt,
      onCancel = (e) => e,
      onOk = (e) => e,
    } = this.props;
    return (
      <React.Fragment>
        <Search
          prompt={prompt}
          handleSearch={this.handleSearch}
          onRef={(ref) => {
            this.search = ref;
          }}
        />
        <List
          dataSource={dataSource}
          pagination={pagination}
          prompt={prompt}
          onCancel={onCancel}
          onOk={onOk}
          onChange={this.handleSearch}
        />
      </React.Fragment>
    )
  }
}