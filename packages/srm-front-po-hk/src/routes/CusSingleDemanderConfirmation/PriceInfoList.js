 import React, { PureComponent } from 'react';
 import { tableScrollWidth } from 'utils/utils';
 import intl from 'utils/intl';
 import { numberRender } from 'utils/renderer';
 import formatterCollections from 'utils/intl/formatterCollections';
 import CusTable from '_cus_components/CusTable';
 import { tooltipRender } from '_cus_utils/render';
 import CusUpload from '_cus_components/CusUpload';
 import UploadFile from '../../../../srm-front-ssrc-hk/src/routes/PurchaseResultNormal/Edit/UploadFile/UploadFile';
 
 const promptCode = 'HKPC.commom';
 @formatterCollections({
   code: [promptCode],
 })
 export default class PriceInfoList extends PureComponent {
   constructor(props) {
     super(props);
     this.state = {};
   }
 
   render() {
     const {
      singlePurchaseApplicationCusModel,
       onChange = (e) => e,
       isBidding,
     } = this.props;
 
     const {
       quotationList = [],
       quotationPagination = {},
     } = singlePurchaseApplicationCusModel;
 
     const columns = [
      {
        dataIndex: 'supplierName',
        key: 'supplierName',
        title: intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称'),
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.Attachment`).d('附件'),
        width: 130,
        render: (_, record) => {
          return (
            isBidding ? (
              <UploadFile
                 tableName="SPUC_PO_CON_ATTACH"
                 parentId={record.qaId}
                 value={record?.fileDTOList}
                 disabled
               />
            ) : (
              <CusUpload
                filePreview
                bucketName="bidding"
                attachmentUUID={record.uuid}
                isEncrypt
                viewOnly
              />
            )
          );
        },
      },
      {
        dataIndex: 'isWin',
        key: 'isWin',
        title: intl.get(`${promptCode}.view.title.winornot`).d('是否中选'),
        width: 180,
        render: (_, record) => {
          return record.isWin === 'Y'? (
            <div>{intl.get(`${promptCode}.view.title.yes`).d('是')}</div>
          ) : ( <div>{intl.get(`${promptCode}.view.title.no`).d('否')}</div>
          );
        },
      },
      {
        dataIndex: 'supplierOC',
        key: 'supplierOC',
        title: intl.get(`${promptCode}.view.title.totalquoteori`).d('报价总金额(原币)'),
        width: 160,
        render: (_, record) => {
          return record.supplierOC ? (
            <div style={{ textAlign: 'right' }}>
              {tooltipRender(numberRender(record.supplierOC, 2))}
            </div>
          ) : (
            <div>{intl.get(`HKPC.commom.view.title.notsubmitquotation`).d('未报价')}</div>
          );
        },
      },
      {
        dataIndex: 'currency',
        key: 'currency',
        title: intl.get(`${promptCode}.view.title.prcurrency`).d('币种'),
        width: 120,
        render: tooltipRender,
      },
      {
        dataIndex: 'quotationRate',
        key: 'quotationRate',
        title: intl.get(`${promptCode}.view.title.rate`).d('汇率'),
        width: 100,
        render: tooltipRender,
      },
      {
        dataIndex: 'supplierHKD',
        key: 'supplierHKD',
        title: intl.get(`${promptCode}.view.title.totalquotehkd`).d('报价总金额(HKD)'),
        width: 180,
        render: (_, record) => {
          return record.supplierHKD ? (
            <div style={{ textAlign: 'right' }}>
              {tooltipRender(numberRender(record.supplierHKD, 2))}
            </div>
          ) : (
            <div>{intl.get(`HKPC.commom.view.title.notsubmitquotation`).d('未报价')}</div>
          );
        },
      },
      {
        dataIndex: 'operator',
        key: 'operator',
        title: intl.get(`${promptCode}.view.title.operate`).d('操作'),
        width: 100,
        render: (_, record) => {
          return (
            <a
              href={isBidding ? `/pub/sspo/pricing/query/${record?.proId}/${record?.milestoneId}` : `/pub/ssrc-hk/quotation-document-detail-page?id=${record?.id}&refPrFirstId=${record?.refPrFirstId}&projectNumber=${record?.projectNumber}&currency=${record?.currency}&rounds=${record?.rounds}&prNumber=${record?.prNumber}&prName=${record?.prName}`}
              target="_blank"
            >
              {intl.get(`${promptCode}.view.title.quotationdetail`).d('报价详情')}
            </a>
          )
        },
      },
    ];
 
     const tableProps = {
       dataSource: quotationList,
       pagination: quotationPagination,
       columns,
       rowKey: 'quotationId',
       scroll: { x: tableScrollWidth(columns) }, // y: 480
       onChange: onChange
     };
     return (
      <>
        <CusTable {...tableProps} />
      </>
     )
   }
 }