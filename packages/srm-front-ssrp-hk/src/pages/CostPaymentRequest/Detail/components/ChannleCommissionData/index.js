/**渠道商酬金数据查询页面
 * @date: 2022/11/21 17:09:38
 * @author: Xinyi <xinyi.he02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import request from 'utils/request';
import moment from 'moment';
import { LocaleProvider } from 'hzero-ui';
import zhCN from 'hzero-ui/lib/locale-provider/zh_CN';

import {
  createPagination,
  getCurrentLanguage,
  parseParameters,
  getCurrentOrganizationId,
  getResponse,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { fastCodeLoader } from '@/utils/decorators';
import { SRM_SPUC } from '_utils/config';
import { DATETIME_MIN } from 'utils/constants';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['spfm.channelCommissionInquiry'] })
@fastCodeLoader(['SPUC.CHANNEL_SETTLE_TYPE', 'SPUC.COMMISSION_DATA_SYNC_INIT'])
export default class ChannelCommissionInquiry extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: [],
      pagination: [],
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch(page = {}) {
    this.setState({
      queryLoading: true,
    });
    request(`${SRM_SPUC}/v1/${organizationId}/commission-data/list`, {
      method: 'GET',
      query: parseParameters({
        page,
        ...this.getQueryParams(),
      }),
    })
      .then((res) => {
        if (getResponse(res)) {
          this.setState({
            dataSource: res.content,
            pagination: createPagination(res),
          });
        }
      })
      .finally(() => {
        this.setState({
          queryLoading: false,
        });
      });
  }

  @Bind
  getQueryParams() {
    const fieldsValue = this.form.getFieldsValue();
    const {
      serviceStartDateFrom,
      serviceStartDateTo,
      serviceEndDateFrom,
      serviceEndDateTo,
    } = fieldsValue;
    return {
      ...fieldsValue,
      serviceStartDateFrom: moment.isMoment(serviceStartDateFrom)
        ? serviceStartDateFrom.format(DATETIME_MIN)
        : undefined,
      serviceStartDateTo: moment.isMoment(serviceStartDateTo)
        ? serviceStartDateTo.format('YYYY-MM-DD 23:59:59')
        : undefined,
      serviceEndDateFrom: moment.isMoment(serviceEndDateFrom)
        ? serviceEndDateFrom.format(DATETIME_MIN)
        : undefined,
      serviceEndDateTo: moment.isMoment(serviceEndDateTo)
        ? serviceEndDateTo.format('YYYY-MM-DD 23:59:59')
        : undefined,
    };
  }

  render() {
    const {
      queryLoading = false,
      idpValueMap = {},
      dispatch,
      headerDataSet,
      onCancel = (e) => e,
      onOk = (e) => e,
    } = this.props;
    const { dataSource, pagination } = this.state;
    const formProps = {
      idpValueMap,
      headerDataSet,
      onSearch: this.handleSearch,
      onRef: (ref) => {
        this.form = ref.props.form;
      },
    };
    const tableProps = {
      dispatch,
      idpValueMap,
      dataSource,
      pagination,
      loading: queryLoading,
      onRef: (ref) => {
        this.list = ref;
      },
      onChange: this.handleSearch,
      getQueryParams: this.getQueryParams,
      onCancel,
      onOk,
    };

    return (
      <React.Fragment>
        <LocaleProvider locale={getCurrentLanguage() === 'en_US' ? undefined : zhCN}>
          <React.Fragment>
            <FilterForm {...formProps} />
            <ListTable {...tableProps} />
          </React.Fragment>
        </LocaleProvider>
      </React.Fragment>
    );
  }
}
