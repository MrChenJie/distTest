/**
 * PeriodAdditionResults - 期间新增结果展示
 * @date: 2023-9-12
 * @author: jinkai.lu
 * @version: 0.0.1
 */
import React, { PureComponent } from 'react';
// import { Bind } from 'lodash-decorators';
// import { Tooltip } from 'antd';
import { Form } from 'hzero-ui';
import { tableScrollWidth } from 'utils/utils';
// import { pullAllBy } from 'lodash';
// import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
// import querystring from 'querystring';
// import { numberRender, dateRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import CusTable from '_cus_components/CusTable';
import { tooltipRender, labelTip } from '_cus_utils/render';

const promptCode = 'HKPC.commom';
@formatterCollections({
  code: [promptCode],
})

@Form.create()
export default class PeriodAdditionResults2 extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  render() {
    const {
      quotationTermsList,
      quotationTermsPagination,
      form,
    } = this.props
    const columns = [
      {
        dataIndex: 'supplierName',
        key: 'supplierName',
        title: tooltipRender(
          intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称')
        ),
        width: 225,
        render: tooltipRender,
      },
      {
        dataIndex: 'deliveryTerms',
        key: 'deliveryTerms',
        title: tooltipRender(
          intl.get(`${promptCode}.view.title.DeliveryTerms`).d('发货条款')
        ),
        width: 120,
        render: tooltipRender,
      },
      {
        dataIndex: 'paymentTerms',
        key: 'paymentTerms',
        title: tooltipRender(
          intl.get(`${promptCode}.view.title.PaymentTerms`).d('付款条款')
        ),
        width: 120,
        render: tooltipRender,
      },
      {
        dataIndex: 'statusMeaning',
        key: 'statusMeaning',
        title: tooltipRender(
          intl.get(`${promptCode}.view.title.Paymentmethod`).d('付款方式')
        ),
        width: 120,
        render: tooltipRender,
      },
      {
        dataIndex: 'paymentArrangement',
        key: 'paymentArrangement',
        title: tooltipRender(
          intl.get(`${promptCode}.view.title.PaymentArrangement`).d('付款安排')
        ),
        width: 225,
        render: tooltipRender,
      },
      {
        dataIndex: 'quotationNumber',
        key: 'quotationNumber',
        title: tooltipRender(
          intl.get(`${promptCode}.view.title.Quotationnumber`).d('报价单编号')
        ),
        width: 120,
        render: tooltipRender,
      },
      {
        dataIndex: 'warrantyPeriod',
        key: 'warrantyPeriod',
        title: tooltipRender(
          intl.get(`${promptCode}.view.title.WarrantyPeriod`).d('质保期')
        ),
        width: 225,
        render: tooltipRender,
      },


    ]
    const tableProps = {
      dataSource: quotationTermsList,
      columns,
      pagination: quotationTermsPagination,
      rowKey: 'quotationTermsId',
      scroll: { x: tableScrollWidth(columns) }, // y: 480
    };
    return <CusTable {...tableProps} />;
  }
}