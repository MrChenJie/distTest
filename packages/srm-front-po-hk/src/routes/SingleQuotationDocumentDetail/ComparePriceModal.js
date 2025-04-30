/*
 * @Author: 陈杰 jie.chen06@hand-china.com
 * @Date: 2024-01-26 10:46:15
 * Copyright (c) 2024, All Rights Reserved. 
 */
import React from 'react';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';
import { tooltipRender } from '_cus_utils/render';
import formatterCollections from 'utils/intl/formatterCollections';
import EditTable from '_cus_components/EditTable';
import { numberRender } from 'utils/renderer';
import CusUpload from '_cus_components/CusUpload';
/**
 * 多语言前缀
 */
const promptCode = 'HKPC.commom';

@formatterCollections({
  code: [promptCode],
})
export default class comparePriceModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    const {
      singlePurchaseApplicationModel,
      onChange = (e) => e,
    } = this.props;

    const {
      priceList = [],
      priceListPagination = {}
    } = singlePurchaseApplicationModel;

    const columns = [
      {
        title: intl.get(`${promptCode}.view.title.SN`).d('序号'),
        width: 80,
        render: (val, record, index) => {
          return index + 1;
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.SupplierName`).d('供应商名称'),
        dataIndex: 'supName',
        width: 180,
        render: tooltipRender,
      },
      {
        title: intl.get(`HKPC.commom.view.title.ictammounthkd`).d('总金额（HKD）'),
        dataIndex: 'totalAmount',
        width: 120,
        render: (_, record) => {
          return (
            <div style={{textAlign: 'right'}}>
              {numberRender(record.totalAmount, 2)}
            </div>
          )
        },
      },
      {
        title: intl.get(`${promptCode}.view.title.SuppliersFile`).d('供应商附件'),
        dataIndex: 'attachmentUuid',
        width: 160,
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
    ];

    return (
      <>
        <EditTable
          rowKey="rowKey"
          columns={columns}
          pagination={priceListPagination}
          dataSource={priceList}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={onChange}
        />
      </>
    )
  }
}
