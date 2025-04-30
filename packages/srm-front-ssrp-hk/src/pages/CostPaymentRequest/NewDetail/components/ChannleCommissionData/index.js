import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import cusRequest from '_cus_utils/request';
import intl from 'utils/intl';
import { Form } from 'hzero-ui';
import {
  createPagination,
  parseParameters,
  getCurrentOrganizationId,
  getResponse,
} from 'utils/utils';
import { fastCodeLoader } from '@/utils/decorators';
import { SRM_SPUC } from '_utils/config';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import CusButton from '_cus_components/CusButton';
import CusModal from '_cus_components/CusModal';
import { cusDateFormat } from '_cus_utils/utils';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

const organizationId = getCurrentOrganizationId();

@fastCodeLoader(['SPUC.CHANNEL_SETTLE_TYPE', 'SPUC.COMMISSION_DATA_SYNC_INIT'])
@Form.create({ fieldNameProp: null })
export default class ChannelCommissionInquiry extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataSource: [],
      pagination: [],
      queryLoading: false,
    };
  }

  @Bind()
  handleSearch(page = {}) {
    this.setState({
      queryLoading: true,
    });
    cusRequest(`${SRM_SPUC}/v1/${organizationId}/commission-data/list`, {
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
    const { form } = this.props;
    const fieldsValue = form.getFieldsValue();
    const {
      serviceStartDateFrom,
      serviceStartDateTo,
      serviceEndDateFrom,
      serviceEndDateTo,
    } = fieldsValue;
    return {
      ...fieldsValue,
      serviceStartDateFrom: cusDateFormat(serviceStartDateFrom, DATETIME_MIN),
      serviceStartDateTo: cusDateFormat(serviceStartDateTo, DATETIME_MAX),
      serviceEndDateFrom: cusDateFormat(serviceEndDateFrom, DATETIME_MIN),
      serviceEndDateTo: cusDateFormat(serviceEndDateTo, DATETIME_MAX),
    };
  }

  @Bind
  selectChannelCommission() {
    const { onSelectChannelCommission } = this.props;
    onSelectChannelCommission(() => {
      this.setState(
        {
          visible: true,
        },
        () => {
          this.handleSearch();
        }
      );
    });
  }

  render() {
    const {
      form,
      queryLoading = false,
      idpValueMap = {},
      defaultParams = {},
      onChannleCommissionOk = (e) => e,
    } = this.props;
    const { dataSource, pagination, visible } = this.state;
    const formProps = {
      form,
      idpValueMap,
      defaultParams,
      onSearch: this.handleSearch,
    };
    const tableProps = {
      dataSource,
      pagination,
      loading: queryLoading,
      onChange: this.handleSearch,
      onCancel: () => {
        this.setState({
          visible: false,
        });
      },
      onOk: onChannleCommissionOk,
    };

    return (
      <React.Fragment>
        <CusButton mini onClick={() => this.selectChannelCommission()}>
          {intl.get(`spcm.costPayment.view.button.selectChannelCommission`).d('渠道商酬金选择')}
        </CusButton>
        {/* 渠道商酬金选择Modal */}
        {visible && (
          <CusModal
            title={intl
              .get('spcm.costPayment.view.title.channelCommissionSelect')
              .d('渠道商酬金选择')}
            visible={visible}
            onCancel={() => {
              this.setState({
                visible: false,
              });
            }}
            footer={null}
            width={1000}
            destroyOnClose
            marginBottom={40}
          >
            <FilterForm {...formProps} />
            <div style={{ marginTop: '24px' }} />
            <ListTable {...tableProps} />
          </CusModal>
        )}
      </React.Fragment>
    );
  }
}
