/** -- 报单价模式
 * @date: 2022/04/24 11:50:55
 * @author: cj <jie.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

 import React, { Component } from 'react';
 import { Form } from 'hzero-ui';
 import CusButton from '_cus_components/CusButton';
 import CusModal from '_cus_components/CusModal';
 import { Bind } from 'lodash-decorators';
 import moment from 'moment';
 
 import intl from 'utils/intl';
 import { getCurrentOrganizationId, getAccessToken, tableScrollWidth, getCurrentLanguage } from 'utils/utils';
 import { connect } from 'dva';
 import EditTable from '_cus_components/EditTable';
 import UploadFile from '@/routes/PricingNew/UploadFile';
 import { numberRender } from 'utils/renderer';
 import { tooltipRender } from '_cus_utils/render';
 import './index.less';
 import CusInputNumber from '_cus_components/CusInputNumber';
 
 const status = ['create', 'update'];
 const tenantId = getCurrentOrganizationId();

 const promptCode = 'HKPC.commom';
 
 @connect(({ materiel }) => ({
   materiel,
 }))
 @Form.create({ fieldNameProp: null })
 export default class PricingSingle extends Component {
   constructor(props) {
     super(props);
     this.state = {
       selectedRowKeys: [],
       fastCodes: {},
       fileList: [],
     };
   }
 
   componentDidMount() {
     this.props.onRef && this.props.onRef(this);
   }
 
   render() {
     const {
       saveLoading = false,
       fetchLoading = false,
       deleteLoading = false,
       contractBidWinningResult,
     } = this.props;
     const { pricingSingleDataSource = [], pricingSinglePagination = {}} = contractBidWinningResult;
    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称'),
        dataIndex: 'supplierName',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`${promptCode}.view.title.Attachment`).d('附件'),
        dataIndex: 'fileDTOList',
        width: 180,
        render: (value, record, index) => {
          return (
            <UploadFile
              onUploadSuccess={(item) => onUploadSuccess(item, record)}
              onDeleteSuccess={() => onDeleteSuccess(record)}
              tableName="SPUC_PO_CON_ATTACH"
              parentId={record.qaId}
              value={value}
              disabled
            />
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
              href={`/pub/sspo/pricing/query/${record?.proId}/${record?.milestoneId}`}
              target="_blank"
            >
              {intl.get(`${promptCode}.view.title.quotationdetail`).d('报价详情')}
            </a>
          )
        },
      },
    ].filter(Boolean);
 
     return (
       <>
         <EditTable
           rowKey="singleQaId"
           dataSource={pricingSingleDataSource}
           pagination={pricingSinglePagination}
           columns={columns}
           scroll={{x: tableScrollWidth(columns) }}
         />
       </>
     );
   }
 }
 