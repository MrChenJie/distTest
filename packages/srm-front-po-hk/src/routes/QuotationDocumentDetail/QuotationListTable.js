/**
 * PeriodAdditionResults - 期间新增结果展示
 * @date: 2023-9-12
 * @author: jinkai.lu
 * @version: 0.0.1
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
// import { Tooltip } from 'antd';
import { tableScrollWidth } from 'utils/utils';
// import { pullAllBy } from 'lodash';
// import { routerRedux } from 'dva/router';
import intl from 'utils/intl';
import EditTable from '_cus_components/EditTable';
import CusModal from '_cus_components/CusModal';
// import querystring from 'querystring';
import { numberRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import CusUpload from '_cus_components/CusUpload';
import ComparePriceModal from './ComparePriceModal';
import CusTable from '_cus_components/CusTable';
import { tooltipRender, labelTip } from '_cus_utils/render';

const promptCode = 'HKPC.commom';
@formatterCollections({
  code: [promptCode],
})
export default class PeriodAdditionResults extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  render() {
    const { form, quotationList, quotationPagination, onChange = (e) => e } = this.props;
    const columns = [
      {
        dataIndex: 'supplierName',
        key: 'supplierName',
        ellipsis: true,
        title: tooltipRender(intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称')),
        width: 225,
        render: tooltipRender,
      },
      {
        dataIndex: 'materialName',
        key: 'materialName',
        ellipsis: true,
        title: tooltipRender(intl.get(`${promptCode}.view.title.materialname`).d('物料名称')),
        width: 120,
        render: tooltipRender,
      },
      {
        dataIndex: 'specification',
        key: 'specification',
        ellipsis: true,
        title: tooltipRender(intl.get(`${promptCode}.view.title.specification`).d('规格型号')),
        width: 120,
        render: tooltipRender,
      },
      {
        dataIndex: 'currency',
        key: 'currency',
        ellipsis: true,
        title: tooltipRender(intl.get(`${promptCode}.view.title.quotationCurrency`).d('报价货币')),
        width: 120,
        render: tooltipRender,
      },
      {
        dataIndex: 'supplierOC',
        key: 'supplierOC',
        ellipsis: true,
        title: tooltipRender(
          intl.get(`${promptCode}.view.title.SuppliersquotationO`).d('供应商报价（原币）')
        ),
        width: 225,
        render: (_, record) => {
          return record.isQuote === 'Y' ? (
            <div style={{ textAlign: 'right' }}>
              {tooltipRender(numberRender(record.supplierOC, 2))}
            </div>
          ) : (
            <div>{intl.get(`HKPC.commom.view.title.notsubmitquotation`).d('未报价')}</div>
          );
        },
      },
      {
        dataIndex: 'supplierHKD',
        key: 'supplierHKD',
        ellipsis: true,
        title: tooltipRender(
          intl.get(`${promptCode}.view.title.SuppliersquotationH`).d('供应商报价（HKD）')
        ),
        width: 225,
        render: (_, record) => {
          return record.isQuote === 'Y' ? (
            <div style={{ textAlign: 'right' }}>
              {tooltipRender(numberRender(record.supplierHKD, 2))}
            </div>
          ) : (
            <div>{intl.get(`HKPC.commom.view.title.notsubmitquotation`).d('未报价')}</div>
          );
        },
      },
      {
        dataIndex: 'quantity',
        key: 'quantity',
        ellipsis: true,
        title: tooltipRender(intl.get(`${promptCode}.view.title.quantity`).d('数量')),
        width: 225,
        render: tooltipRender,
      },
      {
        dataIndex: 'unit',
        key: 'unit',
        ellipsis: true,
        title: tooltipRender(intl.get(`${promptCode}.view.title.unit`).d('单位')),
        width: 225,
        render: tooltipRender,
      },
      {
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        ellipsis: true,
        title: tooltipRender(intl.get(`${promptCode}.view.title.UnitPrice`).d('单价')),
        width: 225,
        render: (_, record) => {
          return record.isQuote === 'Y' ? (
            <div style={{ textAlign: 'right' }}>
              {tooltipRender(numberRender(record.unitPrice, 2))}
            </div>
          ) : (
            <div>{intl.get(`HKPC.commom.view.title.notsubmitquotation`).d('未报价')}</div>
          );
        },
      },
      // {
      //   dataIndex: 'otherExpenseName',
      //   key: 'otherExpenseName',
      //   ellipsis: true,
      //   title: tooltipRender(intl.get(`${promptCode}.view.title.otherfeename`).d('其他费用名称')),
      //   width: 225,
      //   render: tooltipRender,
      // },
      // {
      //   dataIndex: 'otherExpensePrice',
      //   key: 'otherExpensePrice',
      //   ellipsis: true,
      //   title: tooltipRender(intl.get(`${promptCode}.view.title.otherfeeamount`).d('其他费用金额')),
      //   width: 225,
      //   render: (record) => {
      //     return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
      //   },
      // },
      // {
      //   title: tooltipRender(intl.get(`${promptCode}.view.title.SuppliersFile`).d('供应商附件')),
      //   width: 225,
      //   render: (_, record) => {
      //     return (
      //       <CusUpload
      //         filePreview
      //         bucketName="bidding"
      //         attachmentUUID={record.uuid}
      //         isEncrypt
      //         viewOnly
      //       />
      //     );
      //   },
      // },
      {
        dataIndex: 'warrantyPeriod',
        key: 'warrantyPeriod',
        ellipsis: true,
        title: tooltipRender(intl.get(`${promptCode}.view.title.WarrantyPeriod`).d('质保期')),
        width: 225,
        render: tooltipRender,
      },
      {
        dataIndex: 'remark',
        key: 'remark',
        ellipsis: true,
        title: tooltipRender(intl.get(`${promptCode}.view.title.Remark`).d('备注')),
        width: 225,
        render: tooltipRender,
      },
      {
        dataIndex: 'quotationTime',
        key: 'quotationTime',
        ellipsis: true,
        title: tooltipRender(intl.get(`${promptCode}.view.title.QuotationTime`).d('报价时间')),
        width: 225,
        render: tooltipRender,
      },
      {
        dataIndex: 'quotationRate',
        key: 'quotationRate',
        ellipsis: true,
        title: tooltipRender(intl.get(`${promptCode}.view.title.QuotationRate`).d('报价汇率')),
        width: 225,
        render: tooltipRender,
      },
    ];

    const tableProps = {
      dataSource: quotationList,
      columns,
      pagination: quotationPagination,
      rowKey: 'quotationId',
      scroll: { x: tableScrollWidth(columns) }, // y: 480
      onChange: onChange
    };
    return (
      <>
        <CusTable {...tableProps} />
      </>
    );
  }
}
