import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth, getCurrentLanguage } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { pullAllBy } from 'lodash';

import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import { Form } from 'hzero-ui';
import CusInput from '_cus_components/CusInput';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusDatePicker from '_cus_components/CusDatePicker';
import RfqResponse from './components/RfqResponse';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'enquiryPriceId';
export default class ClauseDataTable extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    };
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      rfqResponseVisible: false,
      exportModalVisible: false,
      nowRecord: {},
    };
  }

  @Bind()
  clearState() {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    });
  }

  render() {
    const {
      onChange = (e) => e,
      getQueryParams = (e) => (e),
      purchaseResultModel,
    } = this.props;
    const {
      selectedRows,
      selectedRowKeys,
      rfqResponseVisible,
      nowRecord,
      exportModalVisible = false,
    } = this.state;
    const {
      fourthClauseList = [],
    } = purchaseResultModel;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.DeliveryTerms`).d('发货条款'),
        dataIndex: 'deliveryTerms',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.PaymentTerms`).d('付款条款'),
        dataIndex: 'paymentTerms',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.Paymentmethod`).d('付款方式'),
        dataIndex: 'paymentMethod',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.PaymentArrangement`).d('付款安排'),
        dataIndex: 'paymentArrangement',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.Quotationnumber`).d('报价单编号'),
        dataIndex: 'quotationNumber',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.WarrantyPeriod`).d('质保期'),
        dataIndex: 'warrantyPeriod',
        width: 120,
        render: tooltipRender,
      },
    ];

    return (
      <React.Fragment>
        <CusTable
          rowKey={ROW_KEY}
          dataSource={fourthClauseList || []}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={false}
          onChange={onChange}
        />
      </React.Fragment>
    );
  }
}
