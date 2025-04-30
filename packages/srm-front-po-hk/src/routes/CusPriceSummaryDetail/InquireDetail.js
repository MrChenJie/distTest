import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SRM_SSRC } from '_utils/config';
import { tableScrollWidth, getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';
import { pullAllBy } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import EditTable from '_cus_components/EditTable';
import CusModal from '_cus_components/CusModal';
import CusButton from '_cus_components/CusButton';
import CusNotification from '_cus_components/CusNotification';
import { Form } from 'hzero-ui';
import CusInput from '_cus_components/CusInput';
import CusLov from '_cus_components/CusLov';
import CusSelect from '_cus_components/CusSelect';
import CusUpload from '_cus_components/CusUpload';
import CusDatePicker from '_cus_components/CusDatePicker';
import { numberRender, dateRender } from 'utils/renderer';
// import RfqResponse from './components/RfqResponse';
// import QuotationDocumentSubmitEditModal from './QuotationDocumentSubmitEditModal'
// import QuotationDocumentSubmitNextModal from './QuotationDocumentSubmitNextModal'
// import ExportHistoryData from './components/ExportHistoryData';

/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'inquiryResultsId';
@formatterCollections({
  code: [promptCode],
})
export default class InquireDetail extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
    this.state = {};
  }

  render() {
    const { purchaseApplicationCusModel } = this.props;
    const { inquireDetailList, inquireDetailPagination } = purchaseApplicationCusModel;
    const columns = [
      {
        dataIndex: 'supplierName',
        key: 'supplierName',
        title: intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称'),
        width: 225,
        render: tooltipRender,
      },
      {
        dataIndex: 'materialName',
        key: 'materialName',
        title: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
        width: 120,
        render: tooltipRender,
      },
      {
        dataIndex: 'specification',
        key: 'specification',
        title: intl.get(`${promptCode}.view.title.specification`).d('规格型号'),
        width: 120,
        render: tooltipRender,
      },
      {
        dataIndex: 'currency',
        key: 'currency',
        title: intl.get(`${promptCode}.view.title.quotationCurrency`).d('报价货币'),
        width: 120,
        render: tooltipRender,
      },
      {
        dataIndex: 'supplierOC',
        key: 'supplierOC',
        title: intl.get(`${promptCode}.view.title.SuppliersquotationO`).d('供应商报价（原币）'),
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
        title: intl.get(`${promptCode}.view.title.SuppliersquotationH`).d('供应商报价（HKD）'),
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
        title: intl.get(`${promptCode}.view.title.quantity`).d('数量'),
        width: 225,
        render: tooltipRender,
      },
      {
        dataIndex: 'unit',
        key: 'unit',
        title: intl.get(`${promptCode}.view.title.unit`).d('单位'),
        width: 225,
        render: tooltipRender,
      },
      {
        dataIndex: 'unitPrice',
        key: 'unitPrice',
        title: intl.get(`${promptCode}.view.title.UnitPrice`).d('单价'),
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
      //   title: intl.get(`${promptCode}.view.title.otherfeename`).d('其他费用名称'),
      //   width: 225,
      //   render: tooltipRender,
      // },
      // {
      //   dataIndex: 'otherExpensePrice',
      //   key: 'otherExpensePrice',
      //   title: intl.get(`${promptCode}.view.title.otherfeeamount`).d('其他费用金额'),
      //   width: 225,
      //   render: (record) => {
      //     return <div style={{ textAlign: 'right' }}>{tooltipRender(numberRender(record, 2))}</div>;
      //   },
      // },
      {
        title: intl.get(`${promptCode}.view.title.SuppliersFile`).d('供应商附件'),
        width: 225,
        render: (_, record) => {
          return (
            <CusUpload
              filePreview
              bucketName="bidding"
              attachmentUUID={record.attachmentUuid}
              isEncrypt
              viewOnly
            />
          );
        },
      },
      {
        dataIndex: 'warrantyPeriod',
        key: 'warrantyPeriod',
        title: intl.get(`${promptCode}.view.title.WarrantyPeriod`).d('质保期'),
        width: 225,
        render: tooltipRender,
      },
      {
        dataIndex: 'remark',
        key: 'remark',
        title: intl.get(`${promptCode}.view.title.Remark`).d('备注'),
        width: 225,
        render: tooltipRender,
      },
      {
        dataIndex: 'quotationTime',
        key: 'quotationTime',
        title: intl.get(`${promptCode}.view.title.QuotationTime`).d('报价时间'),
        width: 225,
        render: tooltipRender,
      },
      {
        dataIndex: 'quotationRate',
        key: 'quotationRate',
        title: intl.get(`${promptCode}.view.title.QuotationRate`).d('报价汇率'),
        width: 225,
        render: tooltipRender,
      },
    ];
    return (
      <React.Fragment>
        <EditTable
          rowKey="rowId"
          dataSource={inquireDetailList}
          pagination={inquireDetailPagination}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </React.Fragment>
    );
  }
}
