import React from 'react';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { HZERO_FILE } from 'utils/config';
import { tableScrollWidth, getCurrentLanguage, getAccessToken } from 'utils/utils';
import { dateRender } from 'utils/renderer';
import { pullAllBy } from 'lodash';
import { tooltipRender } from '_cus_utils/render';
import CusTable from '_cus_components/CusTable';
import CusModal from '_cus_components/CusModal';
import Attachment from './Attachment/index'
import { numberRender } from 'utils/renderer';
/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';
const ROW_KEY = 'enquiryPriceId';
export default class PriceSheetDataTable extends React.Component {
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
      nowRecord: {},
      attachVisible: false,
      cmhkPrFourthFiles: []
    };
  }

  @Bind()
  clearState() {
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    });
  }

  @Bind
  openAttachModal(record){
    this.setState({
      attachVisible: true,
      cmhkPrFourthFiles: record,
    })
  }

  render() {
    const {
      onChange = (e) => e,
      purchaseResultModel,
    } = this.props;
    const {
      selectedRows,
      selectedRowKeys,
      attachVisible,
      cmhkPrFourthFiles
    } = this.state;
    const {
      fourthQuoteList = [],
    } = purchaseResultModel;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.materialname`).d('物料名称'),
        dataIndex: 'materialName',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.specification`).d('规格型号'),
        dataIndex: 'specification',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.quotationCurrency`).d('报价货币'),
        dataIndex: 'currency',
        width: 160,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.SuppliersquotationO`).d('供应商报价(原币)'),
        dataIndex: 'supplierQuoteOriginal',
        width: 220,
        render: (_, record) => {
          return (
            <span style={{ display: 'block', textAlign: 'right' }}>
              {numberRender(record.supplierQuoteOriginal, 2)}
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.SuppliersquotationH`).d('供应商报价(HKD)'),
        dataIndex: 'supplierQuoteHkd',
        width: 220,
        render: (_, record) => {
          return (
            <span style={{ display: 'block', textAlign: 'right' }}>
              {numberRender(record.supplierQuoteHkd, 2)}
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.quantity`).d('数量'),
        dataIndex: 'quantity',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.unit`).d('单位'),
        dataIndex: 'unit',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.UnitPrice`).d('单价'),
        dataIndex: 'unitPrice',
        width: 120,
        render: (_, record) => {
          return (
            <span style={{ display: 'block', textAlign: 'right' }}>
              {numberRender(record.unitPrice, 2)}
            </span>
          );
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.QuotationRate`).d('报价汇率'),
        dataIndex: 'quoteRate',
        width: 120,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.SuppliersFile`).d('供应商附件'),
        dataIndex: 'supplierFile',
        width: 160,
        render: (_, record) => {
          return (
           <a onClick={()=>this.openAttachModal(record.cmhkPrFourthFiles)}>
             {intl.get(`${promptCode}.view.title.viewattachments`).d('查看附件')}
           </a>
          );
        },
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
          dataSource={fourthQuoteList || []}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          pagination={false}
          onChange={onChange}
        />
        <CusModal
            title={intl.get(`${promptCode}.view.title.viewattachments`).d('查看附件')}
            visible={attachVisible}
            onCancel={() => {
              this.setState({
                attachVisible: false,
              })
            }}
            onOk={() => {
              this.setState({
                attachVisible: false,
              })
            }}
        >
          <Attachment cmhkPrFourthFiles={cmhkPrFourthFiles}/>
        </CusModal>
      </React.Fragment>
    );
  }
}
